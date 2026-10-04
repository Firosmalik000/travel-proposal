<?php

namespace Tests\Feature;

use App\Models\BankReconciliation;
use App\Models\Booking;
use App\Models\FinancialAccount;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Models\User;
use App\Services\BankReconciliationService;
use App\Services\FinancialLedgerService;
use App\Services\FinancialPeriodService;
use App\Services\FinancialReportService;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FinancialReportingPhaseSixTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_uses_ledger_revenue_instead_of_booking_value(): void
    {
        $user = User::factory()->create(['username' => 'admin']);
        $package = TravelPackage::factory()->create(['price' => 50_000_000, 'currency' => 'IDR']);
        Booking::factory()->create(['package_id' => $package->id, 'status' => 'registered', 'passenger_count' => 1, 'agreed_total_amount' => 50_000_000, 'agreed_currency' => 'IDR']);

        $this->actingAs($user)
            ->get(route('financial.report.index', ['date_from' => '2026-01-01', 'date_to' => '2026-12-31']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('report.summary.revenue_idr', 0)
                ->where('report.profit_loss.revenue_idr', 0)
                ->where('report.customer_receivables.total_idr', 50_000_000)
            );
    }

    public function test_closed_period_rejects_posting_and_allows_referenced_adjustment_in_open_period(): void
    {
        $this->actingAs(User::factory()->create());
        $accounts = FinancialAccount::query()->whereIn('system_key', ['operating_bank', 'operating_expense'])->get()->keyBy('system_key');
        $ledger = app(FinancialLedgerService::class);

        $source = $ledger->postTwoSidedJournal($this->journalData(
            '2026-08-15',
            $accounts['operating_expense']->id,
            $accounts['operating_bank']->id,
            'phase6-source',
        ));
        app(BankReconciliationService::class)->reconcile([
            'financial_account_id' => $accounts['operating_bank']->id,
            'statement_date' => '2026-08-31',
            'statement_balance_idr' => -200_000,
            'notes' => 'Saldo rekening telah dicocokkan.',
            'idempotency_key' => 'phase6-close-reconciliation',
        ]);
        app(FinancialPeriodService::class)->close('2026-08', 'Rekonsiliasi Agustus telah selesai.');

        $retry = $ledger->postTwoSidedJournal($this->journalData(
            '2026-08-15',
            $accounts['operating_expense']->id,
            $accounts['operating_bank']->id,
            'phase6-source',
        ));
        $this->assertSame($source->id, $retry->id);

        try {
            $ledger->reverse($source, 'Koreksi transaksi periode tertutup.');
            $this->fail('Reversal transaksi periode tertutup seharusnya ditolak.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('periode tertutup', $exception->getMessage());
        }

        try {
            $ledger->postTwoSidedJournal($this->journalData(
                '2026-08-20',
                $accounts['operating_expense']->id,
                $accounts['operating_bank']->id,
                'phase6-rejected',
            ));
            $this->fail('Posting periode tertutup seharusnya ditolak.');
        } catch (DomainException $exception) {
            $this->assertStringContainsString('sudah ditutup', $exception->getMessage());
        }

        $adjustment = $ledger->postTwoSidedJournal([
            ...$this->journalData('2026-09-19', $accounts['operating_bank']->id, $accounts['operating_expense']->id, 'phase6-adjustment'),
            'transaction_type' => 'period_adjustment',
            'adjustment_of_id' => $source->id,
            'adjustment_reason' => 'Koreksi klasifikasi biaya Agustus.',
        ]);

        $this->assertSame($source->id, $adjustment->adjustment_of_id);
        $this->assertSame('closed', FinancialPeriod::query()->where('period_code', '2026-08')->value('status'));
        $this->assertSame(2, FinancialTransaction::query()->count());
    }

    public function test_bank_reconciliation_snapshots_ledger_balance_and_is_idempotent(): void
    {
        $this->actingAs(User::factory()->create());
        $accounts = FinancialAccount::query()->whereIn('system_key', ['operating_bank', 'owner_equity'])->get()->keyBy('system_key');
        app(FinancialLedgerService::class)->postTwoSidedJournal($this->journalData(
            '2026-09-01',
            $accounts['operating_bank']->id,
            $accounts['owner_equity']->id,
            'phase6-bank-balance',
        ));

        $payload = ['financial_account_id' => $accounts['operating_bank']->id, 'statement_date' => '2026-09-19', 'statement_balance_idr' => 190_000, 'notes' => 'Biaya bank belum tercatat', 'idempotency_key' => 'phase6-reconciliation'];
        $first = app(BankReconciliationService::class)->reconcile($payload);
        $retry = app(BankReconciliationService::class)->reconcile($payload);

        $this->assertSame($first->id, $retry->id);
        $this->assertSame(200_000, $first->ledger_balance_idr);
        $this->assertSame(-10_000, $first->difference_idr);
        $this->assertSame('difference', $first->status);
        $this->assertSame(1, BankReconciliation::query()->count());
    }

    public function test_cashflow_statement_excludes_opening_balances_transfers_and_nets_reversals(): void
    {
        $this->actingAs(User::factory()->create());
        $accounts = FinancialAccount::query()->whereIn('system_key', [
            'operating_bank',
            'petty_cash',
            'operating_expense',
        ])->get()->keyBy('system_key');
        $ledger = app(FinancialLedgerService::class);

        $ledger->postOpeningBalance($accounts['operating_bank'], [
            'transaction_date' => '2026-09-01',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 1_000_000,
            'amount_idr' => 1_000_000,
            'description' => 'Saldo awal pengujian',
        ]);
        $ledger->postTwoSidedJournal([
            ...$this->journalData(
                '2026-09-02',
                $accounts['petty_cash']->id,
                $accounts['operating_bank']->id,
                'phase6-internal-transfer',
            ),
            'transaction_type' => 'transfer',
        ]);
        $ledger->postClassifiedCashTransaction([
            'transaction_type' => 'operating_expense',
            'financial_account_id' => $accounts['operating_bank']->id,
            'transaction_date' => '2026-09-03',
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 100_000,
            'amount_idr' => 100_000,
            'description' => 'Biaya operasional',
            'idempotency_key' => 'phase6-operating-expense',
        ]);
        $mistake = $ledger->postTwoSidedJournal($this->journalData(
            '2026-09-04',
            $accounts['operating_expense']->id,
            $accounts['operating_bank']->id,
            'phase6-reversed-journal',
        ));
        $ledger->reverse($mistake, 'Jurnal tidak memiliki transaksi kas nyata.');

        $cashflow = app(FinancialReportService::class)->build('2026-09-01', '2026-09-30')['cashflow'];

        $this->assertSame(0, $cashflow['total_in_idr']);
        $this->assertSame(100_000, $cashflow['total_out_idr']);
        $this->assertSame(-100_000, $cashflow['net_idr']);
        $this->assertSame('operating', $cashflow['rows'][0]['activity_category']);
        $this->assertSame('operating_expense', $cashflow['rows'][0]['transaction_type']);
    }

    public function test_period_routes_require_finance_permission_and_super_admin_for_reopening(): void
    {
        $finance = User::factory()->create();
        Permission::findOrCreate('menu.financial_report.approve', 'web');
        $finance->givePermissionTo('menu.financial_report.approve');

        $this->actingAs($finance)
            ->post(route('financial.report.periods.close'), [
                'period_code' => '2026-08',
                'reason' => 'Rekonsiliasi Agustus telah disetujui Finance.',
            ])
            ->assertRedirect();

        $period = FinancialPeriod::query()->where('period_code', '2026-08')->sole();
        $this->actingAs($finance)
            ->post(route('financial.report.periods.reopen', $period), [
                'reason' => 'Perlu koreksi dokumen transaksi Agustus.',
            ])
            ->assertForbidden();

        $superAdmin = User::factory()->create(['username' => 'admin']);
        $this->actingAs($superAdmin)
            ->post(route('financial.report.periods.reopen', $period), [
                'reason' => 'Perlu koreksi dokumen transaksi Agustus.',
            ])
            ->assertRedirect();

        $this->assertSame('open', $period->fresh()->status);
        $this->assertSame(['closed', 'reopened'], $period->events()->oldest('id')->pluck('action')->all());
    }

    /** @return array<string, mixed> */
    private function journalData(string $date, int $debitAccountId, int $creditAccountId, string $key): array
    {
        return [
            'transaction_date' => $date,
            'transaction_type' => 'manual_journal',
            'debit_account_id' => $debitAccountId,
            'credit_account_id' => $creditAccountId,
            'currency' => 'IDR',
            'exchange_rate' => 1,
            'amount_original' => 200_000,
            'amount_idr' => 200_000,
            'description' => 'Transaksi pengujian Phase 6',
            'idempotency_key' => $key,
        ];
    }
}
