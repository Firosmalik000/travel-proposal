<?php

namespace App\Services;

use App\Models\BookingPayment;
use App\Models\Cashflow;
use App\Models\FinancialTransaction;
use Illuminate\Support\Facades\DB;

class BookingPaymentCashflowAuditService
{
    /**
     * @return array<string, int>
     */
    public function summary(): array
    {
        $payments = BookingPayment::query();
        $paymentTable = (new BookingPayment)->getTable();
        $cashflowTable = (new Cashflow)->getTable();
        $financialTransactionTable = (new FinancialTransaction)->getTable();

        $linkedPayments = DB::table($paymentTable.' as booking_payments')
            ->join($cashflowTable.' as cashflows', 'cashflows.id', '=', 'booking_payments.cashflow_id');

        $duplicateCashflowLinks = DB::table($paymentTable)
            ->whereNotNull('cashflow_id')
            ->select('cashflow_id')
            ->groupBy('cashflow_id')
            ->havingRaw('COUNT(*) > 1');

        $postedBookingLedgers = DB::table($financialTransactionTable.' as financial_transactions')
            ->where('source_type', (new BookingPayment)->getMorphClass())
            ->where('transaction_type', 'booking_payment')
            ->where('status', 'posted');

        $duplicatePostedBookingLedgers = (clone $postedBookingLedgers)
            ->select('source_id')
            ->groupBy('source_id')
            ->havingRaw('COUNT(*) > 1');

        return [
            'payments_total' => BookingPayment::query()->withTrashed()->count(),
            'confirmed_active' => (clone $payments)->where('status', 'confirmed')->count(),
            'confirmed_total_amount' => (int) (clone $payments)->where('status', 'confirmed')->sum('amount'),
            'confirmed_total_amount_idr' => (int) (clone $payments)
                ->where('status', 'confirmed')
                ->selectRaw('COALESCE(SUM(COALESCE(amount_idr, amount)), 0) as aggregate')
                ->value('aggregate'),
            'confirmed_without_cashflow' => (clone $payments)
                ->where('status', 'confirmed')
                ->whereNull('cashflow_id')
                ->count(),
            'linked_non_confirmed' => (clone $payments)
                ->whereNot('status', 'confirmed')
                ->whereNotNull('cashflow_id')
                ->count(),
            'duplicate_cashflow_links' => DB::query()->fromSub($duplicateCashflowLinks, 'duplicates')->count(),
            'linked_missing_cashflow' => DB::table($paymentTable.' as booking_payments')
                ->leftJoin($cashflowTable.' as cashflows', 'cashflows.id', '=', 'booking_payments.cashflow_id')
                ->whereNotNull('booking_payments.cashflow_id')
                ->whereNull('cashflows.id')
                ->count(),
            'confirmed_cashflow_deleted' => (clone $linkedPayments)
                ->whereNull('booking_payments.deleted_at')
                ->where('booking_payments.status', 'confirmed')
                ->whereNotNull('cashflows.deleted_at')
                ->count(),
            'non_confirmed_cashflow_active' => (clone $linkedPayments)
                ->whereNull('booking_payments.deleted_at')
                ->where('booking_payments.status', '!=', 'confirmed')
                ->whereNull('cashflows.deleted_at')
                ->count(),
            'linked_value_mismatches' => (clone $linkedPayments)
                ->whereNull('booking_payments.deleted_at')
                ->where(function ($query): void {
                    $query
                        ->whereRaw('cashflows.amount != COALESCE(booking_payments.amount_idr, booking_payments.amount)')
                        ->orWhereColumn('cashflows.transaction_date', '!=', 'booking_payments.payment_date')
                        ->orWhere('cashflows.type', '!=', 'income')
                        ->orWhere('cashflows.category', '!=', 'booking_payment');
                })
                ->count(),
            'reconciled_cashflow_total_amount' => (int) (clone $linkedPayments)
                ->whereNull('booking_payments.deleted_at')
                ->where('booking_payments.status', 'confirmed')
                ->whereNull('cashflows.deleted_at')
                ->whereRaw('cashflows.amount = COALESCE(booking_payments.amount_idr, booking_payments.amount)')
                ->whereColumn('cashflows.transaction_date', 'booking_payments.payment_date')
                ->where('cashflows.type', 'income')
                ->where('cashflows.category', 'booking_payment')
                ->sum('cashflows.amount'),
            'orphan_booking_cashflows' => DB::table($cashflowTable.' as cashflows')
                ->leftJoin($paymentTable.' as booking_payments', 'booking_payments.cashflow_id', '=', 'cashflows.id')
                ->where('cashflows.category', 'booking_payment')
                ->whereNull('booking_payments.id')
                ->count(),
            'confirmed_without_financial_account' => (clone $payments)
                ->where('status', 'confirmed')
                ->whereNull('financial_account_id')
                ->count(),
            'confirmed_without_financial_snapshot' => (clone $payments)
                ->where('status', 'confirmed')
                ->where(function ($query): void {
                    $query->whereNull('currency')
                        ->orWhereNull('exchange_rate')
                        ->orWhereNull('amount_idr');
                })
                ->count(),
            'confirmed_without_posted_ledger' => (clone $payments)
                ->where('status', 'confirmed')
                ->whereDoesntHave('financialTransactions', fn ($query) => $query
                    ->where('transaction_type', 'booking_payment')
                    ->where('status', 'posted'))
                ->count(),
            'non_confirmed_with_posted_ledger' => (clone $payments)
                ->whereNot('status', 'confirmed')
                ->whereHas('financialTransactions', fn ($query) => $query
                    ->where('transaction_type', 'booking_payment')
                    ->where('status', 'posted'))
                ->count(),
            'multiple_posted_booking_ledgers' => DB::query()
                ->fromSub($duplicatePostedBookingLedgers, 'duplicate_ledgers')
                ->count(),
            'ledger_value_mismatches' => DB::table($paymentTable.' as booking_payments')
                ->join($financialTransactionTable.' as financial_transactions', function ($join): void {
                    $join->on('financial_transactions.source_id', '=', 'booking_payments.id')
                        ->where('financial_transactions.source_type', (new BookingPayment)->getMorphClass())
                        ->where('financial_transactions.transaction_type', 'booking_payment')
                        ->where('financial_transactions.status', 'posted');
                })
                ->whereNull('booking_payments.deleted_at')
                ->where(function ($query): void {
                    $query->whereColumn('financial_transactions.transaction_date', '!=', 'booking_payments.payment_date')
                        ->orWhereColumn('financial_transactions.amount_idr', '!=', 'booking_payments.amount_idr')
                        ->orWhereColumn('financial_transactions.currency', '!=', 'booking_payments.currency')
                        ->orWhereColumn('financial_transactions.exchange_rate', '!=', 'booking_payments.exchange_rate');
                })
                ->count(),
            'reconciled_ledger_total_amount' => (int) (clone $postedBookingLedgers)->sum('amount_idr'),
        ];
    }

