<?php

namespace App\Http\Requests\Administrator;

use App\Support\ParticipantUploadLimit;
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
        $localizedString = static function (mixed $value): string {
            if (is_string($value)) {
                return $value;
            }

            if (! is_array($value)) {
                return '';
            }

            $id = trim((string) ($value['id'] ?? ''));
            if ($id !== '') {
                return $id;
            }

            return trim((string) ($value['en'] ?? ''));
        };

        $name = $this->input('name');
        if (is_array($name)) {
            $this->merge([
                'name' => $localizedString($name),
            ]);
        } elseif ($this->has('name.id')) {
            $this->merge([
                'name' => (string) $this->input('name.id'),
            ]);
        } elseif ($this->has('name.en')) {
            $this->merge([
                'name' => (string) $this->input('name.en'),
            ]);
        }

        $summary = $this->input('summary');
        if (is_array($summary)) {
            $this->merge([
                'summary' => $localizedString($summary),
            ]);
        } elseif ($this->has('summary.id')) {
            $this->merge([
                'summary' => (string) $this->input('summary.id'),
            ]);
        } elseif ($this->has('summary.en')) {
            $this->merge([
                'summary' => (string) $this->input('summary.en'),
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
            $itineraries = is_array($decoded) ? $decoded : [];
        }

        if (is_array($itineraries)) {
            $normalizedItineraries = collect($itineraries)
                ->filter(fn ($itinerary) => is_array($itinerary))
                ->map(function (array $itinerary) use ($localizedString): array {
                    $itinerary['title'] = $localizedString($itinerary['title'] ?? '');
                    $itinerary['description'] = $localizedString($itinerary['description'] ?? '');

                    return $itinerary;
                })
                ->values()
                ->all();

            $this->merge(['itineraries' => $normalizedItineraries]);
        }

        $productMultipliers = $this->input('product_multipliers');
        if (is_string($productMultipliers)) {
            $decoded = json_decode($productMultipliers, true);
            $this->merge([
                'product_multipliers' => is_array($decoded) ? $decoded : [],
            ]);
        }
    }

    public function rules(): array
    {
        $packageId = $this->route('package')?->id;
        $maxImageKilobytes = ParticipantUploadLimit::kilobytes(4096);

        return [
            'slug' => ['required', 'string', 'max:100', Rule::unique('packages', 'slug')->ignore($packageId)],
            'name' => ['required', 'string', 'max:200'],
            'package_type' => ['required', 'string', Rule::in(['reguler', 'vip', 'private', 'hemat', 'premium'])],
            'departure_city' => ['required', 'string', 'max:100'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'discount_label' => ['nullable', 'string', 'max:50'],
            'discount_ends_at' => ['nullable', 'date'],
            'currency' => ['required', 'string', 'size:3'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:'.$maxImageKilobytes],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:png,jpg,jpeg,webp', 'max:'.$maxImageKilobytes],
            'existing_images' => ['nullable', 'array'],
            'existing_images.*' => ['string'],
            'summary' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'content.room_original_prices' => ['nullable', 'array'],
            'content.room_original_prices.dbl' => ['nullable', 'numeric', 'min:0'],
            'content.room_original_prices.trpl' => ['nullable', 'numeric', 'min:0'],
            'content.room_original_prices.quad' => ['nullable', 'numeric', 'min:0'],
            'content.room_prices' => ['nullable', 'array'],
            'content.room_prices.dbl' => ['nullable', 'numeric', 'min:0'],
            'content.room_prices.trpl' => ['nullable', 'numeric', 'min:0'],
            'content.room_prices.quad' => ['nullable', 'numeric', 'min:0'],
            'itineraries' => ['nullable', 'array'],
            'itineraries.*.activity_id' => ['nullable', 'integer', 'exists:activities,id'],
            'itineraries.*.activity_ids' => ['nullable', 'array'],
            'itineraries.*.activity_ids.*' => ['integer', 'exists:activities,id'],
            'itineraries.*.day_number' => ['required', 'integer', 'min:1'],
            'itineraries.*.sort_order' => ['nullable', 'integer', 'min:1'],
            'itineraries.*.title' => ['nullable', 'string', 'max:255'],
            'itineraries.*.description' => ['nullable', 'string'],
            'itineraries.*.product_ids' => ['nullable', 'array'],
            'itineraries.*.product_ids.*' => ['integer', 'exists:products,id'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'product_multipliers' => ['nullable', 'array'],
            'product_multipliers.*' => ['integer', 'min:1'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama paket wajib diisi.',
            'original_price.gt' => 'Harga asli harus lebih besar dari harga jual.',
            'slug.unique' => 'Slug sudah digunakan.',
            'image.uploaded' => 'Upload gambar gagal. Pastikan ukuran file tidak melebihi batas server.',
            'images.*.uploaded' => 'Upload gambar gagal. Pastikan ukuran file tidak melebihi batas server.',
            'image.max' => 'Ukuran gambar maksimal :max KB.',
            'images.*.max' => 'Ukuran tiap gambar maksimal :max KB.',
            'image.mimes' => 'Format gambar harus png, jpg, jpeg, atau webp.',
            'images.*.mimes' => 'Format gambar harus png, jpg, jpeg, atau webp.',
        ];
    }
}
