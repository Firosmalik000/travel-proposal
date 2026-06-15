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
        $this->assertStringContainsString('hydrateLandingPackageSelection', $source);
        $this->assertStringContainsString('defaultLandingSelectedPackageIds', $source);
        $this->assertStringContainsString('private function landingPackageOptions(): array', $source);
    }

    public function test_landing_pages_use_selected_package_ids_and_limit_to_three(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('normalizeContent', $source);
        $this->assertStringContainsString('selected_package_ids', $source);
        $this->assertStringContainsString('const packageSlots: Array<CmsRecord | null>', $source);
        $this->assertStringContainsString('id="detail"', $source);
        $this->assertStringContainsString('packagesContent.more_packages_label', $source);
        $this->assertStringContainsString('footer.whatsapp_float_label', $source);
        $this->assertStringContainsString('(content.gallery as CmsRecord).description', $source);
        $this->assertStringContainsString('pricing_cards', $source);
        $this->assertStringContainsString('feature_cards', $source);
        $this->assertStringContainsString('package_details', $source);
        $this->assertStringContainsString('included', $source);
        $this->assertStringContainsString('excluded', $source);
        $this->assertStringContainsString('hero.secondary_cta_href', $source);
        $this->assertStringContainsString('included.section_badge', $source);
        $this->assertStringContainsString('reasons.heading', $source);
        $this->assertStringContainsString('(content.gallery as CmsRecord).heading', $source);
        $this->assertStringContainsString('item.note', $source);
    }

    public function test_landing_keunggulan_section_uses_all_configured_items(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('reasonItems.map((item, index) => {', $source);
        $this->assertStringNotContainsString('reasonItems.slice(0, 4).map', $source);
        $this->assertStringContainsString('const Icon = iconFor(item.icon);', $source);
        $this->assertStringContainsString('heroFeatureCards.map((item, index) => {', $source);
    }

    public function test_landing_package_editor_and_page_share_same_package_selection_flow(): void
    {
        $editorSource = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/LandingPromoEditor.tsx');
        $indexSource = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx');

        $this->assertNotFalse($editorSource);
        $this->assertNotFalse($indexSource);
        $this->assertStringContainsString('Paket Pilihan Landing', $editorSource);
        $this->assertStringContainsString("'packages.selected_package_ids'", $editorSource);
        $this->assertStringContainsString('packageOptions: PackageOption[]', $editorSource);
        $this->assertStringContainsString('packageOptions={packageOptions}', $indexSource);
    }
}
