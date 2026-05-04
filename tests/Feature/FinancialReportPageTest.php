<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FinancialReportPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_open_financial_report_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('financial.report.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/FinancialReport/Index')
                ->has('filters')
                ->has('rows')
            );
    }
}
