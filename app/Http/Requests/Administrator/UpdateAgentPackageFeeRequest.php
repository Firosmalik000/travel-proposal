<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentPackageFeeRequest extends FormRequest
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
            'agent_profile_id' => ['required', 'integer', Rule::exists('agent_profiles', 'id')],
            'package_id' => ['required', 'integer', Rule::exists('packages', 'id')],
            'fee_type' => ['required', 'in:fixed,percentage'],
            'fee_value' => ['required', 'numeric', 'gt:0', 'max:999999999999'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->string('fee_type')->value() === 'percentage' && $this->float('fee_value') > 100) {
                $validator->errors()->add('fee_value', 'Persentase fee tidak boleh lebih dari 100%.');
            }
        });
    }
}
