<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Cashflow;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class BookingPaymentService
{
    public function __construct(
        private readonly PackageRoomConfigurationService $roomConfigurationService,
        private readonly CashflowService $cashflowService,
        private readonly BookingPaymentLedgerService $bookingPaymentLedgerService,
    ) {}

    /** @param array<string, mixed> $attributes */
    public function create(Booking $booking, array $attributes): BookingPayment
    {
        $attributes = $this->prepareFinancialSnapshot($booking, $attributes);
        $existingPayment = BookingPayment::query()
            ->where('idempotency_key', $attributes['idempotency_key'])
            ->first();

        if ($existingPayment) {
            return $this->resolveIdempotentRetry($booking, $existingPayment, $attributes);
        }

        [$attributes, $storedAttachmentPath] = $this->prepareAttachment($attributes);
        $created = false;

        try {
            $payment = DB::transaction(function () use ($booking, $attributes, &$created): BookingPayment {
                $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());
                $this->ensureFinanciallyOpen($lockedBooking);
                $existingPayment = BookingPayment::query()
                    ->where('idempotency_key', $attributes['idempotency_key'])
                    ->lockForUpdate()
                    ->first();

                if ($existingPayment) {
                    return $this->resolveIdempotentRetry($lockedBooking, $existingPayment, $attributes);
                }

                $this->ensurePaymentDoesNotExceedBalance($lockedBooking, $attributes);

                $payment = $lockedBooking->payments()->create($attributes);
                $this->syncCashflow($lockedBooking, $payment);
                $this->bookingPaymentLedgerService->sync($lockedBooking, $payment);
                $created = true;

                return $payment->refresh();
            });

            if (! $created) {
                $this->deleteStoredAttachment($storedAttachmentPath);
            }

            return $payment;
        } catch (Throwable $exception) {
            $this->deleteStoredAttachment($storedAttachmentPath);

            throw $exception;
        }
    }

    /** @param array<string, mixed> $attributes */
    public function update(Booking $booking, BookingPayment $payment, array $attributes): BookingPayment
    {
        unset($attributes['idempotency_key']);
        $attributes = $this->prepareFinancialSnapshot($booking, $attributes);
        [$attributes, $storedAttachmentPath] = $this->prepareAttachment($attributes);
        $replacedAttachmentPath = null;

        try {
            $updatedPayment = DB::transaction(function () use ($booking, $payment, $attributes, &$replacedAttachmentPath): BookingPayment {
                $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());
                $this->ensureFinanciallyOpen($lockedBooking);
                $lockedPayment = BookingPayment::query()
                    ->whereBelongsTo($lockedBooking)
                    ->lockForUpdate()
                    ->findOrFail($payment->getKey());

                $this->ensureNoPostedRefund($lockedPayment);

                $this->ensurePaymentDoesNotExceedBalance($lockedBooking, $attributes, $lockedPayment);

                if (array_key_exists('attachment_path', $attributes)) {
                    $replacedAttachmentPath = $lockedPayment->attachment_path;
                }

                $lockedPayment->update($attributes);
                $this->syncCashflow($lockedBooking, $lockedPayment);
                $this->bookingPaymentLedgerService->sync($lockedBooking, $lockedPayment);

                return $lockedPayment->refresh();
            });
        } catch (Throwable $exception) {
            $this->deleteStoredAttachment($storedAttachmentPath);

            throw $exception;
        }

        if ($replacedAttachmentPath !== $updatedPayment->attachment_path) {
            $this->deleteStoredAttachment($replacedAttachmentPath);
        }

        return $updatedPayment;
    }

    public function void(Booking $booking, BookingPayment $payment): void
    {
        DB::transaction(function () use ($booking, $payment): void {
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());
            $this->ensureFinanciallyOpen($lockedBooking);
            $lockedPayment = BookingPayment::query()
                ->whereBelongsTo($lockedBooking)
                ->lockForUpdate()
                ->findOrFail($payment->getKey());

            $this->ensureNoPostedRefund($lockedPayment);

            $lockedPayment->update(['status' => 'void']);
            $this->syncCashflow($lockedBooking, $lockedPayment);
            $this->bookingPaymentLedgerService->sync($lockedBooking, $lockedPayment);
        });
    }

    public function reconcileLegacyPayment(BookingPayment $payment, FinancialAccount $receiverAccount): BookingPayment
    {
        return DB::transaction(function () use ($payment, $receiverAccount): BookingPayment {
            $lockedPayment = BookingPayment::query()->lockForUpdate()->findOrFail($payment->id);
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($lockedPayment->booking_id);
            $this->ensureFinanciallyOpen($lockedBooking);
            $lockedReceiverAccount = FinancialAccount::query()->lockForUpdate()->findOrFail($receiverAccount->id);

            if ($lockedPayment->status !== 'confirmed') {
                throw new DomainException('Hanya Booking Payment confirmed yang dapat direkonsiliasi.');
            }

            if (! $lockedReceiverAccount->is_active
                || ! $lockedReceiverAccount->is_cash_account
                || $lockedReceiverAccount->cash_account_type === 'legacy'
                || strtoupper($lockedReceiverAccount->currency) !== $this->bookingCurrency($lockedBooking)) {
                throw new DomainException('Rekening tujuan backfill harus aktif, terklasifikasi, dan menggunakan mata uang booking.');
            }

            if ($lockedPayment->financial_account_id && $lockedPayment->financial_account_id !== $lockedReceiverAccount->id) {
                throw new DomainException('Payment sudah dipetakan ke rekening lain. Koreksi melalui halaman Booking Payment.');
            }

            $attributes = $this->prepareFinancialSnapshot($lockedBooking, [
                'amount' => $lockedPayment->amount,
                'currency' => $lockedPayment->currency ?? $this->bookingCurrency($lockedBooking),
                'exchange_rate' => $lockedPayment->exchange_rate ?? 1,
                'attachment_override_reason' => $lockedPayment->attachment_override_reason
                    ?? ($lockedPayment->attachment_path ? null : 'Rekonsiliasi data pembayaran lama tanpa bukti tersimpan.'),
            ]);

            $lockedPayment->forceFill([
                'financial_account_id' => $lockedReceiverAccount->id,
                'currency' => $attributes['currency'],
                'exchange_rate' => $attributes['exchange_rate'],
                'amount_idr' => $attributes['amount_idr'],
                'attachment_override_reason' => $attributes['attachment_override_reason'],
                'idempotency_key' => $lockedPayment->idempotency_key ?? 'booking-payment-backfill:'.$lockedPayment->id,
            ])->save();

            $this->syncCashflow($lockedBooking, $lockedPayment);
            $this->bookingPaymentLedgerService->sync($lockedBooking, $lockedPayment);

            return $lockedPayment->refresh();
        });
    }

    private function ensureNoPostedRefund(BookingPayment $payment): void
    {
        if (FinancialTransaction::query()
            ->where('transaction_type', 'customer_refund')
            ->where('status', 'posted')
            ->where('source_type', BookingPayment::class)
            ->where('source_id', $payment->id)
            ->exists()) {
            throw ValidationException::withMessages([
                'payment' => 'Pembayaran yang sudah direfund tidak dapat diubah atau dibatalkan. Koreksi refund terlebih dahulu.',
            ]);
        }
    }

    /** @return array{total_amount:int,paid_amount:int,remaining_amount:int,payment_status:string} */
    public function summary(Booking $booking): array
    {
        $totalAmount = $this->resolveTotalAmount($booking);
        $paidAmount = match (true) {
            $booking->relationLoaded('payments') => (int) $booking->payments
                ->where('status', 'confirmed')
                ->sum('amount'),
            array_key_exists('paid_amount', $booking->getAttributes()) => (int) $booking->getAttribute('paid_amount'),
            default => (int) $booking->payments()->where('status', 'confirmed')->sum('amount'),
        };
        $paymentIds = $booking->relationLoaded('payments')
            ? $booking->payments->pluck('id')
            : $booking->payments()->pluck('id');
        $refundedAmount = (int) FinancialTransaction::query()
            ->where('transaction_type', 'customer_refund')
            ->where('status', 'posted')
            ->where('source_type', BookingPayment::class)
            ->whereIn('source_id', $paymentIds)
            ->sum('amount_original');
        $paidAmount = max(0, $paidAmount - $refundedAmount);
        $remainingAmount = max(0, $totalAmount - $paidAmount);

        return [
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'payment_status' => match (true) {
                $paidAmount < 1 => 'unpaid',
                $remainingAmount > 0 => 'partial',
                default => 'paid',
            },
        ];
    }

    private function syncCashflow(Booking $booking, BookingPayment $payment): void
    {
        $cashflow = $payment->cashflow_id
            ? Cashflow::query()->withTrashed()->find($payment->cashflow_id)
            : null;

        if ($payment->status !== 'confirmed') {
            if ($cashflow instanceof Cashflow) {
                $this->cashflowService->reverseFromBookingPayment($cashflow);
            }

            return;
        }

        $payload = [
            'transaction_date' => $payment->payment_date,
            'type' => 'income',
            'amount' => $payment->amount_idr,
            'category' => 'booking_payment',
            'description' => 'Pembayaran Booking '.$booking->booking_code.($payment->notes ? ' - '.$payment->notes : ''),
        ];

        if ($cashflow instanceof Cashflow) {
            $this->cashflowService->updateFromBookingPayment($cashflow, $payload);

            return;
        }

        $cashflow = $this->cashflowService->create($payload, []);
        $payment->forceFill(['cashflow_id' => $cashflow->id])->save();
    }

    private function resolveTotalAmount(Booking $booking): int
    {
        $storedAmount = (int) ($booking->agreed_total_amount ?? $booking->custom_total_amount ?? 0);

        if ($storedAmount > 0) {
            return $storedAmount;
        }

        $booking->loadMissing('package');

        return max(0, (int) round($this->roomConfigurationService->calculateBookingAmount($booking)));
    }

    private function ensureFinanciallyOpen(Booking $booking): void
    {
        TravelPackage::query()->lockForUpdate()->find($booking->package_id)?->ensureFinanciallyOpen();
    }

    /** @param array<string, mixed> $attributes */
    private function prepareFinancialSnapshot(Booking $booking, array $attributes): array
    {
        $currency = strtoupper((string) ($attributes['currency'] ?? 'IDR'));
        $bookingCurrency = $this->bookingCurrency($booking);

        if ($currency !== $bookingCurrency) {
            throw ValidationException::withMessages([
                'currency' => 'Mata uang pembayaran harus sama dengan mata uang booking.',
            ]);
        }

        $exchangeRate = $currency === 'IDR'
            ? 1.0
            : (float) ($attributes['exchange_rate'] ?? 0);

        if ($exchangeRate <= 0) {
            throw ValidationException::withMessages([
                'exchange_rate' => 'Kurs pembayaran harus lebih dari nol.',
            ]);
        }

        $amountIdr = (int) round((int) ($attributes['amount'] ?? 0) * $exchangeRate);

        if ($amountIdr < 1) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal hasil konversi ke IDR minimal Rp 1.',
            ]);
        }

        $attributes['currency'] = $currency;
        $attributes['exchange_rate'] = number_format($exchangeRate, 8, '.', '');
        $attributes['amount_idr'] = $amountIdr;
        $attributes['attachment_override_reason'] = filled($attributes['attachment_override_reason'] ?? null)
            ? trim((string) $attributes['attachment_override_reason'])
            : null;

        return $attributes;
    }

    private function bookingCurrency(Booking $booking): string
    {
        $booking->loadMissing('package');

        return strtoupper((string) (
            $booking->agreed_currency
            ?? $booking->custom_currency
            ?? $booking->package?->currency
            ?? 'IDR'
        ));
    }

    /** @param array<string, mixed> $attributes */
    private function resolveIdempotentRetry(
        Booking $booking,
        BookingPayment $payment,
        array $attributes,
    ): BookingPayment {
        $comparableFields = [
            'payment_date',
            'amount',
            'currency',
            'exchange_rate',
            'amount_idr',
            'financial_account_id',
            'payment_method',
            'reference_number',
            'notes',
            'status',
            'attachment_override_reason',
        ];
        $stored = array_replace(array_fill_keys($comparableFields, null), Arr::only($payment->getAttributes(), $comparableFields));
        $incoming = array_replace(array_fill_keys($comparableFields, null), Arr::only($attributes, $comparableFields));
        $stored['payment_date'] = $payment->payment_date?->toDateString();
        $stored['exchange_rate'] = $payment->exchange_rate;
        $incoming['payment_date'] = (string) ($incoming['payment_date'] ?? '');
        $incoming['exchange_rate'] = number_format((float) ($incoming['exchange_rate'] ?? 0), 8, '.', '');

        if ($payment->booking_id !== $booking->id || $stored !== $incoming) {
            throw ValidationException::withMessages([
                'idempotency_key' => 'Permintaan pembayaran yang sama dikirim dengan data berbeda.',
            ]);
        }

        return $payment->refresh();
    }

    /** @param array<string, mixed> $attributes */
    private function ensurePaymentDoesNotExceedBalance(
        Booking $booking,
        array $attributes,
        ?BookingPayment $ignoredPayment = null,
    ): void {
        if (($attributes['status'] ?? null) !== 'confirmed') {
            return;
        }

        $confirmedPayments = $booking->payments()->where('status', 'confirmed');

        if ($ignoredPayment !== null) {
            $confirmedPayments->whereKeyNot($ignoredPayment->getKey());
        }

        $totalAmount = $this->resolveTotalAmount($booking);
        $paidAmount = (int) $confirmedPayments->sum('amount');
        $remainingAmount = max(0, $totalAmount - $paidAmount);
        $paymentAmount = (int) ($attributes['amount'] ?? 0);

        if ($totalAmount < 1) {
            throw ValidationException::withMessages([
                'amount' => 'Total tagihan booking belum tersedia. Perbarui nilai booking terlebih dahulu.',
            ]);
        }

        if ($paymentAmount > $remainingAmount) {
            throw ValidationException::withMessages([
                'amount' => sprintf(
                    'Nominal melebihi sisa tagihan. Maksimal pembayaran terverifikasi adalah Rp %s.',
                    number_format($remainingAmount, 0, ',', '.'),
                ),
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array{0: array<string, mixed>, 1: ?string}
     */
    private function prepareAttachment(array $attributes): array
    {
        $attachment = $attributes['attachment'] ?? null;
        unset($attributes['attachment']);

        if (! $attachment instanceof UploadedFile) {
            return [$attributes, null];
        }

        $storedPath = $attachment->store('booking_payments', 'public');
        $attributes['attachment_path'] = '/storage/'.$storedPath;

        return [$attributes, $attributes['attachment_path']];
    }

    private function deleteStoredAttachment(?string $publicPath): void
    {
        if (! is_string($publicPath) || ! str_starts_with($publicPath, '/storage/')) {
            return;
        }

        $diskPath = substr($publicPath, strlen('/storage/'));
        if ($diskPath !== '') {
            Storage::disk('public')->delete($diskPath);
        }
    }
}
