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

    public function test_homepage_renders_section_background_overrides(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/website/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('function overlayIntensityMultiplier', $source);
        $this->assertStringContainsString('function buildGradientBackgroundStyle', $source);
        $this->assertStringContainsString('function sectionSurfaceClass', $source);
        $this->assertStringContainsString('function sectionStyleFromBackground', $source);
        $this->assertStringContainsString('function sectionOverlayStyleFromBackground', $source);
        $this->assertStringContainsString('function SectionBackgroundLayer', $source);
        $this->assertStringContainsString('overlay_intensity?:', $source);
        $this->assertStringContainsString("if (type === 'default' && accentColor)", $source);
        $this->assertStringContainsString("if (type === 'default')", $source);
        $this->assertStringContainsString('if (isDefault) {', $source);
        $this->assertStringContainsString('return {};', $source);
        $this->assertStringContainsString('linear-gradient(to top left', $source);
        $this->assertStringContainsString('radial-gradient(circle at bottom right', $source);
        $middleware = file_get_contents(__DIR__.'/../../app/Http/Middleware/HandleInertiaRequests.php') ?: '';
        $this->assertStringContainsString("'color' => '#0f766e'", $middleware);
        $this->assertStringContainsString("'overlay_intensity' => 'strong'", $middleware);
        $this->assertStringContainsString(
            'rgba(255, 255, 255, 0.14)',
            $source,
        );
        $this->assertStringContainsString('backgroundImage: `url(${image})`', $source);
        $this->assertStringContainsString('style={sectionStyleFromBackground(packagesBackground)}', $source);
        $this->assertStringContainsString('style={sectionStyleFromBackground(contactBackground)}', $source);
        $this->assertStringContainsString('tone="dark"', $source);
        $this->assertStringContainsString('tone="light"', $source);
    }
}
