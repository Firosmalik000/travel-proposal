<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialReportPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_download_financial_report_pdf(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('financial.report.pdf'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }
}
