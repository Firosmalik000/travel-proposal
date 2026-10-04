<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\ProductCategory;
use App\Models\TravelProduct;
use Illuminate\Http\Request;

class ProductManagementPageData
{
    public function __construct(private readonly LiveCurrencyRateService $liveCurrencyRateService) {}

    public function build(Request $request): array
    {
        $search = trim((string) $request->query('search', ''));
        $productType = trim((string) $request->query('product_type', 'hotel'));
        $status = trim((string) $request->query('status', 'all'));

        $query = TravelProduct::query()
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($inner) use ($search): void {
                    $inner
                        ->where('code', 'like', '%'.$search.'%')
                        ->orWhere('name', 'like', '%'.$search.'%')
                        ->orWhere('slug', 'like', '%'.$search.'%')
                        ->orWhere('product_type', 'like', '%'.$search.'%');
                });
            })
            ->when($productType !== '' && $productType !== 'all', fn ($q) => $q->where('product_type', $productType))
            ->orderBy('code');

        $products = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (TravelProduct $product): array => [
                'id' => $product->id,
                'code' => $product->code,
                'slug' => $product->slug,
                'name' => $product->name,
                'product_type' => $product->product_type,
                'description' => $product->description,
                'price' => is_array($product->content) && isset($product->content['price'])
                    ? (int) $product->content['price']
                    : null,
                'currency' => is_array($product->content)
                    ? (string) ($product->content['currency'] ?? '')
                    : '',
                'currency_rate_snapshot' => is_array($product->content)
                    ? data_get($product->content, 'currency_rate_snapshot')
                    : null,
                'hotel_info' => is_array($product->content)
                    ? [
                        'hotel_id' => (int) ($product->content['hotel_id'] ?? 0),
                        'city' => (string) ($product->content['city'] ?? ''),
                        'country' => (string) ($product->content['country'] ?? ''),
                        'currency' => (string) ($product->content['currency'] ?? ''),
                        'pricing' => collect(is_array($product->content['pricing'] ?? null) ? $product->content['pricing'] : [])
                            ->map(fn ($row): array => [
                                'room_type' => (string) data_get($row, 'room_type', ''),
                                'period_start' => data_get($row, 'period_start'),
                                'period_end' => data_get($row, 'period_end'),
                                'price' => data_get($row, 'price'),
                            ])
                            ->values()
                            ->all(),
                    ]
                    : null,
                'is_active' => $product->is_active,
            ]);

        $stats = [
            'total' => TravelProduct::query()->count(),
            'active' => TravelProduct::query()->where('is_active', true)->count(),
            'inactive' => TravelProduct::query()->where('is_active', false)->count(),
        ];

        $productTypeOptions = ProductCategory::query()
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get(['key', 'name'])
            ->map(fn (ProductCategory $category): array => [
                'value' => (string) $category->key,
                'label' => (string) ($category->name ?: $category->key),
            ])
            ->values()
            ->all();

        $currencyOptions = $this->liveCurrencyRateService->options();

        return [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'product_type' => $productType !== '' ? $productType : 'hotel',
            ],
            'stats' => $stats,
            'product_type_options' => $productTypeOptions,
            'hotel_options' => Hotel::query()
                ->with(['country:id,name', 'city:id,name', 'product:id,code', 'prices.roomType:id,name'])
                ->whereNotNull('product_id')
                ->orderBy('name')
                ->get(['id', 'product_id', 'country_id', 'city_id', 'name', 'code', 'description', 'currency', 'is_active'])
                ->map(fn (Hotel $hotel): array => [
                    'id' => $hotel->id,
                    'product_id' => $hotel->product_id,
                    'name' => $hotel->name,
                    'code' => $hotel->code,
                    'description' => $hotel->description,
                    'product_code' => $hotel->product?->code,
                    'country_id' => $hotel->country_id,
                    'city_id' => $hotel->city_id,
                    'country' => $hotel->country?->name,
                    'city' => $hotel->city?->name,
                    'currency' => $hotel->currency,
                    'is_active' => $hotel->is_active,
                    'pricing' => $hotel->prices
                        ->filter(fn ($price): bool => HotelRoomType::isProductHotelPricingName($price->roomType?->name))
                        ->sortBy('period_start')
                        ->values()
                        ->map(fn ($price): array => [
                            'id' => $price->id,
                            'broker_key' => $price->broker_key,
                            'broker_name' => $price->broker_name,
                            'room_type_id' => $price->room_type_id,
                            'room_type' => (string) ($price->roomType?->name ?? ''),
                            'period_start' => $price->period_start?->toDateString(),
                            'period_end' => $price->period_end?->toDateString(),
                            'price' => $price->price,
                        ])
                        ->all(),
                ])
                ->values()
                ->all(),
            'hotel_country_options' => HotelCountry::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelCountry $country): array => [
                    'id' => $country->id,
                    'name' => $country->name,
                ])
                ->values()
                ->all(),
            'hotel_city_options' => HotelCity::query()
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
            'hotel_room_type_options' => HotelRoomType::query()
                ->forProductHotelPricing()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelRoomType $roomType): array => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                ])
                ->values()
                ->all(),
            'hotel_currency_options' => $currencyOptions,
            'product_category_hotel' => [
                'hotels' => Hotel::query()
                    ->with(['country:id,name', 'city:id,name', 'product:id,code', 'prices.roomType:id,name'])
                    ->where('is_active', true)
                    ->when($search !== '', function ($query) use ($search): void {
                        $query->where(function ($inner) use ($search): void {
                            $inner
                                ->where('code', 'like', '%'.$search.'%')
                                ->orWhere('name', 'like', '%'.$search.'%')
                                ->orWhereHas('country', fn ($countryQuery) => $countryQuery->where('name', 'like', '%'.$search.'%'))
                                ->orWhereHas('city', fn ($cityQuery) => $cityQuery->where('name', 'like', '%'.$search.'%'));
                        });
                    })
                    ->when($request->integer('city_id') > 0, fn ($query) => $query->where('city_id', $request->integer('city_id')))
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
                            'prices' => $hotel->prices
                                ->filter(fn ($price): bool => HotelRoomType::isProductHotelPricingName($price->roomType?->name))
                                ->map(fn ($price): array => [
                                    'id' => $price->id,
                                    'broker_key' => $price->broker_key,
                                    'broker_name' => $price->broker_name,
                                    'room_type_id' => $price->room_type_id,
                                    'room_type_name' => $price->roomType?->name,
                                    'period_start' => $price->period_start?->toDateString(),
                                    'period_end' => $price->period_end?->toDateString(),
                                    'price' => $price->price,
                                ])
                                ->values()
                                ->all(),
                        ];
                    }),
                'filters' => [
                    'search' => $search,
                    'city_id' => $request->integer('city_id') > 0 ? (string) $request->integer('city_id') : 'all',
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
                    ->forProductHotelPricing()
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn (HotelRoomType $roomType): array => [
                        'id' => $roomType->id,
                        'name' => $roomType->name,
                    ])
                    ->values()
                    ->all(),
                'currencyOptions' => $currencyOptions,
            ],
        ];
    }
}
