<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use Illuminate\Foundation\Http\FormRequest;

class ParseProductCategoryHotelPdfRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf', 'mimetypes:application/pdf', 'max:20480'],
            'default_country_id' => ['nullable', 'integer', 'exists:hotel_countries,id'],
            'default_currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
