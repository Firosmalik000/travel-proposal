<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ProductManagementPagesTest extends TestCase
{
    public function test_content_controller_renders_new_product_management_pages(): void
    {
        $source = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/ContentController.php');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('Dashboard/ProductManagement/Products/Index', $source);
        $this->assertStringContainsString('Dashboard/ProductManagement/Categories/Index', $source);
    }

    public function test_frontend_pages_exist(): void
    {
        $this->assertFileExists(__DIR__.'/../../resources/js/pages/Dashboard/ProductManagement/Products/Index.tsx');
        $this->assertFileExists(__DIR__.'/../../resources/js/pages/Dashboard/ProductManagement/Categories/Index.tsx');
    }

    public function test_hotel_import_uses_the_fresh_xsrf_cookie_for_manual_requests(): void
    {
        $helper = file_get_contents(__DIR__.'/../../resources/js/lib/csrf-fetch.ts');
        $page = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/ProductManagement/Products/ProductCategoryHotel.tsx');

        $this->assertNotFalse($helper);
        $this->assertNotFalse($page);
        $this->assertStringContainsString("cookieValue('XSRF-TOKEN')", $helper);
        $this->assertStringContainsString("'X-XSRF-TOKEN': xsrfToken", $helper);
        $this->assertStringContainsString("credentials: 'same-origin'", $helper);
        $this->assertStringContainsString('fetchWithCsrf(', $page);
        $this->assertStringNotContainsString("'X-CSRF-TOKEN': csrfToken()", $page);
    }
}
