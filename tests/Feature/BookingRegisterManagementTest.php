<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingRegisterManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_booking_register_page_with_registration_data(): void
    {
        $this->travelTo(Carbon::parse('2026-04-21 09:00:00'));

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
            'package_id' => $package->id,
            'departure_date' => '2026-05-10',
            'return_date' => '2026-05-18',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
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

        $this->travelBack();
    }

    public function test_it_requires_auth_for_booking_register_page(): void
    {
        $this->get(route('booking.register.index'))
            ->assertRedirect(route('login'));
    }

    public function test_it_can_mark_pending_register_as_registered(): void
    {
        $this->travelTo(Carbon::parse('2026-04-21 09:00:00'));

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
            'package_id' => $package->id,
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

        $this->assertDatabaseMissing('package_registrations', [
            'id' => $registration->id,
        ]);

        $this->assertDatabaseHas('bookings', [
            'booking_code' => sprintf('BK-260421-%04d', $registration->id),
            'package_id' => $package->id,
            'full_name' => 'Ahmad Fauzi',
            'status' => 'registered',
        ]);

        $this->travelBack();
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
            'package_id' => $package->id,
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
                ->has('revenue.by_currency')
                ->where('filters.search', '')
                ->where('filters.status', 'registered')
            );
    }

    public function test_it_calculates_estimated_revenue_from_registered_bookings(): void
    {
        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REV-09',
            'slug' => 'umroh-revenue-9-hari',
            'name' => ['id' => 'Umroh Revenue 9 Hari', 'en' => 'Revenue Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-REV-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Revenue Test',
            'phone' => '081200000000',
            'email' => null,
            'origin_city' => 'Jakarta',
            'passenger_count' => 3,
            'notes' => null,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('registrations.data', 1)
                ->has('revenue.by_currency', 1)
                ->where('revenue.by_currency.0.currency', 'IDR')
                ->where('revenue.by_currency.0.bookings', 1)
                ->where('revenue.by_currency.0.pax', 3)
                ->where('revenue.by_currency.0.amount', 3000000)
                ->where('registrations.data.0.revenue.currency', 'IDR')
                ->where('registrations.data.0.revenue.amount', 3000000)
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
            'package_id' => $package->id,
            'departure_date' => '2026-06-10',
            'return_date' => '2026-06-21',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 6,
            'status' => 'pending',
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-SEAT-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 4,
            'notes' => null,
            'status' => 'registered',
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
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
