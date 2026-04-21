<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManagePackageRegistrationRequest;
use App\Models\DepartureSchedule;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingRegisterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Booking/Register/Index', [
            'registrations' => $this->registrations([
                'status' => 'pending',
            ]),
        ]);
    }

    public function listing(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')->value()),
            'status' => 'registered',
        ];

        return Inertia::render('Dashboard/Booking/Listing/Index', [
            'registrations' => $this->registrations($filters),
            'packages' => $this->packages(),
            'schedules' => $this->schedules(),
            'filters' => $filters,
        ]);
    }

    public function markRegistered(PackageRegistration $registration): RedirectResponse
    {
        $registration->update([
            'status' => 'registered',
        ]);

        if ($registration->departureSchedule !== null) {
            $registration->departureSchedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.register.index')->with(
            'success',
            'Booking berhasil dipindahkan ke listing registered.',
        );
    }

    public function store(ManagePackageRegistrationRequest $request): RedirectResponse
    {
        $schedule = $request->selectedSchedule();

        $registration = PackageRegistration::query()->create([
            'travel_package_id' => $request->integer('travel_package_id'),
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'status' => $request->string('status')->value(),
        ]);

        if ($schedule !== null) {
            $schedule->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil ditambahkan.');
    }

    public function update(ManagePackageRegistrationRequest $request, PackageRegistration $registration): RedirectResponse
    {
        $previousSchedule = $registration->departureSchedule;
        $schedule = $request->selectedSchedule();

        $registration->update([
            'travel_package_id' => $request->integer('travel_package_id'),
            'departure_schedule_id' => $schedule?->id,
            'full_name' => $request->string('full_name')->value(),
            'phone' => $request->string('phone')->value(),
            'email' => $request->filled('email') ? $request->string('email')->value() : null,
            'origin_city' => $request->string('origin_city')->value(),
            'passenger_count' => $request->integer('passenger_count'),
            'notes' => $request->filled('notes') ? $request->string('notes')->value() : null,
            'status' => $request->string('status')->value(),
        ]);

        if ($previousSchedule !== null) {
            $previousSchedule->refresh()->syncSeatAvailability();
        }

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return to_route('booking.listing.index')->with('success', 'Booking berhasil diperbarui.');
    }

    public function destroy(PackageRegistration $registration): RedirectResponse
    {
        $schedule = $registration->departureSchedule;
        $registration->delete();

        if ($schedule !== null) {
            $schedule->refresh()->syncSeatAvailability();
        }

        return back()->with('success', 'Booking berhasil dihapus.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function registrations(array $filters = []): array
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $status = (string) ($filters['status'] ?? '');

        return PackageRegistration::query()
            ->with([
                'travelPackage:id,code,slug,name,package_type',
                'departureSchedule:id,travel_package_id,departure_date,return_date,departure_city,status',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($registrationQuery) use ($search): void {
                    $registrationQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('origin_city', 'like', "%{$search}%")
                        ->orWhereHas('travelPackage', function ($travelPackageQuery) use ($search): void {
                            $travelPackageQuery
                                ->where('code', 'like', "%{$search}%")
                                ->orWhere('name->id', 'like', "%{$search}%")
                                ->orWhere('name->en', 'like', "%{$search}%");
                        })
                        ->orWhereHas('departureSchedule', function ($scheduleQuery) use ($search): void {
                            $scheduleQuery->where('departure_city', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['pending', 'registered', 'cancelled'], true), function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (PackageRegistration $registration): array => [
                'id' => $registration->id,
                'booking_code' => sprintf('BK-%s-%04d', $registration->created_at?->format('ymd') ?? now()->format('ymd'), $registration->id),
                'full_name' => $registration->full_name,
                'phone' => $registration->phone,
                'email' => $registration->email,
                'origin_city' => $registration->origin_city,
                'passenger_count' => $registration->passenger_count,
                'notes' => $registration->notes,
                'status' => $registration->status,
                'created_at' => $registration->created_at?->toDateTimeString(),
                'travel_package_id' => $registration->travel_package_id,
                'departure_schedule_id' => $registration->departure_schedule_id,
                'travel_package' => [
                    'code' => $registration->travelPackage?->code,
                    'slug' => $registration->travelPackage?->slug,
                    'name' => $registration->travelPackage?->name,
                    'package_type' => $registration->travelPackage?->package_type,
                ],
                'departure_schedule' => [
                    'departure_date' => $registration->departureSchedule?->departure_date?->toDateString(),
                    'return_date' => $registration->departureSchedule?->return_date?->toDateString(),
                    'departure_city' => $registration->departureSchedule?->departure_city,
                    'status' => $registration->departureSchedule?->status,
                ],
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function packages(): array
    {
        return TravelPackage::query()
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'package_type'])
            ->map(fn (TravelPackage $travelPackage): array => [
                'id' => $travelPackage->id,
                'code' => $travelPackage->code,
                'name' => $travelPackage->name,
                'package_type' => $travelPackage->package_type,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function schedules(): array
    {
        return DepartureSchedule::query()
            ->where('is_active', true)
            ->withSum(
                ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                'passenger_count',
            )
            ->orderBy('departure_date')
            ->get([
                'id',
                'travel_package_id',
                'departure_date',
                'return_date',
                'departure_city',
                'status',
                'seats_available',
            ])
            ->map(fn (DepartureSchedule $departureSchedule): array => [
                'id' => $departureSchedule->id,
                'travel_package_id' => $departureSchedule->travel_package_id,
                'departure_date' => $departureSchedule->departure_date?->toDateString(),
                'return_date' => $departureSchedule->return_date?->toDateString(),
                'departure_city' => $departureSchedule->departure_city,
                'status' => $departureSchedule->status,
                'seats_available' => $departureSchedule->availableSeatsCount(),
            ])
            ->values()
            ->all();
    }
}
