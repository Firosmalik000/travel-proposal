<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePackageDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('payload'))) {
            $decoded = json_decode((string) $this->input('payload'), true);
            $this->merge(['payload' => is_array($decoded) ? $decoded : null]);
        }
    }

    public function rules(): array
    {
        return [
            'payload' => ['required', 'array'],
            'payload.slug' => ['nullable', 'string', 'max:100'],
            'payload.name.id' => ['nullable', 'string', 'max:200'],
            'payload.name.en' => ['nullable', 'string', 'max:200'],
            'payload.package_type' => ['nullable', 'string', 'max:30'],
            'payload.departure_city' => ['nullable', 'string', 'max:100'],
            'payload.start_date' => ['nullable', 'date_format:Y-m-d'],
            'payload.end_date' => ['nullable', 'date_format:Y-m-d'],
            'payload.seats_total' => ['nullable', 'integer', 'min:0'],
            'payload.booking_status' => ['nullable', 'in:open,closed'],
            'payload.duration_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'payload.departure_notes' => ['nullable', 'string', 'max:255'],
            'payload.price' => ['nullable', 'numeric', 'min:0'],
            'payload.original_price' => ['nullable', 'numeric', 'min:0'],
            'payload.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payload.discount_label' => ['nullable', 'string', 'max:50'],
            'payload.discount_ends_at' => ['nullable', 'date'],
            'payload.currency' => ['nullable', 'string', 'size:3'],
            'payload.summary.id' => ['nullable', 'string', 'max:5000'],
            'payload.summary.en' => ['nullable', 'string', 'max:5000'],
            'payload.content' => ['nullable', 'array'],
            'payload.itineraries' => ['nullable', 'array', 'max:365'],
            'payload.product_ids' => ['nullable', 'array', 'max:200'],
            'payload.product_ids.*' => ['integer'],
            'payload.product_multipliers' => ['nullable', 'array'],
            'payload.custom_products' => ['nullable', 'array', 'max:50'],
            'payload.all_in' => ['nullable', 'array'],
            'payload.is_featured' => ['nullable', 'boolean'],
            'payload.is_active' => ['nullable', 'boolean'],
            'payload.refresh_currency_rates' => ['nullable', 'boolean'],
            'payload.existing_images' => ['nullable', 'array', 'max:30'],
            'payload.existing_images.*' => ['string', 'max:500'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $encodedPayload = json_encode($this->input('payload', []));

            if (! is_string($encodedPayload) || strlen($encodedPayload) > 2_000_000) {
                $validator->errors()->add(
                    'payload',
                    'Draft terlalu besar. Kurangi data package lalu coba lagi.',
                );
            }
        });
    }
}
