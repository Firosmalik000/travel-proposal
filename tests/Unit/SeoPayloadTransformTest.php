<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class SeoPayloadTransformTest extends TestCase
{
    public function test_seo_form_transforms_localized_fields_into_payload(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/Administrator/Seo/Index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('forceFormData: true', $source);
        $this->assertStringContainsString('weekday_hours: currentData.weekday_hours_id', $source);
        $this->assertStringContainsString('weekend_hours: currentData.weekend_hours_id', $source);
        $this->assertStringContainsString('og_title: currentData.og_title_id', $source);
        $this->assertStringContainsString('og_description:', $source);
    }
}
