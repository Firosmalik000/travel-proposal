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
        $user = User::factory()->create(['username' => 'admin']);

        $this->actingAs($user)
            ->get(route('financial.report.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/FinancialManagement/FinancialReport/Index')
                ->has('filters')
                ->has('report.summary')
                ->has('report.account_balances')
                ->has('report.profit_loss')
                ->has('report.balance_sheet')
                ->has('report.cashflow')
                ->has('report.trip_profitability')
                ->has('report.budgets')
                ->has('report.customer_receivables')
                ->has('report.vendor_payables')
                ->has('report.inventory')
                ->has('report.periods')
                ->has('expenseAccountOptions')
                ->has('packageOptions')
            );
    }

    public function test_financial_summary_reports_and_controls_have_focused_workspaces(): void
    {
        $user = User::factory()->create(['username' => 'admin']);

        foreach ([
            'financial.overview' => 'overview',
            'financial.reports.index' => 'reports',
            'financial.controls.index' => 'controls',
        ] as $routeName => $workspace) {
            $this->actingAs($user)
                ->get(route($routeName))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Dashboard/FinancialManagement/FinancialReport/Index')
                    ->where('workspace', $workspace)
                    ->has('report.summary'));
        }
    }
}
