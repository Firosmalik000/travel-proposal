<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookingParticipantImportService
{
    /**
     * @param  array<int, array<string, mixed>>  $participants
     * @return array{created_count:int, skipped_rows:array<int, array<string, mixed>>}
     */
    public function handle(Booking $booking, array $participants): array
    {
        $createdCount = 0;
        $skippedRows = [];
        $existingCount = $booking->participants()->count();
        $remainingSlots = max((int) $booking->passenger_count - $existingCount, 0);
        $existingNames = $booking->participants()
            ->pluck('full_name')
            ->map(fn (mixed $fullName): string => mb_strtolower(trim((string) $fullName)))
            ->filter()
            ->flip()
            ->all();
        $seenPayloadNames = [];

        foreach ($participants as $index => $participant) {
            $fullName = trim((string) data_get($participant, 'full_name'));
            $normalizedName = mb_strtolower($fullName);

            if ($fullName === '') {
                $skippedRows[] = [
                    'row' => $index + 2,
                    'name' => '-',
                    'reason' => 'Nama peserta kosong.',
                ];

                continue;
            }

            if (isset($existingNames[$normalizedName]) || isset($seenPayloadNames[$normalizedName])) {
                $skippedRows[] = [
                    'row' => $index + 2,
                    'name' => $fullName,
                    'reason' => 'Nama peserta duplikat.',
                ];

                continue;
            }

            if ($createdCount >= $remainingSlots) {
                $skippedRows[] = [
                    'row' => $index + 2,
                    'name' => $fullName,
                    'reason' => 'Melebihi sisa slot pax booking.',
                ];

                continue;
            }

            $booking->participants()->create($this->participantPayload($booking, $participant));

            $seenPayloadNames[$normalizedName] = true;
            $createdCount++;
        }

        return [
            'created_count' => $createdCount,
            'skipped_rows' => $skippedRows,
        ];
    }

    /**
     * @param  array<string, mixed>  $participant
     * @return array<string, mixed>
     */
    private function participantPayload(Booking $booking, array $participant): array
    {
        $passportIssueDate = $this->normalizeDate(data_get($participant, 'passport_issue_date'));
        $passportExpiryDate = $this->normalizeDate(data_get($participant, 'passport_expiry_date'));

        return [
            'full_name' => trim((string) data_get($participant, 'full_name')),
            'gender' => $this->nullableString(data_get($participant, 'gender')),
            'birth_place' => $this->nullableString(data_get($participant, 'birth_place')),
            'birth_date' => $this->normalizeDate(data_get($participant, 'birth_date')),
            'marital_status' => $this->nullableString(data_get($participant, 'marital_status')),
            'address' => $this->nullableString(data_get($participant, 'address')),
            'needs_wheelchair' => (bool) data_get($participant, 'needs_wheelchair', false),
            'shirt_size' => $this->nullableUpperString(data_get($participant, 'shirt_size')),
            'passport_ready' => (bool) data_get($participant, 'passport_ready', false),
            'passport_issue_date' => $passportIssueDate,
            'passport_expiry_date' => $passportExpiryDate,
            'passport_type' => $this->nullableString(data_get($participant, 'passport_type')),
            'passport_validity_years' => $this->detectPassportValidityYears($passportIssueDate, $passportExpiryDate),
            'passport_scan_path' => $this->storeImportedDocument($booking, 'passport_scan', data_get($participant, 'passport_scan_url')),
            'family_card_scan_path' => $this->storeImportedDocument($booking, 'family_card_scan', data_get($participant, 'family_card_scan_url')),
            'marriage_book_scan_path' => $this->storeImportedDocument($booking, 'marriage_book_scan', data_get($participant, 'marriage_book_scan_url')),
            'birth_certificate_scan_path' => $this->storeImportedDocument($booking, 'birth_certificate_scan', data_get($participant, 'birth_certificate_scan_url')),
            'photo_path' => $this->storeImportedDocument($booking, 'photo', data_get($participant, 'photo_url')),
            'meningitis_vaccine_scan_path' => $this->storeImportedDocument($booking, 'meningitis_vaccine_scan', data_get($participant, 'meningitis_vaccine_scan_url')),
            'has_medical_history' => (bool) data_get($participant, 'has_medical_history', false),
            'medical_history_notes' => $this->nullableString(data_get($participant, 'medical_history_notes')),
            'emergency_contact_name' => $this->nullableString(data_get($participant, 'emergency_contact_name')),
            'emergency_contact_phone' => $this->nullableString(data_get($participant, 'emergency_contact_phone')),
            'emergency_contact_relationship' => $this->nullableString(data_get($participant, 'emergency_contact_relationship')),
            'has_performed_umrah' => (bool) data_get($participant, 'has_performed_umrah', false),
            'referral_source' => $this->nullableString(data_get($participant, 'referral_source')),
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }

    private function nullableUpperString(mixed $value): ?string
    {
        $normalized = Str::upper(trim((string) $value));

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeDate(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return null;
        }

        try {
            return Carbon::parse($normalized)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function detectPassportValidityYears(?string $issuedAt, ?string $expiresAt): ?int
    {
        if (! $issuedAt || ! $expiresAt) {
            return null;
        }

        $issuedDate = Carbon::parse($issuedAt);
        $expiryDate = Carbon::parse($expiresAt);
        $years = (int) round($issuedDate->diffInDays($expiryDate) / 365);

        return $years > 0 ? $years : null;
    }

    public function storeImportedDocument(Booking $booking, string $field, mixed $source): ?string
    {
        $sourcePath = trim((string) $source);

        if ($sourcePath === '') {
            return null;
        }

        $resolved = $this->resolveImportedFile($sourcePath);

        if ($resolved === null) {
            return null;
        }

        $directory = 'booking-participants/'.$booking->getKey();
        $filename = $this->participantUploadFilename(
            $booking->booking_code,
            $field,
            $resolved['extension'],
        );

        Storage::disk('public')->put($directory.'/'.$filename, $resolved['contents']);

        return '/storage/'.$directory.'/'.$filename;
    }

    /**
     * @return array{contents:string, extension:string}|null
     */
    private function resolveImportedFile(string $sourcePath): ?array
    {
        if (filter_var($sourcePath, FILTER_VALIDATE_URL)) {
            try {
                $response = Http::timeout(20)->get($sourcePath);

                if (! $response->successful()) {
                    return null;
                }

                return [
                    'contents' => $response->body(),
                    'extension' => $this->detectExtensionFromSource(
                        $sourcePath,
                        (string) $response->header('Content-Type', ''),
                    ),
                ];
            } catch (\Throwable) {
                return null;
            }
        }

        $localPath = $this->resolveLocalPath($sourcePath);

        if ($localPath === null || ! is_file($localPath)) {
            return null;
        }

        $contents = file_get_contents($localPath);

        if ($contents === false) {
            return null;
        }

        return [
            'contents' => $contents,
            'extension' => pathinfo($localPath, PATHINFO_EXTENSION) ?: 'bin',
        ];
    }

    private function resolveLocalPath(string $sourcePath): ?string
    {
        if (is_file($sourcePath)) {
            return $sourcePath;
        }

        if (Str::startsWith($sourcePath, '/storage/')) {
            $storageRelativePath = substr($sourcePath, strlen('/storage/'));
            $storagePath = Storage::disk('public')->path($storageRelativePath);

            if (is_file($storagePath)) {
                return $storagePath;
            }
        }

        if (Str::startsWith($sourcePath, '/')) {
            $publicPath = public_path(ltrim($sourcePath, '/'));

            if (is_file($publicPath)) {
                return $publicPath;
            }
        }

        $basePathCandidate = base_path($sourcePath);

        if (is_file($basePathCandidate)) {
            return $basePathCandidate;
        }

        return null;
    }

    private function detectExtensionFromSource(string $sourcePath, string $contentType): string
    {
        $extension = strtolower((string) pathinfo(parse_url($sourcePath, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));

        if ($extension !== '') {
            return $extension;
        }

        return match (strtolower($contentType)) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
            default => 'bin',
        };
    }

    private function participantUploadFilename(string $bookingCode, string $field, string $extension): string
    {
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
}
