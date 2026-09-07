<?php

namespace Database\Factories;

use App\Models\TravelProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<TravelProduct> */
class TravelProductFactory extends Factory
{
    protected $model = TravelProduct::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'code' => 'PRD-'.strtoupper(fake()->unique()->bothify('??-####')),
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'name' => Str::title($name),
            'product_type' => 'layanan',
            'visibility' => TravelProduct::VISIBILITY_MASTER,
            'package_id' => null,
            'description' => fake()->sentence(),
            'content' => [
                'unit' => 'per paket',
                'price' => fake()->numberBetween(100_000, 5_000_000),
                'currency' => 'IDR',
                'currency_rate_snapshot' => [
                    'rate_to_idr' => 1,
                    'source' => 'identity',
                    'fetched_at' => null,
                ],
            ],
            'is_active' => true,
        ];
    }
}
