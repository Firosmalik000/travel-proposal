<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingInvoicePdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_render_regular_booking_invoice_pdf(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.export');

        $package = TravelPackage::query()->create([
            'code' => 'INV-REG-10',
            'slug' => 'inv-reg-10',
            'name' => ['id' => 'Umroh Invoice 10', 'en' => 'Umrah Invoice 10'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 1500000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-06-01',
            'return_date' => '2026-06-10',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260430-INV1001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.invoice.pdf', $booking))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_it_can_render_custom_booking_invoice_pdf(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('menu.booking_listing.export');

        $package = TravelPackage::query()->create([
            'code' => 'CUSTOM-REQUEST',
            'slug' => 'custom-request',
            'name' => ['id' => 'Custom Request', 'en' => 'Custom Request'],
            'package_type' => 'custom',
            'departure_city' => 'Custom',
            'duration_days' => 0,
            'price' => 0,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => false,
        ]);

        $booking = Booking::query()->create([
            'booking_code' => 'BK-260430-CU1001',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'booking_type' => 'custom',
            'custom_departure_date' => '2026-07-01',
            'custom_return_date' => '2026-07-10',
            'custom_unit_price' => 5000000,
            'custom_total_amount' => 25000000,
            'custom_currency' => 'IDR',
            'full_name' => 'Budi',
            'phone' => '081234567891',
            'origin_city' => 'Surabaya',
            'passenger_count' => 5,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.invoice.pdf', $booking))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }
}
