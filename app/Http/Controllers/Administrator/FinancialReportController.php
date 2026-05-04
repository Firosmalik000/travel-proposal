<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    public function __construct(
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
    ) {}

    public function index(Request $request): Response
    {
        [$filters, $rows] = $this->reportData($request);

        return Inertia::render('Dashboard/FinancialManagement/FinancialReport/Index', [
            'filters' => $filters,
            'rows' => $rows,
        ]);
    }

    public function pdf(Request $request): HttpResponse
    {
        [$filters, $rows] = $this->reportData($request);

        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $safeFilename = preg_replace('/[^A-Za-z0-9._-]+/', '-', sprintf(
            'financial-report-%s-%s-%s.pdf',
            (string) ($filters['booking_type'] ?? 'all'),
            (string) ($filters['status'] ?? 'all'),
            $generatedAt->format('Ymd-His'),
        )) ?: 'financial-report.pdf';

        return $this->pdfRenderer->renderDownload(
            view: 'pdf.financial-report',
            data: [
                'filters' => $filters,
                'rows' => $rows,
                'generatedAt' => $generatedAt,
            ],
            filename: $safeFilename,
            mpdfConfig: [
                'orientation' => 'P',
                'margin_top' => 34,
                'margin_bottom' => 22,
            ],
            headerView: 'pdf.partials.header',
            headerData: [
                'locale' => $locale,
                'branding' => $branding,
                'seo' => $seo,
                'generatedAt' => $generatedAt,
            ],
            footerView: 'pdf.partials.footer',
            footerData: [
                'branding' => $branding,
            ],
        );
    }

    /**
     * @return array{0: array{booking_type:string,status:string}, 1: array<int, array<string, mixed>>}
     */
    private function reportData(Request $request): array
    {
        $bookingType = (string) $request->string('booking_type')->value();
        if (! in_array($bookingType, ['regular', 'custom', 'all'], true)) {
            $bookingType = 'all';
        }

        $status = (string) $request->string('status')->value();
        if (! in_array($status, ['pending', 'registered', 'cancelled', 'all'], true)) {
            $status = 'all';
        }

        $filters = [
            'booking_type' => $bookingType,
            'status' => $status,
        ];

        $regularByCurrency = $bookingType === 'custom'
            ? []
            : Booking::query()
                ->join('packages', 'bookings.package_id', '=', 'packages.id')
                ->where('bookings.booking_type', 'regular')
                ->when($status !== 'all', fn ($query) => $query->where('bookings.status', $status))
                ->selectRaw('packages.currency as currency')
                ->selectRaw('COUNT(bookings.id) as bookings')
                ->selectRaw('COALESCE(SUM(bookings.passenger_count), 0) as pax')
                ->selectRaw('COALESCE(SUM(bookings.passenger_count * packages.price), 0) as amount')
                ->groupBy('packages.currency')
                ->orderByDesc(DB::raw('amount'))
                ->get()
                ->map(fn ($row): array => [
                    'currency' => (string) ($row->currency ?: 'IDR'),
                    'amount' => (float) ($row->amount ?? 0),
                    'pax' => (int) ($row->pax ?? 0),
                    'bookings' => (int) ($row->bookings ?? 0),
                    'booking_type' => 'regular',
                ])
                ->values()
                ->all();

        $customByCurrency = $bookingType === 'regular'
            ? []
            : Booking::query()
                ->where('booking_type', 'custom')
                ->when($status !== 'all', fn ($query) => $query->where('status', $status))
                ->selectRaw('COALESCE(custom_currency, \'IDR\') as currency')
                ->selectRaw('COUNT(id) as bookings')
                ->selectRaw('COALESCE(SUM(passenger_count), 0) as pax')
                ->selectRaw('COALESCE(SUM(custom_total_amount), 0) as amount')
                ->groupBy('custom_currency')
                ->orderByDesc(DB::raw('amount'))
                ->get()
                ->map(fn ($row): array => [
                    'currency' => (string) ($row->currency ?: 'IDR'),
                    'amount' => (float) ($row->amount ?? 0),
                    'pax' => (int) ($row->pax ?? 0),
                    'bookings' => (int) ($row->bookings ?? 0),
                    'booking_type' => 'custom',
                ])
                ->values()
                ->all();

        return [
            $filters,
            [
                ...$regularByCurrency,
                ...$customByCurrency,
            ],
        ];
    }
}
