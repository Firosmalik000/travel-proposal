<?php

namespace App\Services;

class CurrencyConversionService
{
    /** @var array<string, array{rate_to_idr: float, source: string, fetched_at: ?string, is_live: bool}> */
    private array $resolvedRates = [];

    public function __construct(private readonly LiveCurrencyRateService $liveCurrencyRateService) {}

    public function convertToIdr(int|float $amount, ?string $currencyCode): ?int
    {
        $normalizedCurrency = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        if ($normalizedCurrency === '' || $normalizedCurrency === 'IDR') {
            return (int) round($amount);
        }

        $rate = $this->detailsFor($normalizedCurrency)['rate_to_idr'];

        if ($rate === null || $rate <= 0) {
            return null;
        }

        return (int) round($amount * $rate);
    }

    public function hasRate(?string $currencyCode): bool
    {
        $normalizedCurrency = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        if ($normalizedCurrency === '' || $normalizedCurrency === 'IDR') {
            return true;
        }

        $rate = $this->detailsFor($normalizedCurrency)['rate_to_idr'];

        return $rate !== null && $rate > 0;
    }

    public function rateFor(?string $currencyCode): ?float
    {
        $normalizedCurrency = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        if ($normalizedCurrency === '' || $normalizedCurrency === 'IDR') {
            return 1.0;
        }

        $rate = $this->detailsFor($normalizedCurrency)['rate_to_idr'];

        return $rate > 0 ? $rate : null;
    }

    /** @return array{rate_to_idr: float, source: string, fetched_at: ?string, is_live: bool} */
    public function detailsFor(?string $currencyCode): array
    {
        $code = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        return $this->resolvedRates[$code] ??= $this->liveCurrencyRateService->rateFor($code);
    }
}