    /**
     * @return array<string, array{count: int, amount: int}>
     */
    public function confirmedByCurrency(): array
    {
        $currencyExpression = "COALESCE(NULLIF(UPPER(booking_payments.currency), ''), NULLIF(UPPER(bookings.agreed_currency), ''), NULLIF(UPPER(bookings.custom_currency), ''), 'UNCLASSIFIED')";
        $confirmedPayments = DB::table((new BookingPayment)->getTable().' as booking_payments')
            ->join('bookings', 'bookings.id', '=', 'booking_payments.booking_id')
            ->whereNull('booking_payments.deleted_at')
            ->where('booking_payments.status', 'confirmed')
            ->selectRaw($currencyExpression.' as currency')
            ->addSelect('booking_payments.amount');

        return DB::query()
            ->fromSub($confirmedPayments, 'confirmed_payments')
            ->select('currency')
            ->selectRaw('COUNT(*) as payment_count')
            ->selectRaw('SUM(amount) as total_amount')
            ->groupBy('currency')
            ->orderBy('currency')
            ->get()
            ->mapWithKeys(fn (object $row): array => [
                (string) $row->currency => [
                    'count' => (int) $row->payment_count,
                    'amount' => (int) $row->total_amount,
                ],
            ])
            ->all();
    }

    /**
     * @param  array<string, int>  $summary
     */
    public function hasInconsistencies(array $summary): bool
    {
        return collect([
            'confirmed_without_cashflow',
            'duplicate_cashflow_links',
            'linked_missing_cashflow',
            'confirmed_cashflow_deleted',
            'non_confirmed_cashflow_active',
            'linked_value_mismatches',
            'orphan_booking_cashflows',
            'confirmed_without_financial_account',
            'confirmed_without_financial_snapshot',
            'confirmed_without_posted_ledger',
            'non_confirmed_with_posted_ledger',
            'multiple_posted_booking_ledgers',
            'ledger_value_mismatches',
        ])->contains(fn (string $key): bool => ($summary[$key] ?? 0) > 0)
            || ($summary['confirmed_total_amount_idr'] ?? 0) !== ($summary['reconciled_cashflow_total_amount'] ?? 0)
            || ($summary['confirmed_total_amount_idr'] ?? 0) !== ($summary['reconciled_ledger_total_amount'] ?? 0);
    }
}
