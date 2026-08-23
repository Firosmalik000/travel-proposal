<?php

namespace Tests\Feature;

use App\Services\HotelImport\HotelRatePdfParser;
use App\Services\HotelImport\PdfTextExtractor;
use Illuminate\Support\Facades\Process;
use Mpdf\Mpdf;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HotelPdfExtractionIntegrationTest extends TestCase
{
    #[Test]
    public function it_extracts_and_parses_a_real_text_based_pdf(): void
    {
        $binary = PHP_OS_FAMILY === 'Windows'
            ? 'C:\\laragon\\bin\\git\\mingw64\\bin\\pdftotext.exe'
            : 'pdftotext';

        if (PHP_OS_FAMILY === 'Windows' && ! is_file($binary)) {
            self::markTestSkipped('pdftotext is not installed.');
        }
        if (PHP_OS_FAMILY !== 'Windows' && ! Process::run([$binary, '-v'])->successful()) {
            self::markTestSkipped('pdftotext is not installed.');
        }

        config(['services.hotel_pdf.pdftotext_binary' => $binary]);
        $pdfPath = storage_path('framework/testing-hotel-rate.pdf');

        try {
            $pdf = new Mpdf;
            $pdf->WriteHTML(<<<'HTML'
                <h2>Makkah</h2>
                <h3>Movenpick Hajar</h3>
                <table style="width: 100%">
                    <tr><th>From</th><th>To</th><th>DBL</th><th>TRPL</th><th>Quad</th></tr>
                    <tr><td>16/06/26</td><td>30/08/26</td><td>1100</td><td>1325</td><td>1550</td></tr>
                </table>
            HTML);
            $pdf->Output($pdfPath, 'F');

            $pages = app(PdfTextExtractor::class)->extract($pdfPath);
            $rows = app(HotelRatePdfParser::class)->parse($pages, 'Arab Saudi', 'SAR');

            self::assertCount(1, $rows);
            self::assertSame('Movenpick Hajar', $rows[0]['hotel']);
            self::assertSame('2026-06-16', $rows[0]['period_start']);
            self::assertSame(1100, $rows[0]['dbl']);
            self::assertSame(1325, $rows[0]['trpl']);
            self::assertSame(1550, $rows[0]['quad']);
        } finally {
            if (is_file($pdfPath)) {
                unlink($pdfPath);
            }
        }
    }
}
