<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreBookingPaymentRequest;
use App\Http\Requests\Administrator\UpdateBookingPaymentRequest;
use App\Models\Booking;
use App\Models\BookingPayment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingPaymentController extends Controller
{
    public function index(Booking $booking): Response
    {
        $booking->load([
            'package:id,name,code,currency',
            'payments' => fn ($query) => $query->latest('payment_date')->latest('id'),
        ]);

        return Inertia::render('Dashboard/Booking/Payments/Index', [
            'booking' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'full_name' => $booking->full_name,
                'package_name' => data_get($booking->package?->name, 'id', $booking->package?->code),
                'agreed_total_amount' => (int) ($booking->agreed_total_amount ?? $booking->custom_total_amount ?? 0),
                'currency' => $booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR',
                'paid_amount' => (int) $booking->payments->where('status', 'confirmed')->sum('amount'),
                'payments' => $booking->payments->map(fn (BookingPayment $payment): array => [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date?->toDateString(),
                    'amount' => (int) $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'reference_number' => $payment->reference_number,
                    'notes' => $payment->notes,
                    'status' => $payment->status,
                ])->values()->all(),
            ],
        ]);
    }

    public function store(StoreBookingPaymentRequest $request, Booking $booking): RedirectResponse
    {
        $booking->payments()->create($request->validated());

        return back()->with('success', 'Pembayaran berhasil ditambahkan.');
    }

    public function update(UpdateBookingPaymentRequest $request, Booking $booking, BookingPayment $payment): RedirectResponse
    {
        abort_unless($payment->booking_id === $booking->id, 404);
        $payment->update($request->validated());

        return back()->with('success', 'Pembayaran berhasil diperbarui.');
    }

    public function destroy(Booking $booking, BookingPayment $payment): RedirectResponse
    {
        abort_unless($payment->booking_id === $booking->id, 404);
        $payment->delete();

        return back()->with('success', 'Pembayaran berhasil dihapus.');
    }
}
