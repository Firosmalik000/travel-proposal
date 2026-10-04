<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentCommissionRequest extends FormRequest
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
            'status' => ['required', 'in:pending,approved,paid,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'financial_account_id' => [Rule::requiredIf($this->input('status') === 'paid' && $this->route('commission')?->status === 'approved'), 'nullable', 'integer', 'exists:financial_accounts,id'],
            'payment_date' => [Rule::requiredIf($this->input('status') === 'paid' && $this->route('commission')?->status === 'approved'), 'nullable', 'date'],
            'exchange_rate' => [Rule::requiredIf($this->input('status') === 'paid' && $this->route('commission')?->status === 'approved'), 'nullable', 'numeric', 'gt:0', 'decimal:0,8'],
            'amount_idr' => [Rule::requiredIf($this->input('status') === 'paid' && $this->route('commission')?->status === 'approved'), 'nullable', 'integer', 'min:1'],
        ];
    }
}
