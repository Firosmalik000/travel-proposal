<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageCostCalculationRequest;
use App\Http\Requests\Administrator\UpdatePackageCostCalculationRequest;
use App\Models\HotelAssignment;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Services\PackageCostCalculationService;
use App\Services\PackageCurrencySnapshotService;
use App\Services\PackageHppEstimateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageCostCalculationController extends Controller
{
    public function __construct(
        private readonly PackageCostCalculationService $service,
        private readonly PackageCurrencySnapshotService $packageCurrencySnapshotService,
        private readonly PackageHppEstimateService $hppEstimateService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = [
            'travel_package_id' => $request->integer('travel_package_id') ?: null,
            'departure_schedule_id' => null,
        ];

        $rows = PackageCostCalculation::query()
            ->with(['package:id,code,name,departure_city,start_date,price,original_price,currency,content', 'items'])
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->latest('calculated_at')
            ->get()
            ->map(fn (PackageCostCalculation $calculation): array => [
                'id' => $calculation->id,
                'is_saved' => true,
                'travel_package_id' => (int) $calculation->package_id,
                'departure_schedule_id' => null,
                'calculation_mode' => (string) $calculation->calculation_mode,
                'calculation_date' => $calculation->calculation_date?->toDateString(),
                'package_name' => $this->resolvePackageName($calculation->package?->name, $calculation->package?->code),
                'package_code' => (string) ($calculation->package?->code ?? '-'),
                'package_price' => (float) ($calculation->package?->price ?? 0),
                'package_currency' => (string) ($calculation->package_currency ?: $calculation->package?->currency ?: 'IDR'),
                'package_conversion_rate_to_idr' => (float) ($calculation->package_conversion_rate_to_idr ?? 1),
                'package_original_price' => $calculation->package?->original_price !== null ? (float) $calculation->package->original_price : null,
                'package_discount_percent' => $calculation->package?->discountPercent(),
                'package_room_prices' => data_get($calculation->package?->content, 'room_prices', []),
                'package_room_original_prices' => data_get($calculation->package?->content, 'room_original_prices', []),
                'hpp_estimate' => data_get($calculation->package?->content, 'hpp_estimate'),
                'departure_date' => $calculation->package?->start_date?->toDateString(),
                'departure_city' => $calculation->package?->departure_city,
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

        $packageStats = TravelPackage::query()
            ->when($filters['travel_package_id'], fn ($query) => $query->whereKey((int) $filters['travel_package_id']))
            ->withCount([
                'registrations as total_bookings' => fn ($query) => $query->where('status', 'registered'),
            ])
            ->withSum([
                'registrations as total_customers' => fn ($query) => $query->where('status', 'registered'),
            ], 'passenger_count')
            ->get(['id', 'code', 'name', 'departure_city', 'start_date', 'price', 'original_price', 'currency', 'content']);

        $hotelAssignmentsCount = HotelAssignment::query()
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->selectRaw('package_id as travel_package_id')
            ->selectRaw('COUNT(id) as total_hotels')
            ->groupBy('package_id')
            ->get()
            ->mapWithKeys(fn ($row): array => [
                (int) $row->travel_package_id => (int) $row->total_hotels,
            ]);

        $latestCalculations = PackageCostCalculation::query()
            ->with('items')
            ->when($filters['travel_package_id'], fn ($query) => $query->where('package_id', (int) $filters['travel_package_id']))
            ->orderByDesc('calculated_at')
            ->get();

        $latestCalculationMap = $latestCalculations
            ->unique(fn (PackageCostCalculation $calculation): int => (int) $calculation->package_id)
            ->mapWithKeys(function (PackageCostCalculation $calculation): array {
                return [
                    (int) $calculation->package_id => [
                        'id' => (int) $calculation->id,
                        'is_saved' => true,
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
                        'package_currency' => (string) ($calculation->package_currency ?: 'IDR'),
                        'package_conversion_rate_to_idr' => (float) ($calculation->package_conversion_rate_to_idr ?? 1),
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

        $sourceRows = $packageStats
            ->map(function (TravelPackage $package) use ($hotelAssignmentsCount, $latestCalculationMap): array {
                $latest = $latestCalculationMap->get((int) $package->id);
                $calculationMode = (string) data_get(
                    $latest,
                    'calculation_mode',
                    PackageCostCalculationService::MODE_LEGACY_ASSIGNMENT,
                );
                $payload = $this->service->preview(
                    packageId: (int) $package->id,
                    departureScheduleId: null,
                    manualAdjustment: 0,
                    calculationMode: $calculationMode,
                );
                $tourLeaderFee = (int) data_get($latest, 'tour_leader_fee', 0);
                $muthawwifFee = (int) data_get($latest, 'muthawwif_fee', 0);
                $grandTotal = (int) ($payload['grand_total'] ?? 0) + $tourLeaderFee + $muthawwifFee;
                $customerCount = (int) ($payload['customer_count'] ?? 0);
                $actual = [
                    'id' => (int) data_get($latest, 'id', 0),
                    'is_saved' => $latest !== null,
                    'calculation_mode' => $calculationMode,
                    'calculated_at' => data_get($latest, 'calculated_at'),
                    'hotel_total' => (int) ($payload['hotel_total'] ?? 0),
                    'product_total' => (int) ($payload['product_total'] ?? 0),
                    'manual_adjustment' => 0,
                    'tour_leader_fee' => $tourLeaderFee,
                    'muthawwif_fee' => $muthawwifFee,
                    'grand_total' => $grandTotal,
                    'hpp_per_customer' => $customerCount > 0 ? (int) floor($grandTotal / $customerCount) : null,
                    'currency' => (string) ($payload['currency'] ?? 'IDR'),
                    'package_currency' => (string) ($payload['package_currency'] ?? $package?->currency ?? 'IDR'),
                    'package_conversion_rate_to_idr' => (float) ($payload['package_conversion_rate_to_idr'] ?? 1),
                    'warnings' => collect($payload['warnings'] ?? [])->values()->all(),
                    'notes' => data_get($latest, 'notes'),
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

                return [
                    'travel_package_id' => (int) $package->id,
                    'departure_schedule_id' => null,
                    'package_name' => $this->resolvePackageName($package?->name, $package?->code),
                    'package_code' => (string) ($package?->code ?? '-'),
                    'package_price' => (float) ($package?->price ?? 0),
                    'package_currency' => (string) data_get($actual, 'package_currency', $package?->currency ?? 'IDR'),
                    'package_conversion_rate_to_idr' => (float) data_get($actual, 'package_conversion_rate_to_idr', 1),
                    'package_original_price' => $package?->original_price !== null ? (float) $package->original_price : null,
                    'package_discount_percent' => $package?->discountPercent(),
                    'package_room_prices' => data_get($package?->content, 'room_prices', []),
                    'package_room_original_prices' => data_get($package?->content, 'room_original_prices', []),
                    'hpp_estimate' => data_get($package?->content, 'hpp_estimate'),
                    'departure_date' => $package?->start_date?->toDateString(),
                    'departure_city' => $package?->departure_city,
                    'total_bookings' => (int) $package->total_bookings,
                    'total_customers' => (int) ($package->total_customers ?? 0),
                    'total_hotels_assigned' => (int) ($hotelAssignmentsCount->get((int) $package->id, 0)),
                    'latest_calculation' => $actual,
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

                return $first['travel_package_id'] <=> $second['travel_package_id'];
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
            departureScheduleId: null,
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
        $package = $hppPackage->package()->firstOrFail();
        $this->packageCurrencySnapshotService->refreshPackage($package);
        $package->refresh();
        $content = is_array($package->content) ? $package->content : [];
        $estimate = data_get($content, 'hpp_estimate');

        if (is_array($estimate)) {
            $package->load('products');
            $currencyCode = strtoupper((string) ($package->currency ?: 'IDR'));
            $currencyRate = data_get($content, "hpp_currency_snapshots.{$currencyCode}", []);
            $content['hpp_estimate'] = $this->hppEstimateService->calculate(
                $estimate,
                (int) round((float) $package->price),
                data_get($content, 'room_prices', []),
                (float) data_get($currencyRate, 'rate_to_idr', 0),
                $currencyCode,
                (string) data_get($currencyRate, 'source', 'unavailable'),
                data_get($currencyRate, 'fetched_at'),
                $package->products,
                $package->products->mapWithKeys(fn (TravelProduct $product): array => [
                    (string) $product->id => (int) ($product->pivot->multiplier_per_pax ?? 1),
                ])->all(),
                $package->start_date?->toDateString(),
                data_get($content, 'hotel_product_brokers', []),
                data_get($content, 'hpp_currency_snapshots', []),
            );
            $package->update(['content' => $content]);
        }

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
