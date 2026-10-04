<?php

namespace Database\Factories;

use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialTransactionLine>
 */
class FinancialTransactionLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'financial_transaction_id' => FinancialTransaction::factory(),
            'financial_account_id' => FinancialAccount::factory(),
            'entry_type' => 'debit',
            'amount_original' => 100000,
            'amount_idr' => 100000,
            'description' => null,
        ];
    }
}
