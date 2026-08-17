<?php

namespace App\Actions\Package;

use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\VendorPricePeriod;

class SyncPackageAllInConfig
{
    /** @param array<string, mixed>|null $configuration */
    public function handle(TravelPackage $package, ?array $configuration): void
    {
        if (! (bool) data_get($configuration, 'enabled', false)) {
            $package->allInConfig()->delete();

            return;
        }

        $vendor = PackageVendor::query()->findOrFail((int) data_get($configuration, 'vendor_id'));
        $period = VendorPricePeriod::query()
            ->where('package_vendor_id', $vendor->id)
            ->findOrFail((int) data_get($configuration, 'period_id'));
        $categoryKeys = collect(data_get($configuration, 'included_category_keys', []))
            ->filter(fn (mixed $key): bool => is_string($key) && trim($key) !== '')
            ->map(fn (string $key): string => trim($key))
            ->unique()
            ->values()
            ->all();
        $existingConfiguration = $package->allInConfig()->first();
        $keepsSelectedPeriod = $existingConfiguration !== null
            && $existingConfiguration->package_vendor_id === $vendor->id
            && $existingConfiguration->vendor_price_period_id === $period->id;

        $package->allInConfig()->updateOrCreate(
            ['package_id' => $package->id],
            [
                'package_vendor_id' => $vendor->id,
                'vendor_price_period_id' => $period->id,
                'broker_package_name' => trim((string) data_get($configuration, 'broker_package_name')),
                'currency' => strtoupper((string) data_get($configuration, 'currency')),
                'price_per_pax' => (float) data_get($configuration, 'price_per_pax'),
                'included_category_keys' => $categoryKeys,
                'vendor_name_snapshot' => $keepsSelectedPeriod
                    ? $existingConfiguration->vendor_name_snapshot
                    : $vendor->name,
                'period_label_snapshot' => $keepsSelectedPeriod
                    ? $existingConfiguration->period_label_snapshot
                    : $period->label,
                'period_start_snapshot' => $keepsSelectedPeriod
                    ? $existingConfiguration->period_start_snapshot
                    : $period->start_date,
                'period_end_snapshot' => $keepsSelectedPeriod
                    ? $existingConfiguration->period_end_snapshot
                    : $period->end_date,
            ],
        );
    }
}
