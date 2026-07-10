<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\Currency;
use App\Models\DepartureSchedule;
use App\Models\PackageItinerary;
use App\Models\ProductCategory;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use App\Support\ParticipantUploadLimit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PackageManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makePackage(array $overrides = []): TravelPackage
    {
        return TravelPackage::query()->create(array_merge([
            'code' => 'ASF-TEST-10',
            'slug' => 'umroh-test-10-hari',
            'name' => ['id' => 'Umroh Test', 'en' => 'Test Umrah'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 34900000,
            'currency' => 'IDR',
            'is_active' => true,
        ], $overrides));
    }

    public function test_it_shows_package_management_page(): void
    {
        $user = User::factory()->create();
        $this->makePackage([
            'image_path' => '/storage/packages/cover.jpg',
            'content' => [
                'gallery' => ['/storage/packages/gallery-1.jpg'],
            ],
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Index')
                ->has('packages', 1)
                ->has('productOptions')
                ->has('activityOptions')
                ->where('packageImageUploadMaxKilobytes', ParticipantUploadLimit::kilobytes(4096))
                ->where('packages.0.code', 'ASF-TEST-10')
                ->where('packages.0.images.0', '/storage/packages/cover.jpg')
                ->where('packages.0.images.1', '/storage/packages/gallery-1.jpg')
            );
    }

    public function test_it_shows_discount_percent_when_original_price_set(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage(['price' => 30000000, 'original_price' => 40000000]);
        $package->itineraries()->create([
            'day_number' => 1,
            'sort_order' => 1,
            'title' => 'Hari Pertama',
            'description' => 'Berangkat ke Jeddah',
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('packages.0.discount_percent', 25)
                ->where('packages.0.original_price', 40000000)
                ->where('packages.0.itineraries.0.day_number', 1)
                ->where('packages.0.itineraries.0.sort_order', 1)
            );
    }

    public function test_it_serializes_product_option_prices_and_hotel_pricing(): void
    {
        $user = User::factory()->create();
        $this->makePackage();
        ProductCategory::query()->create([
            'key' => 'perlengkapan',
            'name' => ['id' => 'Perlengkapan', 'en' => 'Equipment'],
            'is_active' => true,
        ]);
        ProductCategory::query()->create([
            'key' => 'hotel',
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'is_active' => true,
        ]);
        Currency::factory()->create([
            'code' => 'IDR',
            'conversion_rate' => 1,
            'is_active' => true,
        ]);
        Currency::factory()->create([
            'code' => 'SAR',
            'conversion_rate' => 4300,
            'is_active' => true,
        ]);

        TravelProduct::query()->create([
            'code' => 'PRD-VISA',
            'slug' => 'visa-umroh',
            'name' => ['id' => 'Visa Umroh', 'en' => 'Umrah Visa'],
            'product_type' => 'perlengkapan',
            'description' => ['id' => 'Visa resmi', 'en' => 'Official visa'],
            'content' => ['price' => 2500000, 'currency' => 'IDR'],
            'is_active' => true,
        ]);

        TravelProduct::query()->create([
            'code' => 'HTL-MASSA',
            'slug' => 'al-massa-grand',
            'name' => ['id' => 'Al Massa Grand', 'en' => 'Al Massa Grand'],
            'product_type' => 'hotel',
            'description' => ['id' => 'Hotel Makkah', 'en' => 'Makkah Hotel'],
            'content' => [
                'city' => 'Makkah',
                'country' => 'Saudi Arabia',
                'currency' => 'SAR',
                'pricing' => [
                    [
                        'broker_name' => 'Broker A',
                        'room_type' => 'Quad',
                        'period_start' => '2026-08-01',
                        'period_end' => '2026-08-15',
                        'price' => 1450,
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('productOptions', 2)
                ->where('productOptions.0.price', 2500000)
                ->where('productOptions.0.currency', 'IDR')
                ->where('productOptions.1.hotel_info.city', 'Makkah')
                ->where('productOptions.1.currency', 'SAR')
                ->where('productOptions.1.hotel_info.pricing.0.broker_name', 'Broker A')
                ->where('productOptions.1.hotel_info.pricing.0.price', 1450.0)
                ->where('currencies.0.code', 'IDR')
                ->where('currencies.1.code', 'SAR')
                ->where('currencies.1.conversion_rate', 4300.0)
            );
    }

    public function test_it_only_includes_products_from_active_categories_in_package_options(): void
    {
        $user = User::factory()->create();
        $this->makePackage();

        ProductCategory::query()->create([
            'key' => 'hotel',
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'is_active' => true,
        ]);
        ProductCategory::query()->create([
            'key' => 'merchandise',
            'name' => ['id' => 'Merchandise', 'en' => 'Merchandise'],
            'is_active' => false,
        ]);

        TravelProduct::query()->create([
            'code' => 'HTL-AKTIF',
            'slug' => 'hotel-aktif',
            'name' => ['id' => 'Hotel Aktif', 'en' => 'Active Hotel'],
            'product_type' => 'hotel',
            'description' => ['id' => 'Hotel aktif', 'en' => 'Active hotel'],
            'is_active' => true,
        ]);

        TravelProduct::query()->create([
            'code' => 'PRD-KATEGORI-OFF',
            'slug' => 'kategori-off',
            'name' => ['id' => 'Kategori Off', 'en' => 'Inactive Category'],
            'product_type' => 'merchandise',
            'description' => ['id' => 'Kategori off', 'en' => 'Inactive category'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('productOptions', 1)
                ->where('productOptions.0.code', 'HTL-AKTIF'));
    }

    public function test_it_stores_a_new_package(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-new-10',
                'name' => ['id' => 'Umroh Baru', 'en' => 'New Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Surabaya',
                'duration_days' => 10,
                'price' => 35000000,
                'currency' => 'IDR',
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertTrue(TravelPackage::query()->where('code', 'ASF-UMROH-BARU-10')->exists());
    }

    public function test_it_stores_selected_hotel_brokers_in_package_content(): void
    {
        $user = User::factory()->create();
        $hotelProduct = TravelProduct::query()->create([
            'code' => 'HTL-ZAMZAM',
            'slug' => 'zamzam-hotel',
            'name' => ['id' => 'Pullman Zamzam', 'en' => 'Pullman Zamzam'],
            'product_type' => 'hotel',
            'description' => ['id' => 'Hotel dekat haram', 'en' => 'Hotel near haram'],
            'content' => [
                'city' => 'Makkah',
                'pricing' => [
                    [
                        'broker_name' => 'Broker 1',
                        'room_type' => 'Double',
                        'period_start' => '2026-08-01',
                        'period_end' => '2026-08-31',
                        'price' => 1700,
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-broker-10',
                'name' => ['id' => 'Umroh Broker', 'en' => 'Broker Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 35000000,
                'currency' => 'IDR',
                'product_ids' => [$hotelProduct->id],
                'content' => [
                    'hotel_product_brokers' => [
                        (string) $hotelProduct->id => 'Broker 1',
                    ],
                ],
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('slug', 'umroh-broker-10')->first();

        $this->assertNotNull($package);
        $this->assertSame(
            'Broker 1',
            data_get($package->content, 'hotel_product_brokers.'.$hotelProduct->id),
        );
    }

    public function test_it_stores_product_multipliers_for_package_products(): void
    {
        $user = User::factory()->create();
        $hotelProduct = TravelProduct::query()->create([
            'code' => 'HTL-QTY',
            'slug' => 'hotel-qty',
            'name' => ['id' => 'Hotel Qty', 'en' => 'Hotel Qty'],
            'product_type' => 'hotel',
            'description' => ['id' => 'Hotel Qty', 'en' => 'Hotel Qty'],
            'is_active' => true,
        ]);
        $equipmentProduct = TravelProduct::query()->create([
            'code' => 'PRD-QTY',
            'slug' => 'produk-qty',
            'name' => ['id' => 'Perlengkapan Qty', 'en' => 'Equipment Qty'],
            'product_type' => 'perlengkapan',
            'description' => ['id' => 'Perlengkapan Qty', 'en' => 'Equipment Qty'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-qty-10',
                'name' => ['id' => 'Umroh Qty', 'en' => 'Umrah Qty'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 35000000,
                'currency' => 'IDR',
                'product_ids' => [$hotelProduct->id, $equipmentProduct->id],
                'product_multipliers' => [
                    (string) $hotelProduct->id => 3,
                    (string) $equipmentProduct->id => 2,
                ],
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('slug', 'umroh-qty-10')->first();

        $this->assertNotNull($package);
        $this->assertSame(
            3,
            (int) $package->products()->whereKey($hotelProduct->id)->firstOrFail()->pivot->multiplier_per_pax,
        );
        $this->assertSame(
            2,
            (int) $package->products()->whereKey($equipmentProduct->id)->firstOrFail()->pivot->multiplier_per_pax,
        );
    }

    public function test_it_stores_package_with_discount_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-promo-10',
                'name' => ['id' => 'Umroh Promo', 'en' => 'Promo Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 30000000,
                'original_price' => 40000000,
                'discount_label' => 'EARLY BIRD',
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertRedirect();

        $pkg = TravelPackage::query()->where('code', 'ASF-UMROH-PROMO-10')->first();
        $this->assertNotNull($pkg);
        $this->assertEquals('40000000.00', $pkg->original_price);
        $this->assertEquals('EARLY BIRD', $pkg->discount_label);
        $this->assertEquals(25, $pkg->discountPercent());
    }

    public function test_it_stores_custom_package_highlights_in_content(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-highlight-10',
                'name' => ['id' => 'Umroh Highlight', 'en' => 'Highlight Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 32000000,
                'currency' => 'IDR',
                'is_active' => true,
                'content' => [
                    'highlights' => [
                        [
                            'id' => 'highlight-airline',
                            'icon' => 'Plane',
                            'label' => ['id' => 'Maskapai', 'en' => 'Airline'],
                            'value' => ['id' => 'Saudia Airlines', 'en' => 'Saudia Airlines'],
                        ],
                        [
                            'id' => 'highlight-hotel',
                            'icon' => 'Hotel',
                            'label' => ['id' => 'Hotel', 'en' => 'Hotel'],
                            'value' => ['id' => 'Hilton Convention', 'en' => 'Hilton Convention'],
                        ],
                    ],
                ],
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('code', 'ASF-UMROH-HIGHLIGHT-10')->first();
        $this->assertNotNull($package);
        $this->assertEquals('Plane', data_get($package->content, 'highlights.0.icon'));
        $this->assertEquals('Maskapai', data_get($package->content, 'highlights.0.label.id'));
        $this->assertEquals('Hilton Convention', data_get($package->content, 'highlights.1.value.id'));
    }

    public function test_it_stores_package_room_prices_in_content_with_discount_applied(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-room-price-10',
                'name' => ['id' => 'Umroh Room Price', 'en' => 'Umrah Room Price'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 33000000,
                'original_price' => 36000000,
                'currency' => 'IDR',
                'content' => [
                    'room_original_prices' => [
                        'dbl' => 34500000,
                        'trpl' => 33800000,
                        'quad' => 33000000,
                    ],
                    'room_prices' => [
                        'dbl' => 31625000,
                        'trpl' => 30983333,
                        'quad' => 30250000,
                    ],
                ],
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('slug', 'umroh-room-price-10')->first();

        $this->assertNotNull($package);
        $this->assertSame(34500000, data_get($package->content, 'room_original_prices.dbl'));
        $this->assertSame(33800000, data_get($package->content, 'room_original_prices.trpl'));
        $this->assertSame(33000000, data_get($package->content, 'room_original_prices.quad'));
        $this->assertSame(31625000, data_get($package->content, 'room_prices.dbl'));
        $this->assertSame(30983333, data_get($package->content, 'room_prices.trpl'));
        $this->assertSame(30250000, data_get($package->content, 'room_prices.quad'));
    }

    public function test_it_keeps_room_prices_empty_when_not_filled_manually(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-room-empty-10',
                'name' => ['id' => 'Umroh Room Empty', 'en' => 'Umrah Room Empty'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 30000000,
                'original_price' => 36000000,
                'currency' => 'IDR',
                'content' => [
                    'room_original_prices' => [
                        'dbl' => null,
                        'trpl' => null,
                        'quad' => null,
                    ],
                ],
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('slug', 'umroh-room-empty-10')->first();

        $this->assertNotNull($package);
        $this->assertNull(data_get($package->content, 'room_original_prices.dbl'));
        $this->assertNull(data_get($package->content, 'room_original_prices.trpl'));
        $this->assertNull(data_get($package->content, 'room_original_prices.quad'));
        $this->assertNull(data_get($package->content, 'room_prices.dbl'));
        $this->assertNull(data_get($package->content, 'room_prices.trpl'));
        $this->assertNull(data_get($package->content, 'room_prices.quad'));
    }

    public function test_it_rejects_original_price_less_than_price(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-bad-10',
                'name' => ['id' => 'Test'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 40000000,
                'original_price' => 30000000,
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertSessionHasErrors('original_price');
    }

    public function test_it_updates_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'slug' => $pkg->slug,
                'name' => ['id' => 'Nama Diperbarui', 'en' => 'Updated Name'],
                'package_type' => 'vip',
                'departure_city' => 'Bandung',
                'duration_days' => 12,
                'price' => 45000000,
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals('vip', $pkg->fresh()->package_type);
        $this->assertEquals('Bandung', $pkg->fresh()->departure_city);
        $this->assertEquals('ASF-NAMA-DIPERBARUI-12', $pkg->fresh()->code);
    }

    public function test_it_serializes_custom_package_highlights_on_management_page(): void
    {
        $user = User::factory()->create();
        $this->makePackage([
            'content' => [
                'highlights' => [
                    [
                        'id' => 'highlight-period',
                        'icon' => 'CalendarDays',
                        'label' => ['id' => 'Periode', 'en' => 'Period'],
                        'value' => ['id' => 'November 2026', 'en' => 'November 2026'],
                    ],
                ],
            ],
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('packages.0.content.highlights.0.icon', 'CalendarDays')
                ->where('packages.0.content.highlights.0.label.id', 'Periode')
                ->where('packages.0.content.highlights.0.value.id', 'November 2026')
            );
    }

    public function test_it_stores_itineraries_when_creating_a_package(): void
    {
        $user = User::factory()->create();
        $activity = Activity::query()->create([
            'code' => 'ACT-DEP',
            'name' => ['id' => 'Keberangkatan', 'en' => 'Departure'],
            'description' => ['id' => 'Berangkat ke Jeddah', 'en' => 'Depart to Jeddah'],
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $secondaryActivity = Activity::query()->create([
            'code' => 'ACT-HOTEL',
            'name' => ['id' => 'Check-in Hotel', 'en' => 'Hotel Check-in'],
            'description' => ['id' => 'Masuk hotel.', 'en' => 'Check in to hotel.'],
            'sort_order' => 2,
            'is_active' => true,
        ]);
        $product = TravelProduct::query()->create([
            'code' => 'PRD-ITI-1',
            'slug' => 'produk-itinerary-1',
            'name' => ['id' => 'Handling Bandara', 'en' => 'Airport Handling'],
            'product_type' => 'layanan',
            'description' => ['id' => 'Handling Bandara', 'en' => 'Airport Handling'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-iti-10',
                'name' => ['id' => 'Umroh Itinerary', 'en' => 'Umrah Itinerary'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 2,
                'price' => 35000000,
                'currency' => 'IDR',
                'is_active' => true,
                'product_ids' => [$product->id],
                'itineraries' => [
                    [
                        'activity_ids' => [$activity->id, $secondaryActivity->id],
                        'day_number' => 1,
                        'sort_order' => 1,
                        'product_ids' => [],
                    ],
                    [
                        'day_number' => 2,
                        'sort_order' => 2,
                    ],
                ],
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('code', 'ASF-UMROH-ITINERARY-2')->first();
        $this->assertNotNull($package);
        $this->assertEquals(1, $package->itineraries()->count());
        $this->assertEquals($activity->id, $package->itineraries()->orderBy('day_number')->first()?->activity_id);
        $this->assertEquals([$activity->id, $secondaryActivity->id], $package->itineraries()->orderBy('day_number')->first()?->activity_ids);
        $this->assertEquals('Keberangkatan, Check-in Hotel', $package->itineraries()->orderBy('day_number')->first()?->title);
        $this->assertEquals([], $package->itineraries()->orderBy('day_number')->first()?->products()->pluck('products.id')->all());
    }

    public function test_it_syncs_itineraries_when_updating_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $activityA = Activity::query()->create([
            'code' => 'ACT-MTH',
            'name' => ['id' => 'Muthawwif', 'en' => 'Muthawwif'],
            'description' => ['id' => 'Pendamping ibadah.', 'en' => 'Pilgrimage guide.'],
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $activityB = Activity::query()->create([
            'code' => 'ACT-BUS',
            'name' => ['id' => 'Bus Sholawat', 'en' => 'Shuttle Bus'],
            'description' => ['id' => 'Transportasi antar lokasi.', 'en' => 'Transport between locations.'],
            'sort_order' => 2,
            'is_active' => true,
        ]);
        $productA = TravelProduct::query()->create([
            'code' => 'PRD-ITI-A',
            'slug' => 'produk-itinerary-a',
            'name' => ['id' => 'Muthawwif', 'en' => 'Muthawwif'],
            'product_type' => 'layanan',
            'description' => ['id' => 'Muthawwif', 'en' => 'Muthawwif'],
            'is_active' => true,
        ]);
        $productB = TravelProduct::query()->create([
            'code' => 'PRD-ITI-B',
            'slug' => 'produk-itinerary-b',
            'name' => ['id' => 'Bus Sholawat', 'en' => 'Shuttle Bus'],
            'product_type' => 'transportasi',
            'description' => ['id' => 'Bus Sholawat', 'en' => 'Shuttle Bus'],
            'is_active' => true,
        ]);

        $pkg->itineraries()->createMany([
            [
                'day_number' => 1,
                'sort_order' => 1,
                'title' => 'Hari Lama 1',
                'description' => 'Lama 1',
            ],
            [
                'day_number' => 2,
                'sort_order' => 2,
                'title' => 'Hari Lama 2',
                'description' => 'Lama 2',
            ],
        ]);

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'slug' => $pkg->slug,
                'name' => $pkg->name,
                'package_type' => $pkg->package_type,
                'departure_city' => $pkg->departure_city,
                'duration_days' => 3,
                'price' => $pkg->price,
                'currency' => $pkg->currency,
                'product_ids' => [$productA->id, $productB->id],
                'is_active' => true,
                'itineraries' => [
                    [
                        'activity_ids' => [$activityA->id],
                        'day_number' => 1,
                        'sort_order' => 1,
                    ],
                    [
                        'activity_ids' => [$activityA->id, $activityB->id],
                        'day_number' => 3,
                        'sort_order' => 3,
                    ],
                ],
            ])
            ->assertRedirect();

        $freshPackage = $pkg->fresh();
        $this->assertNotNull($freshPackage);
        $this->assertEquals([1, 3], $freshPackage->itineraries()->orderBy('day_number')->pluck('day_number')->all());
        $this->assertEquals('Muthawwif', $freshPackage->itineraries()->where('day_number', 1)->first()?->title);
        $this->assertEquals($activityA->id, $freshPackage->itineraries()->where('day_number', 3)->first()?->activity_id);
        $this->assertEquals([$activityA->id, $activityB->id], $freshPackage->itineraries()->where('day_number', 3)->first()?->activity_ids);
        $this->assertEquals([], $freshPackage->itineraries()->where('day_number', 3)->first()?->products()->pluck('products.id')->all());
    }

    public function test_it_syncs_products_when_updating_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $product = TravelProduct::query()->create([
            'code' => 'PRD-VISA',
            'slug' => 'visa-umroh',
            'name' => ['id' => 'Visa', 'en' => 'Visa'],
            'product_type' => 'dokumen',
            'description' => ['id' => 'Visa', 'en' => 'Visa'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'slug' => $pkg->slug,
                'name' => $pkg->name,
                'package_type' => $pkg->package_type,
                'departure_city' => $pkg->departure_city,
                'duration_days' => $pkg->duration_days,
                'price' => $pkg->price,
                'currency' => $pkg->currency,
                'product_ids' => [$product->id],
                'product_multipliers' => [
                    (string) $product->id => 4,
                ],
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals(1, $pkg->fresh()->products()->count());
        $this->assertSame(
            4,
            (int) $pkg->fresh()->products()->firstOrFail()->pivot->multiplier_per_pax,
        );
    }

    public function test_it_deletes_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->delete(route('packages.destroy', $pkg))
            ->assertRedirect();

        $this->assertNull(TravelPackage::query()->find($pkg->id));
    }

    public function test_it_stores_a_schedule_for_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->post(route('packages.schedules.store', $pkg), [
                'departure_date' => '2026-08-01',
                'return_date' => '2026-08-10',
                'departure_city' => 'Jakarta',
                'seats_total' => 45,
                'status' => 'open',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals(1, $pkg->schedules()->count());
        $this->assertEquals(45, $pkg->schedules()->first()?->seats_available);
    }

    public function test_it_computes_available_schedule_seats_from_related_bookings(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $pkg->id,
            'departure_date' => '2026-08-01',
            'return_date' => '2026-08-10',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        Booking::query()->create([
            'package_id' => $pkg->id,
            'departure_schedule_id' => $schedule->id,
            'booking_code' => 'BK-TEST-001',
            'booking_type' => 'package',
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 4,
            'status' => 'pending',
        ]);

        Booking::query()->create([
            'package_id' => $pkg->id,
            'departure_schedule_id' => $schedule->id,
            'booking_code' => 'BK-TEST-002',
            'booking_type' => 'package',
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 3,
            'status' => 'registered',
        ]);

        Booking::query()->create([
            'package_id' => $pkg->id,
            'departure_schedule_id' => $schedule->id,
            'booking_code' => 'BK-TEST-003',
            'booking_type' => 'package',
            'full_name' => 'Budi Santoso',
            'phone' => '081234567892',
            'email' => 'budi@example.com',
            'origin_city' => 'Sidoarjo',
            'passenger_count' => 5,
            'status' => 'cancelled',
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('packages.0.schedules.0.seats_total', 45)
                ->where('packages.0.schedules.0.seats_available', 42)
            );
    }

    public function test_it_prevents_updating_schedule_of_different_package(): void
    {
        $user = User::factory()->create();
        $pkg1 = $this->makePackage(['code' => 'PKG-1', 'slug' => 'pkg-1']);
        $pkg2 = $this->makePackage(['code' => 'PKG-2', 'slug' => 'pkg-2']);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $pkg1->id,
            'departure_date' => '2026-08-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.schedules.update', [$pkg2, $schedule]), [
                'departure_date' => '2026-09-01',
                'departure_city' => 'Surabaya',
                'seats_total' => 30,
                'status' => 'open',
                'is_active' => true,
            ])
            ->assertForbidden();
    }

    public function test_it_deletes_a_schedule(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $pkg->id,
            'departure_date' => '2026-08-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->delete(route('packages.schedules.destroy', [$pkg, $schedule]))
            ->assertRedirect();

        $this->assertNull(DepartureSchedule::query()->find($schedule->id));
    }

    public function test_it_stores_and_updates_itinerary_via_nested_routes(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $activity = Activity::query()->create([
            'code' => 'ACT-ROUTE',
            'name' => ['id' => 'City Tour', 'en' => 'City Tour'],
            'description' => ['id' => 'Agenda city tour.', 'en' => 'City tour agenda.'],
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $product = TravelProduct::query()->create([
            'code' => 'PRD-ITI-ROUTE',
            'slug' => 'produk-itinerary-route',
            'name' => ['id' => 'City Tour', 'en' => 'City Tour'],
            'product_type' => 'layanan',
            'description' => ['id' => 'City Tour', 'en' => 'City Tour'],
            'is_active' => true,
        ]);
        $pkg->products()->sync([$product->id => ['sort_order' => 1]]);

        $this->actingAs($user)
            ->post(route('packages.itineraries.store', $pkg), [
                'activity_ids' => [$activity->id],
                'day_number' => 1,
                'sort_order' => 1,
                'product_ids' => [],
            ])
            ->assertRedirect();

        $itinerary = $pkg->itineraries()->first();
        $this->assertNotNull($itinerary);

        $this->actingAs($user)
            ->post(route('packages.itineraries.update', [$pkg, $itinerary]), [
                'activity_ids' => [$activity->id],
                'day_number' => 2,
                'sort_order' => 2,
                'product_ids' => [],
            ])
            ->assertRedirect();

        $updatedItinerary = $itinerary->fresh();
        $this->assertNotNull($updatedItinerary);
        $this->assertEquals(2, $updatedItinerary->day_number);
        $this->assertEquals($activity->id, $updatedItinerary->activity_id);
        $this->assertEquals([$activity->id], $updatedItinerary->activity_ids);
        $this->assertEquals('City Tour', $updatedItinerary->title);
        $this->assertEquals([], $updatedItinerary->products()->pluck('products.id')->all());
    }

    public function test_it_prevents_updating_itinerary_of_different_package(): void
    {
        $user = User::factory()->create();
        $pkg1 = $this->makePackage(['code' => 'PKG-ITI-1', 'slug' => 'pkg-iti-1']);
        $pkg2 = $this->makePackage(['code' => 'PKG-ITI-2', 'slug' => 'pkg-iti-2']);

        $itinerary = PackageItinerary::query()->create([
            'package_id' => $pkg1->id,
            'day_number' => 1,
            'sort_order' => 1,
            'title' => 'Hari 1',
            'description' => 'Agenda 1',
        ]);

        $this->actingAs($user)
            ->post(route('packages.itineraries.update', [$pkg2, $itinerary]), [
                'day_number' => 1,
                'sort_order' => 1,
                'title' => ['id' => 'Tidak Boleh', 'en' => 'Forbidden'],
                'description' => ['id' => 'Tidak boleh diubah', 'en' => 'Should not update'],
            ])
            ->assertForbidden();
    }

    public function test_it_requires_auth_for_package_routes(): void
    {
        $pkg = $this->makePackage();

        $this->get(route('packages.index'))->assertRedirect(route('login'));
        $this->post(route('packages.store'))->assertRedirect(route('login'));
        $this->post(route('packages.update', $pkg))->assertRedirect(route('login'));
        $this->delete(route('packages.destroy', $pkg))->assertRedirect(route('login'));
    }

    public function test_it_generates_unique_package_code_automatically(): void
    {
        $user = User::factory()->create();

        $this->makePackage([
            'code' => 'ASF-UMROH-BARU-10',
            'name' => ['id' => 'Umroh Baru', 'en' => 'New Umrah'],
            'duration_days' => 10,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-baru-kedua-10',
                'name' => ['id' => 'Umroh Baru', 'en' => 'New Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 35000000,
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('packages', [
            'code' => 'ASF-UMROH-BARU-10-2',
        ]);
    }

    public function test_it_uses_indonesian_value_when_english_package_fields_are_empty(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-hemat-default-bahasa',
                'name' => ['id' => 'Umroh Hemat', 'en' => ''],
                'package_type' => 'hemat',
                'departure_city' => 'Jakarta',
                'duration_days' => 9,
                'price' => 32000000,
                'currency' => 'IDR',
                'summary' => ['id' => 'Paket hemat untuk jamaah.', 'en' => ''],
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('code', 'ASF-UMROH-HEMAT-9')->first();
        $this->assertNotNull($package);
        $this->assertSame('Umroh Hemat', $package->name);
        $this->assertSame('Paket hemat untuk jamaah.', $package->summary);
    }

    public function test_it_removes_all_itineraries_when_updating_package_with_empty_itineraries(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $pkg->itineraries()->createMany([
            [
                'day_number' => 1,
                'sort_order' => 1,
                'title' => 'Hari 1',
                'description' => 'Agenda hari pertama',
            ],
            [
                'day_number' => 2,
                'sort_order' => 2,
                'title' => 'Hari 2',
                'description' => 'Agenda hari kedua',
            ],
        ]);

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'slug' => $pkg->slug,
                'name' => $pkg->name,
                'package_type' => $pkg->package_type,
                'departure_city' => $pkg->departure_city,
                'duration_days' => $pkg->duration_days,
                'price' => $pkg->price,
                'currency' => $pkg->currency,
                'product_ids' => [],
                'itineraries' => [],
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertSame(0, $pkg->fresh()->itineraries()->count());
    }

    public function test_it_deletes_gallery_images_when_deleting_a_package(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        Storage::disk('public')->putFileAs(
            'packages',
            UploadedFile::fake()->image('cover.jpg'),
            'cover.jpg',
        );
        Storage::disk('public')->putFileAs(
            'packages',
            UploadedFile::fake()->image('gallery-1.jpg'),
            'gallery-1.jpg',
        );

        $pkg = $this->makePackage([
            'image_path' => '/storage/packages/cover.jpg',
            'content' => [
                'gallery' => ['/storage/packages/gallery-1.jpg'],
            ],
        ]);

        $this->actingAs($user)
            ->delete(route('packages.destroy', $pkg))
            ->assertRedirect();

        Storage::disk('public')->assertMissing('packages/cover.jpg');
        Storage::disk('public')->assertMissing('packages/gallery-1.jpg');
    }

    public function test_it_updates_schedule_active_flag(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $pkg->id,
            'departure_date' => '2026-08-01',
            'return_date' => '2026-08-10',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.schedules.update', [$pkg, $schedule]), [
                'departure_date' => '2026-08-01',
                'return_date' => '2026-08-10',
                'departure_city' => 'Jakarta',
                'seats_total' => 45,
                'status' => 'open',
                'is_active' => false,
            ])
            ->assertRedirect();

        $this->assertFalse((bool) $schedule->fresh()?->is_active);
    }
}
