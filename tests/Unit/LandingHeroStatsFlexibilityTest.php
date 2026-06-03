<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingHeroStatsFlexibilityTest extends TestCase
{
    public function test_public_landing_hero_stats_are_not_limited_to_four_items(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/public/landing/index.tsx');

        $this->assertNotFalse($source);
        $this->assertStringContainsString('{stats.map((item, index) =>', $source);
        $this->assertStringContainsString('[grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]', $source);
        $this->assertStringNotContainsString('stats.slice(0, 4)', $source);
    }
}
