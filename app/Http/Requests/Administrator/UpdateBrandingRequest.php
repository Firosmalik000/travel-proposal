<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'company_subtitle' => ['required', 'string', 'max:255'],
            'primary' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'secondary' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent_soft' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'surface' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'logo_white' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'primary.regex' => 'Warna primary harus memakai format hex, misalnya #c80012.',
            'secondary.regex' => 'Warna secondary harus memakai format hex, misalnya #8c0a16.',
            'accent.regex' => 'Warna accent harus memakai format hex, misalnya #ff9200.',
            'accent_soft.regex' => 'Warna accent soft harus memakai format hex, misalnya #ffc578.',
            'surface.regex' => 'Warna surface harus memakai format hex, misalnya #f6e7c6.',
        ];
    }
}
