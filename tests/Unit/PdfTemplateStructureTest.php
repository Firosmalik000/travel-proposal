<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class PdfTemplateStructureTest extends TestCase
{
    public function test_active_pdf_wrappers_use_separate_header_and_body_partials(): void
    {
        $bookingListing = file_get_contents(__DIR__.'/../../resources/views/pdf/booking-listing.blade.php');
        $participants = file_get_contents(__DIR__.'/../../resources/views/pdf/participants.blade.php');
        $invoice = file_get_contents(__DIR__.'/../../resources/views/pdf/invoice.blade.php');
        $financialReport = file_get_contents(__DIR__.'/../../resources/views/pdf/financial-report.blade.php');
        $packageSk = file_get_contents(__DIR__.'/../../resources/views/pdf/package-sk.blade.php');
        $portalPage = file_get_contents(__DIR__.'/../../resources/views/pdf/portal-page.blade.php');
        $cashflowHeader = file_get_contents(__DIR__.'/../../resources/views/pdf/cashflow/header.blade.php');
        $cashflowMain = file_get_contents(__DIR__.'/../../resources/views/pdf/cashflow/main.blade.php');

        $this->assertNotFalse($bookingListing);
        $this->assertNotFalse($participants);
        $this->assertNotFalse($invoice);
        $this->assertNotFalse($financialReport);
        $this->assertNotFalse($packageSk);
        $this->assertNotFalse($portalPage);
        $this->assertNotFalse($cashflowHeader);
        $this->assertNotFalse($cashflowMain);

        $this->assertStringContainsString('pdf.booking-listing.header', $bookingListing);
        $this->assertStringContainsString('pdf.booking-listing.body', $bookingListing);
        $this->assertStringContainsString('pdf.participants.header', $participants);
        $this->assertStringContainsString('pdf.participants.body', $participants);
        $this->assertStringContainsString('pdf.invoice.header', $invoice);
        $this->assertStringContainsString('pdf.invoice.body', $invoice);
        $this->assertStringContainsString('pdf.financial-report.header', $financialReport);
        $this->assertStringContainsString('pdf.financial-report.body', $financialReport);
        $this->assertStringContainsString('pdf.package-sk.header', $packageSk);
        $this->assertStringContainsString('pdf.package-sk.body', $packageSk);
        $this->assertStringContainsString('pdf.portal-page.header', $portalPage);
        $this->assertStringContainsString('pdf.portal-page.body', $portalPage);
        $this->assertStringContainsString('pdf.partials.letterhead', $cashflowHeader);
        $this->assertStringContainsString('pdf.cashflow.body', $cashflowMain);
    }
}
