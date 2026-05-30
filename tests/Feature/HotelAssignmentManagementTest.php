<?php

namespace Tests\Feature;

use App\Http\Middleware\CheckMenuPermission;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HotelAssignmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_hotel_assignment_page_is_rendered_with_summary(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);
        [$package, $schedule] = $this->seedPackageSchedule();
        Booking::query()->create([
            'booking_code' => 'BK-HA-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad',
            'phone' => '0812',
            'origin_city' => 'Jakarta',
            'passenger_count' => 5,
            'status' => 'registered',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('booking.hotel-assignment.index', ['departure_schedule_id' => $schedule->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/HotelAssignment/Index')
                ->where('bookingSummary.total_customers', 5)
                ->has('packages')
                ->has('schedules')
                ->has('hotels')
                ->has('roomTypes')
            );
    }

    public function test_hotel_assignment_can_be_created_and_deleted(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);
        [$package, $schedule] = $this->seedPackageSchedule();
        $hotel = $this->seedHotel();
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);
        Booking::query()->create([
            'booking_code' => 'BK-HA-0002',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Budi',
            'phone' => '0813',
            'origin_city' => 'Surabaya',
            'passenger_count' => 4,
            'status' => 'registered',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)->post(route('booking.hotel-assignment.store'), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'hotel_id' => $hotel->id,
            'status' => 'draft',
            'rooms' => [['room_type_id' => $dbl->id, 'room_count' => 2]],
        ])->assertRedirect();

        $this->assertDatabaseHas('hotel_assignments', [
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'hotel_id' => $hotel->id,
        ]);

        $assignmentId = (int) \DB::table('hotel_assignments')->value('id');
        $this->actingAs($user)->delete(route('booking.hotel-assignment.destroy', $assignmentId))->assertRedirect();
        $this->assertSoftDeleted('hotel_assignments', ['id' => $assignmentId]);
    }

    public function test_hotel_assignment_rejects_insufficient_capacity(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);
        [$package, $schedule] = $this->seedPackageSchedule();
        $hotel = $this->seedHotel();
        $dbl = HotelRoomType::query()->create(['name' => 'DBL', 'is_active' => true]);

        Booking::query()->create([
            'booking_code' => 'BK-HA-0003',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Cici',
            'phone' => '0814',
            'origin_city' => 'Bandung',
            'passenger_count' => 5,
            'status' => 'registered',
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)->from(route('booking.hotel-assignment.index'))->post(route('booking.hotel-assignment.store'), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'hotel_id' => $hotel->id,
            'status' => 'draft',
            'rooms' => [['room_type_id' => $dbl->id, 'room_count' => 2]],
        ])->assertRedirect(route('booking.hotel-assignment.index'));

        $this->assertDatabaseCount('hotel_assignments', 0);
    }

    private function seedPackageSchedule(): array
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-HA-10',
            'slug' => 'hotel-assignment-test',
            'name' => ['id' => 'Hotel Assignment Test', 'en' => 'Hotel Assignment Test'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-07-01',
            'return_date' => '2026-07-10',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        return [$package, $schedule];
    }

    private function seedHotel(): Hotel
    {
        $country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $city = HotelCity::query()->create(['country_id' => $country->id, 'name' => 'Makkah', 'is_active' => true]);

        return Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'Pullman Zamzam',
            'code' => 'HTL-PULLMAN',
            'currency' => 'SAR',
            'is_active' => true,
        ]);
    }
}
