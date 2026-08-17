<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingBackgroundCustomizationTest extends TestCase
{
    public function test_landing_editor_supports_section_background_controls(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('.background.type', $source);
        $this->assertStringContainsString('.background.overlay_intensity', $source);
        $this->assertStringContainsString('SectionBackgroundEditor', $source);
        $this->assertStringContainsString('Background Image', $source);
        $this->assertStringContainsString('SelectItem value="soft"', $source);
        $this->assertStringContainsString('SelectItem value="strong"', $source);
    }

    public function test_homepage_uses_the_complete_editorial_mockup_structure(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/website/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('id="jadwal"', $source);
        $this->assertStringContainsString('id="galeri"', $source);
        $this->assertStringContainsString('id="paket"', $source);
        $this->assertStringContainsString('id="artikel"', $source);
        $this->assertStringContainsString('id="kontak"', $source);
        $this->assertStringContainsString('problemBadges.map', $source);
        $this->assertStringContainsString('galleryItems[imageIndex]', $source);
        $this->assertStringContainsString('services.slice(0, 4).map', $source);
        $this->assertStringContainsString('packageCards.map', $source);
        $this->assertStringContainsString('testimonials.map', $source);
        $this->assertStringContainsString('articles.slice(0, 3).map', $source);
        $this->assertStringContainsString('contactBannerImage', $source);
        $this->assertStringContainsString('contactOfficeHoursLines.map', $source);
    }

    public function test_modern_navigation_and_footer_are_shared_outside_landing_pages(): void
    {
        $publicLayout = file_get_contents(__DIR__.'/../../resources/js/layouts/PublicLayout.tsx');
        $applicationStyles = file_get_contents(__DIR__.'/../../resources/css/app.css');
        $landingPage = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');
        $landingPackagePage = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/package/index.tsx');

        $this->assertNotFalse($publicLayout);
        $this->assertNotFalse($applicationStyles);
        $this->assertNotFalse($landingPage);
        $this->assertNotFalse($landingPackagePage);
        $this->assertStringContainsString('bg-white/90', $publicLayout);
        $this->assertStringContainsString('from-[#220611] via-[#64132e] to-[#220611]', $publicLayout);
        $this->assertStringNotContainsString('--public-navbar-gradient-from', $publicLayout);
        $this->assertStringNotContainsString('@/layouts/PublicLayout', $landingPage);
        $this->assertStringNotContainsString('@/layouts/PublicLayout', $landingPackagePage);
        $this->assertLessThan(
            strpos($applicationStyles, '@keyframes route-progress'),
            strpos($applicationStyles, "@import 'tw-animate-css'"),
        );
    }
}
