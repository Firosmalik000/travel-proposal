<?php

namespace Database\Factories;

use App\Models\PackageVendor;
use App\Models\VendorPricePeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VendorPricePeriod> */
class VendorPricePeriodFactory extends Factory
{
    protected $model = VendorPricePeriod::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'package_vendor_id' => PackageVendor::factory(),
            'label' => 'Musim '.fake()->monthName(),
            'start_date' => '2026-08-01',
            'end_date' => '2026-10-31',
            'currency' => 'SAR',
            'price_per_pax' => fake()->numberBetween(2500, 7500),
            'notes' => null,
            'is_active' => true,
        ];
    }
}
