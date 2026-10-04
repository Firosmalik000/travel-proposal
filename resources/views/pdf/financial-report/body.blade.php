@php
    $summary = $report['summary'] ?? [];
    $rupiah = fn ($value) => 'Rp '.number_format((int) $value, 0, ',', '.');
    $number = fn ($value) => number_format((float) $value, 0, ',', '.');
    $accountTypes = ['asset' => 'Aset', 'liability' => 'Liabilitas', 'equity' => 'Ekuitas', 'revenue' => 'Pendapatan', 'expense' => 'Beban'];
    $transactionTypes = [
        'opening_balance' => 'Saldo awal', 'manual_journal' => 'Jurnal manual', 'transfer' => 'Transfer',
        'booking_payment' => 'Pembayaran jemaah', 'capital_contribution' => 'Setoran modal',
        'owner_withdrawal' => 'Prive pemilik', 'operating_expense' => 'Biaya operasional',
        'other_income' => 'Pendapatan lain-lain', 'customer_refund' => 'Refund jemaah',
        'agent_commission' => 'Komisi agen', 'inventory_purchase' => 'Pembelian persediaan',
        'inventory_issue' => 'Pemakaian persediaan', 'vendor_bill' => 'Tagihan vendor',
        'vendor_payment' => 'Pembayaran vendor', 'vendor_advance_payment' => 'Uang muka vendor',
        'vendor_advance_application' => 'Alokasi uang muka vendor', 'vendor_service_use' => 'Penggunaan layanan vendor',
        'trip_revenue_recognition' => 'Pengakuan pendapatan trip', 'period_adjustment' => 'Adjustment periode',
        'reversal' => 'Reversal', 'legacy_unclassified' => 'Legacy belum terklasifikasi',
    ];
    $agingLabels = ['belum_jatuh_tempo' => 'Belum jatuh tempo', '1_30' => '1-30 hari', '31_60' => '31-60 hari', '61_90' => '61-90 hari', 'lebih_90' => '> 90 hari'];
@endphp

<div class="box avoid-break">
    <table class="summary-grid">
        <tr>
            <td><div class="summary-label">Saldo kas dan bank</div><div class="summary-value">{{ $rupiah($summary['cash_balance_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Dana rekening jemaah</div><div class="summary-value">{{ $rupiah($summary['customer_funds_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Pendapatan diakui</div><div class="summary-value">{{ $rupiah($summary['revenue_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Laba bersih</div><div class="summary-value">{{ $rupiah($summary['net_profit_idr'] ?? 0) }}</div></td>
        </tr>
        <tr>
            <td><div class="summary-label">Uang muka jemaah</div><div class="summary-value">{{ $rupiah($summary['customer_advance_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Beban periode</div><div class="summary-value">{{ $rupiah($summary['expenses_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Kas masuk</div><div class="summary-value">{{ $rupiah($summary['cash_in_idr'] ?? 0) }}</div></td>
            <td><div class="summary-label">Kas keluar</div><div class="summary-value">{{ $rupiah($summary['cash_out_idr'] ?? 0) }}</div></td>
        </tr>
    </table>
    <div class="status-note">Laporan ini dihasilkan langsung dari ledger aplikasi untuk kebutuhan manajemen internal dan belum merupakan laporan audit independen.</div>
</div>

<div class="box avoid-break">
    <h2 class="section-title">Neraca</h2>
    <table class="report-table">
        <thead><tr><th>Komponen</th><th class="numeric">Nilai</th></tr></thead>
        <tbody>
            <tr><td>Aset</td><td class="numeric">{{ $rupiah(data_get($report, 'balance_sheet.assets_idr', 0)) }}</td></tr>
            <tr><td>Liabilitas</td><td class="numeric">{{ $rupiah(data_get($report, 'balance_sheet.liabilities_idr', 0)) }}</td></tr>
            <tr><td>Ekuitas</td><td class="numeric">{{ $rupiah(data_get($report, 'balance_sheet.equity_idr', 0)) }}</td></tr>
            <tr><td>Laba ditahan</td><td class="numeric">{{ $rupiah(data_get($report, 'balance_sheet.retained_earnings_idr', 0)) }}</td></tr>
            <tr><td><strong>Liabilitas dan ekuitas</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'balance_sheet.liabilities_and_equity_idr', 0)) }}</strong></td></tr>
            <tr><td>Selisih keseimbangan</td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'balance_sheet.difference_idr', 0)) }}</strong></td></tr>
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Laporan Laba Rugi</h2>
    <p class="section-subtitle">Pendapatan dan beban yang diakui dalam periode laporan.</p>
    <table class="report-table">
        <thead><tr><th>Kode</th><th>Akun</th><th>Kelompok</th><th class="numeric">Nilai</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'profit_loss.accounts', []) as $row)
                <tr><td>{{ $row['code'] }}</td><td>{{ $row['name'] }}</td><td>{{ $accountTypes[$row['type']] ?? $row['type'] }}</td><td class="numeric">{{ $rupiah($row['amount_idr']) }}</td></tr>
            @empty
                <tr><td colspan="4" class="muted" style="text-align:center;">Belum ada pendapatan atau beban pada periode ini.</td></tr>
            @endforelse
            <tr><td colspan="3"><strong>Total pendapatan</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'profit_loss.revenue_idr', 0)) }}</strong></td></tr>
            <tr><td colspan="3"><strong>Total beban</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'profit_loss.expenses_idr', 0)) }}</strong></td></tr>
            <tr><td colspan="3"><strong>Laba bersih</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'profit_loss.net_profit_idr', 0)) }}</strong></td></tr>
        </tbody>
    </table>
