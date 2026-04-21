<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'departure_date' => ['required', 'date'],
            'return_date' => ['nullable', 'date', 'after_or_equal:departure_date'],
            'departure_city' => ['required', 'string', 'max:100'],
            'seats_total' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', Rule::in(['open', 'full', 'closed'])],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'return_date.after_or_equal' => 'Tanggal pulang harus sama atau setelah tanggal berangkat.',
        ];
    }
}
