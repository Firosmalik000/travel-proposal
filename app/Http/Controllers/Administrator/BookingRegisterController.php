<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManagePackageRegistrationRequest;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingRegisterController extends Controller
{
    public function __construct(
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Dashboard/Booking/Register/Index', [
            'registrations' => $this->registrations([
                'status' => 'pending',
            ]),
        ]);
    }

    public function listing(Request $request): Response
    {
        $bookingType = (string) $request->string('booking_type')->value();
        if (! in_array($bookingType, ['regular', 'custom', 'all'], true)) {
            $bookingType = 'regular';
        }

        $status = (string) $request->string('status')->value();
        if (! in_array($status, ['pending', 'registered', 'cancelled', 'all'], true)) {
            $status = 'registered';
        }

        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => $status !== '' ? $status : 'registered',
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
            'booking_type' => $bookingType,
        ];

        return Inertia::render('Dashboard/Booking/Listing/Index', [
            'registrations' => $this->bookings($filters),
            'packages' => $this->packages($filters),
            'schedules' => $this->schedules(),
            'filters' => $filters,
            'revenue' => $this->bookingRevenue($filters),
        ]);
    }

    public function listingPdf(Request $request): HttpResponse
    {
        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $bookingType = (string) $request->string('booking_type')->value();
        if (! in_array($bookingType, ['regular', 'custom', 'all'], true)) {
            $bookingType = 'regular';
        }

        $status = (string) $request->string('status')->value();
        if (! in_array($status, ['pending', 'registered', 'cancelled', 'all'], true)) {
            $status = 'registered';
        }

        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => $status !== '' ? $status : 'registered',
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
            'booking_type' => $bookingType,
        ];

        $travelPackage = $filters['travel_package_id']
            ? TravelPackage::query()->find($filters['travel_package_id'])
            : null;

        $rows = Booking::query()
            ->with([
                'package:id,code,name,price,currency',
                'departureSchedule:id,departure_date,departure_city',
            ])
            ->when(in_array($bookingType, ['regular', 'custom'], true), function ($query) use ($bookingType): void {
                $query->where('booking_type', $bookingType);
            })
            ->when($filters['travel_package_id'], function ($query) use ($filters): void {
                $query->where('package_id', (int) $filters['travel_package_id']);
            })
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = (string) $filters['search'];
                $query->where(function ($registrationQuery) use ($search): void {
                    $registrationQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%")
                        ->orWhereHas('package', function ($packageQuery) use ($search): void {
                            $packageQuery->where('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array((string) $filters['status'], ['pending', 'registered', 'cancelled'], true), function ($query) use ($filters): void {
                $query->where('status', (string) $filters['status']);
            })
            ->latest()
            ->limit(500)
            ->get()
            ->map(function (Booking $booking): array {
                $packageName = (string) ($booking->package?->name['id'] ?? $booking->package?->code ?? '-');
                $packageCode = (string) ($booking->package?->code ?? '-');
                $departureDate = $booking->booking_type === 'custom'
                    ? ($booking->custom_departure_date?->toDateString() ?? '-')
                    : ($booking->departureSchedule?->departure_date?->toDateString() ?? '-');
                $departureCity = $booking->booking_type === 'custom'
                    ? 'Custom'
                    : (string) ($booking->departureSchedule?->departure_city ?? '-');

                $currency = $booking->booking_type === 'custom'
                    ? (string) ($booking->custom_currency ?: 'IDR')
                    : (string) ($booking->package?->currency ?: 'IDR');

                $amount = $booking->booking_type === 'custom'
                    ? (float) (($booking->custom_total_amount ?? null) ?? ((int) ($booking->custom_unit_price ?? 0) * (int) $booking->passenger_count))
                    : (float) ($booking->passenger_count * (float) ($booking->package?->price ?? 0));

                return [
                    'booking_code' => $booking->booking_code,
                    'full_name' => $booking->full_name,
                    'phone' => $booking->phone,
                    'origin_city' => $booking->origin_city,
                    'pax' => (int) $booking->passenger_count,
                    'revenue' => [
                        'currency' => $currency,
                        'amount' => $amount,
                    ],
                    'package' => trim(sprintf('%s (%s)', $packageName, $packageCode)),
                    'departure' => $departureDate !== '-'
                        ? sprintf('%s • %s', $departureDate, $departureCity)
                        : '-',
                ];
            })
            ->values()
            ->all();

        $packageLabel = $travelPackage
            ? (string) ($travelPackage->name['id'] ?? $travelPackage->code ?? 'Paket')
            : 'Semua paket';

        $safeFilename = preg_replace('/[^A-Za-z0-9._-]+/', '-', sprintf(
            'booking-listing-%s.pdf',
            now()->format('Ymd-His'),
        )) ?: 'booking-listing.pdf';

        return $this->pdfRenderer->renderInline(
            view: 'pdf.booking-listing',
            data: [
                'filters' => [
                    'search' => (string) $filters['search'],
                    'status' => (string) $filters['status'],
                    'package_label' => $packageLabel,
                    'booking_type' => (string) $filters['booking_type'],
                ],
                'rows' => $rows,
            ],
            filename: $safeFilename,
            mpdfConfig: [
                'orientation' => 'L',
                'margin_left' => 10,
                'margin_right' => 10,
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

    public function participantPdf(Booking $registration): HttpResponse
    {
        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $registration->loadMissing([
            'package:id,code,name,package_type,departure_city,duration_days,price,currency',
            'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
        ]);

        $packageName = (string) ($registration->package?->name['id'] ?? $registration->package?->code ?? '');
        $bookingCode = $registration->booking_code;

        $metaRows = [
            ['Kode Booking', $bookingCode],
            ['Nama Pemesan', (string) $registration->full_name],
            ['WhatsApp', (string) $registration->phone],
            ['Email', (string) ($registration->email ?? '-')],
            ['Kota Asal', (string) $registration->origin_city],
            ['Jumlah Pax', (string) $registration->passenger_count],
            ['Paket', trim(sprintf('%s (%s)', $packageName, (string) ($registration->package?->code ?? '-')))],
            [
                'Keberangkatan',
                $registration->departureSchedule?->departure_date?->toDateString()
                    ? sprintf(
                        '%s (%s)',
                        $registration->departureSchedule?->departure_date?->toDateString(),
                        (string) ($registration->departureSchedule?->departure_city ?? '-'),
                    )
                    : '-',
            ],
        ];

        $participantRows = [];
        $paxCount = max((int) $registration->passenger_count, 1);
        for ($i = 1; $i <= $paxCount; $i++) {
            $participantRows[] = [
                $i,
                '',
                '',
                '',
                '',
            ];
        }

        return $this->pdfRenderer->renderInline(
            view: 'pdf.participants',
            data: [
                'bookingCode' => $bookingCode,
                'metaRows' => $metaRows,
                'participantRows' => $participantRows,
                'notes' => (string) ($registration->notes ?? ''),
            ],
            filename: 'peserta-'.$bookingCode.'.pdf',
            mpdfConfig: [
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

    public function invoicePdf(Booking $registration): HttpResponse
    {
        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $registration->loadMissing([
            'package:id,code,name,package_type,departure_city,duration_days,price,currency',
            'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
        ]);

        $bookingCode = (string) $registration->booking_code;
        $packageName = (string) ($registration->package?->name['id'] ?? $registration->package?->code ?? '');

        $departureDate = $registration->booking_type === 'custom'
            ? $registration->custom_departure_date?->toDateString()
            : $registration->departureSchedule?->departure_date?->toDateString();

        $returnDate = $registration->booking_type === 'custom'
            ? $registration->custom_return_date?->toDateString()
            : $registration->departureSchedule?->return_date?->toDateString();

        $departureCity = $registration->booking_type === 'custom'
            ? 'Custom'
            : (string) ($registration->departureSchedule?->departure_city ?? '-');

        $currency = $registration->booking_type === 'custom'
            ? (string) ($registration->custom_currency ?: 'IDR')
            : (string) ($registration->package?->currency ?: 'IDR');

        $paxCount = max((int) $registration->passenger_count, 1);

        if ($registration->booking_type === 'custom') {
            $unitPrice = $registration->custom_unit_price !== null
                ? (float) $registration->custom_unit_price
                : (float) floor(((float) ($registration->custom_total_amount ?? 0)) / $paxCount);

            $totalAmount = $registration->custom_total_amount !== null
                ? (float) $registration->custom_total_amount
                : (float) ($unitPrice * $paxCount);
        } else {
            $rawPrice = $registration->package?->price ?? 0;
            $numericPrice = is_numeric($rawPrice)
                ? (float) $rawPrice
                : (float) preg_replace('/[^0-9.]/', '', (string) $rawPrice);

            $unitPrice = $numericPrice;
            $totalAmount = (float) ($paxCount * $numericPrice);
        }

        $metaRows = [
            ['Invoice', 'INV-'.now()->format('Ymd').'-'.$bookingCode],
            ['Kode Booking', $bookingCode],
            ['Nama Pemesan', (string) $registration->full_name],
            ['WhatsApp', (string) $registration->phone],
            ['Email', (string) ($registration->email ?? '-')],
            ['Kota Asal', (string) $registration->origin_city],
            ['Jumlah Pax', (string) $registration->passenger_count],
            ['Status', (string) $registration->status],
            ['Paket', trim(sprintf('%s (%s)', $packageName, (string) ($registration->package?->code ?? '-')))],
            [
                'Jadwal',
                $departureDate
                    ? sprintf('%s - %s (%s)', $departureDate, $returnDate ?: '-', $departureCity)
                    : '-',
            ],
        ];

        $lineItems = [
            [
                'label' => $registration->booking_type === 'custom' ? 'Custom booking' : 'Booking paket',
                'qty' => $paxCount,
                'unit_price' => $unitPrice,
                'amount' => $totalAmount,
            ],
        ];

        $safeFilename = Str::of($bookingCode)
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->prepend('invoice-')
            ->append('.pdf')
            ->value();

        return $this->pdfRenderer->renderInline(
            view: 'pdf.invoice',
            data: [
                'bookingCode' => $bookingCode,
                'currency' => $currency,
                'metaRows' => $metaRows,
                'lineItems' => $lineItems,
                'totalAmount' => $totalAmount,
            ],
            filename: $safeFilename !== '' ? $safeFilename : 'invoice.pdf',
            mpdfConfig: [
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

    public function markRegistered(PackageRegistration $registration): RedirectResponse
    {
        $registration->loadMissing(['departureSchedule', 'package:id,code']);

        $bookingCode = sprintf(
            'BK-%s-%04d',
            $registration->created_at?->format('ymd') ?? now()->format('ymd'),
            $registration->id,
        );

        Booking::query()->create([
            'booking_code' => $bookingCode,
            'package_id' => $registration->package_id,
            'departure_schedule_id' => $registration->departure_schedule_id,
            'full_name' => $registration->full_name,
            'phone' => $registration->phone,
            'email' => $registration->email,
            'origin_city' => $registration->origin_city,
            'passenger_count' => $registration->passenger_count,
            'notes' => $registration->notes,
            'status' => 'registered',
            'created_at' => $registration->created_at,
        ]);

        $schedule = $registration->departureSchedule;
        $registration->delete();

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.register.index')->with(
            'success',
            'Booking berhasil dipindahkan ke listing registered.',
        );
    }

    public function store(ManagePackageRegistrationRequest $request): RedirectResponse
    {
        $schedule = $request->selectedSchedule();

        $bookingCode = sprintf(
            'BK-%s-%04d',
            now()->format('ymdHis'),
            random_int(0, 9999),
        );

        $booking = Booking::query()->create([
            'booking_code' => $bookingCode,
            'package_id' => $request->integer('travel_package_id'),
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'status' => $request->string('status')->value(),
        ]);

        if ($schedule !== null) {
            $schedule->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil ditambahkan.');
    }

    public function update(ManagePackageRegistrationRequest $request, Booking $registration): RedirectResponse
    {
        $previousSchedule = $registration->departureSchedule;
        $schedule = $request->selectedSchedule();

        $payload = [
            'package_id' => $request->integer('travel_package_id'),
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'status' => $request->string('status')->value(),
        ];

        if ($registration->booking_type === 'custom') {
            $customUnitPrice = $request->filled('custom_unit_price')
                ? $request->integer('custom_unit_price')
                : (int) ($registration->custom_unit_price ?? 0);

            $payload['departure_schedule_id'] = null;
            $payload['custom_departure_date'] = $request->filled('custom_departure_date')
                ? $request->date('custom_departure_date')
                : $registration->custom_departure_date;
            $payload['custom_return_date'] = $request->filled('custom_return_date')
                ? $request->date('custom_return_date')
                : $registration->custom_return_date;
            $payload['custom_unit_price'] = $customUnitPrice;
            $payload['custom_total_amount'] = (int) $customUnitPrice * (int) $payload['passenger_count'];
            $payload['custom_currency'] = $registration->custom_currency ?: 'IDR';
        }

        $registration->update($payload);

        if ($previousSchedule !== null) {
            $previousSchedule->refresh()->syncSeatAvailability();
        }

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil diperbarui.');
    }

    public function destroyPending(PackageRegistration $registration): RedirectResponse
    {
        $schedule = $registration->departureSchedule;
        $registration->delete();

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return back()->with('success', 'Data registrasi berhasil dihapus.');
    }

    public function destroy(Booking $registration): RedirectResponse
    {
        $schedule = $registration->departureSchedule;
        $registration->delete();

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return back()->with('success', 'Booking berhasil dihapus.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function registrations(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');
        $travelPackageId = (int) ($filters['travel_package_id'] ?? 0);

        return PackageRegistration::query()
            ->with([
                'package:id,code,slug,name,package_type',
                'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
            ])
            ->when($travelPackageId > 0, function ($query) use ($travelPackageId): void {
                $query->where('package_id', $travelPackageId);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($registrationQuery) use ($search): void {
                    $registrationQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%")
                        ->orWhereHas('package', function ($packageQuery) use ($search): void {
                            $packageQuery
                                ->where('code', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('departureSchedule', function ($scheduleQuery) use ($search): void {
                            $scheduleQuery->where('departure_city', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (PackageRegistration $registration): array => [
                'id' => $registration->id,
                'booking_code' => sprintf(
                    'BK-%s-%04d',
                    $registration->created_at?->format('ymd') ?? now()->format('ymd'),
                    $registration->id,
                ),
                'full_name' => $registration->full_name,
                'phone' => $registration->phone,
                'email' => $registration->email,
                'origin_city' => $registration->origin_city,
                'passenger_count' => $registration->passenger_count,
                'notes' => $registration->notes,
                'status' => $registration->status,
                'created_at' => $registration->created_at?->toDateTimeString(),
                'travel_package_id' => $registration->package_id,
                'departure_schedule_id' => $registration->departure_schedule_id,
                'travel_package' => [
                    'code' => $registration->package?->code,
                    'slug' => $registration->package?->slug,
                    'name' => $registration->package?->name,
                    'package_type' => $registration->package?->package_type,
                ],
                'departure_schedule' => [
                    'departure_date' => $registration->departureSchedule?->departure_date?->toDateString(),
                    'return_date' => $registration->departureSchedule?->return_date?->toDateString(),
                    'departure_city' => $registration->departureSchedule?->departure_city,
                    'status' => $registration->departureSchedule?->status,
                ],
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function bookings(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');
        $travelPackageId = (int) ($filters['travel_package_id'] ?? 0);
        $bookingType = (string) ($filters['booking_type'] ?? 'regular');

        return Booking::query()
            ->with([
                'package:id,code,slug,name,package_type,price,currency',
                'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
            ])
            ->withExists('testimonial')
            ->when(in_array($bookingType, ['regular', 'custom'], true), function ($query) use ($bookingType): void {
                $query->where('booking_type', $bookingType);
            })
            ->when($travelPackageId > 0, function ($query) use ($travelPackageId): void {
                $query->where('package_id', $travelPackageId);
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($registrationQuery) use ($search): void {
                    $registrationQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%")
                        ->orWhereHas('package', function ($packageQuery) use ($search): void {
                            $packageQuery
                                ->where('code', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('departureSchedule', function ($scheduleQuery) use ($search): void {
                            $scheduleQuery->where('departure_city', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (Booking $booking): array {
                $currency = $booking->booking_type === 'custom'
                    ? (string) ($booking->custom_currency ?: 'IDR')
                    : (string) ($booking->package?->currency ?: 'IDR');

                $amount = $booking->booking_type === 'custom'
                    ? (float) ($booking->custom_total_amount ?? 0)
                    : (float) ($booking->passenger_count * (float) ($booking->package?->price ?? 0));

                $departureDate = $booking->booking_type === 'custom'
                    ? $booking->custom_departure_date?->toDateString()
                    : $booking->departureSchedule?->departure_date?->toDateString();

                $returnDate = $booking->booking_type === 'custom'
                    ? $booking->custom_return_date?->toDateString()
                    : $booking->departureSchedule?->return_date?->toDateString();

                $departureCity = $booking->booking_type === 'custom'
                    ? 'Custom'
                    : $booking->departureSchedule?->departure_city;

                return [
                    'id' => $booking->id,
                    'booking_type' => (string) ($booking->booking_type ?: 'regular'),
                    'booking_code' => $booking->booking_code,
                    'full_name' => $booking->full_name,
                    'phone' => $booking->phone,
                    'email' => $booking->email,
                    'origin_city' => $booking->origin_city,
                    'passenger_count' => $booking->passenger_count,
                    'custom_unit_price' => $booking->booking_type === 'custom'
                        ? (int) ($booking->custom_unit_price ?? 0)
                        : null,
                    'custom_total_amount' => $booking->booking_type === 'custom'
                        ? (int) ($booking->custom_total_amount ?? 0)
                        : null,
                    'revenue' => [
                        'currency' => $currency,
                        'amount' => $amount,
                    ],
                    'notes' => $booking->notes,
                    'status' => $booking->status,
                    'created_at' => $booking->created_at?->toDateTimeString(),
                    'travel_package_id' => $booking->package_id,
                    'departure_schedule_id' => $booking->departure_schedule_id,
                    'travel_package' => [
                        'code' => $booking->package?->code,
                        'slug' => $booking->package?->slug,
                        'name' => $booking->package?->name,
                        'package_type' => $booking->package?->package_type,
                    ],
                    'departure_schedule' => [
                        'departure_date' => $departureDate,
                        'return_date' => $returnDate,
                        'departure_city' => $departureCity,
                        'status' => $booking->departureSchedule?->status,
                    ],
                    'has_review' => (bool) ($booking->testimonial_exists ?? false),
                    'review_url' => ($booking->testimonial_exists ?? false) ? null : URL::temporarySignedRoute(
                        'public.booking.review.show',
                        now()->addDays(30),
                        ['booking' => $booking->booking_code],
                    ),
                ];
            })
            ->toArray();
    }

    /**
     * @return array{by_currency: array<int, array{currency: string, amount: float, pax: int, bookings: int}>}
     */
    private function bookingRevenue(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');
        $travelPackageId = (int) ($filters['travel_package_id'] ?? 0);
        $bookingType = (string) ($filters['booking_type'] ?? 'regular');

        if ($bookingType === 'custom') {
            $byCurrency = Booking::query()
                ->where('booking_type', 'custom')
                ->when($travelPackageId > 0, function ($query) use ($travelPackageId): void {
                    $query->where('package_id', $travelPackageId);
                })
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($registrationQuery) use ($search): void {
                        $registrationQuery
                            ->where('booking_code', 'like', "%{$search}%")
                            ->orWhere('full_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('origin_city', 'like', "%{$search}%");
                    });
                })
                ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($query) use ($status): void {
                    $query->where('status', $status);
                })
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
                ])
                ->values()
                ->all();

            return [
                'by_currency' => $byCurrency,
            ];
        }

        if ($bookingType === 'all') {
            $regularRevenue = $this->bookingRevenue([
                ...$filters,
                'booking_type' => 'regular',
            ]);

            $customRevenue = $this->bookingRevenue([
                ...$filters,
                'booking_type' => 'custom',
            ]);

            $merged = [];
            foreach (array_merge($regularRevenue['by_currency'], $customRevenue['by_currency']) as $row) {
                $currency = (string) ($row['currency'] ?? 'IDR');
                if (! isset($merged[$currency])) {
                    $merged[$currency] = [
                        'currency' => $currency,
                        'amount' => 0.0,
                        'pax' => 0,
                        'bookings' => 0,
                    ];
                }

                $merged[$currency]['amount'] += (float) ($row['amount'] ?? 0);
                $merged[$currency]['pax'] += (int) ($row['pax'] ?? 0);
                $merged[$currency]['bookings'] += (int) ($row['bookings'] ?? 0);
            }

            $mergedRows = array_values($merged);
            usort($mergedRows, fn (array $left, array $right): int => ($right['amount'] <=> $left['amount']));

            return [
                'by_currency' => $mergedRows,
            ];
        }

        $query = Booking::query()
            ->leftJoin('packages', 'bookings.package_id', '=', 'packages.id')
            ->leftJoin('departure_schedules', 'bookings.departure_schedule_id', '=', 'departure_schedules.id')
            ->where('bookings.booking_type', 'regular')
            ->when($travelPackageId > 0, function ($builder) use ($travelPackageId): void {
                $builder->where('bookings.package_id', $travelPackageId);
            })
            ->when($search !== '', function ($builder) use ($search): void {
                $builder->where(function ($registrationQuery) use ($search): void {
                    $registrationQuery
                        ->where('bookings.full_name', 'like', "%{$search}%")
                        ->orWhere('bookings.phone', 'like', "%{$search}%")
                        ->orWhere('bookings.email', 'like', "%{$search}%")
                        ->orWhere('bookings.origin_city', 'like', "%{$search}%")
                        ->orWhere('packages.code', 'like', "%{$search}%")
                        ->orWhere('packages.name', 'like', "%{$search}%")
                        ->orWhere('departure_schedules.departure_city', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($builder) use ($status): void {
                $builder->where('bookings.status', $status);
            });

        $byCurrency = (clone $query)
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
            ])
            ->values()
            ->all();

        return [
            'by_currency' => $byCurrency,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function packages(array $filters = []): array
    {
        $status = (string) ($filters['status'] ?? 'registered');

        return TravelPackage::query()
            ->where('is_active', true)
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($query) use ($status): void {
                $query->whereHas('registrations', function ($registrationQuery) use ($status): void {
                    $registrationQuery->where('status', $status);
                });
            })
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'package_type'])
            ->map(fn (TravelPackage $travelPackage): array => [
                'id' => $travelPackage->id,
                'code' => $travelPackage->code,
                'name' => $travelPackage->name,
                'package_type' => $travelPackage->package_type,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function schedules(): array
    {
        return DepartureSchedule::query()
            ->where('is_active', true)
            ->withSum(
                ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                'passenger_count',
            )
            ->orderBy('departure_date')
            ->get([
                'id',
                'package_id',
                'departure_date',
                'return_date',
                'departure_city',
                'status',
                'seats_total',
                'seats_available',
            ])
            ->map(fn (DepartureSchedule $departureSchedule): array => [
                'id' => $departureSchedule->id,
                'travel_package_id' => $departureSchedule->package_id,
                'departure_date' => $departureSchedule->departure_date?->toDateString(),
                'return_date' => $departureSchedule->return_date?->toDateString(),
                'departure_city' => $departureSchedule->departure_city,
                'status' => $departureSchedule->status,
                'seats_total' => (int) $departureSchedule->seats_total,
                'seats_available' => $departureSchedule->availableSeatsCount(),
            ])
            ->values()
            ->all();
    }
}
