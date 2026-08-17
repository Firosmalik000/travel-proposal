<?php

namespace App\Http\Controllers;

use App\Actions\Customer\ResolveCustomerAccount;
use App\Http\Requests\StorePackageRegistrationRequest;
use App\Models\AgentProfile;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\BookingRegistrationNotifier;
use App\Services\PackageRoomConfigurationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PackageRegistrationController extends Controller
{
    public function __construct(
        private BookingRegistrationNotifier $bookingRegistrationNotifier,
        private PackageRoomConfigurationService $packageRoomConfigurationService,
        private ResolveCustomerAccount $resolveCustomerAccount,
    ) {}

    public function create(Request $request, TravelPackage $travelPackage): Response
    {
        abort_unless(
            $travelPackage->is_active
            && $travelPackage->booking_status === 'open'
            && $travelPackage->start_date?->gte(Carbon::today())
            && $travelPackage->availableSeatsCount() > 0,
            404,
        );

        return Inertia::render('public/paket/register/index', [
            'referralCode' => $request->filled('ref')
                ? strtoupper($request->string('ref')->value())
                : ($request->session()->get('agent_referral_code') ?: $request->cookie('agent_referral_code')),
            'travelPackage' => [
                'id' => $travelPackage->id,
                'code' => $travelPackage->code,
                'slug' => $travelPackage->slug,
                'name' => $travelPackage->name,
                'summary' => $travelPackage->summary,
                'price' => (float) $travelPackage->price,
                'currency' => $travelPackage->currency,
                'departure_city' => $travelPackage->departure_city,
                'start_date' => $travelPackage->start_date?->toDateString(),
                'end_date' => $travelPackage->end_date?->toDateString(),
                'seats_available' => $travelPackage->availableSeatsCount(),
                'duration_days' => $travelPackage->duration_days,
                'image_path' => $travelPackage->image_path,
                'room_prices' => $this->packageRoomConfigurationService->roomPrices($travelPackage),
                'recommended_room_configuration' => $this->packageRoomConfigurationService->recommendedConfiguration(1),
            ],
        ]);
    }

    public function store(StorePackageRegistrationRequest $request, TravelPackage $travelPackage): RedirectResponse
    {
        $registration = DB::transaction(function () use ($request, $travelPackage): PackageRegistration {
            $referralCode = $request->filled('referral_code')
                ? strtoupper($request->string('referral_code')->value())
                : null;
            $agent = $referralCode
                ? AgentProfile::query()->where('referral_code', $referralCode)->where('is_active', true)->first()
                : null;
            $customer = $this->resolveCustomerAccount->handle(
                $request->string('full_name')->value(),
                $request->string('email')->value(),
                $request->string('phone')->value(),
            );

            return PackageRegistration::query()->create([
                'customer_id' => $customer->id,
                'agent_profile_id' => $agent?->id,
                'referral_code' => $agent?->referral_code,
                'package_id' => $travelPackage->id,
                'departure_schedule_id' => null,
                'full_name' => $request->string('full_name')->value(),
                'phone' => $request->string('phone')->value(),
                'email' => $customer->email,
                'origin_city' => $request->string('origin_city')->value(),
                'passenger_count' => $request->integer('passenger_count'),
                'room_configuration' => $this->packageRoomConfigurationService->normalizeConfiguration(
                    (array) $request->input('room_configuration', []),
                ),
                'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
                'status' => 'pending',
            ]);
        });

        $registration->load('package');

        $travelPackage->syncSeatAvailability();

        $this->bookingRegistrationNotifier->notifyAdmin($registration);

        return to_route('public.paket-register', ['travelPackage' => $travelPackage->slug]);
    }
}
