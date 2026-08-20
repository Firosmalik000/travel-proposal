<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\PackageRegistration;
use App\Services\BookingParticipantCompletenessService;
use App\Services\BookingPaymentInvoiceService;
use App\Services\BookingPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function __construct(
        private BookingParticipantCompletenessService $completenessService,
        private BookingPaymentService $bookingPaymentService,
        private BookingPaymentInvoiceService $bookingPaymentInvoiceService,
    ) {}

    public function index(Request $request): Response
    {
        $orders = $this->customerOrders($request);
        $registeredBookings = $orders->where('record_type', 'booking');
        $latestOrder = $orders->sortByDesc('updated_at')->first();

        return Inertia::render('Customer/Dashboard', [
            'bookings' => $orders->take(3)->values()->all(),
            'summary' => [
                'total_bookings' => $orders->count(),
                'total_spent' => (int) $registeredBookings->sum('paid_amount'),
                'total_due' => (int) $registeredBookings->sum('total_amount'),
                'remaining_payment' => (int) $registeredBookings->sum('remaining_amount'),
                'incomplete_participant_orders' => $this->incompleteParticipantOrders($orders),
                'remaining_participant_slots' => $this->remainingParticipantSlots($orders),
                'latest_booking_code' => $latestOrder['booking_code'] ?? null,
                'latest_booking_status' => $latestOrder['status'] ?? null,
                'latest_booking_status_at' => $latestOrder['updated_at'] ?? null,
            ],
        ]);
    }

    public function bookings(Request $request): Response
    {
        $orders = $this->customerOrders($request);
        $registeredBookings = $orders->where('record_type', 'booking');

        return Inertia::render('Customer/Bookings', [
            'bookings' => $orders->all(),
            'summary' => [
                'total_bookings' => $orders->count(),
                'total_spent' => (int) $registeredBookings->sum('paid_amount'),
                'total_due' => (int) $registeredBookings->sum('total_amount'),
                'remaining_payment' => (int) $registeredBookings->sum('remaining_amount'),
                'incomplete_participant_orders' => $this->incompleteParticipantOrders($orders),
                'remaining_participant_slots' => $this->remainingParticipantSlots($orders),
            ],
        ]);
    }

    public function show(Request $request, string $bookingCode): Response
    {
        $order = $this->resolveCustomerOrder($bookingCode);

        if ($order instanceof Booking) {
            Gate::authorize('view', $order);

            $order->load([
                'package:id,code,slug,name,image_path,currency,start_date,end_date,departure_city',
                'participants' => fn ($query) => $query->orderBy('id'),
                'payments' => fn ($query) => $query
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->latest('payment_date')
                    ->latest('id'),
            ]);

            $payload = [
                ...$this->bookingSummary($order),
                'full_name' => $order->full_name,
                'phone' => $order->phone,
                'email' => $order->email,
                'origin_city' => $order->origin_city,
                'referral_code' => $order->referral_code,
                'room_configuration' => $order->room_configuration,
                'room_summary' => $this->formatRoomConfiguration($order->room_configuration),
                'notes' => $order->notes,
                'participant_data_locked_at' => $order->participant_data_locked_at?->toDateTimeString(),
                'participants' => $order->participants->map(fn (BookingParticipant $participant): array => $this->participantPayload($participant))->all(),
                'payments' => $this->bookingPaymentInvoiceService->payloads($order),
            ];
        } else {
            abort_unless($order->customer_id === $request->user()->id, 403);

            $order->load(['package:id,code,slug,name,image_path,currency,start_date,end_date,departure_city']);

            $payload = [
                ...$this->registrationSummary($order),
                'full_name' => $order->full_name,
                'phone' => $order->phone,
                'email' => $order->email,
                'origin_city' => $order->origin_city,
                'referral_code' => $order->referral_code,
                'room_configuration' => $order->room_configuration,
                'room_summary' => $this->formatRoomConfiguration($order->room_configuration),
                'notes' => $order->notes,
                'participant_data_locked_at' => null,
                'participants' => [],
                'payments' => [],
            ];
        }

        return Inertia::render('Customer/BookingShow', [
            'booking' => $payload,
        ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function customerOrders(Request $request): Collection
    {
        $registeredBookings = Booking::query()
            ->where('customer_id', $request->user()->id)
            ->with([
                'package:id,code,slug,name,image_path,currency,start_date,end_date,departure_city',
                'participants' => fn ($query) => $query->orderBy('id'),
            ])
            ->withCount('participants')
            ->withSum(['payments as paid_amount' => fn ($query) => $query->where('status', 'confirmed')], 'amount')
            ->latest()
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingSummary($booking));

        $pendingRegistrations = PackageRegistration::query()
            ->where('customer_id', $request->user()->id)
            ->where('status', 'pending')
            ->with(['package:id,code,slug,name,image_path,currency,start_date,end_date,departure_city'])
            ->latest()
            ->get()
            ->map(fn (PackageRegistration $registration): array => $this->registrationSummary($registration));

        return $registeredBookings
            ->concat($pendingRegistrations)
            ->sortBy([
                ['record_type', 'asc'],
                ['created_at', 'desc'],
            ])
            ->values();
    }

    /** @return array<string, mixed> */
    private function bookingSummary(Booking $booking): array
    {
        $participantCompletion = $this->completenessService->bookingSummary($booking);
        $paymentSummary = $this->bookingPaymentService->summary($booking);

        return [
            'id' => $booking->id,
            'record_type' => 'booking',
            'booking_code' => $booking->booking_code,
            'booking_type' => $booking->booking_type,
            'status' => $booking->status,
            'package_name' => $booking->package?->name ?? $booking->package?->code,
            'package_slug' => $booking->package?->slug,
            'package_url' => $booking->package?->slug ? url("/paket-umroh/{$booking->package->slug}") : null,
            'package_image' => $booking->package?->image_path,
            'departure_date' => $booking->package?->start_date?->toDateString() ?? $booking->custom_departure_date?->toDateString(),
            'return_date' => $booking->package?->end_date?->toDateString() ?? $booking->custom_return_date?->toDateString(),
            'departure_city' => $booking->package?->departure_city,
            'passenger_count' => (int) $booking->passenger_count,
            'full_name' => $booking->full_name,
            'phone' => $booking->phone,
            'email' => $booking->email,
            'origin_city' => $booking->origin_city,
            'referral_code' => $booking->referral_code,
            'room_configuration' => $booking->room_configuration,
            'room_summary' => $this->formatRoomConfiguration($booking->room_configuration),
            'notes' => $booking->notes,
            'participants_count' => $booking->relationLoaded('participants') ? $booking->participants->count() : (int) ($booking->participants_count ?? 0),
            'participant_data_complete' => $participantCompletion['is_complete'],
            'complete_participants_count' => $participantCompletion['complete_participants_count'],
            'participant_outstanding_count' => $participantCompletion['outstanding_count'],
            'total_amount' => $paymentSummary['total_amount'],
            'paid_amount' => $paymentSummary['paid_amount'],
            'remaining_amount' => $paymentSummary['remaining_amount'],
            'payment_status' => $paymentSummary['payment_status'],
            'currency' => $booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR',
            'created_at' => $booking->created_at?->toDateTimeString(),
            'updated_at' => $booking->updated_at?->toDateTimeString(),
            'detail_url' => route('customer.bookings.show', ['bookingCode' => $booking->booking_code]),
            'participants_url' => route('customer.bookings.show', ['bookingCode' => $booking->booking_code]).'?tab=participants',
            'invoice_url' => route('customer.bookings.show', ['bookingCode' => $booking->booking_code]).'?tab=payments',
            'review_url' => $booking->status === 'registered'
                ? URL::signedRoute('public.booking.review.show', ['booking' => $booking->booking_code])
                : null,
        ];
    }

    /** @return array<string, mixed> */
    private function registrationSummary(PackageRegistration $registration): array
    {
        return [
            'id' => $registration->id,
            'record_type' => 'registration',
            'booking_code' => sprintf('REG-%04d', $registration->id),
            'booking_type' => 'regular',
            'status' => $registration->status,
            'package_name' => $registration->package?->name ?? $registration->package?->code,
            'package_slug' => $registration->package?->slug,
            'package_url' => $registration->package?->slug ? url("/paket-umroh/{$registration->package->slug}") : null,
            'package_image' => $registration->package?->image_path,
            'departure_date' => $registration->package?->start_date?->toDateString(),
            'return_date' => $registration->package?->end_date?->toDateString(),
            'departure_city' => $registration->package?->departure_city,
            'passenger_count' => (int) $registration->passenger_count,
            'full_name' => $registration->full_name,
            'phone' => $registration->phone,
            'email' => $registration->email,
            'origin_city' => $registration->origin_city,
            'referral_code' => $registration->referral_code,
            'room_configuration' => $registration->room_configuration,
            'room_summary' => $this->formatRoomConfiguration($registration->room_configuration),
            'notes' => $registration->notes,
            'participants_count' => 0,
            'participant_data_complete' => false,
            'complete_participants_count' => 0,
            'participant_outstanding_count' => (int) $registration->passenger_count,
            'total_amount' => 0,
            'paid_amount' => 0,
            'remaining_amount' => 0,
            'payment_status' => 'unavailable',
            'currency' => $registration->package?->currency ?? 'IDR',
            'created_at' => $registration->created_at?->toDateTimeString(),
            'updated_at' => $registration->updated_at?->toDateTimeString(),
            'detail_url' => route('customer.bookings.show', ['bookingCode' => sprintf('REG-%04d', $registration->id)]),
        ];
    }

    private function resolveCustomerOrder(string $bookingCode): Booking|PackageRegistration
    {
        $booking = Booking::query()
            ->where('booking_code', $bookingCode)
            ->first();

        if ($booking instanceof Booking) {
            return $booking;
        }

        if (preg_match('/^REG-(\d+)$/', $bookingCode, $matches) === 1) {
            $registration = PackageRegistration::query()
                ->whereKey((int) $matches[1])
                ->first();

            if ($registration instanceof PackageRegistration) {
                return $registration;
            }
        }

        abort(404);
    }

    /**
     * @param  array<string, int>|null  $roomConfiguration
     */
    private function formatRoomConfiguration(?array $roomConfiguration): ?string
    {
        if (! is_array($roomConfiguration)) {
            return null;
        }

        $roomLabels = [
            'single' => 'Single',
            'double' => 'Double',
            'triple' => 'Triple',
            'quad' => 'Quad',
        ];

        $parts = [];

        foreach ($roomLabels as $key => $label) {
            $count = max((int) ($roomConfiguration[$key] ?? 0), 0);

            if ($count > 0) {
                $parts[] = "{$count} {$label}";
            }
        }

        return count($parts) > 0 ? implode(' + ', $parts) : null;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $orders
     */
    private function incompleteParticipantOrders(Collection $orders): int
    {
        return (int) $orders->filter(function (array $order): bool {
            return ! (bool) ($order['participant_data_complete'] ?? false);
        })->count();
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $orders
     */
    private function remainingParticipantSlots(Collection $orders): int
    {
        return (int) $orders->sum(function (array $order): int {
            return max((int) $order['passenger_count'] - (int) $order['participants_count'], 0);
        });
    }

    /** @return array<string, mixed> */
    private function participantPayload(BookingParticipant $participant): array
    {
        $completion = $this->completenessService->analyze($participant);
        $documentFields = [
            'passport_scan' => $participant->passport_scan_path,
            'family_card_scan' => $participant->family_card_scan_path,
            'marriage_book_scan' => $participant->marriage_book_scan_path,
            'birth_certificate_scan' => $participant->birth_certificate_scan_path,
            'photo' => $participant->photo_path,
            'meningitis_vaccine_scan' => $participant->meningitis_vaccine_scan_path,
        ];

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
            'is_complete' => $completion['is_complete'],
            'missing_count' => $completion['missing_count'],
            'missing_fields_count' => $completion['missing_fields_count'],
            'missing_documents_count' => $completion['missing_documents_count'],
            'documents_count' => $completion['documents_count'],
            'documents_total' => $completion['documents_total'],
            'documents' => collect($documentFields)->mapWithKeys(
                fn (?string $path, string $document): array => [
                    $document => $path
                        ? route('customer.participants.documents.download', [
                            'booking' => $participant->booking_id,
                            'participant' => $participant->id,
                            'document' => $document,
                        ])
                        : null,
                ],
            )->all(),
        ];
    }
}
