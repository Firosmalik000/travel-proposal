<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'transaction_date' => ['required', 'date'],
            'amount_original' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
