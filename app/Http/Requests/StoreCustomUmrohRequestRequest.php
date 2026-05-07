<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomUmrohRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'origin_city' => ['required', 'string', 'max:255'],
            'passenger_count' => ['required', 'integer', 'min:1', 'max:1000'],

            'group_type' => ['required', 'string', 'max:255'],
            'departure_month' => ['required', 'string', 'max:20'],
            'departure_date' => ['nullable', 'date'],
            'return_date' => ['nullable', 'date', 'after_or_equal:departure_date'],
            'budget' => ['nullable', 'integer', 'min:0'],
            'focus' => ['required', 'string', 'max:255'],
            'room_preference' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
