<?php

namespace App\Http\Requests\Administrator;

use App\Models\HotelCity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHotelCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var HotelCity|null $hotelCity */
        $hotelCity = $this->route('hotelCity');

        return [
            'country_id' => ['required', 'integer', 'exists:hotel_countries,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('hotel_cities', 'name')
                    ->where(fn ($query) => $query->where('country_id', $this->integer('country_id')))
                    ->ignore($hotelCity?->id),
            ],
            'is_active' => ['boolean'],
        ];
    }
}
