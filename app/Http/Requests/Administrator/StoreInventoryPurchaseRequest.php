<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryPurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'unit_cost_idr' => ['required', 'integer', 'min:1'],
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'transaction_date' => ['required', 'date'],
            'notes' => ['required', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
