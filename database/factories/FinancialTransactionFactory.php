<?php

namespace Database\Factories;

use App\Models\FinancialTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialTransaction>
 */
class FinancialTransactionFactory extends Factory
{
    protected $model = FinancialTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_number' => 'FT-'.fake()->unique()->numerify('############'),
            'transaction_date' => fake()->date(),
            'transaction_type' => 'manual_journal',
            'category_code' => 'other_manual_journal',
            'status' => 'posted',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 100000,
            'amount_idr' => 100000,
            'idempotency_key' => fake()->uuid(),
            'payload_hash' => hash('sha256', fake()->uuid()),
            'posted_at' => now(),
        ];
    }
}
