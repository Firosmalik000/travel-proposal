<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\Menu;
use App\Models\ProductCategory;
use App\Models\TravelProduct;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductCategoryHotelManagementTest extends TestCase
{
    use RefreshDatabase;

    private function ensureProductMenuExists(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'product_management'],
            [
                'name' => 'Product Management',
                'path' => '/dashboard/product-management',
                'icon' => 'Package',
                'children' => [
                    [
                        'name' => 'Product',
                        'menu_key' => 'product',
                        'path' => '/dashboard/product-management/products',
                        'icon' => 'Package',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 1,
                'is_active' => true,
            ]
        );
    }

    public function test_legacy_master_data_hotel_route_is_not_available(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/master-data/hotels')
            ->assertNotFound();
    }

    public function test_product_category_hotel_is_available_from_products_page(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.product.view');
        HotelRoomType::query()->create(['name' => 'Double', 'is_active' => true]);
        HotelRoomType::query()->create(['name' => 'Single', 'is_active' => true]);

        $this->actingAs($user)
            ->get('/admin/product-management/products?product_type=hotel')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Products/Index')
                ->where('filters.product_type', 'hotel')
                ->has('product_category_hotel')
                ->has('product_category_hotel.roomTypeOptions', 1)
                ->where('product_category_hotel.roomTypeOptions.0.name', 'Double')
            );
    }

    public function test_product_category_hotel_write_is_forbidden_without_product_create_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.product.view');

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels', [])
            ->assertForbidden();
    }

    public function test_hotel_index_hides_inactive_hotels_from_the_listing(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.product.view');

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'HOTEL AKTIF',
            'code' => 'HTL-AKTIF',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'HOTEL NONAKTIF',
            'code' => 'HTL-NONAKTIF',
            'currency' => 'IDR',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get('/admin/product-management/products?product_type=hotel')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('product_category_hotel.hotels.data', 1)
                ->where('product_category_hotel.hotels.data.0.name', 'HOTEL AKTIF')
            );
    }

    public function test_hotel_store_creates_synced_product(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $roomType = HotelRoomType::query()->create(['name' => 'Quad', 'is_active' => true]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels', [
                'country_id' => $country->id,
                'city_id' => $city->id,
                'name' => 'Hotel Zamzam',
                'description' => 'Dekat Masjidil Haram',
                'currency' => 'IDR',
                'is_active' => true,
                'prices' => [
                    [
                        'broker_name' => 'Broker A',
                        'room_type_id' => $roomType->id,
                        'period_start' => '2026-06-01',
                        'period_end' => '2026-06-30',
                        'price' => 3500000,
                    ],
                ],
            ])
            ->assertRedirect();

        $hotel = Hotel::query()->first();

        $this->assertNotNull($hotel);
        $this->assertNotNull($hotel?->product_id);

        $product = TravelProduct::query()->find($hotel?->product_id);
        $hotelCategory = ProductCategory::query()->where('key', 'hotel')->first();

        $this->assertNotNull($product);
        $this->assertNotNull($hotelCategory);
        $this->assertSame('hotel', $product?->product_type);
        $this->assertSame('Hotel Zamzam', $product?->name);
        $this->assertSame('hotel', $product?->category?->key);
        $this->assertSame('Arab Saudi', data_get($product?->content, 'country'));
        $this->assertSame('Mekkah', data_get($product?->content, 'city'));
        $this->assertSame('Broker A', data_get($product?->content, 'pricing.0.broker_name'));
        $this->assertSame('Quad', data_get($product?->content, 'pricing.0.room_type'));
        $this->assertSame(3500000, data_get($product?->content, 'pricing.0.price'));
    }

    public function test_product_category_hotel_rejects_room_types_outside_double_triple_and_quad(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $unsupportedRoomType = HotelRoomType::query()->create(['name' => 'Single', 'is_active' => true]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels', [
                'country_id' => $country->id,
                'city_id' => $city->id,
                'name' => 'Hotel Single Tidak Didukung',
                'currency' => 'IDR',
                'is_active' => true,
                'prices' => [[
                    'broker_name' => 'Broker A',
                    'room_type_id' => $unsupportedRoomType->id,
                    'period_start' => '2026-09-01',
                    'period_end' => '2026-09-30',
                    'price' => 1000000,
                ]],
            ])
            ->assertSessionHasErrors('prices.0.room_type_id');

        $this->assertDatabaseMissing('hotels', ['name' => 'Hotel Single Tidak Didukung']);
    }

    public function test_hotel_store_persists_multiple_brokers_and_period_prices(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Madinah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);
        $trpl = HotelRoomType::query()->create(['name' => 'TRPL', 'is_active' => true]);
        $quad = HotelRoomType::query()->create(['name' => 'QUAD', 'is_active' => true]);

        $payload = [
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'Sit explicabo Poss',
            'description' => '',
            'currency' => 'SAR',
            'is_active' => true,
            'prices' => [
                [
                    'broker_key' => 'broker-1',
                    'broker_name' => 'Eligendi dolores vol',
                    'room_type_id' => $dbl->id,
                    'period_start' => '2026-06-01',
                    'period_end' => '2026-06-10',
                    'price' => 100,
                ],
                [
                    'broker_key' => 'broker-1',
                    'broker_name' => 'Eligendi dolores vol',
                    'room_type_id' => $trpl->id,
                    'period_start' => '2026-06-01',
                    'period_end' => '2026-06-10',
                    'price' => 200,
                ],
                [
                    'broker_key' => 'broker-1',
                    'broker_name' => 'Eligendi dolores vol',
                    'room_type_id' => $quad->id,
                    'period_start' => '2026-06-01',
                    'period_end' => '2026-06-10',
                    'price' => 300,
                ],
                [
                    'broker_key' => 'broker-2',
                    'broker_name' => 'In rerum eos saepe d',
                    'room_type_id' => $dbl->id,
                    'period_start' => '2026-07-01',
                    'period_end' => '2026-07-10',
                    'price' => 400,
                ],
            ],
        ];

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels', $payload)
            ->assertRedirect();

        $hotel = Hotel::query()->where('name', 'Sit explicabo Poss')->first();
        $product = TravelProduct::query()->where('name', 'Sit explicabo Poss')->first();

        $this->assertNotNull($hotel);
        $this->assertNotNull($product);
        $this->assertSame('SAR', $hotel?->currency);
        $this->assertSame('Eligendi dolores vol', data_get($product?->content, 'pricing.0.broker_name'));
        $this->assertSame('broker-1', data_get($product?->content, 'pricing.0.broker_key'));
        $this->assertSame('In rerum eos saepe d', data_get($product?->content, 'pricing.3.broker_name'));
        $this->assertSame(4, $hotel?->prices()->count());
    }

    public function test_hotel_bulk_store_creates_multiple_hotels_and_products(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Madinah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);
        $trpl = HotelRoomType::query()->create(['name' => 'TRPL', 'is_active' => true]);
        $quad = HotelRoomType::query()->create(['name' => 'QUAD', 'is_active' => true]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'Hotel A',
                        'description' => 'Desc A',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [
                            [
                                'broker_name' => 'Broker A',
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 400000,
                            ],
                            [
                                'broker_name' => 'Broker A',
                                'room_type_id' => $trpl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 500000,
                            ],
                            [
                                'broker_name' => 'Broker A',
                                'room_type_id' => $quad->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 600000,
                            ],
                        ],
                    ],
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'Hotel B',
                        'description' => 'Desc B',
                        'currency' => 'USD',
                        'is_active' => true,
                        'prices' => [
                            [
                                'broker_name' => 'Broker B',
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-07-01',
                                'period_end' => '2026-07-31',
                                'price' => 700000,
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(2, Hotel::query()->count());
        $this->assertSame(2, TravelProduct::query()->where('product_type', 'hotel')->count());
        $this->assertTrue(
            Hotel::query()->whereNotNull('product_id')->count() === 2
        );
    }

    public function test_hotel_bulk_store_skips_existing_name_in_same_city_and_continues(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'TEST HOTEL 2',
            'code' => 'HTL-TEST-HOTEL-2',
            'description' => null,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->from('/admin/product-management/products?product_type=hotel')
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'TEST HOTEL 2',
                        'description' => '',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [
                            [
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 350000,
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect('/admin/product-management/products?product_type=hotel')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');

        $this->assertSame(1, Hotel::query()->count());
    }

    public function test_hotel_bulk_store_creates_new_rows_and_skips_existing_rows(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'EXISTING HOTEL',
            'code' => 'HTL-EXISTING-HOTEL',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'EXISTING HOTEL',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [[
                            'room_type_id' => $dbl->id,
                            'period_start' => '2026-06-01',
                            'period_end' => '2026-06-30',
                            'price' => 100000,
                        ]],
                    ],
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'NEW HOTEL BULK',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [[
                            'room_type_id' => $dbl->id,
                            'period_start' => '2026-06-01',
                            'period_end' => '2026-06-30',
                            'price' => 200000,
                        ]],
                    ],
                ],
            ])
            ->assertRedirect()
            ->assertSessionHas('bulk_created_count', 1)
            ->assertSessionHas('bulk_skipped_hotels');

        $this->assertNotNull(Hotel::query()->where('name', 'NEW HOTEL BULK')->first());
    }

    public function test_hotel_bulk_store_handles_hotel_code_collision(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Madinah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'TEST HOTEL 2',
            'code' => 'HTL-TEST-HOTEL-2',
            'description' => null,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'TEST HOTEL 22',
                        'description' => '',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [
                            [
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 375000,
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $newHotel = Hotel::query()->where('name', 'TEST HOTEL 22')->first();

        $this->assertNotNull($newHotel);
        $this->assertNotNull($newHotel?->product_id);
        $this->assertNotSame('HTL-TEST-HOTEL-2', $newHotel?->code);
        $this->assertStringStartsWith('HTL-TEST-HOTEL-22', $newHotel?->code ?? '');
    }

    public function test_hotel_bulk_store_skips_name_exists_in_soft_deleted_row(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        $existingHotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'TEST HOTEL 2',
            'code' => 'HTL-TEST-HOTEL-2',
            'description' => null,
            'currency' => 'IDR',
            'is_active' => true,
        ]);
        $existingHotel->delete();

        $this->actingAs($user)
            ->from('/admin/product-management/products?product_type=hotel')
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'TEST HOTEL 2',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [
                            [
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 375000,
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect('/admin/product-management/products?product_type=hotel')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');
    }

    public function test_hotel_bulk_store_skips_same_name_exists_and_inactive(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'TEST HOTEL INACTIVE',
            'code' => 'HTL-TEST-HOTEL-INACTIVE',
            'description' => null,
            'currency' => 'IDR',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->from('/admin/product-management/products?product_type=hotel')
            ->post('/admin/product-management/products/hotels/bulk', [
                'hotels' => [
                    [
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'name' => 'TEST HOTEL INACTIVE',
                        'currency' => 'IDR',
                        'is_active' => true,
                        'prices' => [
                            [
                                'room_type_id' => $dbl->id,
                                'period_start' => '2026-06-01',
                                'period_end' => '2026-06-30',
                                'price' => 375000,
                            ],
                        ],
                    ],
                ],
            ])
            ->assertRedirect('/admin/product-management/products?product_type=hotel')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');
    }

    public function test_hotel_destroy_soft_deletes_the_hotel(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create', 'menu.product.delete']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);
        $hotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'TEST NONAKTIF',
            'code' => 'HTL-TEST-NONAKTIF',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->delete("/admin/product-management/products/hotels/{$hotel->id}")
            ->assertRedirect();

        $hotel->refresh();

        $this->assertFalse($hotel->is_active);
        $this->assertNotNull($hotel->deleted_at);

        $this->actingAs($user)
            ->get('/admin/product-management/products?product_type=hotel&search=TEST%20NONAKTIF')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('product_category_hotel.hotels.data', 0));
    }

    public function test_product_category_hotel_bulk_delete_soft_deletes_selected_hotels(): void
    {
        $user = User::factory()->create();

        $this->ensureProductMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.product.view', 'menu.product.create', 'menu.product.delete']);

        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Mekkah', 'is_active' => true]);

        $firstHotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'HOTEL BULK 1',
            'code' => 'HTL-BULK-1',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $secondHotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'HOTEL BULK 2',
            'code' => 'HTL-BULK-2',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post('/admin/product-management/products/hotels/bulk-delete', [
                'ids' => [$firstHotel->id, $secondHotel->id],
            ])
            ->assertRedirect();

        $firstHotel->refresh();
        $secondHotel->refresh();

        $this->assertFalse($firstHotel->is_active);
        $this->assertFalse($secondHotel->is_active);
        $this->assertNotNull($firstHotel->deleted_at);
        $this->assertNotNull($secondHotel->deleted_at);
    }
}
