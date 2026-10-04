<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportFinancialLedgerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'report' => ['nullable', Rule::in(['journal', 'general-ledger'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'account_id' => ['nullable', 'integer', 'exists:financial_accounts,id'],
            'transaction_type' => ['nullable', Rule::in([
                'opening_balance', 'manual_journal', 'transfer', 'legacy_unclassified', 'booking_payment',
                'capital_contribution', 'owner_withdrawal', 'operating_expense', 'other_income', 'customer_refund',
                'agent_commission', 'inventory_purchase', 'inventory_issue', 'vendor_bill', 'vendor_payment',
                'vendor_advance_payment', 'vendor_advance_application', 'vendor_service_use',
                'trip_revenue_recognition', 'period_adjustment', 'reversal',
            ])],
            'category_code' => ['nullable', 'exists:financial_transaction_types,code'],
            'status' => ['nullable', Rule::in(['posted', 'reversed'])],
            'search' => ['nullable', 'string', 'max:100'],
        ];
    }
}
