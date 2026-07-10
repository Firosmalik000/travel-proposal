<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\BulkStoreBookingParticipantRequest;
use App\Http\Requests\Administrator\StoreBookingParticipantRequest;
use App\Http\Requests\Administrator\UpdateBookingParticipantRequest;
use App\Http\Requests\ManagePackageRegistrationRequest;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\BookingParticipantImportService;
use App\Services\InventoryStockService;
use App\Services\PackageRoomConfigurationService;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use App\Support\ParticipantUploadLimit;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingRegisterController extends Controller
{
    public function __construct(
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
        private readonly InventoryStockService $inventoryStockService,
        private readonly BookingParticipantImportService $bookingParticipantImportService,
        private readonly PackageRoomConfigurationService $packageRoomConfigurationService,
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
            'participant_upload_max_kilobytes' => $this->participantUploadMaxKilobytes(),
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
                'package:id,code,name,price,currency,content',
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
                    : $this->packageRoomConfigurationService->calculateBookingAmount($booking);

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
                'branding' => $branding,
                'seo' => $seo,
                'locale' => $locale,
                'generatedAt' => $generatedAt,
                'rows' => $rows,
            ],
            filename: $safeFilename,
            mpdfConfig: [
                'orientation' => 'L',
                'margin_left' => 10,
                'margin_right' => 10,
                'margin_top' => 18,
                'margin_bottom' => 22,
            ],
            footerView: 'pdf.partials.footer',
            footerData: [
                'branding' => $branding,
            ],
        );
    }

    public function participants(Booking $registration): JsonResponse
    {
        $registration->loadMissing('participants');

        return response()->json([
            'booking' => [
                'id' => $registration->id,
                'booking_code' => $registration->booking_code,
                'passenger_count' => (int) $registration->passenger_count,
                'participants_count' => $registration->participants->count(),
                'remaining_slots' => max((int) $registration->passenger_count - $registration->participants->count(), 0),
            ],
            'participants' => $registration->participants
                ->sortBy('id')
                ->values()
                ->map(fn (BookingParticipant $participant): array => $this->participantPayload($participant))
                ->all(),
        ]);
    }

    public function storeParticipant(StoreBookingParticipantRequest $request, Booking $registration): RedirectResponse
    {
        $participant = $registration->participants()->create($this->participantPayloadFromRequest($request, $registration));

        return back()->with('participant_payload', [
            'participant' => $this->participantPayload($participant->fresh()),
            'message' => 'Data peserta berhasil ditambahkan.',
        ]);
    }

    public function updateParticipant(UpdateBookingParticipantRequest $request, Booking $registration, BookingParticipant $participant): RedirectResponse
    {
        abort_unless($participant->booking_id === $registration->id, 404);

        $participant->fill($this->participantPayloadFromRequest($request, $registration, $participant));
        $participant->save();

        return back()->with('participant_payload', [
            'participant' => $this->participantPayload($participant->fresh()),
            'message' => 'Data peserta berhasil diperbarui.',
        ]);
    }

    public function importParticipants(BulkStoreBookingParticipantRequest $request, Booking $registration): JsonResponse
    {
        $result = $this->bookingParticipantImportService->handle(
            $registration,
            (array) $request->validated('participants'),
        );

        return response()->json([
            'message' => 'Import data peserta selesai diproses.',
            'created_count' => $result['created_count'],
            'skipped_rows' => $result['skipped_rows'],
            'participants_count' => $registration->participants()->count(),
            'remaining_slots' => max((int) $registration->passenger_count - $registration->participants()->count(), 0),
        ]);
    }

    public function destroyParticipant(Booking $registration, BookingParticipant $participant): RedirectResponse
    {
        abort_unless($participant->booking_id === $registration->id, 404);

        foreach ([
            $participant->passport_scan_path,
            $participant->family_card_scan_path,
            $participant->marriage_book_scan_path,
            $participant->birth_certificate_scan_path,
            $participant->photo_path,
            $participant->meningitis_vaccine_scan_path,
        ] as $filePath) {
            if (is_string($filePath) && $filePath !== '' && Str::startsWith($filePath, '/storage/')) {
                Storage::disk('public')->delete(substr($filePath, strlen('/storage/')));
            }
        }

        $participant->delete();

        return back()->with('participant_payload', [
            'participant_id' => $participant->id,
            'message' => 'Data peserta berhasil dihapus.',
        ]);
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
            'participants',
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

        $participantRows = $registration->participants
            ->sortBy('id')
            ->values()
            ->map(function (BookingParticipant $participant, int $index): array {
                $birthPlace = trim((string) ($participant->birth_place ?? ''));
                $birthDate = $participant->birth_date?->format('d M Y');
                $birthLabel = trim(implode(', ', array_filter([$birthPlace, $birthDate])));
                $passportLabel = $participant->passport_ready
                    ? trim(implode(' • ', array_filter([
                        $participant->passport_type ? Str::headline((string) $participant->passport_type) : null,
                        $participant->passport_validity_years ? $participant->passport_validity_years.' tahun' : null,
                    ])))
                    : 'Belum siap';
                $specialNotes = array_values(array_filter([
                    $participant->needs_wheelchair ? 'Kursi roda' : null,
                    $participant->has_medical_history ? 'Riwayat penyakit' : null,
                    $participant->has_performed_umrah ? 'Pernah umrah' : null,
                ]));

                return [
                    'number' => $index + 1,
                    'full_name' => (string) $participant->full_name,
                    'gender' => $participant->gender === 'female' ? 'Perempuan' : ($participant->gender === 'male' ? 'Laki-laki' : '-'),
                    'birth' => $birthLabel !== '' ? $birthLabel : '-',
                    'marital_status' => $participant->marital_status ? Str::headline((string) $participant->marital_status) : '-',
                    'passport' => $passportLabel !== '' ? $passportLabel : '-',
                    'special_notes' => count($specialNotes) > 0 ? implode(', ', $specialNotes) : '-',
                ];
            })
            ->all();

        $paxCount = max((int) $registration->passenger_count, 1);

        for ($i = count($participantRows) + 1; $i <= $paxCount; $i++) {
            $participantRows[] = [
                'number' => $i,
                'full_name' => '',
                'gender' => '',
                'birth' => '',
                'marital_status' => '',
                'passport' => '',
                'special_notes' => '',
            ];
        }

        return $this->pdfRenderer->renderInline(
            view: 'pdf.participants',
            data: [
                'bookingCode' => $bookingCode,
                'branding' => $branding,
                'seo' => $seo,
                'locale' => $locale,
                'generatedAt' => $generatedAt,
                'metaRows' => $metaRows,
                'participantRows' => $participantRows,
                'notes' => (string) ($registration->notes ?? ''),
            ],
            filename: 'peserta-'.$bookingCode.'.pdf',
            mpdfConfig: [
                'margin_top' => 18,
                'margin_bottom' => 22,
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
            'package:id,code,name,package_type,departure_city,duration_days,price,currency,content',
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

            $lineItems = [
                [
                    'label' => 'Custom booking',
                    'qty' => $paxCount,
                    'unit_price' => $unitPrice,
                    'amount' => $totalAmount,
                ],
            ];
        } else {
            $lineItems = collect($this->packageRoomConfigurationService->buildLineItems(
                $registration->package,
                is_array($registration->room_configuration) ? $registration->room_configuration : null,
            ))
                ->map(fn (array $item): array => [
                    'label' => sprintf('%s x %d kamar (%d pax)', $item['label'], $item['rooms'], $item['pax']),
                    'qty' => $item['pax'],
                    'unit_price' => $item['unit_price'],
                    'amount' => $item['amount'],
                ])
                ->values()
                ->all();

            $totalAmount = $this->packageRoomConfigurationService->calculateTotalAmount(
                $registration->package,
                is_array($registration->room_configuration) ? $registration->room_configuration : null,
                $paxCount,
            );
            $unitPrice = $paxCount > 0 ? ($totalAmount / $paxCount) : 0.0;

            if (count($lineItems) === 0) {
                $lineItems = [
                    [
                        'label' => 'Booking paket',
                        'qty' => $paxCount,
                        'unit_price' => $unitPrice,
                        'amount' => $totalAmount,
                    ],
                ];
            }
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

        $safeFilename = Str::of($bookingCode)
            ->replaceMatches('/[^A-Za-z0-9._-]+/', '-')
            ->prepend('invoice-')
            ->append('.pdf')
            ->value();

        return $this->pdfRenderer->renderInline(
            view: 'pdf.invoice',
            data: [
                'bookingCode' => $bookingCode,
                'branding' => $branding,
                'seo' => $seo,
                'locale' => $locale,
                'generatedAt' => $generatedAt,
                'currency' => $currency,
                'metaRows' => $metaRows,
                'lineItems' => $lineItems,
                'totalAmount' => $totalAmount,
            ],
            filename: $safeFilename !== '' ? $safeFilename : 'invoice.pdf',
            mpdfConfig: [
                'margin_top' => 18,
                'margin_bottom' => 22,
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

        $schedule = $registration->departureSchedule;

        try {
            DB::transaction(function () use ($bookingCode, $registration): void {
                $booking = Booking::query()->create([
                    'booking_code' => $bookingCode,
                    'package_id' => $registration->package_id,
                    'departure_schedule_id' => $registration->departure_schedule_id,
                    'full_name' => $registration->full_name,
                    'phone' => $registration->phone,
                    'email' => $registration->email,
                    'origin_city' => $registration->origin_city,
                    'passenger_count' => $registration->passenger_count,
                    'room_configuration' => $registration->room_configuration,
                    'notes' => $registration->notes,
                    'status' => 'registered',
                    'created_at' => $registration->created_at,
                ]);

                $this->inventoryStockService->syncForBooking($booking);
                $registration->delete();
            });
        } catch (DomainException $exception) {
            return back()->withErrors([
                'booking' => $exception->getMessage(),
            ]);
        }

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

        try {
            DB::transaction(function () use ($request, $schedule, $bookingCode): void {
                $booking = Booking::query()->create([
                    'booking_code' => $bookingCode,
                    'package_id' => $request->integer('travel_package_id'),
                    'departure_schedule_id' => $schedule?->id,
                    'full_name' => $request->string('full_name')->value(),
                    'phone' => $request->string('phone')->value(),
                    'email' => $request->filled('email') ? $request->string('email')->value() : null,
                    'origin_city' => $request->string('origin_city')->value(),
                    'passenger_count' => $request->integer('passenger_count'),
                    'room_configuration' => $request->filled('room_configuration')
                        ? $this->packageRoomConfigurationService->normalizeConfiguration((array) $request->input('room_configuration', []))
                        : null,
                    'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
                    'status' => $request->string('status')->value(),
                ]);

                $this->inventoryStockService->syncForBooking($booking);
            });
        } catch (DomainException $exception) {
            return back()->withErrors([
                'booking' => $exception->getMessage(),
            ]);
        }

        if ($schedule !== null) {
            $schedule->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil ditambahkan.');
    }

    public function update(ManagePackageRegistrationRequest $request, Booking $registration): RedirectResponse
    {
        $previousSchedule = $registration->departureSchedule;
        $schedule = $request->selectedSchedule();
        $previousStockState = [
            'package_id' => (int) $registration->package_id,
            'passenger_count' => (int) $registration->passenger_count,
            'status' => (string) $registration->status,
        ];

        $payload = [
            'package_id' => $request->integer('travel_package_id'),
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'room_configuration' => $request->filled('room_configuration')
                ? $this->packageRoomConfigurationService->normalizeConfiguration((array) $request->input('room_configuration', []))
                : $registration->room_configuration,
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

        try {
            DB::transaction(function () use ($registration, $payload, $previousStockState): void {
                $registration->update($payload);
                $this->inventoryStockService->syncForBooking($registration->fresh(), $previousStockState);
            });
        } catch (DomainException $exception) {
            return back()->withErrors([
                'booking' => $exception->getMessage(),
            ]);
        }

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
        $previousStockState = [
            'package_id' => (int) $registration->package_id,
            'passenger_count' => (int) $registration->passenger_count,
            'status' => (string) $registration->status,
        ];

        DB::transaction(function () use ($registration, $previousStockState): void {
            $registration->setAttribute('status', 'cancelled');
            $registration->setAttribute('passenger_count', 0);
            $this->inventoryStockService->syncForBooking($registration, $previousStockState);
            $registration->delete();
        });

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
                'inventory' => $this->inventoryStockService->stockPreviewForPackage(
                    (int) $registration->package_id,
                    (int) $registration->passenger_count,
                ),
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
                'room_configuration' => $registration->room_configuration,
                'room_summary' => $this->packageRoomConfigurationService->summarize(
                    is_array($registration->room_configuration) ? $registration->room_configuration : null,
                ),
                'notes' => $registration->notes,
                'status' => $registration->status,
                'created_at' => $registration->created_at?->toDateTimeString(),
                'travel_package_id' => $registration->package_id,
                'departure_schedule_id' => $registration->departure_schedule_id,
                'travel_package' => [
                    'code' => $registration->package?->code,
                    'slug' => $registration->package?->slug,
                    'name' => $registration->package?->name,
                    'display_name' => $this->resolvePackageDisplayName(
                        $registration->package?->name,
                        $registration->package?->code,
                    ),
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
                'package:id,code,slug,name,package_type,price,currency,content',
                'departureSchedule:id,package_id,departure_date,return_date,departure_city,status',
            ])
            ->withCount('participants')
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
                    : $this->packageRoomConfigurationService->calculateBookingAmount($booking);

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
                    'room_configuration' => $booking->room_configuration,
                    'room_summary' => $this->packageRoomConfigurationService->summarize(
                        is_array($booking->room_configuration) ? $booking->room_configuration : null,
                    ),
                    'participants_count' => (int) ($booking->participants_count ?? 0),
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
                        'display_name' => $this->resolvePackageDisplayName(
                            $booking->package?->name,
                            $booking->package?->code,
                        ),
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

        $rows = Booking::query()
            ->with([
                'package:id,price,currency,content',
                'departureSchedule:id,departure_city',
            ])
            ->where('booking_type', 'regular')
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
            ->get();

        $byCurrency = $rows
            ->groupBy(fn (Booking $booking): string => (string) ($booking->package?->currency ?: 'IDR'))
            ->map(function ($bookings, string $currency): array {
                $bookingCollection = $bookings instanceof Collection
                    ? $bookings
                    : collect($bookings);

                return [
                    'currency' => $currency,
                    'amount' => (float) $bookingCollection->sum(
                        fn (Booking $booking): float => $this->packageRoomConfigurationService->calculateBookingAmount($booking),
                    ),
                    'pax' => (int) $bookingCollection->sum('passenger_count'),
                    'bookings' => $bookingCollection->count(),
                ];
            })
            ->sortByDesc('amount')
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
        return TravelPackage::query()
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'package_type'])
            ->map(fn (TravelPackage $travelPackage): array => [
                'id' => $travelPackage->id,
                'code' => $travelPackage->code,
                'name' => $travelPackage->name,
                'display_name' => $this->resolvePackageDisplayName(
                    $travelPackage->name,
                    $travelPackage->code,
                ),
                'package_type' => $travelPackage->package_type,
            ])
            ->values()
            ->all();
    }

    private function resolvePackageDisplayName(mixed $name, ?string $code = null): string
    {
        if (is_string($name)) {
            $trimmedName = trim($name);

            if ($trimmedName === '') {
                return (string) ($code ?? '-');
            }

            $decodedName = json_decode($trimmedName, true);

            if (is_array($decodedName)) {
                $localizedName = trim((string) ($decodedName['id'] ?? $decodedName['en'] ?? ''));

                return $localizedName !== '' ? $localizedName : (string) ($code ?? '-');
            }

            return $trimmedName;
        }

        if (is_array($name)) {
            $localizedName = trim((string) ($name['id'] ?? $name['en'] ?? ''));

            return $localizedName !== '' ? $localizedName : (string) ($code ?? '-');
        }

        return (string) ($code ?? '-');
    }

    /**
     * @return array<string, mixed>
     */
    private function participantPayload(BookingParticipant $participant): array
    {
        return [
            'id' => $participant->id,
            'full_name' => $participant->full_name,
            'gender' => $participant->gender,
            'birth_place' => $participant->birth_place,
            'birth_date' => $participant->birth_date?->toDateString(),
            'marital_status' => $participant->marital_status,
            'address' => $participant->address,
            'needs_wheelchair' => (bool) $participant->needs_wheelchair,
            'shirt_size' => $participant->shirt_size,
            'passport_ready' => (bool) $participant->passport_ready,
            'passport_issue_date' => $participant->passport_issue_date?->toDateString(),
            'passport_expiry_date' => $participant->passport_expiry_date?->toDateString(),
            'passport_type' => $participant->passport_type,
            'passport_validity_years' => $participant->passport_validity_years,
            'passport_scan_path' => $participant->passport_scan_path,
            'family_card_scan_path' => $participant->family_card_scan_path,
            'marriage_book_scan_path' => $participant->marriage_book_scan_path,
            'birth_certificate_scan_path' => $participant->birth_certificate_scan_path,
            'photo_path' => $participant->photo_path,
            'meningitis_vaccine_scan_path' => $participant->meningitis_vaccine_scan_path,
            'has_medical_history' => (bool) $participant->has_medical_history,
            'medical_history_notes' => $participant->medical_history_notes,
            'emergency_contact_name' => $participant->emergency_contact_name,
            'emergency_contact_phone' => $participant->emergency_contact_phone,
            'emergency_contact_relationship' => $participant->emergency_contact_relationship,
            'has_performed_umrah' => (bool) $participant->has_performed_umrah,
            'referral_source' => $participant->referral_source,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function participantPayloadFromRequest(
        StoreBookingParticipantRequest|UpdateBookingParticipantRequest $request,
        Booking $booking,
        ?BookingParticipant $participant = null,
    ): array {
        return [
            'full_name' => $request->string('full_name')->value(),
            'gender' => $request->filled('gender') ? $request->string('gender')->value() : null,
            'birth_place' => $request->filled('birth_place') ? $request->string('birth_place')->value() : null,
            'birth_date' => $request->date('birth_date'),
            'marital_status' => $request->filled('marital_status') ? $request->string('marital_status')->value() : null,
            'address' => $request->filled('address') ? $request->string('address')->value() : null,
            'needs_wheelchair' => $request->boolean('needs_wheelchair'),
            'shirt_size' => $request->filled('shirt_size') ? $request->string('shirt_size')->value() : null,
            'passport_ready' => $request->boolean('passport_ready'),
            'passport_issue_date' => $request->date('passport_issue_date'),
            'passport_expiry_date' => $request->date('passport_expiry_date'),
            'passport_type' => $request->filled('passport_type') ? $request->string('passport_type')->value() : null,
            'passport_validity_years' => $this->detectPassportValidityYears(
                $request->date('passport_issue_date'),
                $request->date('passport_expiry_date'),
            ),
            'passport_scan_path' => $this->storeParticipantDocument($request, $booking, 'passport_scan', $participant?->passport_scan_path),
            'family_card_scan_path' => $this->storeParticipantDocument($request, $booking, 'family_card_scan', $participant?->family_card_scan_path),
            'marriage_book_scan_path' => $this->storeParticipantDocument($request, $booking, 'marriage_book_scan', $participant?->marriage_book_scan_path),
            'birth_certificate_scan_path' => $this->storeParticipantDocument($request, $booking, 'birth_certificate_scan', $participant?->birth_certificate_scan_path),
            'photo_path' => $this->storeParticipantDocument($request, $booking, 'photo', $participant?->photo_path),
            'meningitis_vaccine_scan_path' => $this->storeParticipantDocument($request, $booking, 'meningitis_vaccine_scan', $participant?->meningitis_vaccine_scan_path),
            'has_medical_history' => $request->boolean('has_medical_history'),
            'medical_history_notes' => $request->filled('medical_history_notes') ? $request->string('medical_history_notes')->value() : null,
            'emergency_contact_name' => $request->filled('emergency_contact_name') ? $request->string('emergency_contact_name')->value() : null,
            'emergency_contact_phone' => $request->filled('emergency_contact_phone') ? $request->string('emergency_contact_phone')->value() : null,
            'emergency_contact_relationship' => $request->filled('emergency_contact_relationship') ? $request->string('emergency_contact_relationship')->value() : null,
            'has_performed_umrah' => $request->boolean('has_performed_umrah'),
            'referral_source' => $request->filled('referral_source') ? $request->string('referral_source')->value() : null,
        ];
    }

    private function storeParticipantFile(
        StoreBookingParticipantRequest|UpdateBookingParticipantRequest $request,
        Booking $booking,
        string $field,
        ?string $existingPath = null,
    ): ?string {
        if (! $request->hasFile($field)) {
            return $existingPath;
        }

        $file = $request->file($field);
        $directory = 'booking-participants/'.$booking->getKey();
        $filename = $this->participantUploadFilename(
            bookingCode: $booking->booking_code,
            field: $field,
            extension: $file->getClientOriginalExtension(),
        );

        $storedPath = '/storage/'.$file->storeAs($directory, $filename, 'public');

        if (is_string($existingPath) && Str::startsWith($existingPath, '/storage/')) {
            Storage::disk('public')->delete(substr($existingPath, strlen('/storage/')));
        }

        return $storedPath;
    }

    private function storeParticipantDocument(
        StoreBookingParticipantRequest|UpdateBookingParticipantRequest $request,
        Booking $booking,
        string $field,
        ?string $existingPath = null,
    ): ?string {
        if ($request->hasFile($field)) {
            return $this->storeParticipantFile($request, $booking, $field, $existingPath);
        }

        $urlField = $field.'_url';
        $documentUrl = trim((string) $request->input($urlField, ''));

        if ($documentUrl === '') {
            return $existingPath;
        }

        $storedPath = $this->bookingParticipantImportService->storeImportedDocument(
            $booking,
            $field,
            $documentUrl,
        );

        if ($storedPath === null) {
            return $existingPath;
        }

        if (is_string($existingPath) && Str::startsWith($existingPath, '/storage/')) {
            Storage::disk('public')->delete(substr($existingPath, strlen('/storage/')));
        }

        return $storedPath;
    }

    private function participantUploadFilename(
        string $bookingCode,
        string $field,
        string $extension,
    ): string {
        $documentName = match ($field) {
            'passport_scan' => 'scan-paspor',
            'family_card_scan' => 'kartu-keluarga',
            'marriage_book_scan' => 'buku-nikah',
            'birth_certificate_scan' => 'akta-lahir',
            'photo' => 'pas-foto',
            'meningitis_vaccine_scan' => 'vaksin-meningitis',
            default => 'dokumen',
        };

        $normalizedBookingCode = Str::of($bookingCode)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/i', '-')
            ->trim('-')
            ->value();
        $normalizedExtension = Str::of($extension)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/i', '')
            ->value();

        return sprintf(
            '%s-%s-%s.%s',
            $documentName,
            $normalizedBookingCode,
            now()->format('YmdHis'),
            $normalizedExtension !== '' ? $normalizedExtension : 'bin',
        );
    }

    private function detectPassportValidityYears(mixed $issuedAt, mixed $expiresAt): ?int
    {
        if (! $issuedAt instanceof \DateTimeInterface || ! $expiresAt instanceof \DateTimeInterface) {
            return null;
        }

        $years = (int) round($issuedAt->diff($expiresAt)->days / 365);

        return $years > 0 ? $years : null;
    }

    private function participantUploadMaxKilobytes(): int
    {
        return ParticipantUploadLimit::kilobytes();
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
