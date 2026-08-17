<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentCommission;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(Request $request): Response
    {
        $agent = $request->user()->agentProfile;

        $bookings = Booking::query()
            ->where('agent_profile_id', $agent->id)
            ->with(['package:id,code,name,start_date,currency', 'agentCommission'])
            ->latest()
            ->get()
            ->map(fn (Booking $booking): array => [
                'booking_code' => $booking->booking_code,
                'customer_name' => $booking->full_name,
                'package_name' => data_get($booking->package?->name, 'id', $booking->package?->code),
                'departure_date' => $booking->package?->start_date?->toDateString(),
                'passenger_count' => (int) $booking->passenger_count,
                'total_amount' => (int) ($booking->agreed_total_amount ?? 0),
                'currency' => $booking->agreed_currency ?? $booking->package?->currency ?? 'IDR',
                'booking_status' => $booking->status,
                'commission_amount' => (int) ($booking->agentCommission?->commission_amount ?? 0),
                'commission_status' => $booking->agentCommission?->status ?? 'not_configured',
            ]);

        $activeBookings = $bookings->where('booking_status', '!=', 'cancelled');
        $commissionSummary = AgentCommission::query()
            ->where('agent_profile_id', $agent->id)
            ->select('currency')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'approved' THEN commission_amount ELSE 0 END), 0) as approved")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END), 0) as paid")
            ->groupBy('currency')
            ->orderBy('currency')
            ->get()
            ->map(fn ($row): array => [
                'currency' => (string) $row->currency,
                'pending' => (int) $row->pending,
                'approved' => (int) $row->approved,
                'paid' => (int) $row->paid,
            ]);

        return Inertia::render('Agent/Dashboard', [
            'agent' => [
                'name' => $request->user()->name,
                'referral_code' => $agent->referral_code,
                'referral_url' => url('/paket-umroh').'?ref='.$agent->referral_code,
            ],
            'bookings' => $bookings,
            'summary' => [
                'total_bookings' => $activeBookings->count(),
                'total_pax' => $activeBookings->sum('passenger_count'),
                'revenue_by_currency' => $activeBookings
                    ->groupBy('currency')
                    ->map(fn ($currencyBookings, string $currency): array => [
                        'currency' => $currency,
                        'amount' => (int) $currencyBookings->sum('total_amount'),
                    ])->values()->all(),
                'commissions_by_currency' => $commissionSummary,
            ],
        ]);
    }
}
