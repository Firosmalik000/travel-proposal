<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\Currency;
use App\Models\DepartureSchedule;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                ->has('schedules')
                ->has('calculationModes', 2));
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

        $this->actingAs($user)
            ->get(route('hpp-package.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/HppPackage/Index')
                ->has('sourceRows', 2)
                ->where('sourceRows.0.package_name', 'Package B')
                ->where('sourceRows.0.departure_date', '2026-08-10')
                ->where('sourceRows.1.package_name', 'Package A')
                ->where('sourceRows.1.departure_date', '2026-07-10'));
    }

    public function test_it_can_generate_hpp_package_with_hotel_and_product_breakdown_from_customer_room_choices(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);
        Currency::factory()->create([
            'code' => 'IDR',
            'conversion_rate' => 1,
            'is_active' => true,
        ]);
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
            'departure_schedule_id' => $schedule->id,
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
            'departure_schedule_id' => $schedule->id,
            'calculation_mode' => 'per_pax_multiplier',
            'hotel_total' => 9200000,
            'product_total' => 36000000,
            'manual_adjustment' => 1000000,
            'grand_total' => 46200000,
            'hpp_per_customer' => 5133333,
        ]);
    }

    public function test_it_converts_non_idr_product_and_hotel_prices_in_hpp_using_active_currency_rates(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);
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

        $package = TravelPackage::factory()->create([
            'code' => 'PKG-HPP-SAR',
            'name' => 'Paket HPP SAR',
            'currency' => 'IDR',
            'content' => [
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
            'departure_schedule_id' => $schedule->id,
            'hotel_total' => 4300000,
            'product_total' => 3440000,
            'grand_total' => 7740000,
            'hpp_per_customer' => 3870000,
        ]);
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
            'departure_schedule_id' => $schedule->id,
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

    /**
     * @param  array<int, string>  $actions
     */
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
