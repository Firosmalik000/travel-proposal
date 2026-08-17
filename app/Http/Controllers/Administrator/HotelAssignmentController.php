<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreHotelAssignmentRequest;
use App\Http\Requests\Administrator\UpdateHotelAssignmentRequest;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\HotelAssignment;
use App\Models\HotelRoomType;
use App\Models\TravelPackage;
use App\Services\HotelAssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HotelAssignmentController extends Controller
{
    public function __construct(private readonly HotelAssignmentService $hotelAssignmentService) {}

    public function index(Request $request): Response
    {
        $filters = [
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
            'hotel_id' => $request->integer('hotel_id') ?: null,
            'status' => (string) $request->string('status')->value(),
        ];

        $summary = $this->customerSummary($filters['travel_package_id']);
        $packageStats = $this->bookingStatsByPackage()->keyBy('travel_package_id');

        $assignments = HotelAssignment::query()
            ->with([
                'package:id,code,name,departure_city,start_date,end_date',
                'hotel:id,name,code',
                'rooms.roomType:id,name',
            ])
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->when($filters['hotel_id'], fn ($query) => $query->where('hotel_id', (int) $filters['hotel_id']))
            ->when(in_array($filters['status'], ['draft', 'confirmed'], true), fn ($query) => $query->where('status', $filters['status']))
            ->latest()
            ->get()
            ->map(function (HotelAssignment $assignment) use ($packageStats): array {
                $totalRooms = $assignment->rooms->sum('room_count');
                $totalCapacity = $assignment->rooms->sum(fn ($room): int => (int) $room->room_count * (int) $room->room_capacity);

                return [
                    'id' => $assignment->id,
                    'travel_package_id' => $assignment->package_id,
                    'hotel_id' => $assignment->hotel_id,
                    'status' => $assignment->status,
                    'notes' => $assignment->notes,
                    'package_name' => (string) data_get($assignment->package?->name, 'id', $assignment->package?->code ?? '-'),
                    'package_code' => (string) ($assignment->package?->code ?? '-'),
                    'package_start_date' => $assignment->package?->start_date?->toDateString(),
                    'package_end_date' => $assignment->package?->end_date?->toDateString(),
                    'departure_city' => $assignment->package?->departure_city,
                    'hotel_name' => $assignment->hotel?->name,
                    'total_rooms' => (int) $totalRooms,
                    'total_capacity' => (int) $totalCapacity,
                    'total_customers' => (int) ($packageStats->get($assignment->package_id)['total_customers'] ?? 0),
                    'rooms' => $assignment->rooms->map(fn ($room): array => [
                        'room_type_id' => $room->room_type_id,
                        'room_type_name' => $room->roomType?->name,
                        'room_count' => $room->room_count,
                        'room_capacity' => $room->room_capacity,
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Dashboard/Booking/HotelAssignment/Index', [
            'assignments' => $assignments,
            'packages' => TravelPackage::query()
                ->whereIn('id', function ($query): void {
                    $query->from('bookings')
                        ->select('package_id')
                        ->whereIn('status', ['pending', 'registered'])
                        ->whereNotNull('package_id')
                        ->distinct();
                })
                ->orderBy('code')
                ->get(['id', 'code', 'name', 'departure_city', 'start_date', 'end_date'])
                ->map(fn (TravelPackage $package): array => [
                    'id' => $package->id,
                    'code' => $package->code,
                    'name' => (string) data_get($package->name, 'id', $package->code ?? '-'),
                    'departure_city' => $package->departure_city,
                    'start_date' => $package->start_date?->toDateString(),
                    'end_date' => $package->end_date?->toDateString(),
                ])->values()->all(),
            'hotels' => Hotel::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'product_id'])
                ->map(fn (Hotel $hotel): array => [
                    'id' => $hotel->id,
                    'name' => $hotel->name,
                    'code' => $hotel->code,
                    'product_id' => $hotel->product_id,
                ])->values()->all(),
            'packageHotelOptions' => $this->packageHotelOptions()->all(),
            'roomTypes' => HotelRoomType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelRoomType $roomType): array => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                ])->values()->all(),
            'filters' => $filters,
            'bookingSummary' => $summary,
            'bookingStatsByPackage' => $packageStats->values()->all(),
        ]);
    }

    public function store(StoreHotelAssignmentRequest $request): RedirectResponse
    {
        $this->hotelAssignmentService->create(
            payload: [
                'package_id' => $request->integer('travel_package_id'),
                'hotel_id' => $request->integer('hotel_id'),
                'status' => (string) $request->string('status')->value(),
                'notes' => $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
            ],
            rooms: collect($request->validated('rooms'))
                ->map(fn (array $room): array => [
                    'room_type_id' => (int) $room['room_type_id'],
                    'room_count' => (int) $room['room_count'],
                ])->values()->all(),
        );

        return back()->with('success', 'Hotel assignment berhasil dibuat.');
    }

    public function update(UpdateHotelAssignmentRequest $request, HotelAssignment $assignment): RedirectResponse
    {
        $this->hotelAssignmentService->update(
            assignment: $assignment,
            payload: [
                'package_id' => $request->integer('travel_package_id'),
                'hotel_id' => $request->integer('hotel_id'),
                'status' => (string) $request->string('status')->value(),
                'notes' => $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
            ],
            rooms: collect($request->validated('rooms'))
                ->map(fn (array $room): array => [
                    'room_type_id' => (int) $room['room_type_id'],
                    'room_count' => (int) $room['room_count'],
                ])->values()->all(),
        );

        return back()->with('success', 'Hotel assignment berhasil diperbarui.');
    }

    public function destroy(HotelAssignment $assignment): RedirectResponse
    {
        $this->hotelAssignmentService->delete($assignment);

        return back()->with('success', 'Hotel assignment berhasil dihapus.');
    }

    private function customerSummary(?int $packageId): array
    {
        $query = Booking::query()->whereIn('status', ['pending', 'registered']);

        if ($packageId !== null) {
            $query->where('package_id', $packageId);
        }

        return [
            'total_bookings' => (int) (clone $query)->count(),
            'total_customers' => (int) (clone $query)->sum('passenger_count'),
        ];
    }

    /**
     * @return Collection<int, array{travel_package_id:int,total_bookings:int,total_customers:int}>
     */
    private function bookingStatsByPackage(): Collection
    {
        return Booking::query()
            ->whereIn('status', ['pending', 'registered'])
            ->whereNotNull('package_id')
            ->selectRaw('package_id as travel_package_id')
            ->selectRaw('COUNT(id) as total_bookings')
            ->selectRaw('SUM(passenger_count) as total_customers')
            ->groupBy('package_id')
            ->get()
            ->map(fn ($row): array => [
                'travel_package_id' => (int) $row->travel_package_id,
                'total_bookings' => (int) $row->total_bookings,
                'total_customers' => (int) $row->total_customers,
            ]);
    }

    /**
     * @return Collection<int, array{travel_package_id:int,hotels:array<int,array{id:int,name:string,code:?string,product_id:?int}>}>
     */
    private function packageHotelOptions(): Collection
    {
        $activePackageIds = Booking::query()
            ->whereIn('status', ['pending', 'registered'])
            ->whereNotNull('package_id')
            ->distinct()
            ->pluck('package_id')
            ->map(fn ($id): int => (int) $id)
            ->values();

        $hotelProductsByPackage = TravelPackage::query()
            ->whereIn('id', $activePackageIds->all())
            ->with(['products' => fn ($query) => $query
                ->where('product_type', 'hotel')
                ->where('is_active', true)
                ->select('products.id')])
            ->get(['id'])
            ->mapWithKeys(fn (TravelPackage $package): array => [
                (int) $package->id => $package->products->pluck('id')->map(fn ($id): int => (int) $id)->all(),
            ]);

        $hotels = Hotel::query()
            ->where('is_active', true)
            ->whereNotNull('product_id')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'product_id']);

        return $activePackageIds->map(function (int $packageId) use ($hotelProductsByPackage, $hotels): array {
            $productIds = collect($hotelProductsByPackage->get($packageId, []))
                ->map(fn ($id): int => (int) $id)
                ->values();

            $packageHotels = $hotels
                ->filter(fn (Hotel $hotel): bool => in_array((int) $hotel->product_id, $productIds->all(), true))
                ->map(fn (Hotel $hotel): array => [
                    'id' => (int) $hotel->id,
                    'name' => (string) $hotel->name,
                    'code' => $hotel->code,
                    'product_id' => $hotel->product_id ? (int) $hotel->product_id : null,
                ])
                ->values()
                ->all();

            return [
                'travel_package_id' => $packageId,
                'hotels' => $packageHotels,
            ];
        });
    }
}
