<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class BookingListingPdfAndFilterTest extends TestCase
{
    public function test_booking_listing_supports_package_filter_and_participant_pdf(): void
    {
        $controller = file_get_contents(__DIR__.'/../../app/Http/Controllers/Administrator/BookingRegisterController.php');
        $routes = file_get_contents(__DIR__.'/../../routes/web.php');
        $bookingListingView = file_get_contents(__DIR__.'/../../resources/views/pdf/booking-listing.blade.php');
        $participantsView = file_get_contents(__DIR__.'/../../resources/views/pdf/participants.blade.php');
        $invoiceView = file_get_contents(__DIR__.'/../../resources/views/pdf/invoice.blade.php');
        $financialReportView = file_get_contents(__DIR__.'/../../resources/views/pdf/financial-report.blade.php');

        $this->assertNotFalse($controller);
        $this->assertNotFalse($routes);
        $this->assertNotFalse($bookingListingView);
        $this->assertNotFalse($participantsView);
        $this->assertNotFalse($invoiceView);
        $this->assertNotFalse($financialReportView);

        $this->assertStringContainsString('travel_package_id', $controller);
        $this->assertStringContainsString('participantPdf', $controller);
        $this->assertStringContainsString('participants.pdf', $routes);
        $this->assertStringContainsString('pdf.booking-listing.header', $bookingListingView);
        $this->assertStringContainsString('pdf.booking-listing.body', $bookingListingView);
        $this->assertStringContainsString('pdf.participants.header', $participantsView);
        $this->assertStringContainsString('pdf.participants.body', $participantsView);
        $this->assertStringContainsString('pdf.invoice.header', $invoiceView);
        $this->assertStringContainsString('pdf.invoice.body', $invoiceView);
        $this->assertStringContainsString('pdf.financial-report.header', $financialReportView);
        $this->assertStringContainsString('pdf.financial-report.body', $financialReportView);
        $this->assertFileExists(__DIR__.'/../../resources/views/pdf/participants.blade.php');
    }
}
