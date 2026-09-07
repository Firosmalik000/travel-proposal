<?php

namespace App\Services;

use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Support\Collection;

class PackageHppEstimateService
{
    private const ROOM_CAPACITIES = ['dbl' => 2, 'trpl' => 3, 'quad' => 4];

    public function __construct(
        private readonly HotelProductPricingResolver $hotelProductPricingResolver,
        private readonly PackageProductPriceSnapshotService $productPriceSnapshotService,
    ) {}

    /** @return array<string, mixed>|null */
    public function calculateForPackage(TravelPackage $package): ?array
    {
        $content = is_array($package->content) ? $package->content : [];
        $estimate = data_get($content, 'hpp_estimate');

        if (! is_array($estimate)) {
            return null;
        }

        if (! is_array(data_get($estimate, 'customers'))) {
            $storedCustomerCount = max(0, (int) data_get($estimate, 'customer_count', 0));
            $customerCount = $storedCustomerCount > 0
                ? $storedCustomerCount
                : max(0, (int) $package->seats_total);
            $estimate['customers'] = [
                'dbl' => $customerCount,
                'trpl' => 0,
                'quad' => 0,
            ];
            $estimate['customers_is_manual'] = false;
        }

        $package->loadMissing(['products', 'allInConfig']);
        $currencyCode = strtoupper((string) ($package->currency ?: 'IDR'));
        $currencySnapshot = data_get($content, "hpp_currency_snapshots.{$currencyCode}", []);
        $allInConfig = $package->allInConfig;

        return $this->calculate(
            $estimate,
            (int) round($package->doubleSellingPrice()),
            data_get($content, 'room_prices', []),
            (float) data_get($currencySnapshot, 'rate_to_idr', $currencyCode === 'IDR' ? 1 : 0),
            $currencyCode,
            (string) data_get($currencySnapshot, 'source', $currencyCode === 'IDR' ? 'identity' : 'unavailable'),
            data_get($currencySnapshot, 'fetched_at'),
            $this->productPriceSnapshotService->apply($package->products),
            $package->products->mapWithKeys(fn (TravelProduct $product): array => [
                (string) $product->id => (int) ($product->pivot->multiplier_per_pax ?? 1),
            ])->all(),
            $package->start_date?->toDateString(),
            data_get($content, 'hotel_product_brokers', []),
            data_get($content, 'hpp_currency_snapshots', []),
            $allInConfig ? [
                'enabled' => true,
                'vendor_id' => $allInConfig->package_vendor_id,
                'period_id' => $allInConfig->vendor_price_period_id,
                'broker_package_name' => $allInConfig->broker_package_name,
                'currency' => $allInConfig->currency,
                'price_per_pax' => (float) $allInConfig->price_per_pax,
                'included_category_keys' => $allInConfig->included_category_keys ?? [],
            ] : ['enabled' => false],
        );
    }

    public function refreshForPackage(TravelPackage $package): ?array
    {
        $package->unsetRelation('products');
        $package->unsetRelation('allInConfig');
        $estimate = $this->calculateForPackage($package);

        if ($estimate === null) {
            return null;
        }

        $content = is_array($package->content) ? $package->content : [];
        $content['hpp_estimate'] = $estimate;
        $package->update(['content' => $content]);

        return $estimate;
    }

