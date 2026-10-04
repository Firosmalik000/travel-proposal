<?php

namespace App\Services;

use App\Models\BankReconciliation;
use App\Models\Cashflow;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;

class FinancialReportingAuditService
{
    /** @return array<string, int> */
    public function summary(): array
    {
        $debit = (int) FinancialTransactionLine::query()->where('entry_type', 'debit')->sum('amount_idr');
        $credit = (int) FinancialTransactionLine::query()->where('entry_type', 'credit')->sum('amount_idr');
        $reconciliationMismatch = BankReconciliation::query()
            ->whereRaw('difference_idr <> statement_balance_idr - ledger_balance_idr')
            ->orWhere(function ($query): void {
                $query->where('status', 'matched')->where('difference_idr', '<>', 0);
            })
            ->orWhere(function ($query): void {
                $query->where('status', 'difference')->where('difference_idr', 0);
            })->count();

        $closedPeriodPostings = FinancialTransaction::query()
            ->whereExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('financial_periods')
                    ->where('financial_periods.status', 'closed')
                    ->whereColumn('financial_periods.start_date', '<=', 'financial_transactions.transaction_date')
                    ->whereColumn('financial_periods.end_date', '>=', 'financial_transactions.transaction_date')
                    ->whereRaw("financial_transactions.created_at > (SELECT MAX(financial_period_events.occurred_at) FROM financial_period_events WHERE financial_period_events.financial_period_id = financial_periods.id AND financial_period_events.action = 'closed')");
            })->count();
        $periods = FinancialPeriod::query()->with('events')->get();
        $invalidAdjustments = FinancialTransaction::query()
            ->where('transaction_type', 'period_adjustment')
            ->with('adjustmentOf:id,transaction_date')
            ->get()
            ->filter(function (FinancialTransaction $transaction) use ($periods): bool {
                $sourceDate = $transaction->adjustmentOf?->transaction_date;

                return ! $sourceDate || ! $periods->contains(
                    fn (FinancialPeriod $period): bool => $sourceDate->betweenIncluded($period->start_date, $period->end_date)
                        && $period->events->contains(fn ($event): bool => $event->action === 'closed' && $event->occurred_at->lte($transaction->created_at)),
                );
            })->count();
        $unpostedCashflows = Cashflow::query()
            ->where('category', '!=', 'booking_payment')
            ->whereDoesntHave('financialTransactions')
            ->count();

        return [
            'ledger_debit_idr' => $debit,
            'ledger_credit_idr' => $credit,
            'ledger_difference_idr' => $debit - $credit,
            'closed_periods' => $periods->where('status', 'closed')->count(),
            'closed_period_postings_after_close' => $closedPeriodPostings,
            'bank_reconciliations' => BankReconciliation::query()->count(),
            'bank_reconciliation_inconsistencies' => $reconciliationMismatch,
            'adjustments_without_closed_source' => $invalidAdjustments,
            'unposted_manual_cashflows' => $unpostedCashflows,
        ];
    }

    /** @param array<string, int> $summary */
    public function hasInconsistencies(array $summary): bool
    {
        return ($summary['ledger_difference_idr'] ?? 0) !== 0
            || ($summary['closed_period_postings_after_close'] ?? 0) > 0
            || ($summary['bank_reconciliation_inconsistencies'] ?? 0) > 0
            || ($summary['adjustments_without_closed_source'] ?? 0) > 0
            || ($summary['unposted_manual_cashflows'] ?? 0) > 0;
    }
}
