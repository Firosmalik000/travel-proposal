<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class ApplyVendorAdvanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['amount_idr' => ['required', 'integer', 'min:1'], 'allocation_date' => ['required', 'date'], 'notes' => ['required', 'string', 'max:1000'], 'idempotency_key' => ['required', 'string', 'max:150']];
    }
}
