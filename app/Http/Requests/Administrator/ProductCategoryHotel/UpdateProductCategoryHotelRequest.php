<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use App\Models\Hotel;
use Illuminate\Validation\Rule;

class UpdateProductCategoryHotelRequest extends StoreProductCategoryHotelRequest
{
    public function rules(): array
    {
        $hotelId = (int) $this->route('hotel')?->id;
        $rules = parent::rules();

        $rules['name'] = [
            'required',
            'string',
            'max:255',
            Rule::unique(Hotel::class, 'name')
                ->ignore($hotelId)
                ->where(fn ($query) => $query->where('city_id', (int) $this->input('city_id'))),
        ];

        return $rules;
    }
}
