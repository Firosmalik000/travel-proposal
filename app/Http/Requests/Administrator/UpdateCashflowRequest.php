<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCashflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_date' => ['required', 'date'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:1'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
            'deleted_attachment_ids' => ['nullable', 'array'],
            'deleted_attachment_ids.*' => ['required', 'integer'],
        ];
    }
}
