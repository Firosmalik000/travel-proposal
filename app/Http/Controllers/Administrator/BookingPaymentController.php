<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Booking\SendBookingPaymentReminder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreBookingPaymentRequest;
use App\Http\Requests\Administrator\UpdateBookingPaymentRequest;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Services\BookingPaymentService;
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
            'payments' => fn ($query) => $query->with('creator:id,name')->latest('payment_date')->latest('id'),
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
                'payments' => $booking->payments->map(fn (BookingPayment $payment): array => [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date?->toDateString(),
                    'amount' => (int) $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'reference_number' => $payment->reference_number,
                    'notes' => $payment->notes,
                    'status' => $payment->status,
                    'recorded_by' => $payment->creator?->name,
                    'created_at' => $payment->created_at?->toIso8601String(),
                    'updated_at' => $payment->updated_at?->toIso8601String(),
                ])->values()->all(),
            ],
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

    public function remind(Booking $booking, SendBookingPaymentReminder $sendReminder): RedirectResponse
    {
        $sendReminder->handle($booking);

        return back()->with('success', "Reminder pembayaran berhasil dikirim ke {$booking->email}.");
    }
}
