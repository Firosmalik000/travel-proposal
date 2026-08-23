<?php

declare(strict_types=1);

it('provides one reusable Indonesian date formatter and component', function () {
    $formatter = file_get_contents(resource_path('js/lib/date-format.ts'));
    $component = file_get_contents(resource_path('js/components/formatted-date.tsx'));

    expect($formatter)
        ->not->toBeFalse()
        ->toContain("const INDONESIAN_LOCALE = 'id-ID'")
        ->toContain("const INDONESIAN_TIME_ZONE = 'Asia/Jakarta'")
        ->toContain('export function formatDate(')
        ->toContain('export function formatDateWithDay(')
        ->toContain('export function formatMonth(')
        ->toContain('export function formatDateTime(')
        ->toContain('export function formatTime(')
        ->toContain('export function formatDateRange(');

    expect($component)
        ->not->toBeFalse()
        ->toContain('export default function FormattedDate(')
        ->toContain('<time dateTime=');
});

it('documents the date preview convention for future work', function () {
    $agents = file_get_contents(base_path('AGENTS.md'));

    expect($agents)
        ->not->toBeFalse()
        ->toContain('## Date Preview Convention')
        ->toContain('@/lib/date-format')
        ->toContain('Jumat, 21 Agustus 2026');
});

it('prevents frontend modules from defining their own date preview formatters', function () {
    $javascriptDirectory = resource_path('js');
    $sharedFormatterPath = resource_path('js/lib/date-format.ts');
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($javascriptDirectory));

    foreach ($files as $file) {
        if (
            ! $file->isFile()
            || $file->getPathname() === $sharedFormatterPath
            || ! in_array($file->getExtension(), ['ts', 'tsx'], true)
        ) {
            continue;
        }

        $source = file_get_contents($file->getPathname());

        expect($source)
            ->not->toBeFalse()
            ->not->toContain('Intl.DateTimeFormat')
            ->not->toContain('toLocaleDateString')
            ->not->toContain("from 'date-fns'")
            ->not->toContain('from "date-fns"');
    }
});
