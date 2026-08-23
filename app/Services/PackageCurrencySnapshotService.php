<?php

namespace App\Services;

use App\Models\TravelPackage;
use App\Models\TravelProduct;

class PackageCurrencySnapshotService
{
    public function __construct(
        private readonly LiveCurrencyRateService $liveCurrencyRateService,
    ) {}

    /**
     * @param  array<int, mixed>  $productIds
     * @param  array<int, string>  $additionalCurrencies
     * @return array<string, array{currency: string, rate_to_idr: float, source: string, fetched_at: ?string}>
     */
    public function capture(array $productIds, string $packageCurrency, array $additionalCurrencies = []): array
    {
        $productCurrencies = TravelProduct::query()
            ->includingPackageSpecific()
            ->whereIn('id', collect($productIds)->filter(fn (mixed $id): bool => is_numeric($id))->map(fn (mixed $id): int => (int) $id)->all())
            ->get(['content'])
            ->map(fn (TravelProduct $product): string => strtoupper((string) data_get($product->content, 'currency', 'IDR')));

        $currencyCodes = collect($productCurrencies->all())
            ->merge($additionalCurrencies)
            ->map(fn (string $currency): string => strtoupper(trim($currency)))
            ->push(strtoupper(trim($packageCurrency) ?: 'IDR'))
            ->push('IDR')
            ->filter()
            ->unique()
            ->values();
        $rates = $this->liveCurrencyRateService->ratesFor($currencyCodes->all());

        return $currencyCodes->mapWithKeys(function (string $currencyCode) use ($rates): array {
            $rate = $rates[$currencyCode] ?? [
                'rate_to_idr' => 0,
                'source' => 'unavailable',
                'fetched_at' => null,
            ];

            return [
                $currencyCode => [
                    'currency' => $currencyCode,
                    'rate_to_idr' => (float) $rate['rate_to_idr'],
                    'source' => (string) $rate['source'],
                    'fetched_at' => $rate['fetched_at'],
                ],
            ];
        })->all();
    }

    public function refreshPackage(TravelPackage $package): void
    {
        $content = is_array($package->content) ? $package->content : [];
        $snapshots = $this->capture(
            $package->products()->pluck('products.id')->all(),
            (string) ($package->currency ?: 'IDR'),
            $package->allInConfig ? [(string) $package->allInConfig->currency] : [],
        );
        $currencyCode = strtoupper((string) ($package->currency ?: 'IDR'));
        $currencyRate = $snapshots[$currencyCode] ?? $this->liveCurrencyRateService->rateFor($currencyCode);

        $content['hpp_currency_snapshots'] = $snapshots;
        $content['currency_rate_snapshot'] = [
            'currency' => $currencyCode,
            'rate_to_idr' => $currencyRate['rate_to_idr'],
            'source' => $currencyRate['source'],
            'fetched_at' => $currencyRate['fetched_at'],
        ];

        $package->update(['content' => $content]);
    }

    /** @return array{rate_to_idr: float, source: string, fetched_at: ?string, snapshot_scope: string} */
    public function detailsFor(TravelPackage $package, ?TravelProduct $product, string $currencyCode): array
    {
        $normalizedCurrency = strtoupper(trim($currencyCode) ?: 'IDR');
        $packageSnapshot = data_get($package->content, "hpp_currency_snapshots.{$normalizedCurrency}");

        if (is_array($packageSnapshot) && (float) data_get($packageSnapshot, 'rate_to_idr', 0) > 0) {
            return $this->normalizeDetails($packageSnapshot, 'package');
        }

        if ($normalizedCurrency === strtoupper((string) ($package->currency ?: 'IDR'))) {
            $sellingPriceSnapshot = data_get($package->content, 'currency_rate_snapshot');
            if (is_array($sellingPriceSnapshot) && (float) data_get($sellingPriceSnapshot, 'rate_to_idr', 0) > 0) {
                return $this->normalizeDetails($sellingPriceSnapshot, 'package_price_legacy');
            }
        }

        $productSnapshot = data_get($product?->content, 'currency_rate_snapshot');
        if (is_array($productSnapshot) && (float) data_get($productSnapshot, 'rate_to_idr', 0) > 0) {
            return $this->normalizeDetails($productSnapshot, 'product_legacy');
        }

        return [
            'rate_to_idr' => $normalizedCurrency === 'IDR' ? 1 : 0,
            'source' => $normalizedCurrency === 'IDR' ? 'identity' : 'unavailable',
            'fetched_at' => null,
            'snapshot_scope' => 'unavailable',
        ];
    }

    /** @param array{rate_to_idr: float, source: string, fetched_at: ?string, snapshot_scope: string} $details */
    public function convertToIdr(int|float $amount, array $details): ?int
    {
        $rate = (float) ($details['rate_to_idr'] ?? 0);

        return $rate > 0 ? (int) round($amount * $rate) : null;
    }

    /**
     * @param  array<string, mixed>  $snapshot
     * @return array{rate_to_idr: float, source: string, fetched_at: ?string, snapshot_scope: string}
     */
    private function normalizeDetails(array $snapshot, string $scope): array
    {
        return [
            'rate_to_idr' => (float) data_get($snapshot, 'rate_to_idr', 0),
            'source' => (string) data_get($snapshot, 'source', 'snapshot'),
            'fetched_at' => data_get($snapshot, 'fetched_at'),
            'snapshot_scope' => $scope,
        ];
    }
}
