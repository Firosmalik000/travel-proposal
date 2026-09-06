<?php

namespace App\Http\Requests\Administrator;

class UpdatePackageHppEstimateRequest extends StorePackageRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'content.room_original_prices.dbl' => ['required', 'numeric', 'gt:0'],
            'content.room_original_prices.trpl' => ['required', 'numeric', 'gt:0'],
            'content.room_original_prices.quad' => ['required', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            ...parent::messages(),
            'content.room_original_prices.dbl.required' => 'Harga Double wajib diisi.',
            'content.room_original_prices.trpl.required' => 'Harga Triple wajib diisi.',
            'content.room_original_prices.quad.required' => 'Harga Quad wajib diisi.',
            'content.room_original_prices.*.gt' => 'Harga kamar harus lebih besar dari nol.',
        ];
    }
}
