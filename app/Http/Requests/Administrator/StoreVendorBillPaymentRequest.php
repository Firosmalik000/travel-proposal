<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorBillPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_idr' => ['required', 'integer', 'min:1'], 'payment_date' => ['required', 'date'],
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'notes' => ['required', 'string', 'max:1000'], 'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
