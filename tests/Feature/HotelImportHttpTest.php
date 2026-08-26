<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\Menu;
use App\Models\User;
use App\Services\HotelImport\PdfTextExtractor;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HotelImportHttpTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function pdf_parse_requires_product_create_permission(): void
    {
        $user = User::factory()->create();
        $this->prepareProductPermission($user, ['view']);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/import/pdf', [
                'file' => UploadedFile::fake()->create('rates.pdf', 10, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    #[Test]
    public function pdf_parse_returns_reconciled_drafts_without_writing_database(): void
    {
        $user = User::factory()->create();
        $this->prepareProductPermission($user, ['view', 'create']);
        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        foreach (['DBL', 'TRPL', 'QUAD'] as $roomType) {
            HotelRoomType::query()->create(['name' => $roomType, 'is_active' => true]);
        }
        Storage::fake('local');

        $this->mock(PdfTextExtractor::class, function (MockInterface $mock): void {
            $mock->shouldReceive('extract')->once()->andReturn($this->layoutWords());
        });

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/import/pdf', [
                'file' => UploadedFile::fake()->create('rates.pdf', 10, 'application/pdf'),
                'default_country_id' => $country->id,
                'default_currency' => 'SAR',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('summary.hotels_detected', 1)
            ->assertJsonPath('summary.periods_detected', 1)
            ->assertJsonPath('hotels.0.import_status', 'create')
            ->assertJsonPath('hotels.0.period_rates.0.dbl_price', 1100);

        self::assertSame(0, Hotel::query()->count());
        Storage::disk('local')->assertDirectoryEmpty('hotel-imports');
    }

    #[Test]
    public function bulk_save_updates_existing_rates_adds_periods_and_avoids_duplicates(): void
    {
        $user = User::factory()->create();
        $this->prepareProductPermission($user, ['view', 'create']);
        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);
        $trpl = HotelRoomType::query()->create(['name' => 'TRPL', 'is_active' => true]);
        $quad = HotelRoomType::query()->create(['name' => 'QUAD', 'is_active' => true]);
        $hotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'Movenpick Hajar',
            'code' => 'HTL-MOVENPICK-HAJAR',
            'currency' => 'SAR',
            'is_active' => true,
        ]);

        foreach ([[$dbl, 100], [$trpl, 200], [$quad, 300]] as [$roomType, $price]) {
            $hotel->prices()->create([
                'broker_key' => 'broker-1',
                'broker_name' => 'Broker 1',
                'room_type_id' => $roomType->id,
                'period_start' => '2026-06-01',
                'period_end' => '2026-06-30',
                'price' => $price,
                'is_active' => true,
            ]);
        }

        $prices = [
            $this->pricePayload($dbl->id, '2026-06-01', '2026-06-30', 150),
            $this->pricePayload($trpl->id, '2026-06-01', '2026-06-30', 200),
            $this->pricePayload($quad->id, '2026-06-01', '2026-06-30', 300),
            $this->pricePayload($dbl->id, '2026-07-01', '2026-07-31', 175),
            $this->pricePayload($trpl->id, '2026-07-01', '2026-07-31', 275),
            $this->pricePayload($quad->id, '2026-07-01', '2026-07-31', 375),
        ];

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [[
                    'existing_hotel_id' => $hotel->id,
                    'country_id' => $country->id,
                    'city_id' => $city->id,
                    'name' => 'Movenpick-Hajar',
                    'currency' => 'SAR',
                    'is_active' => true,
                    'prices' => $prices,
                ]],
            ])
            ->assertRedirect()
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_updated_count', 1)
            ->assertSessionHas('bulk_new_period_count', 1);

        self::assertSame(1, Hotel::query()->count());
        self::assertSame(6, $hotel->prices()->count());
        $this->assertDatabaseHas('hotel_prices', [
            'hotel_id' => $hotel->id,
            'room_type_id' => $dbl->id,
            'period_start' => '2026-06-01 00:00:00',
            'period_end' => '2026-06-30 00:00:00',
            'price' => 150,
        ]);
    }

    /** @param array<int, string> $permissions */
    private function prepareProductPermission(User $user, array $permissions): void
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
            ]
        );
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(collect($permissions)->map(fn (string $permission): string => "menu.product.{$permission}")->all());
    }

    /** @return array<string, mixed> */
    private function pricePayload(int $roomTypeId, string $start, string $end, int $price): array
    {
        return [
            'broker_key' => 'broker-1',
            'broker_name' => 'Broker 1',
            'room_type_id' => $roomTypeId,
            'period_start' => $start,
            'period_end' => $end,
            'price' => $price,
        ];
    }

    /** @return array<int, array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>> */
    private function layoutWords(): array
    {
        $word = fn (string $text, float $x, float $y): array => [
            'text' => $text,
            'x_min' => $x,
            'y_min' => $y,
            'x_max' => $x + 40,
            'y_max' => $y + 10,
        ];

        return [1 => [
            $word('Makkah', 40, 20),
            $word('Movenpick', 40, 60),
            $word('Hajar', 110, 60),
            $word('From', 100, 80),
            $word('To', 200, 80),
            $word('DBL', 300, 80),
            $word('TRPL', 400, 80),
            $word('Quad', 500, 80),
            $word('16/06/26', 100, 100),
            $word('30/08/26', 200, 100),
            $word('1100', 300, 100),
            $word('1325', 400, 100),
            $word('1550', 500, 100),
        ]];
    }
}
