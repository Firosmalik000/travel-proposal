<?php

namespace Tests\Feature;

use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialReportPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_download_financial_report_pdf(): void
    {
        $user = User::factory()->create(['username' => 'admin']);

        $this->actingAs($user)
            ->get(route('financial.report.pdf'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_it_can_export_filtered_financial_report_csv_safely(): void
    {
        $user = User::factory()->create(['username' => 'admin']);
        FinancialAccount::factory()->create([
            'code' => '9901',
            'name' => '=HYPERLINK("https://example.test")',
            'type' => 'expense',
        ]);

        $response = $this->actingAs($user)->get(route('financial.report.csv', [
            'report' => 'trial-balance',
            'date_from' => '2026-01-01',
            'date_to' => '2026-12-31',
        ]));

        $response->assertOk()->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $csv = $response->streamedContent();

        $this->assertStringContainsString('"Kode akun","Nama akun"', $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }

    public function test_it_can_export_filtered_journal_csv_with_balanced_lines(): void
    {
        $user = User::factory()->create(['username' => 'admin']);
        $debit = FinancialAccount::factory()->create(['code' => '9902', 'type' => 'expense']);
        $credit = FinancialAccount::factory()->create(['code' => '9903', 'type' => 'asset']);
        $transaction = FinancialTransaction::factory()->create([
            'transaction_number' => 'FT-EXPORT-001',
            'transaction_date' => '2026-06-15',
            'description' => '+formula',
            'status' => 'draft',
            'posted_at' => null,
        ]);
        FinancialTransactionLine::factory()->for($transaction, 'transaction')->for($debit, 'account')->create(['entry_type' => 'debit']);
        FinancialTransactionLine::factory()->for($transaction, 'transaction')->for($credit, 'account')->create(['entry_type' => 'credit']);
        $transaction->update(['status' => 'posted', 'posted_at' => now(), 'posted_by' => $user->id]);

        $response = $this->actingAs($user)->get(route('financial-ledger.export.csv', [
            'report' => 'journal',
            'date_from' => '2026-06-01',
            'date_to' => '2026-06-30',
        ]));

        $response->assertOk()->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $csv = $response->streamedContent();

        $this->assertSame(2, substr_count($csv, 'FT-EXPORT-001'));
        $this->assertStringContainsString("'+formula", $csv);
        $this->assertStringNotContainsString('FT-', $this->actingAs($user)->get(route('financial-ledger.export.csv', [
            'report' => 'journal',
            'date_from' => '2026-07-01',
            'date_to' => '2026-07-31',
        ]))->streamedContent());
    }

    public function test_it_can_download_filtered_financial_ledger_pdf(): void
    {
        $user = User::factory()->create(['username' => 'admin']);
        $debit = FinancialAccount::factory()->create(['code' => '9904', 'name' => 'Biaya Operasional', 'type' => 'expense']);
        $credit = FinancialAccount::factory()->create(['code' => '9905', 'name' => 'Kas Operasional', 'type' => 'asset']);
        $transaction = FinancialTransaction::factory()->create([
            'transaction_number' => 'FT-EXPORT-PDF-001',
            'transaction_date' => '2026-06-15',
            'description' => 'Pembayaran operasional perjalanan',
            'status' => 'draft',
            'posted_at' => null,
        ]);
        FinancialTransactionLine::factory()->for($transaction, 'transaction')->for($debit, 'account')->create(['entry_type' => 'debit', 'amount_idr' => 1500000]);
        FinancialTransactionLine::factory()->for($transaction, 'transaction')->for($credit, 'account')->create(['entry_type' => 'credit', 'amount_idr' => 1500000]);
        $transaction->update(['status' => 'posted', 'posted_at' => now(), 'posted_by' => $user->id]);

        $this->actingAs($user)
            ->get(route('financial-ledger.export.pdf', [
                'report' => 'journal',
                'date_from' => '2026-06-01',
                'date_to' => '2026-06-30',
            ]))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }
}
