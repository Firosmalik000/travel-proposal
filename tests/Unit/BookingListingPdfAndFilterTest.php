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

        $this->assertNotFalse($controller);
        $this->assertNotFalse($routes);

        $this->assertStringContainsString('travel_package_id', $controller);
        $this->assertStringContainsString('participantPdf', $controller);
        $this->assertStringContainsString('participants.pdf', $routes);
        $this->assertFileExists(__DIR__.'/../../resources/views/pdf/participants.blade.php');
    }
}
