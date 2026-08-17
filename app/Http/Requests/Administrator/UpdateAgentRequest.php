<?php

namespace App\Http\Requests\Administrator;

use App\Models\AgentProfile;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateAgentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['referral_code' => strtoupper(trim((string) $this->input('referral_code')))]);
    }

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
        /** @var AgentProfile $agent */
        $agent = $this->route('agent');

        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($agent->user_id)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'referral_code' => ['required', 'string', 'max:40', 'alpha_dash', 'uppercase', Rule::unique('agent_profiles', 'referral_code')->ignore($agent->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_name' => ['nullable', 'string', 'max:150'],
            'bank_account_number' => ['nullable', 'string', 'max:80'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
