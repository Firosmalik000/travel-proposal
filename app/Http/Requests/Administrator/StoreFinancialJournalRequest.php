<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialJournalRequest extends FormRequest
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
        $accountRule = Rule::exists('financial_accounts', 'id')->where(fn ($query) => $query->where('is_active', true));

        return [
            'transaction_date' => ['required', 'date'],
            'transaction_type' => ['required', Rule::in(['manual_journal', 'transfer'])],
            'category_code' => [
                $this->input('transaction_type') === 'transfer' ? 'nullable' : 'required',
                'string',
                Rule::exists('financial_transaction_types', 'code')->where(fn ($query) => $query
                    ->where('applies_to', $this->input('transaction_type'))
                    ->where('is_active', true)),
            ],
            'debit_account_id' => ['required', 'integer', 'different:credit_account_id', $accountRule],
            'credit_account_id' => ['required', 'integer', 'different:debit_account_id', $accountRule],
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
        $isTransfer = $this->input('transaction_type') === 'transfer';
        $categoryCode = $this->input('category_code');

        if ($isTransfer && (empty($categoryCode) || ! is_string($categoryCode))) {
            $categoryCode = 'inter_account_transfer';
        }

        $this->merge([
            'currency' => strtoupper(trim((string) $this->input('currency', 'IDR'))),
            'category_code' => $categoryCode,
        ]);
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'category_code' => 'jenis transaksi',
        ];
    }
}
