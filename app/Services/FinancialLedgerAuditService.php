<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use App\Models\FinancialTransactionType;

class FinancialLedgerAuditService
{
    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        $transactions = FinancialTransaction::query()
            ->withCount('lines')
            ->with(['lines:id,financial_transaction_id,entry_type,amount_idr', 'reversal:id,reversal_of_id']);

        $allTransactions = (clone $transactions)->get();
        $validTypeCodes = FinancialTransactionType::query()->pluck('code')->flip();
        $unbalancedTransactions = FinancialTransactionLine::query()
            ->select('financial_transaction_id')
            ->selectRaw("SUM(CASE WHEN entry_type = 'debit' THEN amount_idr ELSE 0 END) as debit_total")
            ->selectRaw("SUM(CASE WHEN entry_type = 'credit' THEN amount_idr ELSE 0 END) as credit_total")
            ->groupBy('financial_transaction_id')
            ->havingRaw("SUM(CASE WHEN entry_type = 'debit' THEN amount_idr ELSE 0 END) <> SUM(CASE WHEN entry_type = 'credit' THEN amount_idr ELSE 0 END)")
            ->get();

        $debitTotal = (int) FinancialTransactionLine::query()->where('entry_type', 'debit')->sum('amount_idr');
        $creditTotal = (int) FinancialTransactionLine::query()->where('entry_type', 'credit')->sum('amount_idr');

        return [
            'transactions_total' => $allTransactions->count(),
            'posted_transactions' => $allTransactions->where('status', 'posted')->count(),
            'reversed_transactions' => $allTransactions->where('status', 'reversed')->count(),
            'reversal_transactions' => $allTransactions->where('transaction_type', 'reversal')->count(),
            'transactions_with_less_than_two_lines' => $allTransactions->where('lines_count', '<', 2)->count(),
            'unbalanced_transactions' => $unbalancedTransactions->count(),
            'reversal_without_original' => $allTransactions
                ->where('transaction_type', 'reversal')
                ->whereNull('reversal_of_id')
                ->count(),
            'reversed_without_reversal' => $allTransactions
                ->where('status', 'reversed')
                ->filter(fn (FinancialTransaction $transaction): bool => $transaction->reversal === null)
                ->count(),
            'uncategorized_transactions' => $allTransactions
                ->whereNull('category_code')
                ->count(),
            'invalid_category_transactions' => $allTransactions
                ->reject(fn (FinancialTransaction $transaction): bool => $validTypeCodes->has((string) $transaction->category_code))
                ->count(),
            'reversal_category_mismatches' => $allTransactions
                ->where('transaction_type', 'reversal')
                ->filter(function (FinancialTransaction $transaction) use ($allTransactions): bool {
                    $original = $allTransactions->firstWhere('id', $transaction->reversal_of_id);

                    return $original !== null && $original->category_code !== $transaction->category_code;
                })
                ->count(),
            'debit_total_idr' => $debitTotal,
            'credit_total_idr' => $creditTotal,
        ];
    }

    /**
     * @param  array<string, int>  $summary
     */
    public function hasInconsistencies(array $summary): bool
    {
        return collect([
            'transactions_with_less_than_two_lines',
            'unbalanced_transactions',
            'reversal_without_original',
            'reversed_without_reversal',
            'uncategorized_transactions',
            'invalid_category_transactions',
            'reversal_category_mismatches',
        ])->contains(fn (string $key): bool => ($summary[$key] ?? 0) > 0)
            || ($summary['debit_total_idr'] ?? 0) !== ($summary['credit_total_idr'] ?? 0);
    }
}
