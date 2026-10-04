<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOpeningBalanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'],
            'transaction_date' => ['required', 'date'],
            'currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'exchange_rate' => ['required', 'numeric', 'gt:0', 'decimal:0,8'],
            'amount_original' => ['required', 'numeric', 'gt:0', 'decimal:0,4'],
            'amount_idr' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['currency' => strtoupper(trim((string) $this->input('currency', 'IDR')))]);
    }
}
