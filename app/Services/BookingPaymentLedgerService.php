<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use DomainException;

class BookingPaymentLedgerService
{
    public function __construct(private readonly FinancialLedgerService $financialLedgerService) {}

    public function sync(Booking $booking, BookingPayment $payment): ?FinancialTransaction
    {
        $activeTransaction = FinancialTransaction::query()
            ->where('source_type', $payment->getMorphClass())
            ->where('source_id', $payment->id)
            ->where('transaction_type', 'booking_payment')
            ->where('status', 'posted')
            ->lockForUpdate()
            ->latest('id')
            ->first();

        if ($payment->status !== 'confirmed') {
            if ($activeTransaction) {
                $this->financialLedgerService->reverse(
                    $activeTransaction,
                    'Pembayaran booking diubah menjadi '.$payment->status.'.',
                );
            }

            return null;
        }

        $receiverAccount = FinancialAccount::query()
            ->lockForUpdate()
            ->find($payment->financial_account_id);
        $customerAdvanceAccount = FinancialAccount::query()
            ->where('system_key', 'customer_advance')
            ->lockForUpdate()
            ->first();

        if (! $receiverAccount
            || ! $receiverAccount->is_active
            || ! $receiverAccount->is_cash_account
            || $receiverAccount->cash_account_type === 'legacy'
            || strtoupper($receiverAccount->currency) !== strtoupper((string) $payment->currency)) {
            throw new DomainException('Rekening penerima harus aktif, terklasifikasi, dan menggunakan mata uang pembayaran.');
        }

        if (! $customerAdvanceAccount || ! $customerAdvanceAccount->is_active) {
            throw new DomainException('Akun Uang Muka Jemaah belum tersedia atau tidak aktif.');
        }

        $idempotencyKey = $this->idempotencyKey($payment);
        if ($activeTransaction?->idempotency_key === $idempotencyKey) {
            return $activeTransaction;
        }

        if ($activeTransaction) {
            $this->financialLedgerService->reverse(
                $activeTransaction,
                'Pembayaran booking diperbarui oleh admin.',
            );
        }

        $description = 'Pembayaran '.$booking->booking_code.' — '.$booking->full_name;

        return $this->financialLedgerService->post([
            'transaction_date' => $payment->payment_date->toDateString(),
            'transaction_type' => 'booking_payment',
            'source_type' => $payment->getMorphClass(),
            'source_id' => $payment->id,
            'package_id' => $booking->package_id,
            'currency' => $payment->currency,
            'exchange_rate' => $payment->exchange_rate,
            'idempotency_key' => $idempotencyKey,
            'description' => $description,
        ], [
            [
                'financial_account_id' => $receiverAccount->id,
                'entry_type' => 'debit',
                'amount_original' => $payment->amount,
                'amount_idr' => $payment->amount_idr,
                'description' => 'Dana diterima di '.$receiverAccount->name,
            ],
            [
                'financial_account_id' => $customerAdvanceAccount->id,
                'entry_type' => 'credit',
                'amount_original' => $payment->amount,
                'amount_idr' => $payment->amount_idr,
                'description' => 'Uang muka jemaah '.$booking->booking_code,
            ],
        ]);
    }

    private function idempotencyKey(BookingPayment $payment): string
    {
        $fingerprint = hash('sha256', implode('|', [
            $payment->payment_date->toDateString(),
            $payment->amount,
            $payment->financial_account_id,
            $payment->currency,
            $payment->exchange_rate,
            $payment->amount_idr,
        ]));

        return 'booking_payment:'.$payment->id.':'.substr($fingerprint, 0, 32);
    }
}
