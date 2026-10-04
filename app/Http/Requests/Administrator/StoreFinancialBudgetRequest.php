<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialBudgetRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'lines' => ['required', 'array', 'min:1', 'max:50'],
            'lines.*.financial_account_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('financial_accounts', 'id')->where(fn ($query) => $query->where('type', 'expense')->where('is_active', true)),
            ],
            'lines.*.planned_amount_idr' => ['required', 'integer', 'min:1'],
            'lines.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
