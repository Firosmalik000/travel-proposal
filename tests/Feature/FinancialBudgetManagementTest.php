<?php

namespace Tests\Feature;

use App\Models\FinancialAccount;
use App\Models\FinancialBudget;
use App\Models\User;
use App\Services\FinancialBudgetService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialBudgetManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_budget_moves_from_draft_to_approved_and_closed_with_audited_lines(): void
    {
        $this->actingAs(User::factory()->create());
        $expense = FinancialAccount::factory()->create(['type' => 'expense']);
        $service = app(FinancialBudgetService::class);

        $budget = $service->create([
            'name' => 'Anggaran Operasional Oktober',
            'package_id' => null,
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'notes' => 'Anggaran bulanan',
            'lines' => [[
                'financial_account_id' => $expense->id,
                'planned_amount_idr' => 5_000_000,
                'notes' => 'Biaya operasional',
            ]],
        ]);

        $this->assertSame('draft', $budget->status);
        $this->assertSame(5_000_000, (int) $budget->lines->first()->planned_amount_idr);

        $budget = $service->transition($budget, 'approved');
        $this->assertSame('approved', $budget->status);
        $this->assertNotNull($budget->approved_at);

        $budget = $service->transition($budget, 'closed');
        $this->assertSame('closed', $budget->status);
        $this->assertNotNull($budget->closed_at);
    }

    public function test_approved_budget_cannot_be_edited(): void
    {
        $this->actingAs(User::factory()->create());
        $expense = FinancialAccount::factory()->create(['type' => 'expense']);
        $service = app(FinancialBudgetService::class);
        $budget = FinancialBudget::query()->create([
            'budget_number' => 'BGT-LOCKED',
            'name' => 'Anggaran terkunci',
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'status' => 'approved',
        ]);
        $budget->lines()->create(['financial_account_id' => $expense->id, 'planned_amount_idr' => 1_000_000]);

        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('draft');
        $service->update($budget, [
            'name' => 'Tidak boleh berubah',
            'package_id' => null,
            'period_start' => '2026-10-01',
            'period_end' => '2026-10-31',
            'notes' => null,
            'lines' => [['financial_account_id' => $expense->id, 'planned_amount_idr' => 2_000_000]],
        ]);
    }
}
