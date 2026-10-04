import { formatDateTime } from '@/lib/date-format';

type ExportMeta = {
    company_name: string;
    company_subtitle: string;
    generated_by: string | null;
};

type WorkbookOptions = {
    report: unknown;
    filters: { date_from: string; date_to: string };
    meta: ExportMeta;
};

type CellValue = string | number | null | undefined;
type SheetDefinition = {
    name: string;
    title: string;
    subtitle: string;
    headers: string[];
    rows: CellValue[][];
    numericColumns?: number[];
};

function safeText(value: unknown): string {
    const text = value == null ? '' : String(value);

    return /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
}

function asNumber(value: unknown): number {
    return typeof value === 'number' ? value : Number(value ?? 0);
}

function asRows(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (row): row is Record<string, unknown> =>
                  typeof row === 'object' && row !== null,
          )
        : [];
}

export async function exportFinancialReportWorkbook({
    report,
    filters,
    meta,
}: WorkbookOptions): Promise<void> {
    const XLSX = await import('xlsx');
    const data = report as Record<string, unknown>;
    const summary = (data.summary ?? {}) as Record<string, unknown>;
    const profitLoss = (data.profit_loss ?? {}) as Record<string, unknown>;
    const balanceSheet = (data.balance_sheet ?? {}) as Record<string, unknown>;
    const cashflow = (data.cashflow ?? {}) as Record<string, unknown>;
    const budgets = (data.budgets ?? {}) as Record<string, unknown>;
    const receivables = (data.customer_receivables ?? {}) as Record<
        string,
        unknown
    >;
    const payables = (data.vendor_payables ?? {}) as Record<string, unknown>;
    const inventory = (data.inventory ?? {}) as Record<string, unknown>;

    const sheets: SheetDefinition[] = [
        {
            name: 'Ringkasan',
            title: 'Ringkasan Keuangan',
            subtitle: 'Indikator keuangan utama dari ledger',
            headers: ['Indikator', 'Nilai (IDR)'],
            rows: [
                ['Saldo kas dan bank', asNumber(summary.cash_balance_idr)],
                ['Dana rekening jemaah', asNumber(summary.customer_funds_idr)],
                ['Uang muka jemaah', asNumber(summary.customer_advance_idr)],
                ['Pendapatan diakui', asNumber(summary.revenue_idr)],
                ['Beban periode', asNumber(summary.expenses_idr)],
                ['Laba bersih', asNumber(summary.net_profit_idr)],
                ['Kas masuk', asNumber(summary.cash_in_idr)],
                ['Kas keluar', asNumber(summary.cash_out_idr)],
                ['Aset', asNumber(balanceSheet.assets_idr)],
                ['Liabilitas', asNumber(balanceSheet.liabilities_idr)],
                ['Ekuitas', asNumber(balanceSheet.equity_idr)],
                ['Laba ditahan', asNumber(balanceSheet.retained_earnings_idr)],
                [
                    'Selisih keseimbangan neraca',
                    asNumber(balanceSheet.difference_idr),
                ],
            ],
            numericColumns: [1],
        },
        {
            name: 'Laba Rugi',
            title: 'Laporan Laba Rugi',
            subtitle: 'Pendapatan dan beban dalam periode laporan',
            headers: ['Kode akun', 'Nama akun', 'Kelompok', 'Nilai (IDR)'],
            rows: asRows(profitLoss.accounts).map((row) => [
                safeText(row.code),
                safeText(row.name),
                safeText(row.type),
                asNumber(row.amount_idr),
            ]),
            numericColumns: [3],
        },
        {
            name: 'Neraca Saldo',
            title: 'Neraca Saldo',
            subtitle: 'Saldo debit, kredit, dan saldo akhir setiap akun',
            headers: [
                'Kode akun',
                'Nama akun',
                'Jenis',
                'Mata uang',
                'Debit (IDR)',
                'Kredit (IDR)',
                'Saldo (IDR)',
            ],
            rows: asRows(data.account_balances).map((row) => [
                safeText(row.code),
                safeText(row.name),
                safeText(row.type),
                safeText(row.currency),
                asNumber(row.debit_total),
                asNumber(row.credit_total),
                asNumber(row.balance_idr),
            ]),
            numericColumns: [4, 5, 6],
        },
        {
            name: 'Arus Kas',
            title: 'Laporan Arus Kas',
            subtitle: 'Arus kas masuk dan keluar berdasarkan aktivitas',
            headers: [
                'Aktivitas',
                'Jenis transaksi',
                'Kas masuk (IDR)',
                'Kas keluar (IDR)',
                'Bersih (IDR)',
            ],
            rows: asRows(cashflow.rows).map((row) => [
                safeText(row.activity_category),
                safeText(row.transaction_type),
                asNumber(row.cash_in_idr),
                asNumber(row.cash_out_idr),
                asNumber(row.net_idr),
            ]),
            numericColumns: [2, 3, 4],
        },
        {
            name: 'Trip dan HPP',
            title: 'Profitabilitas Trip dan HPP',
            subtitle: 'Budget, aktual, pendapatan, dan laba kotor per trip',
            headers: [
                'Kode trip',
                'Nama trip',
                'Tanggal berangkat',
                'Status',
                'Budget HPP (IDR)',
                'Aktual HPP (IDR)',
                'Selisih (IDR)',
                'Pendapatan (IDR)',
                'Laba kotor (IDR)',
            ],
            rows: asRows(data.trip_profitability).map((row) => [
                safeText(row.code),
                safeText(row.name),
                safeText(row.start_date),
                safeText(row.operational_status),
                asNumber(row.budget_cost_idr),
                asNumber(row.actual_cost_idr),
                asNumber(row.variance_idr),
                asNumber(row.revenue_idr),
                asNumber(row.gross_profit_idr),
            ]),
            numericColumns: [4, 5, 6, 7, 8],
        },
        {
            name: 'Anggaran',
            title: 'Anggaran dan Realisasi',
            subtitle: 'Perbandingan rencana dengan realisasi ledger',
            headers: [
                'Nomor',
                'Nama anggaran',
                'Trip',
                'Tanggal awal',
                'Tanggal akhir',
                'Status',
                'Rencana (IDR)',
                'Aktual (IDR)',
                'Sisa (IDR)',
                'Realisasi (%)',
            ],
            rows: asRows(budgets.rows).map((row) => [
                safeText(row.budget_number),
                safeText(row.name),
                safeText(row.package_label ?? 'Umum'),
                safeText(row.period_start),
                safeText(row.period_end),
                safeText(row.status),
                asNumber(row.planned_amount_idr),
                asNumber(row.actual_amount_idr),
                asNumber(row.remaining_amount_idr),
                asNumber(row.utilization_percent) / 100,
            ]),
            numericColumns: [6, 7, 8, 9],
        },
        {
            name: 'Piutang',
            title: 'Aging Piutang Jemaah',
            subtitle: 'Saldo piutang per tanggal akhir periode',
            headers: [
                'Kode booking',
                'Nama jemaah',
                'Jatuh tempo',
                'Umur piutang',
                'Nilai booking (IDR)',
                'Terbayar (IDR)',
                'Sisa (IDR)',
            ],
            rows: asRows(receivables.rows).map((row) => [
                safeText(row.booking_code),
                safeText(row.customer_name),
                safeText(row.due_date),
                safeText(row.aging_bucket),
                asNumber(row.agreed_amount_idr),
                asNumber(row.paid_amount_idr),
                asNumber(row.remaining_amount_idr),
            ]),
            numericColumns: [4, 5, 6],
        },
        {
            name: 'Hutang',
            title: 'Aging Hutang Vendor',
            subtitle: 'Saldo hutang vendor per tanggal akhir periode',
            headers: [
                'Nomor invoice',
                'Vendor',
                'Trip',
                'Jatuh tempo',
                'Umur hutang',
                'Nilai tagihan (IDR)',
                'Terbayar (IDR)',
                'Sisa (IDR)',
            ],
            rows: asRows(payables.rows).map((row) => [
                safeText(row.invoice_number),
                safeText(row.vendor_name),
                safeText(row.package_code),
                safeText(row.due_date),
                safeText(row.aging_bucket),
                asNumber(row.amount_idr),
                asNumber(row.paid_amount_idr),
                asNumber(row.remaining_amount_idr),
            ]),
            numericColumns: [5, 6, 7],
        },
        {
            name: 'Persediaan',
            title: 'Nilai Persediaan',
            subtitle: 'Kuantitas dan nilai persediaan saat laporan dibuat',
            headers: [
                'Kode',
                'Nama barang',
                'Stok',
                'Dipesan',
                'Tersedia',
                'Biaya rata-rata (IDR)',
                'Nilai (IDR)',
            ],
            rows: asRows(inventory.rows).map((row) => [
                safeText(row.item_code),
                safeText(row.item_name),
                asNumber(row.quantity),
                asNumber(row.reserved_quantity),
                asNumber(row.available_quantity),
                asNumber(row.average_unit_cost_idr),
                asNumber(row.value_idr),
            ]),
            numericColumns: [2, 3, 4, 5, 6],
        },
        {
            name: 'Audit Trail',
            title: 'Audit Trail Keuangan',
            subtitle: 'Riwayat transaksi, reversal, dan adjustment',
            headers: [
                'Tanggal',
                'Nomor transaksi',
                'Jenis',
                'Status',
                'Keterangan',
                'Nilai (IDR)',
                'Diposting oleh',
                'Adjustment atas',
            ],
            rows: asRows(data.audit_trail).map((row) => [
                safeText(row.transaction_date),
                safeText(row.transaction_number),
                safeText(row.transaction_type),
                safeText(row.status),
                safeText(row.description),
                asNumber(row.amount_idr),
                safeText(row.posted_by_name),
                safeText(row.adjustment_of_number),
            ]),
            numericColumns: [5],
        },
    ];

    const serverBackedSheets = [
        { report: 'journal', sheet: 'Jurnal Umum', source: 'ledger' },
        { report: 'general-ledger', sheet: 'Buku Besar', source: 'ledger' },
        { report: 'reconciliations', sheet: 'Rekonsiliasi', source: 'report' },
        { report: 'periods', sheet: 'Periode', source: 'report' },
        { report: 'audit-trail', sheet: 'Audit Trail', source: 'report' },
    ];
    const serverResponses = await Promise.all(
        serverBackedSheets.map(
            async ({ report: reportType, sheet, source }) => {
                const parameters = new URLSearchParams({
                    report: reportType,
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                });
                const response = await fetch(
                    source === 'ledger'
                        ? `/admin/financial-management/ledger/export/csv?${parameters.toString()}`
                        : `/admin/financial-management/financial-report/csv?${parameters.toString()}`,
                    { credentials: 'same-origin' },
                );
                if (!response.ok) {
                    throw new Error(`Gagal memuat data ${sheet}.`);
                }
                const csvWorkbook = XLSX.read(await response.arrayBuffer(), {
                    type: 'array',
                });
                const firstSheet =
                    csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<CellValue[]>(firstSheet, {
                    header: 1,
                    raw: true,
                    defval: '',
                });

                return { sheet, headers: rows[0] ?? [], rows: rows.slice(1) };
            },
        ),
    );
    for (const serverSheet of serverResponses) {
        const definition = sheets.find(
            (sheet) => sheet.name === serverSheet.sheet,
        );
        if (definition) {
            definition.headers = serverSheet.headers.map(String);
            definition.rows = serverSheet.rows;
        } else {
            sheets.push({
                name: serverSheet.sheet,
                title: serverSheet.sheet,
                subtitle: 'Data lengkap sesuai periode laporan',
                headers: serverSheet.headers.map(String),
                rows: serverSheet.rows,
            });
        }
    }

    const workbook = XLSX.utils.book_new();
    const generatedAt = formatDateTime(new Date());

    for (const definition of sheets) {
        const rows: CellValue[][] = [
            [meta.company_name],
            [meta.company_subtitle],
            [definition.title],
            [definition.subtitle],
            [`Periode ${filters.date_from} s.d. ${filters.date_to}`],
            [
                `Dibuat ${generatedAt}${meta.generated_by ? ` oleh ${meta.generated_by}` : ''}`,
            ],
            ['Dokumen internal - belum diaudit'],
            [],
            definition.headers,
            ...definition.rows,
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const headerRow = 8;
        const lastColumn = Math.max(0, definition.headers.length - 1);
        const lastRow = Math.max(headerRow, rows.length - 1);
        worksheet['!autofilter'] = {
            ref: XLSX.utils.encode_range({
                s: { r: headerRow, c: 0 },
                e: { r: lastRow, c: lastColumn },
            }),
        };
        worksheet['!cols'] = definition.headers.map((header, column) => ({
            wch: Math.min(
                42,
                Math.max(
                    header.length + 3,
                    ...definition.rows.map(
                        (row) => String(row[column] ?? '').length,
                    ),
                ),
            ),
        }));

        for (const column of definition.numericColumns ?? []) {
            for (let row = headerRow + 1; row <= lastRow; row += 1) {
                const cell =
                    worksheet[XLSX.utils.encode_cell({ r: row, c: column })];
                if (cell && typeof cell.v === 'number') {
                    cell.z =
                        column === 9 && definition.name === 'Anggaran'
                            ? '0.0%'
                            : '#,##0';
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, definition.name);
    }

    XLSX.writeFile(
        workbook,
        `laporan-keuangan-${filters.date_from}-${filters.date_to}.xlsx`,
        { compression: true },
    );
}
