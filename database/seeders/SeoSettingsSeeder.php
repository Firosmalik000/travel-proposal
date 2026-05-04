<?php

namespace Database\Seeders;

use App\Models\PageContent;
use Illuminate\Database\Seeder;

class SeoSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = PageContent::query()->firstOrCreate([
            'slug' => 'seo-settings',
        ], [
            'category' => 'settings',
            'title' => 'Pengaturan SEO',
            'excerpt' => 'Pengaturan SEO website',
            'content' => [],
            'is_active' => true,
        ]);

        $content = is_array($settings->content) ? $settings->content : [];

        $appUrl = (string) config('app.url');
        $canonicalBase = rtrim($appUrl, '/');

        $companyName = (string) config('branding.company_name', config('app.name'));
        $companySubtitle = (string) config('branding.company_subtitle', '');

        $defaultDescription = $content['general']['defaultDescription']['id']
            ?? 'Wujudkan perjalanan umroh yang amanah, nyaman, dan terencana dengan layanan profesional serta bimbingan terbaik.';

        $content['general'] = array_merge([
            'siteName' => [
                'id' => $companyName,
                'en' => $companyName,
            ],
            'tagline' => [
                'id' => $companySubtitle,
                'en' => $companySubtitle,
            ],
            'defaultDescription' => [
                'id' => (string) $defaultDescription,
                'en' => (string) $defaultDescription,
            ],
            'keywords' => $content['general']['keywords'] ?? '',
        ], is_array($content['general'] ?? null) ? $content['general'] : []);

        $content['social'] = array_merge([
            'accounts' => $content['social']['accounts'] ?? [],
            'ogTitle' => [
                'id' => $companyName,
                'en' => $companyName,
            ],
            'ogDescription' => [
                'id' => (string) $defaultDescription,
                'en' => (string) $defaultDescription,
            ],
        ], is_array($content['social'] ?? null) ? $content['social'] : []);

        $content['advanced'] = array_merge([
            'robotsDefault' => $content['advanced']['robotsDefault'] ?? 'index, follow',
            'canonicalBase' => $content['advanced']['canonicalBase'] ?? $canonicalBase,
            'googleVerification' => $content['advanced']['googleVerification'] ?? '',
            'bingVerification' => $content['advanced']['bingVerification'] ?? '',
            'googleAnalyticsId' => $content['advanced']['googleAnalyticsId'] ?? '',
        ], is_array($content['advanced'] ?? null) ? $content['advanced'] : []);

        $settings->update([
            'content' => $content,
        ]);
    }
}
