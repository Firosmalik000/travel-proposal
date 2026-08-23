<?php

namespace App\Services\HotelImport;

use Carbon\CarbonImmutable;
use Illuminate\Container\Container;
use RuntimeException;
use Throwable;

class HotelRatePdfParser
{
    /** @var array<string, string> */
    private array $cityLookup = [];

    private const CITY_ALIASES = [
        'makkah' => 'Mekkah',
        'mecca' => 'Mekkah',
        'mekkah' => 'Mekkah',
        'madina' => 'Madinah',
        'madinah' => 'Madinah',
        'medina' => 'Madinah',
    ];

    /**
     * @param  array<int, array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>>  $pages
     * @param  array<int, string>  $knownCities
     * @return array<int, array<string, mixed>>
     */
    public function parse(array $pages, ?string $defaultCountry = null, ?string $defaultCurrency = null, array $knownCities = []): array
    {
        $rows = [];
        $cityContext = null;
        $currencyContext = $defaultCurrency !== null ? strtoupper($defaultCurrency) : null;
        $this->cityLookup = self::CITY_ALIASES;
        foreach ($knownCities as $city) {
            $this->cityLookup[$this->normalize((string) $city)] = (string) $city;
        }

        foreach ($pages as $pageNumber => $words) {
            $lines = $this->groupWordsIntoLines($words);

            foreach ($lines as $lineIndex => $line) {
                $detectedCity = $this->detectCity($line['text']);
                if ($detectedCity !== null) {
                    $cityContext = $detectedCity;
                }
                $detectedCurrency = $this->detectCurrency($line['text']);
                if ($detectedCurrency !== null) {
                    $currencyContext = $detectedCurrency;
                }

                $anchors = $this->detectHeaderAnchors($line['words']);
                if ($anchors === null) {
                    continue;
                }

                $hotelName = $this->detectHotelName($lines, $lineIndex);
                if ($hotelName === null) {
                    continue;
                }

                for ($rateIndex = $lineIndex + 1; $rateIndex < count($lines); $rateIndex++) {
                    if ($this->detectHeaderAnchors($lines[$rateIndex]['words']) !== null) {
                        break;
                    }

                    $rate = $this->parseRateLine($lines[$rateIndex]['words'], $anchors);
                    if ($rate === null) {
                        continue;
                    }

                    $warnings = $rate['warnings'];
                    $warnings = array_map(
                        fn (string $warning): string => str_starts_with($warning, 'Rate ')
                            ? "{$hotelName} - periode {$rate['period_start']} sampai {$rate['period_end']}: ".lcfirst($warning).' Nilai dikosongkan.'
                            : $warning,
                        $warnings,
                    );
                    if ($cityContext === null) {
                        $warnings[] = "Kota tidak terdeteksi untuk {$hotelName} pada halaman {$pageNumber}.";
                    }
                    if ($currencyContext === null || trim($currencyContext) === '') {
                        $warnings[] = "Mata uang tidak terdeteksi untuk {$hotelName}.";
                    }

                    $rows[] = [
                        'country' => $defaultCountry,
                        'city' => $cityContext,
                        'hotel' => $hotelName,
                        'currency' => $currencyContext,
                        'period_start' => $rate['period_start'],
                        'period_end' => $rate['period_end'],
                        'dbl' => $rate['dbl'],
                        'trpl' => $rate['trpl'],
                        'quad' => $rate['quad'],
                        'source' => 'pdf',
                        'warnings' => array_values(array_unique($warnings)),
                    ];
                }
            }
        }

        if ($rows === []) {
            throw new RuntimeException('Tidak ada tabel rate hotel yang dapat dikenali dari PDF.');
        }

        return $rows;
    }

