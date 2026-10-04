<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StorePeriodAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'adjustment_of_id' => ['required', 'integer', 'exists:financial_transactions,id'],
            'debit_account_id' => ['required', 'integer', 'different:credit_account_id', 'exists:financial_accounts,id'],
            'credit_account_id' => ['required', 'integer', 'different:debit_account_id', 'exists:financial_accounts,id'],
            'amount_idr' => ['required', 'integer', 'min:1'],
            'adjustment_reason' => ['required', 'string', 'min:10', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
