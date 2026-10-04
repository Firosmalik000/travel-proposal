<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'package_vendor_id' => ['required', 'integer', 'exists:package_vendors,id'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'vendor_invoice_number' => ['nullable', 'string', 'max:100'],
            'bill_date' => ['required', 'date'], 'due_date' => ['nullable', 'date', 'after_or_equal:bill_date'],
            'amount_idr' => ['required', 'integer', 'min:1'], 'notes' => ['required', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:150'],
        ];
    }
}
