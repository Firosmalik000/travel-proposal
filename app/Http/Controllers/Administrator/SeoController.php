<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\UpdateSeoSettingsRequest;
use App\Models\PageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SeoController extends Controller
{
    private const SEO_SLUG = 'seo-settings';

    public function index(): Response
    {
        $settings = PageContent::query()->where('slug', self::SEO_SLUG)->value('content') ?? [];

        return Inertia::render('Dashboard/Administrator/Seo/Index', [
            'settings' => $this->withMediaUrls($settings),
        ]);
    }

    public function update(UpdateSeoSettingsRequest $request): RedirectResponse
    {
        $settings = PageContent::query()->firstOrCreate(
            ['slug' => self::SEO_SLUG],
            [
                'category' => 'settings',
                'title' => 'Pengaturan SEO',
                'excerpt' => 'Pengaturan SEO website',
                'content' => [],
                'is_active' => true,
            ],
        );

        $content = is_array($settings->content) ? $settings->content : [];

        $siteNameId = $request->string('site_name_id')->value() ?: $request->string('site_name')->value();
        $siteNameEn = $request->string('site_name_en')->value() ?: $siteNameId;
        $taglineId = $request->string('tagline_id')->value() ?: $request->string('tagline')->value();
        $taglineEn = $request->string('tagline_en')->value() ?: $taglineId;
        $defaultDescriptionId = $request->string('default_description_id')->value() ?: $request->string('default_description')->value();
        $defaultDescriptionEn = $request->string('default_description_en')->value() ?: $defaultDescriptionId;
        $addressId = $request->string('address_id')->value() ?: $request->string('address')->value();
        $addressEn = $request->string('address_en')->value() ?: $addressId;
        $ogTitleId = $request->string('og_title_id')->value() ?: $request->string('og_title')->value();
        $ogTitleEn = $request->string('og_title_en')->value() ?: $ogTitleId;
        $ogDescriptionId = $request->string('og_description_id')->value() ?: $request->string('og_description')->value();
        $ogDescriptionEn = $request->string('og_description_en')->value() ?: $ogDescriptionId;

        $content['general'] = [
            'siteName' => [
                'id' => $siteNameId,
                'en' => $siteNameEn,
            ],
            'tagline' => [
                'id' => $taglineId,
                'en' => $taglineEn,
            ],
            'defaultDescription' => [
                'id' => $defaultDescriptionId,
                'en' => $defaultDescriptionEn,
            ],
            'keywords' => $request->string('keywords')->value(),
        ];
        $content['contact'] = [
            ...($content['contact'] ?? []),
            'phone' => $request->string('phone')->value(),
            'whatsapp' => $request->string('whatsapp')->value(),
            'email' => $request->string('email')->value(),
            'address' => [
                'full' => [
                    'id' => $addressId,
                    'en' => $addressEn,
                ],
                'mapLink' => $request->string('map_link')->value(),
            ],
            'operatingHours' => [
                'weekday' => $request->string('weekday_hours')->value(),
                'weekend' => $request->string('weekend_hours')->value(),
            ],
        ];
        $content['social'] = [
            ...($content['social'] ?? []),
            'accounts' => $this->normalizeSocialAccounts(
                is_array($request->input('social_accounts'))
                    ? $request->input('social_accounts')
                    : json_decode($request->string('social_accounts')->value() ?: '[]', true) ?? [],
            ),
            'ogTitle' => [
                'id' => $ogTitleId,
                'en' => $ogTitleEn,
            ],
            'ogDescription' => [
                'id' => $ogDescriptionId,
                'en' => $ogDescriptionEn,
            ],
        ];
        $content['advanced'] = [
            'robotsDefault' => $request->string('robots_default')->value(),
            'canonicalBase' => $request->string('canonical_base')->value(),
            'googleVerification' => $request->string('google_verification')->value(),
            'bingVerification' => $request->string('bing_verification')->value(),
            'googleAnalyticsId' => $request->string('google_analytics_id')->value(),
        ];
        $content['colors'] = [
            'primary' => $request->string('primary')->value(),
            'secondary' => $request->string('secondary')->value(),
            'accent' => $request->string('accent')->value(),
            'accent_soft' => $request->string('accent_soft')->value(),
            'surface' => $request->string('surface')->value(),
        ];

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('seo', 'public');
            Arr::set($content, 'contact.logo.path', $path);
        }

        if ($request->hasFile('og_image')) {
            $path = $request->file('og_image')->store('seo', 'public');
            Arr::set($content, 'social.ogImage.path', $path);
        }

        $settings->update(['content' => $content]);

        return back()->with('success', 'SEO settings berhasil diperbarui.');
    }

    public static function getPublicSettings(): array
    {
        $settings = PageContent::query()->where('slug', self::SEO_SLUG)->value('content') ?? [];

        return (new self)->withMediaUrls($settings);
    }

    private function withMediaUrls(array $settings): array
    {
        $logoPath = Arr::get($settings, 'contact.logo.path');
        if ($logoPath) {
            Arr::set($settings, 'contact.logo.url', Storage::url($logoPath));
            Arr::set($settings, 'contact.logo.is_fallback', false);
        }

        $ogImagePath = Arr::get($settings, 'social.ogImage.path');
        if ($ogImagePath) {
            Arr::set($settings, 'social.ogImage.url', Storage::url($ogImagePath));
        }

        if (! Arr::get($settings, 'contact.logo.url')) {
            Arr::set($settings, 'contact.logo.url', $this->resolveBrandingLogoUrl());
            Arr::set($settings, 'contact.logo.is_fallback', true);
        }

        return $settings;
    }

    private function resolveBrandingLogoUrl(): string
    {
        $defaults = [
            'logo_path' => (string) config('branding.logo_path'),
        ];

        $overrides = PageContent::query()
            ->where('slug', 'branding-settings')
            ->value('content');

        if (! is_array($overrides)) {
            return $defaults['logo_path'];
        }

        return isset($overrides['logo_path'])
            ? '/storage/'.$overrides['logo_path']
            : $defaults['logo_path'];
    }

    /**
     * @param  array<int, mixed>  $accounts
     * @return array<int, array{platform:string,label:string,url:string}>
     */
    private function normalizeSocialAccounts(array $accounts): array
    {
        return collect($accounts)
            ->filter(fn ($item): bool => is_array($item))
            ->map(function (array $item): array {
                $platform = trim((string) ($item['platform'] ?? ''));
                $label = trim((string) ($item['label'] ?? $platform));
                $url = $this->normalizeExternalUrl((string) ($item['url'] ?? ''));

                return [
                    'platform' => $platform,
                    'label' => $label !== '' ? $label : $platform,
                    'url' => $url,
                ];
            })
            ->filter(fn (array $item): bool => $item['url'] !== '')
            ->values()
            ->all();
    }

    private function normalizeExternalUrl(string $url): string
    {
        $normalized = trim($url);
        if ($normalized === '') {
            return '';
        }

        if (preg_match('/^https?:\/\//i', $normalized)) {
            return $normalized;
        }

        if (str_starts_with($normalized, '//')) {
            return 'https:'.$normalized;
        }

        return 'https://'.$normalized;
    }
}
