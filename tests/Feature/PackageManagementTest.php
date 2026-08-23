<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\PackageItinerary;
use App\Models\PackageVendor;
use App\Models\ProductCategory;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use App\Models\VendorPricePeriod;
use App\Support\ParticipantUploadLimit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
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
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-10',
            'seats_total' => 45,
            'seats_available' => 45,
            'booking_status' => 'open',
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
                ->where('packages.0.code', 'ASF-TEST-10')
                ->where('packages.0.images.0', '/storage/packages/cover.jpg')
                ->where('packages.0.images.1', '/storage/packages/gallery-1.jpg')
            );
    }

    public function test_it_uses_sub_pages_for_create_edit_and_detail(): void
    {
        $user = User::factory()->create();
        $package = $this->makePackage();

        $this->actingAs($user)
            ->get(route('packages.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Page')
                ->where('mode', 'create')
                ->where('package', null)
                ->has('productOptions')
                ->has('activityOptions')
                ->has('productCategories')
                ->has('vendors')
                ->where('packageImageUploadMaxKilobytes', ParticipantUploadLimit::kilobytes(4096)));

        $this->actingAs($user)
            ->get(route('packages.show', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Page')
                ->where('mode', 'detail')
                ->where('package.id', $package->id));

        $this->actingAs($user)
            ->get(route('packages.edit', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Page')
                ->where('mode', 'edit')
                ->where('package.id', $package->id));
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

    public function test_it_stores_all_in_snapshot_and_removes_covered_products(): void
    {
        $user = User::factory()->create();
        ProductCategory::query()->updateOrCreate(['key' => 'hotel'], [
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'sort_order' => 1,
            'is_active' => true,
        ]);
        ProductCategory::query()->updateOrCreate(['key' => 'tiket'], [
            'name' => ['id' => 'Tiket', 'en' => 'Ticket'],
            'sort_order' => 2,
            'is_active' => true,
        ]);
        $hotel = TravelProduct::query()->create([
            'code' => 'HTL-ALL-IN',
            'slug' => 'hotel-all-in',
            'name' => 'Hotel All In',
            'product_type' => 'hotel',
            'is_active' => true,
        ]);
        $ticket = TravelProduct::query()->create([
            'code' => 'PRD-TIKET-MANDIRI',
            'slug' => 'tiket-mandiri',
            'name' => 'Tiket Mandiri',
            'product_type' => 'tiket',
            'content' => ['price' => 5_000_000, 'currency' => 'IDR'],
            'is_active' => true,
        ]);
        $vendor = PackageVendor::factory()->create(['name' => 'Vendor Nusantara']);
        $period = VendorPricePeriod::factory()->create([
            'package_vendor_id' => $vendor->id,
            'label' => 'Agustus 2026',
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
            'currency' => 'IDR',
            'price_per_pax' => 12_000_000,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'package-all-in',
                'name' => 'Package All In',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-19',
                'seats_total' => 40,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 30_000_000,
                'currency' => 'IDR',
                'product_ids' => [$hotel->id, $ticket->id],
                'product_multipliers' => [
                    (string) $hotel->id => 3,
                    (string) $ticket->id => 1,
                ],
                'all_in' => [
                    'enabled' => true,
                    'vendor_id' => $vendor->id,
                    'period_id' => $period->id,
                    'broker_package_name' => 'Land Arrangement 10 Hari',
                    'currency' => 'IDR',
                    'price_per_pax' => 12_000_000,
                    'included_category_keys' => ['hotel'],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $package = TravelPackage::query()->where('slug', 'package-all-in')->firstOrFail();
        $this->assertSame([$ticket->id], $package->products()->pluck('products.id')->all());
        $this->assertDatabaseHas('package_all_in_configs', [
            'package_id' => $package->id,
            'package_vendor_id' => $vendor->id,
            'vendor_price_period_id' => $period->id,
            'vendor_name_snapshot' => 'Vendor Nusantara',
            'period_label_snapshot' => 'Agustus 2026',
            'price_per_pax' => 12_000_000,
        ]);

        $vendor->update(['name' => 'Nama Vendor Baru']);
        $period->update([
            'label' => 'Periode Master Berubah',
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-30',
        ]);

        $this->actingAs($user)
            ->post(route('packages.update', $package), [
                'slug' => $package->slug,
                'name' => 'Package All In Diperbarui',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-19',
                'seats_total' => 40,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 30_000_000,
                'currency' => 'IDR',
                'product_ids' => [$ticket->id],
                'all_in' => [
                    'enabled' => true,
                    'vendor_id' => $vendor->id,
                    'period_id' => $period->id,
                    'broker_package_name' => 'Land Arrangement 10 Hari',
                    'currency' => 'IDR',
                    'price_per_pax' => 12_000_000,
                    'included_category_keys' => ['hotel'],
                ],
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('package_all_in_configs', [
            'package_id' => $package->id,
            'vendor_name_snapshot' => 'Vendor Nusantara',
            'period_label_snapshot' => 'Agustus 2026',
            'period_start_snapshot' => '2026-08-01',
            'period_end_snapshot' => '2026-08-31',
        ]);
    }

    public function test_it_allows_all_in_disabled_without_included_categories(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'all-in-off',
                'name' => 'All In Off',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-19',
                'seats_total' => 40,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 30_000_000,
                'currency' => 'IDR',
                'all_in' => [
                    'enabled' => false,
                    'vendor_id' => null,
                    'period_id' => null,
                    'broker_package_name' => '',
                    'currency' => 'IDR',
                    'price_per_pax' => null,
                    'included_category_keys' => [],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $package = TravelPackage::query()->where('slug', 'all-in-off')->firstOrFail();
        $this->assertDatabaseMissing('package_all_in_configs', [
            'package_id' => $package->id,
        ]);
    }

    public function test_it_rejects_all_in_period_that_does_not_cover_package_dates(): void
    {
        $user = User::factory()->create();
        ProductCategory::query()->updateOrCreate(['key' => 'hotel'], [
            'name' => 'Hotel',
            'is_active' => true,
        ]);
        $vendor = PackageVendor::factory()->create();
        $period = VendorPricePeriod::factory()->create([
            'package_vendor_id' => $vendor->id,
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-05',
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'period-tidak-cukup',
                'name' => 'Periode Tidak Cukup',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-08-10',
                'end_date' => '2026-08-19',
                'seats_total' => 40,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 30_000_000,
                'currency' => 'IDR',
                'all_in' => [
                    'enabled' => true,
                    'vendor_id' => $vendor->id,
                    'period_id' => $period->id,
                    'broker_package_name' => 'Land Arrangement',
                    'currency' => 'SAR',
                    'price_per_pax' => 4_000,
                    'included_category_keys' => ['hotel'],
                ],
            ])
            ->assertSessionHasErrors('all_in.period_id');
    }

    public function test_it_manages_package_vendor_and_price_period_crud(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('package-vendors.store'), [
                'name' => 'Alreda International',
                'phone' => '+966 54 000 0000',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $vendor = PackageVendor::query()->where('name', 'Alreda International')->firstOrFail();
        $this->actingAs($user)
            ->post(route('package-vendors.periods.store', $vendor), [
                'label' => 'Musim Umroh 1448 H',
                'start_date' => '2026-08-01',
                'end_date' => '2026-12-15',
                'currency' => 'SAR',
                'price_per_pax' => 4_500,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $period = $vendor->pricePeriods()->firstOrFail();
        $this->actingAs($user)
            ->put(route('package-vendors.periods.update', [$vendor, $period]), [
                'label' => 'Musim Umroh 1448 H Revisi',
                'start_date' => '2026-08-01',
                'end_date' => '2026-12-31',
                'currency' => 'SAR',
                'price_per_pax' => 4_750,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vendor_price_periods', [
            'id' => $period->id,
            'label' => 'Musim Umroh 1448 H Revisi',
            'price_per_pax' => 4_750,
        ]);

        $this->actingAs($user)
            ->delete(route('package-vendors.periods.destroy', [$vendor, $period]))
            ->assertRedirect();
        $this->actingAs($user)
            ->delete(route('package-vendors.destroy', $vendor))
            ->assertRedirect();

        $this->assertDatabaseMissing('package_vendors', ['id' => $vendor->id]);
    }

    public function test_package_vendor_requires_only_name_and_phone(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('package-vendors.store'), [
                'name' => '',
                'phone' => '',
            ])
            ->assertRedirect()
            ->assertSessionHasErrors(['name', 'phone']);

        $this->actingAs($user)
            ->post(route('package-vendors.store'), [
                'name' => '  Vendor Ringkas  ',
                'phone' => '  +62 812 3456 7890  ',
                'email' => 'field-tidak-digunakan@example.com',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('package_vendors', [
            'name' => 'Vendor Ringkas',
            'phone' => '+62 812 3456 7890',
        ]);
    }

    public function test_it_serializes_product_option_prices_and_hotel_pricing(): void
    {
        $user = User::factory()->create();
        $this->makePackage();
        ProductCategory::query()->updateOrCreate(['key' => 'perlengkapan'], [
            'name' => ['id' => 'Perlengkapan', 'en' => 'Equipment'],
            'is_active' => true,
        ]);
        ProductCategory::query()->updateOrCreate(['key' => 'hotel'], [
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'is_active' => true,
        ]);
        config()->set('services.currency.live.enabled', true);
        Http::fake(['*' => Http::response([
            'result' => 'success',
            'rates' => ['IDR' => 1, 'SAR' => 0.0002],
        ])]);
        Cache::flush();

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
            ->get(route('packages.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('productOptions', 2)
                ->where('productOptions.0.hotel_info.city', 'Makkah')
                ->where('productOptions.0.currency', 'SAR')
                ->where('productOptions.0.hotel_info.pricing.0.broker_name', 'Broker A')
                ->where('productOptions.0.hotel_info.pricing.0.price', 1450)
                ->where('productOptions.1.price', 2500000)
                ->where('productOptions.1.currency', 'IDR')
                ->where('currencies.0.code', 'IDR')
                ->where('currencies.1.code', 'SAR')
                ->where('currencies.1.conversion_rate', 5000)
            );
    }

    public function test_it_only_includes_products_from_active_categories_in_package_options(): void
    {
        $user = User::factory()->create();
        $this->makePackage();

        ProductCategory::query()->updateOrCreate(['key' => 'hotel'], [
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'is_active' => true,
        ]);
        ProductCategory::query()->updateOrCreate(['key' => 'merchandise'], [
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
            ->get(route('packages.create'))
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

    public function test_it_snapshots_live_rates_for_non_idr_products_when_the_package_is_saved(): void
    {
        $user = User::factory()->create();
        config()->set('services.currency.live.enabled', true);
        config()->set('services.currency.live.endpoint', 'https://rates.test/latest/IDR');
        Cache::flush();
        Http::fakeSequence()
            ->push([
                'result' => 'success',
                'rates' => ['IDR' => 1, 'SAR' => 0.0002],
            ])
            ->push([
                'result' => 'success',
                'rates' => ['IDR' => 1, 'SAR' => 0.00025],
            ]);
        $product = TravelProduct::factory()->make([
            'code' => 'PRD-SNAPSHOT-SAR',
            'slug' => 'snapshot-sar',
            'name' => 'Product SAR',
            'product_type' => 'perlengkapan',
            'content' => ['price' => 200, 'currency' => 'SAR'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'package-snapshot-sar',
                'name' => 'Package Snapshot SAR',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 9,
                'price' => 35_000_000,
                'currency' => 'IDR',
                'product_ids' => [$product->id],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $package = TravelPackage::query()->where('slug', 'package-snapshot-sar')->firstOrFail();

        $this->assertSame(5000, data_get($package->content, 'hpp_currency_snapshots.SAR.rate_to_idr'));
        $this->assertSame('live', data_get($package->content, 'hpp_currency_snapshots.SAR.source'));

        Cache::flush();

        $this->actingAs($user)
            ->post(route('packages.update', $package), [
                'slug' => $package->slug,
                'name' => $package->name,
                'package_type' => $package->package_type,
                'departure_city' => $package->departure_city,
                'duration_days' => $package->duration_days,
                'price' => $package->price,
                'currency' => $package->currency,
                'product_ids' => [$product->id],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame(5000, data_get($package->fresh()->content, 'hpp_currency_snapshots.SAR.rate_to_idr'));
        Http::assertSentCount(1);
    }

    public function test_it_stores_server_calculated_hpp_estimate_with_the_package(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'umroh-estimasi-10',
                'name' => ['id' => 'Umroh Estimasi', 'en' => 'Estimated Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-09-16',
                'end_date' => '2026-09-25',
                'seats_total' => 45,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 35_200_000,
                'original_price' => 40_000_000,
                'currency' => 'IDR',
                'content' => [
                    'room_original_prices' => [
                        'dbl' => 39_000_000,
                        'trpl' => 38_000_000,
                        'quad' => 37_000_000,
                    ],
                    'hpp_estimate' => [
                        'customers' => ['single' => 1, 'dbl' => 2, 'trpl' => 2, 'quad' => 3],
                        'product_cost_per_customer' => 2_000_000,
                        'hotel_total' => 10_000_000,
                        'tour_leader_fee' => 3_000_000,
                        'muthawwif_fee' => 2_000_000,
                        'other_cost' => 1_000_000,
                    ],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $estimate = TravelPackage::query()
            ->where('slug', 'umroh-estimasi-10')
            ->firstOrFail()
            ->content['hpp_estimate'];

        $this->assertSame(8, $estimate['customer_count']);
        $this->assertSame(32_000_000, $estimate['grand_total']);
        $this->assertSame(268_400_000, $estimate['revenue_total']);
        $this->assertSame(236_400_000, $estimate['estimated_profit']);
    }

    public function test_it_stores_and_calculates_package_operational_costs(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'package-operasional-test',
                'name' => 'Package Operasional Test',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-10',
                'seats_total' => 4,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 1_000_000,
                'currency' => 'IDR',
                'content' => [
                    'hpp_estimate' => [
                        'customers' => ['single' => 0, 'dbl' => 0, 'trpl' => 0, 'quad' => 4],
                        'customers_is_manual' => true,
                        'operational_costs' => [
                            'overhead' => ['amount' => 100, 'mode' => 'total'],
                            'photographer' => ['count' => 1, 'daily_salary' => 20, 'days' => 2],
                            'human_resources' => [[
                                'id' => 'admin-extra',
                                'name' => 'Admin Tambahan',
                                'salary' => 30,
                            ]],
                            'tour_leader' => [
                                'count' => 1,
                                'salary_per_trip' => 50,
                                'include_hotel' => false,
                                'include_ticket_and_visa' => false,
                            ],
                            'muthawwif' => [
                                'count' => 1,
                                'daily_salary' => 10,
                                'days' => 2,
                                'currency' => 'IDR',
                                'include_hotel' => false,
                            ],
                            'marketing' => ['amount_per_pax' => 5],
                            'guide_tips' => [[
                                'id' => 'guide-local',
                                'country' => 'Indonesia',
                                'amount_per_day' => 2,
                                'days' => 3,
                                'currency' => 'IDR',
                                'mode' => 'per_pax',
                            ]],
                            'driver_tips' => [[
                                'id' => 'driver-local',
                                'country' => 'Indonesia',
                                'amount' => 6,
                                'currency' => 'IDR',
                            ]],
                        ],
                    ],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('slug', 'package-operasional-test')->firstOrFail();

        $this->assertSame(275, data_get($package->content, 'hpp_estimate.operational_total'));
        $this->assertSame(275, data_get($package->content, 'hpp_estimate.grand_total'));
        $this->assertSame(68, data_get($package->content, 'hpp_estimate.hpp_per_customer'));
        $this->assertSame('Admin Tambahan', data_get($package->content, 'hpp_estimate.operational_costs.human_resources.0.name'));
    }

    public function test_it_validates_managed_operational_cost_rows(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('packages.create'))
            ->post(route('packages.store'), [
                'slug' => 'invalid-operational-package',
                'name' => 'Invalid Operational Package',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-10',
                'seats_total' => 4,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 1_000_000,
                'currency' => 'IDR',
                'content' => [
                    'hpp_estimate' => [
                        'operational_costs' => [
                            'human_resources' => [[
                                'id' => 'missing-name',
                                'name' => '',
                                'salary' => 500_000,
                            ]],
                        ],
                    ],
                ],
            ])
            ->assertRedirect(route('packages.create'))
            ->assertSessionHasErrors('content.hpp_estimate.operational_costs.human_resources.0.name');
    }

    public function test_it_stores_product_and_hotel_breakdown_for_package_hpp_estimate(): void
    {
        $user = User::factory()->create();
        $product = new TravelProduct;
        $product->forceFill([
            'code' => 'PRD-ESTIMATE',
            'slug' => 'prd-estimate',
            'name' => 'Visa Estimate',
            'product_type' => 'visa',
            'content' => ['price' => 100_000, 'currency' => 'IDR'],
            'is_active' => true,
        ])->save();
        $hotel = new TravelProduct;
        $hotel->forceFill([
            'code' => 'HTL-ESTIMATE',
            'slug' => 'htl-estimate',
            'name' => 'Hotel Estimate',
            'product_type' => 'hotel',
            'content' => [
                'currency' => 'IDR',
                'pricing' => [
                    ['broker_name' => 'Broker A', 'room_type' => 'DBL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1_000_000],
                    ['broker_name' => 'Broker A', 'room_type' => 'TRPL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1_200_000],
                    ['broker_name' => 'Broker A', 'room_type' => 'QUAD', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1_800_000],
                ],
            ],
            'is_active' => true,
        ])->save();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'package-breakdown-estimate',
                'name' => 'Package Breakdown Estimate',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-09-16',
                'end_date' => '2026-09-25',
                'seats_total' => 8,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 10_000_000,
                'currency' => 'IDR',
                'product_ids' => [$product->id, $hotel->id],
                'product_multipliers' => [
                    (string) $product->id => 2,
                    (string) $hotel->id => 1,
                ],
                'content' => [
                    'hotel_product_brokers' => [
                        (string) $hotel->id => 'Broker A',
                    ],
                    'hpp_estimate' => [],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $estimate = TravelPackage::query()
            ->where('slug', 'package-breakdown-estimate')
            ->firstOrFail()
            ->content['hpp_estimate'];

        $this->assertSame(16, data_get($estimate, 'product_quantities.'.$product->id));
        $this->assertSame(8, data_get($estimate, 'customers.dbl'));
        $this->assertFalse(data_get($estimate, 'customers_is_manual'));
        $this->assertSame('rooms', data_get($estimate, 'hotel_allocations_unit'));
        $this->assertSame(2, data_get($estimate, 'hotel_allocations.'.$hotel->id.'.quad'));
        $this->assertSame(1_600_000, $estimate['product_total']);
        $this->assertSame(3_600_000, $estimate['hotel_total']);
        $this->assertSame(10_000_000, $estimate['tour_leader_fee']);
        $this->assertSame(450_000, $estimate['muthawwif_fee']);
        $this->assertCount(4, $estimate['items']);
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
        $pkg = $this->makePackage([
            'seats_total' => 4,
            'content' => [
                'hpp_currency_snapshots' => [
                    'IDR' => [
                        'currency' => 'IDR',
                        'rate_to_idr' => 1,
                        'source' => 'identity',
                    ],
                ],
                'hpp_estimate' => [
                    'customers' => [
                        'single' => 0,
                        'dbl' => 0,
                        'trpl' => 0,
                        'quad' => 4,
                    ],
                    'customers_is_manual' => true,
                ],
            ],
        ]);
        $product = TravelProduct::query()->create([
            'code' => 'PRD-VISA',
            'slug' => 'visa-umroh',
            'name' => ['id' => 'Visa', 'en' => 'Visa'],
            'product_type' => 'dokumen',
            'description' => ['id' => 'Visa', 'en' => 'Visa'],
            'content' => [
                'currency' => 'IDR',
                'price' => 500_000,
            ],
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
                'content' => $pkg->content,
                'is_active' => true,
            ])
            ->assertRedirect();

        $updatedPackage = $pkg->fresh();

        $this->assertEquals(1, $updatedPackage->products()->count());
        $this->assertSame(
            4,
            (int) $updatedPackage->products()->firstOrFail()->pivot->multiplier_per_pax,
        );
        $this->assertSame(8_000_000, data_get($updatedPackage->content, 'hpp_estimate.product_total'));
        $this->assertSame($product->id, data_get($updatedPackage->content, 'hpp_estimate.items.0.reference_id'));
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

    public function test_it_stores_departure_data_directly_on_a_package(): void
    {
        $pkg = $this->makePackage();

        $this->assertSame('2026-08-01', $pkg->start_date?->toDateString());
        $this->assertSame('2026-08-10', $pkg->end_date?->toDateString());
        $this->assertSame(45, $pkg->seats_total);
        $this->assertFalse(Route::has('packages.schedules.store'));
    }

    public function test_it_computes_available_package_seats_from_related_bookings(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        Booking::query()->create([
            'package_id' => $pkg->id,
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
                ->where('packages.0.seats_total', 45)
                ->where('packages.0.seats_available', 42)
            );
    }

    public function test_it_does_not_expose_schedule_update_routes(): void
    {
        $this->assertFalse(Route::has('packages.schedules.update'));
    }

    public function test_it_does_not_expose_schedule_delete_routes(): void
    {
        $this->assertFalse(Route::has('packages.schedules.destroy'));
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
        $this->get(route('packages.create'))->assertRedirect(route('login'));
        $this->get(route('packages.show', $pkg))->assertRedirect(route('login'));
        $this->get(route('packages.edit', $pkg))->assertRedirect(route('login'));
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

    public function test_it_stores_package_specific_products_and_uses_them_in_hpp(): void
    {
        $user = User::factory()->create();
        foreach (['hotel' => 'Hotel', 'tiket' => 'Tiket'] as $key => $name) {
            ProductCategory::query()->updateOrCreate(['key' => $key], [
                'name' => $name,
                'is_active' => true,
            ]);
        }
        $country = HotelCountry::query()->create([
            'name' => 'Arab Saudi',
            'is_active' => true,
        ]);
        $city = HotelCity::query()->create([
            'country_id' => $country->id,
            'name' => 'Makkah',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->post(route('packages.store'), [
            'slug' => 'package-produk-khusus',
            'name' => 'Package Produk Khusus',
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-19',
            'seats_total' => 4,
            'booking_status' => 'open',
            'duration_days' => 10,
            'price' => 20_000_000,
            'currency' => 'IDR',
            'custom_products' => [
                [
                    'client_key' => 'hotel-local',
                    'estimate_id' => -1,
                    'name' => 'Hotel Khusus Package',
                    'product_type' => 'hotel',
                    'description' => 'Tidak masuk master hotel.',
                    'currency' => 'IDR',
                    'multiplier_per_pax' => 3,
                    'country_id' => $country->id,
                    'city_id' => $city->id,
                    'country' => 'Nama dari client tidak dipercaya',
                    'city' => 'Nama dari client tidak dipercaya',
                    'pricing' => [
                        [
                            'broker_name' => 'Broker Khusus',
                            'room_type' => 'DBL',
                            'period_start' => '2026-09-01',
                            'period_end' => '2026-09-30',
                            'price' => 800_000,
                        ],
                        [
                            'broker_name' => 'Broker Khusus',
                            'room_type' => 'TRPL',
                            'period_start' => '2026-09-01',
                            'period_end' => '2026-09-30',
                            'price' => 900_000,
                        ],
                        [
                            'broker_name' => 'Broker Khusus',
                            'room_type' => 'QUAD',
                            'period_start' => '2026-09-01',
                            'period_end' => '2026-09-30',
                            'price' => 1_000_000,
                        ],
                    ],
                ],
                [
                    'client_key' => 'ticket-local',
                    'estimate_id' => -2,
                    'name' => 'Tiket Charter Khusus',
                    'product_type' => 'tiket',
                    'currency' => 'IDR',
                    'price' => 2_000_000,
                    'multiplier_per_pax' => 2,
                ],
            ],
            'content' => [
                'hotel_product_brokers' => ['-1' => 'Broker Khusus'],
                'hpp_estimate' => [
                    'customers' => ['single' => 0, 'dbl' => 0, 'trpl' => 0, 'quad' => 4],
                    'customers_is_manual' => true,
                    'hotel_allocations' => ['-1' => ['dbl' => 0, 'trpl' => 0, 'quad' => 1]],
                    'hotel_allocations_is_manual' => ['-1' => true],
                ],
            ],
            'is_featured' => false,
            'is_active' => true,
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();

        $package = TravelPackage::query()->where('slug', 'package-produk-khusus')->firstOrFail();
        $products = $package->ownedProducts()->orderBy('product_type')->get();
        $hotel = $products->firstWhere('product_type', 'hotel');
        $ticket = $products->firstWhere('product_type', 'tiket');

        $this->assertCount(2, $products);
        $this->assertNotNull($hotel);
        $this->assertNotNull($ticket);
        $this->assertSame($package->id, $hotel->package_id);
        $this->assertSame($country->id, data_get($hotel->content, 'country_id'));
        $this->assertSame($city->id, data_get($hotel->content, 'city_id'));
        $this->assertSame('Arab Saudi', data_get($hotel->content, 'country'));
        $this->assertSame('Makkah', data_get($hotel->content, 'city'));
        $this->assertSame(3, (int) $package->products()->whereKey($hotel->id)->firstOrFail()->pivot->multiplier_per_pax);
        $this->assertSame(2, (int) $package->products()->whereKey($ticket->id)->firstOrFail()->pivot->multiplier_per_pax);
        $this->assertSame('Broker Khusus', data_get($package->content, 'hotel_product_brokers.'.$hotel->id));
        $this->assertSame(3, data_get($package->content, 'hpp_estimate.items.0.meta.multiplier_per_pax'));
        $this->assertSame(3_000_000, data_get($package->content, 'hpp_estimate.hotel_total'));
        $this->assertSame(16_000_000, data_get($package->content, 'hpp_estimate.product_total'));
        $this->assertFalse(TravelProduct::query()->whereKey($hotel->id)->exists());

        $this->actingAs($user)
            ->post(route('packages.update', $package), [
                'slug' => $package->slug,
                'name' => $package->name,
                'package_type' => $package->package_type,
                'departure_city' => $package->departure_city,
                'start_date' => $package->start_date?->toDateString(),
                'end_date' => $package->end_date?->toDateString(),
                'seats_total' => $package->seats_total,
                'booking_status' => $package->booking_status,
                'duration_days' => $package->duration_days,
                'price' => $package->price,
                'currency' => $package->currency,
                'custom_products' => [
                    [
                        'id' => $hotel->id,
                        'client_key' => (string) $hotel->id,
                        'estimate_id' => $hotel->id,
                        'name' => 'Hotel Khusus Diperbarui',
                        'product_type' => 'hotel',
                        'currency' => 'IDR',
                        'multiplier_per_pax' => 2,
                        'country_id' => $country->id,
                        'city_id' => $city->id,
                        'pricing' => [[
                            'broker_name' => 'Broker Khusus',
                            'room_type' => 'QUAD',
                            'period_start' => '2026-09-01',
                            'period_end' => '2026-09-30',
                            'price' => 1_200_000,
                        ]],
                    ],
                    [
                        'id' => $ticket->id,
                        'client_key' => (string) $ticket->id,
                        'estimate_id' => $ticket->id,
                        'name' => 'Tiket Charter Khusus',
                        'product_type' => 'tiket',
                        'currency' => 'IDR',
                        'price' => 2_000_000,
                        'multiplier_per_pax' => 2,
                    ],
                ],
                'content' => [
                    'hotel_product_brokers' => [(string) $hotel->id => 'Broker Khusus'],
                    'hpp_estimate' => [
                        'customers' => ['single' => 0, 'dbl' => 0, 'trpl' => 0, 'quad' => 4],
                        'customers_is_manual' => true,
                        'hotel_allocations' => [(string) $hotel->id => ['dbl' => 0, 'trpl' => 0, 'quad' => 1]],
                        'hotel_allocations_is_manual' => [(string) $hotel->id => true],
                    ],
                ],
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $updatedPackage = $package->fresh();
        $updatedHotel = TravelProduct::query()
            ->includingPackageSpecific()
            ->findOrFail($hotel->id);

        $this->assertSame('Hotel Khusus Diperbarui', $updatedHotel->name);
        $this->assertCount(2, $updatedPackage->ownedProducts()->get());
        $this->assertSame(2, (int) $updatedPackage->products()->whereKey($hotel->id)->firstOrFail()->pivot->multiplier_per_pax);
        $this->assertSame(2_400_000, data_get($updatedPackage->content, 'hpp_estimate.hotel_total'));
    }

    public function test_package_specific_products_are_isolated_updated_and_deleted_with_their_package(): void
    {
        $user = User::factory()->create();
        ProductCategory::query()->updateOrCreate(['key' => 'tiket'], [
            'name' => 'Tiket',
            'is_active' => true,
        ]);
        $country = HotelCountry::query()->create([
            'name' => 'Arab Saudi',
            'is_active' => true,
        ]);
        $city = HotelCity::query()->create([
            'country_id' => $country->id,
            'name' => 'Madinah',
            'is_active' => true,
        ]);
        $firstPackage = $this->makePackage(['slug' => 'package-pertama']);
        $secondPackage = $this->makePackage([
            'code' => 'ASF-TEST-SECOND',
            'slug' => 'package-kedua',
        ]);
        $specificProduct = TravelProduct::query()->includingPackageSpecific()->create([
            'code' => 'PKG-ISOLATED-TEST',
            'slug' => 'produk-khusus-isolated-test',
            'name' => 'Produk Khusus Lama',
            'product_type' => 'tiket',
            'visibility' => 'package',
            'package_id' => $firstPackage->id,
            'content' => ['currency' => 'IDR', 'price' => 1_000_000],
            'is_active' => true,
        ]);
        $firstPackage->products()->attach($specificProduct->id, ['multiplier_per_pax' => 1]);

        $this->actingAs($user)
            ->get(route('packages.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('productOptions', fn ($options) => collect($options)
                    ->doesntContain('id', $specificProduct->id))
                ->where('hotelCountries.0.id', $country->id)
                ->where('hotelCountries.0.name', 'Arab Saudi')
                ->where('hotelCities.0.id', $city->id)
                ->where('hotelCities.0.country_id', $country->id));

        $this->actingAs($user)
            ->post(route('packages.update', $secondPackage), [
                'slug' => $secondPackage->slug,
                'name' => $secondPackage->name,
                'package_type' => $secondPackage->package_type,
                'departure_city' => $secondPackage->departure_city,
                'start_date' => $secondPackage->start_date?->toDateString(),
                'end_date' => $secondPackage->end_date?->toDateString(),
                'seats_total' => $secondPackage->seats_total,
                'booking_status' => $secondPackage->booking_status,
                'duration_days' => $secondPackage->duration_days,
                'price' => $secondPackage->price,
                'currency' => $secondPackage->currency,
                'custom_products' => [[
                    'id' => $specificProduct->id,
                    'client_key' => (string) $specificProduct->id,
                    'estimate_id' => $specificProduct->id,
                    'name' => 'Percobaan Mengambil Produk',
                    'product_type' => 'tiket',
                    'currency' => 'IDR',
                    'price' => 2_000_000,
                    'multiplier_per_pax' => 1,
                ]],
                'is_active' => true,
            ])
            ->assertSessionHasErrors('custom_products.0.id');

        $this->assertSame('Produk Khusus Lama', $specificProduct->fresh()->name);

        $this->actingAs($user)
            ->delete(route('packages.destroy', $firstPackage))
            ->assertRedirect();

        $this->assertFalse(TravelProduct::query()
            ->includingPackageSpecific()
            ->whereKey($specificProduct->id)
            ->exists());
    }

    public function test_it_rejects_invalid_master_references_for_package_specific_products(): void
    {
        $user = User::factory()->create();
        ProductCategory::query()->updateOrCreate(['key' => 'hotel'], [
            'name' => 'Hotel',
            'is_active' => true,
        ]);
        $saudi = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $indonesia = HotelCountry::query()->create(['name' => 'Indonesia', 'is_active' => true]);
        $makkah = HotelCity::query()->create([
            'country_id' => $saudi->id,
            'name' => 'Makkah',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'slug' => 'package-invalid-custom-reference',
                'name' => 'Package Invalid Custom Reference',
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'start_date' => '2026-09-10',
                'end_date' => '2026-09-19',
                'seats_total' => 4,
                'booking_status' => 'open',
                'duration_days' => 10,
                'price' => 20_000_000,
                'currency' => 'IDR',
                'custom_products' => [[
                    'client_key' => 'hotel-invalid',
                    'estimate_id' => -1,
                    'name' => 'Hotel Invalid',
                    'product_type' => 'hotel',
                    'currency' => 'XYZ',
                    'multiplier_per_pax' => 1,
                    'country_id' => $indonesia->id,
                    'city_id' => $makkah->id,
                    'pricing' => [[
                        'broker_name' => 'Broker 1',
                        'room_type' => 'DBL',
                        'period_start' => '2026-09-01',
                        'period_end' => '2026-09-30',
                        'price' => 1_000_000,
                    ]],
                ]],
                'is_active' => true,
            ])
            ->assertSessionHasErrors([
                'custom_products.0.currency',
                'custom_products.0.city_id',
            ]);

        $this->assertFalse(TravelPackage::query()
            ->where('slug', 'package-invalid-custom-reference')
            ->exists());
    }

    public function test_it_uses_package_booking_status_instead_of_schedule_active_flag(): void
    {
        $pkg = $this->makePackage();
        $pkg->update(['booking_status' => 'closed']);

        $this->assertSame('closed', $pkg->fresh()?->booking_status);
    }
}
