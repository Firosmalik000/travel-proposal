<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($query): void {
                    $query
                        ->whereNull('product_type')
                        ->orWhereRaw('LOWER(product_type) <> ?', ['hotel']);
                }),
                'unique:inventory_items,product_id',
            ],
            'quantity' => ['required', 'integer', 'min:0'],
            'stock_adjustment' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Produk wajib dipilih.',
            'product_id.exists' => 'Produk yang dipilih tidak valid.',
            'product_id.unique' => 'Produk ini sudah terdaftar di inventory.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.integer' => 'Jumlah harus berupa angka bulat.',
            'quantity.min' => 'Jumlah tidak boleh kurang dari 0.',
        ];
    }
}
