<?php

namespace App\Services;

use App\Models\BankReconciliation;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialBudget;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use App\Models\InventoryItem;
use App\Models\PackageCostCalculation;
use App\Models\TravelPackage;
use App\Models\VendorBill;
use Carbon\CarbonImmutable;

class FinancialReportService
{
    public function __construct(private readonly PackageRoomConfigurationService $roomConfigurationService) {}

    /**
     * @return array<string, mixed>
     */
    public function build(string $from, string $to): array
    {
        $accountBalances = $this->accountBalances($to);
        $profitLoss = $this->profitLoss($from, $to);
        $cashflow = $this->cashflow($from, $to);
        $balanceSheet = $this->balanceSheet($accountBalances);

        return [
            'summary' => [
                'cash_balance_idr' => (int) collect($accountBalances)->where('is_cash_account', true)->sum('balance_idr'),
                'customer_funds_idr' => (int) collect($accountBalances)->where('cash_account_type', 'customer_funds')->sum('balance_idr'),
                'customer_advance_idr' => (int) collect($accountBalances)->where('system_key', 'customer_advance')->sum('balance_idr'),
                'revenue_idr' => $profitLoss['revenue_idr'],
                'expenses_idr' => $profitLoss['expenses_idr'],
                'net_profit_idr' => $profitLoss['net_profit_idr'],
                'cash_in_idr' => $cashflow['total_in_idr'],
                'cash_out_idr' => $cashflow['total_out_idr'],
            ],
            'account_balances' => $accountBalances,
            'profit_loss' => $profitLoss,
            'balance_sheet' => $balanceSheet,
            'cashflow' => $cashflow,
            'trip_profitability' => $this->tripProfitability($from, $to),
            'budgets' => $this->budgetPerformance($from, $to),
            'customer_receivables' => $this->customerReceivables($to),
            'vendor_payables' => $this->vendorPayables($to),
            'inventory' => $this->inventory(),
            'capital_movements' => $this->capitalMovements($from, $to),
            'reconciliations' => BankReconciliation::query()
                ->with(['account:id,code,name', 'reconciledBy:id,name'])
                ->latest('statement_date')->latest('id')->limit(50)->get()
                ->map(fn (BankReconciliation $item): array => [
                    'id' => $item->id,
                    'account_name' => $item->account?->code.' · '.$item->account?->name,
                    'statement_date' => $item->statement_date?->toDateString(),
                    'statement_balance_idr' => $item->statement_balance_idr,
                    'ledger_balance_idr' => $item->ledger_balance_idr,
                    'difference_idr' => $item->difference_idr,
                    'status' => $item->status,
                    'notes' => $item->notes,
                    'reconciled_by_name' => $item->reconciledBy?->name,
                ])->all(),
            'periods' => FinancialPeriod::query()
                ->with(['events' => fn ($query) => $query->with('actor:id,name')->latest('occurred_at')])
                ->latest('period_code')->limit(24)->get()
                ->map(fn (FinancialPeriod $period): array => [
                    'id' => $period->id,
                    'period_code' => $period->period_code,
                    'start_date' => $period->start_date?->toDateString(),
                    'end_date' => $period->end_date?->toDateString(),
                    'status' => $period->status,
                    'events' => $period->events->map(fn ($event): array => [
                        'action' => $event->action,
                        'reason' => $event->reason,
                        'actor_name' => $event->actor?->name,
                        'occurred_at' => $event->occurred_at?->toDateTimeString(),
                    ])->all(),
                ])->all(),
            'audit_trail' => FinancialTransaction::query()
                ->with(['postedBy:id,name', 'adjustmentOf:id,transaction_number'])
                ->whereBetween('transaction_date', [$from, $to])
                ->latest('transaction_date')->latest('id')->limit(50)->get()
                ->map(fn (FinancialTransaction $transaction): array => [
                    'id' => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'transaction_date' => $transaction->transaction_date?->toDateString(),
                    'transaction_type' => $transaction->transaction_type,
                    'status' => $transaction->status,
                    'amount_idr' => $transaction->amount_idr,
                    'description' => $transaction->description,
                    'posted_by_name' => $transaction->postedBy?->name,
                    'reversal_of_id' => $transaction->reversal_of_id,
                    'adjustment_of_number' => $transaction->adjustmentOf?->transaction_number,
                ])->all(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function accountBalances(string $to): array
    {
        $totals = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->whereDate('financial_transactions.transaction_date', '<=', $to)
            ->groupBy('financial_transaction_lines.financial_account_id')
            ->select('financial_transaction_lines.financial_account_id')
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as debit_total")
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as credit_total")
            ->get()->keyBy('financial_account_id');

        return FinancialAccount::query()->orderBy('code')->get()->map(function (FinancialAccount $account) use ($totals): array {
            $row = $totals->get($account->id);
            $debit = (int) ($row?->debit_total ?? 0);
            $credit = (int) ($row?->credit_total ?? 0);

            return [
                'id' => $account->id,
                'code' => $account->code,
                'name' => $account->name,
                'type' => $account->type,
                'system_key' => $account->system_key,
                'is_cash_account' => $account->is_cash_account,
                'cash_account_type' => $account->cash_account_type,
                'currency' => $account->currency,
                'debit_total' => $debit,
                'credit_total' => $credit,
                'balance_idr' => $account->usesDebitNormalBalance() ? $debit - $credit : $credit - $debit,
            ];
        })->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $accountBalances
     * @return array<string, int>
     */
    private function balanceSheet(array $accountBalances): array
    {
        $balances = collect($accountBalances);
        $assets = (int) $balances->where('type', 'asset')->sum('balance_idr');
        $liabilities = (int) $balances->where('type', 'liability')->sum('balance_idr');
        $equity = (int) $balances->where('type', 'equity')->sum('balance_idr');
        $retainedEarnings = (int) $balances->where('type', 'revenue')->sum('balance_idr')
            - (int) $balances->where('type', 'expense')->sum('balance_idr');
        $liabilitiesAndEquity = $liabilities + $equity + $retainedEarnings;

        return [
            'assets_idr' => $assets,
            'liabilities_idr' => $liabilities,
            'equity_idr' => $equity,
            'retained_earnings_idr' => $retainedEarnings,
            'liabilities_and_equity_idr' => $liabilitiesAndEquity,
            'difference_idr' => $assets - $liabilitiesAndEquity,
        ];
    }

    /** @return array<string, mixed> */
    private function profitLoss(string $from, string $to): array
    {
        $rows = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->join('financial_accounts', 'financial_accounts.id', '=', 'financial_transaction_lines.financial_account_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->whereBetween('financial_transactions.transaction_date', [$from, $to])
            ->whereIn('financial_accounts.type', ['revenue', 'expense'])
            ->groupBy('financial_accounts.id', 'financial_accounts.code', 'financial_accounts.name', 'financial_accounts.type')
            ->select('financial_accounts.id', 'financial_accounts.code', 'financial_accounts.name', 'financial_accounts.type')
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as debit_total")
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as credit_total")
            ->orderBy('financial_accounts.code')->get()
            ->map(function ($row): array {
                $debit = (int) $row->debit_total;
                $credit = (int) $row->credit_total;

                return [
                    'id' => (int) $row->id,
                    'code' => $row->code,
                    'name' => $row->name,
                    'type' => $row->type,
                    'amount_idr' => $row->type === 'revenue' ? $credit - $debit : $debit - $credit,
                ];
            });
        $revenue = (int) $rows->where('type', 'revenue')->sum('amount_idr');
        $expenses = (int) $rows->where('type', 'expense')->sum('amount_idr');

        $monthly = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->join('financial_accounts', 'financial_accounts.id', '=', 'financial_transaction_lines.financial_account_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->whereBetween('financial_transactions.transaction_date', [$from, $to])
            ->whereIn('financial_accounts.type', ['revenue', 'expense'])
            ->selectRaw("DATE_FORMAT(financial_transactions.transaction_date, '%Y-%m') as month")
            ->selectRaw("SUM(CASE WHEN financial_accounts.type = 'revenue' AND financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr WHEN financial_accounts.type = 'revenue' THEN -financial_transaction_lines.amount_idr ELSE 0 END) as revenue_idr")
            ->selectRaw("SUM(CASE WHEN financial_accounts.type = 'expense' AND financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr WHEN financial_accounts.type = 'expense' THEN -financial_transaction_lines.amount_idr ELSE 0 END) as expenses_idr")
            ->groupByRaw("DATE_FORMAT(financial_transactions.transaction_date, '%Y-%m')")
            ->orderBy('month')->get()
            ->map(fn ($row): array => [
                'month' => $row->month,
                'revenue_idr' => (int) $row->revenue_idr,
                'expenses_idr' => (int) $row->expenses_idr,
                'net_profit_idr' => (int) $row->revenue_idr - (int) $row->expenses_idr,
            ])->all();

        return ['revenue_idr' => $revenue, 'expenses_idr' => $expenses, 'net_profit_idr' => $revenue - $expenses, 'accounts' => $rows->all(), 'monthly' => $monthly];
    }

    /** @return array<string, mixed> */
    private function cashflow(string $from, string $to): array
    {
        $effectiveType = 'COALESCE(original_transactions.transaction_type, financial_transactions.transaction_type)';
        $activityCategory = "CASE
            WHEN {$effectiveType} IN ('capital_contribution', 'owner_withdrawal') THEN 'financing'
            WHEN {$effectiveType} IN ('booking_payment', 'customer_refund', 'operating_expense', 'other_income', 'agent_commission', 'inventory_purchase', 'vendor_payment', 'vendor_advance_payment') THEN 'operating'
            ELSE 'unclassified'
        END";

        $rows = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->leftJoin('financial_transactions as original_transactions', 'original_transactions.id', '=', 'financial_transactions.reversal_of_id')
            ->join('financial_accounts', 'financial_accounts.id', '=', 'financial_transaction_lines.financial_account_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->where('financial_accounts.is_cash_account', true)
            ->whereBetween('financial_transactions.transaction_date', [$from, $to])
            ->whereRaw("{$effectiveType} NOT IN ('opening_balance', 'transfer')")
            ->groupByRaw($effectiveType.', '.$activityCategory)
            ->selectRaw("{$effectiveType} as transaction_type")
            ->selectRaw("{$activityCategory} as activity_category")
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE -financial_transaction_lines.amount_idr END) as net_idr")
            ->orderBy('activity_category')
            ->orderBy('transaction_type')
            ->get()
            ->map(function ($row): array {
                $net = (int) $row->net_idr;

                return [
                    'activity_category' => $row->activity_category,
                    'transaction_type' => $row->transaction_type,
                    'cash_in_idr' => max(0, $net),
                    'cash_out_idr' => max(0, -$net),
                    'net_idr' => $net,
                ];
            })
            ->filter(fn (array $row): bool => $row['net_idr'] !== 0)
            ->values();

        return [
            'total_in_idr' => (int) $rows->sum('cash_in_idr'),
            'total_out_idr' => (int) $rows->sum('cash_out_idr'),
            'net_idr' => (int) $rows->sum('net_idr'),
            'rows' => $rows->all(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function tripProfitability(string $from, string $to): array
    {
        $ledger = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->join('financial_accounts', 'financial_accounts.id', '=', 'financial_transaction_lines.financial_account_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->whereNotNull('financial_transactions.package_id')
            ->whereBetween('financial_transactions.transaction_date', [$from, $to])
            ->whereIn('financial_accounts.type', ['revenue', 'expense'])
            ->groupBy('financial_transactions.package_id')
            ->select('financial_transactions.package_id')
            ->selectRaw("SUM(CASE WHEN financial_accounts.type = 'revenue' AND financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr WHEN financial_accounts.type = 'revenue' THEN -financial_transaction_lines.amount_idr ELSE 0 END) as revenue_idr")
            ->selectRaw("SUM(CASE WHEN financial_accounts.type = 'expense' AND financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr WHEN financial_accounts.type = 'expense' THEN -financial_transaction_lines.amount_idr ELSE 0 END) as actual_cost_idr")
            ->get()->keyBy('package_id');

        $budgets = PackageCostCalculation::query()->latest('calculated_at')->latest('id')->get()->unique('package_id')->keyBy('package_id');
        $packageIds = $ledger->keys()->merge($budgets->keys())->unique();

        return TravelPackage::query()->whereIn('id', $packageIds)->orderByDesc('start_date')->get()->map(function (TravelPackage $package) use ($ledger, $budgets): array {
            $actual = $ledger->get($package->id);
            $budget = $budgets->get($package->id);
            $revenue = (int) ($actual?->revenue_idr ?? 0);
            $actualCost = (int) ($actual?->actual_cost_idr ?? 0);
            $budgetCost = (int) ($budget?->grand_total ?? data_get($package->content, 'hpp_estimate.grand_total', 0));

            return [
                'package_id' => $package->id,
                'code' => $package->code,
                'name' => (string) (data_get($package->name, 'id') ?? $package->name ?? $package->code),
                'start_date' => $package->start_date?->toDateString(),
                'operational_status' => $package->operational_status,
                'budget_cost_idr' => $budgetCost,
                'actual_cost_idr' => $actualCost,
                'variance_idr' => $budgetCost - $actualCost,
                'revenue_idr' => $revenue,
                'gross_profit_idr' => $revenue - $actualCost,
            ];
        })->all();
    }

    /** @return array<string, mixed> */
    private function budgetPerformance(string $from, string $to): array
    {
        $budgets = FinancialBudget::query()
            ->with(['package:id,code,name', 'lines.account:id,code,name', 'approvedBy:id,name'])
            ->whereDate('period_start', '<=', $to)
            ->whereDate('period_end', '>=', $from)
            ->latest('period_start')
            ->latest('id')
            ->get();

        if ($budgets->isEmpty()) {
            return ['planned_idr' => 0, 'actual_idr' => 0, 'remaining_idr' => 0, 'rows' => []];
        }

        $actuals = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->join('financial_accounts', 'financial_accounts.id', '=', 'financial_transaction_lines.financial_account_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->where('financial_accounts.type', 'expense')
            ->whereBetween('financial_transactions.transaction_date', [
                $budgets->min(fn (FinancialBudget $budget): string => $budget->period_start->toDateString()),
                $budgets->max(fn (FinancialBudget $budget): string => $budget->period_end->toDateString()),
            ])
            ->selectRaw('DATE(financial_transactions.transaction_date) as transaction_date')
            ->selectRaw('financial_transaction_lines.financial_account_id as account_id')
            ->selectRaw('financial_transactions.package_id as package_id')
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE -financial_transaction_lines.amount_idr END) as actual_idr")
            ->groupByRaw('DATE(financial_transactions.transaction_date), financial_transaction_lines.financial_account_id, financial_transactions.package_id')
            ->get();

        $rows = $budgets->map(function (FinancialBudget $budget) use ($actuals): array {
            $lines = $budget->lines->map(function ($line) use ($budget, $actuals): array {
                $actual = (int) $actuals
                    ->where('account_id', $line->financial_account_id)
                    ->filter(fn ($row): bool => $budget->package_id === null || (int) $row->package_id === (int) $budget->package_id)
                    ->filter(fn ($row): bool => $row->transaction_date >= $budget->period_start->toDateString() && $row->transaction_date <= $budget->period_end->toDateString())
                    ->sum('actual_idr');
                $planned = (int) $line->planned_amount_idr;

                return [
                    'id' => $line->id,
                    'financial_account_id' => $line->financial_account_id,
                    'account_label' => $line->account?->code.' · '.$line->account?->name,
                    'planned_amount_idr' => $planned,
                    'actual_amount_idr' => $actual,
                    'remaining_amount_idr' => $planned - $actual,
                    'utilization_percent' => $planned > 0 ? round(($actual / $planned) * 100, 1) : 0,
                    'notes' => $line->notes,
                ];
            })->values();
            $planned = (int) $lines->sum('planned_amount_idr');
            $actual = (int) $lines->sum('actual_amount_idr');

            return [
                'id' => $budget->id,
                'budget_number' => $budget->budget_number,
                'name' => $budget->name,
                'package_id' => $budget->package_id,
                'package_label' => $budget->package ? $budget->package->code.' · '.(data_get($budget->package->name, 'id') ?? $budget->package->code) : null,
                'period_start' => $budget->period_start->toDateString(),
                'period_end' => $budget->period_end->toDateString(),
                'status' => $budget->status,
                'notes' => $budget->notes,
                'approved_by_name' => $budget->approvedBy?->name,
                'approved_at' => $budget->approved_at?->toDateTimeString(),
                'planned_amount_idr' => $planned,
                'actual_amount_idr' => $actual,
                'remaining_amount_idr' => $planned - $actual,
                'utilization_percent' => $planned > 0 ? round(($actual / $planned) * 100, 1) : 0,
                'lines' => $lines->all(),
            ];
        })->values();

        $planned = (int) $rows->sum('planned_amount_idr');
        $actual = (int) $rows->sum('actual_amount_idr');

        return ['planned_idr' => $planned, 'actual_idr' => $actual, 'remaining_idr' => $planned - $actual, 'rows' => $rows->all()];
    }

    /** @return array<string, mixed> */
    private function customerReceivables(string $asOf): array
    {
        $rows = Booking::query()->with(['package', 'payments.financialTransactions'])->where('status', 'registered')->get()->map(function (Booking $booking) use ($asOf): ?array {
            $agreed = (int) ($booking->agreed_total_amount ?: $this->roomConfigurationService->calculateBookingAmount($booking));
            $paid = (int) $booking->payments->where('status', 'confirmed')->sum(function (BookingPayment $payment): int {
                $confirmed = (int) ($payment->amount_idr ?? $payment->amount);
                $refunded = (int) $payment->financialTransactions
                    ->where('transaction_type', 'customer_refund')
                    ->where('status', 'posted')
                    ->sum('amount_idr');

                return max(0, $confirmed - $refunded);
            });
            $remaining = max(0, $agreed - $paid);
            if ($remaining === 0) {
                return null;
            }

            $due = $booking->custom_departure_date ?? $booking->package?->start_date;
            $daysOverdue = $due ? max(0, CarbonImmutable::parse($due)->diffInDays(CarbonImmutable::parse($asOf), false)) : 0;

            return [
                'booking_id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'customer_name' => $booking->full_name,
                'due_date' => $due?->toDateString(),
                'agreed_amount_idr' => $agreed,
                'paid_amount_idr' => $paid,
                'remaining_amount_idr' => $remaining,
                'aging_bucket' => $daysOverdue <= 0 ? 'belum_jatuh_tempo' : ($daysOverdue <= 30 ? '1_30' : ($daysOverdue <= 60 ? '31_60' : ($daysOverdue <= 90 ? '61_90' : 'lebih_90'))),
            ];
        })->filter()->values();

        return ['total_idr' => (int) $rows->sum('remaining_amount_idr'), 'rows' => $rows->all()];
    }

    /** @return array<string, mixed> */
    private function vendorPayables(string $asOf): array
    {
        $rows = VendorBill::query()->with(['vendor:id,name', 'package:id,code,name'])->whereIn('status', ['open', 'partially_paid'])->get()->map(function (VendorBill $bill) use ($asOf): array {
            $daysOverdue = $bill->due_date ? max(0, $bill->due_date->diffInDays(CarbonImmutable::parse($asOf), false)) : 0;

            return [
                'id' => $bill->id,
                'invoice_number' => $bill->vendor_invoice_number,
                'vendor_name' => $bill->vendor?->name,
                'package_code' => $bill->package?->code,
                'due_date' => $bill->due_date?->toDateString(),
                'amount_idr' => $bill->amount_idr,
                'paid_amount_idr' => $bill->paid_amount_idr,
                'remaining_amount_idr' => $bill->remainingAmount(),
                'aging_bucket' => $daysOverdue <= 0 ? 'belum_jatuh_tempo' : ($daysOverdue <= 30 ? '1_30' : ($daysOverdue <= 60 ? '31_60' : ($daysOverdue <= 90 ? '61_90' : 'lebih_90'))),
            ];
        });

        return ['total_idr' => (int) $rows->sum('remaining_amount_idr'), 'rows' => $rows->all()];
    }

    /** @return array<string, mixed> */
    private function inventory(): array
    {
        $rows = InventoryItem::query()->orderBy('item_name')->get()->map(fn (InventoryItem $item): array => [
            'id' => $item->id,
            'item_code' => $item->item_code,
            'item_name' => $item->item_name,
            'quantity' => $item->quantity,
            'reserved_quantity' => $item->reserved_quantity,
            'available_quantity' => $item->availableQuantity(),
            'average_unit_cost_idr' => $item->average_unit_cost_idr,
            'value_idr' => (int) $item->quantity * (int) $item->average_unit_cost_idr,
        ]);

        return ['total_value_idr' => (int) $rows->sum('value_idr'), 'rows' => $rows->all()];
    }

    /** @return array<string, mixed> */
    private function capitalMovements(string $from, string $to): array
    {
        $rows = FinancialTransaction::query()
            ->whereBetween('transaction_date', [$from, $to])
            ->whereIn('status', ['posted', 'reversed'])
            ->whereIn('transaction_type', ['capital_contribution', 'owner_withdrawal'])
            ->orderByDesc('transaction_date')->get()
            ->map(fn (FinancialTransaction $transaction): array => [
                'transaction_number' => $transaction->transaction_number,
                'transaction_date' => $transaction->transaction_date?->toDateString(),
                'transaction_type' => $transaction->transaction_type,
                'amount_idr' => $transaction->amount_idr,
                'description' => $transaction->description,
            ]);

        return [
            'capital_idr' => (int) $rows->where('transaction_type', 'capital_contribution')->sum('amount_idr'),
            'withdrawal_idr' => (int) $rows->where('transaction_type', 'owner_withdrawal')->sum('amount_idr'),
            'rows' => $rows->all(),
        ];
    }
}
