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
        $content['general'] = [
            'siteName' => $request->string('site_name')->value(),
            'tagline' => $request->string('tagline')->value(),
            'defaultDescription' => $request->string('default_description')->value(),
            'keywords' => $request->string('keywords')->value(),
        ];
        $content['contact'] = [
            ...($content['contact'] ?? []),
            'phone' => $request->string('phone')->value(),
            'whatsapp' => $request->string('whatsapp')->value(),
            'email' => $request->string('email')->value(),
            'address' => [
                'full' => $request->string('address')->value(),
                'mapLink' => $request->string('map_link')->value(),
            ],
            'operatingHours' => [
                'weekday' => $request->string('weekday_hours')->value(),
                'weekend' => $request->string('weekend_hours')->value(),
            ],
        ];
        $content['social'] = [
            ...($content['social'] ?? []),
            'accounts' => is_array($request->input('social_accounts'))
                ? $request->input('social_accounts')
                : json_decode($request->string('social_accounts')->value() ?: '[]', true) ?? [],
            'ogTitle' => $request->string('og_title')->value(),
            'ogDescription' => $request->string('og_description')->value(),
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
        }

        $ogImagePath = Arr::get($settings, 'social.ogImage.path');
        if ($ogImagePath) {
            Arr::set($settings, 'social.ogImage.url', Storage::url($ogImagePath));
        }

        return $settings;
    }
}
