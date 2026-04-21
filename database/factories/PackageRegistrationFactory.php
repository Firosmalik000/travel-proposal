<?php

namespace Database\Factories;

use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackageRegistration>
 */
class PackageRegistrationFactory extends Factory
{
    protected $model = PackageRegistration::class;

    public function definition(): array
    {
        $travelPackage = TravelPackage::query()->first() ?? TravelPackage::query()->create([
            'code' => 'PKG-FACT-01',
            'slug' => 'package-factory-01',
            'name' => ['id' => 'Package Factory', 'en' => 'Package Factory'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 25000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Factory summary', 'en' => 'Factory summary'],
            'content' => [],
            'is_active' => true,
        ]);

        return [
            'travel_package_id' => $travelPackage->id,
            'departure_schedule_id' => null,
            'full_name' => fake()->name(),
            'phone' => fake()->numerify('62812########'),
            'email' => fake()->safeEmail(),
            'origin_city' => fake()->city(),
            'passenger_count' => fake()->numberBetween(1, 5),
            'notes' => fake()->sentence(),
            'status' => 'pending',
        ];
    }
}
