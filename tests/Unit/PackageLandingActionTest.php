<?php

namespace Tests\Unit;

use Tests\TestCase;

class PackageLandingActionTest extends TestCase
{
    public function test_package_card_links_to_package_landing_preview(): void
    {
        $source = file_get_contents(resource_path('js/pages/Dashboard/ProductManagement/Packages/PackageCard.tsx'));

        $this->assertStringContainsString('const landingPreviewPath = `/landing/${pkg.slug || pkg.id}`;', $source);
        $this->assertStringContainsString('href={landingPreviewPath}', $source);
        $this->assertStringContainsString('Buka landing promo paket', $source);
    }

    public function test_landing_package_room_prices_fall_back_to_base_price(): void
    {
        $source = file_get_contents(resource_path('js/pages/public/landing/package/index.tsx'));

        $this->assertStringContainsString('function resolveRoomPrice(', $source);
        $this->assertStringContainsString('function hasRoomPrice(', $source);
        $this->assertStringContainsString('return basePrice;', $source);
        $this->assertStringContainsString('const hasCustomRoomPrice = hasRoomPrice(roomPrices, [', $source);
        $this->assertStringContainsString("label: 'Harga'", $source);
        $this->assertStringContainsString("room: 'Harga Paket'", $source);
        $this->assertStringContainsString("'quad'", $source);
        $this->assertStringContainsString("'trpl'", $source);
        $this->assertStringContainsString("'triple'", $source);
        $this->assertStringContainsString("'dbl'", $source);
        $this->assertStringContainsString("'double'", $source);
    }

    public function test_landing_package_uses_the_new_islamic_sales_layout_without_replacing_payload_sources(): void
    {
        $dataSource = file_get_contents(resource_path('js/pages/public/landing/package/index.tsx'));
        $designSource = file_get_contents(resource_path('js/pages/public/landing/package/package-sales-experience.tsx'));

        $this->assertStringContainsString("usePublicPageContent('home_landing_mockup')", $dataSource);
        $this->assertStringContainsString('travelPackage.testimonials', $dataSource);
        $this->assertStringContainsString('publicData.faqs', $dataSource);
        $this->assertStringContainsString('<PackageSalesExperience', $dataSource);
        $this->assertStringContainsString('geometry', $designSource);
        $this->assertStringContainsString('Biaya jelas.', $designSource);
        $this->assertStringContainsString('Bukan sekadar berangkat.', $designSource);
        $this->assertStringContainsString('Cerita mereka,', $designSource);
    }
}
