<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\BulkStoreHotelRequest;
use App\Http\Requests\Administrator\StoreHotelRequest;
use App\Http\Requests\Administrator\UpdateHotelRequest;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\TravelPackage;
use App\Services\HotelProductSyncService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HotelController extends Controller
{
    public function __construct(private readonly HotelProductSyncService $hotelProductSyncService) {}

    public function index(Request $request): Response
    {
        $this->ensureDefaultRoomTypes();

        $search = trim((string) $request->string('search')->value());
        $cityId = $request->integer('city_id');
        $status = (string) $request->string('status')->value();

        $hotels = Hotel::query()
            ->with(['country:id,name', 'city:id,name', 'product:id,code', 'prices.roomType:id,name'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner
                        ->where('code', 'like', '%'.$search.'%')
                        ->orWhere('name', 'like', '%'.$search.'%')
                        ->orWhereHas('country', fn ($countryQuery) => $countryQuery->where('name', 'like', '%'.$search.'%'))
                        ->orWhereHas('city', fn ($cityQuery) => $cityQuery->where('name', 'like', '%'.$search.'%'));
                });
            })
            ->when($cityId > 0, fn ($query) => $query->where('city_id', $cityId))
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Hotel $hotel): array {
                return [
                    'id' => $hotel->id,
                    'code' => $hotel->code,
                    'name' => $hotel->name,
                    'description' => $hotel->description,
                    'currency' => $hotel->currency,
                    'is_active' => $hotel->is_active,
                    'country_id' => $hotel->country_id,
                    'city_id' => $hotel->city_id,
                    'country_name' => $hotel->country?->name,
                    'city_name' => $hotel->city?->name,
                    'product_code' => $hotel->product?->code,
                    'prices' => $hotel->prices->map(fn ($price): array => [
                        'id' => $price->id,
                        'broker_key' => $price->broker_key,
                        'broker_name' => $price->broker_name,
                        'room_type_id' => $price->room_type_id,
                        'room_type_name' => $price->roomType?->name,
                        'period_start' => $price->period_start?->toDateString(),
                        'period_end' => $price->period_end?->toDateString(),
                        'price' => $price->price,
                    ])->values()->all(),
                ];
            });

        return Inertia::render('Dashboard/MasterData/Hotels/Index', [
            'hotels' => $hotels,
            'filters' => [
                'search' => $search,
                'city_id' => $cityId > 0 ? (string) $cityId : 'all',
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : 'all',
            ],
            'cityStats' => Hotel::query()
                ->selectRaw('city_id, COUNT(*) as total_hotels')
                ->with('city:id,name')
                ->groupBy('city_id')
                ->orderByDesc('total_hotels')
                ->get()
                ->map(fn (Hotel $hotel): array => [
                    'city_id' => (int) $hotel->city_id,
                    'city_name' => (string) ($hotel->city?->name ?? '-'),
                    'total_hotels' => (int) ($hotel->getAttribute('total_hotels') ?? 0),
                ])
                ->values()
                ->all(),
            'countryOptions' => HotelCountry::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelCountry $country): array => [
                    'id' => $country->id,
                    'name' => $country->name,
                ])
                ->values()
                ->all(),
            'cityOptions' => HotelCity::query()
                ->with('country:id,name')
                ->orderBy('name')
                ->get(['id', 'country_id', 'name'])
                ->map(fn (HotelCity $city): array => [
                    'id' => $city->id,
                    'country_id' => $city->country_id,
                    'name' => $city->name,
                    'country_name' => $city->country?->name,
                ])
                ->values()
                ->all(),
            'roomTypeOptions' => HotelRoomType::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelRoomType $roomType): array => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                ])
                ->values()
                ->all(),
            'currencyOptions' => Hotel::query()
                ->selectRaw('UPPER(currency) as code')
                ->whereNotNull('currency')
                ->pluck('code')
                ->merge(
                    TravelPackage::query()
                        ->selectRaw('UPPER(currency) as code')
                        ->whereNotNull('currency')
                        ->pluck('code')
                )
                ->merge(
                    Booking::query()
                        ->selectRaw('UPPER(custom_currency) as code')
                        ->whereNotNull('custom_currency')
                        ->pluck('code')
                )
                ->filter(fn (?string $code): bool => is_string($code) && $code !== '')
                ->unique()
                ->sort()
                ->values()
                ->map(fn (string $code): array => [
                    'code' => $code,
                ])
                ->all(),
        ]);
    }

    private function ensureDefaultRoomTypes(): void
    {
        foreach (['DBL', 'TRPL', 'QUAD'] as $roomTypeName) {
            HotelRoomType::query()->firstOrCreate(
                ['name' => $roomTypeName],
                ['is_active' => true],
            );
        }
    }

    public function store(StoreHotelRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $hotel = $this->createHotelWithPrices($request->validated());

            $this->hotelProductSyncService->sync($hotel);
        });

        return back()->with('success', 'Hotel berhasil ditambahkan.');
    }

    public function bulkStore(BulkStoreHotelRequest $request): RedirectResponse
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

    public function update(UpdateHotelRequest $request, Hotel $hotel): RedirectResponse
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
        });

        return back()->with('success', 'Hotel berhasil dinonaktifkan.');
    }

    public function storeCountry(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        HotelCountry::query()->firstOrCreate(
            ['name' => trim((string) $payload['name'])],
            ['is_active' => true],
        );

        return back()->with('success', 'Negara berhasil ditambahkan.');
    }

    public function storeCity(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'country_id' => ['required', 'integer', 'exists:hotel_countries,id'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        HotelCity::query()->firstOrCreate(
            [
                'country_id' => (int) $payload['country_id'],
                'name' => trim((string) $payload['name']),
            ],
            ['is_active' => true],
        );

        return back()->with('success', 'Kota berhasil ditambahkan.');
    }

    public function storeRoomType(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        HotelRoomType::query()->firstOrCreate(
            ['name' => trim((string) $payload['name'])],
            ['is_active' => true],
        );

        return back()->with('success', 'Room type berhasil ditambahkan.');
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
