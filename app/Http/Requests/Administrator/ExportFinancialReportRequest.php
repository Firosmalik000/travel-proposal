<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportFinancialReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'report' => ['nullable', Rule::in([
                'trial-balance',
                'profit-loss',
                'balance-sheet',
                'cash-flow',
                'capital-movements',
                'trip-profitability',
                'budget-actual',
                'receivables',
                'payables',
                'inventory',
                'reconciliations',
                'periods',
                'audit-trail',
            ])],
        ];
    }
}
