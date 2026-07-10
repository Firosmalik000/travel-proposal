<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteTravelProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:products,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Minimal satu produk harus dipilih.',
            'ids.min' => 'Minimal satu produk harus dipilih.',
            'ids.*.exists' => 'Produk yang dipilih tidak ditemukan.',
        ];
    }
}
