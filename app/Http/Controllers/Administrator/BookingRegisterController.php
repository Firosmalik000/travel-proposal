<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManagePackageRegistrationRequest;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
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
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => 'registered',
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
        ];

        return Inertia::render('Dashboard/Booking/Listing/Index', [
            'registrations' => $this->registrations($filters),
            'packages' => $this->packages($filters),
            'schedules' => $this->schedules(),
            'filters' => $filters,
        ]);
    }

    public function listingPdf(Request $request): HttpResponse
    {
        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => in_array($request->string('status')->value(), ['pending', 'registered', 'cancelled'], true)
                ? $request->string('status')->value()
                : 'registered',
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
        ];

        $travelPackage = $filters['travel_package_id']
            ? TravelPackage::query()->find($filters['travel_package_id'])
            : null;

        $rows = PackageRegistration::query()
            ->with([
                'package:id,code,name',
                'departureSchedule:id,departure_date,departure_city',
            ])
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
            ->when($filters['status'], function ($query) use ($filters): void {
                $query->where('status', (string) $filters['status']);
            })
            ->latest()
            ->limit(500)
            ->get()
            ->map(function (PackageRegistration $registration): array {
                $bookingCode = sprintf(
                    'BK-%s-%04d',
                    $registration->created_at?->format('ymd') ?? now()->format('ymd'),
                    $registration->id,
                );

                $packageName = (string) ($registration->package?->name['id'] ?? $registration->package?->code ?? '-');
                $packageCode = (string) ($registration->package?->code ?? '-');
                $departureDate = $registration->departureSchedule?->departure_date?->toDateString() ?? '-';
                $departureCity = (string) ($registration->departureSchedule?->departure_city ?? '-');

                return [
                    'booking_code' => $bookingCode,
                    'full_name' => $registration->full_name,
                    'phone' => $registration->phone,
                    'origin_city' => $registration->origin_city,
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

    public function participantPdf(PackageRegistration $registration): HttpResponse
    {
        $generatedAt = now();
        $locale = 'id';
        $branding = $this->pdfBrandingService->branding();
        $seo = $this->pdfBrandingService->seo();

        $registration->loadMissing([
            'package:id,code,name,package_type,departure_city,duration_days,price,currency',
            'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
        ]);

        $packageName = (string) ($registration->package?->name ?? '');
        $bookingCode = sprintf(
            'BK-%s-%04d',
            $registration->created_at?->format('ymd') ?? now()->format('ymd'),
            $registration->id,
        );

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

    public function markRegistered(PackageRegistration $registration): RedirectResponse
    {
        $registration->update([
            'status' => 'registered',
        ]);

        if ($registration->departureSchedule !== null) {
            $registration->departureSchedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.register.index')->with(
            'success',
            'Booking berhasil dipindahkan ke listing registered.',
        );
    }

    public function store(ManagePackageRegistrationRequest $request): RedirectResponse
    {
        $schedule = $request->selectedSchedule();

        $registration = PackageRegistration::query()->create([
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

    public function update(ManagePackageRegistrationRequest $request, PackageRegistration $registration): RedirectResponse
    {
        $previousSchedule = $registration->departureSchedule;
        $schedule = $request->selectedSchedule();

        $registration->update([
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

        if ($previousSchedule !== null) {
            $previousSchedule->refresh()->syncSeatAvailability();
        }

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil diperbarui.');
    }

    public function destroy(PackageRegistration $registration): RedirectResponse
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
                'booking_code' => sprintf('BK-%s-%04d', $registration->created_at?->format('ymd') ?? now()->format('ymd'), $registration->id),
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
    private function packages(array $filters = []): array
    {
        $status = (string) ($filters['status'] ?? 'registered');

        return TravelPackage::query()
            ->where('is_active', true)
            ->when($status !== '', function ($query) use ($status): void {
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
                'seats_available',
            ])
            ->map(fn (DepartureSchedule $departureSchedule): array => [
                'id' => $departureSchedule->id,
                'travel_package_id' => $departureSchedule->package_id,
                'departure_date' => $departureSchedule->departure_date?->toDateString(),
                'return_date' => $departureSchedule->return_date?->toDateString(),
                'departure_city' => $departureSchedule->departure_city,
                'status' => $departureSchedule->status,
                'seats_available' => $departureSchedule->availableSeatsCount(),
            ])
            ->values()
            ->all();
    }
}
