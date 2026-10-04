<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateFinancialAccountRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:30', 'regex:/^[A-Z0-9.-]+$/', Rule::unique('financial_accounts', 'code')->ignore($this->route('financialAccount'))],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense'])],
            'is_cash_account' => ['required', 'boolean'],
            'cash_account_type' => ['nullable', Rule::requiredIf($this->boolean('is_cash_account')), Rule::in(['customer_funds', 'operating', 'petty_cash', 'legacy'])],
            'account_number' => ['nullable', 'string', 'max:100'],
            'currency' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->boolean('is_cash_account') && $this->string('type')->value() !== 'asset') {
                    $validator->errors()->add('type', 'Rekening kas/bank wajib menggunakan tipe akun Aset.');
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper(trim((string) $this->input('code'))),
            'currency' => strtoupper(trim((string) $this->input('currency', 'IDR'))),
            'cash_account_type' => $this->boolean('is_cash_account') ? $this->input('cash_account_type') : null,
        ]);
    }
}
