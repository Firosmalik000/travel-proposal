<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\PdfBrandingService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PdfBrandingServiceTest extends TestCase
{
    public function test_it_resolves_uploaded_branding_logo_path_from_public_disk(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('branding/test-logo.png', 'fake-image');

        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'logoSourcePathFromSeoOrBranding');
        $method->setAccessible(true);

        $resolvedPath = $method->invoke($service, [], 'branding/test-logo.png');

        $this->assertSame(Storage::disk('public')->path('branding/test-logo.png'), $resolvedPath);
    }

    public function test_it_prefers_branding_logo_over_seo_logo(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('branding/test-logo.png', 'fake-image');
        Storage::disk('public')->put('seo/test-logo.png', 'fake-image');

        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'logoSourcePathFromSeoOrBranding');
        $method->setAccessible(true);

        $resolvedPath = $method->invoke($service, [
            'contact' => [
                'logo' => [
                    'path' => 'seo/test-logo.png',
                    'url' => '/storage/seo/test-logo.png',
                    'is_fallback' => false,
                ],
            ],
        ], 'branding/test-logo.png');

        $this->assertSame(Storage::disk('public')->path('branding/test-logo.png'), $resolvedPath);
    }

    public function test_it_keeps_public_branding_asset_path_for_default_logo(): void
    {
        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'logoSourcePathFromSeoOrBranding');
        $method->setAccessible(true);

        $resolvedPath = $method->invoke($service, [], '/branding/asfar-logo-default.png');

        $this->assertSame(public_path('branding/asfar-logo-default.png'), $resolvedPath);
    }

    public function test_it_resolves_seo_logo_from_public_url_when_path_is_missing(): void
    {
        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'logoSourcePathFromSeoOrBranding');
        $method->setAccessible(true);

        $resolvedPath = $method->invoke($service, [
            'contact' => [
                'logo' => [
                    'url' => '/branding/asfar-logo-default.png',
                    'is_fallback' => true,
                ],
            ],
        ], '');

        $this->assertSame(public_path('branding/asfar-logo-default.png'), $resolvedPath);
    }

    public function test_it_can_prepare_default_branding_asset_for_pdf_rendering(): void
    {
        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'renderableLogoFromPath');
        $method->setAccessible(true);

        $renderable = $method->invoke($service, public_path('branding/asfar-logo-default.png'));

        $this->assertIsArray($renderable);
        $this->assertNotEmpty($renderable['bytes'] ?? '');
        $this->assertContains($renderable['mime'] ?? '', ['image/png', 'image/jpeg']);
    }

    public function test_it_stores_prepared_pdf_logo_as_persistent_artifact(): void
    {
        $service = new PdfBrandingService;
        $method = new \ReflectionMethod($service, 'optimizedLogoTempPath');
        $method->setAccessible(true);

        $artifactPath = $method->invoke($service, public_path('branding/asfar-logo-default.png'));

        $this->assertIsString($artifactPath);
        $normalizedArtifactPath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $artifactPath);
        $this->assertStringContainsString('storage'.DIRECTORY_SEPARATOR.'app'.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.'branding'.DIRECTORY_SEPARATOR.'pdf-artifacts', $normalizedArtifactPath);
        $this->assertFileExists($artifactPath);
    }
}
