<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class CloseFinancialPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period_code' => ['required', 'date_format:Y-m'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}