</div>

<div class="box">
    <h2 class="section-title">Arus Kas</h2>
    <table class="report-table">
        <thead><tr><th>Aktivitas</th><th>Jenis transaksi</th><th class="numeric">Kas masuk</th><th class="numeric">Kas keluar</th><th class="numeric">Bersih</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'cashflow.rows', []) as $row)
                <tr><td>{{ ['operating' => 'Operasi', 'financing' => 'Pendanaan', 'unclassified' => 'Belum terklasifikasi'][$row['activity_category']] ?? $row['activity_category'] }}</td><td>{{ $transactionTypes[$row['transaction_type']] ?? $row['transaction_type'] }}</td><td class="numeric">{{ $rupiah($row['cash_in_idr']) }}</td><td class="numeric">{{ $rupiah($row['cash_out_idr']) }}</td><td class="numeric">{{ $rupiah($row['net_idr']) }}</td></tr>
            @empty
                <tr><td colspan="5" class="muted" style="text-align:center;">Belum ada arus kas pada periode ini.</td></tr>
            @endforelse
            <tr><td colspan="2"><strong>Total</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'cashflow.total_in_idr', 0)) }}</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'cashflow.total_out_idr', 0)) }}</strong></td><td class="numeric"><strong>{{ $rupiah(data_get($report, 'cashflow.net_idr', 0)) }}</strong></td></tr>
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Neraca Saldo</h2>
    <p class="section-subtitle">Saldo seluruh akun sampai tanggal akhir laporan.</p>
    <table class="report-table">
        <thead><tr><th>Kode</th><th>Akun</th><th>Jenis</th><th class="numeric">Debit</th><th class="numeric">Kredit</th><th class="numeric">Saldo</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'account_balances', []) as $row)
                <tr><td>{{ $row['code'] }}</td><td>{{ $row['name'] }}</td><td>{{ $accountTypes[$row['type']] ?? $row['type'] }}</td><td class="numeric">{{ $rupiah($row['debit_total']) }}</td><td class="numeric">{{ $rupiah($row['credit_total']) }}</td><td class="numeric"><strong>{{ $rupiah($row['balance_idr']) }}</strong></td></tr>
            @empty
                <tr><td colspan="6" class="muted" style="text-align:center;">Belum ada akun.</td></tr>
            @endforelse
            <tr><td colspan="3"><strong>Total</strong></td><td class="numeric"><strong>{{ $rupiah(collect(data_get($report, 'account_balances', []))->sum('debit_total')) }}</strong></td><td class="numeric"><strong>{{ $rupiah(collect(data_get($report, 'account_balances', []))->sum('credit_total')) }}</strong></td><td></td></tr>
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Profitabilitas Trip dan HPP</h2>
    <table class="report-table">
        <thead><tr><th>Trip</th><th>Tanggal</th><th class="numeric">Budget HPP</th><th class="numeric">Aktual</th><th class="numeric">Selisih</th><th class="numeric">Pendapatan</th><th class="numeric">Laba kotor</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'trip_profitability', []) as $row)
                <tr><td><strong>{{ $row['code'] }}</strong><br>{{ $row['name'] }}</td><td>{{ $row['start_date'] ?: '-' }}</td><td class="numeric">{{ $rupiah($row['budget_cost_idr']) }}</td><td class="numeric">{{ $rupiah($row['actual_cost_idr']) }}</td><td class="numeric">{{ $rupiah($row['variance_idr']) }}</td><td class="numeric">{{ $rupiah($row['revenue_idr']) }}</td><td class="numeric"><strong>{{ $rupiah($row['gross_profit_idr']) }}</strong></td></tr>
            @empty
                <tr><td colspan="7" class="muted" style="text-align:center;">Belum ada transaksi trip pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box">
    <h2 class="section-title">Anggaran dan Realisasi</h2>
    <table class="report-table">
        <thead><tr><th>Nomor</th><th>Anggaran</th><th>Trip</th><th>Periode</th><th>Status</th><th class="numeric">Rencana</th><th class="numeric">Aktual</th><th class="numeric">Sisa</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'budgets.rows', []) as $row)
                <tr><td>{{ $row['budget_number'] }}</td><td>{{ $row['name'] }}</td><td>{{ $row['package_label'] ?: 'Umum' }}</td><td>{{ $row['period_start'] }} s.d. {{ $row['period_end'] }}</td><td>{{ ucfirst($row['status']) }}</td><td class="numeric">{{ $rupiah($row['planned_amount_idr']) }}</td><td class="numeric">{{ $rupiah($row['actual_amount_idr']) }}</td><td class="numeric">{{ $rupiah($row['remaining_amount_idr']) }}</td></tr>
            @empty
                <tr><td colspan="8" class="muted" style="text-align:center;">Belum ada anggaran pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Aging Piutang Jemaah</h2>
    <table class="report-table">
        <thead><tr><th>Booking</th><th>Jemaah</th><th>Jatuh tempo</th><th>Umur</th><th class="numeric">Nilai</th><th class="numeric">Terbayar</th><th class="numeric">Sisa</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'customer_receivables.rows', []) as $row)
                <tr><td>{{ $row['booking_code'] }}</td><td>{{ $row['customer_name'] }}</td><td>{{ $row['due_date'] ?: '-' }}</td><td>{{ $agingLabels[$row['aging_bucket']] ?? $row['aging_bucket'] }}</td><td class="numeric">{{ $rupiah($row['agreed_amount_idr']) }}</td><td class="numeric">{{ $rupiah($row['paid_amount_idr']) }}</td><td class="numeric"><strong>{{ $rupiah($row['remaining_amount_idr']) }}</strong></td></tr>
            @empty
                <tr><td colspan="7" class="muted" style="text-align:center;">Tidak ada piutang jemaah.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box">
    <h2 class="section-title">Aging Hutang Vendor</h2>
    <table class="report-table">
        <thead><tr><th>Invoice</th><th>Vendor</th><th>Trip</th><th>Jatuh tempo</th><th>Umur</th><th class="numeric">Tagihan</th><th class="numeric">Terbayar</th><th class="numeric">Sisa</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'vendor_payables.rows', []) as $row)
                <tr><td>{{ $row['invoice_number'] ?: '-' }}</td><td>{{ $row['vendor_name'] ?: '-' }}</td><td>{{ $row['package_code'] ?: '-' }}</td><td>{{ $row['due_date'] ?: '-' }}</td><td>{{ $agingLabels[$row['aging_bucket']] ?? $row['aging_bucket'] }}</td><td class="numeric">{{ $rupiah($row['amount_idr']) }}</td><td class="numeric">{{ $rupiah($row['paid_amount_idr']) }}</td><td class="numeric"><strong>{{ $rupiah($row['remaining_amount_idr']) }}</strong></td></tr>
            @empty
                <tr><td colspan="8" class="muted" style="text-align:center;">Tidak ada hutang vendor.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Persediaan</h2>
    <table class="report-table">
        <thead><tr><th>Kode</th><th>Barang</th><th class="numeric">Stok</th><th class="numeric">Dipesan</th><th class="numeric">Tersedia</th><th class="numeric">Biaya rata-rata</th><th class="numeric">Nilai</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'inventory.rows', []) as $row)
                <tr><td>{{ $row['item_code'] }}</td><td>{{ $row['item_name'] }}</td><td class="numeric">{{ $number($row['quantity']) }}</td><td class="numeric">{{ $number($row['reserved_quantity']) }}</td><td class="numeric">{{ $number($row['available_quantity']) }}</td><td class="numeric">{{ $rupiah($row['average_unit_cost_idr']) }}</td><td class="numeric"><strong>{{ $rupiah($row['value_idr']) }}</strong></td></tr>
            @empty
                <tr><td colspan="7" class="muted" style="text-align:center;">Belum ada persediaan.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box">
    <h2 class="section-title">Perubahan Modal</h2>
    <table class="report-table">
        <thead><tr><th>Tanggal</th><th>Nomor transaksi</th><th>Jenis</th><th>Keterangan</th><th class="numeric">Nilai</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'capital_movements.rows', []) as $row)
                <tr><td>{{ $row['transaction_date'] }}</td><td>{{ $row['transaction_number'] }}</td><td>{{ $transactionTypes[$row['transaction_type']] ?? $row['transaction_type'] }}</td><td>{{ $row['description'] ?: '-' }}</td><td class="numeric">{{ $rupiah($row['amount_idr']) }}</td></tr>
            @empty
                <tr><td colspan="5" class="muted" style="text-align:center;">Belum ada perubahan modal pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Rekonsiliasi Bank</h2>
    <table class="report-table">
        <thead><tr><th>Tanggal</th><th>Akun</th><th class="numeric">Rekening koran</th><th class="numeric">Ledger</th><th class="numeric">Selisih</th><th>Status</th><th>Petugas</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'reconciliations', []) as $row)
                <tr><td>{{ $row['statement_date'] }}</td><td>{{ $row['account_name'] }}</td><td class="numeric">{{ $rupiah($row['statement_balance_idr']) }}</td><td class="numeric">{{ $rupiah($row['ledger_balance_idr']) }}</td><td class="numeric">{{ $rupiah($row['difference_idr']) }}</td><td>{{ $row['status'] === 'matched' ? 'Cocok' : 'Selisih' }}</td><td>{{ $row['reconciled_by_name'] ?: '-' }}</td></tr>
            @empty
                <tr><td colspan="7" class="muted" style="text-align:center;">Belum ada rekonsiliasi bank.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box">
    <h2 class="section-title">Status Periode Pembukuan</h2>
    <table class="report-table">
        <thead><tr><th>Periode</th><th>Tanggal awal</th><th>Tanggal akhir</th><th>Status</th><th>Aktivitas terakhir</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'periods', []) as $row)
                @php($lastEvent = collect($row['events'] ?? [])->first())
                <tr><td>{{ $row['period_code'] }}</td><td>{{ $row['start_date'] }}</td><td>{{ $row['end_date'] }}</td><td>{{ $row['status'] === 'closed' ? 'Ditutup' : 'Terbuka' }}</td><td>{{ $lastEvent ? (($lastEvent['actor_name'] ?: 'Sistem').' · '.$lastEvent['reason']) : '-' }}</td></tr>
            @empty
                <tr><td colspan="5" class="muted" style="text-align:center;">Belum ada periode pembukuan.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box page-break-before">
    <h2 class="section-title">Audit Trail Keuangan</h2>
    <p class="section-subtitle">Maksimal 50 aktivitas transaksi terbaru pada periode laporan.</p>
    <table class="report-table">
        <thead><tr><th>Tanggal</th><th>Nomor</th><th>Jenis</th><th>Status</th><th>Keterangan</th><th class="numeric">Nilai</th><th>Diposting oleh</th></tr></thead>
        <tbody>
            @forelse (data_get($report, 'audit_trail', []) as $row)
                <tr><td>{{ $row['transaction_date'] }}</td><td>{{ $row['transaction_number'] }}</td><td>{{ $transactionTypes[$row['transaction_type']] ?? $row['transaction_type'] }}</td><td>{{ ucfirst($row['status']) }}</td><td>{{ $row['description'] ?: '-' }}</td><td class="numeric">{{ $rupiah($row['amount_idr']) }}</td><td>{{ $row['posted_by_name'] ?: '-' }}</td></tr>
            @empty
                <tr><td colspan="7" class="muted" style="text-align:center;">Belum ada transaksi pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
