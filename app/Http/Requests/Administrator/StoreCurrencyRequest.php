<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:3', 'alpha', 'unique:currencies,code'],
            'name' => ['required', 'string', 'max:255'],
            'conversion_rate' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode currency wajib diisi.',
            'code.size' => 'Kode currency harus 3 huruf.',
            'code.alpha' => 'Kode currency hanya boleh berisi huruf.',
            'code.unique' => 'Kode currency sudah digunakan.',
            'name.required' => 'Nama currency wajib diisi.',
            'conversion_rate.required' => 'Nominal converter wajib diisi.',
            'conversion_rate.numeric' => 'Nominal converter harus berupa angka.',
            'conversion_rate.gt' => 'Nominal converter harus lebih besar dari 0.',
        ];
    }
}
