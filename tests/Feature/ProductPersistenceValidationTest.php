<?php

namespace Tests\Feature;

use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\Menu;
use App\Models\ProductCategory;
use App\Models\TravelProduct;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductPersistenceValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_and_updates_every_normal_product_field_used_by_the_form(): void
    {
        $user = User::factory()->create();
        $this->grantProductPermissions($user, ['create', 'edit']);
        $this->createProductCategory('layanan');

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'products']), [
                'payload' => $this->normalProductPayload(),
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $product = TravelProduct::query()->where('code', 'PRD-VALIDATION')->firstOrFail();

        $this->assertSame('Product Validation', $product->name);
        $this->assertSame('layanan', $product->product_type);
        $this->assertSame(450000, data_get($product->content, 'price'));
        $this->assertSame('SAR', data_get($product->content, 'currency'));
        $this->assertEquals(4250, data_get($product->content, 'currency_rate_snapshot.rate_to_idr'));

        $this->actingAs($user)
            ->patch(route('content.resources.update', ['resource' => 'products', 'id' => $product->id]), [
                'payload' => $this->normalProductPayload([
                    'name' => 'Product Updated',
                    'description' => 'Deskripsi terbaru.',
                    'content' => ['price' => 550000],
                    'is_active' => false,
                ]),
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $product->refresh();

        $this->assertSame('Product Updated', $product->name);
        $this->assertSame('Deskripsi terbaru.', $product->description);
        $this->assertSame(550000, data_get($product->content, 'price'));
        $this->assertFalse($product->is_active);
    }

    public function test_it_returns_useful_validation_errors_and_does_not_persist_an_invalid_normal_product(): void
    {
        $user = User::factory()->create();
        $this->grantProductPermissions($user, ['create']);
        $this->createProductCategory('layanan');

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'products']), [
                'payload' => $this->normalProductPayload([
                    'name' => '',
                    'product_type' => 'hotel',
                    'content' => [
                        'price' => -1,
                        'currency' => 'XXX',
                        'currency_rate_to_idr' => 0,
                    ],
                ]),
            ])
            ->assertSessionHasErrors([
                'payload.name',
                'payload.product_type',
                'payload.content.price',
                'payload.content.currency',
                'payload.content.currency_rate_to_idr',
            ]);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_it_rejects_a_hotel_when_city_and_currency_do_not_match_valid_master_options(): void
    {
        $user = User::factory()->create();
        $this->grantProductPermissions($user, ['create']);
        $this->createProductCategory('hotel');
        $firstCountry = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $secondCountry = HotelCountry::query()->create(['name' => 'Indonesia', 'is_active' => true]);
        $city = HotelCity::query()->create([
            'country_id' => $firstCountry->id,
            'name' => 'Mekkah',
            'is_active' => true,
        ]);
        $roomType = HotelRoomType::query()->create(['name' => 'Double', 'is_active' => true]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels', [
                'country_id' => $secondCountry->id,
                'city_id' => $city->id,
                'name' => 'Hotel Invalid',
                'currency' => 'XXX',
                'is_active' => true,
                'prices' => [[
                    'broker_name' => 'Broker 1',
                    'room_type_id' => $roomType->id,
                    'period_start' => '2026-09-30',
                    'period_end' => '2026-09-01',
                    'price' => 500,
                ]],
            ])
            ->assertSessionHasErrors(['city_id', 'currency', 'prices.0.period_end']);

        $this->assertDatabaseCount('hotels', 0);
        $this->assertDatabaseCount('products', 0);
    }

    public function test_it_returns_json_validation_details_for_an_invalid_hotel_import_reconciliation(): void
    {
        $user = User::factory()->create();
        $this->grantProductPermissions($user, ['create']);

        $this->actingAs($user)
            ->postJson('/admin/product-management/products/hotels/import/reconcile', ['rows' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rows']);
    }

    public function test_bulk_hotel_validation_rejects_mismatched_location_and_duplicate_prices(): void
    {
        $user = User::factory()->create();
        $this->grantProductPermissions($user, ['create']);
        $firstCountry = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $secondCountry = HotelCountry::query()->create(['name' => 'Indonesia', 'is_active' => true]);
        $city = HotelCity::query()->create([
            'country_id' => $firstCountry->id,
            'name' => 'Madinah',
            'is_active' => true,
        ]);
        $roomType = HotelRoomType::query()->create(['name' => 'Double', 'is_active' => true]);
        $price = [
            'broker_name' => 'Broker 1',
            'room_type_id' => $roomType->id,
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'price' => 500,
        ];

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [[
                    'country_id' => $secondCountry->id,
                    'city_id' => $city->id,
                    'name' => 'Hotel Bulk Invalid',
                    'currency' => 'IDR',
                    'is_active' => true,
                    'prices' => [$price, $price],
                ]],
            ])
            ->assertSessionHasErrors([
                'hotels.0.city_id',
                'hotels.0.prices.1.price',
            ]);

        $this->assertDatabaseCount('hotels', 0);
    }

    /** @param array<int, string> $actions */
    private function grantProductPermissions(User $user, array $actions): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'product_management'],
            [
                'name' => 'Product Management',
                'path' => '/dashboard/product-management',
                'icon' => 'Package',
                'children' => [[
                    'name' => 'Product',
                    'menu_key' => 'product',
                    'path' => '/dashboard/product-management/products',
                    'icon' => 'Package',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ]],
                'order' => 1,
                'is_active' => true,
            ],
        );

        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(array_map(
            fn (string $action): string => "menu.product.$action",
            $actions,
        ));
    }

    private function createProductCategory(string $key): ProductCategory
    {
        return ProductCategory::query()->firstOrCreate(
            ['key' => $key],
            [
                'name' => ucfirst($key),
                'sort_order' => 1,
                'is_active' => true,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function normalProductPayload(array $overrides = []): array
    {
        return array_replace_recursive([
            'code' => 'PRD-VALIDATION',
            'slug' => 'product-validation',
            'name' => 'Product Validation',
            'product_type' => 'layanan',
            'description' => 'Product untuk pengujian persistence.',
            'content' => [
                'price' => 450000,
                'currency' => 'SAR',
                'currency_rate_to_idr' => 4250,
            ],
            'is_active' => true,
        ], $overrides);
    }
}
