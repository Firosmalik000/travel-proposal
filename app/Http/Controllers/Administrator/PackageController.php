<?php

namespace App\Http\Controllers\Administrator;

use App\Actions\Package\SyncPackageAllInConfig;
use App\Actions\Package\SyncPackageSpecificProducts;
use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageRequest;
use App\Models\Activity;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\PackageItinerary;
use App\Models\PackageVendor;
use App\Models\ProductCategory;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\VendorPricePeriod;
use App\Services\LiveCurrencyRateService;
use App\Services\PackageCurrencySnapshotService;
use App\Services\PackageDraftService;
use App\Services\PackageHppEstimateService;
use App\Support\ParticipantUploadLimit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PackageController extends Controller
{
    public function __construct(
        private readonly PackageHppEstimateService $hppEstimateService,
        private readonly LiveCurrencyRateService $liveCurrencyRateService,
        private readonly PackageCurrencySnapshotService $packageCurrencySnapshotService,
        private readonly SyncPackageAllInConfig $syncPackageAllInConfig,
        private readonly SyncPackageSpecificProducts $syncPackageSpecificProducts,
        private readonly PackageDraftService $packageDraftService,
    ) {}

    public function index(): Response
    {
        $drafts = $this->packageDraftService->allForUser(request()->user());
        $packages = TravelPackage::query()
            ->with($this->packageRelations())
            ->orderBy('code')
            ->get()
            ->map(fn (TravelPackage $pkg) => $this->serializePackage($pkg));

        return Inertia::render('Dashboard/ProductManagement/Packages/Index', [
            'packages' => $packages,
            'packageDrafts' => $drafts
                ->filter(fn ($draft): bool => $draft->package_id !== null)
                ->map(fn ($draft): array => $this->packageDraftService->serializeSummary($draft))
                ->values()
                ->all(),
            'createDraft' => ($createDraft = $drafts->firstWhere('draft_key', 'create'))
                ? $this->packageDraftService->serializeSummary($createDraft)
                : null,
        ]);
    }

    public function create(): Response
    {
        return $this->renderPackagePage('create');
    }

    public function show(TravelPackage $package): Response
    {
        return $this->renderPackagePage('detail', $package);
    }

    public function edit(TravelPackage $package): Response
    {
        return $this->renderPackagePage('edit', $package);
    }

    public function editHppEstimate(TravelPackage $package): Response
    {
        return $this->renderPackagePage('hpp', $package);
    }

    public function store(StorePackageRequest $request): RedirectResponse
    {
        $preparedImages = $this->packageDraftService->prepareImagesForSave(
            $request->user(),
            $request->input('existing_images', []),
        );
        $request->merge(['existing_images' => $preparedImages['images']]);

        try {
            DB::transaction(function () use ($request): void {
                $customProducts = $this->syncSpecificProducts($request);
                $this->mergeSpecificProductsIntoRequest($request, $customProducts);
                $this->removeAllInCoveredProducts($request);

                $package = TravelPackage::query()->create(
                    $this->packagePayload($request)
                );
                $this->syncPackageSpecificProducts->assignOwnership($package, $customProducts['ids']);
                $package->syncSeatAvailability();

                $this->syncProducts(
                    $package,
                    $request->input('product_ids', []),
                    $request->input('product_multipliers', []),
                );
                $this->syncItineraries($package, $request->validated('itineraries', []));
                $this->syncPackageAllInConfig->handle($package, $request->input('all_in'));
                $this->hppEstimateService->refreshForPackage($package);
            });
        } catch (Throwable $exception) {
            $this->packageDraftService->removePromotedImages($preparedImages['promoted_paths']);

            throw $exception;
        }

        $this->packageDraftService->discard($request->user());

        return back()->with('success', 'Package berhasil ditambahkan.');
    }

    public function update(StorePackageRequest $request, TravelPackage $package): RedirectResponse
    {
        $preparedImages = $this->packageDraftService->prepareImagesForSave(
            $request->user(),
            $request->input('existing_images', []),
            $package,
        );
        $request->merge(['existing_images' => $preparedImages['images']]);

        try {
            DB::transaction(function () use ($request, $package): void {
                $customProducts = $this->syncSpecificProducts($request, $package);
                $this->mergeSpecificProductsIntoRequest($request, $customProducts);
                $this->removeAllInCoveredProducts($request);

                $package->update($this->packagePayload($request, $package));
                $package->syncSeatAvailability();
                $this->syncProducts(
                    $package,
                    $request->input('product_ids', []),
                    $request->input('product_multipliers', []),
                );
                $this->syncItineraries($package, $request->validated('itineraries', []));
                $this->syncPackageAllInConfig->handle($package, $request->input('all_in'));
                $this->hppEstimateService->refreshForPackage($package);
            });
        } catch (Throwable $exception) {
            $this->packageDraftService->removePromotedImages($preparedImages['promoted_paths']);

            throw $exception;
        }

        $this->packageDraftService->discard($request->user(), $package);

        return back()->with('success', 'Package berhasil diperbarui.');
    }

    public function updateHppEstimate(StorePackageRequest $request, TravelPackage $package): RedirectResponse
    {
        $package->load('products');
        $request->merge([
            'product_ids' => $package->products->pluck('id')->values()->all(),
            'product_multipliers' => $package->products->mapWithKeys(fn (TravelProduct $product): array => [
                (string) $product->id => (int) ($product->pivot->multiplier_per_pax ?? 1),
            ])->all(),
        ]);

        $payload = $this->packagePayload($request, $package, preserveImages: true);
        $existingContent = is_array($package->content) ? $package->content : [];
        $calculatedContent = is_array($payload['content']) ? $payload['content'] : [];

        foreach ([
            'hpp_estimate',
            'hpp_currency_snapshots',
            'currency_rate_snapshot',
            'room_original_prices',
            'room_prices',
        ] as $financialContentKey) {
            if (array_key_exists($financialContentKey, $calculatedContent)) {
                $existingContent[$financialContentKey] = $calculatedContent[$financialContentKey];
            }
        }

        $package->update([
            'price' => $payload['price'],
            'original_price' => $payload['original_price'],
            'discount_label' => $payload['discount_label'],
            'discount_ends_at' => $payload['discount_ends_at'],
            'currency' => $payload['currency'],
            'content' => $existingContent,
        ]);

        return redirect()
            ->route('hpp-package.index')
            ->with('success', 'Estimasi HPP berhasil diperbarui.');
    }

    public function destroy(TravelPackage $package): RedirectResponse
    {
        $this->packageDraftService->discardAllForPackage($package);
        collect([
            $package->image_path,
            ...(($package->content['gallery'] ?? [])),
        ])
            ->filter(fn (?string $path) => is_string($path) && str_starts_with($path, '/storage/'))
            ->unique()
            ->each(fn (string $path) => Storage::disk('public')->delete(str_replace('/storage/', '', $path)));

        $package->delete();

        return back()->with('success', 'Package berhasil dihapus.');
    }

    public function storeItinerary(Request $request, TravelPackage $package): RedirectResponse
    {
        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'activity_ids' => ['nullable', 'array'],
            'activity_ids.*' => ['integer', 'exists:activities,id'],
            'day_number' => ['required', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $activityIds = $this->normalizeActivityIds($data);
        [$title, $description] = $this->resolveItineraryActivityContent(
            $activityIds,
            (string) ($data['title'] ?? ''),
            (string) ($data['description'] ?? ''),
        );

        $itinerary = $package->itineraries()->updateOrCreate(
            ['day_number' => $data['day_number']],
            [
                'activity_id' => $activityIds[0] ?? null,
                'activity_ids' => $activityIds,
                'sort_order' => $data['sort_order'] ?? $data['day_number'],
                'title' => $title,
                'description' => $description,
            ]
        );

        $this->syncItineraryProducts($itinerary, $data['product_ids'] ?? []);

        return back()->with('success', 'Itinerary berhasil disimpan.');
    }

    public function updateItinerary(Request $request, TravelPackage $package, PackageItinerary $itinerary): RedirectResponse
    {
        abort_if($itinerary->package_id !== $package->id, 403);

        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'activity_ids' => ['nullable', 'array'],
            'activity_ids.*' => ['integer', 'exists:activities,id'],
            'day_number' => ['nullable', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $activityIds = $this->normalizeActivityIds($data, $itinerary->activity_ids ?? []);
        [$title, $description] = $this->resolveItineraryActivityContent(
            $activityIds,
            (string) ($data['title'] ?? ($itinerary->title ?? '')),
            (string) ($data['description'] ?? ($itinerary->description ?? '')),
        );

        $itinerary->update([
            'activity_id' => $activityIds[0] ?? null,
            'activity_ids' => $activityIds,
            'day_number' => $data['day_number'] ?? $itinerary->day_number,
            'sort_order' => $data['sort_order'] ?? ($data['day_number'] ?? $itinerary->day_number),
            'title' => $title,
            'description' => $description,
        ]);
        $this->syncItineraryProducts($itinerary, $data['product_ids'] ?? []);

        return back()->with('success', 'Itinerary berhasil diperbarui.');
    }

    public function destroyItinerary(TravelPackage $package, PackageItinerary $itinerary): RedirectResponse
    {
        abort_if($itinerary->package_id !== $package->id, 403);

        $itinerary->delete();

        return back()->with('success', 'Itinerary berhasil dihapus.');
    }

    /** @return array<string, mixed> */
    private function packagePayload(
        StorePackageRequest $request,
        ?TravelPackage $existing = null,
        bool $preserveImages = false,
    ): array {
        $existingImages = $preserveImages && $existing !== null
            ? collect([
                $existing->image_path,
                ...data_get($existing->content, 'gallery', []),
            ])->filter()->values()->all()
            : $request->input('existing_images', []);
        $allImages = $existingImages;

        // Collect existing images that were kept
        if (! empty($existingImages)) {
            $allImages = $existingImages;
        }

        // Handle old images deletion
        $oldImages = [];
        if ($existing) {
            if ($existing->image_path) {
                $oldImages[] = $existing->image_path;
            }
            if (isset($existing->content['gallery']) && is_array($existing->content['gallery'])) {
                $oldImages = array_merge($oldImages, $existing->content['gallery']);
            }
        }

        if (! $preserveImages) {
            foreach ($oldImages as $oldImage) {
                if (! in_array($oldImage, $existingImages) && str_starts_with($oldImage, '/storage/')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $oldImage));
                }
            }

            // Handle newly uploaded images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $path = '/storage/'.$file->store('packages', 'public');
                    $allImages[] = $path;
                }
            }

            // Legacy support for single 'image' if sent
            if ($request->hasFile('image')) {
                $path = '/storage/'.$request->file('image')->store('packages', 'public');
                array_unshift($allImages, $path);
            }
        }

        $imagePath = $allImages[0] ?? null;
        $gallery = array_slice($allImages, 1);

        $name = trim((string) $request->string('name')->value());
        $summary = $request->filled('summary') ? $request->string('summary')->value() : null;

        $content = is_array($request->input('content'))
            ? $request->input('content')
            : (json_decode($request->input('content', '{}'), true) ?? []);

        $originalPrice = $request->filled('original_price')
            ? $request->float('original_price')
            : null;
        $sellingPrice = $request->float('price');
        $content = $this->applyDiscountToRoomPrices(
            $content,
            $originalPrice,
            $sellingPrice,
        );

        $currencyCode = strtoupper($request->string('currency', 'IDR')->value());
        $submittedSnapshots = collect(data_get($content, 'hpp_currency_snapshots', []))
            ->filter(fn (mixed $snapshot): bool => is_array($snapshot) && (float) data_get($snapshot, 'rate_to_idr', 0) > 0)
            ->mapWithKeys(function (array $snapshot, string $code): array {
                $currency = strtoupper(trim($code));

                return [$currency => [
                    'currency' => $currency,
                    'rate_to_idr' => (float) data_get($snapshot, 'rate_to_idr'),
                    'source' => (string) data_get($snapshot, 'source', 'manual'),
                    'fetched_at' => data_get($snapshot, 'fetched_at'),
                ]];
            })
            ->all();
        $additionalCurrencyCodes = collect($this->operationalCurrencyCodes($content))
            ->when(
                $request->boolean('all_in.enabled'),
                fn ($currencies) => $currencies->push((string) $request->input('all_in.currency')),
            )
            ->filter()
            ->unique()
            ->values()
            ->all();

        if ($existing === null || $request->boolean('refresh_currency_rates')) {
            $currencySnapshots = array_replace(
                $this->packageCurrencySnapshotService->capture(
                    $request->input('product_ids', []),
                    $currencyCode,
                    $additionalCurrencyCodes,
                ),
                $submittedSnapshots,
            );
        } else {
            $currencySnapshots = array_replace(
                $this->packageCurrencySnapshotService->capture(
                    $request->input('product_ids', []),
                    $currencyCode,
                    $additionalCurrencyCodes,
                ),
                is_array(data_get($existing->content, 'hpp_currency_snapshots'))
                    ? data_get($existing->content, 'hpp_currency_snapshots')
                    : [],
                $submittedSnapshots,
            );
        }

        $currencyRate = $currencySnapshots[$currencyCode]
            ?? data_get($existing?->content, 'currency_rate_snapshot')
            ?? ($existing === null ? $this->liveCurrencyRateService->rateFor($currencyCode) : [
                'rate_to_idr' => 0,
                'source' => 'unavailable',
                'fetched_at' => null,
            ]);
        $content['hpp_currency_snapshots'] = $currencySnapshots;
        $content['currency_rate_snapshot'] = [
            'currency' => $currencyCode,
            'rate_to_idr' => $currencyRate['rate_to_idr'],
            'source' => $currencyRate['source'],
            'fetched_at' => $currencyRate['fetched_at'],
        ];

        if (is_array(data_get($content, 'hpp_estimate'))) {
            $selectedProductIds = collect($request->input('product_ids', []))
                ->filter(fn (mixed $productId): bool => is_numeric($productId))
                ->map(fn (mixed $productId): int => (int) $productId)
                ->values();
            $selectedProducts = TravelProduct::query()
                ->includingPackageSpecific()
                ->whereIn('id', $selectedProductIds)
                ->get()
                ->sortBy(fn (TravelProduct $product): int => $selectedProductIds->search($product->id))
                ->values();
            $estimatePayload = data_get($content, 'hpp_estimate', []);
            $hasManualCustomerAssumption = (bool) data_get($estimatePayload, 'customers_is_manual', false);
            $estimatedCustomerCount = collect(data_get($estimatePayload, 'customers', []))
                ->filter(fn (mixed $count): bool => is_numeric($count))
                ->sum(fn (mixed $count): int => max(0, (int) $count));

            if (! $hasManualCustomerAssumption && $estimatedCustomerCount === 0) {
                $estimatePayload['customers'] = [
                    'single' => 0,
                    'dbl' => $request->integer('seats_total'),
                    'trpl' => 0,
                    'quad' => 0,
                ];
                $estimatePayload['customers_is_manual'] = false;
            }

            $content['hpp_estimate'] = $this->hppEstimateService->calculate(
                $estimatePayload,
                (int) round($sellingPrice),
                data_get($content, 'room_prices', []),
                $currencyRate['rate_to_idr'],
                $currencyCode,
                $currencyRate['source'],
                $currencyRate['fetched_at'],
                $selectedProducts,
                $request->input('product_multipliers', []),
                $request->date('start_date')?->toDateString(),
                data_get($content, 'hotel_product_brokers', []),
                $currencySnapshots,
                $this->allInEstimatePayload($request),
            );
        }

        // Add gallery to content
        $content['gallery'] = $gallery;

        return [
            'code' => $this->generatePackageCode(
                $name,
                $request->integer('duration_days'),
                $existing,
            ),
            'slug' => $request->string('slug')->value(),
            'name' => $name,
            'package_type' => $request->string('package_type')->value(),
            'departure_city' => $request->string('departure_city')->value(),
            'start_date' => $request->date('start_date')?->toDateString(),
            'end_date' => $request->date('end_date')?->toDateString(),
            'seats_total' => $request->integer('seats_total'),
            'seats_available' => $existing
                ? max($request->integer('seats_total') - $existing->bookedPassengerCount(), 0)
                : $request->integer('seats_total'),
            'booking_status' => $request->string('booking_status')->value(),
            'departure_notes' => $request->filled('departure_notes') ? $request->string('departure_notes')->value() : null,
            'duration_days' => $request->integer('duration_days'),
            'price' => $sellingPrice,
            'original_price' => $originalPrice,
            'discount_type' => $request->filled('discount_type') ? $request->string('discount_type')->value() : 'percent',
            'discount_nominal' => $request->filled('discount_nominal') ? $request->float('discount_nominal') : null,
            'discount_label' => $request->filled('discount_label') ? $request->string('discount_label')->value() : null,
            'discount_ends_at' => $request->filled('discount_ends_at') ? $request->input('discount_ends_at') : null,
            'currency' => $currencyCode,
            'image_path' => $imagePath,
            'summary' => $summary,
            'content' => $content,
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active', true),
        ];
    }

    /**
     * @param  array<int>  $productIds
     * @param  array<string|int, mixed>  $productMultipliers
     */
    private function syncProducts(TravelPackage $package, array $productIds, array $productMultipliers = []): void
    {
        $syncData = collect($productIds)
            ->filter(fn ($id) => is_numeric($id))
            ->values()
            ->mapWithKeys(function ($id, $index) use ($productMultipliers): array {
                $multiplier = $productMultipliers[(string) $id] ?? $productMultipliers[(int) $id] ?? 1;

                return [
                    (int) $id => [
                        'sort_order' => $index + 1,
                        'multiplier_per_pax' => max(1, (int) $multiplier),
                    ],
                ];
            })
            ->all();

        $package->products()->sync($syncData);
    }

    /** @param array<int, array<string, mixed>> $itineraries */
    private function syncItineraries(TravelPackage $package, array $itineraries): void
    {
        $normalizedItineraries = collect($itineraries)
            ->filter(fn ($itinerary) => is_array($itinerary) && isset($itinerary['day_number']) && is_numeric($itinerary['day_number']))
            ->map(function (array $itinerary): array {
                $dayNumber = (int) $itinerary['day_number'];

                return [
                    'activity_id' => isset($itinerary['activity_id']) && is_numeric($itinerary['activity_id']) ? (int) $itinerary['activity_id'] : null,
                    'activity_ids' => $this->normalizeActivityIds($itinerary),
                    'day_number' => $dayNumber,
                    'sort_order' => isset($itinerary['sort_order']) && is_numeric($itinerary['sort_order']) ? (int) $itinerary['sort_order'] : $dayNumber,
                    'title' => (string) data_get($itinerary, 'title', ''),
                    'description' => (string) data_get($itinerary, 'description', ''),
                    'product_ids' => collect(data_get($itinerary, 'product_ids', []))
                        ->filter(fn ($productId) => is_numeric($productId))
                        ->map(fn ($productId) => (int) $productId)
                        ->values()
                        ->all(),
                ];
            })
            ->filter(function (array $itinerary): bool {
                $hasActivities = ! empty($itinerary['activity_ids']);
                $hasProducts = ! empty($itinerary['product_ids']);
                $hasText = trim((string) ($itinerary['title'] ?? '')) !== '' || trim((string) ($itinerary['description'] ?? '')) !== '';

                return $hasActivities || $hasProducts || $hasText;
            })
            ->sortBy('sort_order')
            ->values();

        $package->itineraries()->each(function (PackageItinerary $itinerary): void {
            $itinerary->products()->detach();
            $itinerary->delete();
        });

        if ($normalizedItineraries->isEmpty()) {
            return;
        }

        $normalizedItineraries->each(function (array $itineraryData) use ($package): void {
            $productIds = $itineraryData['product_ids'];
            unset($itineraryData['product_ids']);

            $itineraryData['activity_id'] = $itineraryData['activity_ids'][0] ?? null;
            [$itineraryData['title'], $itineraryData['description']] = $this->resolveItineraryActivityContent(
                $itineraryData['activity_ids'] ?? [],
                (string) ($itineraryData['title'] ?? ''),
                (string) ($itineraryData['description'] ?? ''),
            );

            $itinerary = $package->itineraries()->create($itineraryData);
            $this->syncItineraryProducts($itinerary, $productIds);
        });
    }

    /** @param array<int> $productIds */
    private function syncItineraryProducts(PackageItinerary $itinerary, array $productIds): void
    {
        $allowedProductIds = $itinerary->package()
            ->firstOrFail()
            ->products()
            ->pluck('products.id')
            ->all();

        $syncData = collect($productIds)
            ->filter(fn ($productId) => is_numeric($productId) && in_array((int) $productId, $allowedProductIds, true))
            ->values()
            ->mapWithKeys(fn ($productId, $index) => [(int) $productId => ['sort_order' => $index + 1]])
            ->all();

        $itinerary->products()->sync($syncData);
    }

    /** @return array<int, array<string, mixed>> */
    private function productOptions(): array
    {
        return TravelProduct::query()
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'product_type', 'content'])
            ->map(function (TravelProduct $product): array {
                $pricing = collect(data_get($product->content, 'pricing', []))
                    ->filter(fn ($item) => is_array($item))
                    ->map(fn (array $item): array => [
                        'broker_name' => $item['broker_name'] ?? null,
                        'room_type' => $item['room_type'] ?? null,
                        'period_start' => $item['period_start'] ?? null,
                        'period_end' => $item['period_end'] ?? null,
                        'price' => isset($item['price']) && is_numeric($item['price']) ? (float) $item['price'] : null,
                    ])
                    ->values()
                    ->all();

                return [
                    'id' => $product->id,
                    'code' => $product->code,
                    'name' => $product->name,
                    'product_type' => $product->product_type,
                    'currency' => data_get($product->content, 'currency', 'IDR'),
                    'price' => data_get($product->content, 'price') !== null && is_numeric(data_get($product->content, 'price'))
                        ? (float) data_get($product->content, 'price')
                        : null,
                    'hotel_info' => $product->product_type === 'hotel'
                        ? [
                            'city' => data_get($product->content, 'city'),
                            'country' => data_get($product->content, 'country'),
                            'currency' => data_get($product->content, 'currency'),
                            'pricing' => $pricing,
                        ]
                        : null,
                    'is_package_specific' => false,
                ];
            })
            ->values()
            ->all();
    }

    private function renderPackagePage(string $mode, ?TravelPackage $package = null): Response
    {
        if ($package !== null) {
            $package->load($this->packageRelations());
        }

        return Inertia::render('Dashboard/ProductManagement/Packages/Page', [
            'mode' => $mode,
            'package' => $package !== null ? $this->serializePackage($package) : null,
            'productOptions' => $this->productOptions(),
            'currencies' => $this->currencyOptions(),
            'activityOptions' => $this->activityOptions(),
            'productCategories' => $this->productCategoryOptions(),
            'hotelCountries' => $this->hotelCountryOptions(),
            'hotelCities' => $this->hotelCityOptions(),
            'vendors' => $this->vendorOptions(),
            'draft' => in_array($mode, ['create', 'edit'], true)
                ? (($draft = $this->packageDraftService->findForUser(request()->user(), $package))
                    ? $this->packageDraftService->serialize($draft)
                    : null)
                : null,
            'packageImageUploadMaxKilobytes' => ParticipantUploadLimit::kilobytes(4096),
        ]);
    }

    /** @return array<int, string> */
    private function packageRelations(): array
    {
        return [
            'products:id,code,name,product_type,description,content,visibility,package_id',
            'allInConfig',
            'testimonials',
            'itineraries.activity:id,code,name,description,sort_order,is_active',
            'itineraries.products:id,code,name,product_type',
        ];
    }

    /** @return array<int, array{code:string,name:string,conversion_rate:float,live_conversion_rate:float,rate_source:string,rate_fetched_at:?string,is_live:bool}> */
    private function currencyOptions(): array
    {
        return $this->liveCurrencyRateService->options();
    }

    /** @return array<int, array{id:int,name:string}> */
    private function hotelCountryOptions(): array
    {
        return HotelCountry::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (HotelCountry $country): array => [
                'id' => $country->id,
                'name' => $country->name,
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array{id:int,country_id:int,name:string,country_name:string}> */
    private function hotelCityOptions(): array
    {
        return HotelCity::query()
            ->with('country:id,name')
            ->where('is_active', true)
            ->whereHas('country', fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get(['id', 'country_id', 'name'])
            ->map(fn (HotelCity $city): array => [
                'id' => $city->id,
                'country_id' => $city->country_id,
                'name' => $city->name,
                'country_name' => $city->country?->name ?? '',
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function activityOptions(): array
    {
        return Activity::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'description', 'sort_order'])
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'code' => $activity->code,
                'name' => $activity->name,
                'description' => $activity->description,
                'sort_order' => $activity->sort_order,
            ])
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function serializePackage(TravelPackage $pkg): array
    {
        $content = is_array($pkg->content) ? $pkg->content : [];
        $currentHppEstimate = $this->hppEstimateService->calculateForPackage($pkg);
        if ($currentHppEstimate !== null) {
            $content['hpp_estimate'] = $currentHppEstimate;
        }

        return [
            'id' => $pkg->id,
            'code' => $pkg->code,
            'slug' => $pkg->slug,
            'name' => $pkg->name,
            'package_type' => $pkg->package_type,
            'departure_city' => $pkg->departure_city,
            'start_date' => $pkg->start_date?->toDateString(),
            'end_date' => $pkg->end_date?->toDateString(),
            'seats_total' => (int) $pkg->seats_total,
            'seats_available' => $pkg->availableSeatsCount(),
            'booking_status' => $pkg->booking_status,
            'departure_notes' => $pkg->departure_notes,
            'duration_days' => $pkg->duration_days,
            'price' => (float) $pkg->price,
            'original_price' => $pkg->original_price ? (float) $pkg->original_price : null,
            'discount_type' => $pkg->discount_type ?? 'percent',
            'discount_nominal' => $pkg->discount_nominal ? (float) $pkg->discount_nominal : null,
            'discount_label' => $pkg->discount_label,
            'discount_ends_at' => $pkg->discount_ends_at?->toDateTimeString(),
            'discount_percent' => $pkg->discountPercent(),
            'currency' => $pkg->currency,
            'image_path' => $pkg->image_path,
            'images' => array_filter([
                $pkg->image_path,
                ...($pkg->content['gallery'] ?? []),
            ]),
            'summary' => $pkg->summary,
            'content' => $content,
            'all_in' => $pkg->allInConfig ? [
                'enabled' => true,
                'vendor_id' => $pkg->allInConfig->package_vendor_id,
                'period_id' => $pkg->allInConfig->vendor_price_period_id,
                'broker_package_name' => $pkg->allInConfig->broker_package_name,
                'currency' => $pkg->allInConfig->currency,
                'price_per_pax' => (float) $pkg->allInConfig->price_per_pax,
                'included_category_keys' => $pkg->allInConfig->included_category_keys ?? [],
                'vendor_name_snapshot' => $pkg->allInConfig->vendor_name_snapshot,
                'period_label_snapshot' => $pkg->allInConfig->period_label_snapshot,
                'period_start_snapshot' => $pkg->allInConfig->period_start_snapshot?->toDateString(),
                'period_end_snapshot' => $pkg->allInConfig->period_end_snapshot?->toDateString(),
            ] : [
                'enabled' => false,
                'vendor_id' => null,
                'period_id' => null,
                'broker_package_name' => '',
                'currency' => 'IDR',
                'price_per_pax' => null,
                'included_category_keys' => [],
            ],
            'is_featured' => $pkg->is_featured,
            'is_active' => $pkg->is_active,
            'product_ids' => $pkg->products
                ->where('visibility', TravelProduct::VISIBILITY_MASTER)
                ->pluck('id')
                ->values()
                ->all(),
            'product_multipliers' => $pkg->products
                ->where('visibility', TravelProduct::VISIBILITY_MASTER)
                ->mapWithKeys(fn (TravelProduct $product) => [
                    (string) $product->id => (int) ($product->pivot->multiplier_per_pax ?? 1),
                ])
                ->all(),
            'custom_products' => $pkg->products
                ->where('visibility', TravelProduct::VISIBILITY_PACKAGE)
                ->map(fn (TravelProduct $product): array => $this->serializeSpecificProduct($product))
                ->values()
                ->all(),
            'rating_avg' => $pkg->testimonials->where('is_active', true)->avg('rating')
                ? round($pkg->testimonials->where('is_active', true)->avg('rating'), 1)
                : null,
            'rating_count' => $pkg->testimonials->where('is_active', true)->count(),
            'itineraries' => $pkg->itineraries->map(function (PackageItinerary $it): array {
                $activities = $this->resolveActivitiesForItinerary($it);

                return [
                    'id' => $it->id,
                    'activity_id' => $it->activity_id,
                    'activity_ids' => collect($it->activity_ids ?? [])
                        ->filter(fn ($activityId) => is_numeric($activityId))
                        ->map(fn ($activityId) => (int) $activityId)
                        ->values()
                        ->all(),
                    'day_number' => $it->day_number,
                    'sort_order' => $it->sort_order,
                    'title' => $it->title,
                    'description' => $it->description,
                    'activity' => $activities[0] ?? ($it->activity ? [
                        'id' => $it->activity->id,
                        'code' => $it->activity->code,
                        'name' => $it->activity->name,
                        'description' => $it->activity->description,
                        'sort_order' => $it->activity->sort_order,
                    ] : null),
                    'activities' => $activities,
                    'product_ids' => $it->products->pluck('id')->values()->all(),
                    'products' => $it->products->map(fn (TravelProduct $product) => [
                        'id' => $product->id,
                        'code' => $product->code,
                        'name' => $product->name,
                        'product_type' => $product->product_type,
                    ])->values()->all(),
                ];
            })->values()->all(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function vendorOptions(): array
    {
        return PackageVendor::query()
            ->with(['pricePeriods' => fn ($query) => $query->orderBy('start_date')])
            ->orderBy('name')
            ->get()
            ->map(fn (PackageVendor $vendor): array => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'phone' => $vendor->phone,
                'periods' => $vendor->pricePeriods->map(fn ($period): array => [
                    'id' => $period->id,
                    'label' => $period->label,
                    'start_date' => $period->start_date?->toDateString(),
                    'end_date' => $period->end_date?->toDateString(),
                    'currency' => $period->currency,
                    'price_per_pax' => (float) $period->price_per_pax,
                    'notes' => $period->notes,
                    'is_active' => $period->is_active,
                ])->values()->all(),
            ])->values()->all();
    }

    /** @return array<int, array{id:int,key:string,name:mixed}> */
    private function productCategoryOptions(): array
    {
        return ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'name'])
            ->map(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'key' => $category->key,
                'name' => $category->name,
            ])->values()->all();
    }

    /**
     * @return array{
     *     ids: array<int, int>,
     *     multipliers: array<string, int>,
     *     id_map: array<string, int>,
     *     products: Collection<int, TravelProduct>
     * }
     */
    private function syncSpecificProducts(
        StorePackageRequest $request,
        ?TravelPackage $package = null,
    ): array {
        $coveredCategoryKeys = $request->boolean('all_in.enabled')
            ? collect($request->input('all_in.included_category_keys', []))
            : collect();
        $items = collect($request->input('custom_products', []))
            ->filter(fn (mixed $item): bool => is_array($item))
            ->reject(fn (array $item): bool => $coveredCategoryKeys->contains($item['product_type'] ?? null))
            ->values()
            ->all();

        return $this->syncPackageSpecificProducts->handle($package, $items);
    }

    /**
     * @param  array{
     *     ids: array<int, int>,
     *     multipliers: array<string, int>,
     *     id_map: array<string, int>
     * }  $specificProducts
     */
    private function mergeSpecificProductsIntoRequest(
        StorePackageRequest $request,
        array $specificProducts,
    ): void {
        $masterProductIds = collect($request->input('product_ids', []))
            ->filter(fn (mixed $id): bool => is_numeric($id))
            ->map(fn (mixed $id): int => (int) $id)
            ->values()
            ->all();
        $content = $request->input('content', []);
        $content = is_array($content)
            ? $this->remapSpecificProductContentKeys($content, $specificProducts['id_map'])
            : [];

        $request->merge([
            'product_ids' => array_values(array_unique([
                ...$masterProductIds,
                ...$specificProducts['ids'],
            ])),
            'product_multipliers' => array_replace(
                $request->input('product_multipliers', []),
                $specificProducts['multipliers'],
            ),
            'content' => $content,
        ]);
    }

    /**
     * @param  array<string, mixed>  $content
     * @param  array<string, int>  $idMap
     * @return array<string, mixed>
     */
    private function remapSpecificProductContentKeys(array $content, array $idMap): array
    {
        foreach ([
            'hotel_product_brokers',
            'hpp_estimate.product_quantities',
            'hpp_estimate.product_quantities_is_manual',
            'hpp_estimate.hotel_allocations',
            'hpp_estimate.hotel_allocations_is_manual',
        ] as $path) {
            $values = data_get($content, $path);
            if (! is_array($values)) {
                continue;
            }

            $remapped = [];
            foreach ($values as $key => $value) {
                $resolvedKey = (string) ($idMap[(string) $key] ?? $key);
                $remapped[$resolvedKey] = $value;
            }

            data_set($content, $path, $remapped);
        }

        return $content;
    }

    /** @return array<string, mixed> */
    private function serializeSpecificProduct(TravelProduct $product): array
    {
        return [
            'id' => $product->id,
            'client_key' => (string) $product->id,
            'estimate_id' => $product->id,
            'name' => $product->name,
            'product_type' => $product->product_type,
            'description' => $product->description ?? '',
            'currency' => strtoupper((string) data_get($product->content, 'currency', 'IDR')),
            'price' => data_get($product->content, 'price') !== null
                ? (float) data_get($product->content, 'price')
                : null,
            'multiplier_per_pax' => (int) ($product->pivot->multiplier_per_pax ?? 1),
            'country_id' => data_get($product->content, 'country_id') !== null
                ? (int) data_get($product->content, 'country_id')
                : null,
            'city_id' => data_get($product->content, 'city_id') !== null
                ? (int) data_get($product->content, 'city_id')
                : null,
            'country' => (string) data_get($product->content, 'country', ''),
            'city' => (string) data_get($product->content, 'city', ''),
            'pricing' => collect(data_get($product->content, 'pricing', []))
                ->filter(fn (mixed $row): bool => is_array($row))
                ->values()
                ->all(),
        ];
    }

    private function removeAllInCoveredProducts(StorePackageRequest $request): void
    {
        if (! $request->boolean('all_in.enabled')) {
            return;
        }

        $coveredCategoryKeys = collect($request->input('all_in.included_category_keys', []));
        $requestedProductIds = collect($request->input('product_ids', []))
            ->filter(fn (mixed $productId): bool => is_numeric($productId))
            ->map(fn (mixed $productId): int => (int) $productId)
            ->unique()
            ->values();
        $productsById = TravelProduct::query()
            ->includingPackageSpecific()
            ->whereIn('id', $requestedProductIds)
            ->get(['id', 'product_type'])
            ->keyBy('id');
        $allowedProductIds = $requestedProductIds
            ->filter(function (int $productId) use ($productsById, $coveredCategoryKeys): bool {
                $product = $productsById->get($productId);

                return $product !== null && ! $coveredCategoryKeys->contains($product->product_type);
            })
            ->all();
        $content = $request->input('content', []);

        if (is_array($content)) {
            data_set(
                $content,
                'hotel_product_brokers',
                collect(data_get($content, 'hotel_product_brokers', []))
                    ->only(array_map('strval', $allowedProductIds))
                    ->all(),
            );
        }

        $request->merge([
            'product_ids' => $allowedProductIds,
            'product_multipliers' => collect($request->input('product_multipliers', []))
                ->only(array_map('strval', $allowedProductIds))
                ->all(),
            'content' => $content,
        ]);
    }

    /** @return array<string, mixed> */
    private function allInEstimatePayload(StorePackageRequest $request): array
    {
        $configuration = $request->input('all_in', []);
        if (! $request->boolean('all_in.enabled')) {
            return is_array($configuration) ? $configuration : [];
        }

        $vendor = PackageVendor::query()->find($request->integer('all_in.vendor_id'));
        $period = VendorPricePeriod::query()->find($request->integer('all_in.period_id'));

        return [
            ...(is_array($configuration) ? $configuration : []),
            'vendor_name_snapshot' => $vendor?->name,
            'period_label_snapshot' => $period?->label,
            'period_start_snapshot' => $period?->start_date?->toDateString(),
            'period_end_snapshot' => $period?->end_date?->toDateString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function applyDiscountToRoomPrices(array $content, ?float $originalPrice, float $sellingPrice): array
    {
        $roomOriginalPrices = data_get($content, 'room_original_prices', []);
        if (! is_array($roomOriginalPrices)) {
            return $content;
        }

        $discountRatio = 1.0;
        if ($originalPrice !== null && $originalPrice > 0 && $sellingPrice > 0 && $sellingPrice < $originalPrice) {
            $discountRatio = $sellingPrice / $originalPrice;
        }

        $roomPrices = [];
        foreach (['dbl', 'trpl', 'quad'] as $roomType) {
            $originalRoomPrice = data_get($roomOriginalPrices, $roomType);

            if (! is_numeric($originalRoomPrice)) {
                $roomPrices[$roomType] = null;

                continue;
            }

            $roomPrices[$roomType] = (int) round(((float) $originalRoomPrice) * $discountRatio);
        }

        $content['room_prices'] = $roomPrices;

        return $content;
    }

    /** @param array<string, mixed> $data
     * @param  array<int, int>  $fallback
     * @return array<int, int>
     */
    private function normalizeActivityIds(array $data, array $fallback = []): array
    {
        $activityIds = collect($data['activity_ids'] ?? [])
            ->filter(fn ($activityId) => is_numeric($activityId))
            ->map(fn ($activityId) => (int) $activityId);

        if ($activityIds->isEmpty() && isset($data['activity_id']) && is_numeric($data['activity_id'])) {
            $activityIds = collect([(int) $data['activity_id']]);
        }

        if ($activityIds->isEmpty() && ! empty($fallback)) {
            $activityIds = collect($fallback)
                ->filter(fn ($activityId) => is_numeric($activityId))
                ->map(fn ($activityId) => (int) $activityId);
        }

        return $activityIds->unique()->values()->all();
    }

    /**
     * @param  array<int, int>  $activityIds
     * @return array{0: string, 1: string}
     */
    private function resolveItineraryActivityContent(array $activityIds, string $fallbackTitle = '', string $fallbackDescription = ''): array
    {
        $activities = Activity::query()
            ->whereIn('id', $activityIds)
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'description', 'sort_order']);

        if ($activities->isEmpty()) {
            return [
                $fallbackTitle,
                $fallbackDescription,
            ];
        }

        return [
            $activities
                ->map(fn (Activity $activity) => $this->localizedText($activity->name))
                ->filter()
                ->implode(', '),
            $activities
                ->map(fn (Activity $activity) => $this->localizedText($activity->description))
                ->filter()
                ->implode("\n"),
        ];
    }

    private function localizedText(mixed $value): string
    {
        if (is_string($value)) {
            return trim($value);
        }

        if (! is_array($value)) {
            return '';
        }

        return trim((string) ($value['id'] ?? $value['en'] ?? ''));
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<int, string>
     */
    private function operationalCurrencyCodes(array $content): array
    {
        $configuration = data_get($content, 'hpp_estimate.operational_costs');
        if (! is_array($configuration)) {
            return [];
        }

        return collect([
            data_get($configuration, 'muthawwif.currency'),
            ...collect(data_get($configuration, 'guide_tips', []))
                ->pluck('currency')
                ->all(),
            ...collect(data_get($configuration, 'driver_tips', []))
                ->pluck('currency')
                ->all(),
        ])
            ->filter(fn (mixed $currency): bool => is_string($currency) && trim($currency) !== '')
            ->map(fn (string $currency): string => strtoupper(trim($currency)))
            ->unique()
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function resolveActivitiesForItinerary(PackageItinerary $itinerary): array
    {
        $activityIds = collect($itinerary->activity_ids ?? [])
            ->filter(fn ($activityId) => is_numeric($activityId))
            ->map(fn ($activityId) => (int) $activityId)
            ->values();

        if ($activityIds->isEmpty() && $itinerary->activity_id) {
            $activityIds = collect([$itinerary->activity_id]);
        }

        return Activity::query()
            ->whereIn('id', $activityIds->all())
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'description', 'sort_order'])
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'code' => $activity->code,
                'name' => $activity->name,
                'description' => $activity->description,
                'sort_order' => $activity->sort_order,
            ])
            ->values()
            ->all();
    }

    private function generatePackageCode(string $name, int $durationDays, ?TravelPackage $ignore = null): string
    {
        $normalized = Str::upper(Str::slug($name, '-'));
        $normalized = $normalized !== '' ? Str::limit($normalized, 38, '') : 'PACKAGE';

        $baseCode = 'ASF-'.$normalized.($durationDays > 0 ? '-'.$durationDays : '');
        $candidate = $baseCode;
        $suffix = 2;

        while (
            TravelPackage::query()
                ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->getKey()))
                ->where('code', $candidate)
                ->exists()
        ) {
            $candidate = Str::limit($baseCode, 44, '').'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
