<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreBookingParticipantRequest;
use App\Http\Requests\Customer\UpdateBookingParticipantRequest;
use App\Models\Booking;
use App\Models\BookingParticipant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingParticipantController extends Controller
{
    private const DOCUMENT_FIELDS = [
        'passport_scan' => 'passport_scan_path',
        'family_card_scan' => 'family_card_scan_path',
        'marriage_book_scan' => 'marriage_book_scan_path',
        'birth_certificate_scan' => 'birth_certificate_scan_path',
        'photo' => 'photo_path',
        'meningitis_vaccine_scan' => 'meningitis_vaccine_scan_path',
    ];

    public function store(StoreBookingParticipantRequest $request, Booking $booking): RedirectResponse
    {
        $booking->participants()->create($this->payload($request, $booking));

        return back()->with('success', 'Data peserta berhasil ditambahkan.');
    }

    public function update(
        UpdateBookingParticipantRequest $request,
        Booking $booking,
        BookingParticipant $participant,
    ): RedirectResponse {
        $this->ensureParticipantBelongsToBooking($booking, $participant);
        $participant->update($this->payload($request, $booking, $participant));

        return back()->with('success', 'Data peserta berhasil diperbarui.');
    }

    public function destroy(Booking $booking, BookingParticipant $participant): RedirectResponse
    {
        Gate::authorize('update', $booking);
        $this->ensureParticipantBelongsToBooking($booking, $participant);

        foreach (self::DOCUMENT_FIELDS as $pathField) {
            $this->deletePrivateDocument($participant->{$pathField});
        }

        $participant->delete();

        return back()->with('success', 'Data peserta berhasil dihapus.');
    }

    public function download(Booking $booking, BookingParticipant $participant, string $document): StreamedResponse
    {
        Gate::authorize('view', $booking);
        $this->ensureParticipantBelongsToBooking($booking, $participant);

        $pathField = self::DOCUMENT_FIELDS[$document] ?? null;
        abort_unless($pathField !== null, 404);

        $path = $participant->{$pathField};
        abort_unless(is_string($path) && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download($path);
    }

    /** @return array<string, mixed> */
    private function payload(
        StoreBookingParticipantRequest|UpdateBookingParticipantRequest $request,
        Booking $booking,
        ?BookingParticipant $participant = null,
    ): array {
        $excluded = [...array_keys(self::DOCUMENT_FIELDS), ...array_map(fn (string $field): string => $field.'_url', array_keys(self::DOCUMENT_FIELDS))];
        $payload = Arr::except($request->validated(), $excluded);

        foreach (self::DOCUMENT_FIELDS as $input => $pathField) {
            if (! $request->hasFile($input)) {
                continue;
            }

            $this->deletePrivateDocument($participant?->{$pathField});
            $payload[$pathField] = $request->file($input)->store("booking-participants/{$booking->id}", 'local');
        }

        return $payload;
    }

    private function ensureParticipantBelongsToBooking(Booking $booking, BookingParticipant $participant): void
    {
        abort_unless($participant->booking_id === $booking->id, 404);
    }

    private function deletePrivateDocument(?string $path): void
    {
        if ($path && str_starts_with($path, 'booking-participants/')) {
            Storage::disk('local')->delete($path);
        }
    }
}
