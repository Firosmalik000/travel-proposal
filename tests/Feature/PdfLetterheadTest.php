<?php

namespace Tests\Feature;

use Illuminate\Support\Carbon;
use Tests\TestCase;

class PdfLetterheadTest extends TestCase
{
    public function test_letterhead_prefers_logo_data_uri_when_available(): void
    {
        $logoUrl = 'file:///C:/laragon/www/travel-proposal/public/branding/asfar-logo-default.png';
        $dataUri = 'data:image/png;base64,ZmFrZQ==';

        $html = view('pdf.partials.letterhead', [
            'branding' => [
                'company_name' => 'Asfar Tour',
                'company_subtitle' => 'Travel',
                'logo_inline_svg' => null,
                'logo_source_url' => $logoUrl,
                'logo_data_uri' => $dataUri,
            ],
            'seo' => [],
            'locale' => 'id',
            'generatedAt' => Carbon::parse('2026-06-03 10:00:00'),
        ])->render();

        $this->assertStringContainsString('src="'.$dataUri.'"', $html);
        $this->assertSame(1, substr_count($html, 'Tanggal'));
        $this->assertSame(1, substr_count($html, '03 Jun 2026'));
    }
}
