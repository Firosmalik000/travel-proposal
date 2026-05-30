<?php

namespace Tests\Feature;

use App\Http\Middleware\LogAdminActivityMiddleware;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\Hotel;
use App\Models\HotelAssignment;
use App\Models\HotelAssignmentRoom;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelPrice;
use App\Models\HotelRoomType;
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
                ->has('schedules'));
    }

    public function test_it_can_generate_hpp_package_with_hotel_and_product_breakdown(): void
    {
        $user = $this->createUserWithHppPermissions(['create']);
        $package = TravelPackage::factory()->create([
            'code' => 'PKG-HPP-01',
            'name' => 'Paket HPP',
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

        $hotelProduct = TravelProduct::query()->create([
            'code' => 'PRD-HOTEL-01',
            'slug' => 'prd-hotel-01',
            'name' => 'Hotel Product',
            'product_type' => 'hotel',
            'content' => ['price' => null],
            'is_active' => true,
        ]);
        $visaProduct = TravelProduct::query()->create([
            'code' => 'PRD-VISA-01',
            'slug' => 'prd-visa-01',
            'name' => 'Visa',
            'product_type' => 'visa',
            'content' => ['price' => 2000000],
            'is_active' => true,
        ]);
        $package->products()->sync([
            $hotelProduct->id => ['sort_order' => 1],
            $visaProduct->id => ['sort_order' => 2],
        ]);

        $country = HotelCountry::query()->create(['name' => 'Saudi Arabia', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Makkah', 'is_active' => true]);
        $roomType = HotelRoomType::query()->create(['name' => 'Double', 'is_active' => true]);
        $hotel = Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'product_id' => $hotelProduct->id,
            'name' => 'Pullman Zamzam',
            'code' => 'HTL-PZM',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        HotelPrice::query()->create([
            'hotel_id' => $hotel->id,
            'room_type_id' => $roomType->id,
            'period_start' => '2026-07-01',
            'period_end' => '2026-07-31',
            'price' => 3000000,
            'is_active' => true,
        ]);

        $assignment = HotelAssignment::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'hotel_id' => $hotel->id,
            'status' => 'confirmed',
        ]);

        HotelAssignmentRoom::query()->create([
            'hotel_assignment_id' => $assignment->id,
            'room_type_id' => $roomType->id,
            'room_count' => 3,
            'room_capacity' => 2,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-HPP-001',
            'booking_type' => 'regular',
            'full_name' => 'Jamaah A',
            'phone' => '08123456789',
            'email' => 'jamaah@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 6,
            'status' => 'registered',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
        ]);

        $this->actingAs($user)
            ->post(route('hpp-package.store'), [
                'travel_package_id' => $package->id,
                'departure_schedule_id' => $schedule->id,
                'manual_adjustment' => 1000000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('package_cost_calculations', [
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'hotel_total' => 9000000,
            'product_total' => 12000000,
            'manual_adjustment' => 1000000,
            'grand_total' => 22000000,
            'hpp_per_customer' => 3666666,
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
