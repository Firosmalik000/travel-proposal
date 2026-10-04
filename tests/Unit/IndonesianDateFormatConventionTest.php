<?php

declare(strict_types=1);

namespace Tests\Unit;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Tests\TestCase;

class IndonesianDateFormatConventionTest extends TestCase
{
    public function test_provides_one_reusable_indonesian_date_formatter_and_component(): void
    {
        $formatter = file_get_contents(resource_path('js/lib/date-format.ts'));
        $component = file_get_contents(resource_path('js/components/formatted-date.tsx'));

        $this->assertNotFalse($formatter);
        $this->assertStringContainsString("const INDONESIAN_LOCALE = 'id-ID'", $formatter);
        $this->assertStringContainsString("const INDONESIAN_TIME_ZONE = 'Asia/Jakarta'", $formatter);
        $this->assertStringContainsString('export function formatDate(', $formatter);
        $this->assertStringContainsString('export function formatDateWithDay(', $formatter);
        $this->assertStringContainsString('export function formatMonth(', $formatter);
        $this->assertStringContainsString('export function formatDateTime(', $formatter);
        $this->assertStringContainsString('export function formatTime(', $formatter);
        $this->assertStringContainsString('export function formatDateRange(', $formatter);

        $this->assertNotFalse($component);
        $this->assertStringContainsString('export default function FormattedDate(', $component);
        $this->assertStringContainsString('<time dateTime=', $component);
    }

    public function test_documents_the_date_preview_convention_for_future_work(): void
    {
        $agents = file_get_contents(base_path('AGENTS.md'));

        $this->assertNotFalse($agents);
        $this->assertStringContainsString('Jumat, 21 Agustus 2026', $agents);
    }

    public function test_prevents_frontend_modules_from_defining_their_own_date_preview_formatters(): void
    {
        $javascriptDirectory = resource_path('js');
        $sharedFormatterPath = realpath(resource_path('js/lib/date-format.ts'));
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($javascriptDirectory));

        foreach ($files as $file) {
            if (
                ! $file->isFile()
                || realpath($file->getPathname()) === $sharedFormatterPath
                || ! in_array($file->getExtension(), ['ts', 'tsx'], true)
            ) {
                continue;
            }

            $source = file_get_contents($file->getPathname());

            $this->assertNotFalse($source);
            $this->assertStringNotContainsString('Intl.DateTimeFormat', $source);
            $this->assertStringNotContainsString('toLocaleDateString', $source);
            $this->assertStringNotContainsString("from 'date-fns'", $source);
            $this->assertStringNotContainsString('from "date-fns"', $source);
        }
    }
}
