<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassifiedCashTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_type' => ['required', Rule::in(['capital_contribution', 'owner_withdrawal', 'operating_expense', 'other_income', 'customer_refund'])],
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'booking_payment_id' => [Rule::requiredIf($this->input('transaction_type') === 'customer_refund'), 'nullable', 'integer', 'exists:booking_payments,id'],
            'transaction_date' => ['required', 'date'],
            'currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'exchange_rate' => ['required', 'numeric', 'gt:0', 'decimal:0,8'],
            'amount_original' => ['required', 'numeric', 'gt:0', 'decimal:0,4'],
            'amount_idr' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['currency' => strtoupper(trim((string) $this->input('currency', 'IDR')))]);
    }
}
