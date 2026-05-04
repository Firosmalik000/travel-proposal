<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CustomBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => (string) $request->string('status')->value(),
        ];

        $rows = Booking::query()
            ->where('booking_type', 'custom')
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = $filters['search'];

                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('booking_code', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%");
                });
            })
            ->when(in_array($filters['status'], ['pending', 'registered', 'cancelled'], true), function ($query) use ($filters): void {
                $query->where('status', $filters['status']);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Booking $booking): array => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'full_name' => $booking->full_name,
                'phone' => $booking->phone,
                'email' => $booking->email,
                'origin_city' => $booking->origin_city,
                'passenger_count' => (int) $booking->passenger_count,
                'custom_departure_date' => $booking->custom_departure_date?->toDateString(),
                'custom_return_date' => $booking->custom_return_date?->toDateString(),
                'revenue' => [
                    'currency' => (string) ($booking->custom_currency ?: 'IDR'),
                    'amount' => $booking->custom_total_amount !== null ? (float) $booking->custom_total_amount : null,
                ],
                'notes' => $booking->notes,
                'status' => $booking->status,
                'created_at' => $booking->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Dashboard/Booking/CustomBookings/Index', [
            'bookings' => $rows,
            'filters' => $filters,
            'revenue' => $this->customBookingRevenue($filters),
        ]);
    }

    /**
     * @return array{by_currency: array<int, array{currency: string, amount: float, pax: int, bookings: int}>}
     */
    private function customBookingRevenue(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');

        $query = Booking::query()
            ->where('booking_type', 'custom')
            ->when($search !== '', function ($builder) use ($search): void {
                $builder->where(function ($bookingQuery) use ($search): void {
                    $bookingQuery
                        ->where('booking_code', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($builder) use ($status): void {
                $builder->where('status', $status);
            });

        $byCurrency = (clone $query)
            ->selectRaw('COALESCE(custom_currency, ?) as currency', ['IDR'])
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
}
