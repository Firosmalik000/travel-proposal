<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Services\BookingPaymentInvoiceService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class BookingPaymentInvoiceController extends Controller
{
    public function __invoke(
        Booking $booking,
        BookingPayment $payment,
        BookingPaymentInvoiceService $invoiceService,
    ): Response {
        Gate::authorize('view', $booking);
        abort_unless($payment->booking_id === $booking->id, 404);
        abort_unless(in_array($payment->status, ['pending', 'confirmed'], true), 404);

        return $invoiceService->download($booking, $payment);
    }
}
