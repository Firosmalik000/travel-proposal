<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PackageCostCalculationService
{
    public function __construct(
        private readonly CurrencyConversionService $currencyConversionService,
    ) {}

    public const MODE_LEGACY_ASSIGNMENT = 'legacy_assignment';

    public const MODE_PER_PAX_MULTIPLIER = 'per_pax_multiplier';

    /**
     * @return array<string, mixed>
     */
    public function preview(
        int $packageId,
        ?int $departureScheduleId,
        int $manualAdjustment = 0,
        string $calculationMode = self::MODE_LEGACY_ASSIGNMENT,
    ): array {
        return $this->calculatePayload(
            $packageId,
            $departureScheduleId,
            $manualAdjustment,
            $calculationMode,
        );
    }

    public function generate(
        int $packageId,
        ?int $departureScheduleId,
        int $manualAdjustment = 0,
        ?string $notes = null,
        ?int $tourLeaderFee = null,
        ?int $muthawwifFee = null,
        string $calculationMode = self::MODE_PER_PAX_MULTIPLIER,
    ): PackageCostCalculation {
        return DB::transaction(function () use ($packageId, $departureScheduleId, $manualAdjustment, $notes, $tourLeaderFee, $muthawwifFee, $calculationMode): PackageCostCalculation {
            $payload = $this->calculatePayload(
                $packageId,
                $departureScheduleId,
                $manualAdjustment,
                $calculationMode,
            );

            $calculation = PackageCostCalculation::query()->create([
                ...$payload,
                'notes' => $notes,
            ]);

            $calculation->items()->createMany($payload['items']);

            if ($tourLeaderFee !== null || $muthawwifFee !== null) {
                $calculation = $this->applyFeeAdjustments(
                    $calculation,
                    $tourLeaderFee,
                    $muthawwifFee,
                );
            }

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    public function recalculate(PackageCostCalculation $calculation): PackageCostCalculation
    {
        return DB::transaction(function () use ($calculation): PackageCostCalculation {
            $payload = $this->calculatePayload(
                packageId: (int) $calculation->package_id,
                departureScheduleId: $calculation->departure_schedule_id ? (int) $calculation->departure_schedule_id : null,
                manualAdjustment: (int) $calculation->manual_adjustment,
                calculationMode: (string) ($calculation->calculation_mode ?: self::MODE_LEGACY_ASSIGNMENT),
            );

            $extraFeeTotal = max((int) ($calculation->tour_leader_fee ?? 0), 0)
                + max((int) ($calculation->muthawwif_fee ?? 0), 0);
            $grandTotal = max((int) ($payload['grand_total'] ?? 0) + $extraFeeTotal, 0);

            $calculation->update([
                ...collect($payload)->except('items')->all(),
                'notes' => $calculation->notes,
                'tour_leader_fee' => $calculation->tour_leader_fee,
                'muthawwif_fee' => $calculation->muthawwif_fee,
                'grand_total' => $grandTotal,
                'hpp_per_customer' => (int) $calculation->customer_count > 0
                    ? (int) floor($grandTotal / (int) $calculation->customer_count)
                    : null,
            ]);

            $calculation->items()->delete();
            $calculation->items()->createMany($payload['items']);

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    public function updatePackagePrice(
        PackageCostCalculation $calculation,
        ?int $packagePrice,
        ?string $notes,
        ?int $tourLeaderFee = null,
        ?int $muthawwifFee = null,
    ): PackageCostCalculation {
        return DB::transaction(function () use ($calculation, $packagePrice, $notes, $tourLeaderFee, $muthawwifFee): PackageCostCalculation {
            if ($packagePrice !== null) {
                $calculation->package()->update([
                    'price' => $packagePrice,
                ]);
            }

            $calculation = $this->applyFeeAdjustments(
                $calculation,
                $tourLeaderFee,
                $muthawwifFee,
            );

            $calculation->update([
                'notes' => $notes,
                'tour_leader_fee' => $calculation->tour_leader_fee,
                'muthawwif_fee' => $calculation->muthawwif_fee,
                'grand_total' => $calculation->grand_total,
                'hpp_per_customer' => $calculation->hpp_per_customer,
            ]);

            return $calculation->load(['package:id,code,name', 'departureSchedule:id,departure_date,departure_city', 'items']);
        });
    }

    public function applyFeeAdjustments(
        PackageCostCalculation $calculation,
        ?int $tourLeaderFee,
        ?int $muthawwifFee,
    ): PackageCostCalculation {
        if ($tourLeaderFee !== null) {
            $calculation->tour_leader_fee = max($tourLeaderFee, 0);
        }

        if ($muthawwifFee !== null) {
            $calculation->muthawwif_fee = max($muthawwifFee, 0);
        }

        $grandTotal = max(
            (int) $calculation->hotel_total
            + (int) $calculation->product_total
            + (int) $calculation->manual_adjustment
            + (int) ($calculation->tour_leader_fee ?? 0)
            + (int) ($calculation->muthawwif_fee ?? 0),
            0,
        );

        $calculation->grand_total = $grandTotal;
        $calculation->hpp_per_customer = (int) $calculation->customer_count > 0
            ? (int) floor($grandTotal / (int) $calculation->customer_count)
            : null;
        $calculation->save();

        return $calculation;
    }

    /**
     * @return array<string, mixed>
     */
    private function calculatePayload(
        int $packageId,
        ?int $departureScheduleId,
        int $manualAdjustment,
        string $calculationMode,
    ): array {
        $package = TravelPackage::query()
            ->with(['products:id,code,name,product_type,content'])
            ->findOrFail($packageId);

        $schedule = $departureScheduleId
            ? DepartureSchedule::query()->findOrFail($departureScheduleId)
            : null;

        $bookingBaseQuery = Booking::query()
            ->where('package_id', $packageId)
            ->whereIn('status', ['pending', 'registered'])
            ->when($departureScheduleId !== null, fn ($query) => $query->where('departure_schedule_id', $departureScheduleId));

        $bookingCount = (int) (clone $bookingBaseQuery)->count();
        $customerCount = (int) (clone $bookingBaseQuery)->sum('passenger_count');
        $bookings = (clone $bookingBaseQuery)->get([
            'id',
            'passenger_count',
            'room_configuration',
        ]);

        $hotelPayload = $this->buildHotelBreakdown(
            $package,
            $bookings,
            $schedule?->departure_date?->toDateString(),
        );

        $productPayload = $this->buildProductBreakdown(
            $package,
            $customerCount,
            $calculationMode,
        );

        $warnings = [
            ...$hotelPayload['warnings'],
            ...$productPayload['warnings'],
        ];

        $grandTotal = max(
            $hotelPayload['total'] + $productPayload['total'] + $manualAdjustment,
            0,
        );

        return [
            'package_id' => $packageId,
            'departure_schedule_id' => $departureScheduleId,
            'calculation_mode' => $calculationMode,
            'calculation_date' => Carbon::today()->toDateString(),
            'booking_count' => $bookingCount,
            'customer_count' => $customerCount,
            'hotel_total' => $hotelPayload['total'],
            'product_total' => $productPayload['total'],
            'manual_adjustment' => $manualAdjustment,
            'tour_leader_fee' => null,
            'muthawwif_fee' => null,
            'grand_total' => $grandTotal,
            'hpp_per_customer' => $customerCount > 0 ? (int) floor($grandTotal / $customerCount) : null,
            'currency' => 'IDR',
            'warnings' => array_values(array_unique($warnings)),
            'calculated_at' => now(),
            'items' => [
                ...$hotelPayload['items'],
                ...$productPayload['items'],
            ],
        ];
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, total: int, warnings: array<int, string>}
     */
    private function buildHotelBreakdown(
        TravelPackage $package,
        Collection $bookings,
        ?string $periodDate,
    ): array {
        $items = [];
        $warnings = [];
        $hotelTotal = 0;

        $hotelProducts = $package->products->filter(
            fn (TravelProduct $product): bool => $product->product_type === 'hotel',
        );
        $roomTotals = $this->aggregateRoomConfigurationTotals($bookings);
        $selectedBrokers = data_get($package->content, 'hotel_product_brokers', []);
        $hasMissingRoomConfigurations = $bookings->contains(function (Booking $booking): bool {
            $configuration = $this->normalizeRoomConfiguration(
                is_array($booking->room_configuration) ? $booking->room_configuration : null,
            );

            return array_sum($configuration) === 0 && (int) $booking->passenger_count > 0;
        });

        if ($hasMissingRoomConfigurations) {
            $warnings[] = 'Ada booking yang belum memiliki komposisi kamar, sehingga HPP hotel bisa belum lengkap.';
        }

        foreach ($hotelProducts as $product) {
            $pricingRows = collect(data_get($product->content, 'pricing', []))
                ->filter(fn ($row): bool => is_array($row))
                ->values();
            $multiplierPerPax = max((int) ($product->pivot->multiplier_per_pax ?? 1), 1);
            $selectedBroker = is_array($selectedBrokers)
                ? ($selectedBrokers[(string) $product->id] ?? $selectedBrokers[$product->id] ?? null)
                : null;
            $productCurrency = strtoupper((string) data_get($product->content, 'currency', 'IDR'));

            foreach ($roomTotals as $roomType => $roomCount) {
                if ($roomCount < 1) {
                    continue;
                }

                $matchedPrice = $this->matchHotelProductPrice(
                    $pricingRows,
                    $roomType,
                    is_string($selectedBroker) ? $selectedBroker : null,
                    $periodDate,
                );

                if ($matchedPrice === null) {
                    $warnings[] = sprintf(
                        'Harga hotel belum tersedia untuk %s (%s%s).',
                        (string) ($product->name ?? $product->code),
                        $this->hotelRoomLabel($roomType),
                        is_string($selectedBroker) && $selectedBroker !== '' ? ' - '.$selectedBroker : '',
                    );
                }

                $originalUnitPrice = (int) data_get($matchedPrice, 'price', 0);
                $unitPrice = $this->currencyConversionService->convertToIdr(
                    $originalUnitPrice,
                    $productCurrency,
                );

                if ($unitPrice === null) {
                    $warnings[] = sprintf(
                        'Currency %s untuk hotel %s belum punya converter aktif ke IDR.',
                        $productCurrency,
                        (string) ($product->name ?? $product->code),
                    );
                    $unitPrice = 0;
                }

                $quantity = $roomCount * $multiplierPerPax;
                $totalPrice = $unitPrice * $quantity;
                $hotelTotal += $totalPrice;

                $items[] = [
                    'cost_type' => 'hotel',
                    'reference_type' => 'product',
                    'reference_id' => $product->id,
                    'label' => sprintf(
                        '%s - %s',
                        (string) ($product->name ?? $product->code),
                        $this->hotelRoomLabel($roomType),
                    ),
                    'description' => $periodDate ? 'Periode keberangkatan '.$periodDate : 'Harga hotel product aktif',
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'meta' => [
                        'product_code' => $product->code,
                        'product_type' => $product->product_type,
                        'original_currency' => $productCurrency,
                        'original_unit_price' => $originalUnitPrice,
                        'conversion_rate_to_idr' => $this->currencyConversionService->rateFor($productCurrency),
                        'room_type' => $roomType,
                        'room_count' => $roomCount,
                        'multiplier_per_pax' => $multiplierPerPax,
                        'broker_name' => data_get($matchedPrice, 'broker_name'),
                        'broker_key' => data_get($matchedPrice, 'broker_key'),
                        'period_start' => data_get($matchedPrice, 'period_start'),
                        'period_end' => data_get($matchedPrice, 'period_end'),
                        'calculation_source' => 'hotel_product_pricing',
                    ],
                ];
            }
        }

        if ($hotelProducts->isEmpty()) {
            return [
                'items' => $items,
                'total' => $hotelTotal,
                'warnings' => $warnings,
            ];
        }

        if (array_sum($roomTotals) === 0) {
            $warnings[] = 'Belum ada komposisi kamar customer untuk menghitung HPP hotel.';
        }

        return [
            'items' => $items,
            'total' => $hotelTotal,
            'warnings' => $warnings,
        ];
    }

    /**
     * @return array{items: array<int, array<string, mixed>>, total: int, warnings: array<int, string>}
     */
    private function buildProductBreakdown(
        TravelPackage $package,
        int $customerCount,
        string $calculationMode,
    ): array {
        $items = [];
        $warnings = [];
        $productTotal = 0;

        /** @var TravelProduct $product */
        foreach ($package->products as $product) {
            if ($product->product_type === 'hotel') {
                continue;
            }

            $originalPrice = (int) data_get($product->content, 'price', 0);
            $productCurrency = strtoupper((string) data_get($product->content, 'currency', 'IDR'));
            if ($originalPrice <= 0) {
                $warnings[] = sprintf('Harga product belum lengkap: %s', (string) ($product->name ?? $product->code));
            }

            $price = $this->currencyConversionService->convertToIdr(
                $originalPrice,
                $productCurrency,
            );

            if ($price === null) {
                $warnings[] = sprintf(
                    'Currency %s untuk product %s belum punya converter aktif ke IDR.',
                    $productCurrency,
                    (string) ($product->name ?? $product->code),
                );
                $price = 0;
            }

            $multiplierPerPax = max((int) ($product->pivot->multiplier_per_pax ?? 1), 1);
            $quantity = $calculationMode === self::MODE_PER_PAX_MULTIPLIER
                ? max($customerCount, 0) * $multiplierPerPax
                : max($customerCount, 0);
            $lineTotal = max($price, 0) * $quantity;
            $productTotal += $lineTotal;

            $items[] = [
                'cost_type' => 'product',
                'reference_type' => 'product',
                'reference_id' => $product->id,
                'label' => (string) ($product->name ?? $product->code),
                'description' => 'Biaya product dari Product Management',
                'quantity' => $quantity,
                'unit_price' => max($price, 0),
                'total_price' => $lineTotal,
                'meta' => [
                    'product_code' => $product->code,
                    'product_type' => $product->product_type,
                    'original_currency' => $productCurrency,
                    'original_unit_price' => $originalPrice,
                    'conversion_rate_to_idr' => $this->currencyConversionService->rateFor($productCurrency),
                    'customer_count' => $customerCount,
                    'multiplier_per_pax' => $multiplierPerPax,
                    'calculation_mode' => $calculationMode,
                ],
            ];
        }

        return [
            'items' => $items,
            'total' => $productTotal,
            'warnings' => $warnings,
        ];
    }

    /**
     * @return array{single:int,double:int,triple:int,quad:int}
     */
    private function aggregateRoomConfigurationTotals(Collection $bookings): array
    {
        return $bookings->reduce(
            function (array $carry, Booking $booking): array {
                $configuration = $this->normalizeRoomConfiguration(
                    is_array($booking->room_configuration) ? $booking->room_configuration : null,
                );

                foreach ($configuration as $roomType => $roomCount) {
                    $carry[$roomType] += $roomCount;
                }

                return $carry;
            },
            [
                'single' => 0,
                'double' => 0,
                'triple' => 0,
                'quad' => 0,
            ],
        );
    }

    /**
     * @param  array<string, mixed>|null  $configuration
     * @return array{single:int,double:int,triple:int,quad:int}
     */
    private function normalizeRoomConfiguration(?array $configuration): array
    {
        return [
            'single' => max(0, (int) data_get($configuration, 'single', 0)),
            'double' => max(0, (int) data_get($configuration, 'double', 0)),
            'triple' => max(0, (int) data_get($configuration, 'triple', 0)),
            'quad' => max(0, (int) data_get($configuration, 'quad', 0)),
        ];
    }

    private function hotelRoomLabel(string $roomType): string
    {
        return match ($roomType) {
            'single' => 'Single',
            'double' => 'Double',
            'triple' => 'Triple',
            'quad' => 'Quad',
            default => ucfirst($roomType),
        };
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $pricingRows
     * @return array<string, mixed>|null
     */
    private function matchHotelProductPrice(
        Collection $pricingRows,
        string $roomType,
        ?string $selectedBroker,
        ?string $periodDate,
    ): ?array {
        $normalizedRoomType = $this->normalizeHotelRoomTypeName($roomType);
        $normalizedBroker = $selectedBroker !== null ? $this->normalizeHotelBrokerName($selectedBroker) : null;

        return $pricingRows
            ->filter(function (array $row) use ($normalizedRoomType, $normalizedBroker, $periodDate): bool {
                $rowRoomType = $this->normalizeHotelRoomTypeName((string) ($row['room_type'] ?? ''));
                if ($rowRoomType !== $normalizedRoomType) {
                    return false;
                }

                if ($normalizedBroker !== null) {
                    $rowBrokerName = $this->normalizeHotelBrokerName((string) ($row['broker_name'] ?? ''));
                    $rowBrokerKey = $this->normalizeHotelBrokerName((string) ($row['broker_key'] ?? ''));

                    if ($rowBrokerName !== $normalizedBroker && $rowBrokerKey !== $normalizedBroker) {
                        return false;
                    }
                }

                if ($periodDate === null) {
                    return true;
                }

                $periodStart = data_get($row, 'period_start');
                $periodEnd = data_get($row, 'period_end');

                if (! is_string($periodStart) || ! is_string($periodEnd)) {
                    return false;
                }

                return $periodStart <= $periodDate && $periodEnd >= $periodDate;
            })
            ->sortByDesc(fn (array $row): string => (string) ($row['period_start'] ?? ''))
            ->map(fn (array $row): array => $row)
            ->first();
    }

    private function normalizeHotelRoomTypeName(string $value): string
    {
        $normalized = strtolower(trim($value));

        return match ($normalized) {
            'sgl', 'single' => 'single',
            'dbl', 'double' => 'double',
            'trpl', 'triple' => 'triple',
            'quad', 'quadruple' => 'quad',
            default => $normalized,
        };
    }

    private function normalizeHotelBrokerName(string $value): string
    {
        return strtolower(trim($value));
    }
}
