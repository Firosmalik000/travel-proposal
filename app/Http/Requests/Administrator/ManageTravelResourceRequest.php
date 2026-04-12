<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class ManageTravelResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payload' => ['nullable', 'array'],
            'payload_json' => ['nullable', 'json'],
        ];
    }

    public function messages(): array
    {
        return [
            'payload_json.json' => 'Payload harus berupa JSON yang valid.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->has('payload') && ! $this->filled('payload_json')) {
                $validator->errors()->add('payload', 'Payload wajib diisi.');
            }
        });
    }
}
