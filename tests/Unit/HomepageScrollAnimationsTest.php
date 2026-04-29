<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class HomepageScrollAnimationsTest extends TestCase
{
    public function test_public_homepage_uses_scroll_triggered_framer_motion(): void
    {
        $landingPath = __DIR__.'/../../resources/js/pages/public/home/landing.tsx';

        $this->assertFileExists($landingPath);

        $contents = file_get_contents($landingPath);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('whileInView', $contents);
        $this->assertStringContainsString('viewport', $contents);
    }
}
