<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteProductCategoryHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct', 'exists:hotels,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Minimal satu hotel harus dipilih.',
            'ids.min' => 'Minimal satu hotel harus dipilih.',
            'ids.*.exists' => 'Hotel yang dipilih tidak ditemukan.',
        ];
    }
}
