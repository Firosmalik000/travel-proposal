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

    public function test_landing_keunggulan_last_item_is_not_locked_from_deletion(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('onClick={() => removeServiceItem(index)}', $contents);
        $this->assertStringNotContainsString('disabled={serviceItems.length <= 1}', $contents);
    }

    public function test_landing_keunggulan_can_restore_default_items_without_forcing_empty_state(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('Gunakan Default', $contents);
        $this->assertStringContainsString('buildDefaultLandingServiceItems()', $contents);
        $this->assertStringContainsString(
            'const totalItems = hasConfiguredServiceItems ? items.length : 4;',
            $contents,
        );
    }
}
