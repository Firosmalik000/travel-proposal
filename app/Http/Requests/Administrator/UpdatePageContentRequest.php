<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fallbackMap = [
            'title' => 'title_id',
            'excerpt' => 'excerpt_id',
        ];

        foreach ($fallbackMap as $target => $fallback) {
            if (! $this->filled($target) && $this->filled($fallback)) {
                $this->merge([
                    $target => (string) $this->input($fallback),
                ]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'content_json' => ['nullable', 'json'],
            'media' => ['nullable', 'array'],
            'media.*' => ['nullable', 'file', 'image', 'max:5120'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
