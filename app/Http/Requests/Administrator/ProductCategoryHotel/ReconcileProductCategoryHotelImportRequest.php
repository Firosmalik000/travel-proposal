<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use Illuminate\Foundation\Http\FormRequest;

class ReconcileProductCategoryHotelImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1', 'max:5000'],
            'rows.*.country' => ['nullable', 'string', 'max:255'],
            'rows.*.city' => ['nullable', 'string', 'max:255'],
            'rows.*.hotel' => ['required', 'string', 'max:255'],
            'rows.*.currency' => ['nullable', 'string', 'size:3'],
            'rows.*.period_start' => ['required', 'date_format:Y-m-d'],
            'rows.*.period_end' => ['required', 'date_format:Y-m-d', 'after_or_equal:rows.*.period_start'],
            'rows.*.dbl' => ['nullable', 'integer', 'min:0'],
            'rows.*.trpl' => ['nullable', 'integer', 'min:0'],
            'rows.*.quad' => ['nullable', 'integer', 'min:0'],
            'rows.*.source' => ['nullable', 'in:csv,xls,xlsx,pdf'],
            'rows.*.warnings' => ['nullable', 'array'],
            'rows.*.warnings.*' => ['string', 'max:500'],
            'default_country_id' => ['nullable', 'integer', 'exists:hotel_countries,id'],
            'default_currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
