<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageRequest;
use App\Http\Requests\Administrator\StoreScheduleRequest;
use App\Models\Activity;
use App\Models\DepartureSchedule;
use App\Models\PackageItinerary;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        $packages = TravelPackage::query()
            ->with([
                'products:id,code,name,product_type',
                'schedules' => fn ($query) => $query->withSum(
                    ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                    'passenger_count',
                ),
                'testimonials',
                'itineraries.activity:id,code,name,description,sort_order,is_active',
                'itineraries.products:id,code,name,product_type',
            ])
            ->orderBy('code')
            ->get()
            ->map(fn (TravelPackage $pkg) => $this->serializePackage($pkg));

        return Inertia::render('Dashboard/ProductManagement/Packages/Index', [
            'packages' => $packages,
            'productOptions' => $this->productOptions(),
            'activityOptions' => $this->activityOptions(),
        ]);
    }

    public function store(StorePackageRequest $request): RedirectResponse
    {
        $package = TravelPackage::query()->create(
            $this->packagePayload($request)
        );

        $this->syncProducts($package, $request->input('product_ids', []));
        $this->syncItineraries($package, $request->validated('itineraries', []));

        return back()->with('success', 'Package berhasil ditambahkan.');
    }

    public function update(StorePackageRequest $request, TravelPackage $package): RedirectResponse
    {
        $package->update($this->packagePayload($request, $package));
        $this->syncProducts($package, $request->input('product_ids', []));
        $this->syncItineraries($package, $request->validated('itineraries', []));

        return back()->with('success', 'Package berhasil diperbarui.');
    }

    public function destroy(TravelPackage $package): RedirectResponse
    {
        if ($package->image_path && str_starts_with($package->image_path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $package->image_path));
        }

        $package->delete();

        return back()->with('success', 'Package berhasil dihapus.');
    }

    public function storeSchedule(StoreScheduleRequest $request, TravelPackage $package): RedirectResponse
    {
        $schedule = $package->schedules()->create([
            ...$request->validated(),
            'seats_available' => $request->integer('seats_total'),
        ]);
        $schedule->syncSeatAvailability();

        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function updateSchedule(StoreScheduleRequest $request, TravelPackage $package, DepartureSchedule $schedule): RedirectResponse
    {
        abort_if($schedule->travel_package_id !== $package->id, 403);

        $schedule->update([
            ...$request->validated(),
            'seats_available' => $schedule->availableSeatsCount(),
        ]);
        $schedule->syncSeatAvailability();

        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroySchedule(TravelPackage $package, DepartureSchedule $schedule): RedirectResponse
    {
        abort_if($schedule->travel_package_id !== $package->id, 403);

        $schedule->delete();

        return back()->with('success', 'Jadwal berhasil dihapus.');
    }

    public function storeItinerary(Request $request, TravelPackage $package): RedirectResponse
    {
        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'activity_ids' => ['nullable', 'array'],
            'activity_ids.*' => ['integer', 'exists:activities,id'],
            'day_number' => ['required', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'title.id' => ['nullable', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'description.id' => ['nullable', 'string'],
            'description.en' => ['nullable', 'string'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:travel_products,id'],
        ]);

        $activityIds = $this->normalizeActivityIds($data);
        [$title, $description] = $this->resolveItineraryActivityContent(
            $activityIds,
            $data['title'] ?? [],
            $data['description'] ?? [],
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
        abort_if($itinerary->travel_package_id !== $package->id, 403);

        $data = $request->validate([
            'activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'activity_ids' => ['nullable', 'array'],
            'activity_ids.*' => ['integer', 'exists:activities,id'],
            'day_number' => ['nullable', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'title.id' => ['nullable', 'string', 'max:255'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'description.id' => ['nullable', 'string'],
            'description.en' => ['nullable', 'string'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:travel_products,id'],
        ]);

        $activityIds = $this->normalizeActivityIds($data, $itinerary->activity_ids ?? []);
        [$title, $description] = $this->resolveItineraryActivityContent(
            $activityIds,
            $data['title'] ?? ($itinerary->title ?? []),
            $data['description'] ?? ($itinerary->description ?? []),
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
        abort_if($itinerary->travel_package_id !== $package->id, 403);

        $itinerary->delete();

        return back()->with('success', 'Itinerary berhasil dihapus.');
    }

    /** @return array<string, mixed> */
    private function packagePayload(StorePackageRequest $request, ?TravelPackage $existing = null): array
    {
        $imagePath = $existing?->image_path;

        if ($request->hasFile('image')) {
            if ($imagePath && str_starts_with($imagePath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $imagePath));
            }
            $imagePath = '/storage/'.$request->file('image')->store('packages', 'public');
        }

        // Handle both dot-notation (JSON) and bracket-notation (FormData)
        $nameId = $request->input('name.id') ?? $request->input('name')['id'] ?? '';
        $nameEn = $request->input('name.en') ?? $request->input('name')['en'] ?? '';
        $summaryId = $request->input('summary.id') ?? $request->input('summary')['id'] ?? '';
        $summaryEn = $request->input('summary.en') ?? $request->input('summary')['en'] ?? '';

        $name = $this->normalizeLocalizedPayload([
            'id' => $nameId,
            'en' => $nameEn,
        ]);
        $summary = $this->normalizeLocalizedPayload([
            'id' => $summaryId,
            'en' => $summaryEn,
        ]);

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
            'duration_days' => $request->integer('duration_days'),
            'price' => $request->float('price'),
            'original_price' => $request->filled('original_price') ? $request->float('original_price') : null,
            'discount_label' => $request->filled('discount_label') ? $request->string('discount_label')->value() : null,
            'discount_ends_at' => $request->filled('discount_ends_at') ? $request->input('discount_ends_at') : null,
            'currency' => $request->string('currency', 'IDR')->value(),
            'image_path' => $imagePath,
            'summary' => $summary,
            'content' => is_array($request->input('content')) ? $request->input('content') : (json_decode($request->input('content', '{}'), true) ?? []),
            'is_featured' => $request->boolean('is_featured'),
            'is_active' => $request->boolean('is_active', true),
        ];
    }

    /** @param array<int> $productIds */
    private function syncProducts(TravelPackage $package, array $productIds): void
    {
        $syncData = collect($productIds)
            ->filter(fn ($id) => is_numeric($id))
            ->values()
            ->mapWithKeys(fn ($id, $index) => [(int) $id => ['sort_order' => $index + 1]])
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
                    'title' => [
                        'id' => (string) data_get($itinerary, 'title.id', ''),
                        'en' => (string) data_get($itinerary, 'title.en', ''),
                    ],
                    'description' => [
                        'id' => (string) data_get($itinerary, 'description.id', ''),
                        'en' => (string) data_get($itinerary, 'description.en', ''),
                    ],
                    'product_ids' => collect(data_get($itinerary, 'product_ids', []))
                        ->filter(fn ($productId) => is_numeric($productId))
                        ->map(fn ($productId) => (int) $productId)
                        ->values()
                        ->all(),
                ];
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
                $itineraryData['title'] ?? [],
                $itineraryData['description'] ?? [],
            );

            $itinerary = $package->itineraries()->create($itineraryData);
            $this->syncItineraryProducts($itinerary, $productIds);
        });
    }

    /** @param array<int> $productIds */
    private function syncItineraryProducts(PackageItinerary $itinerary, array $productIds): void
    {
        $allowedProductIds = $itinerary->travelPackage()
            ->firstOrFail()
            ->products()
            ->pluck('travel_products.id')
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
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'product_type'])
            ->map(fn (TravelProduct $p) => [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'product_type' => $p->product_type,
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
                'name' => $activity->name ?? [],
                'description' => $activity->description ?? [],
                'sort_order' => $activity->sort_order,
            ])
            ->values()
            ->all();
    }

    /** @return array<string, mixed> */
    private function serializePackage(TravelPackage $pkg): array
    {
        return [
            'id' => $pkg->id,
            'code' => $pkg->code,
            'slug' => $pkg->slug,
            'name' => $pkg->name,
            'package_type' => $pkg->package_type,
            'departure_city' => $pkg->departure_city,
            'duration_days' => $pkg->duration_days,
            'price' => (float) $pkg->price,
            'original_price' => $pkg->original_price ? (float) $pkg->original_price : null,
            'discount_label' => $pkg->discount_label,
            'discount_ends_at' => $pkg->discount_ends_at?->toDateTimeString(),
            'discount_percent' => $pkg->discountPercent(),
            'currency' => $pkg->currency,
            'image_path' => $pkg->image_path,
            'summary' => $pkg->summary,
            'content' => $pkg->content ?? [],
            'is_featured' => $pkg->is_featured,
            'is_active' => $pkg->is_active,
            'product_ids' => $pkg->products->pluck('id')->values()->all(),
            'schedules' => $pkg->schedules->map(fn (DepartureSchedule $s) => [
                'id' => $s->id,
                'departure_date' => $s->departure_date->toDateString(),
                'return_date' => $s->return_date?->toDateString(),
                'departure_city' => $s->departure_city,
                'seats_total' => $s->seats_total,
                'seats_available' => $s->availableSeatsCount(),
                'status' => $s->status,
                'notes' => $s->notes,
                'is_active' => $s->is_active,
            ])->values()->all(),
            'rating_avg' => $pkg->testimonials->avg('rating') ? round($pkg->testimonials->avg('rating'), 1) : null,
            'rating_count' => $pkg->testimonials->count(),
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
                    'title' => $it->title ?? [],
                    'description' => $it->description ?? [],
                    'activity' => $activities[0] ?? ($it->activity ? [
                        'id' => $it->activity->id,
                        'code' => $it->activity->code,
                        'name' => $it->activity->name ?? [],
                        'description' => $it->activity->description ?? [],
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

    /** @param array<int, int> $activityIds
     * @param  array<string, mixed>  $fallbackTitle
     * @param  array<string, mixed>  $fallbackDescription
     * @return array{0: array<string, string>, 1: array<string, string>}
     */
    private function resolveItineraryActivityContent(array $activityIds, array $fallbackTitle = [], array $fallbackDescription = []): array
    {
        $activities = Activity::query()
            ->whereIn('id', $activityIds)
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'description', 'sort_order']);

        if ($activities->isEmpty()) {
            return [
                [
                    'id' => (string) data_get($fallbackTitle, 'id', ''),
                    'en' => (string) data_get($fallbackTitle, 'en', ''),
                ],
                [
                    'id' => (string) data_get($fallbackDescription, 'id', ''),
                    'en' => (string) data_get($fallbackDescription, 'en', ''),
                ],
            ];
        }

        return [
            [
                'id' => $activities->map(fn (Activity $activity) => (string) data_get($activity->name ?? [], 'id', ''))
                    ->filter()
                    ->implode(', '),
                'en' => $activities->map(fn (Activity $activity) => (string) data_get($activity->name ?? [], 'en', ''))
                    ->filter()
                    ->implode(', '),
            ],
            [
                'id' => $activities->map(fn (Activity $activity) => (string) data_get($activity->description ?? [], 'id', ''))
                    ->filter()
                    ->implode("\n"),
                'en' => $activities->map(fn (Activity $activity) => (string) data_get($activity->description ?? [], 'en', ''))
                    ->filter()
                    ->implode("\n"),
            ],
        ];
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
                'name' => $activity->name ?? [],
                'description' => $activity->description ?? [],
                'sort_order' => $activity->sort_order,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array{id?: string, en?: string}  $name
     */
    private function generatePackageCode(array $name, int $durationDays, ?TravelPackage $ignore = null): string
    {
        $source = trim((string) ($name['id'] ?? '')) ?: trim((string) ($name['en'] ?? ''));
        $normalized = Str::upper(Str::slug($source, '-'));
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

    /**
     * @param  array{id?: string, en?: string}  $value
     * @return array{id: string, en: string}
     */
    private function normalizeLocalizedPayload(array $value): array
    {
        $indonesian = trim((string) ($value['id'] ?? ''));
        $english = trim((string) ($value['en'] ?? ''));

        return [
            'id' => $indonesian,
            'en' => $english !== '' ? $english : $indonesian,
        ];
    }
}
