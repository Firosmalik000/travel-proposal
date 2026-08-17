<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Agent\CreateBookingCommission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreAgentRequest;
use App\Http\Requests\Administrator\UpdateAgentCommissionRequest;
use App\Http\Requests\Administrator\UpdateAgentPackageFeeRequest;
use App\Http\Requests\Administrator\UpdateAgentRequest;
use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AgentManagementController extends Controller
{
    public function __construct(private readonly CreateBookingCommission $createBookingCommission) {}

    public function agents(): Response
    {
        $agents = AgentProfile::query()
            ->with([
                'user:id,name,email',
                'commissions' => fn ($query) => $query->whereNot('status', 'cancelled')->select(['id', 'agent_profile_id', 'commission_amount', 'currency']),
            ])
            ->withCount('bookings')
            ->orderBy('referral_code')
            ->get()
            ->map(fn (AgentProfile $agent): array => [
                'id' => $agent->id,
                'name' => $agent->user?->name,
                'email' => $agent->user?->email,
                'referral_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'bank_name' => $agent->bank_name,
                'bank_account_name' => $agent->bank_account_name,
                'bank_account_number' => $agent->bank_account_number,
                'is_active' => $agent->is_active,
                'bookings_count' => (int) $agent->bookings_count,
                'commission_totals' => $agent->commissions
                    ->groupBy('currency')
                    ->map(fn ($commissions, string $currency): array => [
                        'currency' => $currency,
                        'amount' => (int) $commissions->sum('commission_amount'),
                    ])->values()->all(),
            ]);

        return Inertia::render('Dashboard/AgentManagement/Agents/Index', ['agents' => $agents]);
    }

    public function storeAgent(StoreAgentRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $user = User::query()->create([
                'name' => $request->string('name')->value(),
                'full_name' => $request->string('name')->value(),
                'email' => $request->string('email')->value(),
                'password' => $request->validated('password'),
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $user->assignRole('Agent');
            $user->agentProfile()->create($request->safe()->only([
                'referral_code', 'phone', 'bank_name', 'bank_account_name',
                'bank_account_number', 'is_active',
            ]));
        });

        return back()->with('success', 'Agent berhasil ditambahkan.');
    }

    public function updateAgent(UpdateAgentRequest $request, AgentProfile $agent): RedirectResponse
    {
        DB::transaction(function () use ($request, $agent): void {
            $userPayload = $request->safe()->only(['name', 'email']);
            $userPayload['full_name'] = $userPayload['name'];
            if ($request->filled('password')) {
                $userPayload['password'] = $request->validated('password');
            }

            $agent->user()->update($userPayload);
            $agent->update($request->safe()->only([
                'referral_code', 'phone', 'bank_name', 'bank_account_name',
                'bank_account_number', 'is_active',
            ]));
        });

        return back()->with('success', 'Data agent berhasil diperbarui.');
    }

    public function fees(): Response
    {
        return Inertia::render('Dashboard/AgentManagement/Fees/Index', [
            'agents' => AgentProfile::query()->with('user:id,name')->where('is_active', true)->orderBy('referral_code')->get()->map(fn (AgentProfile $agent): array => [
                'id' => $agent->id,
                'name' => $agent->user?->name,
                'referral_code' => $agent->referral_code,
            ]),
            'packages' => TravelPackage::query()->orderBy('code')->get(['id', 'code', 'name', 'currency'])->map(fn (TravelPackage $package): array => [
                'id' => $package->id,
                'code' => $package->code,
                'name' => data_get($package->name, 'id', $package->code),
                'currency' => $package->currency,
            ]),
            'fees' => AgentPackageFee::query()->with(['agentProfile.user:id,name', 'package:id,code,name,currency'])->latest()->get()->map(fn (AgentPackageFee $fee): array => [
                'id' => $fee->id,
                'agent_profile_id' => $fee->agent_profile_id,
                'package_id' => $fee->package_id,
                'agent_name' => $fee->agentProfile?->user?->name,
                'referral_code' => $fee->agentProfile?->referral_code,
                'package_code' => $fee->package?->code,
                'package_name' => data_get($fee->package?->name, 'id', $fee->package?->code),
                'currency' => $fee->package?->currency ?? 'IDR',
                'fee_type' => $fee->fee_type,
                'fee_value' => (float) $fee->fee_value,
                'is_active' => $fee->is_active,
            ]),
        ]);
    }

    public function updateFee(UpdateAgentPackageFeeRequest $request): RedirectResponse
    {
        $fee = AgentPackageFee::query()->updateOrCreate(
            $request->safe()->only(['agent_profile_id', 'package_id']),
            $request->safe()->only(['fee_type', 'fee_value', 'is_active']),
        );

        if ($fee->is_active) {
            Booking::query()
                ->where('agent_profile_id', $fee->agent_profile_id)
                ->where('package_id', $fee->package_id)
                ->where('status', 'registered')
                ->whereDoesntHave('agentCommission')
                ->chunkById(100, function ($bookings) use ($fee): void {
                    foreach ($bookings as $booking) {
                        $this->createBookingCommission->handle($booking, $fee);
                    }
                });
        }

        return back()->with('success', 'Fee package agent berhasil disimpan.');
    }

    public function commissions(): Response
    {
        $commissions = AgentCommission::query()
            ->with([
                'agentProfile.user:id,name',
                'booking' => fn ($query) => $query
                    ->select(['id', 'booking_code', 'full_name', 'passenger_count', 'agreed_total_amount', 'status'])
                    ->withSum(['payments as paid_amount' => fn ($paymentQuery) => $paymentQuery->where('status', 'confirmed')], 'amount'),
                'package:id,code,name',
            ])
            ->latest()
            ->paginate(25)
            ->through(fn (AgentCommission $commission): array => [
                'id' => $commission->id,
                'agent_name' => $commission->agentProfile?->user?->name,
                'referral_code' => $commission->agentProfile?->referral_code,
                'booking_code' => $commission->booking?->booking_code,
                'customer_name' => $commission->booking?->full_name,
                'passenger_count' => (int) ($commission->booking?->passenger_count ?? 0),
                'booking_status' => $commission->booking?->status,
                'paid_amount' => (int) ($commission->booking?->paid_amount ?? 0),
                'package_name' => data_get($commission->package?->name, 'id', $commission->package?->code),
                'fee_type' => $commission->fee_type,
                'fee_value' => (float) $commission->fee_value,
                'base_amount' => $commission->base_amount,
                'commission_amount' => $commission->commission_amount,
                'currency' => $commission->currency,
                'status' => $commission->status,
                'notes' => $commission->notes,
            ]);

        return Inertia::render('Dashboard/AgentManagement/Commissions/Index', [
            'commissions' => $commissions,
            'summary' => AgentCommission::query()
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
                ]),
        ]);
    }

    public function updateCommission(UpdateAgentCommissionRequest $request, AgentCommission $commission): RedirectResponse
    {
        $status = $request->string('status')->value();
        $allowedTransitions = [
            'pending' => ['pending', 'approved', 'cancelled'],
            'approved' => ['approved', 'pending', 'paid', 'cancelled'],
            'paid' => ['paid'],
            'cancelled' => ['cancelled', 'pending'],
        ];

        if (! in_array($status, $allowedTransitions[$commission->status] ?? [], true)) {
            return back()->withErrors([
                'commission' => 'Perubahan status komisi tidak valid. Komisi paid bersifat final dan pending harus disetujui sebelum dibayar.',
            ]);
        }

        $commission->loadMissing('booking:id,status');
        if ($commission->booking?->status === 'cancelled' && $status !== 'cancelled') {
            return back()->withErrors([
                'commission' => 'Komisi booking yang dibatalkan tidak dapat diaktifkan kembali.',
            ]);
        }

        $commission->update([
            'status' => $status,
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'approved_at' => in_array($status, ['approved', 'paid'], true) ? ($commission->approved_at ?? now()) : null,
            'paid_at' => $status === 'paid' ? ($commission->paid_at ?? now()) : null,
        ]);

        return back()->with('success', 'Status komisi berhasil diperbarui.');
    }
}
