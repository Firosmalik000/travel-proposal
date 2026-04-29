<?php

namespace App\Services;

use App\Http\Controllers\Administrator\SeoController;
use App\Models\PageContent;
use Illuminate\Support\Facades\Storage;

class PdfBrandingService
{
    /**
     * @return array<string, mixed>
     */
    public function seo(): array
    {
        return SeoController::getPublicSettings();
    }

    /**
     * @return array{company_name:string, company_subtitle:string, logo_data_uri:string|null, palette:array<string,mixed>}
     */
    public function branding(): array
    {
        $defaults = [
            'company_name' => (string) config('branding.company_name'),
            'company_subtitle' => (string) config('branding.company_subtitle'),
            'logo_path' => (string) config('branding.logo_path'),
            'palette' => (array) config('branding.palette', []),
        ];

        $overrides = PageContent::query()
            ->where('slug', 'branding-settings')
            ->value('content');
        $overrides = is_array($overrides) ? $overrides : [];

        $seo = $this->seo();
        $logoPath = (string) ($overrides['logo_path'] ?? $defaults['logo_path']);
        $logoDataUri = $this->logoDataUriFromSeoOrBranding($seo, $logoPath);

        return [
            'company_name' => (string) ($overrides['company_name'] ?? $defaults['company_name']),
            'company_subtitle' => (string) ($overrides['company_subtitle'] ?? $defaults['company_subtitle']),
            'logo_data_uri' => $logoDataUri,
            'palette' => array_merge(
                $defaults['palette'],
                is_array($overrides['palette'] ?? null) ? $overrides['palette'] : [],
            ),
        ];
    }

    /**
     * @param  array<string, mixed>  $seo
     */
    private function logoDataUriFromSeoOrBranding(array $seo, string $brandingLogoPath): ?string
    {
        $seoLogoPath = (string) data_get($seo, 'contact.logo.path', '');

        if ($seoLogoPath !== '' && Storage::disk('public')->exists($seoLogoPath)) {
            return $this->fileToDataUri(Storage::disk('public')->path($seoLogoPath));
        }

        $brandingLogoPath = ltrim($brandingLogoPath, '/');

        if (str_starts_with($brandingLogoPath, 'storage/')) {
            $diskPath = substr($brandingLogoPath, strlen('storage/'));
            if (Storage::disk('public')->exists($diskPath)) {
                return $this->fileToDataUri(Storage::disk('public')->path($diskPath));
            }
        }

        $publicCandidate = public_path($brandingLogoPath);
        if (is_file($publicCandidate)) {
            return $this->fileToDataUri($publicCandidate);
        }

        return null;
    }

    private function fileToDataUri(string $path): ?string
    {
        if (! is_file($path)) {
            return null;
        }

        $bytes = @file_get_contents($path);
        if ($bytes === false) {
            return null;
        }

        $mime = 'image/png';
        if (class_exists(\finfo::class)) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $detected = $finfo->file($path);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }

        return 'data:'.$mime.';base64,'.base64_encode($bytes);
    }
}
