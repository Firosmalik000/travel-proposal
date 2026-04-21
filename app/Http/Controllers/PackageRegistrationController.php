<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePackageRegistrationRequest;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Services\BookingRegistrationNotifier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PackageRegistrationController extends Controller
{
    public function __construct(private BookingRegistrationNotifier $bookingRegistrationNotifier) {}

    public function create(TravelPackage $travelPackage): Response
    {
        $travelPackage->load([
            'schedules' => fn ($query) => $query
                ->withSum(
                    ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                    'passenger_count',
                )
                ->where('is_active', true)
                ->where('status', 'open')
                ->orderBy('departure_date'),
        ]);

        return Inertia::render('public/paket/register/index', [
            'travelPackage' => [
                'id' => $travelPackage->id,
                'code' => $travelPackage->code,
                'slug' => $travelPackage->slug,
                'name' => $travelPackage->name,
                'summary' => $travelPackage->summary,
                'price' => (float) $travelPackage->price,
                'currency' => $travelPackage->currency,
                'departure_city' => $travelPackage->departure_city,
                'duration_days' => $travelPackage->duration_days,
                'image_path' => $travelPackage->image_path,
                'schedules' => $travelPackage->schedules->map(fn ($schedule): array => [
                    'id' => $schedule->id,
                    'departure_date' => $schedule->departure_date?->toDateString(),
                    'return_date' => $schedule->return_date?->toDateString(),
                    'departure_city' => $schedule->departure_city,
                    'seats_available' => $schedule->availableSeatsCount(),
                ])->values()->all(),
            ],
        ]);
    }

    public function store(StorePackageRegistrationRequest $request, TravelPackage $travelPackage): RedirectResponse
    {
        $schedule = $request->selectedSchedule();

        if ($schedule !== null && (
            $schedule->travel_package_id !== $travelPackage->id
            || ! $schedule->is_active
            || $schedule->status !== 'open'
        )) {
            return back()->withErrors([
                'departure_schedule_id' => 'Jadwal keberangkatan yang dipilih tidak valid.',
            ]);
        }

        $registration = PackageRegistration::query()->create([
            'travel_package_id' => $travelPackage->id,
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'status' => 'pending',
        ]);

        $registration->load(['travelPackage', 'departureSchedule']);

        if ($schedule !== null) {
            $schedule->syncSeatAvailability();
        }

        $this->bookingRegistrationNotifier->notifyAdmin($registration);

        return to_route('public.paket-register', ['travelPackage' => $travelPackage->slug]);
    }
}
