<?php

namespace App\Http\Requests\Administrator;

use App\Models\VendorPricePeriod;
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

        $allInConfiguration = $this->input('all_in');
        if (is_string($allInConfiguration)) {
            $decoded = json_decode($allInConfiguration, true);
            $this->merge([
                'all_in' => is_array($decoded) ? $decoded : [],
            ]);
        }
    }

    public function rules(): array
    {
        $packageId = $this->route('package')?->id;
        $currentAllInConfiguration = $this->route('package')?->allInConfig;
        $currentPeriodId = $currentAllInConfiguration?->vendor_price_period_id;
        $maxImageKilobytes = ParticipantUploadLimit::kilobytes(4096);

        return [
            'slug' => ['required', 'string', 'max:100', Rule::unique('packages', 'slug')->ignore($packageId)],
            'name' => ['required', 'string', 'max:200'],
            'package_type' => ['required', 'string', Rule::in(['reguler', 'vip', 'private', 'hemat', 'premium'])],
            'departure_city' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'seats_total' => ['required', 'integer', 'min:1'],
            'booking_status' => ['required', 'string', Rule::in(['open', 'closed'])],
            'departure_notes' => ['nullable', 'string', 'max:255'],
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
            'content.hpp_estimate' => ['nullable', 'array'],
            'content.hpp_estimate.customers' => ['nullable', 'array'],
            'content.hpp_estimate.customers.single' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.customers.dbl' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.customers.trpl' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.customers.quad' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.customers_is_manual' => ['nullable', 'boolean'],
            'content.hpp_estimate.product_cost_per_customer' => ['nullable', 'numeric', 'min:0'],
            'content.hpp_estimate.product_quantities' => ['nullable', 'array'],
            'content.hpp_estimate.product_quantities.*' => ['integer', 'min:0'],
            'content.hpp_estimate.product_quantities_is_manual' => ['nullable', 'array'],
            'content.hpp_estimate.product_quantities_is_manual.*' => ['boolean'],
            'content.hpp_estimate.hotel_total' => ['nullable', 'numeric', 'min:0'],
            'content.hpp_estimate.hotel_allocations' => ['nullable', 'array'],
            'content.hpp_estimate.hotel_allocations.*' => ['array'],
            'content.hpp_estimate.hotel_allocations.*.dbl' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.hotel_allocations.*.trpl' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.hotel_allocations.*.quad' => ['nullable', 'integer', 'min:0'],
            'content.hpp_estimate.hotel_allocations_unit' => ['nullable', 'in:pax,rooms'],
            'content.hpp_estimate.hotel_allocations_is_manual' => ['nullable', 'array'],
            'content.hpp_estimate.hotel_allocations_is_manual.*' => ['boolean'],
            'content.hpp_estimate.tour_leader_fee' => ['nullable', 'numeric', 'min:0'],
            'content.hpp_estimate.tour_leader_fee_is_manual' => ['nullable', 'boolean'],
            'content.hpp_estimate.muthawwif_fee' => ['nullable', 'numeric', 'min:0'],
            'content.hpp_estimate.muthawwif_fee_is_manual' => ['nullable', 'boolean'],
            'content.hpp_estimate.other_cost' => ['nullable', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs' => ['nullable', 'array'],
            'content.hpp_estimate.operational_costs.overhead.amount' => ['required_with:content.hpp_estimate.operational_costs', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.overhead.mode' => ['required_with:content.hpp_estimate.operational_costs', Rule::in(['total', 'per_pax'])],
            'content.hpp_estimate.operational_costs.photographer.count' => ['required_with:content.hpp_estimate.operational_costs', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.photographer.daily_salary' => ['required_with:content.hpp_estimate.operational_costs', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.photographer.days' => ['required_with:content.hpp_estimate.operational_costs', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.human_resources' => ['nullable', 'array'],
            'content.hpp_estimate.operational_costs.human_resources.*.id' => ['required', 'string', 'max:50'],
            'content.hpp_estimate.operational_costs.human_resources.*.name' => ['required', 'string', 'max:100'],
            'content.hpp_estimate.operational_costs.human_resources.*.salary' => ['required', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.tour_leader.count' => ['required_with:content.hpp_estimate.operational_costs', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.tour_leader.salary_per_trip' => ['required_with:content.hpp_estimate.operational_costs', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.tour_leader.include_hotel' => ['required_with:content.hpp_estimate.operational_costs', 'boolean'],
            'content.hpp_estimate.operational_costs.tour_leader.include_ticket_and_visa' => ['required_with:content.hpp_estimate.operational_costs', 'boolean'],
            'content.hpp_estimate.operational_costs.muthawwif.count' => ['required_with:content.hpp_estimate.operational_costs', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.muthawwif.daily_salary' => ['required_with:content.hpp_estimate.operational_costs', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.muthawwif.days' => ['required_with:content.hpp_estimate.operational_costs', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.muthawwif.currency' => ['required_with:content.hpp_estimate.operational_costs', 'string', 'size:3'],
            'content.hpp_estimate.operational_costs.muthawwif.include_hotel' => ['required_with:content.hpp_estimate.operational_costs', 'boolean'],
            'content.hpp_estimate.operational_costs.marketing.amount_per_pax' => ['required_with:content.hpp_estimate.operational_costs', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.guide_tips' => ['nullable', 'array'],
            'content.hpp_estimate.operational_costs.guide_tips.*.id' => ['required', 'string', 'max:50'],
            'content.hpp_estimate.operational_costs.guide_tips.*.country' => ['required', 'string', 'max:100'],
            'content.hpp_estimate.operational_costs.guide_tips.*.amount_per_day' => ['required', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.guide_tips.*.days' => ['required', 'integer', 'min:0'],
            'content.hpp_estimate.operational_costs.guide_tips.*.currency' => ['required', 'string', 'size:3'],
            'content.hpp_estimate.operational_costs.guide_tips.*.mode' => ['required', Rule::in(['per_pax', 'per_group'])],
            'content.hpp_estimate.operational_costs.driver_tips' => ['nullable', 'array'],
            'content.hpp_estimate.operational_costs.driver_tips.*.id' => ['required', 'string', 'max:50'],
            'content.hpp_estimate.operational_costs.driver_tips.*.country' => ['required', 'string', 'max:100'],
            'content.hpp_estimate.operational_costs.driver_tips.*.amount' => ['required', 'numeric', 'min:0'],
            'content.hpp_estimate.operational_costs.driver_tips.*.currency' => ['required', 'string', 'size:3'],
            'content.hpp_estimate.notes' => ['nullable', 'string', 'max:1000'],
            'content.hpp_currency_snapshots' => ['nullable', 'array'],
            'content.hpp_currency_snapshots.*.currency' => ['nullable', 'string', 'size:3'],
            'content.hpp_currency_snapshots.*.rate_to_idr' => ['required_with:content.hpp_currency_snapshots', 'numeric', 'gt:0'],
            'content.hpp_currency_snapshots.*.source' => ['nullable', 'string', 'max:30'],
            'content.hpp_currency_snapshots.*.fetched_at' => ['nullable', 'date'],
            'all_in' => ['nullable', 'array'],
            'all_in.enabled' => ['required_with:all_in', 'boolean'],
            'all_in.vendor_id' => ['nullable', 'required_if:all_in.enabled,true', 'integer', Rule::exists('package_vendors', 'id')],
            'all_in.period_id' => ['nullable', 'required_if:all_in.enabled,true', 'integer', Rule::exists('vendor_price_periods', 'id')->where(
                fn ($query) => $query->where('is_active', true)->when(
                    $currentPeriodId !== null,
                    fn ($activeQuery) => $activeQuery->orWhere('id', $currentPeriodId),
                ),
            )],
            'all_in.broker_package_name' => ['nullable', 'required_if:all_in.enabled,true', 'string', 'max:150'],
            'all_in.currency' => ['nullable', 'required_if:all_in.enabled,true', 'string', 'size:3'],
            'all_in.price_per_pax' => ['nullable', 'required_if:all_in.enabled,true', 'numeric', 'gt:0'],
            'all_in.included_category_keys' => ['exclude_unless:all_in.enabled,true', 'array', 'min:1'],
            'all_in.included_category_keys.*' => ['string', Rule::exists('product_categories', 'key')->where('is_active', true)],
            'refresh_currency_rates' => ['nullable', 'boolean'],
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
            'all_in.vendor_id.required_if' => 'Vendor wajib dipilih ketika Paket All In aktif.',
            'all_in.period_id.required_if' => 'Periode harga vendor wajib dipilih ketika Paket All In aktif.',
            'all_in.broker_package_name.required_if' => 'Nama broker atau paket vendor wajib diisi.',
            'all_in.price_per_pax.gt' => 'Harga All In per jamaah harus lebih besar dari nol.',
            'all_in.included_category_keys.required_if' => 'Pilih minimal satu kategori yang ditanggung vendor.',
            'content.hpp_estimate.operational_costs.human_resources.*.name.required' => 'Nama atau peran SDM wajib diisi.',
            'content.hpp_estimate.operational_costs.guide_tips.*.country.required' => 'Negara untuk tips guide wajib diisi.',
            'content.hpp_estimate.operational_costs.driver_tips.*.country.required' => 'Negara untuk tips sopir wajib diisi.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $package = $this->route('package');

            if ($package !== null && $this->integer('seats_total') < $package->bookedPassengerCount()) {
                $validator->errors()->add(
                    'seats_total',
                    'Total seat tidak boleh lebih kecil dari jumlah jamaah yang sudah registered.',
                );
            }

            if (! $this->boolean('all_in.enabled')) {
                return;
            }

            $period = VendorPricePeriod::query()->find($this->integer('all_in.period_id'));
            if ($period === null) {
                return;
            }

            if ($period->package_vendor_id !== $this->integer('all_in.vendor_id')) {
                $validator->errors()->add('all_in.period_id', 'Periode harga tidak termasuk dalam vendor yang dipilih.');
            }

            $packageStart = $this->date('start_date');
            $packageEnd = $this->date('end_date');
            $existingConfiguration = $package?->allInConfig;
            $keepsSelectedPeriod = $existingConfiguration !== null
                && $existingConfiguration->package_vendor_id === $this->integer('all_in.vendor_id')
                && $existingConfiguration->vendor_price_period_id === $period->id;
            $periodStart = $keepsSelectedPeriod
                ? $existingConfiguration->period_start_snapshot
                : $period->start_date;
            $periodEnd = $keepsSelectedPeriod
                ? $existingConfiguration->period_end_snapshot
                : $period->end_date;
            if ($packageStart !== null && $packageEnd !== null && (
                $packageStart->lt($periodStart) || $packageEnd->gt($periodEnd)
            )) {
                $validator->errors()->add(
                    'all_in.period_id',
                    'Periode harga vendor harus mencakup seluruh tanggal keberangkatan package.',
                );
            }

        });
    }
}
