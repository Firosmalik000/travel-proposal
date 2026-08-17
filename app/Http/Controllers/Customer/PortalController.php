<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\BookingPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(Request $request): Response
    {
        $bookings = Booking::query()
            ->where('customer_id', $request->user()->id)
            ->with(['package:id,code,name,image_path,currency,start_date,end_date,departure_city'])
            ->withCount('participants')
            ->withSum(['payments as paid_amount' => fn ($query) => $query->where('status', 'confirmed')], 'amount')
            ->latest()
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingSummary($booking));

        return Inertia::render('Customer/Dashboard', [
            'bookings' => $bookings->all(),
            'summary' => [
                'total_bookings' => $bookings->count(),
                'active_bookings' => $bookings->where('status', 'registered')->count(),
                'remaining_payment' => (int) $bookings->sum('remaining_amount'),
                'remaining_participants' => (int) $bookings->sum(fn (array $booking): int => max($booking['passenger_count'] - $booking['participants_count'], 0)),
            ],
        ]);
    }

    public function show(Booking $booking): Response
    {
        Gate::authorize('view', $booking);
        $booking->load([
            'package:id,code,name,image_path,currency,start_date,end_date,departure_city',
            'participants' => fn ($query) => $query->orderBy('id'),
            'payments' => fn ($query) => $query->where('status', 'confirmed')->latest('payment_date')->latest('id'),
        ]);

        return Inertia::render('Customer/BookingShow', [
            'booking' => [
                ...$this->bookingSummary($booking),
                'origin_city' => $booking->origin_city,
                'room_configuration' => $booking->room_configuration,
                'notes' => $booking->notes,
                'participant_data_locked_at' => $booking->participant_data_locked_at?->toDateTimeString(),
                'participants' => $booking->participants->map(fn (BookingParticipant $participant): array => $this->participantPayload($participant))->all(),
                'payments' => $booking->payments->map(fn (BookingPayment $payment): array => [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date?->toDateString(),
                    'amount' => (int) $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'reference_number' => $payment->reference_number,
                    'notes' => $payment->notes,
                ])->all(),
            ],
        ]);
    }

    /** @return array<string, mixed> */
    private function bookingSummary(Booking $booking): array
    {
        $total = (int) ($booking->agreed_total_amount ?? $booking->custom_total_amount ?? 0);
        $paid = $booking->relationLoaded('payments')
            ? (int) $booking->payments->where('status', 'confirmed')->sum('amount')
            : (int) ($booking->paid_amount ?? 0);

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'booking_type' => $booking->booking_type,
            'status' => $booking->status,
            'package_name' => data_get($booking->package?->name, 'id', $booking->package?->code),
            'package_image' => $booking->package?->image_path,
            'departure_date' => $booking->package?->start_date?->toDateString() ?? $booking->custom_departure_date?->toDateString(),
            'return_date' => $booking->package?->end_date?->toDateString() ?? $booking->custom_return_date?->toDateString(),
            'departure_city' => $booking->package?->departure_city,
            'passenger_count' => (int) $booking->passenger_count,
            'participants_count' => $booking->relationLoaded('participants') ? $booking->participants->count() : (int) ($booking->participants_count ?? 0),
            'total_amount' => $total,
            'paid_amount' => $paid,
            'remaining_amount' => max($total - $paid, 0),
            'payment_status' => $paid < 1 ? 'unpaid' : ($paid < $total ? 'partial' : ($paid === $total ? 'paid' : 'overpaid')),
            'currency' => $booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR',
        ];
    }

    /** @return array<string, mixed> */
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
            'has_medical_history' => (bool) $participant->has_medical_history,
            'medical_history_notes' => $participant->medical_history_notes,
            'emergency_contact_name' => $participant->emergency_contact_name,
            'emergency_contact_phone' => $participant->emergency_contact_phone,
            'emergency_contact_relationship' => $participant->emergency_contact_relationship,
            'has_performed_umrah' => (bool) $participant->has_performed_umrah,
            'referral_source' => $participant->referral_source,
        ];
    }
}
