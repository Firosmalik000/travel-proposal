<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingEditorHomeSectionsTest extends TestCase
{
    public function test_home_tab_does_not_offer_unused_about_or_stats_sections(): void
    {
        $source = file_get_contents(__DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/Index.tsx');

        $this->assertNotFalse($source);

        $homeMapStart = strpos($source, "home: [\n");
        $this->assertIsInt($homeMapStart);

        $homeMapEnd = strpos($source, "],\n", $homeMapStart);
        $this->assertIsInt($homeMapEnd);

        $homeMap = substr($source, $homeMapStart, $homeMapEnd - $homeMapStart);

        $this->assertStringNotContainsString("'stats'", $homeMap);
        $this->assertStringNotContainsString("'about'", $homeMap);
    }
}
