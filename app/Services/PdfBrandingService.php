<?php

namespace App\Services;

use App\Http\Controllers\Administrator\SeoController;
use App\Models\PageContent;
use Illuminate\Support\Facades\Storage;

class PdfBrandingService
{
    private const MAX_LOGO_SOURCE_BYTES = 8_000_000;

    private const MAX_LOGO_RENDER_BYTES = 700_000;

    private const MAX_LOGO_DIMENSION = 512;

    private const MAX_LOGO_PIXELS = 6_000_000;

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

        $size = @filesize($path);
        if (! is_int($size) || $size <= 0 || $size > self::MAX_LOGO_SOURCE_BYTES) {
            return null;
        }

        $dimensions = @getimagesize($path);
        if (! is_array($dimensions)) {
            return null;
        }

        $width = (int) ($dimensions[0] ?? 0);
        $height = (int) ($dimensions[1] ?? 0);
        if ($width <= 0 || $height <= 0) {
            return null;
        }

        $pixelCount = $width * $height;
        if ($pixelCount > self::MAX_LOGO_PIXELS) {
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

        $outputMime = $mime;
        $optimizedBytes = $this->optimizeImageForPdf($bytes, $mime);
        if ($optimizedBytes !== null) {
            $bytes = $optimizedBytes;
            $outputMime = ($mime === 'image/jpeg' || $mime === 'image/jpg')
                ? 'image/jpeg'
                : 'image/png';
        }

        if (strlen($bytes) > self::MAX_LOGO_RENDER_BYTES) {
            return null;
        }

        return 'data:'.$outputMime.';base64,'.base64_encode($bytes);
    }

    private function optimizeImageForPdf(string $bytes, string $mime): ?string
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $image = @imagecreatefromstring($bytes);
        if (! $image instanceof \GdImage) {
            return null;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        if ($width <= 0 || $height <= 0) {
            imagedestroy($image);

            return null;
        }

        $largestSide = max($width, $height);
        $targetImage = $image;

        if ($largestSide > self::MAX_LOGO_DIMENSION) {
            $ratio = self::MAX_LOGO_DIMENSION / $largestSide;
            $targetWidth = max(1, (int) round($width * $ratio));
            $targetHeight = max(1, (int) round($height * $ratio));

            $resized = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled(
                $resized,
                $image,
                0,
                0,
                0,
                0,
                $targetWidth,
                $targetHeight,
                $width,
                $height,
            );

            imagedestroy($image);
            $targetImage = $resized;
        }

        ob_start();
        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            imagejpeg($targetImage, null, 82);
        } else {
            imagepng($targetImage, null, 8);
        }
        $output = ob_get_clean();

        imagedestroy($targetImage);

        if (! is_string($output) || $output === '') {
            return null;
        }

        return $output;
    }
}
