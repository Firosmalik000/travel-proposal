<?php

namespace Database\Factories;

use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

class TravelPackageFactory extends Factory
{
    protected $model = TravelPackage::class;

    public function definition(): array
    {
        $name = fake()->words(3, true);

        return [
            'code' => strtoupper(fake()->bothify('PKT-###')),
            'slug' => fake()->slug(3),
            'name' => [
                'id' => $name,
                'en' => $name,
            ],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 25000000,
            'original_price' => null,
            'discount_label' => null,
            'discount_ends_at' => null,
            'currency' => 'IDR',
            'image_path' => '/images/dummy.jpg',
            'summary' => [
                'id' => fake()->sentence(),
                'en' => fake()->sentence(),
            ],
            'content' => [],
            'is_featured' => false,
            'is_active' => true,
        ];
    }
}
