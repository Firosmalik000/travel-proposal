<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use App\Models\HotelRoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BulkStoreProductCategoryHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hotels' => ['required', 'array', 'min:1'],
            'hotels.*.country_id' => ['required', 'integer', 'exists:hotel_countries,id'],
            'hotels.*.city_id' => ['required', 'integer', 'exists:hotel_cities,id'],
            'hotels.*.name' => ['required', 'string', 'max:255'],
            'hotels.*.description' => ['nullable', 'string'],
            'hotels.*.currency' => ['required', 'string', 'size:3'],
            'hotels.*.is_active' => ['boolean'],
            'hotels.*.prices' => ['required', 'array', 'min:1'],
            'hotels.*.prices.*.broker_key' => ['nullable', 'string', 'max:255'],
            'hotels.*.prices.*.broker_name' => ['nullable', 'string', 'max:255'],
            'hotels.*.prices.*.room_type_id' => ['required', 'integer', Rule::in(HotelRoomType::productHotelPricingIds())],
            'hotels.*.prices.*.period_start' => ['required', 'date'],
            'hotels.*.prices.*.period_end' => ['required', 'date'],
            'hotels.*.prices.*.price' => ['required', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('hotels', []) as $hotelIndex => $hotel) {
                foreach ((array) data_get($hotel, 'prices', []) as $priceIndex => $price) {
                    $start = data_get($price, 'period_start');
                    $end = data_get($price, 'period_end');

                    if ($start && $end && $end < $start) {
                        $validator->errors()->add(
                            "hotels.$hotelIndex.prices.$priceIndex.period_end",
                            'Tanggal akhir periode harus setelah atau sama dengan tanggal awal.'
                        );
                    }
                }
            }
        });
    }
}
