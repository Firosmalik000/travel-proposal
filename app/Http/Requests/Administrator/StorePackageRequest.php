<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        if (! is_array($name)) {
            $raw = $_POST;
            $this->merge([
                'name' => [
                    'id' => $raw['name.id'] ?? '',
                    'en' => $raw['name.en'] ?? '',
                ],
            ]);
        }

        $summary = $this->input('summary');
        if (! is_array($summary)) {
            $raw = $_POST;
            $this->merge([
                'summary' => [
                    'id' => $raw['summary.id'] ?? '',
                    'en' => $raw['summary.en'] ?? '',
                ],
            ]);
        }

        $content = $this->input('content');
        if (is_string($content)) {
            $decoded = json_decode($content, true);
            $this->merge(['content' => is_array($decoded) ? $decoded : []]);
        }

        $itineraries = $this->input('itineraries');
        if (is_string($itineraries)) {
            $decoded = json_decode($itineraries, true);
            $this->merge(['itineraries' => is_array($decoded) ? $decoded : []]);
        }
    }

    public function rules(): array
    {
        $packageId = $this->route('package')?->id;

        return [
            'slug' => ['required', 'string', 'max:100', Rule::unique('travel_packages', 'slug')->ignore($packageId)],
            'name.id' => ['required', 'string', 'max:200'],
            'name.en' => ['nullable', 'string', 'max:200'],
            'package_type' => ['required', 'string', Rule::in(['reguler', 'vip', 'private', 'hemat', 'premium'])],
            'departure_city' => ['required', 'string', 'max:100'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'discount_label' => ['nullable', 'string', 'max:50'],
            'discount_ends_at' => ['nullable', 'date'],
            'currency' => ['required', 'string', 'size:3'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'summary.id' => ['nullable', 'string'],
            'summary.en' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'itineraries' => ['nullable', 'array'],
            'itineraries.*.activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'itineraries.*.activity_ids' => ['nullable', 'array'],
            'itineraries.*.activity_ids.*' => ['integer', 'exists:activities,id'],
            'itineraries.*.day_number' => ['required', 'integer', 'min:1'],
            'itineraries.*.sort_order' => ['nullable', 'integer', 'min:1'],
            'itineraries.*.title.id' => ['nullable', 'string', 'max:255'],
            'itineraries.*.title.en' => ['nullable', 'string', 'max:255'],
            'itineraries.*.description.id' => ['nullable', 'string'],
            'itineraries.*.description.en' => ['nullable', 'string'],
            'itineraries.*.product_ids' => ['nullable', 'array'],
            'itineraries.*.product_ids.*' => ['integer', 'exists:travel_products,id'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:travel_products,id'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.id.required' => 'Nama package (Indonesia) wajib diisi.',
            'original_price.gt' => 'Harga asli harus lebih besar dari harga jual.',
            'slug.unique' => 'Slug sudah digunakan.',
        ];
    }
}
