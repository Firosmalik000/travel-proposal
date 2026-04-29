<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class GalleryManagementRouteTest extends TestCase
{
    public function test_routes_register_gallery_management_endpoint(): void
    {
        $routes = file_get_contents(__DIR__.'/../../routes/web.php');

        $this->assertNotFalse($routes);
        $this->assertStringContainsString("Route::get('gallery', [GalleryController::class, 'index'])", $routes);
        $this->assertStringContainsString("'gallery.index'", $routes);
        $this->assertStringContainsString("'gallery.store'", $routes);
        $this->assertStringContainsString("'gallery.update'", $routes);
        $this->assertStringContainsString("'gallery.destroy'", $routes);
    }

    public function test_gallery_controller_exists_and_renders_expected_component(): void
    {
        $source = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/GalleryController.php');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('class GalleryController extends Controller', $source);
        $this->assertStringContainsString("Inertia::render('Dashboard/WebsiteManagement/Gallery/Index'", $source);
    }
}
