<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorPricePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['currency' => strtoupper(trim((string) $this->input('currency', 'IDR')))]);
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'currency' => ['required', 'string', 'size:3'],
            'price_per_pax' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'label.required' => 'Nama periode wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal akhir periode tidak boleh sebelum tanggal mulai.',
            'price_per_pax.gt' => 'Harga per jamaah harus lebih besar dari nol.',
        ];
    }
}
