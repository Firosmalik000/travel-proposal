<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Booking\BuildBookingCustomerData;
use App\Actions\Booking\SendParticipantCompletionReminders;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\IndexBookingCustomerDataRequest;
use App\Http\Requests\Administrator\SendParticipantReminderRequest;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\TravelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookingCustomerDataController extends Controller
{
    private const DOCUMENT_FIELDS = [
        'passport_scan' => 'passport_scan_path',
        'family_card_scan' => 'family_card_scan_path',
        'marriage_book_scan' => 'marriage_book_scan_path',
        'birth_certificate_scan' => 'birth_certificate_scan_path',
        'photo' => 'photo_path',
        'meningitis_vaccine_scan' => 'meningitis_vaccine_scan_path',
    ];

    public function index(
        IndexBookingCustomerDataRequest $request,
        BuildBookingCustomerData $buildBookingCustomerData,
    ): Response {
        $validated = $request->validated();

        return Inertia::render(
            'Dashboard/Booking/CustomerData/Index',
            $buildBookingCustomerData->handle(
                [
                    'search' => (string) ($validated['search'] ?? ''),
                    'status' => (string) ($validated['status'] ?? 'registered'),
                    'travel_package_id' => isset($validated['travel_package_id'])
                        ? (int) $validated['travel_package_id']
                        : null,
                ],
                includeBookingDetails: true,
            ),
        );
    }

    public function show(
        IndexBookingCustomerDataRequest $request,
        Booking $booking,
        BuildBookingCustomerData $buildBookingCustomerData,
    ): Response {
        $validated = $request->validated();
        $status = (string) ($validated['status'] ?? 'registered');

        abort_if($booking->booking_type !== 'regular', 404);
        abort_if($status !== 'all' && $booking->status !== $status, 404);
        abort_if($status === 'all' && ! in_array($booking->status, ['pending', 'registered'], true), 404);

        return Inertia::render('Dashboard/Booking/CustomerData/Show', [
            'filters' => [
                'search' => (string) ($validated['search'] ?? ''),
                'status' => $status,
                'travel_package_id' => null,
            ],
            'booking' => $buildBookingCustomerData->bookingDetail($booking),
        ]);
    }

    public function document(
        Booking $booking,
        BookingParticipant $participant,
        string $document,
    ): BinaryFileResponse {
        abort_unless($booking->booking_type === 'regular', 404);
        abort_unless($participant->booking_id === $booking->id, 404);

        $pathField = self::DOCUMENT_FIELDS[$document] ?? null;
        abort_unless($pathField !== null, 404);

        $path = $participant->{$pathField};
        abort_unless(is_string($path) && $path !== '', 404);

        if (str_starts_with($path, '/storage/')) {
            $publicPath = substr($path, strlen('/storage/'));
            abort_unless(Storage::disk('public')->exists($publicPath), 404);

            return response()->file(Storage::disk('public')->path($publicPath));
        }

        abort_unless(Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path));
    }

    public function sendReminders(
        SendParticipantReminderRequest $request,
        TravelPackage $travelPackage,
        SendParticipantCompletionReminders $sendParticipantCompletionReminders,
    ): RedirectResponse {
        $validated = $request->validated();
        $result = $sendParticipantCompletionReminders->handle(
            $travelPackage,
            (string) $validated['status'],
        );

        return back()->with(
            'success',
            "{$result['sent']} reminder berhasil dikirim, {$result['complete']} booking sudah lengkap, {$result['without_email']} booking tanpa email.",
        );
    }
}
