<?php

namespace Database\Factories;

use App\Models\FinancialAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialAccount>
 */
class FinancialAccountFactory extends Factory
{
    protected $model = FinancialAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('9###'),
            'name' => fake()->words(3, true),
            'type' => fake()->randomElement(['asset', 'liability', 'equity', 'revenue', 'expense']),
            'is_cash_account' => false,
            'cash_account_type' => null,
            'account_number' => null,
            'currency' => 'IDR',
            'is_active' => true,
        ];
    }
}
