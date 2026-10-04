<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Models\TripOperationalTransition;

class TripFinanceAuditService
{
    /** @return array<string, int> */
    public function summary(): array
    {
        $closures = TripOperationalTransition::query()
            ->where('to_status', 'financially_closed')
            ->whereNull('reversed_at')
            ->with('transaction.lines.account')
            ->get();
        $duplicateActiveClosures = $closures->groupBy('package_id')->filter(fn ($items): bool => $items->count() > 1)->count();
        $closedPackageIds = TravelPackage::query()->where('operational_status', 'financially_closed')->pluck('id');
        $missingClosures = $closedPackageIds->filter(fn (int $id): bool => $closures->where('package_id', $id)->count() !== 1)->count();
        $statusMismatches = $closures->filter(fn (TripOperationalTransition $closure): bool => ! $closedPackageIds->contains($closure->package_id))->count();
        $missingTransactions = $closures->filter(fn (TripOperationalTransition $closure): bool => ! $closure->transaction || $closure->transaction->status !== 'posted')->count();
        $amountMismatches = $closures->filter(fn (TripOperationalTransition $closure): bool => (int) $closure->revenue_amount_idr !== (int) ($closure->transaction?->amount_idr ?? 0))->count();
        $accountMismatches = $closures->filter(function (TripOperationalTransition $closure): bool {
            $lines = $closure->transaction?->lines;
            if (! $lines || $lines->count() !== 2) {
                return true;
            }

            $debit = $lines->firstWhere('entry_type', 'debit');
            $credit = $lines->firstWhere('entry_type', 'credit');

            return $debit?->account?->system_key !== 'customer_advance'
                || $credit?->account?->system_key !== 'trip_revenue';
        })->count();

        return [
            'packages_total' => TravelPackage::query()->count(),
            'packages_returned' => TravelPackage::query()->where('operational_status', 'returned')->count(),
            'packages_financially_closed' => $closedPackageIds->count(),
            'active_closures' => $closures->count(),
            'recognized_revenue_idr' => (int) $closures->sum('revenue_amount_idr'),
            'revenue_transactions' => FinancialTransaction::query()->where('transaction_type', 'trip_revenue_recognition')->count(),
            'missing_closures' => $missingClosures,
            'duplicate_active_closures' => $duplicateActiveClosures,
            'closure_status_mismatches' => $statusMismatches,
            'missing_closure_transactions' => $missingTransactions,
            'closure_amount_mismatches' => $amountMismatches,
            'closure_account_mismatches' => $accountMismatches,
        ];
    }

    /** @param array<string, int> $summary */
    public function hasInconsistencies(array $summary): bool
    {
        return collect($summary)->only([
            'missing_closures', 'duplicate_active_closures', 'closure_status_mismatches',
            'missing_closure_transactions', 'closure_amount_mismatches', 'closure_account_mismatches',
        ])->contains(fn (int $value): bool => $value > 0);
    }
}
