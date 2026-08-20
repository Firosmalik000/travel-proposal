<?php

namespace App\Actions\Booking;

use App\Mail\BookingPaymentReminder;
use App\Models\Booking;
use App\Services\BookingPaymentService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class SendBookingPaymentReminder
{
    public function __construct(
        private readonly BookingPaymentService $bookingPaymentService,
    ) {}

    public function handle(Booking $booking): void
    {
        $booking->loadMissing('package:id,name,code,currency');
        $summary = $this->bookingPaymentService->summary($booking);

        if ($summary['total_amount'] < 1) {
            throw ValidationException::withMessages([
                'reminder' => 'Total tagihan booking belum tersedia. Lengkapi nilai booking sebelum mengirim reminder.',
            ]);
        }

        if ($summary['payment_status'] === 'paid' || $summary['remaining_amount'] < 1) {
            throw ValidationException::withMessages([
                'reminder' => 'Booking sudah lunas sehingga reminder tidak perlu dikirim.',
            ]);
        }

        if (! is_string($booking->email) || ! filter_var($booking->email, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'reminder' => 'Alamat email customer belum tersedia atau tidak valid.',
            ]);
        }

        $invoiceUrl = route('customer.bookings.show', [
            'bookingCode' => $booking->booking_code,
        ]).'?tab=payments';

        Mail::to($booking->email)->send(
            new BookingPaymentReminder($booking, $summary, $invoiceUrl),
        );
    }
}
