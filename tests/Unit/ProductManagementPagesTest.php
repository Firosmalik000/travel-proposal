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
}
