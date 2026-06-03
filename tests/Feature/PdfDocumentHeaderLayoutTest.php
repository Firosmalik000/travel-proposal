<?php

namespace Tests\Feature;

use Illuminate\Support\Carbon;
use Tests\TestCase;

class PdfDocumentHeaderLayoutTest extends TestCase
{
    public function test_participant_header_uses_compact_document_meta_layout(): void
    {
        $html = view('pdf.participants.header', [
            'branding' => [],
            'seo' => [],
            'locale' => 'id',
            'generatedAt' => Carbon::parse('2026-06-03 04:13:00'),
            'bookingCode' => 'BK-260530-0008',
        ])->render();

        $this->assertStringContainsString('document-title', $html);
        $this->assertStringContainsString('document-meta', $html);
        $this->assertStringContainsString('Data Peserta', $html);
        $this->assertStringContainsString('BK-260530-0008', $html);
        $this->assertStringContainsString('Dicetak: 03 Jun 2026 04:13', $html);
    }

    public function test_invoice_header_uses_compact_document_meta_layout(): void
    {
        $html = view('pdf.invoice.header', [
            'branding' => [],
            'seo' => [],
            'locale' => 'id',
            'generatedAt' => Carbon::parse('2026-06-03 04:13:00'),
            'bookingCode' => 'BK-260530-0008',
        ])->render();

        $this->assertStringContainsString('document-title', $html);
        $this->assertStringContainsString('document-meta', $html);
        $this->assertStringContainsString('Invoice', $html);
        $this->assertStringContainsString('BK-260530-0008', $html);
        $this->assertStringContainsString('Dicetak: 03 Jun 2026 04:13', $html);
    }
}
