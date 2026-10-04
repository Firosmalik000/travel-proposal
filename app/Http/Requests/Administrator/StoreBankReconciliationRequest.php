<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'statement_date' => ['required', 'date', 'before_or_equal:today'],
            'statement_balance_idr' => ['required', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
