<?php

namespace Tests\Feature;

use App\Mail\BookingPaymentReminder;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
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

        $this->actingAs($user)
            ->post(route('booking.payments.reminder', $booking))
            ->assertForbidden();
    }

    public function test_confirmed_payments_update_the_flexible_balance_until_paid(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-003');

        foreach ([5_000_000, 10_000_000, 10_000_000] as $index => $amount) {
            $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
                'payment_date' => "2026-08-1{$index}",
                'amount' => $amount,
                'payment_method' => 'transfer',
                'status' => 'confirmed',
            ])->assertRedirect();
        }

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Payments/Index')
                ->where('booking.paid_amount', 25_000_000)
                ->where('booking.remaining_amount', 0)
                ->where('booking.payment_status', 'paid')
                ->has('booking.payments', 3));
    }

    public function test_pending_and_void_payments_remain_in_history_without_reducing_balance(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-004');

        BookingPayment::factory()->for($booking)->create([
            'amount' => 5_000_000,
            'status' => 'pending',
        ]);
        BookingPayment::factory()->for($booking)->create([
            'amount' => 3_000_000,
            'status' => 'void',
        ]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.paid_amount', 0)
                ->where('booking.remaining_amount', 25_000_000)
                ->where('booking.payment_status', 'unpaid')
                ->has('booking.payments', 2));
    }

    public function test_confirmed_payment_cannot_exceed_remaining_balance(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-005');
        BookingPayment::factory()->for($booking)->create([
            'amount' => 20_000_000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            'payment_date' => '2026-08-19',
            'amount' => 5_000_001,
            'payment_method' => 'cash',
            'status' => 'confirmed',
        ])->assertSessionHasErrors('amount');

        $this->assertDatabaseCount('booking_payments', 1);
    }

    public function test_voiding_payment_keeps_history_and_restores_remaining_balance(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-006');
        $payment = BookingPayment::factory()->for($booking)->create([
            'amount' => 10_000_000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)
            ->delete(route('booking.payments.destroy', [$booking, $payment]))
            ->assertRedirect();

        $this->assertDatabaseHas('booking_payments', [
            'id' => $payment->id,
            'status' => 'void',
            'deleted_at' => null,
        ]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.paid_amount', 0)
                ->where('booking.remaining_amount', 25_000_000)
                ->has('booking.payments', 1));
    }

    public function test_payment_from_another_booking_cannot_be_updated(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-007');
        $anotherBooking = $this->booking('BK-PAY-008');
        $payment = BookingPayment::factory()->for($anotherBooking)->create();

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            'payment_date' => '2026-08-19',
            'amount' => 1_000_000,
            'payment_method' => 'cash',
            'status' => 'confirmed',
        ])->assertNotFound();
    }

    public function test_administrator_can_queue_a_professional_payment_reminder_for_unpaid_booking(): void
    {
        Mail::fake();
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-009');
        BookingPayment::factory()->for($booking)->create([
            'amount' => 10_000_000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.can_send_reminder', true)
                ->where('booking.email', 'payment@example.com'));

        $this->actingAs($admin)
            ->post(route('booking.payments.reminder', $booking))
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(
            BookingPaymentReminder::class,
            fn (BookingPaymentReminder $mail): bool => $mail->booking->is($booking)
                && $mail->hasTo('payment@example.com')
                && $mail->summary['total_amount'] === 25_000_000
                && $mail->summary['paid_amount'] === 10_000_000
                && $mail->summary['remaining_amount'] === 15_000_000
                && str_contains($mail->invoiceUrl, 'tab=payments'),
        );
    }

    public function test_paid_booking_hides_and_rejects_payment_reminder(): void
    {
        Mail::fake();
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-010');
        BookingPayment::factory()->for($booking)->create([
            'amount' => 25_000_000,
            'status' => 'confirmed',
        ]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.payment_status', 'paid')
                ->where('booking.can_send_reminder', false));

        $this->actingAs($admin)
            ->post(route('booking.payments.reminder', $booking))
            ->assertSessionHasErrors('reminder');

        Mail::assertNothingSent();
    }

    public function test_payment_reminder_requires_a_valid_customer_email(): void
    {
        Mail::fake();
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-011');
        $booking->update(['email' => null]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.can_send_reminder', false));

        $this->actingAs($admin)
            ->post(route('booking.payments.reminder', $booking))
            ->assertSessionHasErrors('reminder');

        Mail::assertNothingSent();
    }

    public function test_payment_reminder_requires_a_positive_booking_total(): void
    {
        Mail::fake();
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-013');
        $booking->update(['agreed_total_amount' => 0]);
        $booking->package()->update(['price' => 0]);

        $this->actingAs($admin)
            ->get(route('booking.payments.index', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.can_send_reminder', false));

        $this->actingAs($admin)
            ->post(route('booking.payments.reminder', $booking))
            ->assertSessionHasErrors('reminder');

        Mail::assertNothingSent();
    }

    public function test_payment_reminder_email_renders_payment_summary(): void
    {
        $booking = $this->booking('BK-PAY-012');
        $mail = new BookingPaymentReminder($booking->load('package'), [
            'total_amount' => 25_000_000,
            'paid_amount' => 10_000_000,
            'remaining_amount' => 15_000_000,
            'payment_status' => 'partial',
        ], 'https://example.com/customer/bookings/BK-PAY-012?tab=payments');

        $mail->assertSeeInHtml('Pengingat Pembayaran');
        $mail->assertSeeInHtml('IDR 15.000.000');
        $mail->assertSeeInHtml('Lihat Invoice & Pembayaran');
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
