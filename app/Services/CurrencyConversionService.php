<?php

namespace App\Services;

use App\Models\Currency;

class CurrencyConversionService
{
    /** @var array<string, float>|null */
    private ?array $rateMap = null;

    public function convertToIdr(int|float $amount, ?string $currencyCode): ?int
    {
        $normalizedCurrency = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        if ($normalizedCurrency === '' || $normalizedCurrency === 'IDR') {
            return (int) round($amount);
        }

        $rate = $this->rateMap()[$normalizedCurrency] ?? null;

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

        $rate = $this->rateMap()[$normalizedCurrency] ?? null;

        return $rate !== null && $rate > 0;
    }

    public function rateFor(?string $currencyCode): ?float
    {
        $normalizedCurrency = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        if ($normalizedCurrency === '' || $normalizedCurrency === 'IDR') {
            return 1.0;
        }

        return $this->rateMap()[$normalizedCurrency] ?? null;
    }

    /** @return array<string, float> */
    private function rateMap(): array
    {
        if ($this->rateMap !== null) {
            return $this->rateMap;
        }

        $this->rateMap = Currency::query()
            ->where('is_active', true)
            ->get(['code', 'conversion_rate'])
            ->mapWithKeys(fn (Currency $currency): array => [
                strtoupper((string) $currency->code) => (float) $currency->conversion_rate,
            ])
            ->all();

        $this->rateMap['IDR'] = 1.0;

        return $this->rateMap;
    }
}
