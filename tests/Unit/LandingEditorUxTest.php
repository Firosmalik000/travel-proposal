<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingEditorUxTest extends TestCase
{
    public function test_landing_editor_has_homepage_section_navigation_and_collapsible_sections(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('Navigasi Section', $contents);
        $this->assertStringContainsString('Collapsible', $contents);
        $this->assertStringContainsString('Preview', $contents);
    }
}
