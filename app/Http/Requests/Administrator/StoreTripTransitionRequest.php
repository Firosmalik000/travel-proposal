<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripTransitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to_status' => ['required', 'in:ready,departed,returned,financially_closed'],
            'occurred_date' => ['required', 'date'],
            'notes' => ['required', 'string', 'min:5', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
