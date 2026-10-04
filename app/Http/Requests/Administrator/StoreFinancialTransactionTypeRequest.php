<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreFinancialTransactionTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9_]+$/', 'unique:financial_transaction_types,code'],
            'name' => ['required', 'string', 'max:120'],
            'applies_to' => ['required', Rule::in(['transfer', 'manual_journal'])],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:65535'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name'));
        $code = trim((string) $this->input('code'));

        $this->merge([
            'name' => $name,
            'code' => Str::of($code !== '' ? $code : $name)->lower()->slug('_')->value(),
            'description' => filled($this->input('description')) ? trim((string) $this->input('description')) : null,
            'is_active' => $this->boolean('is_active', true),
            'sort_order' => (int) $this->input('sort_order', 0),
        ]);
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'code' => 'kode jenis',
            'name' => 'nama jenis',
            'applies_to' => 'penggunaan',
            'description' => 'keterangan',
            'is_active' => 'status aktif',
            'sort_order' => 'urutan',
        ];
    }
}
