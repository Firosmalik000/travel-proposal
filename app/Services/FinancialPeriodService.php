<?php

namespace App\Services;

use App\Models\BankReconciliation;
use App\Models\FinancialAccount;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinancialPeriodService
{
    public function __construct(
        private readonly FinancialLedgerAuditService $ledgerAudit,
        private readonly FinancialReportingAuditService $reportingAudit,
        private readonly BookingPaymentCashflowAuditService $bookingPaymentAudit,
        private readonly VendorFinanceAuditService $vendorAudit,
        private readonly TripFinanceAuditService $tripAudit,
        private readonly BankReconciliationService $bankReconciliationService,
    ) {}

    public function ensurePostingAllowed(string $transactionDate): void
    {
        if ($this->isClosed($transactionDate)) {
            throw new DomainException('Periode transaksi sudah ditutup. Gunakan adjustment pada periode yang masih terbuka.');
        }
    }

    public function isClosed(string $transactionDate): bool
    {
        return FinancialPeriod::query()
            ->where('status', 'closed')
            ->whereDate('start_date', '<=', $transactionDate)
            ->whereDate('end_date', '>=', $transactionDate)
            ->exists();
    }

    public function lockForPosting(string $transactionDate): FinancialPeriod
    {
        $date = CarbonImmutable::parse($transactionDate);
        $periodCode = $date->format('Y-m');

        FinancialPeriod::query()->firstOrCreate(
            ['period_code' => $periodCode],
            [
                'start_date' => $date->startOfMonth()->toDateString(),
                'end_date' => $date->endOfMonth()->toDateString(),
                'status' => 'open',
            ],
        );

        $period = FinancialPeriod::query()->where('period_code', $periodCode)->lockForUpdate()->firstOrFail();
        if ($period->status === 'closed') {
            throw new DomainException('Periode transaksi sudah ditutup. Gunakan adjustment pada periode yang masih terbuka.');
        }

        return $period;
    }

    public function close(string $periodCode, string $reason): FinancialPeriod
    {
        $month = CarbonImmutable::createFromFormat('!Y-m', $periodCode);
        if (! $month || $month->format('Y-m') !== $periodCode) {
            throw new DomainException('Format periode tidak valid.');
        }

        $start = $month->startOfMonth();
        $end = $month->endOfMonth();
        if ($end->isFuture()) {
            throw new DomainException('Periode hanya dapat ditutup setelah bulan berakhir.');
        }

        return DB::transaction(function () use ($periodCode, $start, $end, $reason): FinancialPeriod {
            $period = FinancialPeriod::query()->firstOrCreate(
                ['period_code' => $periodCode],
                ['start_date' => $start->toDateString(), 'end_date' => $end->toDateString(), 'status' => 'open'],
            );
            $period = FinancialPeriod::query()->lockForUpdate()->findOrFail($period->id);

            if ($period->status === 'closed') {
                return $period->load('events.actor:id,name');
            }

            if (FinancialTransaction::query()
                ->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()])
                ->where('status', 'draft')
                ->exists()) {
                throw new DomainException('Periode masih memiliki transaksi draft dan belum dapat ditutup.');
            }

            $this->ensureAuditReadyForClosing($end->toDateString());

            $period->update(['status' => 'closed']);
            $period->events()->create([
                'action' => 'closed',
                'reason' => trim($reason),
                'actor_id' => Auth::id(),
                'occurred_at' => now(),
            ]);

            return $period->load('events.actor:id,name');
        });
    }

    public function reopen(FinancialPeriod $period, string $reason): FinancialPeriod
    {
        return DB::transaction(function () use ($period, $reason): FinancialPeriod {
            $locked = FinancialPeriod::query()->lockForUpdate()->findOrFail($period->id);
            if ($locked->status === 'open') {
                return $locked->load('events.actor:id,name');
            }

            $locked->update(['status' => 'open']);
            $locked->events()->create([
                'action' => 'reopened',
                'reason' => trim($reason),
                'actor_id' => Auth::id(),
                'occurred_at' => now(),
            ]);

            return $locked->load('events.actor:id,name');
        });
    }

    private function ensureAuditReadyForClosing(string $endDate): void
    {
        $audits = [
            [$this->ledgerAudit, $this->ledgerAudit->summary(), 'ledger'],
            [$this->reportingAudit, $this->reportingAudit->summary(), 'laporan'],
            [$this->bookingPaymentAudit, $this->bookingPaymentAudit->summary(), 'pembayaran booking'],
            [$this->vendorAudit, $this->vendorAudit->summary(), 'vendor'],
            [$this->tripAudit, $this->tripAudit->summary(), 'trip'],
        ];

        $failedAudits = collect($audits)
            ->filter(fn (array $audit): bool => $audit[0]->hasInconsistencies($audit[1]))
            ->pluck(2)
            ->implode(', ');

        if ($failedAudits !== '') {
            throw new DomainException("Periode belum dapat ditutup karena audit {$failedAudits} masih memiliki inkonsistensi.");
        }

        $cashAccounts = FinancialAccount::query()
            ->where('is_active', true)
            ->where('is_cash_account', true)
            ->where('cash_account_type', '!=', 'legacy')
            ->whereHas('transactionLines.transaction', fn ($query) => $query
                ->whereIn('status', ['posted', 'reversed'])
                ->whereDate('transaction_date', '<=', $endDate))
            ->get();

        $unreconciledAccounts = $cashAccounts->filter(function (FinancialAccount $account) use ($endDate): bool {
            $reconciliation = BankReconciliation::query()
                ->where('financial_account_id', $account->id)
                ->whereDate('statement_date', $endDate)
                ->where('status', 'matched')
                ->first();

            return ! $reconciliation
                || $reconciliation->difference_idr !== 0
                || $reconciliation->ledger_balance_idr !== $this->bankReconciliationService->balanceAt($account, $endDate);
        });

        if ($unreconciledAccounts->isNotEmpty()) {
            throw new DomainException('Periode belum dapat ditutup. Rekonsiliasi akhir periode belum cocok untuk: '.$unreconciledAccounts->pluck('name')->implode(', ').'.');
        }
    }
}
