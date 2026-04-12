<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_name_id' => ['required', 'string', 'max:255'],
            'site_name_en' => ['required', 'string', 'max:255'],
            'tagline_id' => ['nullable', 'string', 'max:255'],
            'tagline_en' => ['nullable', 'string', 'max:255'],
            'default_description_id' => ['nullable', 'string'],
            'default_description_en' => ['nullable', 'string'],
            'keywords' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address_id' => ['nullable', 'string'],
            'address_en' => ['nullable', 'string'],
            'map_link' => ['nullable', 'url'],
            'weekday_hours_id' => ['nullable', 'string', 'max:255'],
            'weekday_hours_en' => ['nullable', 'string', 'max:255'],
            'weekend_hours_id' => ['nullable', 'string', 'max:255'],
            'weekend_hours_en' => ['nullable', 'string', 'max:255'],
            'robots_default' => ['nullable', 'string', 'max:255'],
            'canonical_base' => ['nullable', 'url'],
            'google_verification' => ['nullable', 'string', 'max:255'],
            'bing_verification' => ['nullable', 'string', 'max:255'],
            'primary' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'secondary' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent_soft' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'surface' => ['required', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'og_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }
}
