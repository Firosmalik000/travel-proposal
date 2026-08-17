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
        $rules = [
            'payload' => ['nullable', 'array'],
            'payload_json' => ['nullable', 'json'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];

        if ($this->route('resource') === 'products' && $this->has('payload')) {
            $rules['payload.content.currency'] = ['required', 'string', 'size:3'];
            $rules['payload.content.currency_rate_to_idr'] = ['required', 'numeric', 'gt:0'];
        }

        return $rules;
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
