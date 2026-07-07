<?php

namespace App\Http\Requests\Administrator;

use App\Models\Hotel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country_id' => ['required', 'integer', 'exists:hotel_countries,id'],
            'city_id' => ['required', 'integer', 'exists:hotel_cities,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Hotel::class, 'name')
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator): void {
            foreach ((array) $this->input('prices', []) as $index => $price) {
                $start = data_get($price, 'period_start');
                $end = data_get($price, 'period_end');

                if ($start && $end && $end < $start) {
                    $validator->errors()->add("prices.$index.period_end", 'Tanggal akhir periode harus setelah atau sama dengan tanggal awal.');
                }
            }
        });
    }
}
