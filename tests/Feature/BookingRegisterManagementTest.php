<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingRegisterManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_booking_register_page_with_registration_data(): void
    {
        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-HEMAT-09',
            'slug' => 'umroh-hemat-9-hari',
            'name' => ['id' => 'Umroh Hemat 9 Hari', 'en' => 'Economy Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $package->id,
            'departure_date' => '2026-05-10',
            'return_date' => '2026-05-18',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'notes' => 'Mohon info kamar triple.',
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('booking.register.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Register/Index')
                ->has('registrations.data', 1)
                ->where('registrations.data.0.booking_code', 'BK-260421-0001')
                ->where('registrations.data.0.full_name', 'Ahmad Fauzi')
                ->where('registrations.data.0.travel_package.code', 'ASF-HEMAT-09')
                ->where('registrations.data.0.travel_package.package_type', 'hemat')
                ->where('registrations.data.0.departure_schedule.departure_city', 'Jakarta')
                ->where('registrations.data.0.departure_schedule.return_date', '2026-05-18')
                ->where('registrations.data.0.status', 'pending')
            );
    }

    public function test_it_requires_auth_for_booking_register_page(): void
    {
        $this->get(route('booking.register.index'))
            ->assertRedirect(route('login'));
    }

    public function test_it_can_mark_pending_register_as_registered(): void
    {
        $user = User::factory()->create();
        $package = TravelPackage::query()->create([
            'code' => 'ASF-MARK-09',
            'slug' => 'umroh-mark-9-hari',
            'name' => ['id' => 'Umroh Mark 9 Hari', 'en' => 'Mark Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $registration = PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->put(route('booking.register.mark-registered', $registration))
            ->assertRedirect(route('booking.register.index'));

        $this->assertDatabaseHas('package_registrations', [
            'id' => $registration->id,
            'status' => 'registered',
        ]);
    }

    public function test_it_can_delete_pending_register_entry(): void
    {
        $user = User::factory()->create();
        $package = TravelPackage::query()->create([
            'code' => 'ASF-DELETE-09',
            'slug' => 'umroh-delete-9-hari',
            'name' => ['id' => 'Umroh Delete 9 Hari', 'en' => 'Delete Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $registration = PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->delete(route('booking.register.destroy', $registration))
            ->assertStatus(302);

        $this->assertDatabaseMissing('package_registrations', [
            'id' => $registration->id,
        ]);
    }

    public function test_it_shows_booking_listing_page_without_redirecting(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Listing/Index')
                ->has('registrations.data')
                ->has('packages')
                ->has('schedules')
                ->where('filters.search', '')
                ->where('filters.status', 'registered')
            );
    }

    public function test_it_computes_available_schedule_seats_for_booking_listing_from_active_bookings(): void
    {
        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REGULER-12',
            'slug' => 'umroh-reguler-12-hari',
            'name' => ['id' => 'Umroh Reguler 12 Hari', 'en' => 'Regular Umrah 12 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 12,
            'price' => 32900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $package->id,
            'departure_date' => '2026-06-10',
            'return_date' => '2026-06-21',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 6,
            'status' => 'pending',
        ]);

        PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 4,
            'status' => 'registered',
        ]);

        PackageRegistration::query()->create([
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Budi Santoso',
            'phone' => '081234567892',
            'email' => 'budi@example.com',
            'origin_city' => 'Sidoarjo',
            'passenger_count' => 5,
            'status' => 'cancelled',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('schedules.0.seats_total', 40)
                ->where('schedules.0.seats_available', 36)
            );
    }
}
