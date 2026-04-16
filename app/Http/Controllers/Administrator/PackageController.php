<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StorePackageRequest;
use App\Http\Requests\Administrator\StoreScheduleRequest;
use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(): Response
    {
        $packages = TravelPackage::query()
            ->with(['products:id,code,name,product_type', 'schedules', 'testimonials'])
            ->orderBy('code')
            ->get()
            ->map(fn (TravelPackage $pkg) => $this->serializePackage($pkg));

        return Inertia::render('Dashboard/ProductManagement/Packages/Index', [
            'packages' => $packages,
            'productOptions' => $this->productOptions(),
        ]);
    }

    public function store(StorePackageRequest $request): RedirectResponse
    {
        $package = TravelPackage::query()->create(
            $this->packagePayload($request)
        );

        $this->syncProducts($package, $request->input('product_ids', []));

        return back()->with('success', 'Package berhasil ditambahkan.');
    }

    public function update(StorePackageRequest $request, TravelPackage $package): RedirectResponse
    {
        $package->update($this->packagePayload($request, $package));
        $this->syncProducts($package, $request->input('product_ids', []));

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
        $package->schedules()->create($request->validated());

        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function updateSchedule(StoreScheduleRequest $request, TravelPackage $package, DepartureSchedule $schedule): RedirectResponse
    {
        abort_if($schedule->travel_package_id !== $package->id, 403);

        $schedule->update($request->validated());

        return back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroySchedule(TravelPackage $package, DepartureSchedule $schedule): RedirectResponse
    {
        abort_if($schedule->travel_package_id !== $package->id, 403);

        $schedule->delete();

        return back()->with('success', 'Jadwal berhasil dihapus.');
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

        return [
            'code' => $request->string('code')->value(),
            'slug' => $request->string('slug')->value(),
            'name' => ['id' => $nameId, 'en' => $nameEn],
            'package_type' => $request->string('package_type')->value(),
            'departure_city' => $request->string('departure_city')->value(),
            'duration_days' => $request->integer('duration_days'),
            'price' => $request->float('price'),
            'original_price' => $request->filled('original_price') ? $request->float('original_price') : null,
            'discount_label' => $request->filled('discount_label') ? $request->string('discount_label')->value() : null,
            'discount_ends_at' => $request->filled('discount_ends_at') ? $request->input('discount_ends_at') : null,
            'currency' => $request->string('currency', 'IDR')->value(),
            'image_path' => $imagePath,
            'summary' => ['id' => $summaryId, 'en' => $summaryEn],
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
                'seats_available' => $s->seats_available,
                'status' => $s->status,
                'notes' => $s->notes,
                'is_active' => $s->is_active,
            ])->values()->all(),
            'rating_avg' => $pkg->testimonials->avg('rating') ? round($pkg->testimonials->avg('rating'), 1) : null,
            'rating_count' => $pkg->testimonials->count(),
        ];
    }
}
