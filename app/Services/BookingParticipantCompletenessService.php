<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingParticipant;

class BookingParticipantCompletenessService
{
    private const REQUIRED_FIELDS = [
        'full_name' => 'Nama lengkap',
        'gender' => 'Jenis kelamin',
        'birth_place' => 'Tempat lahir',
        'birth_date' => 'Tanggal lahir',
        'marital_status' => 'Status pernikahan',
        'address' => 'Alamat',
        'shirt_size' => 'Ukuran baju',
        'passport_ready' => 'Status kesiapan paspor',
        'passport_issue_date' => 'Tanggal terbit paspor',
        'passport_expiry_date' => 'Tanggal berlaku paspor',
        'passport_type' => 'Jenis paspor',
        'emergency_contact_name' => 'Nama kontak darurat',
        'emergency_contact_phone' => 'Telepon kontak darurat',
        'emergency_contact_relationship' => 'Hubungan kontak darurat',
    ];

    private const DOCUMENTS = [
        'passport_scan' => ['field' => 'passport_scan_path', 'label' => 'Scan paspor'],
        'family_card_scan' => ['field' => 'family_card_scan_path', 'label' => 'Kartu keluarga'],
        'marriage_book_scan' => ['field' => 'marriage_book_scan_path', 'label' => 'Buku nikah'],
        'birth_certificate_scan' => ['field' => 'birth_certificate_scan_path', 'label' => 'Akta kelahiran'],
        'photo' => ['field' => 'photo_path', 'label' => 'Pas foto'],
        'meningitis_vaccine_scan' => ['field' => 'meningitis_vaccine_scan_path', 'label' => 'Vaksin meningitis'],
    ];

    /**
     * @return array<string, mixed>
     */
    public function analyze(BookingParticipant $participant): array
    {
        $missingFields = collect(self::REQUIRED_FIELDS)
            ->filter(fn (string $label, string $field): bool => blank($participant->{$field}))
            ->values();
        $documents = collect(self::DOCUMENTS)
            ->map(function (array $definition, string $key) use ($participant): array {
                return [
                    'key' => $key,
                    'label' => $definition['label'],
                    'is_present' => ! blank($participant->{$definition['field']}),
                ];
            })
            ->values();
        $missingDocuments = $documents
            ->where('is_present', false)
            ->pluck('label')
            ->values();

        return [
            'documents' => $documents->all(),
            'documents_count' => $documents->where('is_present', true)->count(),
            'documents_total' => $documents->count(),
            'missing_fields' => $missingFields->all(),
            'missing_documents' => $missingDocuments->all(),
            'missing_fields_count' => $missingFields->count(),
            'missing_documents_count' => $missingDocuments->count(),
            'missing_count' => $missingFields->count() + $missingDocuments->count(),
            'is_complete' => $missingFields->isEmpty() && $missingDocuments->isEmpty(),
        ];
    }

    /**
     * @return array<string, int|bool>
     */
    public function bookingSummary(Booking $booking): array
    {
        $participants = $booking->relationLoaded('participants')
            ? $booking->participants
            : $booking->participants()->get();
        $analyses = $participants->map(
            fn (BookingParticipant $participant): array => $this->analyze($participant),
        );
        $remainingSlots = max((int) $booking->passenger_count - $participants->count(), 0);
        $completeParticipants = $analyses->where('is_complete', true)->count();

        return [
            'complete_participants_count' => $completeParticipants,
            'incomplete_participants_count' => $participants->count() - $completeParticipants,
            'remaining_slots' => $remainingSlots,
            'missing_fields_count' => (int) $analyses->sum('missing_fields_count'),
            'missing_documents_count' => (int) $analyses->sum('missing_documents_count'),
            'outstanding_count' => $remainingSlots
                + (int) $analyses->sum('missing_count'),
            'is_complete' => $remainingSlots === 0
                && $participants->count() === (int) $booking->passenger_count
                && $completeParticipants === $participants->count(),
        ];
    }
}
