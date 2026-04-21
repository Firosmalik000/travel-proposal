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
        if (! is_array($name)) {
            $raw = $_POST;
            $this->merge([
                'name' => [
                    'id' => $raw['name.id'] ?? '',
                    'en' => $raw['name.en'] ?? '',
                ],
            ]);
        }

        $description = $this->input('description');
        if (! is_array($description)) {
            $raw = $_POST;
            $this->merge([
                'description' => [
                    'id' => $raw['description.id'] ?? '',
                    'en' => $raw['description.en'] ?? '',
                ],
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name.id' => ['required', 'string', 'max:255'],
            'name.en' => ['nullable', 'string', 'max:255'],
            'description.id' => ['nullable', 'string'],
            'description.en' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }
}
