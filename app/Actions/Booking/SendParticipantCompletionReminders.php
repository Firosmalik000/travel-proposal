<?php

namespace App\Actions\Booking;

use App\Mail\ParticipantDataReminder;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Services\BookingParticipantCompletenessService;
use Illuminate\Support\Facades\Mail;

class SendParticipantCompletionReminders
{
    public function __construct(
        private BookingParticipantCompletenessService $completenessService,
    ) {}

    /**
     * @return array{sent: int, complete: int, without_email: int}
     */
    public function handle(TravelPackage $travelPackage, string $status): array
    {
        $bookings = Booking::query()
            ->with(['participants' => fn ($query) => $query->orderBy('id')])
            ->where('package_id', $travelPackage->id)
            ->where('booking_type', 'regular')
            ->when(
                $status === 'all',
                fn ($query) => $query->whereIn('status', ['pending', 'registered']),
                fn ($query) => $query->where('status', $status),
            )
            ->orderBy('booking_code')
            ->get();

        $result = ['sent' => 0, 'complete' => 0, 'without_email' => 0];

        foreach ($bookings as $booking) {
            $summary = $this->completenessService->bookingSummary($booking);

            if ($summary['is_complete']) {
                $result['complete']++;

                continue;
            }

            if (! is_string($booking->email) || ! filter_var($booking->email, FILTER_VALIDATE_EMAIL)) {
                $result['without_email']++;

                continue;
            }

            $participantsUrl = route('customer.bookings.show', [
                'bookingCode' => $booking->booking_code,
            ]).'?tab=participants';

            Mail::to($booking->email)->send(
                new ParticipantDataReminder($booking, $summary, $participantsUrl),
            );
            $result['sent']++;
        }

        return $result;
    }
}
