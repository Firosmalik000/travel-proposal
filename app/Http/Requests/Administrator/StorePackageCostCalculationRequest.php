<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageCostCalculationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'travel_package_id' => ['required', 'integer', 'exists:packages,id'],
            'departure_schedule_id' => [
                'nullable',
                'integer',
                'exists:departure_schedules,id',
                Rule::exists('departure_schedules', 'id')
                    ->where(fn ($query) => $query->where('package_id', (int) $this->input('travel_package_id'))),
            ],
            'manual_adjustment' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
