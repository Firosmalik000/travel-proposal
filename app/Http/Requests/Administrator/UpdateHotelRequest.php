<?php

namespace App\Http\Requests\Administrator;

use App\Models\Hotel;
use Illuminate\Validation\Rule;

class UpdateHotelRequest extends StoreHotelRequest
{
    public function rules(): array
    {
        $hotelId = (int) $this->route('hotel')?->id;

        return [
            'country_id' => ['required', 'integer', 'exists:hotel_countries,id'],
            'city_id' => ['required', 'integer', 'exists:hotel_cities,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Hotel::class, 'name')
                    ->ignore($hotelId)
                    ->where(fn ($query) => $query->where('city_id', (int) $this->input('city_id'))),
            ],
            'description' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'size:3'],
            'is_active' => ['boolean'],
            'prices' => ['required', 'array', 'min:1'],
            'prices.*.broker_key' => ['nullable', 'string', 'max:255'],
            'prices.*.broker_name' => ['nullable', 'string', 'max:255'],
            'prices.*.room_type_id' => ['required', 'integer', 'exists:hotel_room_types,id'],
            'prices.*.period_start' => ['required', 'date'],
            'prices.*.period_end' => ['required', 'date'],
            'prices.*.price' => ['required', 'integer', 'min:0'],
        ];
    }
}
