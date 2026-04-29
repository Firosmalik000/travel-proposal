<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class GalleryUpdateValidationTest extends TestCase
{
    public function test_update_gallery_request_allows_partial_payloads(): void
    {
        $source = file_get_contents(__DIR__.'/../../app/Http/Requests/Administrator/UpdateGalleryItemRequest.php');

        $this->assertNotFalse($source);
        $this->assertStringContainsString("'title' => ['sometimes', 'required'", $source);
        $this->assertStringContainsString("'sort_order' => ['sometimes', 'required'", $source);
        $this->assertStringContainsString("'is_active' => ['sometimes', 'required'", $source);
    }

    public function test_gallery_controller_update_is_guarded_by_validated_keys(): void
    {
        $source = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/GalleryController.php');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('$validated = $request->validated();', $source);
        $this->assertStringContainsString("array_key_exists('title', \$validated)", $source);
        $this->assertStringContainsString("array_key_exists('sort_order', \$validated)", $source);
        $this->assertStringContainsString("array_key_exists('is_active', \$validated)", $source);
    }
}
