<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingListingReviewCancelTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_listing_marks_reviewed_and_hides_review_url(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.view');

        $package = TravelPackage::query()->create([
            'code' => 'ASF-LIST-10',
            'slug' => 'umroh-list-10',
            'name' => ['id' => 'Umroh List 10', 'en' => 'Umrah List 10'],
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
            'departure_date' => '2026-06-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260430-1001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        Testimonial::query()->create([
            'booking_id' => $booking->id,
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'name' => 'Ahmad Fauzi',
            'origin_city' => 'Gresik',
            'quote' => 'Mantap',
            'rating' => 5,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Listing/Index')
                ->where('registrations.data.0.id', $booking->id)
                ->where('registrations.data.0.has_review', true)
                ->where('registrations.data.0.review_url', null)
            );
    }

    public function test_cancelling_booking_restores_available_seats(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.edit');

        $package = TravelPackage::query()->create([
            'code' => 'ASF-CANCEL-10',
            'slug' => 'umroh-cancel-10',
            'name' => ['id' => 'Umroh Cancel 10', 'en' => 'Umrah Cancel 10'],
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
            'departure_date' => '2026-06-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260430-2001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Budi',
            'phone' => '081234567891',
            'origin_city' => 'Surabaya',
            'passenger_count' => 5,
            'status' => 'registered',
        ]);

        $schedule->refresh()->syncSeatAvailability();
        $this->assertSame(35, $schedule->fresh()->seats_available);

        $this->actingAs($user)->put(route('booking.listing.update', $booking), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Budi',
            'phone' => '081234567891',
            'email' => '',
            'origin_city' => 'Surabaya',
            'passenger_count' => 5,
            'notes' => '',
            'status' => 'cancelled',
        ])->assertRedirect(route('booking.listing.index'));

        $schedule->refresh()->syncSeatAvailability();
        $this->assertSame(40, $schedule->fresh()->seats_available);
    }
}
