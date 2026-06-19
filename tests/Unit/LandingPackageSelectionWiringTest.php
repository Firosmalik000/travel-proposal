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
        $this->assertStringContainsString('packagesContent.detail_label', $source);
        $this->assertStringContainsString('packagesContent.price_unit_label', $source);
        $this->assertStringContainsString('packagesContent.disclaimer', $source);
        $this->assertStringContainsString('(content.faq as CmsRecord).description', $source);
        $this->assertStringContainsString('getPublicSocialAccounts', $source);
        $this->assertStringContainsString('location.address_label', $source);
        $this->assertStringContainsString('content.gallery as CmsRecord', $source);
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
        $this->assertStringContainsString('LANDING_NAV_ITEMS', $source);
        $this->assertStringContainsString('LANDING_FOOTER_PACKAGE_LINKS', $source);
        $this->assertStringNotContainsString('footer.package_column_title', $source);
        $this->assertStringNotContainsString('footer.whatsapp_float_label', $source);
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
        $this->assertStringContainsString("'packages.detail_label'", $editorSource);
        $this->assertStringContainsString("'packages.disclaimer'", $editorSource);
        $this->assertStringContainsString("'location.address_label'", $editorSource);
        $this->assertStringContainsString('packageOptions: PackageOption[]', $editorSource);
        $this->assertStringNotContainsString('sectionId="landing-editor-navbar"', $editorSource);
        $this->assertStringNotContainsString('sectionId="landing-editor-footer"', $editorSource);
        $this->assertStringContainsString('packageOptions={packageOptions}', $indexSource);
    }

    public function test_landing_seed_contains_only_manageable_landing_content(): void
    {
        $seederSource = file_get_contents(__DIR__.'/../../database/seeders/TravelContentSeeder.php');
        $editorSource = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/LandingPromoEditor.tsx');
        $publicSource = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');

        $this->assertNotFalse($seederSource);
        $this->assertNotFalse($editorSource);
        $this->assertNotFalse($publicSource);

        $this->assertStringContainsString("'heading2' => \$this->localize(", $seederSource);
        $this->assertStringContainsString("'checklist_items' => [", $seederSource);
        $this->assertStringNotContainsString("'nav_items' => [", $seederSource);
        $this->assertStringNotContainsString("'navbar_cta_label' =>", $seederSource);
        $this->assertStringNotContainsString("'footer' => [", $seederSource);

        $this->assertStringContainsString('next.packages?.heading2', $editorSource);
        $this->assertStringNotContainsString('next.hero?.nav_items', $editorSource);
        $this->assertStringNotContainsString('next.footer = {', $editorSource);

        $this->assertStringContainsString('(content.packages as CmsRecord)?.heading2', $publicSource);
        $this->assertStringContainsString('LANDING_NAV_ITEMS', $publicSource);
        $this->assertStringContainsString('LANDING_FOOTER_PACKAGE_LINKS', $publicSource);
    }
}
