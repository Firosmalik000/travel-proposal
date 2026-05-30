<?php

namespace App\Http\Requests\Administrator;

use App\Models\HotelCountry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotelCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var HotelCountry|null $hotelCountry */
        $hotelCountry = $this->route('hotelCountry');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('hotel_countries', 'name')->ignore($hotelCountry?->id)],
            'is_active' => ['boolean'],
        ];
    }
}
