<?php

namespace App\Services\HotelImport;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use Illuminate\Support\Collection;

class HotelImportReconciliationService
{
    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array{hotels: array<int, array<string, mixed>>, summary: array<string, int>}
     */
    public function reconcile(array $rows, ?int $defaultCountryId = null, ?string $defaultCurrency = null): array
    {
        $countries = HotelCountry::query()->where('is_active', true)->get(['id', 'name']);
        $cities = HotelCity::query()->with('country:id,name')->where('is_active', true)->get(['id', 'country_id', 'name']);
        $knownHotels = Hotel::withTrashed()->get(['id', 'city_id', 'name']);
        $defaultCountry = $defaultCountryId !== null ? $countries->firstWhere('id', $defaultCountryId) : null;
        $grouped = [];

        foreach ($rows as $rowIndex => $row) {
            $hotelName = $this->clean((string) data_get($row, 'hotel'));
            $resolved = $this->resolveLocation($row, $countries, $cities, $knownHotels, $hotelName, $defaultCountry?->id);
            $currency = strtoupper($this->clean((string) (data_get($row, 'currency') ?: $defaultCurrency)));
            $groupKey = implode('|', [
                $resolved['country_id'] ?: 'country:'.$this->normalize((string) data_get($row, 'country')),
                $resolved['city_id'] ?: 'city:'.$this->normalize((string) data_get($row, 'city')),
                $this->normalize($hotelName),
            ]);

            if (! isset($grouped[$groupKey])) {
                $grouped[$groupKey] = [
                    'country_id' => $resolved['country_id'],
                    'city_id' => $resolved['city_id'],
                    'name' => $hotelName,
                    'currency' => $currency,
                    'is_active' => true,
                    'existing_hotel_id' => null,
                    'existing_currency' => null,
                    'import_status' => 'create',
                    'warnings' => [],
                    'conflicts' => [],
                    'period_rates' => [],
                ];
            }

            $hotel = &$grouped[$groupKey];
            $hotel['warnings'] = array_merge($hotel['warnings'], $resolved['warnings']);

            if ($hotel['currency'] === '' && $currency !== '') {
                $hotel['currency'] = $currency;
            } elseif ($currency !== '' && $hotel['currency'] !== $currency) {
                $hotel['conflicts'][] = "Mata uang dalam file tidak konsisten: {$hotel['currency']} dan {$currency}.";
            }

            $periodKey = data_get($row, 'period_start').'|'.data_get($row, 'period_end');
            $period = [
                'ui_id' => 'import-'.($rowIndex + 1),
                'broker_group_id' => 'broker-import-1',
                'broker_key' => 'broker-1',
                'broker_name' => 'Broker 1',
                'period_start' => (string) data_get($row, 'period_start'),
                'period_end' => (string) data_get($row, 'period_end'),
                'dbl_price' => $this->nullableInteger(data_get($row, 'dbl')),
                'trpl_price' => $this->nullableInteger(data_get($row, 'trpl')),
                'quad_price' => $this->nullableInteger(data_get($row, 'quad')),
                'import_status' => 'create',
                'warnings' => (array) data_get($row, 'warnings', []),
                'conflicts' => [],
                'comparison' => [],
            ];

            $existingPeriodIndex = collect($hotel['period_rates'])->search(
                fn (array $item): bool => $periodKey === $item['period_start'].'|'.$item['period_end']
            );

            if ($existingPeriodIndex !== false) {
                $existingIncoming = $hotel['period_rates'][$existingPeriodIndex];
                if ($this->incomingRatesDiffer($existingIncoming, $period)) {
                    $message = "Periode {$period['period_start']} sampai {$period['period_end']} muncul lebih dari sekali dengan harga berbeda.";
                    $hotel['period_rates'][$existingPeriodIndex]['conflicts'][] = $message;
                    $hotel['period_rates'][$existingPeriodIndex]['import_status'] = 'conflict';
                    $period['conflicts'][] = $message;
                    $period['import_status'] = 'conflict';
                    $hotel['period_rates'][] = $period;
                    $hotel['conflicts'][] = $message;
                } else {
                    $hotel['period_rates'][$existingPeriodIndex]['warnings'] = array_values(array_unique(array_merge(
                        $existingIncoming['warnings'],
                        $period['warnings'],
                    )));
                }

                unset($hotel);

                continue;
            }

            $hotel['period_rates'][] = $period;
            unset($hotel);
        }

        $cityIds = collect($grouped)->pluck('city_id')->filter()->unique()->values();
        $existingHotels = Hotel::withTrashed()
            ->with(['prices' => fn ($query) => $query->withTrashed()->with('roomType:id,name')])
            ->whereIn('city_id', $cityIds->all())
            ->get();

        foreach ($grouped as &$hotelDraft) {
            $hotelDraft['warnings'] = array_values(array_unique($hotelDraft['warnings']));
            $hotelDraft['conflicts'] = array_values(array_unique($hotelDraft['conflicts']));

            if ($hotelDraft['currency'] === '') {
                $hotelDraft['conflicts'][] = 'Mata uang belum ditentukan.';
            }

            // Try to match existing hotel to get city/country if missing
            if ((! $hotelDraft['city_id'] || ! $hotelDraft['country_id']) && $hotelDraft['name'] !== '') {
                $hotelMatch = $this->uniqueHotelNameMatch($existingHotels, $hotelDraft['name']);
                if ($hotelMatch['hotel']) {
                    // Use existing hotel's city and country
                    $hotelDraft['city_id'] = (string) $hotelMatch['hotel']->city_id;
                    $hotelDraft['country_id'] = (string) $hotelMatch['hotel']->country->id;
                    if ($hotelMatch['fuzzy']) {
                        $hotelDraft['warnings'][] = "Kota & negara diambil dari hotel existing {$hotelMatch['hotel']->name}.";
                    }
                }
            }

            if (! $hotelDraft['city_id'] || ! $hotelDraft['country_id']) {
                $hotelDraft['conflicts'][] = 'Negara atau kota belum cocok dengan data master.';
                $hotelDraft['import_status'] = 'conflict';

                continue;
            }

            $hotelMatch = $this->uniqueHotelNameMatch($existingHotels, $hotelDraft['name'], (int) $hotelDraft['city_id']);
            $existingHotel = $hotelMatch['hotel'];

            if (! $existingHotel) {
                foreach ($hotelDraft['period_rates'] as &$period) {
                    $period['import_status'] = 'create';
                    $this->addMissingRateWarnings($period, $hotelDraft['name']);
                }
                unset($period);
                $hotelDraft['import_status'] = $hotelDraft['conflicts'] === [] ? 'create' : 'conflict';

                continue;
            }

            if ($hotelMatch['fuzzy']) {
                $hotelDraft['warnings'][] = "Nama {$hotelDraft['name']} dicocokkan dengan hotel existing {$existingHotel->name}; periksa ejaan sebelum menyimpan.";
                $hotelDraft['warnings'] = array_values(array_unique($hotelDraft['warnings']));
            }

            $hotelDraft['existing_hotel_id'] = $existingHotel->id;
            $hotelDraft['existing_currency'] = strtoupper($existingHotel->currency);
            if ($existingHotel->trashed() || ! $existingHotel->is_active) {
                $hotelDraft['conflicts'][] = 'Hotel ditemukan dalam kondisi nonaktif atau sudah dihapus. Data tidak akan diubah otomatis.';
                $hotelDraft['import_status'] = 'conflict';

                continue;
            }

            if ($defaultCurrency !== null) {
                $hotelDraft['currency'] = strtoupper($defaultCurrency);
            }

            $currencyWillChange = $hotelDraft['currency'] !== ''
                && strtoupper($existingHotel->currency) !== $hotelDraft['currency'];

            if ($currencyWillChange) {
                $hotelDraft['warnings'][] = "Mata uang hotel existing akan diperbarui dari {$existingHotel->currency} menjadi {$hotelDraft['currency']} saat disimpan.";
            }

            $hotelHasChanges = $currencyWillChange;
            foreach ($hotelDraft['period_rates'] as &$period) {
                $exactPeriodPrices = $existingHotel->prices
                    ->filter(fn ($price): bool => ! $price->trashed()
                        && ($price->broker_name ?: 'Broker 1') === 'Broker 1'
                        && $price->period_start?->toDateString() === $period['period_start']
                        && $price->period_end?->toDateString() === $period['period_end']);

                if ($exactPeriodPrices->isEmpty()) {
                    $period['import_status'] = 'new_period';
                    $hotelHasChanges = true;

                    if ($this->overlapsExistingPeriod($existingHotel, $period)) {
                        // Don't warn about overlap - it's normal for existing hotels
                        // Just mark as new_period, rates will be added
                    }

                    continue;
                }

                $periodChanged = false;
                foreach (['dbl' => 'dbl_price', 'trpl' => 'trpl_price', 'quad' => 'quad_price'] as $roomType => $field) {
                    $incoming = $period[$field];
                    $existingPrice = $exactPeriodPrices->first(
                        fn ($price): bool => $this->normalizeRoomType($price->roomType?->name) === $roomType
                    );
                    $existing = $existingPrice?->price;
                    $action = 'no_change';

                    if ($incoming === null) {
                        // Rate not readable - keep existing (no warning needed)
                        $action = $existing !== null ? 'keep_existing' : 'no_change';
                    } elseif ($existing === null) {
                        $action = 'create';
                        $periodChanged = true;
                    } elseif ((int) $existing !== (int) $incoming) {
                        $action = 'update';
                        $periodChanged = true;
                    }

                    $period['comparison'][$roomType] = [
                        'existing' => $existing !== null ? (int) $existing : null,
                        'incoming' => $incoming,
                        'action' => $action,
                    ];
                }

                $period['warnings'] = array_values(array_unique($period['warnings']));
                $period['import_status'] = $periodChanged ? 'update' : 'no_change';
                $hotelHasChanges = $hotelHasChanges || $periodChanged;
            }
            unset($period);

            $hotelDraft['warnings'] = array_values(array_unique($hotelDraft['warnings']));
            $hotelDraft['conflicts'] = array_values(array_unique($hotelDraft['conflicts']));
            $hotelDraft['import_status'] = $hotelDraft['conflicts'] !== []
                ? 'conflict'
                : ($hotelHasChanges ? 'update' : 'no_change');
        }
        unset($hotelDraft);

        $hotels = array_values($grouped);

        return [
            'hotels' => $hotels,
            'summary' => $this->summary($hotels),
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  Collection<int, HotelCountry>  $countries
     * @param  Collection<int, HotelCity>  $cities
     * @param  Collection<int, Hotel>  $knownHotels
     * @return array{country_id: string, city_id: string, warnings: array<int, string>}
     */
    private function resolveLocation(
        array $row,
        Collection $countries,
        Collection $cities,
        Collection $knownHotels,
        string $hotelName,
        ?int $defaultCountryId,
    ): array {
        $warnings = [];
        $countryName = $this->clean((string) data_get($row, 'country'));
        $cityName = $this->clean((string) data_get($row, 'city'));
        $country = $countryName !== ''
            ? $countries->first(fn (HotelCountry $item): bool => $this->normalize($item->name) === $this->normalize($countryName))
            : $countries->firstWhere('id', $defaultCountryId);
        $countryId = $country?->id;

        if ($countryName !== '' && ! $country) {
            $warnings[] = "Negara {$countryName} tidak ditemukan.";
        }

        $cityCandidates = $cities->filter(
            fn (HotelCity $city): bool => $this->normalizeCity($city->name) === $this->normalizeCity($cityName)
        );
        $city = $countryId !== null
            ? $cityCandidates->firstWhere('country_id', $countryId)
            : ($cityCandidates->count() === 1 ? $cityCandidates->first() : null);

        if (! $city && $cityName === '' && $hotelName !== '') {
            $eligibleCityIds = $countryId !== null
                ? $cities->where('country_id', $countryId)->pluck('id')
                : $cities->pluck('id');
            $hotelMatch = $this->uniqueHotelNameMatch(
                $knownHotels->whereIn('city_id', $eligibleCityIds),
                $hotelName,
            );
            if ($hotelMatch['hotel']) {
                $city = $cities->firstWhere('id', $hotelMatch['hotel']->city_id);
                if ($city) {
                    $countryId = $city->country_id;
                    $matchLabel = $hotelMatch['fuzzy'] ? "hotel existing {$hotelMatch['hotel']->name}" : 'nama hotel existing';
                    $warnings[] = "Kota {$city->name} ditentukan dari {$matchLabel}; periksa sebelum menyimpan.";
                }
            }
        }

        if (! $city) {
            $warnings[] = $cityName !== '' ? "Kota {$cityName} tidak ditemukan atau ambigu." : 'Kota belum terdeteksi.';
        }

        return [
            'country_id' => $city?->country_id ? (string) $city->country_id : ($countryId ? (string) $countryId : ''),
            'city_id' => $city?->id ? (string) $city->id : '',
            'warnings' => $warnings,
        ];
    }

    /**
     * @param  Collection<int, Hotel>  $hotels
     * @return array{hotel: Hotel|null, fuzzy: bool}
     */
    private function uniqueHotelNameMatch(Collection $hotels, string $name, ?int $cityId = null): array
    {
        $normalizedName = $this->normalize($name);
        $candidates = $hotels->when(
            $cityId !== null,
            fn (Collection $items): Collection => $items->filter(
                fn (Hotel $hotel): bool => (int) $hotel->city_id === $cityId
            ),
        );

        // Exact match first
        $exact = $candidates->filter(
            fn (Hotel $hotel): bool => $this->normalize($hotel->name) === $normalizedName
        );
        if ($exact->count() === 1) {
            return ['hotel' => $exact->first(), 'fuzzy' => false];
        }

        // Don't fuzzy match if name too short or exact matches exist
        if ($exact->isNotEmpty() || mb_strlen($normalizedName) < 5) {
            return ['hotel' => null, 'fuzzy' => false];
        }

        // Fuzzy match using similarity percentage (more strict than Levenshtein distance)
        // Only match if similarity > 85%
        $fuzzy = $candidates->filter(function (Hotel $hotel) use ($normalizedName): bool {
            $hotelNormalized = $this->normalize($hotel->name);
            $distance = levenshtein($normalizedName, $hotelNormalized);
            $maxLen = max(mb_strlen($normalizedName), mb_strlen($hotelNormalized));

            // Calculate similarity percentage: 100% - (distance / maxLen * 100)
            $similarity = (1 - ($distance / $maxLen)) * 100;

            return $similarity >= 85;
        });

        return $fuzzy->count() === 1
            ? ['hotel' => $fuzzy->first(), 'fuzzy' => true]
            : ['hotel' => null, 'fuzzy' => false];
    }

    /** @param array<string, mixed> $left @param array<string, mixed> $right */
    private function incomingRatesDiffer(array $left, array $right): bool
    {
        foreach (['dbl_price', 'trpl_price', 'quad_price'] as $field) {
            if ($left[$field] !== $right[$field]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Add warnings for missing rate values that couldn't be read from source.
     * Only warn if rate is critical or affects existing data.
     *
     * @param  array<string, mixed>  $period
     */
    private function addMissingRateWarnings(array &$period, string $hotelName): void
    {
        // Don't add warnings for null rates - it's normal for PDF parsing
        // Null rates will simply be skipped during import (not stored as 0)
    }

    /** @param array<string, mixed> $period */
    private function overlapsExistingPeriod(Hotel $hotel, array $period): bool
    {
        return $hotel->prices->contains(
            fn ($price): bool => ! $price->trashed()
                && $price->period_start?->toDateString() <= $period['period_end']
                && $price->period_end?->toDateString() >= $period['period_start']
        );
    }

    /** @param array<int, array<string, mixed>> $hotels @return array<string, int> */
    private function summary(array $hotels): array
    {
        $periods = collect($hotels)->flatMap(fn (array $hotel): array => $hotel['period_rates']);
        $comparisons = $periods->flatMap(fn (array $period): array => array_values($period['comparison'] ?? []));

        return [
            'hotels_detected' => count($hotels),
            'periods_detected' => $periods->count(),
            'hotels_to_create' => collect($hotels)->where('import_status', 'create')->count(),
            'hotels_existing' => collect($hotels)->whereNotNull('existing_hotel_id')->count(),
            'periods_to_create' => $periods->whereIn('import_status', ['create', 'new_period'])->count(),
            'rates_to_update' => $comparisons->where('action', 'update')->count(),
            'rates_unchanged' => $comparisons->whereIn('action', ['no_change', 'keep_existing'])->count(),
            'warnings' => collect($hotels)->sum(fn (array $hotel): int => count($hotel['warnings']) + collect($hotel['period_rates'])->sum(fn (array $period): int => count($period['warnings']))),
            'conflicts' => collect($hotels)->sum(fn (array $hotel): int => count($hotel['conflicts']) + collect($hotel['period_rates'])->sum(fn (array $period): int => count($period['conflicts']))),
        ];
    }

    private function nullableInteger(mixed $value): ?int
    {
        return $value === null || $value === '' ? null : (int) $value;
    }

    private function normalizeRoomType(?string $value): ?string
    {
        $normalized = strtoupper(trim((string) $value));

        return match (true) {
            in_array($normalized, ['DBL', 'DOUBLE'], true) => 'dbl',
            in_array($normalized, ['TRPL', 'TRIPLE'], true) => 'trpl',
            in_array($normalized, ['QUAD', 'QUADRUPLE'], true) => 'quad',
            default => null,
        };
    }

    private function normalizeCity(string $value): string
    {
        return match ($this->normalize($value)) {
            'makkah', 'mecca', 'mekkah' => 'mekkah',
            'madina', 'madinah', 'medina' => 'madinah',
            default => $this->normalize($value),
        };
    }

    private function normalize(string $value): string
    {
        return preg_replace('/[^\pL\pN]+/u', '', mb_strtolower($this->clean($value))) ?? '';
    }

    private function clean(string $value): string
    {
        return preg_replace('/\s+/', ' ', trim($value)) ?? '';
    }
}
