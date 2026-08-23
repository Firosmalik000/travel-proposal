<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use App\Models\Hotel;
use App\Models\HotelRoomType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProductCategoryHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country_id' => [
                'required',
                'integer',
                Rule::exists('hotel_countries', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->whereNull('deleted_at')),
            ],
            'city_id' => [
                'required',
                'integer',
                Rule::exists('hotel_cities', 'id')->where(fn ($query) => $query
                    ->where('country_id', $this->integer('country_id'))
                    ->where('is_active', true)
                    ->whereNull('deleted_at')),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Hotel::class, 'name')
                    ->where(fn ($query) => $query->where('city_id', (int) $this->input('city_id'))),
            ],
            'description' => ['nullable', 'string'],
            'currency' => [
                'required',
                'string',
                Rule::in(array_keys((array) config('services.currency.supported', []))),
            ],
            'is_active' => ['required', 'boolean'],
            'prices' => ['required', 'array', 'min:1'],
            'prices.*.broker_key' => ['nullable', 'string', 'max:255'],
            'prices.*.broker_name' => ['nullable', 'string', 'max:255'],
            'prices.*.room_type_id' => ['required', 'integer', Rule::in(HotelRoomType::productHotelPricingIds())],
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

    public function messages(): array
    {
        return [
            'country_id.required' => 'Negara wajib dipilih.',
            'country_id.exists' => 'Negara tidak aktif atau tidak ditemukan.',
            'city_id.required' => 'Kota wajib dipilih.',
            'city_id.exists' => 'Kota tidak sesuai dengan negara yang dipilih atau sudah tidak aktif.',
            'name.required' => 'Nama hotel wajib diisi.',
            'name.unique' => 'Hotel dengan nama yang sama sudah tersedia di kota tersebut.',
            'currency.required' => 'Mata uang wajib dipilih.',
            'currency.in' => 'Mata uang tidak tersedia pada daftar currency.',
            'prices.required' => 'Minimal satu periode harga wajib diisi.',
            'prices.min' => 'Minimal satu periode harga wajib diisi.',
            'prices.*.room_type_id.in' => 'Tipe kamar hanya boleh Double, Triple, atau Quad.',
            'prices.*.period_start.required' => 'Tanggal mulai periode wajib diisi.',
            'prices.*.period_end.required' => 'Tanggal akhir periode wajib diisi.',
            'prices.*.price.required' => 'Harga kamar wajib diisi.',
            'prices.*.price.integer' => 'Harga kamar harus berupa angka bulat.',
            'prices.*.price.min' => 'Harga kamar tidak boleh negatif.',
        ];
    }
}
