<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreVendorAdvanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['package_vendor_id' => ['required', 'integer', 'exists:package_vendors,id'], 'amount_idr' => ['required', 'integer', 'min:1'], 'advance_date' => ['required', 'date'], 'financial_account_id' => ['required', 'integer', 'exists:financial_accounts,id'], 'notes' => ['required', 'string', 'max:1000'], 'idempotency_key' => ['required', 'string', 'max:150']];
    }
}
