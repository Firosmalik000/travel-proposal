<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveCustomUmrohRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'passenger_count' => ['required', 'integer', 'min:1', 'max:1000'],
            'origin_city' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'custom_departure_date' => ['nullable', 'date'],
            'custom_return_date' => ['nullable', 'date', 'after_or_equal:custom_departure_date'],
            'custom_unit_price' => ['required', 'integer', 'min:0'],
        ];
    }
}
