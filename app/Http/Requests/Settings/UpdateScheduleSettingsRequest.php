<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'auto_cancellation_enabled' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'auto_cancellation_enabled.required' => 'Status auto cancellation wajib ditentukan.',
            'auto_cancellation_enabled.boolean' => 'Status auto cancellation tidak valid.',
        ];
    }
}