    /**
     * @param  array<string, mixed>  $estimate
     * @param  array<string, mixed>  $roomSellingPrices
     * @param  Collection<int, TravelProduct>  $products
     * @param  array<string|int, mixed>  $productMultipliers
     * @param  array<string, mixed>  $hotelBrokerSelections
     * @param  array<string, mixed>  $currencySnapshots
     * @return array<string, mixed>
     */
    public function calculate(
        array $estimate,
        int $baseSellingPrice,
        array $roomSellingPrices,
        float $currencyRateToIdr = 1,
        ?string $currencyCode = 'IDR',
        ?string $rateSource = 'identity',
        ?string $rateFetchedAt = null,
        ?Collection $products = null,
        array $productMultipliers = [],
        ?string $periodDate = null,
        array $hotelBrokerSelections = [],
        array $currencySnapshots = [],
        array $allInConfiguration = [],
    ): array {
        $customers = collect(['dbl', 'trpl', 'quad'])
            ->mapWithKeys(fn (string $roomType): array => [
                $roomType => $this->nonNegativeInteger(data_get($estimate, "customers.{$roomType}")),
            ])
            ->all();
        $customers['dbl'] += $this->nonNegativeInteger(data_get($estimate, 'customers.single'));
        $customerCount = array_sum($customers);
        $focCount = $this->nonNegativeInteger(data_get($estimate, 'operational_costs.foc.count'));
        $coveredCategoryKeys = (bool) data_get($allInConfiguration, 'enabled', false)
            ? collect(data_get($allInConfiguration, 'included_category_keys', []))
                ->filter(fn (mixed $key): bool => is_string($key))
                ->values()
            : collect();
        $selectedProducts = ($products ?? collect())
            ->reject(fn (TravelProduct $product): bool => $coveredCategoryKeys->contains($product->product_type))
            ->values();

        [$productItems, $productTotal, $productWarnings] = $this->buildProductItems(
            $selectedProducts,
            $estimate,
            $productMultipliers,
            $customerCount,
            $currencySnapshots,
        );
        [$focProductItems, $focProductTotal, $focProductWarnings] = $this->buildFocProductItems(
            $selectedProducts,
            $productMultipliers,
            $focCount,
            $currencySnapshots,
        );
        [$hotelItems, $hotelTotal, $hotelWarnings, $hotelAllocations, $paidHotelTotal, $focHotelTotal] = $this->buildHotelItems(
            $selectedProducts,
            $estimate,
            $productMultipliers,
            $customerCount,
            $focCount,
            $periodDate,
            $hotelBrokerSelections,
            $currencySnapshots,
        );
        [$allInItem, $allInTotal, $allInWarnings] = $this->buildAllInItem(
            $allInConfiguration,
            $customerCount,
            $currencySnapshots,
        );
        [$focAllInItem, $focAllInTotal, $focAllInWarnings] = $this->buildAllInItem(
            $allInConfiguration,
            $focCount,
            $currencySnapshots,
        );
        if ($focAllInItem !== null) {
            $focAllInItem['cost_type'] = 'foc';
            $focAllInItem['label'] = 'FOC - '.$focAllInItem['label'];
            $focAllInItem['meta']['foc_component'] = 'all_in';
            $focAllInItem['meta']['foc_count'] = $focCount;
        }
        if ($selectedProducts->where('product_type', '!=', 'hotel')->isEmpty()) {
            $productTotal = $this->nonNegativeInteger($estimate['product_cost_per_customer'] ?? null) * $customerCount;
            $focProductTotal = $this->nonNegativeInteger($estimate['product_cost_per_customer'] ?? null) * $focCount;
            $focProductItems = $focProductTotal > 0 ? [[
                'cost_type' => 'foc',
                'reference_id' => null,
                'label' => 'FOC - Biaya produk legacy',
                'quantity' => $focCount,
                'unit_price' => $this->nonNegativeInteger($estimate['product_cost_per_customer'] ?? null),
                'total_price' => $focProductTotal,
                'meta' => ['foc_component' => 'product'],
            ]] : [];
        }

        $productTotal += $focProductTotal + $allInTotal + $focAllInTotal;
        $productCostPerCustomer = $customerCount > 0 ? (int) floor($productTotal / $customerCount) : 0;
        if ($allInItem !== null) {
            array_unshift($productItems, $allInItem);
        }
        $paidProductItemsForOperational = $productItems;
        $productItems = [...$productItems, ...$focProductItems];
        if ($focAllInItem !== null && $focCount > 0) {
            $productItems[] = $focAllInItem;
        }

        if ($selectedProducts->where('product_type', 'hotel')->isEmpty()) {
            $hotelTotal = $this->nonNegativeInteger($estimate['hotel_total'] ?? null);
            $paidHotelTotal = $hotelTotal;
        }

        $revenueInPackageCurrency = collect($customers)
            ->map(function (int $count, string $roomType) use ($baseSellingPrice, $roomSellingPrices): int {
                $sellingPrice = $this->nonNegativeInteger($roomSellingPrices[$roomType] ?? $baseSellingPrice);

                return $count * ($sellingPrice > 0 ? $sellingPrice : $baseSellingPrice);
            })
            ->sum();
        $normalizedCurrencyCode = strtoupper((string) ($currencyCode ?: 'IDR'));
        $effectiveRate = $normalizedCurrencyCode === 'IDR' ? 1 : max($currencyRateToIdr, 0);
        $revenueTotal = (int) round($revenueInPackageCurrency * $effectiveRate);
        $hasOperationalCosts = is_array(data_get($estimate, 'operational_costs'));
        [$operationalItems, $operationalTotals, $operationalWarnings] = $hasOperationalCosts
            ? $this->buildOperationalItems(
                data_get($estimate, 'operational_costs', []),
                $customerCount,
                $paidHotelTotal,
                $paidProductItemsForOperational,
                $currencySnapshots,
            )
            : [[], ['total' => 0, 'tour_leader' => 0, 'muthawwif' => 0], []];
        $tourLeaderFeeIsManual = (bool) ($estimate['tour_leader_fee_is_manual'] ?? $this->nonNegativeInteger($estimate['tour_leader_fee'] ?? null) > 0);
        $muthawwifFeeIsManual = (bool) ($estimate['muthawwif_fee_is_manual'] ?? $this->nonNegativeInteger($estimate['muthawwif_fee'] ?? null) > 0);
        $tourLeaderFee = $hasOperationalCosts
            ? (int) $operationalTotals['tour_leader']
            : ($tourLeaderFeeIsManual
                ? $this->nonNegativeInteger($estimate['tour_leader_fee'] ?? null)
                : ($customerCount > 0 ? (int) floor($revenueTotal / $customerCount) : 0));
        $muthawwifFee = $hasOperationalCosts
            ? (int) $operationalTotals['muthawwif']
            : ($muthawwifFeeIsManual
                ? $this->nonNegativeInteger($estimate['muthawwif_fee'] ?? null)
                : ($customerCount > 0 ? (int) floor($hotelTotal / $customerCount) : 0));
        $otherCost = $this->nonNegativeInteger($estimate['other_cost'] ?? null);
        $grandTotal = $productTotal + $hotelTotal + $otherCost + ($hasOperationalCosts
            ? (int) $operationalTotals['total']
            : $tourLeaderFee + $muthawwifFee);
        $items = [
            ...$hotelItems,
            ...$productItems,
            ...($hasOperationalCosts ? $operationalItems : [
                $this->feeItem('Fee Tour Leader', $tourLeaderFee, 'tour_leader', $revenueTotal, $customerCount),
                $this->feeItem('Fee Muthawwif', $muthawwifFee, 'muthawwif', $hotelTotal, $customerCount),
            ]),
        ];

        if ($otherCost > 0) {
            $items[] = [
                'cost_type' => 'other',
                'reference_id' => null,
                'label' => 'Biaya lainnya',
                'quantity' => 1,
                'unit_price' => $otherCost,
                'total_price' => $otherCost,
                'meta' => [],
            ];
        }

        return [
            'customers' => $customers,
            'customers_is_manual' => (bool) ($estimate['customers_is_manual'] ?? $customerCount > 0),
            'product_quantities' => $this->normalizeProductQuantities($selectedProducts, $estimate, $productMultipliers, $customerCount),
            'product_quantities_is_manual' => $selectedProducts
                ->where('product_type', '!=', 'hotel')
                ->mapWithKeys(fn (TravelProduct $product): array => [
                    (string) $product->id => (bool) data_get($estimate, 'product_quantities_is_manual.'.(string) $product->id, false),
                ])->all(),
            'hotel_allocations' => $hotelAllocations,
            'hotel_allocations_unit' => 'rooms',
            'hotel_allocations_is_manual' => $selectedProducts
                ->where('product_type', 'hotel')
                ->mapWithKeys(fn (TravelProduct $product): array => [
                    (string) $product->id => (bool) data_get($estimate, 'hotel_allocations_is_manual.'.(string) $product->id, false),
                ])->all(),
            'product_cost_per_customer' => $productCostPerCustomer,
            'hotel_total' => $hotelTotal,
            'tour_leader_fee' => $tourLeaderFee,
            'tour_leader_fee_is_manual' => $tourLeaderFeeIsManual,
            'muthawwif_fee' => $muthawwifFee,
            'muthawwif_fee_is_manual' => $muthawwifFeeIsManual,
            'operational_costs' => $hasOperationalCosts ? data_get($estimate, 'operational_costs') : null,
            'operational_total' => (int) $operationalTotals['total'],
            'other_cost' => $otherCost,
            'notes' => trim((string) ($estimate['notes'] ?? '')) ?: null,
            'customer_count' => $customerCount,
            'foc_count' => $focCount,
            'foc_total' => $focHotelTotal + $focProductTotal + $focAllInTotal,
            'foc_hotel_total' => $focHotelTotal,
            'foc_product_total' => $focProductTotal,
            'foc_all_in_total' => $focAllInTotal,
            'product_total' => $productTotal,
            'revenue_total' => $revenueTotal,
            'revenue_original_total' => $revenueInPackageCurrency,
            'revenue_currency' => $normalizedCurrencyCode,
            'conversion_rate_to_idr' => $effectiveRate,
            'conversion_rate_source' => $rateSource,
            'conversion_rate_fetched_at' => $rateFetchedAt,
            'grand_total' => $grandTotal,
            'hpp_per_customer' => $customerCount > 0 ? (int) floor($grandTotal / $customerCount) : null,
            'estimated_profit' => $revenueTotal - $grandTotal,
            'items' => $items,
            'warnings' => array_values(array_unique([...$productWarnings, ...$focProductWarnings, ...$hotelWarnings, ...$allInWarnings, ...$focAllInWarnings, ...$operationalWarnings])),
            'all_in_total' => $allInTotal + $focAllInTotal,
            'calculated_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $configuration
     * @param  array<int, array<string, mixed>>  $productItems
     * @param  array<string, mixed>  $currencySnapshots
     * @return array{0: array<int, array<string, mixed>>, 1: array{total: int, tour_leader: int, muthawwif: int}, 2: array<int, string>}
     */
    private function buildOperationalItems(
        array $configuration,
        int $customerCount,
        int $hotelTotal,
        array $productItems,
        array $currencySnapshots,
    ): array {
        $items = [];
        $warnings = [];
        $totals = [];
        $hotelPerCustomer = $customerCount > 0 ? $hotelTotal / $customerCount : 0;
        $ticketAndVisaTotal = collect($productItems)
            ->filter(function (array $item): bool {
                $productType = strtolower((string) data_get($item, 'meta.product_type'));
                $label = strtolower((string) ($item['label'] ?? ''));

                return $productType === 'tiket' || str_contains($label, 'visa');
            })
            ->sum(fn (array $item): int => (int) ($item['total_price'] ?? 0));
        $ticketAndVisaPerCustomer = $customerCount > 0 ? $ticketAndVisaTotal / $customerCount : 0;

        foreach ((array) data_get($configuration, 'human_resources', []) as $humanResource) {
            if (! is_array($humanResource)) {
                continue;
            }

            $amount = $this->nonNegativeInteger($humanResource['salary'] ?? null);
            $name = trim((string) ($humanResource['name'] ?? '')) ?: 'SDM';
            $this->appendOperationalItem($items, "SDM - {$name}", $amount, 'human_resource');
            $totals['human_resources'] = ($totals['human_resources'] ?? 0) + $amount;
        }

        $overheadAmount = $this->nonNegativeInteger(data_get($configuration, 'overhead.amount'));
        $overheadMode = data_get($configuration, 'overhead.mode') === 'per_pax' ? 'per_pax' : 'total';
        $overheadTotal = $overheadMode === 'per_pax' ? $overheadAmount * $customerCount : $overheadAmount;
        $this->appendOperationalItem($items, 'Overhead', $overheadTotal, 'overhead', [
            'mode' => $overheadMode,
            'amount' => $overheadAmount,
            'customer_count' => $customerCount,
        ]);
        $totals['overhead'] = $overheadTotal;

        $photographerCount = $this->nonNegativeInteger(data_get($configuration, 'photographer.count'));
        $photographerCurrency = strtoupper((string) data_get($configuration, 'photographer.currency', 'IDR'));
        [$photographerDailySalary, $photographerCurrencyMeta] = $this->convertToIdr(
            data_get($configuration, 'photographer.daily_salary'),
            $photographerCurrency,
            $currencySnapshots,
        );
        if ($photographerDailySalary === null && $this->nonNegativeInteger(data_get($configuration, 'photographer.daily_salary')) > 0) {
            $warnings[] = sprintf('Kurs %s untuk gaji Fotografer belum tersedia.', $photographerCurrency);
        }
        $photographerDays = $this->nonNegativeInteger(data_get($configuration, 'photographer.days'));
        $photographerTotal = $photographerCount * ($photographerDailySalary ?? 0) * $photographerDays;
        $this->appendOperationalItem($items, 'Fotografer', $photographerTotal, 'photographer', [
            'count' => $photographerCount,
            'daily_salary' => $this->nonNegativeInteger(data_get($configuration, 'photographer.daily_salary')),
            'days' => $photographerDays,
            ...$photographerCurrencyMeta,
        ]);
        $totals['photographer'] = $photographerTotal;

        $tourLeaderCount = $this->nonNegativeInteger(data_get($configuration, 'tour_leader.count'));
        $tourLeaderCurrency = strtoupper((string) data_get($configuration, 'tour_leader.currency', 'IDR'));
        [$tourLeaderSalary, $tourLeaderCurrencyMeta] = $this->convertToIdr(
            data_get($configuration, 'tour_leader.salary_per_trip'),
            $tourLeaderCurrency,
            $currencySnapshots,
        );
        if ($tourLeaderSalary === null && $this->nonNegativeInteger(data_get($configuration, 'tour_leader.salary_per_trip')) > 0) {
            $warnings[] = sprintf('Kurs %s untuk gaji Tour Leader belum tersedia.', $tourLeaderCurrency);
        }
        $tourLeaderSupport = ((bool) data_get($configuration, 'tour_leader.include_hotel', true) ? $hotelPerCustomer : 0)
            + ((bool) data_get($configuration, 'tour_leader.include_ticket_and_visa', true) ? $ticketAndVisaPerCustomer : 0);
        $tourLeaderTotal = (int) round($tourLeaderCount * (($tourLeaderSalary ?? 0) + $tourLeaderSupport));
        $this->appendOperationalItem($items, 'Tour Leader', $tourLeaderTotal, 'tour_leader', [
            'count' => $tourLeaderCount,
            'salary_per_trip' => $this->nonNegativeInteger(data_get($configuration, 'tour_leader.salary_per_trip')),
            'hotel_per_person' => (int) round($hotelPerCustomer),
            'ticket_and_visa_per_person' => (int) round($ticketAndVisaPerCustomer),
            ...$tourLeaderCurrencyMeta,
        ]);
        $totals['tour_leader'] = $tourLeaderTotal;

        $muthawwifCurrency = strtoupper((string) data_get($configuration, 'muthawwif.currency', 'SAR'));
        [$muthawwifDailySalary, $muthawwifCurrencyMeta] = $this->convertToIdr(
            data_get($configuration, 'muthawwif.daily_salary'),
            $muthawwifCurrency,
            $currencySnapshots,
        );
        if ($muthawwifDailySalary === null && $this->nonNegativeInteger(data_get($configuration, 'muthawwif.daily_salary')) > 0) {
            $warnings[] = sprintf('Kurs %s untuk gaji Muthawwif belum tersedia.', $muthawwifCurrency);
        }
        $muthawwifCount = $this->nonNegativeInteger(data_get($configuration, 'muthawwif.count'));
        $muthawwifDays = $this->nonNegativeInteger(data_get($configuration, 'muthawwif.days'));
        $muthawwifHotel = (bool) data_get($configuration, 'muthawwif.include_hotel', true) ? $hotelPerCustomer : 0;
        $muthawwifTotal = (int) round($muthawwifCount * (($muthawwifDailySalary ?? 0) * $muthawwifDays + $muthawwifHotel));
        $this->appendOperationalItem($items, 'Muthawwif', $muthawwifTotal, 'muthawwif', [
            'count' => $muthawwifCount,
            'days' => $muthawwifDays,
            'hotel_per_person' => (int) round($muthawwifHotel),
            ...$muthawwifCurrencyMeta,
        ]);
        $totals['muthawwif'] = $muthawwifTotal;

        $marketingTotal = $this->nonNegativeInteger(data_get($configuration, 'marketing.amount_per_pax'));
        $this->appendOperationalItem($items, 'Biaya Marketing', $marketingTotal, 'marketing', [
            'amount_total' => $marketingTotal,
            'customer_count' => $customerCount,
        ]);
        $totals['marketing'] = $marketingTotal;

        foreach (['guide_tips' => 'Tips Guide', 'driver_tips' => 'Tips Sopir'] as $key => $label) {
            foreach ((array) data_get($configuration, $key, []) as $tip) {
                if (! is_array($tip)) {
                    continue;
                }

                $currency = strtoupper((string) ($tip['currency'] ?? ($key === 'guide_tips' ? 'USD' : 'IDR')));
                $sourceAmount = $key === 'guide_tips' ? ($tip['amount_per_day'] ?? 0) : ($tip['amount'] ?? 0);
                [$amount, $currencyMeta] = $this->convertToIdr($sourceAmount, $currency, $currencySnapshots);
                if ($amount === null && $this->nonNegativeInteger($sourceAmount) > 0) {
                    $warnings[] = sprintf('Kurs %s untuk %s belum tersedia.', $currency, strtolower($label));
                }
                $days = $key === 'guide_tips' ? $this->nonNegativeInteger($tip['days'] ?? null) : 1;
                $modeMultiplier = $key === 'guide_tips' && ($tip['mode'] ?? 'per_pax') === 'per_pax' ? $customerCount : 1;
                $total = ($amount ?? 0) * $days * $modeMultiplier;
                $country = trim((string) ($tip['country'] ?? ''));
                $this->appendOperationalItem($items, trim("{$label} {$country}"), $total, $key, [
                    'days' => $days,
                    'mode' => $tip['mode'] ?? 'total',
                    ...$currencyMeta,
                ]);
                $totals[$key] = ($totals[$key] ?? 0) + $total;
            }
        }

        $total = array_sum($totals);

        return [$items, [
            'total' => $total,
            'tour_leader' => $tourLeaderTotal,
            'muthawwif' => $muthawwifTotal,
        ], $warnings];
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<string, mixed>  $meta
     */
    private function appendOperationalItem(array &$items, string $label, int $amount, string $feeType, array $meta = []): void
    {
        if ($amount <= 0) {
            return;
        }

        $items[] = [
            'cost_type' => 'fee',
            'reference_id' => null,
            'label' => $label,
            'quantity' => 1,
            'unit_price' => $amount,
            'total_price' => $amount,
            'meta' => ['fee_type' => $feeType, ...$meta],
        ];
    }

    /**
     * @param  array<string, mixed>  $configuration
     * @param  array<string, mixed>  $currencySnapshots
     * @return array{0: ?array<string, mixed>, 1: int, 2: array<int, string>}
     */
    private function buildAllInItem(array $configuration, int $customerCount, array $currencySnapshots): array
    {
        if (! (bool) data_get($configuration, 'enabled', false)) {
            return [null, 0, []];
        }

        $currency = strtoupper((string) data_get($configuration, 'currency', 'IDR'));
        $originalPrice = (float) data_get($configuration, 'price_per_pax', 0);
        [$unitPrice, $currencyMeta] = $this->convertToIdr($originalPrice, $currency, $currencySnapshots);
        $warnings = [];

        if ($unitPrice === null) {
            $warnings[] = sprintf('Kurs %s untuk Paket All In vendor belum tersedia.', $currency);
            $unitPrice = 0;
        }

        $total = $unitPrice * $customerCount;
        $vendorName = trim((string) data_get($configuration, 'vendor_name_snapshot', data_get($configuration, 'vendor_name', 'Vendor')));
        $brokerPackageName = trim((string) data_get($configuration, 'broker_package_name', 'Paket All In'));

        return [[
            'cost_type' => 'all_in',
            'reference_id' => data_get($configuration, 'vendor_id'),
            'label' => sprintf('All In %s - %s', $vendorName ?: 'Vendor', $brokerPackageName ?: 'Paket'),
            'quantity' => $customerCount,
            'unit_price' => $unitPrice,
            'total_price' => $total,
            'meta' => [
                'vendor_id' => data_get($configuration, 'vendor_id'),
                'period_id' => data_get($configuration, 'period_id'),
                'period_label' => data_get($configuration, 'period_label_snapshot'),
                'included_category_keys' => implode(', ', (array) data_get($configuration, 'included_category_keys', [])),
                ...$currencyMeta,
            ],
        ], $total, $warnings];
    }

    /**
     * @param  Collection<int, TravelProduct>  $products
     * @param  array<string, mixed>  $estimate
     * @param  array<string|int, mixed>  $productMultipliers
     * @param  array<string, mixed>  $currencySnapshots
     * @return array{array<int, array<string, mixed>>, int, array<int, string>}
     */
    private function buildProductItems(
        Collection $products,
        array $estimate,
        array $productMultipliers,
        int $customerCount,
        array $currencySnapshots,
    ): array {
        $items = [];
        $total = 0;
        $warnings = [];

        foreach ($products->where('product_type', '!=', 'hotel') as $product) {
            $quantity = $this->productQuantity($product, $estimate, $productMultipliers, $customerCount);
            [$unitPrice, $currencyMeta] = $this->convertToIdr(
                data_get($product->content, 'price'),
                (string) data_get($product->content, 'currency', 'IDR'),
                $currencySnapshots,
            );

            if ($unitPrice === null) {
                $warnings[] = sprintf('Kurs atau harga product belum lengkap: %s', $this->productName($product));
                $unitPrice = 0;
            }

            $itemTotal = $quantity * $unitPrice;
            $total += $itemTotal;
            $items[] = [
                'cost_type' => 'product',
                'reference_id' => $product->id,
                'label' => $this->productName($product),
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $itemTotal,
                'meta' => [
                    'product_code' => $product->code,
                    'product_type' => $product->product_type,
                    ...$currencyMeta,
                ],
            ];
        }

        return [$items, $total, $warnings];
    }

    /**
     * @param  Collection<int, TravelProduct>  $products
     * @param  array<string|int, mixed>  $productMultipliers
     * @param  array<string, mixed>  $currencySnapshots
     * @return array{array<int, array<string, mixed>>, int, array<int, string>}
     */
    private function buildFocProductItems(
        Collection $products,
        array $productMultipliers,
        int $focCount,
        array $currencySnapshots,
    ): array {
        if ($focCount < 1) {
            return [[], 0, []];
        }

        $items = [];
        $total = 0;
        $warnings = [];

        foreach ($products->where('product_type', '!=', 'hotel') as $product) {
            $multiplier = max(1, $this->nonNegativeInteger($productMultipliers[(string) $product->id] ?? 1));
            $quantity = $focCount * $multiplier;
            [$unitPrice, $currencyMeta] = $this->convertToIdr(
                data_get($product->content, 'price'),
                (string) data_get($product->content, 'currency', 'IDR'),
                $currencySnapshots,
            );

            if ($unitPrice === null) {
                $warnings[] = sprintf('Kurs atau harga product FOC belum lengkap: %s', $this->productName($product));
                $unitPrice = 0;
            }

            $itemTotal = $quantity * $unitPrice;
            $total += $itemTotal;
            $items[] = [
                'cost_type' => 'foc',
                'reference_id' => $product->id,
                'label' => sprintf('FOC - %s', $this->productName($product)),
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $itemTotal,
                'meta' => [
                    'foc_component' => 'product',
                    'foc_count' => $focCount,
                    'product_code' => $product->code,
                    'product_type' => $product->product_type,
                    'multiplier_per_pax' => $multiplier,
                    ...$currencyMeta,
                ],
            ];
        }

        return [$items, $total, $warnings];
    }

    /**
     * @param  Collection<int, TravelProduct>  $products
     * @param  array<string, mixed>  $estimate
     * @param  array<string|int, mixed>  $productMultipliers
     * @param  array<string, mixed>  $hotelBrokerSelections
     * @param  array<string, mixed>  $currencySnapshots
     * @return array{array<int, array<string, mixed>>, int, array<int, string>, array<string, array<string, int>>, int, int}
     */
    private function buildHotelItems(
        Collection $products,
        array $estimate,
        array $productMultipliers,
        int $customerCount,
        int $focCount,
        ?string $periodDate,
        array $hotelBrokerSelections,
        array $currencySnapshots,
    ): array {
        $items = [];
        $total = 0;
        $paidTotal = 0;
        $focTotal = 0;
        $warnings = [];
        $resolvedAllocations = [];

        foreach ($products->where('product_type', 'hotel') as $product) {
            $selectedBroker = data_get($hotelBrokerSelections, (string) $product->id);
            $prices = collect(array_keys(self::ROOM_CAPACITIES))->mapWithKeys(function (string $roomType) use (
                $product,
                $selectedBroker,
                $periodDate,
                $currencySnapshots,
            ): array {
                $pricing = $this->matchHotelPrice($product, $roomType, is_string($selectedBroker) ? $selectedBroker : null, $periodDate);
                [$price, $currencyMeta] = $this->convertToIdr(
                    data_get($pricing, 'price'),
                    (string) data_get($product->content, 'currency', 'IDR'),
                    $currencySnapshots,
                );

                return [$roomType => ['pricing' => $pricing, 'price' => $price, 'currency_meta' => $currencyMeta]];
            });
            $paidAllocations = $this->resolveHotelAllocations($product, $estimate, $prices, $customerCount);
            $allocations = $this->addFocToHotelAllocation($paidAllocations, $prices, $customerCount, $focCount);
            $resolvedAllocations[(string) $product->id] = $allocations;
            $allocatedCapacity = collect(array_keys(self::ROOM_CAPACITIES))
                ->sum(fn (string $roomType): int => ($allocations[$roomType] ?? 0) * self::ROOM_CAPACITIES[$roomType]);
            $targetOccupants = $customerCount + $focCount;
            if ($targetOccupants > 0 && $allocatedCapacity < $targetOccupants) {
                $warnings[] = sprintf(
                    'Kapasitas hotel %s hanya %d dari target %d orang termasuk FOC.',
                    $this->productName($product),
                    $allocatedCapacity,
                    $targetOccupants,
                );
            }
            $multiplier = max(1, $this->nonNegativeInteger($productMultipliers[(string) $product->id] ?? 1));

            foreach ($paidAllocations as $roomType => $roomCount) {
                if ($roomCount < 1) {
                    continue;
                }

                $pricePayload = $prices->get($roomType);
                $unitPrice = data_get($pricePayload, 'price');
                if (! is_int($unitPrice)) {
                    $warnings[] = sprintf(
                        'Harga hotel belum tersedia untuk %s (%s) pada periode package.',
                        $this->productName($product),
                        strtoupper($roomType),
                    );
                    $unitPrice = 0;
                }

                $quantity = $roomCount * $multiplier;
                $itemTotal = $quantity * $unitPrice;
                $total += $itemTotal;
                $paidTotal += $itemTotal;
                $pricing = data_get($pricePayload, 'pricing', []);
                $items[] = [
                    'cost_type' => 'hotel',
                    'reference_id' => $product->id,
                    'label' => sprintf('%s - %s', $this->productName($product), strtoupper($roomType)),
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                    'meta' => [
                        'product_code' => $product->code,
                        'product_type' => $product->product_type,
                        'room_type' => $roomType,
                        'allocated_pax' => $roomCount * self::ROOM_CAPACITIES[$roomType],
                        'room_count' => $roomCount,
                        'room_capacity' => self::ROOM_CAPACITIES[$roomType],
                        'multiplier_per_pax' => $multiplier,
                        'broker_name' => data_get($pricing, 'broker_name'),
                        'period_start' => data_get($pricing, 'period_start'),
                        'period_end' => data_get($pricing, 'period_end'),
                        ...((array) data_get($pricePayload, 'currency_meta', [])),
                    ],
                ];
            }

            $finalHotelTotal = collect($allocations)->reduce(function (int $total, int $roomCount, string $roomType) use ($prices, $multiplier): int {
                $unitPrice = data_get($prices->get($roomType), 'price');

                return $total + $roomCount * $multiplier * (is_int($unitPrice) ? $unitPrice : 0);
            }, 0);
            $paidHotelTotal = collect($paidAllocations)->reduce(function (int $total, int $roomCount, string $roomType) use ($prices, $multiplier): int {
                $unitPrice = data_get($prices->get($roomType), 'price');

                return $total + $roomCount * $multiplier * (is_int($unitPrice) ? $unitPrice : 0);
            }, 0);
            $focHotelTotal = max(0, $finalHotelTotal - $paidHotelTotal);

            if ($focCount > 0 && $focHotelTotal > 0) {
                $total += $focHotelTotal;
                $focTotal += $focHotelTotal;
                $items[] = [
                    'cost_type' => 'foc',
                    'reference_id' => $product->id,
                    'label' => sprintf('FOC - %s (Hotel Quad)', $this->productName($product)),
                    'quantity' => $focCount,
                    'unit_price' => (int) floor($focHotelTotal / $focCount),
                    'total_price' => $focHotelTotal,
                    'meta' => [
                        'foc_component' => 'hotel',
                        'foc_count' => $focCount,
                        'room_type' => 'quad',
                        'paid_room_count' => array_sum($paidAllocations),
                        'total_room_count' => array_sum($allocations),
                        'multiplier_per_pax' => $multiplier,
                    ],
                ];
            }
        }

        return [$items, $total, $warnings, $resolvedAllocations, $paidTotal, $focTotal];
    }

    /** @return array{0: ?int, 1: array<string, mixed>} */
    private function convertToIdr(mixed $price, string $currency, array $currencySnapshots): array
    {
        $normalizedCurrency = strtoupper($currency ?: 'IDR');
        $rate = $normalizedCurrency === 'IDR'
            ? 1.0
            : (float) data_get($currencySnapshots, "{$normalizedCurrency}.rate_to_idr", 0);
        $numericPrice = is_numeric($price) ? (float) $price : 0;
        $convertedPrice = $numericPrice > 0 && $rate > 0 ? (int) round($numericPrice * $rate) : null;

        return [$convertedPrice, [
            'original_currency' => $normalizedCurrency,
            'original_unit_price' => $numericPrice,
            'conversion_rate_to_idr' => $rate,
            'conversion_rate_source' => $normalizedCurrency === 'IDR'
                ? 'identity'
                : data_get($currencySnapshots, "{$normalizedCurrency}.source", 'unavailable'),
            'conversion_rate_fetched_at' => data_get($currencySnapshots, "{$normalizedCurrency}.fetched_at"),
        ]];
    }

    /** @return array<string, mixed>|null */
    private function matchHotelPrice(TravelProduct $product, string $roomType, ?string $selectedBroker, ?string $periodDate): ?array
    {
        return $this->hotelProductPricingResolver->resolve(
            data_get($product->content, 'pricing', []),
            $roomType,
            $selectedBroker,
            $periodDate,
        );
    }

    /**
     * @param  Collection<string, array<string, mixed>>  $prices
     * @return array<string, int>
     */
    private function resolveHotelAllocations(TravelProduct $product, array $estimate, Collection $prices, int $customerCount): array
    {
        $submitted = data_get($estimate, 'hotel_allocations.'.(string) $product->id);
        $isManual = (bool) data_get($estimate, 'hotel_allocations_is_manual.'.(string) $product->id, false);
        if ($isManual && is_array($submitted)) {
            $usesRoomCounts = data_get($estimate, 'hotel_allocations_unit') === 'rooms';

            return collect(array_keys(self::ROOM_CAPACITIES))
                ->mapWithKeys(fn (string $roomType): array => [
                    $roomType => $usesRoomCounts
                        ? $this->nonNegativeInteger($submitted[$roomType] ?? null)
                        : (int) ceil($this->nonNegativeInteger($submitted[$roomType] ?? null) / self::ROOM_CAPACITIES[$roomType]),
                ])
                ->all();
        }

        return $this->quadFirstRoomAllocation($prices, $customerCount);
    }

    /**
     * @param  array<string, int>  $paidAllocations
     * @param  Collection<string, array<string, mixed>>  $prices
     * @return array<string, int>
     */
    private function addFocToHotelAllocation(
        array $paidAllocations,
        Collection $prices,
        int $customerCount,
        int $focCount,
    ): array {
        if ($focCount < 1) {
            return $paidAllocations;
        }

        $allocatedCapacity = collect($paidAllocations)
            ->reduce(fn (int $capacity, int $roomCount, string $roomType): int => $capacity + $roomCount * (self::ROOM_CAPACITIES[$roomType] ?? 0), 0);
        $spareCapacity = max(0, $allocatedCapacity - $customerCount);
        $uncoveredFocCount = max(0, $focCount - $spareCapacity);
        $focAllocations = $this->focRoomAllocation($prices, $uncoveredFocCount);

        return collect(array_keys(self::ROOM_CAPACITIES))
            ->mapWithKeys(fn (string $roomType): array => [
                $roomType => ($paidAllocations[$roomType] ?? 0) + ($focAllocations[$roomType] ?? 0),
            ])
            ->all();
    }

    /**
     * @param  Collection<string, array<string, mixed>>  $prices
     * @return array{dbl: int, trpl: int, quad: int}
     */
    private function focRoomAllocation(Collection $prices, int $focCount): array
    {
        $allocations = ['dbl' => 0, 'trpl' => 0, 'quad' => 0];
        if ($focCount < 1) {
            return $allocations;
        }

        foreach (['quad', 'trpl', 'dbl'] as $roomType) {
            if (! is_int(data_get($prices->get($roomType), 'price'))) {
                continue;
            }

            $allocations[$roomType] = (int) ceil($focCount / self::ROOM_CAPACITIES[$roomType]);

            return $allocations;
        }

        return $allocations;
    }

    /**
     * @param  Collection<string, array<string, mixed>>  $prices
     * @return array{dbl: int, trpl: int, quad: int}
     */
    private function quadFirstRoomAllocation(Collection $prices, int $customerCount): array
    {
        $allocations = ['dbl' => 0, 'trpl' => 0, 'quad' => 0];
        if ($customerCount < 1) {
            return $allocations;
        }

        $hasPrice = fn (string $roomType): bool => is_int(data_get($prices->get($roomType), 'price'));
        if ($hasPrice('quad')) {
            $allocations['quad'] = intdiv($customerCount, self::ROOM_CAPACITIES['quad']);
            $remainingPax = $customerCount % self::ROOM_CAPACITIES['quad'];

            if ($remainingPax === 3 && $hasPrice('trpl')) {
                $allocations['trpl'] = 1;
            } elseif ($remainingPax === 2 && $hasPrice('dbl')) {
                $allocations['dbl'] = 1;
            } elseif ($remainingPax === 1 && $hasPrice('dbl')) {
                $allocations['dbl'] = 1;
            } elseif ($remainingPax === 1 && $hasPrice('trpl')) {
                $allocations['trpl'] = 1;
            } elseif ($remainingPax > 0) {
                $allocations['quad']++;
            }

            return $allocations;
        }

        foreach (['trpl', 'dbl'] as $roomType) {
            if (! $hasPrice($roomType)) {
                continue;
            }

            $allocations[$roomType] = (int) ceil($customerCount / self::ROOM_CAPACITIES[$roomType]);

            return $allocations;
        }

        return $allocations;
    }

    /**
     * @param  Collection<int, TravelProduct>  $products
     * @param  array<string|int, mixed>  $productMultipliers
     * @return array<string, int>
     */
    private function normalizeProductQuantities(Collection $products, array $estimate, array $productMultipliers, int $customerCount): array
    {
        return $products
            ->where('product_type', '!=', 'hotel')
            ->mapWithKeys(fn (TravelProduct $product): array => [
                (string) $product->id => $this->productQuantity($product, $estimate, $productMultipliers, $customerCount),
            ])
            ->all();
    }

    /** @param  array<string|int, mixed>  $productMultipliers */
    private function productQuantity(TravelProduct $product, array $estimate, array $productMultipliers, int $customerCount): int
    {
        $submittedQuantity = data_get($estimate, 'product_quantities.'.(string) $product->id);
        $isManual = (bool) data_get($estimate, 'product_quantities_is_manual.'.(string) $product->id, false);
        if ($isManual && is_numeric($submittedQuantity)) {
            return $this->nonNegativeInteger($submittedQuantity);
        }

        $multiplier = max(1, $this->nonNegativeInteger($productMultipliers[(string) $product->id] ?? 1));

        return $customerCount * $multiplier;
    }

    /** @return array<string, mixed> */
    private function feeItem(string $label, int $amount, string $feeType, int $formulaBase, int $customerCount): array
    {
        return [
            'cost_type' => 'fee',
            'reference_id' => null,
            'label' => $label,
            'quantity' => 1,
            'unit_price' => $amount,
            'total_price' => $amount,
            'meta' => [
                'fee_type' => $feeType,
                'formula_base' => $formulaBase,
                'customer_count' => $customerCount,
            ],
        ];
    }

    private function normalizeRoomType(string $value): string
    {
        return match (strtolower(trim($value))) {
            'dbl', 'double' => 'dbl',
            'trpl', 'triple' => 'trpl',
            'quad', 'quadruple' => 'quad',
            default => strtolower(trim($value)),
        };
    }

    private function productName(TravelProduct $product): string
    {
        return is_string($product->name) ? $product->name : (string) ($product->code ?? '-');
    }

    private function nonNegativeInteger(mixed $value): int
    {
        return is_numeric($value) ? max(0, (int) round((float) $value)) : 0;
    }
}
