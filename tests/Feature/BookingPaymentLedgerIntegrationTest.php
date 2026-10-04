<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Models\User;
use App\Services\BookingPaymentService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class BookingPaymentLedgerIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_keeps_a_confirmed_booking_payment_synchronized_with_cashflow_and_an_immutable_ledger_history(): void
    {
        $this->assertSame('travel_propposal_codex_testing', DB::connection()->getDatabaseName());

        $this->actingAs(User::factory()->create());
        $package = TravelPackage::factory()->create();
        $booking = Booking::query()->create([
            'booking_code' => 'BK-LEDGER-'.Str::upper(Str::random(8)),
            'package_id' => $package->id,
            'booking_type' => 'regular',
            'full_name' => 'Integration Test Customer',
            'phone' => '628123456789',
            'email' => 'ledger-test@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'status' => 'registered',
            'agreed_total_amount' => 10_000_000,
            'agreed_currency' => 'IDR',
        ]);
        $receiverAccount = FinancialAccount::query()->where('system_key', 'customer_funds')->sole();
        $paymentService = app(BookingPaymentService::class);
        $payload = [
            'payment_date' => '2026-09-11',
            'amount' => 4_000_000,
            'currency' => 'IDR',
            'exchange_rate' => '1',
            'financial_account_id' => $receiverAccount->id,
            'payment_method' => 'transfer',
            'reference_number' => 'TEST-'.Str::upper(Str::random(8)),
            'notes' => null,
            'status' => 'confirmed',
            'attachment_override_reason' => 'Verifikasi integrasi tanpa bukti tersimpan.',
            'idempotency_key' => (string) Str::uuid(),
        ];

        $payment = $paymentService->create($booking, $payload);
        $retry = $paymentService->create($booking, $payload);
        $firstLedger = FinancialTransaction::query()
            ->with('lines')
            ->where('source_type', $payment->getMorphClass())
            ->where('source_id', $payment->id)
            ->where('transaction_type', 'booking_payment')
            ->sole();

        $this->assertSame($payment->id, $retry->id);
        $this->assertSame(4_000_000, $payment->amount_idr);
        $this->assertNotNull($payment->cashflow_id);
        $this->assertSame('posted', $firstLedger->status);
        $this->assertSame(4_000_000, $firstLedger->lines->where('entry_type', 'debit')->sum('amount_idr'));
        $this->assertSame(4_000_000, $firstLedger->lines->where('entry_type', 'credit')->sum('amount_idr'));

        $payment = $paymentService->update($booking, $payment, [
            ...$payload,
            'payment_date' => '2026-09-12',
            'amount' => 5_000_000,
        ]);

        $replacement = FinancialTransaction::query()
            ->where('source_type', $payment->getMorphClass())
            ->where('source_id', $payment->id)
            ->where('transaction_type', 'booking_payment')
            ->where('status', 'posted')
            ->sole();
        $reversal = FinancialTransaction::query()->where('reversal_of_id', $firstLedger->id)->sole();

        $this->assertSame('reversed', $firstLedger->fresh()->status);
        $this->assertSame($payment->id, $reversal->source_id);
        $this->assertSame(5_000_000, $replacement->amount_idr);

        $paymentService->void($booking, $payment);

        $this->assertSame('void', $payment->fresh()->status);
        $this->assertSame('reversed', $replacement->fresh()->status);
        $this->assertSame(0, FinancialTransaction::query()
            ->where('source_type', (new BookingPayment)->getMorphClass())
            ->where('source_id', $payment->id)
            ->where('status', 'posted')
            ->where('transaction_type', 'booking_payment')
            ->count());
    }
}
