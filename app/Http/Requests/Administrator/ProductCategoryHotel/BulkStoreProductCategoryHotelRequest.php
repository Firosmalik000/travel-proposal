<?php

namespace App\Http\Requests\Administrator\ProductCategoryHotel;

use App\Models\HotelCity;
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
            'hotels.*.country_id' => [
                'required',
                'integer',
                Rule::exists('hotel_countries', 'id')->where(fn ($query) => $query
                    ->where('is_active', true)
                    ->whereNull('deleted_at')),
            ],
            'hotels.*.city_id' => ['required', 'integer', 'exists:hotel_cities,id'],
            'hotels.*.existing_hotel_id' => ['nullable', 'integer', 'exists:hotels,id'],
            'hotels.*.name' => ['required', 'string', 'max:255'],
            'hotels.*.description' => ['nullable', 'string'],
            'hotels.*.currency' => [
                'required',
                'string',
                Rule::in(array_keys((array) config('services.currency.supported', []))),
            ],
            'hotels.*.is_active' => ['required', 'boolean'],
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
            $cityCountries = HotelCity::query()
                ->whereIn('id', collect($this->input('hotels', []))->pluck('city_id')->filter()->all())
                ->where('is_active', true)
                ->pluck('country_id', 'id');

            foreach ((array) $this->input('hotels', []) as $hotelIndex => $hotel) {
                $cityId = (int) data_get($hotel, 'city_id');
                $countryId = (int) data_get($hotel, 'country_id');

                if ($cityId > 0 && $countryId > 0 && (int) $cityCountries->get($cityId) !== $countryId) {
                    $validator->errors()->add(
                        "hotels.$hotelIndex.city_id",
                        'Kota tidak sesuai dengan negara yang dipilih atau sudah tidak aktif.'
                    );
                }

                $seenPriceKeys = [];
                foreach ((array) data_get($hotel, 'prices', []) as $priceIndex => $price) {
                    $start = data_get($price, 'period_start');
                    $end = data_get($price, 'period_end');

                    if ($start && $end && $end < $start) {
                        $validator->errors()->add(
                            "hotels.$hotelIndex.prices.$priceIndex.period_end",
                            'Tanggal akhir periode harus setelah atau sama dengan tanggal awal.'
                        );
                    }

                    $priceKey = implode('|', [
                        mb_strtolower(trim((string) data_get($price, 'broker_name', 'Broker 1'))),
                        data_get($price, 'room_type_id'),
                        $start,
                        $end,
                    ]);
                    $incomingPrice = (int) data_get($price, 'price');

                    if (isset($seenPriceKeys[$priceKey])) {
                        $validator->errors()->add(
                            "hotels.$hotelIndex.prices.$priceIndex.price",
                            $seenPriceKeys[$priceKey] !== $incomingPrice
                                ? 'Periode dan tipe kamar yang sama memiliki harga berbeda dalam satu import.'
                                : 'Periode, broker, dan tipe kamar yang sama terduplikasi dalam satu import.'
                        );
                    }
                    $seenPriceKeys[$priceKey] = $incomingPrice;
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'hotels.required' => 'Minimal satu hotel wajib diisi.',
            'hotels.*.country_id.required' => 'Negara hotel wajib dipilih.',
            'hotels.*.country_id.exists' => 'Negara hotel tidak aktif atau tidak ditemukan.',
            'hotels.*.city_id.required' => 'Kota hotel wajib dipilih.',
            'hotels.*.city_id.exists' => 'Kota hotel tidak ditemukan.',
            'hotels.*.name.required' => 'Nama hotel wajib diisi.',
            'hotels.*.currency.required' => 'Mata uang hotel wajib dipilih.',
            'hotels.*.currency.in' => 'Mata uang hotel tidak tersedia pada daftar currency.',
            'hotels.*.prices.required' => 'Minimal satu periode harga hotel wajib diisi.',
            'hotels.*.prices.min' => 'Minimal satu periode harga hotel wajib diisi.',
            'hotels.*.prices.*.room_type_id.in' => 'Tipe kamar hanya boleh Double, Triple, atau Quad.',
            'hotels.*.prices.*.period_start.required' => 'Tanggal mulai periode wajib diisi.',
            'hotels.*.prices.*.period_end.required' => 'Tanggal akhir periode wajib diisi.',
            'hotels.*.prices.*.price.required' => 'Harga kamar wajib diisi.',
            'hotels.*.prices.*.price.integer' => 'Harga kamar harus berupa angka bulat.',
            'hotels.*.prices.*.price.min' => 'Harga kamar tidak boleh negatif.',
        ];
    }
}
