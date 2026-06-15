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
        $this->assertStringContainsString('reasonStats.map((item, index) => (', $source);
        $this->assertStringNotContainsString('reasonStats.slice(0, 3)', $source);
        $this->assertStringContainsString(
            ': (stats as Array<Record<string, string>>),',
            $source,
        );
    }
}
