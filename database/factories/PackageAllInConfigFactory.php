<?php

namespace Database\Factories;

use App\Models\PackageAllInConfig;
use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\VendorPricePeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PackageAllInConfig> */
class PackageAllInConfigFactory extends Factory
{
    protected $model = PackageAllInConfig::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'package_id' => TravelPackage::factory(),
            'package_vendor_id' => PackageVendor::factory(),
            'vendor_price_period_id' => fn (array $attributes): int => VendorPricePeriod::factory()->create([
                'package_vendor_id' => $attributes['package_vendor_id'],
            ])->id,
            'broker_package_name' => 'Land Arrangement Umroh',
            'currency' => 'SAR',
            'price_per_pax' => 4500,
            'included_category_keys' => ['hotel', 'tiket'],
            'vendor_name_snapshot' => 'Vendor Snapshot',
            'period_label_snapshot' => 'Agustus - Oktober 2026',
            'period_start_snapshot' => '2026-08-01',
            'period_end_snapshot' => '2026-10-31',
        ];
    }
}
