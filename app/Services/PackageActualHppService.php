<?php

namespace App\Services;

use App\Models\TravelPackage;

class PackageActualHppService
{
    public function __construct(
        private readonly PackageCostCalculationService $costCalculationService,
        private readonly PackageHppEstimateService $hppEstimateService,
    ) {}

    /** @return array<string, mixed> */
    public function calculateForPackage(TravelPackage $package): array
    {
        $core = $this->costCalculationService->preview(
            packageId: (int) $package->id,
            departureScheduleId: null,
            calculationMode: PackageCostCalculationService::MODE_PER_PAX_MULTIPLIER,
        );
        $content = is_array($package->content) ? $package->content : [];
        $productItems = collect($core['items'] ?? [])
            ->filter(fn (array $item): bool => in_array($item['cost_type'] ?? null, ['product', 'all_in'], true))
            ->values()
            ->all();
        $operational = $this->hppEstimateService->calculateOperationalCosts(
            (array) data_get($content, 'hpp_estimate.operational_costs', []),
            (int) ($core['customer_count'] ?? 0),
            (int) ($core['hotel_total'] ?? 0),
            $productItems,
            (array) data_get($content, 'hpp_currency_snapshots', []),
        );
        $items = collect([...($core['items'] ?? []), ...$operational['items']])
            ->map(fn (array $item): array => [
                ...$item,
                'calculation_basis' => $this->calculationBasis($item),
            ])
            ->values()
            ->all();
        $grandTotal = (int) ($core['grand_total'] ?? 0) + (int) $operational['total'];
        $customerCount = (int) ($core['customer_count'] ?? 0);

        return [
            ...$core,
            'operational_total' => (int) $operational['total'],
            'tour_leader_fee' => (int) $operational['tour_leader'],
            'muthawwif_fee' => (int) $operational['muthawwif'],
            'grand_total' => $grandTotal,
            'hpp_per_customer' => $customerCount > 0 ? (int) floor($grandTotal / $customerCount) : null,
            'items' => $items,
            'warnings' => collect([...($core['warnings'] ?? []), ...$operational['warnings']])->unique()->values()->all(),
        ];
    }

    /** @param array<string, mixed> $item */
    private function calculationBasis(array $item): string
    {
        if (($item['cost_type'] ?? null) === 'hotel') {
            return 'per_room';
        }

        if (($item['cost_type'] ?? null) === 'fee') {
            $mode = (string) data_get($item, 'meta.mode');

            return $mode === 'per_pax' ? 'per_pax' : 'collective';
        }

        return match ((string) data_get($item, 'meta.calculation_basis')) {
            'fixed' => 'collective',
            default => 'per_pax',
        };
    }
}
