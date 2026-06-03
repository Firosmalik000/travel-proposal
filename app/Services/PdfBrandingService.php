<?php

namespace App\Services;

use App\Http\Controllers\Administrator\SeoController;
use App\Models\PageContent;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PdfBrandingService
{
    private const PDF_LOGO_CACHE_VERSION = 'v4';

    private const MAX_LOGO_SOURCE_BYTES = 8_000_000;

    private const MAX_LOGO_RENDER_BYTES = 300_000;

    private const MAX_LOGO_DIMENSION = 256;

    private const MAX_LOGO_PIXELS = 30_000_000;

    /**
     * @return array<string, mixed>
     */
    public function seo(): array
    {
        return SeoController::getPublicSettings();
    }

    /**
     * @return array{company_name:string, company_subtitle:string, logo_data_uri:string|null, logo_source_path:string|null, logo_source_url:string|null, logo_inline_svg:null, palette:array<string,mixed>}
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
        $resolvedLogoPath = $this->logoSourcePathFromSeoOrBranding($seo, $logoPath);
        $preparedLogo = $resolvedLogoPath ? $this->preparedLogo($resolvedLogoPath) : null;
        $logoDataUri = $preparedLogo['data_uri'] ?? null;
        $logoSourcePath = $preparedLogo['path'] ?? null;
        $logoSourceUrl = $logoSourcePath ? $this->pathToFileUrl($logoSourcePath) : null;

        return [
            'company_name' => (string) ($overrides['company_name'] ?? $defaults['company_name']),
            'company_subtitle' => (string) ($overrides['company_subtitle'] ?? $defaults['company_subtitle']),
            'logo_data_uri' => $logoDataUri,
            'logo_source_path' => $logoSourcePath,
            'logo_source_url' => $logoSourceUrl,
            'logo_inline_svg' => null,
            'palette' => array_merge(
                $defaults['palette'],
                is_array($overrides['palette'] ?? null) ? $overrides['palette'] : [],
            ),
        ];
    }

    /**
     * @return array{path:string,data_uri:string}|null
     */
    private function preparedLogo(string $path): ?array
    {
        $cachedPath = $this->optimizedLogoTempPath($path);
        if (! is_string($cachedPath) || ! is_file($cachedPath)) {
            return null;
        }

        $bytes = @file_get_contents($cachedPath);
        if (! is_string($bytes) || $bytes === '') {
            return null;
        }

        $mime = 'image/png';
        if (class_exists(\finfo::class)) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $detected = $finfo->file($cachedPath);
            if (is_string($detected) && $detected !== '') {
                $mime = $detected;
            }
        }

        return [
            'path' => $cachedPath,
            'data_uri' => 'data:'.$mime.';base64,'.base64_encode($bytes),
        ];
    }

    /**
     * @param  array<string, mixed>  $seo
     */
    private function logoSourcePathFromSeoOrBranding(array $seo, string $brandingLogoPath): ?string
    {
        $brandingLogoPath = ltrim($brandingLogoPath, '/');

        if (str_starts_with($brandingLogoPath, 'storage/')) {
            $diskPath = substr($brandingLogoPath, strlen('storage/'));
            if (Storage::disk('public')->exists($diskPath)) {
                return Storage::disk('public')->path($diskPath);
            }
        }

        if ($brandingLogoPath !== '' && Storage::disk('public')->exists($brandingLogoPath)) {
            return Storage::disk('public')->path($brandingLogoPath);
        }
        $seoLogoPath = (string) data_get($seo, 'contact.logo.path', '');

        if ($seoLogoPath !== '' && Storage::disk('public')->exists($seoLogoPath)) {
            return Storage::disk('public')->path($seoLogoPath);
        }

        $seoLogoUrl = (string) data_get($seo, 'contact.logo.url', '');

        if ($seoLogoUrl !== '') {
            $resolvedSeoUrlPath = $this->pathFromPublicUrl($seoLogoUrl);

            if ($resolvedSeoUrlPath !== null) {
                return $resolvedSeoUrlPath;
            }
        }

        $publicCandidate = public_path($brandingLogoPath);
        if (is_file($publicCandidate)) {
            return $publicCandidate;
        }

        return null;
    }

    private function pathFromPublicUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path) || trim($path) === '') {
            return null;
        }

        $normalizedPath = ltrim($path, '/');

        if (Str::startsWith($normalizedPath, 'storage/')) {
            $diskPath = substr($normalizedPath, strlen('storage/'));

            if ($diskPath !== '' && Storage::disk('public')->exists($diskPath)) {
                return Storage::disk('public')->path($diskPath);
            }
        }

        $publicPath = public_path($normalizedPath);

        return is_file($publicPath) ? $publicPath : null;
    }

    private function optimizedLogoTempPath(string $path): ?string
    {
        $directory = storage_path('app/public/branding/pdf-artifacts');
        if (! File::exists($directory)) {
            File::makeDirectory($directory, recursive: true);
        }

        $cacheKey = $this->logoCacheKey($path);
        $cachedPngPath = $directory.DIRECTORY_SEPARATOR.$cacheKey.'.png';
        $cachedJpgPath = $directory.DIRECTORY_SEPARATOR.$cacheKey.'.jpg';

        if (File::exists($cachedPngPath)) {
            return $cachedPngPath;
        }

        if (File::exists($cachedJpgPath)) {
            return $cachedJpgPath;
        }

        $renderableLogo = $this->renderableLogoFromPath($path);

        if ($renderableLogo === null) {
            return null;
        }

        $extension = $renderableLogo['mime'] === 'image/jpeg' ? 'jpg' : 'png';
        $targetPath = $directory.DIRECTORY_SEPARATOR.$cacheKey.'.'.$extension;

        if (! File::exists($targetPath)) {
            File::put($targetPath, $renderableLogo['bytes']);
        }

        return $targetPath;
    }

    private function logoCacheKey(string $path): string
    {
        $size = @filesize($path) ?: 0;
        $modifiedAt = @filemtime($path) ?: 0;

        return sha1(implode('|', [
            self::PDF_LOGO_CACHE_VERSION,
            $path,
            (string) $size,
            (string) $modifiedAt,
        ]));
    }

    private function pathToFileUrl(string $path): string
    {
        $normalizedPath = str_replace('\\', '/', $path);

        if (preg_match('/^[A-Za-z]:\//', $normalizedPath) === 1) {
            return 'file:///'.rawurlencode(substr($normalizedPath, 0, 1)).':'.str_replace('%2F', '/', rawurlencode(substr($normalizedPath, 2)));
        }

        return 'file://'.$normalizedPath;
    }

    /**
     * @return array{bytes:string, mime:string}|null
     */
    private function renderableLogoFromPath(string $path): ?array
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

        if ($pixelCount > 6_000_000) {
            @ini_set('memory_limit', '512M');
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

        return [
            'bytes' => $bytes,
            'mime' => $outputMime,
        ];
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

        $targetImage = $this->trimImageCanvas($image, $mime);
        if (! $targetImage instanceof \GdImage) {
            $targetImage = $image;
        } elseif ($targetImage !== $image) {
            imagedestroy($image);
        }

        $width = imagesx($targetImage);
        $height = imagesy($targetImage);
        if ($width <= 0 || $height <= 0) {
            imagedestroy($targetImage);

            return null;
        }

        $largestSide = max($width, $height);

        if ($largestSide > self::MAX_LOGO_DIMENSION) {
            $ratio = self::MAX_LOGO_DIMENSION / $largestSide;
            $targetWidth = max(1, (int) round($width * $ratio));
            $targetHeight = max(1, (int) round($height * $ratio));

            $resized = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled(
                $resized,
                $targetImage,
                0,
                0,
                0,
                0,
                $targetWidth,
                $targetHeight,
                $width,
                $height,
            );

            imagedestroy($targetImage);
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

    private function trimImageCanvas(\GdImage $image, string $mime): \GdImage
    {
        $bounds = $this->detectVisibleBounds($image, $mime);

        if ($bounds === null) {
            return $image;
        }

        $cropped = @imagecrop($image, $bounds);

        return $cropped instanceof \GdImage ? $cropped : $image;
    }

    /**
     * @return array{x:int,y:int,width:int,height:int}|null
     */
    private function detectVisibleBounds(\GdImage $image, string $mime): ?array
    {
        $width = imagesx($image);
        $height = imagesy($image);

        $minX = $width;
        $minY = $height;
        $maxX = -1;
        $maxY = -1;

        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgba = imagecolorat($image, $x, $y);
                $alpha = ($rgba >> 24) & 0x7F;
                $red = ($rgba >> 16) & 0xFF;
                $green = ($rgba >> 8) & 0xFF;
                $blue = $rgba & 0xFF;

                $isVisible = $mime === 'image/png'
                    ? $alpha < 120
                    : ! $this->isNearWhite($red, $green, $blue);

                if (! $isVisible) {
                    continue;
                }

                $minX = min($minX, $x);
                $minY = min($minY, $y);
                $maxX = max($maxX, $x);
                $maxY = max($maxY, $y);
            }
        }

        if ($maxX < $minX || $maxY < $minY) {
            return null;
        }

        return [
            'x' => max(0, $minX),
            'y' => max(0, $minY),
            'width' => max(1, $maxX - $minX + 1),
            'height' => max(1, $maxY - $minY + 1),
        ];
    }

    private function isNearWhite(int $red, int $green, int $blue): bool
    {
        return $red >= 245 && $green >= 245 && $blue >= 245;
    }
}
