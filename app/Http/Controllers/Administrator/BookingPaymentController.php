<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Booking\SendBookingPaymentReminder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\ReverseFinancialTransactionRequest;
use App\Http\Requests\Administrator\StoreBookingPaymentRequest;
use App\Http\Requests\Administrator\StoreBookingRefundRequest;
use App\Http\Requests\Administrator\UpdateBookingPaymentRequest;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Services\BookingPaymentService;
use App\Services\FinancialLedgerService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingPaymentController extends Controller
{
    public function __construct(
        private readonly BookingPaymentService $bookingPaymentService,
    ) {}

    public function index(Booking $booking): Response
    {
        $booking->load([
            'package:id,name,code,currency',
            'payments' => fn ($query) => $query
                ->with([
                    'creator:id,name',
                    'financialAccount:id,code,name',
                    'financialTransactions:id,transaction_number,transaction_type,status,source_type,source_id,amount_original',
                ])
                ->latest('payment_date')
                ->latest('id'),
        ]);
        $summary = $this->bookingPaymentService->summary($booking);

        return Inertia::render('Dashboard/Booking/Payments/Index', [
            'booking' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'full_name' => $booking->full_name,
                'email' => $booking->email,
                'package_name' => data_get($booking->package?->name, 'id', $booking->package?->code),
                'agreed_total_amount' => $summary['total_amount'],
                'currency' => $booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR',
                'paid_amount' => $summary['paid_amount'],
                'remaining_amount' => $summary['remaining_amount'],
                'payment_status' => $summary['payment_status'],
                'can_send_reminder' => $summary['payment_status'] !== 'paid'
                    && $summary['total_amount'] > 0
                    && $summary['remaining_amount'] > 0
                    && is_string($booking->email)
                    && filter_var($booking->email, FILTER_VALIDATE_EMAIL),
                'payments' => $booking->payments->map(function (BookingPayment $payment): array {
                    $ledgerTransaction = $payment->financialTransactions
                        ->where('transaction_type', 'booking_payment')
                        ->sortByDesc('id')
                        ->first();

                    return [
                        'id' => $payment->id,
                        'payment_date' => $payment->payment_date?->toDateString(),
                        'amount' => (int) $payment->amount,
                        'currency' => $payment->currency,
                        'exchange_rate' => $payment->exchange_rate,
                        'amount_idr' => $payment->amount_idr,
                        'refunded_amount' => (int) $payment->financialTransactions
                            ->where('transaction_type', 'customer_refund')
                            ->where('status', 'posted')
                            ->sum('amount_original'),
                        'refunds' => $payment->financialTransactions
                            ->where('transaction_type', 'customer_refund')
                            ->map(fn (FinancialTransaction $transaction): array => [
                                'id' => $transaction->id,
                                'transaction_number' => $transaction->transaction_number,
                                'status' => $transaction->status,
                                'amount' => (int) $transaction->amount_original,
                            ])->values()->all(),
                        'financial_account_id' => $payment->financial_account_id,
                        'financial_account' => $payment->financialAccount ? [
                            'code' => $payment->financialAccount->code,
                            'name' => $payment->financialAccount->name,
                        ] : null,
                        'payment_method' => $payment->payment_method,
                        'reference_number' => $payment->reference_number,
                        'notes' => $payment->notes,
                        'attachment_path' => $payment->attachment_path,
                        'attachment_override_reason' => $payment->attachment_override_reason,
                        'status' => $payment->status,
                        'ledger' => $ledgerTransaction ? [
                            'transaction_number' => $ledgerTransaction->transaction_number,
                            'status' => $ledgerTransaction->status,
                        ] : null,
                        'recorded_by' => $payment->creator?->name,
                        'created_at' => $payment->created_at?->toIso8601String(),
                        'updated_at' => $payment->updated_at?->toIso8601String(),
                    ];
                })->values()->all(),
            ],
            'receiverAccounts' => FinancialAccount::query()
                ->where('is_active', true)
                ->where('is_cash_account', true)
                ->where('cash_account_type', '!=', 'legacy')
                ->where('currency', strtoupper((string) (
                    $booking->agreed_currency
                    ?? $booking->custom_currency
                    ?? $booking->package?->currency
                    ?? 'IDR'
                )))
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'currency', 'cash_account_type'])
                ->map(fn (FinancialAccount $account): array => [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'currency' => $account->currency,
                    'cash_account_type' => $account->cash_account_type,
                ])
                ->all(),
        ]);
    }

    public function store(StoreBookingPaymentRequest $request, Booking $booking): RedirectResponse
    {
        $this->bookingPaymentService->create($booking, $request->validated());

        return back()->with('success', 'Pembayaran berhasil ditambahkan.');
    }

    public function update(UpdateBookingPaymentRequest $request, Booking $booking, BookingPayment $payment): RedirectResponse
    {
        $this->bookingPaymentService->update($booking, $payment, $request->validated());

        return back()->with('success', 'Pembayaran berhasil diperbarui.');
    }

    public function destroy(Booking $booking, BookingPayment $payment): RedirectResponse
    {
        $this->bookingPaymentService->void($booking, $payment);

        return back()->with('success', 'Pembayaran dibatalkan dan tetap tersimpan di riwayat.');
    }

    public function refund(StoreBookingRefundRequest $request, Booking $booking, BookingPayment $payment, FinancialLedgerService $ledger): RedirectResponse
    {
        if ($payment->booking_id !== $booking->id) {
            abort(404);
        }

        if ($payment->currency === null || $payment->exchange_rate === null) {
            return back()->withErrors(['refund' => 'Pembayaran lama perlu direkonsiliasi sebelum direfund.']);
        }

        try {
            $ledger->postClassifiedCashTransaction([
                ...$request->validated(),
                'transaction_type' => 'customer_refund',
                'booking_payment_id' => $payment->id,
                'currency' => $payment->currency,
                'exchange_rate' => $payment->exchange_rate,
                'amount_idr' => (int) round($request->integer('amount_original') * (float) $payment->exchange_rate),
            ]);
        } catch (DomainException $exception) {
            return back()->withErrors(['refund' => $exception->getMessage()]);
        }

        return back()->with('success', 'Refund berhasil diposting ke ledger.');
    }

    public function reverseRefund(ReverseFinancialTransactionRequest $request, Booking $booking, BookingPayment $payment, FinancialTransaction $transaction, FinancialLedgerService $ledger): RedirectResponse
    {
        if ($payment->booking_id !== $booking->id
            || $transaction->transaction_type !== 'customer_refund'
            || $transaction->source_type !== BookingPayment::class
            || $transaction->source_id !== $payment->id) {
            abort(404);
        }

        try {
            $booking->loadMissing('package');
            $booking->package?->ensureFinanciallyOpen();
            $ledger->reverse($transaction, $request->string('reason')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['refund' => $exception->getMessage()]);
        }

        return back()->with('success', 'Refund dibalik tanpa menghapus histori.');
    }

    public function remind(Booking $booking, SendBookingPaymentReminder $sendReminder): RedirectResponse
    {
        $sendReminder->handle($booking);

        return back()->with('success', "Reminder pembayaran berhasil dikirim ke {$booking->email}.");
    }
}
