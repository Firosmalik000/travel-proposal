<?php

namespace App\Http\Requests\Administrator;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $socialAccounts = $this->input('social_accounts');
        if (is_string($socialAccounts)) {
            $socialAccounts = json_decode($socialAccounts, true);
        }
        $filtered = is_array($socialAccounts)
            ? array_values(array_filter($socialAccounts, fn ($item) => ! empty($item['url'])))
            : [];
        $this->merge(['social_accounts' => $filtered]);
    }

    public function rules(): array
    {
        return [
            'site_name_id' => ['nullable', 'string', 'max:255'],
            'site_name_en' => ['nullable', 'string', 'max:255'],
            'tagline_id' => ['nullable', 'string', 'max:255'],
            'tagline_en' => ['nullable', 'string', 'max:255'],
            'default_description_id' => ['nullable', 'string'],
            'default_description_en' => ['nullable', 'string'],
            'keywords' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address_id' => ['nullable', 'string'],
            'address_en' => ['nullable', 'string'],
            'map_link' => ['nullable', 'string', 'max:2000'],
            'weekday_hours_id' => ['nullable', 'string', 'max:255'],
            'weekday_hours_en' => ['nullable', 'string', 'max:255'],
            'weekend_hours_id' => ['nullable', 'string', 'max:255'],
            'weekend_hours_en' => ['nullable', 'string', 'max:255'],
            'social_accounts' => ['nullable', 'array'],
            'social_accounts.*.platform' => ['required_with:social_accounts', 'string', 'max:50'],
            'social_accounts.*.label' => ['nullable', 'string', 'max:100'],
            'social_accounts.*.url' => ['required_with:social_accounts', 'string', 'max:500'],
            'og_title_id' => ['nullable', 'string', 'max:255'],
            'og_title_en' => ['nullable', 'string', 'max:255'],
            'og_description_id' => ['nullable', 'string'],
            'og_description_en' => ['nullable', 'string'],
            'robots_default' => ['nullable', 'string', 'max:255'],
            'canonical_base' => ['nullable', 'string', 'max:500'],
            'google_verification' => ['nullable', 'string', 'max:255'],
            'bing_verification' => ['nullable', 'string', 'max:255'],
            'google_analytics_id' => ['nullable', 'string', 'max:50'],
            'primary' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'secondary' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'accent_soft' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'surface' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'og_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }
}
