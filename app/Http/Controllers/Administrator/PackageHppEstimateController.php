<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Requests\Administrator\UpdatePackageHppEstimateRequest;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class PackageHppEstimateController extends PackageController
{
    public function edit(TravelPackage $package): Response
    {
        return $this->renderPackagePage('hpp', $package);
    }

    public function updateEstimate(UpdatePackageHppEstimateRequest $request, TravelPackage $package): RedirectResponse
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
            'discount_type' => $payload['discount_type'],
            'discount_nominal' => $payload['discount_nominal'],
            'discount_label' => $payload['discount_label'],
            'discount_ends_at' => $payload['discount_ends_at'],
            'currency' => $payload['currency'],
            'content' => $existingContent,
        ]);

        return redirect()
            ->route('hpp-package.index')
            ->with('success', 'Estimasi HPP berhasil diperbarui.');
    }
}