    /**
     * @param  array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>  $words
     * @return array<int, array{text: string, y: float, words: array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>}>
     */
    private function groupWordsIntoLines(array $words): array
    {
        usort($words, fn (array $left, array $right): int => [$left['y_min'], $left['x_min']] <=> [$right['y_min'], $right['x_min']]);
        $lines = [];

        foreach ($words as $word) {
            $lineIndex = array_key_last($lines);
            if ($lineIndex === null || abs($lines[$lineIndex]['y'] - $word['y_min']) > 3.5) {
                $lines[] = ['text' => '', 'y' => $word['y_min'], 'words' => [$word]];

                continue;
            }

            $lines[$lineIndex]['words'][] = $word;
        }

        foreach ($lines as &$line) {
            usort($line['words'], fn (array $left, array $right): int => $left['x_min'] <=> $right['x_min']);
            $line['text'] = implode(' ', array_column($line['words'], 'text'));
        }

        return $lines;
    }

    /**
     * @param  array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>  $words
     * @return array{start: float, end: float, dbl: ?float, trpl: ?float, quad: ?float}|null
     */
    private function detectHeaderAnchors(array $words): ?array
    {
        $anchors = ['start' => null, 'end' => null, 'dbl' => null, 'trpl' => null, 'quad' => null];

        foreach ($words as $index => $word) {
            $token = $this->normalize($word['text']);
            $next = $this->normalize($words[$index + 1]['text'] ?? '');

            if (in_array($token, ['from', 'start'], true) || ($token === 'check' && $next === 'in')) {
                $anchors['start'] = $word['x_min'];
            } elseif (in_array($token, ['to', 'end'], true) || ($token === 'check' && $next === 'out')) {
                $anchors['end'] = $word['x_min'];
            } elseif (in_array($token, ['dbl', 'double'], true)) {
                $anchors['dbl'] = $word['x_min'];
            } elseif (in_array($token, ['trpl', 'trp', 'triple'], true)) {
                $anchors['trpl'] = $word['x_min'];
            } elseif (in_array($token, ['quad', 'qd', 'quadruple'], true)) {
                $anchors['quad'] = $word['x_min'];
            }
        }

        $rateAnchorCount = collect(['dbl', 'trpl', 'quad'])->filter(fn (string $key): bool => $anchors[$key] !== null)->count();
        if ($anchors['start'] === null || $anchors['end'] === null || $rateAnchorCount === 0) {
            return null;
        }

        return $anchors;
    }

    /**
     * @param  array<int, array{text: string, y: float, words: array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>}>  $lines
     */
    private function detectHotelName(array $lines, int $headerIndex): ?string
    {
        for ($index = $headerIndex - 1; $index >= max(0, $headerIndex - 7); $index--) {
            $candidate = trim($lines[$index]['text']);
            $normalized = $this->normalize($candidate);

            if ($candidate === '' || $this->detectCity($candidate) !== null) {
                continue;
            }
            if ($this->isLikelyTableHeading($candidate)) {
                continue;
            }
            if (in_array($normalized, ['hotel', 'rates', 'hotelrates', 'roomrates', 'rate'], true)) {
                continue;
            }
            if (preg_match('/\d{1,4}[\/\-]\d{1,2}[\/\-]\d{1,4}/', $candidate) === 1) {
                continue;
            }

            return preg_replace('/\s+/', ' ', $candidate) ?: null;
        }

        return null;
    }

    private function isLikelyTableHeading(string $candidate): bool
    {
        $normalized = $this->normalize($candidate);
        $headingTokens = ['period', 'roomtype', 'mealplan', 'checkin', 'checkout'];
        $matchedTokens = collect($headingTokens)
            ->filter(fn (string $token): bool => str_contains($normalized, $token))
            ->count();

        return str_contains($normalized, 'hotel') && $matchedTokens >= 2;
    }

