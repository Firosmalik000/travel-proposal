<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryIssueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'transaction_date' => ['required', 'date'],
            'notes' => ['required', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
