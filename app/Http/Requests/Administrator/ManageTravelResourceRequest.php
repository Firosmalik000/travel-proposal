<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ManageTravelResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'payload' => ['nullable', 'array'],
            'payload_json' => ['nullable', 'json'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];

        if ($this->route('resource') === 'products') {
            $productId = $this->route('id');

            $rules = [
                ...$rules,
                'payload' => ['required', 'array'],
                'payload.code' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('products', 'code')->ignore($productId),
                ],
                'payload.slug' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('products', 'slug')->ignore($productId),
                ],
                'payload.name' => ['required'],
                'payload.product_type' => [
                    'required',
                    'string',
                    Rule::notIn(['hotel']),
                    Rule::exists('product_categories', 'key')->where('is_active', true),
                ],
                'payload.description' => ['nullable'],
                'payload.content' => ['required', 'array'],
                'payload.content.price' => ['required', 'numeric', 'min:0'],
                'payload.content.currency' => [
                    'required',
                    'string',
                    Rule::in(array_keys((array) config('services.currency.supported', []))),
                ],
                'payload.content.currency_rate_to_idr' => ['required', 'numeric', 'gt:0'],
                'payload.is_active' => ['required', 'boolean'],
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'payload_json.json' => 'Payload harus berupa JSON yang valid.',
            'payload.code.unique' => 'Kode produk sudah digunakan. Ubah nama produk lalu coba lagi.',
            'payload.slug.unique' => 'Slug produk sudah digunakan. Ubah nama produk lalu coba lagi.',
            'payload.name.required' => 'Nama produk wajib diisi.',
            'payload.product_type.required' => 'Kategori produk wajib dipilih.',
            'payload.product_type.not_in' => 'Produk kategori hotel wajib dibuat dari tampilan Hotel.',
            'payload.product_type.exists' => 'Kategori produk tidak aktif atau tidak ditemukan.',
            'payload.content.price.required' => 'Harga produk wajib diisi.',
            'payload.content.price.numeric' => 'Harga produk harus berupa angka.',
            'payload.content.price.min' => 'Harga produk tidak boleh negatif.',
            'payload.content.currency.required' => 'Mata uang wajib dipilih.',
            'payload.content.currency.in' => 'Mata uang tidak tersedia pada daftar currency.',
            'payload.content.currency_rate_to_idr.required' => 'Kurs ke IDR wajib diisi.',
            'payload.content.currency_rate_to_idr.gt' => 'Kurs ke IDR harus lebih besar dari nol.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('payload') || ! $this->filled('payload_json')) {
            return;
        }

        $payload = json_decode($this->string('payload_json')->value(), true);

        if (is_array($payload)) {
            $this->merge(['payload' => $payload]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->has('payload') && ! $this->filled('payload_json')) {
                $validator->errors()->add('payload', 'Payload wajib diisi.');
            }

            if ($this->route('resource') !== 'products') {
                return;
            }

            foreach (['name' => 'Nama produk', 'description' => 'Deskripsi produk'] as $field => $label) {
                $value = data_get($this->input('payload'), $field);

                if ($value !== null && ! is_string($value) && ! is_array($value)) {
                    $validator->errors()->add("payload.$field", "$label harus berupa teks.");
                }
            }
        });
    }
}
