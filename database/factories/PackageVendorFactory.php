<?php

namespace Database\Factories;

use App\Models\PackageVendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PackageVendor> */
class PackageVendorFactory extends Factory
{
    protected $model = PackageVendor::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'phone' => fake()->phoneNumber(),
        ];
    }
}
