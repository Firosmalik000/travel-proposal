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

class MasterDataHotelPageTest extends TestCase
{
    use RefreshDatabase;

    private function ensureMasterDataHotelMenuExists(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'master_data'],
            [
                'name' => 'Master Data',
                'path' => '/dashboard/master-data',
                'icon' => 'Database',
                'children' => [
                    [
                        'name' => 'Hotel',
                        'menu_key' => 'hotel',
                        'path' => '/dashboard/master-data/hotels',
                        'icon' => 'Building2',
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

    public function test_hotel_page_is_forbidden_without_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->get('/admin/master-data/hotels')
            ->assertForbidden();
    }

    public function test_hotel_page_can_be_opened_with_view_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.hotel.view');

        $this->actingAs($user)
            ->get('/admin/master-data/hotels')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/MasterData/Hotels/Index')
            );
    }

    public function test_hotel_index_hides_inactive_hotels_from_the_listing(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.hotel.view');

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
            ->get('/admin/master-data/hotels')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('hotels.data', 1)
                ->where('hotels.data.0.name', 'HOTEL AKTIF')
            );
    }

    public function test_hotel_store_creates_synced_product(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->post('/admin/master-data/hotels', [
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

    public function test_hotel_store_persists_multiple_brokers_and_period_prices(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->post('/admin/master-data/hotels', $payload)
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

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->post('/admin/master-data/hotels/bulk', [
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

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->from('/admin/master-data/hotels')
            ->post('/admin/master-data/hotels/bulk', [
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
            ->assertRedirect('/admin/master-data/hotels')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');

        $this->assertSame(1, Hotel::query()->count());
    }

    public function test_hotel_bulk_store_creates_new_rows_and_skips_existing_rows(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->post('/admin/master-data/hotels/bulk', [
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

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->post('/admin/master-data/hotels/bulk', [
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

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->from('/admin/master-data/hotels')
            ->post('/admin/master-data/hotels/bulk', [
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
            ->assertRedirect('/admin/master-data/hotels')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');
    }

    public function test_hotel_bulk_store_skips_same_name_exists_and_inactive(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create']);

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
            ->from('/admin/master-data/hotels')
            ->post('/admin/master-data/hotels/bulk', [
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
            ->assertRedirect('/admin/master-data/hotels')
            ->assertSessionHas('bulk_created_count', 0)
            ->assertSessionHas('bulk_skipped_hotels');
    }

    public function test_hotel_destroy_soft_deletes_the_hotel(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create', 'menu.hotel.delete']);

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
            ->delete("/admin/master-data/hotels/{$hotel->id}")
            ->assertRedirect();

        $hotel->refresh();

        $this->assertFalse($hotel->is_active);
        $this->assertNotNull($hotel->deleted_at);

        $this->actingAs($user)
            ->get('/admin/master-data/hotels?search=TEST NONAKTIF')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('hotels.data', 0));
    }

    public function test_hotel_bulk_deactivate_soft_deletes_selected_hotels(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataHotelMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel.view', 'menu.hotel.create', 'menu.hotel.delete']);

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
            ->post('/admin/master-data/hotels/bulk-deactivate', [
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
