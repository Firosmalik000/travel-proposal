<?php

namespace App\Actions\Booking;

use App\Models\Booking;
use App\Models\BookingParticipant;
use Illuminate\Support\Collection;

class BuildBookingCustomerData
{
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
                    ->select([
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
                        'has_medical_history',
                        'medical_history_notes',
                        'emergency_contact_name',
                        'emergency_contact_phone',
                        'emergency_contact_relationship',
                        'has_performed_umrah',
                        'referral_source',
                    ])]);
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
                    'schedules' => $schedules->all(),
                ];
            })
            ->sortBy(fn (array $package): string => (string) ($package['code'] ?? $package['name'] ?? ''))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(Booking $booking): array
    {
        $participants = $booking->participants->sortBy('id')->values();
        $slotCount = max((int) $booking->passenger_count, 0);
        $slots = [];

        for ($index = 0; $index < $slotCount; $index++) {
            $slots[] = $this->participantSlotPayload($participants->get($index), $index + 1);
        }

        $participantsCount = $participants->count();

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
            'created_at' => $booking->created_at?->toDateTimeString(),
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
}
