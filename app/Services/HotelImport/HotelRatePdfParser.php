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
        $parsedTablePage = false;
        $this->cityLookup = self::CITY_ALIASES;
        foreach ($knownCities as $city) {
            $this->cityLookup[$this->normalize((string) $city)] = (string) $city;
        }

        if ($currencyContext === null) {
            foreach ($pages as $words) {
                $currencyContext = $this->detectCurrency(implode(' ', array_column($words, 'text')));
                if ($currencyContext !== null) {
                    break;
                }
            }
        }

        foreach ($pages as $pageNumber => $words) {
            $lines = $this->groupWordsIntoLines($words);

            foreach ($lines as $line) {
                $detectedCity = $this->detectCity($line['text']);
                if ($detectedCity !== null) {
                    $cityContext = $detectedCity;
                }
            }

            if ((bool) data_get($words, '0.layout_fallback', false)) {
                $fallbackRows = $this->parseLayoutFallbackPage(
                    $lines,
                    (int) $pageNumber,
                    $defaultCountry,
                    $currencyContext,
                    $cityContext,
                );

                if ($fallbackRows !== []) {
                    array_push($rows, ...$fallbackRows);
                    $parsedTablePage = true;
                } elseif ($parsedTablePage && count($words) <= 10) {
                    // A sparse separator page usually starts a new city section.
                    $cityContext = null;
                }

                continue;
            }

            foreach ($lines as $lineIndex => $line) {
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
            throw new RuntimeException('Tidak ada tabel rate hotel yang dapat dikenali dari PDF. Pastikan PDF berisi tabel dengan kolom: periode (From-To), DBL, TRPL, QUAD, dan data hotel name.');
        }

        return $rows;
    }

    /**
     * The old Xpdf fallback reconstructs rows from character positions. Hotel names and
     * prices can land on adjacent rows, so each table block is parsed as ordered columns.
     *
     * @param  array<int, array{text: string, y: float, words: array<int, array<string, mixed>>}>  $lines
     * @return array<int, array<string, mixed>>
     */
    private function parseLayoutFallbackPage(
        array $lines,
        int $pageNumber,
        ?string $defaultCountry,
        ?string $currency,
        ?string $city,
    ): array {
        $headers = [];
        foreach ($lines as $lineIndex => $line) {
            $anchors = $this->detectFallbackHeaderAnchors($lines, $lineIndex);
            if ($anchors !== null) {
                $headers[$lineIndex] = $anchors;
            }
        }

        if ($headers === []) {
            return [];
        }

        $rows = [];
        $headerIndexes = array_keys($headers);
        foreach ($headerIndexes as $headerOffset => $headerIndex) {
            $anchors = $headers[$headerIndex];
            $endIndex = $headerIndexes[$headerOffset + 1] ?? count($lines);
            $blockLines = array_slice($lines, $headerIndex + 1, $endIndex - $headerIndex - 1);
            $hotelName = $this->detectFallbackHotelName($blockLines, $anchors['start'])
                ?? $this->detectHotelName($lines, $headerIndex);
            if ($hotelName === null) {
                continue;
            }

            $periods = [];
            $inlinePeriodRates = [];
            $columnRates = ['dbl' => [], 'trpl' => [], 'quad' => []];
            foreach ($blockLines as $line) {
                $dates = [];
                $numericValues = [];
                foreach ($line['words'] as $word) {
                    $date = $this->normalizeDate((string) $word['text']);
                    if ($date !== null) {
                        $dates[] = $date;
                    } elseif (preg_match('/^\d[\d.,]*$/', trim((string) $word['text'])) === 1) {
                        $price = $this->normalizePrice((string) $word['text']);
                        if ($price !== null) {
                            $numericValues[] = $price;
                        }
                    }
                }
                if (count($dates) >= 2) {
                    $periods[] = ['start' => $dates[0], 'end' => $dates[1]];
                    $rateKeys = collect($anchors)
                        ->only(['dbl', 'trpl', 'quad'])
                        ->filter(fn (?float $value): bool => $value !== null)
                        ->sort()
                        ->keys()
                        ->values()
                        ->all();
                    if (count($numericValues) === count($rateKeys)) {
                        $inlinePeriodRates[] = array_combine($rateKeys, $numericValues) ?: [];
                    } else {
                        $inlinePeriodRates[] = [];
                    }
                }

                foreach ($line['words'] as $word) {
                    $text = trim((string) $word['text']);
                    if ($this->normalizeDate($text) !== null || preg_match('/^\d[\d.,]*$/', $text) !== 1) {
                        continue;
                    }

                    $column = $this->fallbackRateColumn((float) $word['x_min'], $anchors);
                    $price = $this->normalizePrice($text);
                    if ($column !== null && $price !== null) {
                        $columnRates[$column][] = $price;
                    }
                }
            }

            foreach ($columnRates as $key => $rates) {
                $columnRates[$key] = $this->rejectFallbackRateOutliers($rates);
            }

            foreach ($periods as $periodIndex => $period) {
                $warnings = [];
                $rates = [];
                foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
                    $hasInlineRate = array_key_exists($key, $inlinePeriodRates[$periodIndex] ?? []);
                    $columnRateWasRejected = array_key_exists($periodIndex, $columnRates[$key])
                        && $columnRates[$key][$periodIndex] === null;
                    $rates[$key] = $hasInlineRate && ! $columnRateWasRejected
                        ? $inlinePeriodRates[$periodIndex][$key]
                        : ($columnRates[$key][$periodIndex] ?? null);
                    if ($rates[$key] === null) {
                        $warnings[] = "{$hotelName} - periode {$period['start']} sampai {$period['end']}: rate {$label} tidak dapat dibaca. Nilai dikosongkan.";
                    }
                }
                if ($period['end'] < $period['start']) {
                    $warnings[] = "Tanggal akhir {$period['end']} sebelum tanggal mulai {$period['start']}.";
                }
                if ($city === null) {
                    $warnings[] = "Kota tidak terdeteksi untuk {$hotelName} pada halaman {$pageNumber}.";
                }
                if ($currency === null || trim($currency) === '') {
                    $warnings[] = "Mata uang tidak terdeteksi untuk {$hotelName}.";
                }

                $rows[] = [
                    'country' => $defaultCountry,
                    'city' => $city,
                    'hotel' => $hotelName,
                    'currency' => $currency,
                    'period_start' => $period['start'],
                    'period_end' => $period['end'],
                    'dbl' => $rates['dbl'],
                    'trpl' => $rates['trpl'],
                    'quad' => $rates['quad'],
                    'source' => 'pdf',
                    'warnings' => array_values(array_unique($warnings)),
                ];
            }
        }

        return $rows;
    }

    /**
     * @param  array<int, array{text: string, y: float, words: array<int, array<string, mixed>>}>  $lines
     * @return array{start: float, end: float, dbl: ?float, trpl: ?float, quad: ?float}|null
     */
    private function detectFallbackHeaderAnchors(array $lines, int $lineIndex): ?array
    {
        $lineTokens = array_map(fn (array $word): string => $this->normalize((string) $word['text']), $lines[$lineIndex]['words']);
        $hasStart = collect($lineTokens)->contains(fn (string $token): bool => in_array($token, ['from', 'start'], true));
        $hasEnd = collect($lineTokens)->contains(fn (string $token): bool => in_array($token, ['to', 'end'], true));
        if (! $hasStart || ! $hasEnd) {
            return null;
        }

        $headerWords = [];
        for ($index = max(0, $lineIndex - 2); $index <= min(count($lines) - 1, $lineIndex + 2); $index++) {
            foreach ($lines[$index]['words'] as $word) {
                $token = $this->normalize((string) $word['text']);
                if (in_array($token, ['from', 'start', 'to', 'end', 'dbl', 'double', 'trpl', 'trp', 'triple', 'quad', 'qd', 'quadruple'], true)) {
                    $headerWords[] = $word;
                }
            }
        }

        return $this->detectHeaderAnchors($headerWords);
    }

    /**
     * @param  array<int, array{text: string, y: float, words: array<int, array<string, mixed>>}>  $lines
     */
    private function detectFallbackHotelName(array $lines, float $startAnchor): ?string
    {
        $parts = [];
        foreach ($lines as $line) {
            if ($this->isFallbackStructuralLine($line['text'])) {
                continue;
            }

            foreach ($line['words'] as $word) {
                if ((float) $word['x_min'] >= $startAnchor - 6) {
                    continue;
                }

                $text = trim((string) $word['text']);
                $normalized = $this->normalize($text);
                if (preg_match('/\pL/u', $text) !== 1 || in_array($normalized, ['hotel', 'hortel', 'hrotel'], true)) {
                    continue;
                }
                $parts[] = $text;
            }
        }

        $candidate = preg_replace('/\s+/', ' ', implode(' ', $parts)) ?: '';
        $normalized = $this->normalize($candidate);
        if ($candidate === '' || str_starts_with($normalized, 'update') || $this->isLikelyTableHeading($candidate)) {
            return null;
        }

        return $candidate;
    }

    private function isFallbackStructuralLine(string $text): bool
    {
        $normalized = $this->normalize($text);

        return str_starts_with($normalized, 'update')
            || (str_contains($normalized, 'period') && (str_contains($normalized, 'roomtype') || str_contains($normalized, 'mealplan')))
            || in_array($normalized, ['hotel', 'hortel', 'hrotel', 'roomtype', 'mealplan'], true);
    }

    /**
     * @param  array{start: float, end: float, dbl: ?float, trpl: ?float, quad: ?float}  $anchors
     */
    private function fallbackRateColumn(float $x, array $anchors): ?string
    {
        $rateAnchors = collect($anchors)
            ->only(['dbl', 'trpl', 'quad'])
            ->filter(fn (?float $value): bool => $value !== null)
            ->sort()
            ->all();
        if ($rateAnchors === []) {
            return null;
        }

        $entries = array_values(array_map(
            fn (string $key, float $value): array => ['key' => $key, 'x' => $value],
            array_keys($rateAnchors),
            array_values($rateAnchors),
        ));
        foreach ($entries as $index => $entry) {
            $left = $index === 0
                ? ($anchors['end'] + $entry['x']) / 2
                : ($entries[$index - 1]['x'] + $entry['x']) / 2;
            $right = isset($entries[$index + 1])
                ? ($entry['x'] + $entries[$index + 1]['x']) / 2
                : $entry['x'] + ($index === 0
                    ? max(24, ($entry['x'] - $anchors['end']) / 2)
                    : ($entry['x'] - $entries[$index - 1]['x']) / 2);
            if ($x >= $left && $x < $right) {
                return $entry['key'];
            }
        }

        return null;
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
            if (str_starts_with($normalized, 'update') || $this->detectHeaderAnchors($lines[$index]['words']) !== null) {
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

            // Clean up common OCR errors
            $cleaned = $this->cleanOcrHotelName($candidate);

            return preg_replace('/\s+/', ' ', $cleaned) ?: null;
        }

        return null;
    }

    /**
     * Clean up common OCR character mistakes in hotel names.
     */
    private function cleanOcrHotelName(string $name): string
    {
        // Common OCR character replacements
        $replacements = [
            // Letter confusion
            'yrad' => 'yad',      // Ajyrad -> Ajyad
            'Grarnd' => 'Grand',  // Al Massa Grarnd -> Al Massa Grand
            'Odest' => 'Odrest',  // Odest -> Odrest
            // Multiple character issues
            'MAlil' => 'Mill',    // MAlilAlinqreeuemq -> Millineum
            'inqreeuemq' => 'ineum',
            'Alinq' => 'ium',
            // Common patterns
            'rn' => 'm',          // if obviously wrong
            'ii' => 'n',          // double i to n
            '1' => 'l',           // digit 1 to letter l (if in word context)
            '0' => 'o',           // digit 0 to letter o
        ];

        $cleaned = $name;
        foreach ($replacements as $from => $to) {
            if (stripos($cleaned, $from) !== false) {
                $cleaned = str_ireplace($from, $to, $cleaned);
            }
        }

        return $cleaned;
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

    /**
     * @param  array<int, int>  $rates
     * @return array<int, int|null>
     */
    private function rejectFallbackRateOutliers(array $rates): array
    {
        if (count($rates) < 3) {
            return $rates;
        }

        $sorted = $rates;
        sort($sorted);
        $middle = intdiv(count($sorted), 2);
        $median = count($sorted) % 2 === 0
            ? ($sorted[$middle - 1] + $sorted[$middle]) / 2
            : $sorted[$middle];
        if ($median <= 0) {
            return $rates;
        }

        return array_map(
            fn (int $rate): ?int => $rate > $median * 20 ? null : $rate,
            $rates,
        );
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

        $normalized = $this->normalize($value);
        if (str_contains($normalized, 'saudiriyal') || str_contains($normalized, 'saudiriyals')) {
            return 'SAR';
        }

        return null;
    }

    private function normalize(string $value): string
    {
        return preg_replace('/[^\pL\pN]+/u', '', mb_strtolower(trim($value))) ?? '';
    }
}
