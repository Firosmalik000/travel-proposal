<?php

namespace App\Services;

use App\Models\BankReconciliation;
use App\Models\FinancialAccount;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use Illuminate\Database\Eloquent\Builder;

class FinancialExportService
{
    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<FinancialTransaction>
     */
    public function transactionQuery(array $filters): Builder
    {
        return FinancialTransaction::query()
            ->with([
                'lines.account:id,code,name,type',
                'postedBy:id,name',
                'reversal:id,transaction_number,reversal_of_id',
                'typeDefinition:id,code,name',
                'package:id,code,name',
            ])
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('transaction_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('transaction_date', '<=', $date))
            ->when($filters['account_id'] ?? null, fn (Builder $query, int|string $accountId): Builder => $query->whereHas('lines', fn (Builder $lineQuery): Builder => $lineQuery->where('financial_account_id', $accountId)))
            ->when($filters['transaction_type'] ?? null, fn (Builder $query, string $type): Builder => $query->where('transaction_type', $type))
            ->when($filters['category_code'] ?? null, fn (Builder $query, string $categoryCode): Builder => $query->where('category_code', $categoryCode))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status): Builder => $query->where('status', $status))
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery->where('transaction_number', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{title:string,subtitle:string,headers:array<string,string>,rows:array<int,array<string,mixed>>,totals:array<string,int>}
     */
    public function ledgerDataset(array $filters): array
    {
        return ($filters['report'] ?? 'journal') === 'general-ledger'
            ? $this->generalLedgerDataset($filters)
            : $this->journalDataset($filters);
    }

    /**
     * @param  array<string, mixed>  $report
     * @return array{title:string,subtitle:string,headers:array<string,string>,rows:array<int,array<string,mixed>>}
     */
    public function reportDataset(string $type, array $report, array $filters = []): array
    {
        return match ($type) {
            'profit-loss' => $this->dataset('Laporan Laba Rugi', 'Pendapatan, beban, dan laba bersih periode', [
                'code' => 'Kode akun', 'name' => 'Nama akun', 'type' => 'Kelompok', 'amount_idr' => 'Nilai (IDR)',
            ], $report['profit_loss']['accounts'] ?? []),
            'balance-sheet' => $this->dataset('Neraca', 'Posisi keuangan pada akhir periode', [
                'component' => 'Komponen', 'amount_idr' => 'Nilai (IDR)',
            ], [
                ['component' => 'Aset', 'amount_idr' => $report['balance_sheet']['assets_idr'] ?? 0],
                ['component' => 'Liabilitas', 'amount_idr' => $report['balance_sheet']['liabilities_idr'] ?? 0],
                ['component' => 'Ekuitas', 'amount_idr' => $report['balance_sheet']['equity_idr'] ?? 0],
                ['component' => 'Laba ditahan', 'amount_idr' => $report['balance_sheet']['retained_earnings_idr'] ?? 0],
                ['component' => 'Liabilitas dan ekuitas', 'amount_idr' => $report['balance_sheet']['liabilities_and_equity_idr'] ?? 0],
                ['component' => 'Selisih keseimbangan', 'amount_idr' => $report['balance_sheet']['difference_idr'] ?? 0],
            ]),
            'cash-flow' => $this->dataset('Laporan Arus Kas', 'Arus kas masuk dan keluar berdasarkan aktivitas', [
                'activity_category' => 'Aktivitas', 'transaction_type' => 'Jenis transaksi', 'cash_in_idr' => 'Kas masuk (IDR)', 'cash_out_idr' => 'Kas keluar (IDR)', 'net_idr' => 'Arus bersih (IDR)',
            ], $report['cashflow']['rows'] ?? []),
            'capital-movements' => $this->dataset('Perubahan Modal', 'Setoran modal dan penarikan pemilik', [
                'transaction_date' => 'Tanggal', 'transaction_number' => 'Nomor transaksi', 'transaction_type' => 'Jenis', 'description' => 'Keterangan', 'amount_idr' => 'Nilai (IDR)',
            ], $report['capital_movements']['rows'] ?? []),
            'trip-profitability' => $this->dataset('Profitabilitas Trip dan HPP', 'Perbandingan budget, aktual, pendapatan, dan laba kotor', [
                'code' => 'Kode trip', 'name' => 'Nama trip', 'start_date' => 'Tanggal berangkat', 'operational_status' => 'Status', 'budget_cost_idr' => 'Budget HPP (IDR)', 'actual_cost_idr' => 'Aktual HPP (IDR)', 'variance_idr' => 'Selisih (IDR)', 'revenue_idr' => 'Pendapatan (IDR)', 'gross_profit_idr' => 'Laba kotor (IDR)',
            ], $report['trip_profitability'] ?? []),
            'budget-actual' => $this->budgetDataset($report['budgets']['rows'] ?? []),
            'receivables' => $this->dataset('Aging Piutang Jemaah', 'Saldo piutang per tanggal akhir periode', [
                'booking_code' => 'Kode booking', 'customer_name' => 'Nama jemaah', 'due_date' => 'Jatuh tempo', 'aging_bucket' => 'Umur piutang', 'agreed_amount_idr' => 'Nilai booking (IDR)', 'paid_amount_idr' => 'Terbayar (IDR)', 'remaining_amount_idr' => 'Sisa piutang (IDR)',
            ], $report['customer_receivables']['rows'] ?? []),
            'payables' => $this->dataset('Aging Hutang Vendor', 'Saldo hutang vendor per tanggal akhir periode', [
                'invoice_number' => 'Nomor invoice', 'vendor_name' => 'Vendor', 'package_code' => 'Kode trip', 'due_date' => 'Jatuh tempo', 'aging_bucket' => 'Umur hutang', 'amount_idr' => 'Nilai tagihan (IDR)', 'paid_amount_idr' => 'Terbayar (IDR)', 'remaining_amount_idr' => 'Sisa hutang (IDR)',
            ], $report['vendor_payables']['rows'] ?? []),
            'inventory' => $this->dataset('Nilai Persediaan', 'Kuantitas dan nilai persediaan saat laporan dibuat', [
                'item_code' => 'Kode', 'item_name' => 'Nama barang', 'quantity' => 'Stok', 'reserved_quantity' => 'Dipesan', 'available_quantity' => 'Tersedia', 'average_unit_cost_idr' => 'Biaya rata-rata (IDR)', 'value_idr' => 'Nilai persediaan (IDR)',
            ], $report['inventory']['rows'] ?? []),
            'reconciliations' => $this->dataset('Rekonsiliasi Bank', 'Perbandingan saldo rekening koran dan ledger', [
                'statement_date' => 'Tanggal', 'account_name' => 'Akun', 'statement_balance_idr' => 'Saldo rekening koran (IDR)', 'ledger_balance_idr' => 'Saldo ledger (IDR)', 'difference_idr' => 'Selisih (IDR)', 'status' => 'Status', 'reconciled_by_name' => 'Direkonsiliasi oleh', 'notes' => 'Catatan',
            ], $this->reconciliations($filters)),
            'periods' => $this->dataset('Status Periode Pembukuan', 'Daftar periode terbuka dan tertutup', [
                'period_code' => 'Periode', 'start_date' => 'Tanggal awal', 'end_date' => 'Tanggal akhir', 'status' => 'Status',
            ], $this->periods($filters)),
            'audit-trail' => $this->dataset('Audit Trail Keuangan', 'Riwayat transaksi, reversal, dan adjustment', [
                'transaction_date' => 'Tanggal', 'transaction_number' => 'Nomor transaksi', 'transaction_type' => 'Jenis', 'status' => 'Status', 'description' => 'Keterangan', 'amount_idr' => 'Nilai (IDR)', 'posted_by_name' => 'Diposting oleh', 'adjustment_of_number' => 'Adjustment atas',
            ], $this->auditTrail($filters)),
            default => $this->dataset('Neraca Saldo', 'Saldo debit, kredit, dan saldo akhir setiap akun', [
                'code' => 'Kode akun', 'name' => 'Nama akun', 'type' => 'Jenis akun', 'currency' => 'Mata uang', 'debit_total' => 'Debit (IDR)', 'credit_total' => 'Kredit (IDR)', 'balance_idr' => 'Saldo (IDR)',
            ], $report['account_balances'] ?? []),
        };
    }

    /** @param array<string, mixed> $filters */
    private function journalDataset(array $filters): array
    {
        $transactions = $this->transactionQuery($filters)
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        $rows = $transactions->flatMap(function (FinancialTransaction $transaction): array {
            return $transaction->lines->map(fn (FinancialTransactionLine $line): array => [
                'transaction_date' => $transaction->transaction_date?->toDateString(),
                'transaction_number' => $transaction->transaction_number,
                'status' => $transaction->status,
                'transaction_type' => $transaction->typeDefinition?->name ?? $transaction->transaction_type,
                'category' => $transaction->category_code,
                'account_code' => $line->account->code,
                'account_name' => $line->account->name,
                'description' => $line->description ?: $transaction->description,
                'debit_idr' => $line->entry_type === 'debit' ? $line->amount_idr : 0,
                'credit_idr' => $line->entry_type === 'credit' ? $line->amount_idr : 0,
                'package_code' => $transaction->package?->code,
                'posted_by' => $transaction->postedBy?->name,
                'posted_at' => $transaction->posted_at?->timezone('Asia/Jakarta')->toDateTimeString(),
            ])->all();
        })->values();

        return [
            'title' => 'Jurnal Umum',
            'subtitle' => 'Rincian debit dan kredit seluruh transaksi sesuai filter',
            'headers' => [
                'transaction_date' => 'Tanggal', 'transaction_number' => 'Nomor transaksi', 'status' => 'Status', 'transaction_type' => 'Jenis transaksi', 'category' => 'Kategori', 'account_code' => 'Kode akun', 'account_name' => 'Nama akun', 'description' => 'Keterangan', 'debit_idr' => 'Debit (IDR)', 'credit_idr' => 'Kredit (IDR)', 'package_code' => 'Trip', 'posted_by' => 'Diposting oleh', 'posted_at' => 'Waktu posting',
            ],
            'rows' => $rows->all(),
            'totals' => ['debit_idr' => (int) $rows->sum('debit_idr'), 'credit_idr' => (int) $rows->sum('credit_idr')],
        ];
    }

    /** @param array<string, mixed> $filters */
    private function generalLedgerDataset(array $filters): array
    {
        $transactions = $this->transactionQuery($filters)
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();
        $accountIds = $transactions->flatMap(fn (FinancialTransaction $transaction) => $transaction->lines->pluck('financial_account_id'))->unique();
        if ($filters['account_id'] ?? null) {
            $accountIds = collect([(int) $filters['account_id']]);
        }

        $accounts = FinancialAccount::query()->whereIn('id', $accountIds)->orderBy('code')->get();
        $openingTotals = collect();
        if ($filters['date_from'] ?? null) {
            $openingTotals = FinancialTransactionLine::query()
                ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
                ->whereIn('financial_transactions.status', ['posted', 'reversed'])
                ->whereDate('financial_transactions.transaction_date', '<', $filters['date_from'])
                ->whereIn('financial_transaction_lines.financial_account_id', $accountIds)
                ->groupBy('financial_transaction_lines.financial_account_id')
                ->select('financial_transaction_lines.financial_account_id')
                ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as debit_total")
                ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as credit_total")
                ->get()->keyBy('financial_account_id');
        }

        $rows = collect();
        foreach ($accounts as $account) {
            $opening = $openingTotals->get($account->id);
            $debit = (int) ($opening?->debit_total ?? 0);
            $credit = (int) ($opening?->credit_total ?? 0);
            $runningBalance = $account->usesDebitNormalBalance() ? $debit - $credit : $credit - $debit;

            if ($filters['date_from'] ?? null) {
                $rows->push([
                    'account_code' => $account->code, 'account_name' => $account->name, 'transaction_date' => $filters['date_from'], 'transaction_number' => 'SALDO-AWAL', 'description' => 'Saldo sebelum periode', 'debit_idr' => 0, 'credit_idr' => 0, 'balance_idr' => $runningBalance,
                ]);
            }

            foreach ($transactions as $transaction) {
                foreach ($transaction->lines->where('financial_account_id', $account->id) as $line) {
                    $lineDebit = $line->entry_type === 'debit' ? (int) $line->amount_idr : 0;
                    $lineCredit = $line->entry_type === 'credit' ? (int) $line->amount_idr : 0;
                    $runningBalance += $account->usesDebitNormalBalance() ? $lineDebit - $lineCredit : $lineCredit - $lineDebit;
                    $rows->push([
                        'account_code' => $account->code,
                        'account_name' => $account->name,
                        'transaction_date' => $transaction->transaction_date?->toDateString(),
                        'transaction_number' => $transaction->transaction_number,
                        'description' => $line->description ?: $transaction->description,
                        'debit_idr' => $lineDebit,
                        'credit_idr' => $lineCredit,
                        'balance_idr' => $runningBalance,
                    ]);
                }
            }
        }

        return [
            'title' => 'Buku Besar',
            'subtitle' => 'Mutasi dan saldo berjalan per akun sesuai filter',
            'headers' => [
                'account_code' => 'Kode akun', 'account_name' => 'Nama akun', 'transaction_date' => 'Tanggal', 'transaction_number' => 'Nomor transaksi', 'description' => 'Keterangan', 'debit_idr' => 'Debit (IDR)', 'credit_idr' => 'Kredit (IDR)', 'balance_idr' => 'Saldo (IDR)',
            ],
            'rows' => $rows->all(),
            'totals' => ['debit_idr' => (int) $rows->sum('debit_idr'), 'credit_idr' => (int) $rows->sum('credit_idr')],
        ];
    }

    /** @param array<int, array<string, mixed>> $rows */
    private function budgetDataset(array $rows): array
    {
        $lines = collect($rows)->flatMap(function (array $budget): array {
            return collect($budget['lines'] ?? [])->map(fn (array $line): array => [
                'budget_number' => $budget['budget_number'],
                'budget_name' => $budget['name'],
                'package_label' => $budget['package_label'],
                'period_start' => $budget['period_start'],
                'period_end' => $budget['period_end'],
                'status' => $budget['status'],
                'account_label' => $line['account_label'],
                'planned_amount_idr' => $line['planned_amount_idr'],
                'actual_amount_idr' => $line['actual_amount_idr'],
                'remaining_amount_idr' => $line['remaining_amount_idr'],
                'utilization_percent' => $line['utilization_percent'],
            ])->all();
        })->values()->all();

        return $this->dataset('Anggaran dan Realisasi', 'Perbandingan anggaran dengan realisasi ledger', [
            'budget_number' => 'Nomor anggaran', 'budget_name' => 'Nama anggaran', 'package_label' => 'Trip', 'period_start' => 'Tanggal awal', 'period_end' => 'Tanggal akhir', 'status' => 'Status', 'account_label' => 'Akun', 'planned_amount_idr' => 'Anggaran (IDR)', 'actual_amount_idr' => 'Realisasi (IDR)', 'remaining_amount_idr' => 'Sisa (IDR)', 'utilization_percent' => 'Realisasi (%)',
        ], $lines);
    }

    /** @param array<string, mixed> $filters */
    private function reconciliations(array $filters): array
    {
        return BankReconciliation::query()
            ->with(['account:id,code,name', 'reconciledBy:id,name'])
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('statement_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('statement_date', '<=', $date))
            ->orderBy('statement_date')->orderBy('id')->get()
            ->map(fn (BankReconciliation $item): array => [
                'statement_date' => $item->statement_date?->toDateString(),
                'account_name' => $item->account?->code.' · '.$item->account?->name,
                'statement_balance_idr' => $item->statement_balance_idr,
                'ledger_balance_idr' => $item->ledger_balance_idr,
                'difference_idr' => $item->difference_idr,
                'status' => $item->status,
                'reconciled_by_name' => $item->reconciledBy?->name,
                'notes' => $item->notes,
            ])->all();
    }

    /** @param array<string, mixed> $filters */
    private function periods(array $filters): array
    {
        return FinancialPeriod::query()
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('end_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('start_date', '<=', $date))
            ->orderBy('period_code')->get()
            ->map(fn (FinancialPeriod $period): array => [
                'period_code' => $period->period_code,
                'start_date' => $period->start_date?->toDateString(),
                'end_date' => $period->end_date?->toDateString(),
                'status' => $period->status,
            ])->all();
    }

    /** @param array<string, mixed> $filters */
    private function auditTrail(array $filters): array
    {
        return FinancialTransaction::query()
            ->with(['postedBy:id,name', 'adjustmentOf:id,transaction_number'])
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('transaction_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date): Builder => $query->whereDate('transaction_date', '<=', $date))
            ->orderBy('transaction_date')->orderBy('id')->get()
            ->map(fn (FinancialTransaction $transaction): array => [
                'transaction_date' => $transaction->transaction_date?->toDateString(),
                'transaction_number' => $transaction->transaction_number,
                'transaction_type' => $transaction->transaction_type,
                'status' => $transaction->status,
                'description' => $transaction->description,
                'amount_idr' => $transaction->amount_idr,
                'posted_by_name' => $transaction->postedBy?->name,
                'adjustment_of_number' => $transaction->adjustmentOf?->transaction_number,
            ])->all();
    }

    /**
     * @param  array<string, string>  $headers
     * @param  array<int, array<string, mixed>>  $rows
     * @return array{title:string,subtitle:string,headers:array<string,string>,rows:array<int,array<string,mixed>>}
     */
    private function dataset(string $title, string $subtitle, array $headers, array $rows): array
    {
        return compact('title', 'subtitle', 'headers', 'rows');
    }
}
