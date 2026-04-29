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

        $fallbackMap = [
            'site_name' => 'site_name_id',
            'tagline' => 'tagline_id',
            'default_description' => 'default_description_id',
            'address' => 'address_id',
            'weekday_hours' => 'weekday_hours_id',
            'weekend_hours' => 'weekend_hours_id',
            'og_title' => 'og_title_id',
            'og_description' => 'og_description_id',
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
            'site_name' => ['nullable', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'default_description' => ['nullable', 'string'],
            'keywords' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'map_link' => ['nullable', 'string', 'max:2000'],
            'weekday_hours' => ['nullable', 'string', 'max:255'],
            'weekend_hours' => ['nullable', 'string', 'max:255'],
            'social_accounts' => ['nullable', 'array'],
            'social_accounts.*.platform' => ['required_with:social_accounts', 'string', 'max:50'],
            'social_accounts.*.label' => ['nullable', 'string', 'max:100'],
            'social_accounts.*.url' => ['required_with:social_accounts', 'string', 'max:500'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string'],
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
