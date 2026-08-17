<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class LiveCurrencyRateService
{
    /**
     * @param  array<int, string>  $currencyCodes
     * @return array<string, array{rate_to_idr: float, source: string, fetched_at: ?string, is_live: bool}>
     */
    public function ratesFor(array $currencyCodes): array
    {
        $codes = collect($currencyCodes)
            ->map(fn (string $code): string => strtoupper(trim($code)))
            ->filter()
            ->unique()
            ->values();
        $livePayload = $this->livePayload();

        return $codes->mapWithKeys(function (string $code) use ($livePayload): array {
            if ($code === 'IDR') {
                return [$code => $this->rateDetails(1, 'identity', $livePayload['fetched_at'] ?? null, true)];
            }

            $foreignUnitsPerIdr = data_get($livePayload, "rates.{$code}");

            if (! is_numeric($foreignUnitsPerIdr) || (float) $foreignUnitsPerIdr <= 0) {
                return [$code => $this->rateDetails(0, 'unavailable', null, false)];
            }

            return [
                $code => $this->rateDetails(
                    1 / (float) $foreignUnitsPerIdr,
                    (string) ($livePayload['source'] ?? 'live'),
                    $livePayload['fetched_at'] ?? null,
                    ($livePayload['source'] ?? 'live') === 'live',
                ),
            ];
        })->all();
    }

    /** @return array<int, array{code:string,name:string,conversion_rate:float,live_conversion_rate:float,rate_source:string,rate_fetched_at:?string,is_live:bool}> */
    public function options(): array
    {
        $currencies = collect(config('services.currency.supported', []));
        $rates = $this->ratesFor($currencies->keys()->all());

        return $currencies->map(function (string $name, string $code) use ($rates): array {
            $rate = $rates[$code] ?? $this->rateDetails(0, 'unavailable', null, false);

            return [
                'code' => $code,
                'name' => $name,
                'conversion_rate' => (float) $rate['rate_to_idr'],
                'live_conversion_rate' => (float) $rate['rate_to_idr'],
                'rate_source' => (string) $rate['source'],
                'rate_fetched_at' => $rate['fetched_at'],
                'is_live' => (bool) $rate['is_live'],
            ];
        })->values()->all();
    }

    /** @return array{rate_to_idr: float, source: string, fetched_at: ?string, is_live: bool} */
    public function rateFor(?string $currencyCode): array
    {
        $code = strtoupper(trim((string) ($currencyCode ?: 'IDR')));

        return $this->ratesFor([$code])[$code] ?? $this->rateDetails(0, 'unavailable', null, false);
    }

    /** @return array{rates: array<string, float>, fetched_at: ?string, source: string}|null */
    private function livePayload(): ?array
    {
        $currentCacheKey = 'currency.live-rates.idr';
        $lastSuccessfulCacheKey = 'currency.live-rates.idr.last-successful';

        if (! config('services.currency.live.enabled', true)) {
            return $this->cachedFallback($lastSuccessfulCacheKey);
        }

        try {
            return Cache::remember(
                $currentCacheKey,
                now()->addMinutes((int) config('services.currency.live.cache_minutes', 15)),
                function () use ($lastSuccessfulCacheKey): array {
                    $response = Http::acceptJson()
                        ->connectTimeout((int) config('services.currency.live.connect_timeout', 2))
                        ->timeout((int) config('services.currency.live.timeout', 4))
                        ->retry(2, 150, throw: false)
                        ->get((string) config('services.currency.live.endpoint'));

                    if (! $response->successful() || $response->json('result') !== 'success') {
                        throw new \RuntimeException('Live currency provider returned an invalid response.');
                    }

                    $rates = collect($response->json('rates', []))
                        ->filter(fn (mixed $rate): bool => is_numeric($rate) && (float) $rate > 0)
                        ->map(fn (mixed $rate): float => (float) $rate)
                        ->all();

                    if ($rates === []) {
                        throw new \RuntimeException('Live currency provider returned no rates.');
                    }

                    $payload = [
                        'rates' => $rates,
                        'fetched_at' => now()->toDateTimeString(),
                        'source' => 'live',
                    ];
                    Cache::forever($lastSuccessfulCacheKey, $payload);

                    return $payload;
                },
            );
        } catch (Throwable $exception) {
            Log::warning('Live currency rate unavailable; using the last successful live rate.', [
                'exception' => $exception::class,
            ]);

            return $this->cachedFallback($lastSuccessfulCacheKey);
        }
    }

    /** @return array{rates: array<string, float>, fetched_at: ?string, source: string}|null */
    private function cachedFallback(string $cacheKey): ?array
    {
        $payload = Cache::get($cacheKey);

        if (! is_array($payload) || ! is_array($payload['rates'] ?? null)) {
            return null;
        }

        return [...$payload, 'source' => 'cached_live'];
    }

    /** @return array{rate_to_idr: float, source: string, fetched_at: ?string, is_live: bool} */
    private function rateDetails(float $rate, string $source, ?string $fetchedAt, bool $isLive): array
    {
        return [
            'rate_to_idr' => $rate > 0 ? round($rate, 6) : 0.0,
            'source' => $source,
            'fetched_at' => $fetchedAt,
            'is_live' => $isLive,
        ];
    }
}
