<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\PackageAllInConfig;
use App\Models\PackageCostCalculation;
use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use App\Models\VendorPricePeriod;
use App\Services\PackageCostCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class HppPackageManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(LogAdminActivityMiddleware::class);
    }

    public function test_it_can_open_hpp_package_page(): void
    {
        $user = $this->createUserWithHppPermissions(['view']);

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/HppPackage/Index')
                ->has('rows')
                ->has('packages')
                ->has('calculationModes', 2));
    }

    public function test_user_with_edit_permission_can_open_package_hpp_estimate_editor(): void
    {
        $user = $this->createUserWithHppPermissions(['edit']);
        $package = TravelPackage::factory()->create();

        $this->actingAs($user)
            ->get(route('hpp-package.estimate.edit', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Page')
                ->where('mode', 'hpp')
                ->where('package.id', $package->id));
    }

    public function test_user_without_edit_permission_cannot_open_package_hpp_estimate_editor(): void
    {
        $user = $this->createUserWithHppPermissions(['view']);
        $package = TravelPackage::factory()->create();

        $this->actingAs($user)
            ->get(route('hpp-package.estimate.edit', $package))
            ->assertForbidden();
    }

    public function test_hpp_estimate_update_preserves_non_financial_package_data(): void
    {
        $user = $this->createUserWithHppPermissions(['edit']);
        $package = TravelPackage::factory()->create([
            'name' => 'Package Tetap',
            'departure_city' => 'Jakarta',
            'price' => 20_000_000,
            'original_price' => null,
            'currency' => 'IDR',
            'image_path' => '/storage/packages/cover.jpg',
            'content' => [
                'gallery' => ['/storage/packages/gallery.jpg'],
                'public_note' => 'Tidak boleh berubah',
                'hpp_currency_snapshots' => [
                    'IDR' => [
                        'currency' => 'IDR',
                        'rate_to_idr' => 1,
                        'source' => 'identity',
                        'fetched_at' => null,
                    ],
                ],
            ],
        ]);
        $specificProduct = TravelProduct::factory()->create([
            'name' => 'Tiket Khusus HPP',
            'product_type' => 'tiket',
            'visibility' => TravelProduct::VISIBILITY_PACKAGE,
            'package_id' => $package->id,
            'content' => [
                'currency' => 'IDR',
                'price' => 2_000_000,
            ],
            'is_active' => true,
        ]);
        $package->products()->attach($specificProduct->id, [
            'sort_order' => 1,
            'multiplier_per_pax' => 2,
        ]);

        $payload = [
            'slug' => $package->slug,
            'name' => 'Nama yang tidak boleh tersimpan',
            'package_type' => $package->package_type,
            'departure_city' => 'Surabaya',
            'start_date' => $package->start_date->toDateString(),
            'end_date' => $package->end_date->toDateString(),
            'seats_total' => $package->seats_total,
            'booking_status' => $package->booking_status,
            'duration_days' => $package->duration_days,
            'price' => 25_000_000,
            'original_price' => 30_000_000,
            'discount_label' => 'HPP TEST',
            'currency' => 'IDR',
            'content' => [
                'public_note' => 'Diubah dari request HPP',
                'gallery' => [],
                'room_original_prices' => [
                    'dbl' => 31_000_000,
                    'trpl' => 32_000_000,
                    'quad' => 33_000_000,
                ],
                'hpp_currency_snapshots' => [
                    'IDR' => [
                        'currency' => 'IDR',
                        'rate_to_idr' => 1,
                        'source' => 'identity',
                        'fetched_at' => null,
                    ],
                ],
                'hpp_estimate' => [
                    'customers' => [
                        'single' => 0,
                        'dbl' => $package->seats_total,
                        'trpl' => 0,
                        'quad' => 0,
                    ],
                    'customers_is_manual' => false,
                    'other_cost' => 1_000_000,
                ],
            ],
            'product_ids' => [],
            'product_multipliers' => [],
            'custom_products' => [],
            'itineraries' => [],
            'all_in' => ['enabled' => false],
            'is_featured' => false,
            'is_active' => true,
        ];

        $this->actingAs($user)
            ->post(route('hpp-package.estimate.update', $package), $payload)
            ->assertRedirect(route('hpp-package.index'))
            ->assertSessionHas('success');

        $package->refresh();

        $this->assertSame('Package Tetap', $package->name);
        $this->assertSame('Jakarta', $package->departure_city);
        $this->assertSame('/storage/packages/cover.jpg', $package->image_path);
        $this->assertSame(['/storage/packages/gallery.jpg'], data_get($package->content, 'gallery'));
        $this->assertSame('Tidak boleh berubah', data_get($package->content, 'public_note'));
        $this->assertSame(25_000_000.0, (float) $package->price);
        $this->assertSame(30_000_000.0, (float) $package->original_price);
        $this->assertSame(1_000_000, data_get($package->content, 'hpp_estimate.other_cost'));
        $this->assertSame(
            $specificProduct->id,
            data_get($package->content, 'hpp_estimate.items.0.reference_id'),
        );
        $this->assertSame(
            2_000_000 * $package->seats_total * 2,
            data_get($package->content, 'hpp_estimate.product_total'),
        );
    }

    public function test_hpp_drawer_recalculates_estimate_with_package_specific_products(): void
    {
        $user = $this->createUserWithHppPermissions(['view', 'edit']);
        $package = TravelPackage::factory()->create([
            'name' => 'Package Produk Khusus',
            'currency' => 'IDR',
            'price' => 25_000_000,
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
                    'product_total' => 0,
                    'grand_total' => 0,
                ],
            ],
        ]);
        $specificProduct = TravelProduct::factory()->create([
            'name' => 'Perlengkapan Khusus Drawer',
            'product_type' => 'perlengkapan',
            'visibility' => TravelProduct::VISIBILITY_PACKAGE,
            'package_id' => $package->id,
            'content' => [
                'currency' => 'IDR',
                'price' => 500_000,
            ],
            'is_active' => true,
        ]);
        $package->products()->attach($specificProduct->id, [
            'sort_order' => 1,
            'multiplier_per_pax' => 2,
        ]);

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('sourceRows.0.hpp_estimate.product_total', 4_000_000)
                ->where('sourceRows.0.hpp_estimate.items.0.reference_id', $specificProduct->id)
                ->where('sourceRows.0.hpp_estimate.items.0.label', 'Perlengkapan Khusus Drawer'));

        $this->actingAs($user)
            ->get(route('hpp-package.estimate.edit', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('package.content.hpp_estimate.product_total', 4_000_000)
                ->where('package.content.hpp_estimate.items.0.reference_id', $specificProduct->id));
    }

    public function test_it_orders_hpp_package_rows_by_latest_departure_schedule_and_shows_package_name(): void
    {
        $user = $this->createUserWithHppPermissions(['view']);

        $packageA = TravelPackage::factory()->create([
            'code' => 'PKG-A',
            'name' => [
                'id' => 'Package A',
                'en' => 'Package A',
            ],
            'currency' => 'IDR',
            'start_date' => '2026-07-10',
            'content' => [],
        ]);
        $scheduleA = DepartureSchedule::query()->create([
            'package_id' => $packageA->id,
            'departure_date' => '2026-07-10',
            'return_date' => '2026-07-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $packageB = TravelPackage::factory()->create([
            'code' => 'PKG-B',
            'name' => [
                'id' => 'Package B',
                'en' => 'Package B',
            ],
            'currency' => 'IDR',
            'start_date' => '2026-08-10',
            'content' => [],
        ]);
        $scheduleB = DepartureSchedule::query()->create([
            'package_id' => $packageB->id,
            'departure_date' => '2026-08-10',
            'return_date' => '2026-08-20',
            'departure_city' => 'Madinah',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-A-001',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah A',
            'phone' => '08123456781',
            'email' => 'a@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'room_configuration' => [
                'single' => 0,
                'double' => 1,
                'triple' => 0,
                'quad' => 0,
            ],
            'status' => 'registered',
            'package_id' => $packageA->id,
            'departure_schedule_id' => $scheduleA->id,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-B-001',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah B',
            'phone' => '08123456782',
            'email' => 'b@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 3,
            'room_configuration' => [
                'single' => 0,
                'double' => 1,
                'triple' => 0,
                'quad' => 0,
            ],
            'status' => 'registered',
            'package_id' => $packageB->id,
            'departure_schedule_id' => $scheduleB->id,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-B-PENDING',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah Pending',
            'phone' => '08123456783',
            'email' => 'pending@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 10,
            'status' => 'pending',
            'package_id' => $packageB->id,
            'departure_schedule_id' => $scheduleB->id,
        ]);

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/HppPackage/Index')
                ->has('sourceRows', 2)
                ->where('sourceRows.0.package_name', 'Package B')
                ->where('sourceRows.0.departure_date', '2026-08-10')
                ->where('sourceRows.0.total_bookings', 1)
                ->where('sourceRows.0.total_customers', 3)
                ->where('sourceRows.1.package_name', 'Package A')
                ->where('sourceRows.1.departure_date', '2026-07-10'));
    }

    public function test_it_shows_package_estimate_even_when_the_schedule_has_no_booking(): void
    {
        $user = $this->createUserWithHppPermissions(['view']);
        $package = TravelPackage::factory()->create([
            'name' => 'Package Persiapan',
            'content' => [
                'hpp_estimate' => [
                    'customer_count' => 40,
                    'product_cost_per_customer' => 5_000_000,
                    'product_total' => 200_000_000,
                    'hotel_total' => 100_000_000,
                    'tour_leader_fee' => 10_000_000,
                    'muthawwif_fee' => 5_000_000,
                    'other_cost' => 0,
                    'revenue_total' => 1_400_000_000,
                    'grand_total' => 315_000_000,
                    'hpp_per_customer' => 7_875_000,
                    'estimated_profit' => 1_085_000_000,
                    'notes' => null,
                ],
            ],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-12-10',
            'return_date' => '2026-12-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('sourceRows', 1)
                ->where('sourceRows.0.total_bookings', 0)
                ->where('sourceRows.0.total_customers', 0)
                ->where('sourceRows.0.latest_calculation.is_saved', false)
                ->where('sourceRows.0.hpp_estimate.grand_total', 315_000_000));

        PackageCostCalculation::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'legacy_assignment',
            'calculation_date' => now()->toDateString(),
            'booking_count' => 0,
            'customer_count' => 0,
            'hotel_total' => 0,
            'product_total' => 0,
            'manual_adjustment' => 0,
            'grand_total' => 0,
            'hpp_per_customer' => null,
            'currency' => 'IDR',
            'warnings' => [],
            'calculated_at' => now()->subMinute(),
        ]);

        PackageCostCalculation::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'legacy_assignment',
            'calculation_date' => now()->toDateString(),
            'booking_count' => 0,
            'customer_count' => 0,
            'hotel_total' => 123_000,
            'product_total' => 0,
            'manual_adjustment' => 0,
            'grand_total' => 123_000,
            'hpp_per_customer' => null,
            'currency' => 'IDR',
            'warnings' => [],
            'calculated_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('sourceRows.0.latest_calculation.is_saved', true)
                ->where('sourceRows.0.latest_calculation.grand_total', 0));
    }

    public function test_it_can_generate_hpp_package_with_hotel_and_product_breakdown_from_customer_room_choices(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);
        $package = TravelPackage::factory()->create([
            'code' => 'PKG-HPP-01',
            'name' => 'Paket HPP',
            'currency' => 'IDR',
            'content' => [
                'hotel_product_brokers' => [
                    '1' => 'Broker B',
                ],
            ],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-07-10',
            'return_date' => '2026-07-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $hotelProduct = TravelProduct::query()->create([
            'code' => 'PRD-HOTEL-01',
            'slug' => 'prd-hotel-01',
            'name' => 'Hotel Product',
            'product_type' => 'hotel',
            'content' => [
                'pricing' => [
                    [
                        'broker_key' => 'broker-a',
                        'broker_name' => 'Broker A',
                        'room_type' => 'Double',
                        'period_start' => '2026-07-01',
                        'period_end' => '2026-07-31',
                        'price' => 3000000,
                    ],
                    [
                        'broker_key' => 'broker-b',
                        'broker_name' => 'Broker B',
                        'room_type' => 'Double',
                        'period_start' => '2026-07-01',
                        'period_end' => '2026-07-31',
                        'price' => 3200000,
                    ],
                    [
                        'broker_key' => 'broker-b',
                        'broker_name' => 'Broker B',
                        'room_type' => 'Triple',
                        'period_start' => '2026-07-01',
                        'period_end' => '2026-07-31',
                        'price' => 2800000,
                    ],
                    [
                        'broker_key' => 'broker-b',
                        'broker_name' => 'Broker B',
                        'room_type' => 'Quad',
                        'period_start' => '2026-07-01',
                        'period_end' => '2026-07-31',
                        'price' => 2500000,
                    ],
                ],
            ],
            'is_active' => true,
        ]);
        $visaProduct = TravelProduct::query()->create([
            'code' => 'PRD-VISA-01',
            'slug' => 'prd-visa-01',
            'name' => 'Visa',
            'product_type' => 'visa',
            'content' => ['price' => 2000000, 'currency' => 'IDR'],
            'is_active' => true,
        ]);
        $package->products()->sync([
            $hotelProduct->id => ['sort_order' => 1, 'multiplier_per_pax' => 1],
            $visaProduct->id => ['sort_order' => 2, 'multiplier_per_pax' => 2],
        ]);
        $package->update([
            'content' => [
                'hotel_product_brokers' => [
                    (string) $hotelProduct->id => 'Broker B',
                ],
            ],
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-HPP-001',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah A',
            'phone' => '08123456789',
            'email' => 'jamaah@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 6,
            'room_configuration' => [
                'single' => 0,
                'double' => 2,
                'triple' => 0,
                'quad' => 0,
            ],
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
        ]);
        Booking::query()->create([
            'booking_code' => 'BK-HPP-002',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah B',
            'phone' => '08123456780',
            'email' => 'jamaah-b@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 3,
            'room_configuration' => [
                'single' => 0,
                'double' => 0,
                'triple' => 1,
                'quad' => 0,
            ],
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.store'), [
                'travel_package_id' => $package->id,
                'departure_schedule_id' => $schedule->id,
                'calculation_mode' => 'per_pax_multiplier',
                'manual_adjustment' => 1000000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'per_pax_multiplier',
            'hotel_total' => 9200000,
            'product_total' => 36000000,
            'manual_adjustment' => 1000000,
            'grand_total' => 46200000,
            'hpp_per_customer' => 5133333,
        ]);
    }

    public function test_it_converts_non_idr_product_and_hotel_prices_using_the_rate_saved_on_the_package(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);

        $package = TravelPackage::factory()->create([
            'code' => 'PKG-HPP-SAR',
            'name' => 'Paket HPP SAR',
            'currency' => 'IDR',
            'content' => [
                'hpp_currency_snapshots' => [
                    'IDR' => [
                        'currency' => 'IDR',
                        'rate_to_idr' => 1,
                        'source' => 'identity',
                        'fetched_at' => '2026-08-01 08:00:00',
                    ],
                    'SAR' => [
                        'currency' => 'SAR',
                        'rate_to_idr' => 5000,
                        'source' => 'live',
                        'fetched_at' => '2026-08-01 08:00:00',
                    ],
                ],
                'hotel_product_brokers' => [
                    '1' => 'Broker SAR',
                ],
            ],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-08-10',
            'return_date' => '2026-08-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $hotelProduct = TravelProduct::query()->create([
            'code' => 'PRD-HOTEL-SAR',
            'slug' => 'prd-hotel-sar',
            'name' => 'Hotel SAR',
            'product_type' => 'hotel',
            'content' => [
                'currency' => 'SAR',
                'pricing' => [
                    [
                        'broker_name' => 'Broker SAR',
                        'room_type' => 'Double',
                        'period_start' => '2026-08-01',
                        'period_end' => '2026-08-31',
                        'price' => 1000,
                    ],
                ],
            ],
            'is_active' => true,
        ]);
        $equipmentProduct = TravelProduct::query()->create([
            'code' => 'PRD-EQ-SAR',
            'slug' => 'prd-eq-sar',
            'name' => 'Perlengkapan SAR',
            'product_type' => 'perlengkapan',
            'content' => [
                'price' => 200,
                'currency' => 'SAR',
            ],
            'is_active' => true,
        ]);

        $package->products()->sync([
            $hotelProduct->id => ['sort_order' => 1, 'multiplier_per_pax' => 1],
            $equipmentProduct->id => ['sort_order' => 2, 'multiplier_per_pax' => 2],
        ]);
        $package->update([
            'content' => [
                'hpp_currency_snapshots' => [
                    'IDR' => [
                        'currency' => 'IDR',
                        'rate_to_idr' => 1,
                        'source' => 'identity',
                        'fetched_at' => '2026-08-01 08:00:00',
                    ],
                    'SAR' => [
                        'currency' => 'SAR',
                        'rate_to_idr' => 5000,
                        'source' => 'live',
                        'fetched_at' => '2026-08-01 08:00:00',
                    ],
                ],
                'hotel_product_brokers' => [
                    (string) $hotelProduct->id => 'Broker SAR',
                ],
            ],
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-HPP-SAR-001',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah SAR',
            'phone' => '08123456781',
            'email' => 'sar@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'room_configuration' => [
                'single' => 0,
                'double' => 1,
                'triple' => 0,
                'quad' => 0,
            ],
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.store'), [
                'travel_package_id' => $package->id,
                'departure_schedule_id' => $schedule->id,
                'calculation_mode' => 'per_pax_multiplier',
                'manual_adjustment' => 0,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'hotel_total' => 5000000,
            'product_total' => 4000000,
            'grand_total' => 9000000,
            'hpp_per_customer' => 4500000,
        ]);

        $calculation = PackageCostCalculation::query()
            ->where('package_id', $package->id)
            ->firstOrFail();

        $this->assertTrue($calculation->items->every(
            fn ($item): bool => data_get($item->meta, 'conversion_rate_to_idr') === 5000
                && data_get($item->meta, 'conversion_rate_snapshot_scope') === 'package',
        ));
    }

    public function test_it_can_generate_legacy_hpp_package_for_backup_mode(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);
        $package = TravelPackage::factory()->create([
            'currency' => 'IDR',
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-07-10',
            'return_date' => '2026-07-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);
        $product = TravelProduct::query()->create([
            'code' => 'PRD-VISA-LEGACY',
            'slug' => 'prd-visa-legacy',
            'name' => 'Visa Legacy',
            'product_type' => 'visa',
            'content' => ['price' => 1000000],
            'is_active' => true,
        ]);
        $package->products()->sync([
            $product->id => ['sort_order' => 1, 'multiplier_per_pax' => 3],
        ]);
        Booking::query()->create([
            'booking_code' => 'BK-HPP-LEGACY',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah Legacy',
            'phone' => '08123456780',
            'email' => 'legacy@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 5,
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.store'), [
                'travel_package_id' => $package->id,
                'departure_schedule_id' => $schedule->id,
                'calculation_mode' => 'legacy_assignment',
                'manual_adjustment' => 0,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'legacy_assignment',
            'product_total' => 5000000,
            'grand_total' => 5000000,
            'hpp_per_customer' => 1000000,
        ]);
    }

    public function test_it_updates_package_price_from_hpp_edit_action(): void
    {
        $user = $this->createUserWithHppPermissions(['create', 'edit']);

        $package = TravelPackage::factory()->create([
            'price' => 35000000,
            'currency' => 'IDR',
        ]);

        $calculation = PackageCostCalculation::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'legacy_assignment',
            'calculation_date' => now()->toDateString(),
            'booking_count' => 0,
            'customer_count' => 0,
            'hotel_total' => 0,
            'product_total' => 0,
            'manual_adjustment' => 0,
            'grand_total' => 0,
            'hpp_per_customer' => null,
            'currency' => 'IDR',
            'warnings' => [],
            'calculated_at' => now(),
        ]);

        $this->actingAs($user)
            ->put(route('hpp-package.update', $calculation), [
                'package_price' => 42000000,
                'notes' => 'Update harga package',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas($package->getTable(), [
            'id' => $package->id,
            'price' => 42000000,
        ]);
    }

    public function test_it_can_create_hpp_record_when_saving_fee_from_preview_state(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);

        $package = TravelPackage::factory()->create([
            'currency' => 'IDR',
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.store'), [
                'travel_package_id' => $package->id,
                'calculation_mode' => 'per_pax_multiplier',
                'manual_adjustment' => 0,
                'tour_leader_fee' => 250000,
                'muthawwif_fee' => 150000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'tour_leader_fee' => 250000,
            'muthawwif_fee' => 150000,
            'grand_total' => 400000,
            'hpp_per_customer' => null,
        ]);
    }

    public function test_it_saves_tour_leader_and_muthawwif_fees_into_hpp_total(): void
    {
        $user = $this->createUserWithHppPermissions(['edit']);

        $package = TravelPackage::factory()->create([
            'price' => 1000000,
            'currency' => 'IDR',
        ]);

        $calculation = PackageCostCalculation::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'calculation_mode' => 'legacy_assignment',
            'calculation_date' => now()->toDateString(),
            'booking_count' => 1,
            'customer_count' => 5,
            'hotel_total' => 2000000,
            'product_total' => 1000000,
            'manual_adjustment' => 0,
            'tour_leader_fee' => 0,
            'muthawwif_fee' => 0,
            'grand_total' => 3000000,
            'hpp_per_customer' => 600000,
            'currency' => 'IDR',
            'warnings' => [],
            'calculated_at' => now(),
        ]);

        $this->actingAs($user)
            ->put(route('hpp-package.update', $calculation), [
                'tour_leader_fee' => 200000,
                'muthawwif_fee' => 100000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'id' => $calculation->id,
            'tour_leader_fee' => 200000,
            'muthawwif_fee' => 100000,
            'grand_total' => 3300000,
            'hpp_per_customer' => 660000,
        ]);
    }

    public function test_recalculate_explicitly_refreshes_the_saved_package_currency_snapshot(): void
    {
        $user = $this->createUserWithHppPermissions(['edit']);
        config()->set('services.currency.live.enabled', true);
        config()->set('services.currency.live.endpoint', 'https://rates.test/latest/IDR');
        Cache::flush();
        Http::fake(['rates.test/*' => Http::response([
            'result' => 'success',
            'rates' => ['IDR' => 1, 'SAR' => 0.00025],
        ])]);

        $package = TravelPackage::factory()->create([
            'price' => 1000,
            'currency' => 'SAR',
            'content' => [
                'hpp_currency_snapshots' => [
                    'SAR' => [
                        'currency' => 'SAR',
                        'rate_to_idr' => 5000,
                        'source' => 'live',
                        'fetched_at' => '2026-08-01 08:00:00',
                    ],
                ],
            ],
        ]);
        $calculation = PackageCostCalculation::query()->create([
            'package_id' => $package->id,
            'calculation_mode' => 'legacy_assignment',
            'calculation_date' => now()->toDateString(),
            'booking_count' => 0,
            'customer_count' => 0,
            'hotel_total' => 0,
            'product_total' => 0,
            'manual_adjustment' => 0,
            'grand_total' => 0,
            'currency' => 'IDR',
            'warnings' => [],
            'calculated_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.recalculate', $calculation))
            ->assertRedirect();

        $this->assertSame(4000, data_get($package->fresh()->content, 'hpp_currency_snapshots.SAR.rate_to_idr'));
        $this->assertSame('4000.000000', $calculation->fresh()->package_conversion_rate_to_idr);
    }

    public function test_product_hotel_hpp_ignores_unsupported_room_pricing(): void
    {
        $package = TravelPackage::factory()->create([
            'currency' => 'IDR',
            'content' => [],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-09-10',
            'return_date' => '2026-09-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 39,
            'status' => 'open',
            'is_active' => true,
        ]);
        $hotelProduct = TravelProduct::query()->create([
            'code' => 'PRD-HOTEL-UNSUPPORTED-ROOM',
            'slug' => 'prd-hotel-unsupported-room',
            'name' => 'Hotel Legacy Room',
            'product_type' => 'hotel',
            'content' => [
                'currency' => 'IDR',
                'pricing' => [[
                    'broker_name' => 'Broker Legacy',
                    'room_type' => 'Single',
                    'period_start' => '2026-09-01',
                    'period_end' => '2026-09-30',
                    'price' => 5000000,
                ]],
            ],
            'is_active' => true,
        ]);
        $package->products()->attach($hotelProduct->id, [
            'sort_order' => 1,
            'multiplier_per_pax' => 1,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-UNSUPPORTED-ROOM',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah Legacy',
            'phone' => '08123456789',
            'email' => 'legacy-room@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'room_configuration' => ['single' => 1],
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
        ]);

        $payload = app(PackageCostCalculationService::class)->preview(
            $package->id,
            $schedule->id,
        );

        $this->assertSame(0, $payload['hotel_total']);
        $this->assertEmpty(collect($payload['items'])->where('cost_type', 'hotel'));
        $this->assertContains(
            'Ada konfigurasi kamar di luar Double, Triple, dan Quad yang tidak didukung pricing Product Hotel.',
            $payload['warnings'],
        );
    }

    /**
     * @param  array<int, string>  $actions
     */
    public function test_actual_hpp_converts_all_in_to_idr_without_counting_covered_products(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-08-10',
            'end_date' => '2026-08-19',
            'content' => [
                'hpp_currency_snapshots' => [
                    'IDR' => ['currency' => 'IDR', 'rate_to_idr' => 1, 'source' => 'identity'],
                    'SAR' => ['currency' => 'SAR', 'rate_to_idr' => 4_000, 'source' => 'snapshot'],
                ],
            ],
        ]);
        $hotel = TravelProduct::query()->create([
            'code' => 'HTL-VENDOR-COVERED',
            'slug' => 'hotel-vendor-covered',
            'name' => 'Hotel Vendor Covered',
            'product_type' => 'hotel',
            'content' => ['currency' => 'IDR', 'pricing' => []],
            'is_active' => true,
        ]);
        $ticket = TravelProduct::query()->create([
            'code' => 'PRD-TICKET-ACTUAL',
            'slug' => 'ticket-actual',
            'name' => 'Tiket Actual',
            'product_type' => 'tiket',
            'content' => ['currency' => 'IDR', 'price' => 50_000],
            'is_active' => true,
        ]);
        $package->products()->sync([
            $hotel->id => ['sort_order' => 1, 'multiplier_per_pax' => 3],
            $ticket->id => ['sort_order' => 2, 'multiplier_per_pax' => 1],
        ]);
        $vendor = PackageVendor::factory()->create(['name' => 'Vendor HPP']);
        $period = VendorPricePeriod::factory()->create([
            'package_vendor_id' => $vendor->id,
            'currency' => 'SAR',
            'price_per_pax' => 100,
        ]);
        PackageAllInConfig::factory()->create([
            'package_id' => $package->id,
            'package_vendor_id' => $vendor->id,
            'vendor_price_period_id' => $period->id,
            'currency' => 'SAR',
            'price_per_pax' => 100,
            'included_category_keys' => ['hotel'],
            'vendor_name_snapshot' => 'Vendor HPP',
        ]);
        Booking::factory()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'passenger_count' => 2,
            'room_configuration' => ['double' => 1],
            'status' => 'registered',
        ]);

        $preview = app(PackageCostCalculationService::class)->preview(
            $package->id,
            null,
            calculationMode: PackageCostCalculationService::MODE_PER_PAX_MULTIPLIER,
        );

        $this->assertSame(0, $preview['hotel_total']);
        $this->assertSame(900_000, $preview['product_total']);
        $this->assertSame(900_000, $preview['grand_total']);
        $this->assertSame(800_000, collect($preview['items'])->firstWhere('cost_type', 'all_in')['total_price']);
        $this->assertNull(collect($preview['items'])->firstWhere('cost_type', 'hotel'));
    }

    public function test_actual_hpp_calculates_package_specific_products_with_the_regular_product_flow(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => '2026-09-10',
            'end_date' => '2026-09-19',
            'content' => [
                'hpp_currency_snapshots' => [
                    'IDR' => ['currency' => 'IDR', 'rate_to_idr' => 1, 'source' => 'identity'],
                ],
            ],
        ]);
        $hotel = TravelProduct::query()->includingPackageSpecific()->create([
            'code' => 'PKG-HOTEL-ACTUAL',
            'slug' => 'pkg-hotel-actual',
            'name' => 'Hotel Khusus Actual',
            'product_type' => 'hotel',
            'visibility' => TravelProduct::VISIBILITY_PACKAGE,
            'package_id' => $package->id,
            'content' => [
                'currency' => 'IDR',
                'pricing' => [[
                    'broker_name' => 'Broker Package',
                    'room_type' => 'QUAD',
                    'period_start' => '2026-09-01',
                    'period_end' => '2026-09-30',
                    'price' => 1_000_000,
                ]],
            ],
            'is_active' => true,
        ]);
        $ticket = TravelProduct::query()->includingPackageSpecific()->create([
            'code' => 'PKG-TICKET-ACTUAL',
            'slug' => 'pkg-ticket-actual',
            'name' => 'Tiket Khusus Actual',
            'product_type' => 'tiket',
            'visibility' => TravelProduct::VISIBILITY_PACKAGE,
            'package_id' => $package->id,
            'content' => ['currency' => 'IDR', 'price' => 2_000_000],
            'is_active' => true,
        ]);
        $package->products()->sync([
            $hotel->id => ['sort_order' => 1, 'multiplier_per_pax' => 3],
            $ticket->id => ['sort_order' => 2, 'multiplier_per_pax' => 2],
        ]);
        $package->update([
            'content' => [
                'hotel_product_brokers' => [(string) $hotel->id => 'Broker Package'],
                'hpp_currency_snapshots' => [
                    'IDR' => ['currency' => 'IDR', 'rate_to_idr' => 1, 'source' => 'identity'],
                ],
            ],
        ]);
        Booking::factory()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'passenger_count' => 4,
            'room_configuration' => ['quad' => 1],
            'status' => 'registered',
        ]);

        $preview = app(PackageCostCalculationService::class)->preview(
            $package->id,
            null,
            calculationMode: PackageCostCalculationService::MODE_PER_PAX_MULTIPLIER,
        );

        $this->assertSame(3_000_000, $preview['hotel_total']);
        $this->assertSame(16_000_000, $preview['product_total']);
        $this->assertSame(19_000_000, $preview['grand_total']);
        $this->assertSame($hotel->id, collect($preview['items'])->firstWhere('cost_type', 'hotel')['reference_id']);
        $this->assertSame($ticket->id, collect($preview['items'])->firstWhere('cost_type', 'product')['reference_id']);
    }

    private function createUserWithHppPermissions(array $actions): User
    {
        $user = User::factory()->create();

        foreach ($actions as $action) {
            $permission = Permission::query()->firstOrCreate([
                'name' => 'menu.hpp_package.'.$action,
                'guard_name' => 'web',
            ]);
            $user->givePermissionTo($permission);
        }

        return $user;
    }
}
