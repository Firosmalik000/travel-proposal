<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\CustomUmrohRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CustomBookingManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_approving_custom_request_creates_custom_booking_and_excludes_regular_listing(): void
    {
        $this->travelTo(Carbon::parse('2026-05-01 09:00:00'));

        Permission::findOrCreate('menu.booking_custom_requests.approve', 'web');
        Permission::findOrCreate('menu.booking_listing.view', 'web');

        $user = User::factory()->create();
        $user->givePermissionTo([
            'menu.booking_custom_requests.approve',
            'menu.booking_listing.view',
        ]);

        $customRequest = CustomUmrohRequest::query()->create([
            'request_code' => 'CU-260501-0001',
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'group_type' => 'Family',
            'departure_month' => '2026-06',
            'budget' => 45000000,
            'focus' => 'Hemat',
            'room_preference' => 'Quad',
            'notes' => 'Mohon jadwal fleksibel.',
            'status' => 'new',
        ]);

        $this->actingAs($user)
            ->post(route('booking.custom-requests.approve', $customRequest), [
                'passenger_count' => 3,
                'origin_city' => 'Surabaya',
                'notes' => 'Deal harga final.',
                'custom_departure_date' => '2026-06-10',
                'custom_return_date' => '2026-06-20',
                'custom_unit_price' => 16666667,
            ])
            ->assertRedirect(route('booking.custom-bookings.index'));

        $booking = Booking::query()->firstOrFail();

        $this->assertDatabaseHas('custom_umroh_requests', [
            'id' => $customRequest->id,
            'status' => 'approved',
            'booking_id' => $booking->id,
            'approved_by' => $user->id,
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'booking_type' => 'custom',
            'departure_schedule_id' => null,
            'custom_departure_date' => '2026-06-10',
            'custom_return_date' => '2026-06-20',
            'custom_unit_price' => 16666667,
            'custom_total_amount' => 50000001,
            'custom_currency' => 'IDR',
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Listing/Index')
                ->has('registrations.data', 0)
            );

        $this->actingAs($user)
            ->get(route('booking.custom-bookings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/CustomBookings/Index')
                ->has('bookings.data', 1)
                ->where('bookings.data.0.booking_code', $booking->booking_code)
                ->where('bookings.data.0.revenue.amount', 50000001)
            );

        $this->travelBack();
    }
}
