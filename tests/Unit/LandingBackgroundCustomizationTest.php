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
        $this->assertStringContainsString('SectionBackgroundEditor', $source);
        $this->assertStringContainsString('Background Image', $source);
    }

    public function test_homepage_renders_section_background_overrides(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/home/landing.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('function SectionBackground', $source);
        $this->assertStringContainsString('backgroundImage: `url(${image})`', $source);
    }
}
