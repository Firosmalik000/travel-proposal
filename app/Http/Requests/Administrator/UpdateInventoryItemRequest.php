<?php

namespace App\Http\Requests\Administrator;

use App\Models\InventoryItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var InventoryItem|null $inventoryItem */
        $inventoryItem = $this->route('inventoryItem');

        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where(function ($query): void {
                    $query
                        ->whereNull('product_type')
                        ->orWhereRaw('LOWER(product_type) <> ?', ['hotel']);
                }),
                Rule::unique('inventory_items', 'product_id')->ignore($inventoryItem?->id),
            ],
            'stock_adjustment' => ['required', 'integer'],
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
            'stock_adjustment.required' => 'Penyesuaian stok wajib diisi.',
            'stock_adjustment.integer' => 'Penyesuaian stok harus berupa angka bulat.',
        ];
    }
}
