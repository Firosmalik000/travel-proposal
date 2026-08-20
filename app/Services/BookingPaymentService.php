<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingPaymentService
{
    public function __construct(
        private readonly PackageRoomConfigurationService $roomConfigurationService,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(Booking $booking, array $attributes): BookingPayment
    {
        return DB::transaction(function () use ($booking, $attributes): BookingPayment {
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());

            $this->ensurePaymentDoesNotExceedBalance($lockedBooking, $attributes);

            return $lockedBooking->payments()->create($attributes);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Booking $booking, BookingPayment $payment, array $attributes): BookingPayment
    {
        return DB::transaction(function () use ($booking, $payment, $attributes): BookingPayment {
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());
            $lockedPayment = BookingPayment::query()
                ->whereBelongsTo($lockedBooking)
                ->lockForUpdate()
                ->findOrFail($payment->getKey());

            $this->ensurePaymentDoesNotExceedBalance($lockedBooking, $attributes, $lockedPayment);
            $lockedPayment->update($attributes);

            return $lockedPayment->refresh();
        });
    }

    public function void(Booking $booking, BookingPayment $payment): void
    {
        DB::transaction(function () use ($booking, $payment): void {
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());
            $lockedPayment = BookingPayment::query()
                ->whereBelongsTo($lockedBooking)
                ->lockForUpdate()
                ->findOrFail($payment->getKey());

            $lockedPayment->update(['status' => 'void']);
        });
    }

    /**
     * @return array{total_amount:int,paid_amount:int,remaining_amount:int,payment_status:string}
     */
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

    private function resolveTotalAmount(Booking $booking): int
    {
        $storedAmount = (int) ($booking->agreed_total_amount ?? $booking->custom_total_amount ?? 0);

        if ($storedAmount > 0) {
            return $storedAmount;
        }

        $booking->loadMissing('package');

        return max(0, (int) round($this->roomConfigurationService->calculateBookingAmount($booking)));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
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
}
