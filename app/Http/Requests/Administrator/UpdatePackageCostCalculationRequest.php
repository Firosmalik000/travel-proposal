<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageCostCalculationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'package_price' => ['sometimes', 'required', 'integer', 'min:0'],
            'tour_leader_fee' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'muthawwif_fee' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