    /**
     * @param  array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>  $words
     * @param  array{start: float, end: float, dbl: ?float, trpl: ?float, quad: ?float}  $anchors
     * @return array{period_start: string, period_end: string, dbl: ?int, trpl: ?int, quad: ?int, warnings: array<int, string>}|null
     */
    private function parseRateLine(array $words, array $anchors): ?array
    {
        usort($words, fn (array $left, array $right): int => $left['x_min'] <=> $right['x_min']);
        $columns = ['start' => [], 'end' => [], 'dbl' => [], 'trpl' => [], 'quad' => []];
        $activeAnchors = collect($anchors)->filter(fn (?float $value): bool => $value !== null)->sort()->all();

        foreach ($words as $word) {
            $column = collect($activeAnchors)
                ->sortBy(fn (float $x): float => abs($word['x_min'] - $x))
                ->keys()
                ->first();
            if (is_string($column)) {
                $columns[$column][] = $word['text'];
            }
        }

        $periodStart = $this->normalizeDate(implode('', $columns['start']));
        $periodEnd = $this->normalizeDate(implode('', $columns['end']));
        $orderedStart = $this->normalizeDate((string) data_get($words, '0.text'));
        $orderedEnd = $this->normalizeDate((string) data_get($words, '1.text'));

        if ((bool) data_get($words, '0.layout_fallback', false) && $orderedStart !== null && $orderedEnd !== null) {
            $periodStart = $orderedStart;
            $periodEnd = $orderedEnd;
            $rateKeys = collect($anchors)
                ->only(['dbl', 'trpl', 'quad'])
                ->filter(fn (?float $value): bool => $value !== null)
                ->sort()
                ->keys()
                ->values();

            foreach ($rateKeys as $rateIndex => $rateKey) {
                $columns[$rateKey] = [(string) data_get($words, ($rateIndex + 2).'.text', '')];
            }
        }
        if ($periodStart === null || $periodEnd === null) {
            return null;
        }

        $warnings = [];
        if ($periodEnd < $periodStart) {
            $warnings[] = "Tanggal akhir {$periodEnd} sebelum tanggal mulai {$periodStart}.";
        }

        $rates = [];
        foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
            $rates[$key] = $this->normalizePrice(implode('', $columns[$key]));
            if ($rates[$key] === null) {
                $warnings[] = "Rate {$label} tidak dapat dibaca.";
            }
        }

        return [
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'dbl' => $rates['dbl'],
            'trpl' => $rates['trpl'],
            'quad' => $rates['quad'],
            'warnings' => $warnings,
        ];
    }

    private function normalizeDate(string $value): ?string
    {
        $value = trim($value);

        foreach (['!d/m/y', '!d/m/Y', '!Y-m-d'] as $format) {
            try {
                $date = CarbonImmutable::createFromFormat($format, $value);
                if ($date !== false && $date->format($format === '!d/m/y' ? 'd/m/y' : ($format === '!d/m/Y' ? 'd/m/Y' : 'Y-m-d')) === $value) {
                    return $date->format('Y-m-d');
                }
            } catch (Throwable) {
                continue;
            }
        }

        return null;
    }

    private function normalizePrice(string $value): ?int
    {
        $normalized = preg_replace('/[^\d-]/', '', trim($value));
        if ($normalized === null || $normalized === '' || preg_match('/^-?\d+$/', $normalized) !== 1) {
            return null;
        }

        $price = (int) $normalized;

        return $price >= 0 ? $price : null;
    }

    private function detectCity(string $value): ?string
    {
        $normalized = preg_replace('/rates?$/', '', $this->normalize($value)) ?? '';

        return $this->cityLookup[$normalized] ?? null;
    }

    private function detectCurrency(string $value): ?string
    {
        $supported = Container::getInstance()->bound('config')
            ? array_keys((array) config('services.currency.supported', []))
            : ['IDR', 'SAR', 'USD', 'EUR', 'MYR', 'SGD'];
        preg_match_all('/\b[A-Z]{3}\b/', strtoupper($value), $matches);

        foreach ($matches[0] ?? [] as $currency) {
            if (in_array($currency, $supported, true)) {
                return $currency;
            }
        }

        return null;
    }

    private function normalize(string $value): string
    {
        return preg_replace('/[^\pL\pN]+/u', '', mb_strtolower(trim($value))) ?? '';
    }
}
