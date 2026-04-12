<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title_id' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'excerpt_id' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'content_json' => ['nullable', 'json'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
