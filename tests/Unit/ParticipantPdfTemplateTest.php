<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ParticipantPdfTemplateTest extends TestCase
{
    public function test_participant_pdf_template_uses_participant_specific_columns(): void
    {
        $controller = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/BookingRegisterController.php');
        $body = file_get_contents(__DIR__.'/../../resources/views/pdf/participants/body.blade.php');

        $this->assertNotFalse($controller);
        $this->assertNotFalse($body);

        $this->assertStringContainsString("'full_name' =>", $controller);
        $this->assertStringContainsString("'gender' =>", $controller);
        $this->assertStringContainsString("'birth' =>", $controller);
        $this->assertStringContainsString("'passport' =>", $controller);
        $this->assertStringContainsString('Nama Peserta', $body);
        $this->assertStringContainsString('Tempat / Tgl Lahir', $body);
        $this->assertStringContainsString('Paspor', $body);
        $this->assertStringContainsString('Catatan', $body);
    }
}
