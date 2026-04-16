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
                'title' => ['id' => 'SEO Settings', 'en' => 'SEO Settings'],
                'excerpt' => ['id' => 'Pengaturan SEO website', 'en' => 'Website SEO settings'],
                'content' => [],
                'is_active' => true,
            ],
        );

        $content = is_array($settings->content) ? $settings->content : [];
        $content['general'] = [
            'siteName' => ['id' => $request->string('site_name_id')->value(), 'en' => $request->string('site_name_en')->value()],
            'tagline' => ['id' => $request->string('tagline_id')->value(), 'en' => $request->string('tagline_en')->value()],
            'defaultDescription' => [
                'id' => $request->string('default_description_id')->value(),
                'en' => $request->string('default_description_en')->value(),
            ],
            'keywords' => $request->string('keywords')->value(),
        ];
        $content['contact'] = [
            ...($content['contact'] ?? []),
            'phone' => $request->string('phone')->value(),
            'whatsapp' => $request->string('whatsapp')->value(),
            'email' => $request->string('email')->value(),
            'address' => [
                'full' => ['id' => $request->string('address_id')->value(), 'en' => $request->string('address_en')->value()],
                'mapLink' => $request->string('map_link')->value(),
            ],
            'operatingHours' => [
                'weekday' => ['id' => $request->string('weekday_hours_id')->value(), 'en' => $request->string('weekday_hours_en')->value()],
                'weekend' => ['id' => $request->string('weekend_hours_id')->value(), 'en' => $request->string('weekend_hours_en')->value()],
            ],
        ];
        $content['social'] = [
            ...($content['social'] ?? []),
            'accounts' => is_array($request->input('social_accounts'))
                ? $request->input('social_accounts')
                : json_decode($request->string('social_accounts')->value() ?: '[]', true) ?? [],
            'ogTitle' => ['id' => $request->string('og_title_id')->value(), 'en' => $request->string('og_title_en')->value()],
            'ogDescription' => ['id' => $request->string('og_description_id')->value(), 'en' => $request->string('og_description_en')->value()],
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
