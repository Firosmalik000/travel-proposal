<?php

namespace App\Http\Controllers\Administrator\ProductManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\ProductCategoryHotel\BulkDeleteProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\BulkStoreProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\ParseProductCategoryHotelPdfRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\ReconcileProductCategoryHotelImportRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\StoreProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\UpdateProductCategoryHotelRequest;
use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelPrice;
use App\Services\HotelImport\HotelImportReconciliationService;
use App\Services\HotelImport\HotelRatePdfParser;
use App\Services\HotelImport\PdfTextExtractor;
use App\Services\HotelProductSyncService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ProductCategoryHotelController extends Controller
{
    public function __construct(
        private readonly HotelProductSyncService $hotelProductSyncService,
        private readonly PdfTextExtractor $pdfTextExtractor,
        private readonly HotelRatePdfParser $hotelRatePdfParser,
        private readonly HotelImportReconciliationService $hotelImportReconciliationService,
    ) {}

    public function parsePdf(ParseProductCategoryHotelPdfRequest $request): JsonResponse
    {
        $startedAt = microtime(true);
        $storedPath = $request->file('file')->storeAs(
            'hotel-imports',
            Str::uuid().'.pdf',
            'local'
        );

        Log::info('Hotel PDF parsing started');

        try {
            $pages = $this->pdfTextExtractor->extract(Storage::disk('local')->path($storedPath));
            $defaultCountryId = $request->filled('default_country_id') ? $request->integer('default_country_id') : null;
            $defaultCountry = $defaultCountryId !== null
                ? HotelCountry::query()->find($defaultCountryId)?->name
                : null;
            $defaultCurrency = $request->filled('default_currency')
                ? strtoupper((string) $request->string('default_currency')->value())
                : null;
            $knownCities = HotelCity::query()->where('is_active', true)->pluck('name')->all();
            $rows = $this->hotelRatePdfParser->parse($pages, $defaultCountry, $defaultCurrency, $knownCities);
            $result = $this->hotelImportReconciliationService->reconcile($rows, $defaultCountryId, $defaultCurrency);

            Log::info('Hotel PDF parsing completed', [
                'pages_processed' => count($pages),
                'hotel_blocks_detected' => $result['summary']['hotels_detected'],
                'rate_rows_detected' => $result['summary']['periods_detected'],
                'warnings' => $result['summary']['warnings'],
                'conflicts' => $result['summary']['conflicts'],
                'duration_ms' => (int) ((microtime(true) - $startedAt) * 1000),
            ]);

            return response()->json([
                'rows' => $rows,
                ...$result,
            ]);
        } catch (RuntimeException $exception) {
            Log::warning('Hotel PDF parsing failed', [
                'message' => $exception->getMessage(),
                'duration_ms' => (int) ((microtime(true) - $startedAt) * 1000),
            ]);

            return response()->json(['message' => $exception->getMessage()], 422);
        } finally {
            Storage::disk('local')->delete($storedPath);
        }
    }

    public function reconcileImport(ReconcileProductCategoryHotelImportRequest $request): JsonResponse
    {
        $defaultCountryId = $request->filled('default_country_id') ? $request->integer('default_country_id') : null;
        $defaultCurrency = $request->filled('default_currency')
            ? strtoupper((string) $request->string('default_currency')->value())
            : null;

        return response()->json($this->hotelImportReconciliationService->reconcile(
            (array) $request->validated('rows'),
            $defaultCountryId,
            $defaultCurrency,
        ));
    }

    public function store(StoreProductCategoryHotelRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $hotel = $this->createHotelWithPrices($request->validated());

            $this->hotelProductSyncService->sync($hotel);
        });

        return back()->with('success', 'Hotel berhasil ditambahkan.');
    }

    public function bulkStore(BulkStoreProductCategoryHotelRequest $request): RedirectResponse
    {
        $createdCount = 0;
        $updatedCount = 0;
        $newPeriodCount = 0;
        $unchangedCount = 0;
        $skippedHotels = [];
        $seenPayloadKeys = [];

        DB::transaction(function () use ($request, &$createdCount, &$updatedCount, &$newPeriodCount, &$unchangedCount, &$skippedHotels, &$seenPayloadKeys): void {
            foreach ((array) $request->validated('hotels') as $index => $hotelPayload) {
                $cityId = (int) data_get($hotelPayload, 'city_id');
                $name = trim((string) data_get($hotelPayload, 'name'));
                $key = $cityId.'|'.$this->normalizeHotelName($name);

                if (isset($seenPayloadKeys[$key])) {
                    $skippedHotels[] = [
                        'index' => $index + 1,
                        'name' => $name,
                        'reason' => 'Duplikat pada payload bulk',
                    ];

                    continue;
                }
                $seenPayloadKeys[$key] = true;

                $existingHotel = Hotel::withTrashed()
                    ->with(['prices' => fn ($query) => $query->withTrashed()])
                    ->where('city_id', $cityId)
                    ->get()
                    ->first(fn (Hotel $hotel): bool => $this->normalizeHotelName($hotel->name) === $this->normalizeHotelName($name));
                if ($existingHotel) {
                    if ($existingHotel->trashed() || ! $existingHotel->is_active) {
                        $skippedHotels[] = [
                            'index' => $index + 1,
                            'name' => $name,
                            'reason' => 'Data existing nonaktif atau sudah dihapus',
                        ];

                        continue;
                    }

                    $incomingCurrency = strtoupper((string) data_get($hotelPayload, 'currency'));
                    if (strtoupper($existingHotel->currency) !== $incomingCurrency) {
                        $skippedHotels[] = [
                            'index' => $index + 1,
                            'name' => $name,
                            'reason' => "Konflik mata uang {$existingHotel->currency} dan {$incomingCurrency}",
                        ];

                        continue;
                    }

                    $priceResult = $this->upsertHotelPrices($existingHotel, (array) data_get($hotelPayload, 'prices', []));
                    $newPeriodCount += $priceResult['new_periods'];

                    if ($priceResult['changed']) {
                        $updatedCount++;
                        $this->hotelProductSyncService->sync($existingHotel->fresh());
                    } else {
                        $unchangedCount++;
                    }

                    continue;
                }

                $hotel = $this->createHotelWithPrices($hotelPayload);
                $createdCount++;
                $this->hotelProductSyncService->sync($hotel);
            }
        });

        return back()
            ->with('success', 'Bulk create/update hotel berhasil diproses.')
            ->with('bulk_created_count', $createdCount)
            ->with('bulk_updated_count', $updatedCount)
            ->with('bulk_new_period_count', $newPeriodCount)
            ->with('bulk_unchanged_count', $unchangedCount)
            ->with('bulk_skipped_hotels', $skippedHotels);
    }

    /**
     * @param  array<int, array<string, mixed>>  $prices
     * @return array{changed: bool, new_periods: int}
     */
    private function upsertHotelPrices(Hotel $hotel, array $prices): array
    {
        $changed = false;
        $newPeriods = 0;
        $knownPeriods = $hotel->prices
            ->filter(fn (HotelPrice $price): bool => ! $price->trashed())
            ->map(fn (HotelPrice $price): string => $price->period_start?->toDateString().'|'.$price->period_end?->toDateString())
            ->unique()
            ->flip();

        foreach ($this->pricePayload($prices) as $pricePayload) {
            $periodKey = $pricePayload['period_start'].'|'.$pricePayload['period_end'];
            $existingPrice = $hotel->prices
                ->filter(fn (HotelPrice $price): bool => ! $price->trashed())
                ->first(fn (HotelPrice $price): bool => (int) $price->room_type_id === (int) $pricePayload['room_type_id']
                    && $price->period_start?->toDateString() === $pricePayload['period_start']
                    && $price->period_end?->toDateString() === $pricePayload['period_end']
                    && mb_strtolower($price->broker_name ?: 'Broker 1') === mb_strtolower($pricePayload['broker_name']));

            if ($existingPrice) {
                if ((int) $existingPrice->price !== (int) $pricePayload['price']) {
                    $existingPrice->update(['price' => $pricePayload['price']]);
                    $changed = true;
                }

                continue;
            }

            $hotel->prices()->create($pricePayload);
            $changed = true;
            if (! $knownPeriods->has($periodKey)) {
                $knownPeriods->put($periodKey, true);
                $newPeriods++;
            }
        }

        return ['changed' => $changed, 'new_periods' => $newPeriods];
    }

    private function normalizeHotelName(string $name): string
    {
        return preg_replace('/[^\pL\pN]+/u', '', mb_strtolower(trim($name))) ?? '';
    }

    public function update(UpdateProductCategoryHotelRequest $request, Hotel $hotel): RedirectResponse
    {
        DB::transaction(function () use ($request, $hotel): void {
            $hotel->update([
                'country_id' => $request->integer('country_id'),
                'city_id' => $request->integer('city_id'),
                'name' => trim((string) $request->string('name')->value()),
                'description' => $request->filled('description') ? trim((string) $request->string('description')->value()) : null,
                'currency' => strtoupper((string) $request->string('currency')->value()),
                'is_active' => $request->boolean('is_active', true),
            ]);

            $hotel->prices()->delete();
            $hotel->prices()->createMany($this->pricePayload($request->validated('prices')));

            $this->hotelProductSyncService->sync($hotel->fresh());
        });

        return back()->with('success', 'Hotel berhasil diperbarui.');
    }

    public function destroy(Hotel $hotel): RedirectResponse
    {
        DB::transaction(function () use ($hotel): void {
            $this->hotelProductSyncService->deactivateProduct($hotel);
            $hotel->update(['is_active' => false]);
            $hotel->delete();
        });

        return back()->with('success', 'Hotel berhasil dihapus.');
    }

    public function bulkDelete(BulkDeleteProductCategoryHotelRequest $request): RedirectResponse
    {
        $ids = collect($request->validated('ids'))
            ->map(fn (mixed $id): int => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $deactivatedCount = 0;

        DB::transaction(function () use ($ids, &$deactivatedCount): void {
            Hotel::query()
                ->whereIn('id', $ids->all())
                ->get()
                ->each(function (Hotel $hotel) use (&$deactivatedCount): void {
                    $this->hotelProductSyncService->deactivateProduct($hotel);
                    $hotel->update(['is_active' => false]);
                    $hotel->delete();
                    $deactivatedCount++;
                });
        });

        return back()->with('success', $deactivatedCount.' hotel berhasil dihapus.');
    }

    private function generateHotelCode(string $hotelName): string
    {
        $base = Str::upper(Str::slug($hotelName, '-'));
        $base = $base !== '' ? $base : 'HOTEL';

        return 'HTL-'.$base;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function createHotelWithPrices(array $payload): Hotel
    {
        $name = trim((string) data_get($payload, 'name'));
        $countryId = (int) data_get($payload, 'country_id');
        $cityId = (int) data_get($payload, 'city_id');
        $description = data_get($payload, 'description') !== null
            ? trim((string) data_get($payload, 'description'))
            : null;
        $currency = strtoupper((string) data_get($payload, 'currency', 'IDR'));
        $isActive = (bool) data_get($payload, 'is_active', true);
        $baseCode = $this->generateHotelCode($name);
        $attempt = 0;

        do {
            $codeCandidate = $attempt === 0 ? $baseCode : $baseCode.'-'.$attempt;

            try {
                $hotel = Hotel::query()->create([
                    'country_id' => $countryId,
                    'city_id' => $cityId,
                    'name' => $name,
                    'code' => $codeCandidate,
                    'description' => $description,
                    'currency' => $currency,
                    'is_active' => $isActive,
                ]);
                break;
            } catch (QueryException $exception) {
                if (! $this->isDuplicateHotelCodeError($exception) || $attempt >= 50) {
                    throw $exception;
                }
                $attempt++;
            }
        } while (true);

        $hotel->prices()->createMany(
            $this->pricePayload((array) data_get($payload, 'prices', []))
        );

        return $hotel;
    }

    private function isDuplicateHotelCodeError(QueryException $exception): bool
    {
        $message = $exception->getMessage();

        return str_contains($message, 'Duplicate entry')
            && str_contains($message, 'hotels.hotels_code_unique');
    }

    /**
     * @param  array<int, array<string, mixed>>  $prices
     * @return array<int, array<string, mixed>>
     */
    private function pricePayload(array $prices): array
    {
        return collect($prices)
            ->map(fn (array $item): array => [
                'broker_key' => $this->normalizeBrokerKey($item['broker_key'] ?? null, $item['broker_name'] ?? null),
                'broker_name' => $this->normalizeBrokerName($item['broker_name'] ?? null),
                'room_type_id' => (int) $item['room_type_id'],
                'period_start' => (string) $item['period_start'],
                'period_end' => (string) $item['period_end'],
                'price' => (int) $item['price'],
                'is_active' => true,
            ])
            ->values()
            ->all();
    }

    private function normalizeBrokerName(mixed $value): string
    {
        $brokerName = trim((string) ($value ?? ''));

        return $brokerName !== '' ? $brokerName : 'Broker 1';
    }

    private function normalizeBrokerKey(mixed $value, mixed $brokerName = null): string
    {
        $brokerKey = trim((string) ($value ?? ''));

        if ($brokerKey !== '') {
            return $brokerKey;
        }

        return 'broker-'.Str::slug($this->normalizeBrokerName($brokerName));
    }
}
