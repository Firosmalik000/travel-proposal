<?php

namespace App\Http\Controllers\Administrator\ProductManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\ProductCategoryHotel\BulkDeleteProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\BulkStoreProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\StoreProductCategoryHotelRequest;
use App\Http\Requests\Administrator\ProductCategoryHotel\UpdateProductCategoryHotelRequest;
use App\Models\Hotel;
use App\Services\HotelProductSyncService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductCategoryHotelController extends Controller
{
    public function __construct(
        private readonly HotelProductSyncService $hotelProductSyncService,
    ) {}

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
        $skippedHotels = [];
        $seenPayloadKeys = [];

        DB::transaction(function () use ($request, &$createdCount, &$skippedHotels, &$seenPayloadKeys): void {
            foreach ((array) $request->validated('hotels') as $index => $hotelPayload) {
                $cityId = (int) data_get($hotelPayload, 'city_id');
                $name = trim((string) data_get($hotelPayload, 'name'));
                $key = $cityId.'|'.mb_strtolower($name);

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
                    ->where('city_id', $cityId)
                    ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                    ->first();
                if ($existingHotel) {
                    $skippedHotels[] = [
                        'index' => $index + 1,
                        'name' => $name,
                        'reason' => $existingHotel->is_active
                            ? 'Data sudah ada (aktif)'
                            : 'Data sudah ada (nonaktif)',
                    ];

                    continue;
                }

                $hotel = $this->createHotelWithPrices($hotelPayload);
                $createdCount++;
                $this->hotelProductSyncService->sync($hotel);
            }
        });

        return back()
            ->with('success', 'Bulk create hotel berhasil diproses.')
            ->with('bulk_created_count', $createdCount)
            ->with('bulk_skipped_hotels', $skippedHotels);
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
