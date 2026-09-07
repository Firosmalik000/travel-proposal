<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class RefreshPackageProductPricesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'distinct'],
        ];
    }
}
