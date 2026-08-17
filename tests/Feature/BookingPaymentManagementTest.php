<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingPaymentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_manage_booking_payments(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-001');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            'payment_date' => '2026-08-13',
            'amount' => 10_000_000,
            'payment_method' => 'transfer',
            'reference_number' => 'TRX-001',
            'status' => 'confirmed',
        ])->assertRedirect();

        $payment = BookingPayment::query()->sole();
        $this->assertSame($booking->id, $payment->booking_id);
        $this->assertSame(10_000_000, $payment->amount);

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            'payment_date' => '2026-08-14',
            'amount' => 12_000_000,
            'payment_method' => 'cash',
            'status' => 'confirmed',
        ])->assertRedirect();

        $this->assertSame(12_000_000, $payment->fresh()->amount);
    }

    public function test_user_without_booking_permission_cannot_write_payments(): void
    {
        $user = User::factory()->create();
        $booking = $this->booking('BK-PAY-002');

        $this->actingAs($user)->post(route('booking.payments.store', $booking), [
            'payment_date' => '2026-08-13',
            'amount' => 1_000_000,
            'payment_method' => 'cash',
            'status' => 'confirmed',
        ])->assertForbidden();
    }

    private function booking(string $code): Booking
    {
        $package = TravelPackage::factory()->create();

        return Booking::query()->create([
            'booking_code' => $code,
            'package_id' => $package->id,
            'booking_type' => 'regular',
            'full_name' => 'Customer Payment',
            'phone' => '628123456789',
            'email' => 'payment@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'status' => 'registered',
            'agreed_total_amount' => 25_000_000,
            'agreed_currency' => 'IDR',
        ]);
    }
}
