<?php

namespace Tests\Unit;

use App\Services\HotelImport\HotelRatePdfParser;
use App\Services\HotelImport\PdfTextExtractor;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class HotelRatePdfParserTest extends TestCase
{
    #[Test]
    public function it_parses_multiple_hotels_periods_pages_and_city_context(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->word('Makkah', 40, 20),
                $this->word('Movenpick', 40, 60),
                $this->word('Hajar', 110, 60),
                ...$this->headerWords(80),
                ...$this->rateWords(100, '16/06/26', '30/08/26', '1100', '1325', '1550'),
                ...$this->rateWords(120, '31/08/26', '11/10/26', '1050', '1275', '1500'),
                $this->word('Azka', 40, 160),
                $this->word('Al', 85, 160),
                $this->word('Maqam', 105, 160),
                ...$this->headerWords(180),
                ...$this->rateWords(200, '12/10/26', '16/12/26', '1250', '1500', '1750'),
            ],
            2 => [
                $this->word('Madinah', 40, 20),
                $this->word('Taibah', 40, 60),
                $this->word('Front', 100, 60),
                ...$this->headerWords(80),
                ...$this->rateWords(100, '01/01/27', '31/01/27', '700', '825', '950'),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi', 'SAR');

        self::assertCount(4, $rows);
        self::assertSame('Movenpick Hajar', $rows[0]['hotel']);
        self::assertSame('2026-06-16', $rows[0]['period_start']);
        self::assertSame(1100, $rows[0]['dbl']);
        self::assertSame('Azka Al Maqam', $rows[2]['hotel']);
        self::assertSame('Mekkah', $rows[2]['city']);
        self::assertSame('Taibah Front', $rows[3]['hotel']);
        self::assertSame('Madinah', $rows[3]['city']);
    }

    #[Test]
    public function it_returns_null_and_a_warning_when_a_room_rate_is_missing(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->word('Makkah', 40, 20),
                $this->word('Movenpick', 40, 60),
                $this->word('Hajar', 110, 60),
                ...$this->headerWords(80),
                $this->word('16/06/26', 100, 100),
                $this->word('30/08/26', 200, 100),
                $this->word('1100', 300, 100),
                $this->word('1550', 500, 100),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi', 'SAR');

        self::assertNull($rows[0]['trpl']);
        self::assertContains(
            'Movenpick Hajar - periode 2026-06-16 sampai 2026-08-30: rate Triple tidak dapat dibaca. Nilai dikosongkan.',
            $rows[0]['warnings'],
        );
    }

    #[Test]
    public function it_does_not_treat_a_structural_table_heading_as_the_hotel_name(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->word('Makkah', 40, 20),
                $this->word('Movenpick', 40, 45),
                $this->word('Hajar', 110, 45),
                $this->word('Hotel', 40, 60),
                $this->word('Period', 100, 60),
                $this->word('Room', 170, 60),
                $this->word('Type', 220, 60),
                $this->word('Meal', 280, 60),
                $this->word('Plan', 330, 60),
                ...$this->headerWords(80),
                ...$this->rateWords(100, '16/06/26', '30/08/26', '1100', '1325', '1550'),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi', 'SAR');

        self::assertCount(1, $rows);
        self::assertSame('Movenpick Hajar', $rows[0]['hotel']);
    }

    #[Test]
    public function it_strictly_parses_layout_fallback_blocks_without_using_update_or_headers_as_hotels(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->fallbackWord('Makkah', 0, 0),
            ],
            2 => [
                $this->fallbackWord('Update', 330, 0),
                $this->fallbackWord('01/05', 380, 0),
                $this->fallbackWord('Hotel', 0, 24),
                $this->fallbackWord('Period', 100, 24),
                $this->fallbackWord('Room', 220, 24),
                $this->fallbackWord('Type', 260, 24),
                ...$this->fallbackHeaderWords(48),
                ...$this->fallbackRateWords(72, '16/06/26', '30/08/26', '1100', '1325', '1550'),
                $this->fallbackWord('Movenpick', 0, 96),
                ...$this->fallbackRateWords(96, '31/08/26', '11/10/26', '1050', '1275', '1500'),
                $this->fallbackWord('Hajar', 0, 120),
                ...$this->fallbackRateWords(120, '12/10/26', '16/12/26', '1250', '1500', '1750'),
            ],
            3 => [
                $this->fallbackWord('Rates', 0, 0),
                $this->fallbackWord('quoted', 36, 0),
                $this->fallbackWord('in', 78, 0),
                $this->fallbackWord('Saudi', 96, 0),
                $this->fallbackWord('Riyals', 138, 0),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi');

        self::assertCount(3, $rows);
        self::assertSame(['Movenpick Hajar'], array_values(array_unique(array_column($rows, 'hotel'))));
        self::assertSame('SAR', $rows[0]['currency']);
        self::assertSame('2026-06-16', $rows[0]['period_start']);
        self::assertSame(1100, $rows[0]['dbl']);
        self::assertSame(1750, $rows[2]['quad']);
    }

    #[Test]
    public function it_pairs_shifted_layout_fallback_rates_by_column_and_period_order(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->fallbackWord('Makkah', 0, 0),
                ...$this->fallbackHeaderWords(24),
                ...$this->fallbackRateWords(48, '16/06/26', '08/07/26', '1100', '1370', '1640'),
                $this->fallbackWord('Al', 0, 72),
                $this->fallbackWord('Marwa', 18, 72),
                ...$this->fallbackRateWords(72, '09/07/26', '30/09/26', '1180', '1450', '1720'),
                $this->fallbackWord('Rotana', 0, 96),
                $this->fallbackWord('1250', 240, 96),
                $this->fallbackWord('1520', 320, 96),
                $this->fallbackWord('01/10/26', 80, 120),
                $this->fallbackWord('16/12/26', 160, 120),
                $this->fallbackWord('1790', 400, 120),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi', 'SAR');

        self::assertCount(3, $rows);
        self::assertSame('Al Marwa Rotana', $rows[0]['hotel']);
        self::assertSame([1250, 1520, 1790], [$rows[2]['dbl'], $rows[2]['trpl'], $rows[2]['quad']]);
    }

    #[Test]
    public function it_rejects_an_extreme_merged_rate_token_in_a_fallback_column(): void
    {
        $parser = new HotelRatePdfParser;
        $pages = [
            1 => [
                $this->fallbackWord('Makkah', 0, 0),
                ...$this->fallbackHeaderWords(24),
                $this->fallbackWord('Azka', 0, 48),
                ...$this->fallbackRateWords(48, '20/06/26', '01/07/26', '510', '560', '610'),
                $this->fallbackWord('Al', 0, 72),
                $this->fallbackWord('Safa', 18, 72),
                ...$this->fallbackRateWords(72, '01/07/26', '01/08/26', '540', '615', '690'),
                ...$this->fallbackRateWords(96, '01/08/26', '01/09/26', '570', '1635755', '740'),
            ],
        ];

        $rows = $parser->parse($pages, 'Arab Saudi', 'SAR');

        self::assertNull($rows[2]['trpl']);
        self::assertContains(
            'Azka Al Safa - periode 2026-08-01 sampai 2026-09-01: rate Triple tidak dapat dibaca. Nilai dikosongkan.',
            $rows[2]['warnings'],
        );
    }

    #[Test]
    public function it_detects_image_only_pdf_extraction_output(): void
    {
        $extractor = new PdfTextExtractor;

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('scan/gambar');

        $extractor->parseBoundingBoxXml('<?xml version="1.0"?><doc><page width="600" height="800"/></doc>');
    }

    /** @return array{text: string, x_min: float, y_min: float, x_max: float, y_max: float} */
    private function word(string $text, float $x, float $y): array
    {
        return [
            'text' => $text,
            'x_min' => $x,
            'y_min' => $y,
            'x_max' => $x + 40,
            'y_max' => $y + 10,
        ];
    }

    /** @return array{text: string, x_min: float, y_min: float, x_max: float, y_max: float, layout_fallback: true} */
    private function fallbackWord(string $text, float $x, float $y): array
    {
        return [
            ...$this->word($text, $x, $y),
            'layout_fallback' => true,
        ];
    }

    /** @return array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float, layout_fallback: true}> */
    private function fallbackHeaderWords(float $y): array
    {
        return [
            $this->fallbackWord('From', 80, $y),
            $this->fallbackWord('To', 160, $y),
            $this->fallbackWord('DBL', 240, $y),
            $this->fallbackWord('TRPL', 320, $y),
            $this->fallbackWord('Quad', 400, $y),
        ];
    }

    /** @return array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float, layout_fallback: true}> */
    private function fallbackRateWords(float $y, string $start, string $end, string $dbl, string $trpl, string $quad): array
    {
        return [
            $this->fallbackWord($start, 80, $y),
            $this->fallbackWord($end, 160, $y),
            $this->fallbackWord($dbl, 240, $y),
            $this->fallbackWord($trpl, 320, $y),
            $this->fallbackWord($quad, 400, $y),
        ];
    }

    /** @return array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}> */
    private function headerWords(float $y): array
    {
        return [
            $this->word('From', 100, $y),
            $this->word('To', 200, $y),
            $this->word('DBL', 300, $y),
            $this->word('TRPL', 400, $y),
            $this->word('Quad', 500, $y),
        ];
    }

    /** @return array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}> */
    private function rateWords(float $y, string $start, string $end, string $dbl, string $trpl, string $quad): array
    {
        return [
            $this->word($start, 100, $y),
            $this->word($end, 200, $y),
            $this->word($dbl, 300, $y),
            $this->word($trpl, 400, $y),
            $this->word($quad, 500, $y),
        ];
    }
}
