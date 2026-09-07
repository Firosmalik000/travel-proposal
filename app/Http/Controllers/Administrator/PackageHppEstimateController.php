<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Requests\Administrator\RefreshPackageProductPricesRequest;
use App\Http\Requests\Administrator\UpdatePackageHppEstimateRequest;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Services\PackageCurrencySnapshotService;
use App\Services\PackageHppEstimateService;
use App\Services\PackageProductPriceSnapshotService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class PackageHppEstimateController extends PackageController
{
    public function edit(TravelPackage $package): Response
    {
        return $this->renderPackagePage('hpp', $package);
    }

    public function updateEstimate(
        UpdatePackageHppEstimateRequest $request,
        TravelPackage $package,
        PackageHppEstimateService $hppEstimateService,
    ): RedirectResponse {
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
            'discount_type' => $payload['discount_type'],
            'discount_nominal' => $payload['discount_nominal'],
            'discount_label' => $payload['discount_label'],
            'discount_ends_at' => $payload['discount_ends_at'],
            'currency' => $payload['currency'],
            'content' => $existingContent,
        ]);
        $hppEstimateService->refreshForPackage($package->refresh());

        return redirect()
            ->route('hpp-package.index')
            ->with('success', 'Estimasi HPP berhasil diperbarui.');
    }

    public function refreshProductPrices(
        RefreshPackageProductPricesRequest $request,
        TravelPackage $package,
        PackageProductPriceSnapshotService $snapshotService,
        PackageCurrencySnapshotService $currencySnapshotService,
        PackageHppEstimateService $hppEstimateService,
    ): RedirectResponse {
        $requestedIds = collect($request->validated('product_ids', []))
            ->map(fn (mixed $id): int => (int) $id)
            ->unique()
            ->values();
        $attachedIds = $package->products()->pluck('products.id')->map(fn (mixed $id): int => (int) $id);

        if ($requestedIds->diff($attachedIds)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'product_ids' => 'Ada produk yang bukan bagian dari package ini.',
            ]);
        }

        $updatedCount = DB::transaction(function () use (
            $package,
            $requestedIds,
            $snapshotService,
            $currencySnapshotService,
            $hppEstimateService,
        ): int {
            $count = $snapshotService->refresh(
                $package,
                $requestedIds->isEmpty() ? null : $requestedIds->all(),
            );
            $currencySnapshotService->refreshPackage($package->refresh());
            $hppEstimateService->refreshForPackage($package->refresh());

            return $count;
        });

        return back()->with('success', $updatedCount.' harga acuan produk berhasil diperbarui.');
    }
}
