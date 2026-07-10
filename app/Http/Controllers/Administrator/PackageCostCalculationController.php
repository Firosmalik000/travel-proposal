<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageCostCalculationRequest;
use App\Http\Requests\Administrator\UpdatePackageCostCalculationRequest;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\HotelAssignment;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Services\PackageCostCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageCostCalculationController extends Controller
{
    public function __construct(private readonly PackageCostCalculationService $service) {}

    public function index(Request $request): Response
    {
        $filters = [
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
            'departure_schedule_id' => $request->integer('departure_schedule_id') ?: null,
        ];

        $rows = PackageCostCalculation::query()
            ->with(['package:id,code,name,price,original_price,content', 'departureSchedule:id,departure_date,departure_city', 'items'])
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->when($filters['departure_schedule_id'], fn ($query) => $query->where('departure_schedule_id', (int) $filters['departure_schedule_id']))
            ->latest('calculated_at')
            ->get()
            ->map(fn (PackageCostCalculation $calculation): array => [
                'id' => $calculation->id,
                'travel_package_id' => (int) $calculation->package_id,
                'departure_schedule_id' => $calculation->departure_schedule_id ? (int) $calculation->departure_schedule_id : null,
                'calculation_mode' => (string) $calculation->calculation_mode,
                'calculation_date' => $calculation->calculation_date?->toDateString(),
                'package_name' => $this->resolvePackageName($calculation->package?->name, $calculation->package?->code),
                'package_code' => (string) ($calculation->package?->code ?? '-'),
                'package_price' => (float) ($calculation->package?->price ?? 0),
                'package_original_price' => $calculation->package?->original_price !== null ? (float) $calculation->package->original_price : null,
                'package_discount_percent' => $calculation->package?->discountPercent(),
                'package_room_prices' => data_get($calculation->package?->content, 'room_prices', []),
                'package_room_original_prices' => data_get($calculation->package?->content, 'room_original_prices', []),
                'departure_date' => $calculation->departureSchedule?->departure_date?->toDateString(),
                'departure_city' => $calculation->departureSchedule?->departure_city,
                'booking_count' => (int) $calculation->booking_count,
                'customer_count' => (int) $calculation->customer_count,
                'hotel_total' => (int) $calculation->hotel_total,
                'product_total' => (int) $calculation->product_total,
                'manual_adjustment' => (int) $calculation->manual_adjustment,
                'tour_leader_fee' => (int) ($calculation->tour_leader_fee ?? 0),
                'muthawwif_fee' => (int) ($calculation->muthawwif_fee ?? 0),
                'grand_total' => (int) $calculation->grand_total,
                'hpp_per_customer' => $calculation->hpp_per_customer ? (int) $calculation->hpp_per_customer : null,
                'currency' => $calculation->currency,
                'warnings' => collect($calculation->warnings ?? [])->values()->all(),
                'notes' => $calculation->notes,
                'calculated_at' => $calculation->calculated_at?->toDateTimeString(),
                'items' => $calculation->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'cost_type' => $item->cost_type,
                    'label' => $item->label,
                    'description' => $item->description,
                    'quantity' => (int) $item->quantity,
                    'unit_price' => (int) $item->unit_price,
                    'total_price' => (int) $item->total_price,
                    'meta' => $item->meta,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        $scheduleStats = Booking::query()
            ->whereIn('status', ['pending', 'registered'])
            ->whereNotNull('package_id')
            ->whereNotNull('departure_schedule_id')
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->when($filters['departure_schedule_id'], fn ($query) => $query->where('departure_schedule_id', (int) $filters['departure_schedule_id']))
            ->selectRaw('package_id as travel_package_id')
            ->selectRaw('departure_schedule_id')
            ->selectRaw('COUNT(id) as total_bookings')
            ->selectRaw('SUM(passenger_count) as total_customers')
            ->groupBy('package_id', 'departure_schedule_id')
            ->get();

        $hotelAssignmentsCount = HotelAssignment::query()
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->when($filters['departure_schedule_id'], fn ($query) => $query->where('departure_schedule_id', (int) $filters['departure_schedule_id']))
            ->selectRaw('package_id as travel_package_id')
            ->selectRaw('departure_schedule_id')
            ->selectRaw('COUNT(id) as total_hotels')
            ->groupBy('package_id', 'departure_schedule_id')
            ->get()
            ->mapWithKeys(fn ($row): array => [
                ((int) $row->travel_package_id).'-'.((int) $row->departure_schedule_id) => (int) $row->total_hotels,
            ]);

        $latestCalculations = PackageCostCalculation::query()
            ->with('items')
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->when($filters['departure_schedule_id'], fn ($query) => $query->where('departure_schedule_id', (int) $filters['departure_schedule_id']))
            ->orderByDesc('calculated_at')
            ->get();

        $latestCalculationMap = $latestCalculations
            ->mapWithKeys(function (PackageCostCalculation $calculation): array {
                $key = ((int) $calculation->package_id).'-'.((int) $calculation->departure_schedule_id);

                return [
                    $key => [
                        'id' => (int) $calculation->id,
                        'calculation_mode' => (string) $calculation->calculation_mode,
                        'calculated_at' => $calculation->calculated_at?->toDateTimeString(),
                        'hotel_total' => (int) $calculation->hotel_total,
                        'product_total' => (int) $calculation->product_total,
                        'manual_adjustment' => (int) $calculation->manual_adjustment,
                        'tour_leader_fee' => (int) ($calculation->tour_leader_fee ?? 0),
                        'muthawwif_fee' => (int) ($calculation->muthawwif_fee ?? 0),
                        'grand_total' => (int) $calculation->grand_total,
                        'hpp_per_customer' => $calculation->hpp_per_customer ? (int) $calculation->hpp_per_customer : null,
                        'currency' => (string) $calculation->currency,
                        'warnings' => collect($calculation->warnings ?? [])->values()->all(),
                        'notes' => $calculation->notes,
                        'items' => $calculation->items->map(fn ($item): array => [
                            'id' => $item->id,
                            'cost_type' => $item->cost_type,
                            'label' => $item->label,
                            'description' => $item->description,
                            'quantity' => (int) $item->quantity,
                            'unit_price' => (int) $item->unit_price,
                            'total_price' => (int) $item->total_price,
                            'meta' => $item->meta,
                        ])->values()->all(),
                    ],
                ];
            });

        $packageMap = TravelPackage::query()
            ->whereIn('id', $scheduleStats->pluck('travel_package_id')->all())
            ->get(['id', 'code', 'name', 'price', 'original_price', 'content'])
            ->keyBy('id');

        $scheduleMap = DepartureSchedule::query()
            ->whereIn('id', $scheduleStats->pluck('departure_schedule_id')->all())
            ->get(['id', 'departure_date', 'departure_city'])
            ->keyBy('id');

        $sourceRows = $scheduleStats
            ->map(function ($stat) use ($hotelAssignmentsCount, $latestCalculationMap, $packageMap, $scheduleMap): array {
                $key = ((int) $stat->travel_package_id).'-'.((int) $stat->departure_schedule_id);
                $package = $packageMap->get((int) $stat->travel_package_id);
                $schedule = $scheduleMap->get((int) $stat->departure_schedule_id);
                $latest = $latestCalculationMap->get($key);
                $preview = null;

                if (! $latest) {
                    $payload = $this->service->preview(
                        packageId: (int) $stat->travel_package_id,
                        departureScheduleId: (int) $stat->departure_schedule_id,
                        manualAdjustment: 0,
                    );

                    $preview = [
                        'id' => 0,
                        'calculation_mode' => PackageCostCalculationService::MODE_LEGACY_ASSIGNMENT,
                        'calculated_at' => now()->toDateTimeString(),
                        'hotel_total' => (int) ($payload['hotel_total'] ?? 0),
                        'product_total' => (int) ($payload['product_total'] ?? 0),
                        'manual_adjustment' => (int) ($payload['manual_adjustment'] ?? 0),
                        'tour_leader_fee' => 0,
                        'muthawwif_fee' => 0,
                        'grand_total' => (int) ($payload['grand_total'] ?? 0),
                        'hpp_per_customer' => isset($payload['hpp_per_customer']) ? (int) $payload['hpp_per_customer'] : null,
                        'currency' => (string) ($payload['currency'] ?? 'IDR'),
                        'warnings' => collect($payload['warnings'] ?? [])->values()->all(),
                        'notes' => null,
                        'items' => collect($payload['items'] ?? [])->map(fn (array $item): array => [
                            'id' => 0,
                            'cost_type' => (string) ($item['cost_type'] ?? ''),
                            'label' => (string) ($item['label'] ?? ''),
                            'description' => $item['description'] ?? null,
                            'quantity' => (int) ($item['quantity'] ?? 0),
                            'unit_price' => (int) ($item['unit_price'] ?? 0),
                            'total_price' => (int) ($item['total_price'] ?? 0),
                            'meta' => $item['meta'] ?? [],
                        ])->values()->all(),
                    ];
                }

                return [
                    'travel_package_id' => (int) $stat->travel_package_id,
                    'departure_schedule_id' => (int) $stat->departure_schedule_id,
                    'package_name' => $this->resolvePackageName($package?->name, $package?->code),
                    'package_code' => (string) ($package?->code ?? '-'),
                    'package_price' => (float) ($package?->price ?? 0),
                    'package_original_price' => $package?->original_price !== null ? (float) $package->original_price : null,
                    'package_discount_percent' => $package?->discountPercent(),
                    'package_room_prices' => data_get($package?->content, 'room_prices', []),
                    'package_room_original_prices' => data_get($package?->content, 'room_original_prices', []),
                    'departure_date' => $schedule?->departure_date?->toDateString(),
                    'departure_city' => $schedule?->departure_city,
                    'total_bookings' => (int) $stat->total_bookings,
                    'total_customers' => (int) $stat->total_customers,
                    'total_hotels_assigned' => (int) ($hotelAssignmentsCount->get($key, 0)),
                    'latest_calculation' => $latest ?? $preview,
                ];
            })
            ->sort(function (array $first, array $second): int {
                $firstDate = $first['departure_date'] ?? '';
                $secondDate = $second['departure_date'] ?? '';

                if ($firstDate !== $secondDate) {
                    return strcmp((string) $secondDate, (string) $firstDate);
                }

                $firstName = (string) ($first['package_name'] ?? '');
                $secondName = (string) ($second['package_name'] ?? '');

                if ($firstName !== $secondName) {
                    return strcmp($firstName, $secondName);
                }

                return ($first['travel_package_id'] <=> $second['travel_package_id'])
                    ?: ($first['departure_schedule_id'] <=> $second['departure_schedule_id']);
            })
            ->values()
            ->all();

        return Inertia::render('Dashboard/FinancialManagement/HppPackage/Index', [
            'rows' => $rows,
            'sourceRows' => $sourceRows,
            'packages' => TravelPackage::query()
                ->orderBy('code')
                ->get(['id', 'code', 'name'])
                ->map(fn (TravelPackage $package): array => [
                    'id' => $package->id,
                    'code' => $package->code,
                    'name' => $this->resolvePackageName($package->name, $package->code),
                ])->values()->all(),
            'schedules' => DepartureSchedule::query()
                ->orderBy('departure_date')
                ->get(['id', 'package_id', 'departure_date', 'departure_city'])
                ->map(fn (DepartureSchedule $schedule): array => [
                    'id' => $schedule->id,
                    'travel_package_id' => (int) $schedule->package_id,
                    'departure_date' => $schedule->departure_date?->toDateString(),
                    'departure_city' => $schedule->departure_city,
                ])->values()->all(),
            'filters' => $filters,
            'calculationModes' => [
                [
                    'value' => PackageCostCalculationService::MODE_PER_PAX_MULTIPLIER,
                    'label' => 'Per Pax Multiplier',
                ],
                [
                    'value' => PackageCostCalculationService::MODE_LEGACY_ASSIGNMENT,
                    'label' => 'Legacy Assignment',
                ],
            ],
        ]);
    }

    public function store(StorePackageCostCalculationRequest $request): RedirectResponse
    {
        $this->service->generate(
            packageId: $request->integer('travel_package_id'),
            departureScheduleId: $request->filled('departure_schedule_id') ? $request->integer('departure_schedule_id') : null,
            manualAdjustment: $request->integer('manual_adjustment'),
            notes: $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
            tourLeaderFee: $request->filled('tour_leader_fee') ? $request->integer('tour_leader_fee') : null,
            muthawwifFee: $request->filled('muthawwif_fee') ? $request->integer('muthawwif_fee') : null,
            calculationMode: (string) $request->input('calculation_mode', PackageCostCalculationService::MODE_PER_PAX_MULTIPLIER),
        );

        return back()->with('success', 'Cost calculation berhasil dibuat.');
    }

    public function update(UpdatePackageCostCalculationRequest $request, PackageCostCalculation $hppPackage): RedirectResponse
    {
        $this->service->updatePackagePrice(
            calculation: $hppPackage,
            packagePrice: $request->filled('package_price') ? $request->integer('package_price') : null,
            notes: $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
            tourLeaderFee: $request->filled('tour_leader_fee') ? $request->integer('tour_leader_fee') : null,
            muthawwifFee: $request->filled('muthawwif_fee') ? $request->integer('muthawwif_fee') : null,
        );

        return back()->with('success', 'Harga package berhasil diperbarui.');
    }

    public function recalculate(PackageCostCalculation $hppPackage): RedirectResponse
    {
        $this->service->recalculate($hppPackage);

        return back()->with('success', 'Cost calculation berhasil dihitung ulang.');
    }

    private function resolvePackageName(mixed $name, ?string $code = null): string
    {
        if (is_array($name)) {
            $resolvedName = trim((string) ($name['id'] ?? $name['en'] ?? ''));

            if ($resolvedName !== '') {
                return $resolvedName;
            }
        }

        if (is_string($name) && trim($name) !== '') {
            return trim($name);
        }

        return $code !== null && trim($code) !== '' ? trim($code) : '-';
    }
}
