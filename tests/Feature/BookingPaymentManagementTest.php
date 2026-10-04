<?php

namespace Tests\Feature;

use App\Mail\BookingPaymentReminder;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Models\User;
use App\Services\BookingPaymentCashflowAuditService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingPaymentManagementTest extends TestCase
{
    use DatabaseTransactions;

    public function test_administrator_can_manage_booking_payments(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-001');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
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
            ...$this->paymentFinancialFields(),
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
            ...$this->paymentFinancialFields(),
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
                ...$this->paymentFinancialFields(),
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
                ->has('booking.payments', 3)
                ->where('receiverAccounts.0.cash_account_type', 'customer_funds'));
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
            ...$this->paymentFinancialFields(),
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
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-08-19',
            'amount' => 1_000_000,
            'payment_method' => 'cash',
            'status' => 'confirmed',
        ])->assertNotFound();
    }

    public function test_pending_payment_is_posted_to_cashflow_when_confirmed(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-SYNC-001');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-07',
            'amount' => 5_000_000,
            'payment_method' => 'transfer',
            'status' => 'pending',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $payment = BookingPayment::query()->sole();
        $this->assertNull($payment->cashflow_id);
        $this->assertDatabaseCount('cashflows', 0);

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-07',
            'amount' => 5_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $payment->refresh();
        $this->assertNotNull($payment->cashflow_id);
        $this->assertDatabaseHas('cashflows', [
            'id' => $payment->cashflow_id,
            'transaction_date' => '2026-09-07',
            'type' => 'income',
            'amount' => 5_000_000,
            'category' => 'booking_payment',
            'deleted_at' => null,
        ]);
    }

    public function test_confirmed_payment_cashflow_follows_status_and_amount_changes_without_duplicates(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-SYNC-002');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-07',
            'amount' => 5_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $payment = BookingPayment::query()->sole();
        $cashflowId = $payment->cashflow_id;

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-08',
            'amount' => 6_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame($cashflowId, $payment->fresh()->cashflow_id);
        $this->assertDatabaseCount('cashflows', 1);
        $this->assertDatabaseHas('cashflows', [
            'id' => $cashflowId,
            'transaction_date' => '2026-09-08',
            'amount' => 6_000_000,
            'deleted_at' => null,
        ]);

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-08',
            'amount' => 6_000_000,
            'payment_method' => 'transfer',
            'status' => 'pending',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSoftDeleted('cashflows', ['id' => $cashflowId]);

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-08',
            'amount' => 6_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame($cashflowId, $payment->fresh()->cashflow_id);
        $this->assertDatabaseCount('cashflows', 1);
        $this->assertDatabaseHas('cashflows', [
            'id' => $cashflowId,
            'deleted_at' => null,
        ]);
    }

    public function test_finance_audit_command_reports_inconsistent_links_without_changing_data(): void
    {
        $booking = $this->booking('BK-PAY-AUDIT-001');
        BookingPayment::factory()->for($booking)->create([
            'amount' => 7_000_000,
            'status' => 'confirmed',
            'cashflow_id' => null,
        ]);

        $this->artisan('finance:audit-booking-payment-cashflows')
            ->expectsOutputToContain('Confirmed tanpa cashflow')
            ->assertFailed();

        $this->assertDatabaseCount('booking_payments', 1);
        $this->assertDatabaseCount('cashflows', 0);
    }

    public function test_finance_audit_groups_confirmed_payments_by_effective_currency(): void
    {
        $idrBooking = $this->booking('BK-PAY-CURRENCY-IDR');
        $usdBooking = $this->booking('BK-PAY-CURRENCY-USD');
        $usdBooking->update(['agreed_currency' => 'USD']);

        BookingPayment::factory()->for($idrBooking)->create([
            'amount' => 1_500_000,
            'currency' => null,
            'status' => 'confirmed',
        ]);
        BookingPayment::factory()->for($usdBooking)->create([
            'amount' => 750,
            'currency' => 'usd',
            'status' => 'confirmed',
        ]);

        $this->assertSame([
            'IDR' => ['count' => 1, 'amount' => 1_500_000],
            'USD' => ['count' => 1, 'amount' => 750],
        ], app(BookingPaymentCashflowAuditService::class)->confirmedByCurrency());
    }

    public function test_finance_audit_accepts_a_reversed_historical_link_and_ignores_deleted_payments(): void
    {
        $booking = $this->booking('BK-PAY-AUDIT-002');
        $payment = BookingPayment::factory()->for($booking)->create([
            'amount' => 7_000_000,
            'status' => 'pending',
        ]);
        $cashflow = $payment->cashflow()->create([
            'transaction_date' => $payment->payment_date,
            'type' => 'income',
            'amount' => $payment->amount,
            'category' => 'booking_payment',
        ]);
        $payment->update(['cashflow_id' => $cashflow->id]);
        $cashflow->delete();

        BookingPayment::factory()->for($booking)->create([
            'amount' => 99_000_000,
            'status' => 'confirmed',
            'deleted_at' => now(),
        ]);

        $this->artisan('finance:audit-booking-payment-cashflows')
            ->expectsOutputToContain('Non-confirmed dengan histori link cashflow')
            ->expectsOutputToContain('Mata uang booking')
            ->assertSuccessful();
    }

    public function test_confirmed_payment_posts_a_balanced_customer_advance_ledger(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-LEDGER-001');
        $financialFields = $this->paymentFinancialFields();

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$financialFields,
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $payment = BookingPayment::query()->sole();
        $transaction = FinancialTransaction::query()
            ->with('lines')
            ->where('source_type', $payment->getMorphClass())
            ->where('source_id', $payment->id)
            ->where('transaction_type', 'booking_payment')
            ->sole();
        $customerAdvanceId = FinancialAccount::query()->where('system_key', 'customer_advance')->value('id');

        $this->assertSame('posted', $transaction->status);
        $this->assertSame(4_000_000, $transaction->amount_idr);
        $this->assertSame(4_000_000, $transaction->lines->where('entry_type', 'debit')->sum('amount_idr'));
        $this->assertSame(4_000_000, $transaction->lines->where('entry_type', 'credit')->sum('amount_idr'));
        $this->assertTrue($transaction->lines->contains(fn ($line): bool => $line->entry_type === 'debit'
            && $line->financial_account_id === $financialFields['financial_account_id']
        ));
        $this->assertTrue($transaction->lines->contains(fn ($line): bool => $line->entry_type === 'credit'
            && $line->financial_account_id === $customerAdvanceId
        ));
    }

    public function test_payment_change_reverses_the_old_ledger_and_posts_a_replacement(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-LEDGER-002');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $payment = BookingPayment::query()->sole();
        $original = FinancialTransaction::query()->where('transaction_type', 'booking_payment')->sole();

        $this->actingAs($admin)->put(route('booking.payments.update', [$booking, $payment]), [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-12',
            'amount' => 5_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $replacement = FinancialTransaction::query()
            ->where('transaction_type', 'booking_payment')
            ->where('status', 'posted')
            ->sole();
        $reversal = FinancialTransaction::query()->where('reversal_of_id', $original->id)->sole();

        $this->assertSame('reversed', $original->fresh()->status);
        $this->assertSame($payment->getMorphClass(), $reversal->source_type);
        $this->assertSame($payment->id, $reversal->source_id);
        $this->assertSame(5_000_000, $replacement->amount_idr);
        $this->assertDatabaseCount('financial_transactions', 3);
    }

    public function test_duplicate_payment_request_is_idempotent_but_rejects_changed_payload(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-IDEMPOTENT-001');
        $payload = [
            ...$this->paymentFinancialFields(),
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ];

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), $payload)
            ->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($admin)->post(route('booking.payments.store', $booking), $payload)
            ->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseCount('booking_payments', 1);
        $this->assertDatabaseCount('cashflows', 1);
        $this->assertSame(1, FinancialTransaction::query()->where('transaction_type', 'booking_payment')->count());

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$payload,
            'amount' => 4_500_000,
        ])->assertSessionHasErrors('idempotency_key');

        $this->assertDatabaseCount('booking_payments', 1);
    }

    public function test_confirmed_payment_requires_proof_or_an_explicit_override_reason(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-PROOF-001');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'attachment_override_reason' => null,
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertSessionHasErrors('attachment');

        $this->assertDatabaseCount('booking_payments', 0);
    }

    public function test_confirmed_payment_rejects_legacy_accounts_and_an_invalid_idr_rate(): void
    {
        Role::findOrCreate('Super Admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');
        $booking = $this->booking('BK-PAY-VALIDATION-001');
        $legacyAccount = FinancialAccount::query()->where('cash_account_type', 'legacy')->firstOrFail();

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'financial_account_id' => $legacyAccount->id,
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertSessionHasErrors('financial_account_id');

        $this->actingAs($admin)->post(route('booking.payments.store', $booking), [
            ...$this->paymentFinancialFields(),
            'exchange_rate' => '16000',
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'payment_method' => 'transfer',
            'status' => 'confirmed',
        ])->assertSessionHasErrors('exchange_rate');

        $this->assertDatabaseCount('booking_payments', 0);
    }

    public function test_legacy_booking_payment_backfill_is_preview_first_and_idempotent(): void
    {
        $booking = $this->booking('BK-PAY-BACKFILL-001');
        $payment = BookingPayment::factory()->for($booking)->create([
            'amount' => 4_000_000,
            'status' => 'confirmed',
            'cashflow_id' => null,
            'financial_account_id' => null,
            'currency' => null,
            'exchange_rate' => null,
            'amount_idr' => null,
            'idempotency_key' => null,
        ]);
        $receiverAccount = FinancialAccount::query()->where('system_key', 'customer_funds')->firstOrFail();

        $this->artisan('finance:backfill-booking-payments')
            ->expectsOutputToContain('Mode preview')
            ->assertSuccessful();
        $this->assertDatabaseCount('financial_transactions', 0);

        $command = sprintf(
            'finance:backfill-booking-payments --commit --payment=%d --account=%d',
            $payment->id,
            $receiverAccount->id,
        );
        $this->artisan($command)->assertSuccessful();
        $this->artisan($command)->assertSuccessful();

        $payment->refresh();
        $this->assertSame($receiverAccount->id, $payment->financial_account_id);
        $this->assertSame('IDR', $payment->currency);
        $this->assertSame(4_000_000, $payment->amount_idr);
        $this->assertNotNull($payment->cashflow_id);
        $this->assertSame(1, FinancialTransaction::query()
            ->where('transaction_type', 'booking_payment')
            ->where('source_id', $payment->id)
            ->count());
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

    /** @return array{currency: string, exchange_rate: string, financial_account_id: int, attachment_override_reason: string, idempotency_key: string} */
    private function paymentFinancialFields(): array
    {
        return [
            'currency' => 'IDR',
            'exchange_rate' => '1',
            'financial_account_id' => (int) FinancialAccount::query()
                ->where('system_key', 'customer_funds')
                ->sole()
                ->id,
            'attachment_override_reason' => 'Verifikasi otomatis tanpa bukti untuk pengujian.',
            'idempotency_key' => (string) Str::uuid(),
        ];
    }
}
