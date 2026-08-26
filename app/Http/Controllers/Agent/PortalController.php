<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\IndexPortalRecordsRequest;
use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\AgentReferralVisit;
use App\Models\Booking;
use App\Models\PackageRegistration;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function index(Request $request): Response
    {
        $agent = $this->agent($request);
        $activeBookings = Booking::query()->where('agent_profile_id', $agent->id)->whereNot('status', 'cancelled');
        $pendingLeads = PackageRegistration::query()->where('agent_profile_id', $agent->id)->where('status', 'pending')->count();
        $bookingCount = (clone $activeBookings)->count();
        $uniqueVisitors = AgentReferralVisit::query()->where('agent_profile_id', $agent->id)->distinct()->count('visitor_hash');

        return Inertia::render('Agent/Dashboard', [
            'agent' => $this->agentPayload($agent),
            'summary' => [
                'pending_leads' => $pendingLeads,
                'referral_clicks' => (int) AgentReferralVisit::query()->where('agent_profile_id', $agent->id)->sum('visit_count'),
                'unique_visitors' => $uniqueVisitors,
                'payout_profile_complete' => filled($agent->bank_name) && filled($agent->bank_account_name) && filled($agent->bank_account_number),
                'total_bookings' => $bookingCount,
                'total_pax' => (int) (clone $activeBookings)->sum('passenger_count'),
                'conversion_rate' => $uniqueVisitors > 0 ? round(($bookingCount / $uniqueVisitors) * 100, 1) : 0,
                'revenue_by_currency' => (clone $activeBookings)
                    ->selectRaw("COALESCE(agreed_currency, 'IDR') as currency, SUM(COALESCE(agreed_total_amount, 0)) as amount")
                    ->groupBy('currency')->orderBy('currency')->get()
                    ->map(fn ($row): array => ['currency' => (string) $row->currency, 'amount' => (int) $row->amount]),
                'commissions_by_currency' => $this->commissionSummary($agent),
            ],
            'recentLeads' => $this->leadQuery($agent)->limit(4)->get()->map(fn (PackageRegistration $lead): array => $this->leadPayload($lead)),
            'recentBookings' => $this->bookingQuery($agent)->limit(4)->get()->map(fn (Booking $booking): array => $this->bookingPayload($booking)),
        ]);
    }

    public function leads(IndexPortalRecordsRequest $request): Response
    {
        $agent = $this->agent($request);
        $filters = $request->validated();
        $query = $this->leadQuery($agent)
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                $query->where('full_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('package', fn ($packageQuery) => $packageQuery->where('code', 'like', "%{$search}%"));
            }))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date));

        return Inertia::render('Agent/Leads', [
            'leads' => $this->paginate($query->paginate(15), fn (PackageRegistration $lead): array => $this->leadPayload($lead)),
            'filters' => $filters,
        ]);
    }

    public function bookings(IndexPortalRecordsRequest $request): Response
    {
        $agent = $this->agent($request);
        $filters = $request->validated();
        $query = $this->bookingQuery($agent)
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(function ($query) use ($search): void {
                $query->where('booking_code', 'like', "%{$search}%")->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhereHas('package', fn ($packageQuery) => $packageQuery->where('code', 'like', "%{$search}%"));
            }))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date));

        return Inertia::render('Agent/Bookings', [
            'bookings' => $this->paginate($query->paginate(15), fn (Booking $booking): array => $this->bookingPayload($booking)),
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, Booking $booking): Response
    {
        $agent = $this->agent($request);
        abort_unless($booking->agent_profile_id === $agent->id, 403);
        $booking->load([
            'package:id,code,slug,name,start_date,end_date,departure_city,currency', 'agentCommission',
            'payments' => fn ($query) => $query->whereIn('status', ['pending', 'confirmed'])->latest('payment_date'),
        ]);

        return Inertia::render('Agent/BookingShow', ['booking' => [
            ...$this->bookingPayload($booking),
            'email' => $booking->email,
            'phone' => $booking->phone,
            'origin_city' => $booking->origin_city,
            'notes' => $booking->notes,
            'return_date' => $booking->package?->end_date?->toDateString(),
            'departure_city' => $booking->package?->departure_city,
            'fee_type' => $booking->agentCommission?->fee_type,
            'fee_value' => $booking->agentCommission ? (float) $booking->agentCommission->fee_value : null,
            'base_amount' => (int) ($booking->agentCommission?->base_amount ?? 0),
            'approved_at' => $booking->agentCommission?->approved_at?->toDateTimeString(),
            'paid_at' => $booking->agentCommission?->paid_at?->toDateTimeString(),
            'commission_notes' => $booking->agentCommission?->notes,
            'paid_amount' => (int) $booking->payments->where('status', 'confirmed')->sum('amount'),
        ]]);
    }

    public function commissions(IndexPortalRecordsRequest $request): Response
    {
        $agent = $this->agent($request);
        $filters = $request->validated();
        $query = AgentCommission::query()->where('agent_profile_id', $agent->id)
            ->with(['booking:id,booking_code,full_name,passenger_count,status', 'package:id,code,name'])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->whereHas('booking', function ($bookingQuery) use ($search): void {
                $bookingQuery->where('booking_code', 'like', "%{$search}%")->orWhere('full_name', 'like', "%{$search}%");
            }))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))->latest();

        return Inertia::render('Agent/Commissions', [
            'commissions' => $this->paginate($query->paginate(15), fn (AgentCommission $commission): array => [
                'id' => $commission->id,
                'booking_code' => $commission->booking?->booking_code,
                'customer_name' => $commission->booking?->full_name,
                'package_name' => data_get($commission->package?->name, 'id', $commission->package?->code),
                'passenger_count' => (int) ($commission->booking?->passenger_count ?? 0),
                'fee_type' => $commission->fee_type,
                'fee_value' => (float) $commission->fee_value,
                'base_amount' => (int) $commission->base_amount,
                'commission_amount' => (int) $commission->commission_amount,
                'currency' => $commission->currency,
                'status' => $commission->status,
                'approved_at' => $commission->approved_at?->toDateTimeString(),
                'paid_at' => $commission->paid_at?->toDateTimeString(),
                'notes' => $commission->notes,
            ]),
            'summary' => $this->commissionSummary($agent),
            'filters' => $filters,
        ]);
    }

    public function packages(Request $request): Response
    {
        $agent = $this->agent($request);

        return Inertia::render('Agent/Packages', [
            'agent' => $this->agentPayload($agent),
            'fees' => AgentPackageFee::query()->where('agent_profile_id', $agent->id)->where('is_active', true)
                ->whereHas('package', fn ($query) => $query->where('is_active', true))
                ->with('package:id,code,slug,name,image_path,start_date,end_date,departure_city,price,currency,booking_status')->latest()->get()
                ->map(fn (AgentPackageFee $fee): array => [
                    'id' => $fee->id,
                    'package_code' => $fee->package?->code,
                    'package_name' => data_get($fee->package?->name, 'id', $fee->package?->code),
                    'image_path' => $fee->package?->image_path,
                    'departure_date' => $fee->package?->start_date?->toDateString(),
                    'return_date' => $fee->package?->end_date?->toDateString(),
                    'departure_city' => $fee->package?->departure_city,
                    'price' => (int) ($fee->package?->price ?? 0),
                    'currency' => $fee->package?->currency ?? 'IDR',
                    'booking_status' => $fee->package?->booking_status,
                    'fee_type' => $fee->fee_type,
                    'fee_value' => (float) $fee->fee_value,
                    'referral_url' => url('/paket-umroh/'.$fee->package?->slug).'?ref='.$agent->referral_code,
                    'qr_url' => route('agent.packages.qr', ['travelPackage' => $fee->package_id]),
                ]),
        ]);
    }

    private function agent(Request $request): AgentProfile
    {
        return $request->user()->agentProfile;
    }

    /**
     * Build agent payload for Inertia response.
     *
     * @return array<string, mixed>
     */
    private function agentPayload(AgentProfile $agent): array
    {
        return [
            'name' => $agent->user?->name,
            'referral_code' => $agent->referral_code,
            'referral_url' => url('/paket-umroh').'?ref='.$agent->referral_code,
            'qr_url' => route('agent.referral.qr'),
        ];
    }

    /**
     * Build query for agent leads with relationships.
     */
    private function leadQuery(AgentProfile $agent): Builder
    {
        return PackageRegistration::query()->where('agent_profile_id', $agent->id)->with('package:id,code,name,start_date,currency')->latest();
    }

    /**
     * Build query for agent bookings with relationships.
     */
    private function bookingQuery(AgentProfile $agent): Builder
    {
        return Booking::query()->where('agent_profile_id', $agent->id)->with(['package:id,code,name,start_date,currency', 'agentCommission'])->latest();
    }

    /**
     * Build lead payload for Inertia response.
     *
     * @return array<string, mixed>
     */
    private function leadPayload(PackageRegistration $lead): array
    {
        return [
            'id' => $lead->id,
            'reference' => sprintf('REG-%04d', $lead->id),
            'customer_name' => $lead->full_name,
            'phone' => $lead->phone,
            'package_name' => data_get($lead->package?->name, 'id', $lead->package?->code),
            'departure_date' => $lead->package?->start_date?->toDateString(),
            'passenger_count' => (int) $lead->passenger_count,
            'status' => $lead->status,
            'created_at' => $lead->created_at?->toDateTimeString(),
        ];
    }

    /**
     * Build booking payload for Inertia response.
     *
     * @return array<string, mixed>
     */
    private function bookingPayload(Booking $booking): array
    {
        $currency = $booking->agreed_currency ?? $booking->package?->currency ?? 'IDR';

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'customer_name' => $booking->full_name,
            'package_name' => data_get($booking->package?->name, 'id', $booking->package?->code),
            'departure_date' => $booking->package?->start_date?->toDateString(),
            'passenger_count' => (int) $booking->passenger_count,
            'total_amount' => (int) ($booking->agreed_total_amount ?? 0),
            'currency' => $currency,
            'booking_status' => $booking->status,
            'commission_amount' => (int) ($booking->agentCommission?->commission_amount ?? 0),
            'commission_status' => $booking->agentCommission?->status ?? 'not_configured',
            'created_at' => $booking->created_at?->toDateTimeString(),
            'detail_url' => route('agent.bookings.show', ['booking' => $booking->booking_code]),
        ];
    }

    /**
     * Get commission summary by currency for agent.
     *
     * @return Collection<int, array<string, int|string>>
     */
    private function commissionSummary(AgentProfile $agent): Collection
    {
        return AgentCommission::query()->where('agent_profile_id', $agent->id)->select('currency')
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
    }

    /**
     * Map paginator results through callable and preserve query string.
     */
    private function paginate(LengthAwarePaginator $paginator, callable $mapper): LengthAwarePaginator
    {
        return $paginator->through($mapper)->withQueryString();
    }
}
