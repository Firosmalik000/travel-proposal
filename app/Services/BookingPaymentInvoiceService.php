<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class BookingPaymentInvoiceService
{
    public function __construct(
        private readonly BookingPaymentService $bookingPaymentService,
        private readonly PdfBrandingService $pdfBrandingService,
        private readonly PdfRenderer $pdfRenderer,
    ) {}

    /** @return array<int, array<string, mixed>> */
    public function payloads(Booking $booking): array
    {
        $booking->loadMissing([
            'package:id,code,name,currency',
            'payments' => fn ($query) => $query
                ->whereIn('status', ['pending', 'confirmed'])
                ->orderBy('payment_date')
                ->orderBy('id'),
        ]);

        $summary = $this->bookingPaymentService->summary($booking);
        $confirmedTotal = 0;

        return $booking->payments
            ->whereIn('status', ['pending', 'confirmed'])
            ->sortBy(fn (BookingPayment $payment): string => sprintf(
                '%s-%010d',
                $payment->payment_date?->format('Y-m-d') ?? '0000-00-00',
                $payment->id,
            ))
            ->map(function (BookingPayment $payment) use ($booking, $summary, &$confirmedTotal): array {
                if ($payment->status === 'confirmed') {
                    $confirmedTotal += (int) $payment->amount;
                }

                return [
                    'id' => $payment->id,
                    'invoice_number' => $this->invoiceNumber($booking, $payment),
                    'payment_date' => $payment->payment_date?->toDateString(),
                    'amount' => (int) $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'reference_number' => $payment->reference_number,
                    'notes' => $payment->notes,
                    'status' => $payment->status,
                    'recorded_at' => $payment->created_at?->toIso8601String(),
                    'total_amount' => $summary['total_amount'],
                    'paid_after' => $confirmedTotal,
                    'remaining_after' => max(0, $summary['total_amount'] - $confirmedTotal),
                    'download_url' => route('customer.payments.invoice.download', [
                        'booking' => $booking->booking_code,
                        'payment' => $payment->id,
                    ]),
                ];
            })
            ->reverse()
            ->values()
            ->all();
    }

    public function download(Booking $booking, BookingPayment $payment): Response
    {
        $booking->loadMissing('package:id,code,name,currency');
        $payload = collect($this->payloads($booking))->firstWhere('id', $payment->id);

        abort_unless(is_array($payload), 404);

        $generatedAt = now();
        $branding = $this->pdfBrandingService->branding();
        $invoiceNumber = (string) $payload['invoice_number'];
        $safeFilename = Str::of($invoiceNumber)
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->prepend('invoice-')
            ->append('.pdf')
            ->value();

        return $this->pdfRenderer->renderDownload(
            view: 'pdf.customer-payment-invoice',
            data: [
                'booking' => $booking,
                'invoice' => $payload,
                'invoiceNumber' => $invoiceNumber,
                'currency' => $booking->agreed_currency
                    ?? $booking->custom_currency
                    ?? $booking->package?->currency
                    ?? 'IDR',
                'packageName' => $booking->package?->name ?? $booking->package?->code ?? '-',
                'branding' => $branding,
                'seo' => $this->pdfBrandingService->seo(),
                'locale' => 'id',
                'generatedAt' => $generatedAt,
            ],
            filename: $safeFilename !== '' ? $safeFilename : 'invoice-pembayaran.pdf',
            footerView: 'pdf.partials.footer',
            footerData: ['branding' => $branding],
        );
    }

    public function invoiceNumber(Booking $booking, BookingPayment $payment): string
    {
        return sprintf('INV-%s-%04d', $booking->booking_code, $payment->id);
    }
}
