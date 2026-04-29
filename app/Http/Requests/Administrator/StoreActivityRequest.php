<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        if (is_array($name)) {
            $this->merge([
                'name' => (string) ($name['id'] ?? ''),
            ]);
        } elseif ($this->has('name.id')) {
            $this->merge([
                'name' => (string) $this->input('name.id'),
            ]);
        }

        $description = $this->input('description');
        if (is_array($description)) {
            $this->merge([
                'description' => (string) ($description['id'] ?? ''),
            ]);
        } elseif ($this->has('description.id')) {
            $this->merge([
                'description' => (string) $this->input('description.id'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }
}
