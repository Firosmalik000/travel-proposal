<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingPackageSelectionWiringTest extends TestCase
{
    public function test_landing_editor_receives_package_options_from_controller(): void
    {
        $source = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/ContentController.php');

        $this->assertNotFalse($source);
        $this->assertStringContainsString("'packageOptions' => \$this->landingPackageOptions()", $source);
        $this->assertStringContainsString('private function landingPackageOptions(): array', $source);
    }

    public function test_landing_pages_use_selected_package_ids_and_limit_to_three(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('selected_package_ids', $source);
        $this->assertStringContainsString('selectedPackages.slice(0, 3)', $source);
        $this->assertStringContainsString('href="/paket-umroh"', $source);
    }
}
