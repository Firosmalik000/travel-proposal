<?php

namespace Database\Factories;

use App\Models\Cashflow;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cashflow>
 */
class CashflowFactory extends Factory
{
    protected $model = Cashflow::class;

    public function definition(): array
    {
        return [
            'transaction_date' => $this->faker->date(),
            'type' => $this->faker->randomElement(['income', 'expense']),
            'amount' => $this->faker->numberBetween(10_000, 5_000_000),
            'category' => $this->faker->randomElement(['Operasional', 'Marketing', 'Transport']),
            'description' => $this->faker->sentence(),
        ];
    }
}
