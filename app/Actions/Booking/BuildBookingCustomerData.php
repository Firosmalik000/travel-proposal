<?php

namespace App\Actions\Booking;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Services\BookingParticipantCompletenessService;
use Illuminate\Support\Collection;

class BuildBookingCustomerData
{
    public function __construct(
        private BookingParticipantCompletenessService $completenessService,
    ) {}

    /**
     * @param  array{search: string, status: string, travel_package_id: int|null}  $filters
     * @return array<string, mixed>
     */
    public function handle(array $filters, bool $includeBookingDetails = true): array
    {
        $bookings = $this->customerBookings($filters, $includeBookingDetails);
        $packages = $this->packageRows($bookings, $includeBookingDetails);
        $selectedPackageId = $filters['travel_package_id'];

        $selectedPackage = $selectedPackageId !== null
            ? $packages->firstWhere('id', $selectedPackageId)
            : null;

        $customerCount = (int) $bookings->sum('passenger_count');
        $participantCount = (int) $bookings->sum(
            fn (Booking $booking): int => $this->participantCount($booking),
        );

        return [
            'filters' => [
                ...$filters,
                'travel_package_id' => $selectedPackageId,
            ],
            'summary' => [
                'packages' => $packages->count(),
                'bookings' => $bookings->count(),
                'customers' => $customerCount,
                'participants' => $participantCount,
                'remaining' => max($customerCount - $participantCount, 0),
            ],
            'packages' => $packages->values()->all(),
            'selectedPackageId' => $selectedPackageId,
            'selectedPackage' => $selectedPackage,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function bookingDetail(Booking $booking): array
    {
        $booking->load([
            'package:id,code,name,package_type,start_date,end_date,departure_city,booking_status',
            'participants' => fn ($participantQuery) => $participantQuery
                ->orderBy('id')
                ->select($this->participantColumns()),
        ]);

        return $this->bookingPayload($booking, includeParticipantDetails: true);
    }

    /**
     * @param  array{search: string, status: string, travel_package_id: int|null}  $filters
     * @return Collection<int, Booking>
     */
    private function customerBookings(array $filters, bool $includeBookingDetails): Collection
    {
        return Booking::query()
            ->with([
                'package:id,code,name,package_type,start_date,end_date,departure_city,booking_status',
            ])
            ->withCount('participants')
            ->when($includeBookingDetails, function ($query): void {
                $query->with(['participants' => fn ($participantQuery) => $participantQuery
                    ->orderBy('id')
                    ->select($this->participantColumns())]);
            })
            ->where('booking_type', 'regular')
            ->when($filters['travel_package_id'], function ($query) use ($filters): void {
                $query->where('package_id', $filters['travel_package_id']);
            })
            ->when(
                $filters['status'] !== 'all',
                fn ($query) => $query->where('status', $filters['status']),
                fn ($query) => $query->whereIn('status', ['pending', 'registered']),
            )
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('booking_code', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%")
                        ->orWhereHas('package', function ($packageQuery) use ($search): void {
                            $packageQuery
                                ->where('code', 'like', "%{$search}%")
                                ->orWhere('name->id', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('package_id')
            ->orderBy('booking_code')
            ->get();
    }

    /**
     * @param  Collection<int, Booking>  $bookings
     * @return Collection<int, array<string, mixed>>
     */
    private function packageRows(Collection $bookings, bool $includeBookingDetails): Collection
    {
        return $bookings
            ->groupBy('package_id')
            ->map(function (Collection $packageBookings) use ($includeBookingDetails): array {
                /** @var Booking $firstBooking */
                $firstBooking = $packageBookings->first();
                $schedules = collect([[
                    'id' => null,
                    'departure_date' => $firstBooking->package?->start_date?->toDateString(),
                    'return_date' => $firstBooking->package?->end_date?->toDateString(),
                    'departure_city' => $firstBooking->package?->departure_city,
                    'status' => $firstBooking->package?->booking_status,
                    'booking_count' => $packageBookings->count(),
                    'customers' => (int) $packageBookings->sum('passenger_count'),
                    'participants' => (int) $packageBookings->sum(
                        fn (Booking $booking): int => $this->participantCount($booking),
                    ),
                    'remaining' => (int) $packageBookings->sum(function (Booking $booking): int {
                        return max((int) $booking->passenger_count - $this->participantCount($booking), 0);
                    }),
                    'bookings' => $includeBookingDetails
                        ? $packageBookings->map(
                            fn (Booking $booking): array => $this->bookingPayload($booking),
                        )->values()->all()
                        : [],
                ]]);

                $customerCount = (int) $packageBookings->sum('passenger_count');
                $participantsCount = (int) $packageBookings->sum(
                    fn (Booking $booking): int => $this->participantCount($booking),
                );

                return [
                    'id' => $firstBooking->package?->id,
                    'code' => $firstBooking->package?->code,
                    'name' => (string) ($firstBooking->package?->name['id'] ?? $firstBooking->package?->code ?? '-'),
                    'package_type' => $firstBooking->package?->package_type,
                    'booking_count' => $packageBookings->count(),
                    'customers' => $customerCount,
                    'participants' => $participantsCount,
                    'remaining' => max($customerCount - $participantsCount, 0),
                    'completion_percent' => $customerCount > 0
                        ? min((int) floor(($participantsCount / $customerCount) * 100), 100)
                        : 0,
                    'incomplete_booking_count' => $includeBookingDetails
                        ? $packageBookings
                            ->filter(fn (Booking $booking): bool => ! $this->completenessService->bookingSummary($booking)['is_complete'])
                            ->count()
                        : 0,
                    'bookings' => $includeBookingDetails
                        ? $packageBookings->map(
                            fn (Booking $booking): array => $this->bookingPayload($booking),
                        )->values()->all()
                        : [],
                    'schedules' => $schedules->all(),
                ];
            })
            ->sortBy(fn (array $package): string => (string) ($package['code'] ?? $package['name'] ?? ''))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(Booking $booking, bool $includeParticipantDetails = false): array
    {
        $participants = $booking->relationLoaded('participants')
            ? $booking->participants->sortBy('id')->values()
            : collect();
        $slotCount = max((int) $booking->passenger_count, 0);
        $slots = [];

        if ($includeParticipantDetails) {
            for ($index = 0; $index < $slotCount; $index++) {
                $slots[] = $this->participantSlotPayload($participants->get($index), $index + 1);
            }
        }

        $participantsCount = $booking->relationLoaded('participants')
            ? $participants->count()
            : (int) ($booking->participants_count ?? 0);
        $completion = $this->completenessService->bookingSummary($booking);

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'full_name' => $booking->full_name,
            'phone' => $booking->phone,
            'email' => $booking->email,
            'origin_city' => $booking->origin_city,
            'status' => $booking->status,
            'passenger_count' => (int) $booking->passenger_count,
            'participants_count' => $participantsCount,
            'remaining_slots' => max((int) $booking->passenger_count - $participantsCount, 0),
            'completion_percent' => (int) ((int) $booking->passenger_count > 0
                ? min(floor(($participantsCount / (int) $booking->passenger_count) * 100), 100)
                : 0),
            'complete_participants_count' => $completion['complete_participants_count'],
            'incomplete_participants_count' => $completion['incomplete_participants_count'],
            'missing_fields_count' => $completion['missing_fields_count'],
            'missing_documents_count' => $completion['missing_documents_count'],
            'outstanding_count' => $completion['outstanding_count'],
            'is_complete' => $completion['is_complete'],
            'created_at' => $booking->created_at?->toDateTimeString(),
            'package' => [
                'id' => $booking->package?->id,
                'code' => $booking->package?->code,
                'name' => (string) ($booking->package?->name['id'] ?? $booking->package?->code ?? '-'),
                'package_type' => $booking->package?->package_type,
            ],
            'schedule' => [
                'id' => null,
                'departure_date' => $booking->package?->start_date?->toDateString(),
                'return_date' => $booking->package?->end_date?->toDateString(),
                'departure_city' => $booking->package?->departure_city,
                'status' => $booking->package?->booking_status,
            ],
            'slots' => $slots,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function participantPayload(BookingParticipant $participant, int $slotNumber): array
    {
        $completion = $this->completenessService->analyze($participant);
        $documents = collect($completion['documents'])
            ->map(function (array $document) use ($participant): array {
                return [
                    'key' => $document['key'],
                    'label' => $document['label'],
                    'url' => ! $document['is_present']
                        ? null
                        : route('booking.customer-data.documents.show', [
                            'booking' => $participant->booking_id,
                            'participant' => $participant->id,
                            'document' => $document['key'],
                        ]),
                ];
            })
            ->values();

        return [
            'slot_number' => $slotNumber,
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
            'has_medical_history' => (bool) $participant->has_medical_history,
            'medical_history_notes' => $participant->medical_history_notes,
            'emergency_contact_name' => $participant->emergency_contact_name,
            'emergency_contact_phone' => $participant->emergency_contact_phone,
            'emergency_contact_relationship' => $participant->emergency_contact_relationship,
            'has_performed_umrah' => (bool) $participant->has_performed_umrah,
            'referral_source' => $participant->referral_source,
            'documents_count' => $completion['documents_count'],
            'documents_total' => $completion['documents_total'],
            'documents' => $documents->all(),
            'missing_fields' => $completion['missing_fields'],
            'missing_documents' => $completion['missing_documents'],
            'missing_count' => $completion['missing_count'],
            'is_complete' => $completion['is_complete'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function participantSlotPayload(?BookingParticipant $participant, int $slotNumber): array
    {
        if (! $participant instanceof BookingParticipant) {
            return [
                'slot_number' => $slotNumber,
                'is_filled' => false,
                'participant' => null,
            ];
        }

        return [
            'slot_number' => $slotNumber,
            'is_filled' => true,
            'participant' => $this->participantPayload($participant, $slotNumber),
        ];
    }

    private function participantCount(Booking $booking): int
    {
        if ($booking->relationLoaded('participants')) {
            return $booking->participants->count();
        }

        return (int) ($booking->participants_count ?? 0);
    }

    /**
     * @return list<string>
     */
    private function participantColumns(): array
    {
        return [
            'id',
            'booking_id',
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'marital_status',
            'address',
            'needs_wheelchair',
            'shirt_size',
            'passport_ready',
            'passport_issue_date',
            'passport_expiry_date',
            'passport_type',
            'passport_validity_years',
            'passport_scan_path',
            'family_card_scan_path',
            'marriage_book_scan_path',
            'birth_certificate_scan_path',
            'photo_path',
            'meningitis_vaccine_scan_path',
            'has_medical_history',
            'medical_history_notes',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'has_performed_umrah',
            'referral_source',
        ];
    }
}
