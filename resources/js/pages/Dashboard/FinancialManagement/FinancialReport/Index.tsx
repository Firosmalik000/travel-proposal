import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate, formatMonth } from '@/lib/date-format';
import { exportFinancialReportWorkbook } from '@/lib/financial-report-export';
import { formatIdr } from '@/lib/number-format';
import { SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Banknote,
    BookOpenCheck,
    CalendarClock,
    ChevronDown,
    Download,
    FileSpreadsheet,
    FileText,
    Landmark,
    Pencil,
    PiggyBank,
    Plus,
    ReceiptText,
    Scale,
    Trash2,
    WalletCards,
} from 'lucide-react';
import { FormEvent, ReactNode, useId, useState } from 'react';
import { toast } from 'sonner';

type AccountBalance = {
    id: number;
    code: string;
    name: string;
    type: string;
    system_key: string | null;
    is_cash_account: boolean;
    cash_account_type: string | null;
    debit_total: number;
    credit_total: number;
    balance_idr: number;
};
type MoneyRow = {
    code: string;
    name: string;
    type: string;
    amount_idr: number;
};
type MonthlyRow = {
    month: string;
    revenue_idr: number;
    expenses_idr: number;
    net_profit_idr: number;
};
type TripRow = {
    package_id: number;
    code: string;
    name: string;
    start_date: string | null;
    operational_status: string;
    budget_cost_idr: number;
    actual_cost_idr: number;
    variance_idr: number;
    revenue_idr: number;
    gross_profit_idr: number;
};
type AgingRow = {
    booking_code?: string;
    customer_name?: string;
    invoice_number?: string | null;
    vendor_name?: string | null;
    package_code?: string | null;
    due_date: string | null;
    remaining_amount_idr: number;
    aging_bucket: string;
};
type InventoryRow = {
    id: number;
    item_code: string;
    item_name: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    average_unit_cost_idr: number;
    value_idr: number;
};
type Reconciliation = {
    id: number;
    account_name: string;
    statement_date: string;
    statement_balance_idr: number;
    ledger_balance_idr: number;
    difference_idr: number;
    status: 'matched' | 'difference';
    notes: string | null;
    reconciled_by_name: string | null;
};
type Period = {
    id: number;
    period_code: string;
    start_date: string;
    end_date: string;
    status: 'open' | 'closed';
    events: {
        action: string;
        reason: string;
        actor_name: string | null;
        occurred_at: string;
    }[];
};
type AuditRow = {
    id: number;
    transaction_number: string;
    transaction_date: string;
    transaction_type: string;
    adjustment_of_number: string | null;
    description: string | null;
    posted_by_name: string | null;
    amount_idr: number;
};
type BudgetRow = {
    id: number;
    budget_number: string;
    name: string;
    package_id: number | null;
    package_label: string | null;
    period_start: string;
    period_end: string;
    status: 'draft' | 'approved' | 'closed';
    planned_amount_idr: number;
    actual_amount_idr: number;
    remaining_amount_idr: number;
    utilization_percent: number;
    notes: string | null;
    lines: {
        id: number;
        financial_account_id: number;
        account_label: string;
        planned_amount_idr: number;
        actual_amount_idr: number;
        remaining_amount_idr: number;
        notes: string | null;
    }[];
};
type Option = { id: number; label: string };

type ReportData = {
    workspace: 'overview' | 'reports' | 'controls';
    permissionKey: string;
    today: string;
    filters: { date_from: string; date_to: string };
    report: {
        summary: {
            cash_balance_idr: number;
            customer_funds_idr: number;
            customer_advance_idr: number;
            revenue_idr: number;
            net_profit_idr: number;
        };
        cashflow: {
            total_in_idr: number;
            total_out_idr: number;
            net_idr: number;
            rows: {
                activity_category: string;
                transaction_type: string;
                cash_in_idr: number;
                cash_out_idr: number;
                net_idr: number;
            }[];
        };
        account_balances: AccountBalance[];
        profit_loss: {
            revenue_idr: number;
            expenses_idr: number;
            net_profit_idr: number;
            accounts: MoneyRow[];
            monthly: MonthlyRow[];
        };
        balance_sheet: {
            assets_idr: number;
            liabilities_idr: number;
            equity_idr: number;
            retained_earnings_idr: number;
            liabilities_and_equity_idr: number;
            difference_idr: number;
        };
        trip_profitability: TripRow[];
        budgets: {
            planned_idr: number;
            actual_idr: number;
            remaining_idr: number;
            rows: BudgetRow[];
        };
        customer_receivables: {
            total_idr: number;
            rows: AgingRow[];
        };
        vendor_payables: {
            total_idr: number;
            rows: AgingRow[];
        };
        inventory: {
            total_value_idr: number;
            rows: InventoryRow[];
        };
        capital_movements: {
            rows: {
                date: string;
                type: string;
                amount_idr: number;
                description: string | null;
            }[];
        };
        reconciliations: Reconciliation[];
        periods: Period[];
        audit_trail: AuditRow[];
    };
    cashAccountOptions: Option[];
    accountOptions: Option[];
    expenseAccountOptions: Option[];
    packageOptions: Option[];
    closedTransactionOptions: Option[];
    exportMeta: {
        company_name: string;
        company_subtitle: string;
        generated_by: string | null;
    };
};

const csvReportOptions = [
    { value: 'trial-balance', label: 'Buku Saldo Akun' },
    { value: 'profit-loss', label: 'Laba Rugi' },
    { value: 'balance-sheet', label: 'Neraca Keuangan' },
    { value: 'cash-flow', label: 'Arus Kas' },
    { value: 'capital-movements', label: 'Perubahan Modal' },
    { value: 'trip-profitability', label: 'Keuntungan Paket Trip' },
    { value: 'budget-actual', label: 'Rencana & Realisasi Anggaran' },
    { value: 'receivables', label: 'Tagihan Jemaah (Piutang)' },
    { value: 'payables', label: 'Tagihan Vendor (Hutang)' },
    { value: 'inventory', label: 'Stok Perlengkapan' },
    { value: 'reconciliations', label: 'Rekonsiliasi Bank' },
    { value: 'periods', label: 'Status Periode Pembukuan' },
    { value: 'audit-trail', label: 'Riwayat Audit Transaksi' },
] as const;

const transactionLabels: Record<string, string> = {
    opening_balance: 'Saldo Awal',
    manual_journal: 'Jurnal Manual',
    transfer: 'Transfer Antar Rekening',
    booking_payment: 'Pembayaran Jemaah',
    capital_contribution: 'Setoran Modal Pemilik',
    owner_withdrawal: 'Prive / Penarikan Pemilik',
    operating_expense: 'Biaya Operasional',
    other_income: 'Pendapatan Lain-lain',
    customer_refund: 'Pengembalian Dana (Refund)',
    agent_commission: 'Komisi Agen',
    inventory_purchase: 'Pembelian Perlengkapan',
    inventory_issue: 'Pemakaian Perlengkapan',
    vendor_bill: 'Tagihan Masuk dari Vendor',
    vendor_payment: 'Pembayaran ke Vendor',
    vendor_advance_payment: 'Uang Muka ke Vendor (DP)',
    vendor_advance_application: 'Pemotongan Uang Muka Vendor',
    vendor_service_use: 'Penggunaan Layanan Vendor',
    trip_revenue_recognition: 'Pengakuan Pendapatan Trip',
    period_adjustment: 'Penyesuaian Periode',
    reversal: 'Pembatalan / Reversal',
    legacy_unclassified: 'Transaksi Lainnya',
};

const cashflowActivityLabels: Record<string, string> = {
    operating: 'Operasional',
    financing: 'Pendanaan & Modal',
    unclassified: 'Lainnya',
};

const agingLabels: Record<string, string> = {
    belum_jatuh_tempo: 'Belum Jatuh Tempo',
    '1_30': '1–30 Hari',
    '31_60': '31–60 Hari',
    '61_90': '61–90 Hari',
    lebih_90: '> 90 Hari',
};

function idempotencyKey(prefix: string): string {
    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

function StatCard({
    title,
    value,
    badge,
    icon,
    variant = 'neutral',
}: {
    title: string;
    value: number;
    badge?: string;
    icon: ReactNode;
    variant?: 'neutral' | 'emerald' | 'blue' | 'violet' | 'rose';
}) {
    const variantStyles = {
        neutral: {
            card: 'border-border/70 bg-card hover:border-border transition-colors',
            iconBox: 'bg-muted text-foreground ring-1 ring-border',
            value: 'text-foreground',
            badgeClass: 'bg-muted text-muted-foreground',
        },
        emerald: {
            card: 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-card to-card hover:border-emerald-500/40 transition-colors',
            iconBox:
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25',
            value: 'text-emerald-700 dark:text-emerald-400',
            badgeClass:
                'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        },
        blue: {
            card: 'border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card hover:border-blue-500/40 transition-colors',
            iconBox:
                'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/25',
            value: 'text-blue-700 dark:text-blue-400',
            badgeClass:
                'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
        },
        violet: {
            card: 'border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-card to-card hover:border-violet-500/40 transition-colors',
            iconBox:
                'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/25',
            value: 'text-violet-700 dark:text-violet-400',
            badgeClass:
                'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
        },
        rose: {
            card: 'border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-card to-card hover:border-rose-500/40 transition-colors',
            iconBox:
                'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/25',
            value: 'text-rose-700 dark:text-rose-400',
            badgeClass:
                'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        },
    }[variant];

    return (
        <Card className={`overflow-hidden shadow-sm ${variantStyles.card}`}>
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {title}
                    </span>
                    <div
                        className={`flex size-10 items-center justify-center rounded-xl ${variantStyles.iconBox}`}
                    >
                        {icon}
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                    <p
                        className={`text-2xl font-bold tracking-tight tabular-nums ${variantStyles.value}`}
                    >
                        {formatIdr(value)}
                    </p>
                    {badge && (
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium ${variantStyles.badgeClass}`}
                        >
                            {badge}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function BudgetValue({
    label,
    value,
    negative = false,
}: {
    label: string;
    value: number;
    negative?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {label}
            </span>
            <p
                className={`mt-1.5 text-lg font-bold tabular-nums ${
                    negative ? 'text-destructive' : 'text-foreground'
                }`}
            >
                {formatIdr(value)}
            </p>
        </div>
    );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
    return (
        <TableRow>
            <TableCell
                colSpan={colSpan}
                className="h-28 text-center text-sm font-medium text-muted-foreground"
            >
                {text}
            </TableCell>
        </TableRow>
    );
}

export default function FinancialReportIndex({
    workspace,
    permissionKey,
    today,
    filters,
    report,
    cashAccountOptions,
    accountOptions,
    expenseAccountOptions,
    packageOptions,
    closedTransactionOptions,
    exportMeta,
}: ReportData) {
    const { auth } = usePage<SharedData>().props;
    const { can } = usePermission(permissionKey);
    const workspaceConfig = {
        overview: {
            title: 'Ringkasan Keuangan',
            path: '/admin/financial-management/overview',
            defaultTab: 'overview',
        },
        reports: {
            title: 'Laporan Keuangan',
            path: '/admin/financial-management/reports',
            defaultTab: 'overview',
        },
        controls: {
            title: 'Rekonsiliasi & Periode',
            path: '/admin/financial-management/controls',
            defaultTab: 'controls',
        },
    }[workspace];

    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [filterProcessing, setFilterProcessing] = useState(false);
    const [reconcileOpen, setReconcileOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [adjustmentOpen, setAdjustmentOpen] = useState(false);
    const [budgetOpen, setBudgetOpen] = useState(false);
    const [csvExportOpen, setCsvExportOpen] = useState(false);
    const [csvReport, setCsvReport] = useState('trial-balance');
    const [workbookProcessing, setWorkbookProcessing] = useState(false);
    const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null);
    const [reopenPeriod, setReopenPeriod] = useState<Period | null>(null);

    const reconciliationForm = useForm({
        financial_account_id: '',
        statement_date: today,
        statement_balance_idr: '',
        notes: '',
        idempotency_key: idempotencyKey('reconciliation'),
    });

    const periodForm = useForm({
        period_code: filters.date_from.slice(0, 7),
        reason: '',
    });

    const reopenForm = useForm({ reason: '' });

    const adjustmentForm = useForm({
        transaction_date: today,
        adjustment_of_id: '',
        debit_account_id: '',
        credit_account_id: '',
        amount_idr: '',
        adjustment_reason: '',
        idempotency_key: idempotencyKey('adjustment'),
    });

    const budgetForm = useForm({
        name: '',
        package_id: '',
        period_start: filters.date_from,
        period_end: filters.date_to,
        notes: '',
        lines: [
            { financial_account_id: '', planned_amount_idr: '', notes: '' },
        ],
    });

    const reconciliationError = (
        reconciliationForm.errors as Record<string, string>
    ).reconciliation;
    const periodError = (periodForm.errors as Record<string, string>).period;
    const adjustmentError = (adjustmentForm.errors as Record<string, string>)
        .adjustment;
    const budgetError = (budgetForm.errors as Record<string, string>).budget;

    function applyFilters(): void {
        router.get(
            workspaceConfig.path,
            { date_from: dateFrom, date_to: dateTo },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => setFilterProcessing(true),
                onFinish: () => setFilterProcessing(false),
            },
        );
    }

    function applyQuickRange(from: string, to: string): void {
        setDateFrom(from);
        setDateTo(to);
        router.get(
            workspaceConfig.path,
            { date_from: from, date_to: to },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => setFilterProcessing(true),
                onFinish: () => setFilterProcessing(false),
            },
        );
    }

    function exportPdf(): void {
        window.open(
            `/admin/financial-management/financial-report/pdf?date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`,
            '_blank',
        );
    }

    function exportCsv(): void {
        window.location.assign(
            `/admin/financial-management/financial-report/csv?date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}&report=${encodeURIComponent(csvReport)}`,
        );
        setCsvExportOpen(false);
    }

    async function exportWorkbook(): Promise<void> {
        setWorkbookProcessing(true);
        try {
            await exportFinancialReportWorkbook({
                report,
                filters: { date_from: dateFrom, date_to: dateTo },
                meta: exportMeta,
            });
            toast.success('Laporan Excel berhasil diunduh.');
        } catch {
            toast.error(
                'Laporan Excel belum dapat dibuat. Silakan gunakan format PDF atau CSV.',
            );
        } finally {
            setWorkbookProcessing(false);
        }
    }

    function openBudgetForm(budget?: BudgetRow): void {
        setEditingBudget(budget ?? null);
        budgetForm.setData(
            budget
                ? {
                      name: budget.name,
                      package_id: budget.package_id
                          ? String(budget.package_id)
                          : '',
                      period_start: budget.period_start,
                      period_end: budget.period_end,
                      notes: budget.notes ?? '',
                      lines: budget.lines.map((line) => ({
                          financial_account_id: String(
                              line.financial_account_id,
                          ),
                          planned_amount_idr: String(line.planned_amount_idr),
                          notes: line.notes ?? '',
                      })),
                  }
                : {
                      name: '',
                      package_id: '',
                      period_start: filters.date_from,
                      period_end: filters.date_to,
                      notes: '',
                      lines: [
                          {
                              financial_account_id: '',
                              planned_amount_idr: '',
                              notes: '',
                          },
                      ],
                  },
        );
        setBudgetOpen(true);
    }

    function submitBudget(event: FormEvent): void {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setBudgetOpen(false);
                setEditingBudget(null);
                budgetForm.reset();
                toast.success(
                    editingBudget
                        ? 'Anggaran berhasil diperbarui.'
                        : 'Anggaran berhasil disimpan.',
                );
            },
        };

        if (editingBudget) {
            budgetForm.put(
                `/admin/financial-management/financial-report/budgets/${editingBudget.id}`,
                options,
            );
            return;
        }

        budgetForm.post(
            '/admin/financial-management/financial-report/budgets',
            options,
        );
    }

    function transitionBudget(
        budget: BudgetRow,
        status: 'approved' | 'closed',
    ): void {
        const actionLabel = status === 'approved' ? 'menyetujui' : 'menutup';
        if (
            !window.confirm(
                `Yakin ingin ${actionLabel} anggaran "${budget.name}"?`,
            )
        ) {
            return;
        }

        router.post(
            `/admin/financial-management/financial-report/budgets/${budget.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        status === 'approved'
                            ? 'Anggaran telah disetujui.'
                            : 'Anggaran telah ditutup.',
                    ),
            },
        );
    }

    function submitReconciliation(event: FormEvent): void {
        event.preventDefault();
        reconciliationForm.post(
            '/admin/financial-management/financial-report/reconciliations',
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReconcileOpen(false);
                    reconciliationForm.reset();
                    reconciliationForm.setData(
                        'idempotency_key',
                        idempotencyKey('reconciliation'),
                    );
                    toast.success('Rekonsiliasi bank berhasil dicatat.');
                },
            },
        );
    }

    function submitPeriod(event: FormEvent): void {
        event.preventDefault();
        periodForm.post(
            '/admin/financial-management/financial-report/periods/close',
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPeriodOpen(false);
                    periodForm.reset();
                    toast.success('Periode keuangan berhasil ditutup.');
                },
            },
        );
    }

    function submitReopen(event: FormEvent): void {
        event.preventDefault();
        if (!reopenPeriod) {
            return;
        }

        reopenForm.post(
            `/admin/financial-management/financial-report/periods/${reopenPeriod.id}/reopen`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReopenPeriod(null);
                    reopenForm.reset();
                    toast.success('Periode keuangan berhasil dibuka kembali.');
                },
            },
        );
    }

    function submitAdjustment(event: FormEvent): void {
        event.preventDefault();
        adjustmentForm.post(
            '/admin/financial-management/financial-report/adjustments',
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAdjustmentOpen(false);
                    adjustmentForm.reset();
                    adjustmentForm.setData(
                        'idempotency_key',
                        idempotencyKey('adjustment'),
                    );
                    toast.success('Adjustment periode berhasil diposting.');
                },
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: workspaceConfig.title,
                    href: workspaceConfig.path,
                },
            ]}
        >
            <Head title={workspaceConfig.title} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {workspaceConfig.title}
                        </h1>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="font-normal text-muted-foreground"
                            >
                                Periode: {formatDate(dateFrom)} –{' '}
                                {formatDate(dateTo)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {workspace === 'controls' && can('create') && (
                            <Button
                                variant="outline"
                                className="h-10 font-medium"
                                onClick={() => setReconcileOpen(true)}
                            >
                                <Scale className="mr-2 size-4 text-primary" />
                                Rekonsiliasi Bank
                            </Button>
                        )}
                        {workspace === 'controls' && can('approve') && (
                            <Button
                                variant="outline"
                                className="h-10 font-medium"
                                onClick={() => setPeriodOpen(true)}
                            >
                                <CalendarClock className="mr-2 size-4 text-primary" />
                                Tutup Periode
                            </Button>
                        )}
                        {workspace === 'reports' && can('export') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        disabled={workbookProcessing}
                                        className="h-10 font-medium shadow-sm"
                                    >
                                        <Download className="mr-2 size-4" />
                                        {workbookProcessing
                                            ? 'Menyiapkan...'
                                            : 'Unduh Laporan'}
                                        <ChevronDown className="ml-2 size-4 opacity-70" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 p-1.5 shadow-lg"
                                >
                                    <DropdownMenuItem
                                        onClick={exportPdf}
                                        className="py-2.5"
                                    >
                                        <FileText className="mr-2.5 size-4 text-rose-500" />
                                        Cetak Dokumen PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => void exportWorkbook()}
                                        className="py-2.5"
                                    >
                                        <FileSpreadsheet className="mr-2.5 size-4 text-emerald-600" />
                                        Spreadsheet Excel (.xlsx)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setCsvExportOpen(true)}
                                        className="py-2.5"
                                    >
                                        <Download className="mr-2.5 size-4 text-blue-500" />
                                        Tabel Data CSV
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3.5 text-xs font-medium"
                            onClick={() => applyQuickRange(today, today)}
                        >
                            Hari Ini
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3.5 text-xs font-medium"
                            onClick={() =>
                                applyQuickRange(
                                    `${today.slice(0, 7)}-01`,
                                    today,
                                )
                            }
                        >
                            Bulan Ini
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3.5 text-xs font-medium"
                            onClick={() => {
                                const year = today.slice(0, 4);
                                applyQuickRange(`${year}-01-01`, today);
                            }}
                        >
                            Tahun Berjalan
                        </Button>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                Dari
                            </span>
                            <Input
                                type="date"
                                max={dateTo || undefined}
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(event.target.value)
                                }
                                className="h-9 w-36 text-xs font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                Sampai
                            </span>
                            <Input
                                type="date"
                                min={dateFrom || undefined}
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(event.target.value)
                                }
                                className="h-9 w-36 text-xs font-medium"
                            />
                        </div>
                        <Button
                            size="sm"
                            className="h-9 px-4 font-medium"
                            disabled={filterProcessing || dateFrom > dateTo}
                            onClick={applyFilters}
                        >
                            {filterProcessing ? 'Memuat...' : 'Terapkan'}
                        </Button>
                    </div>
                </div>

                {/* 4 Top KPI Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Saldo Kas & Bank"
                        value={report.summary.cash_balance_idr}
                        badge="Siap Digunakan"
                        variant="emerald"
                        icon={<Landmark className="size-5" />}
                    />
                    <StatCard
                        title="Dana Titipan Jemaah"
                        value={report.summary.customer_funds_idr}
                        badge="Rekening Jemaah"
                        variant="blue"
                        icon={<WalletCards className="size-5" />}
                    />
                    <StatCard
                        title="Pendapatan Masuk"
                        value={report.summary.revenue_idr}
                        badge="Omzet Diakui"
                        variant="violet"
                        icon={<ReceiptText className="size-5" />}
                    />
                    <StatCard
                        title="Keuntungan Bersih"
                        value={report.summary.net_profit_idr}
                        badge={
                            report.summary.net_profit_idr >= 0
                                ? 'Surplus (Untung)'
                                : 'Defisit (Rugi)'
                        }
                        variant={
                            report.summary.net_profit_idr >= 0
                                ? 'emerald'
                                : 'rose'
                        }
                        icon={<Banknote className="size-5" />}
                    />
                </div>

                {/* Navigation Tabs */}
                <Tabs
                    defaultValue={workspaceConfig.defaultTab}
                    className="space-y-6"
                >
                    <div className="overflow-x-auto pb-1">
                        <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-muted/60 p-1 text-muted-foreground">
                            {workspace !== 'controls' && (
                                <TabsTrigger
                                    className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                    value="overview"
                                >
                                    Ringkasan
                                </TabsTrigger>
                            )}
                            {workspace === 'reports' && (
                                <>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="accounts"
                                    >
                                        Saldo Akun
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="profit-loss"
                                    >
                                        Laba Rugi
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="balance-sheet"
                                    >
                                        Neraca
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="trips"
                                    >
                                        Trip & HPP
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="budgets"
                                    >
                                        Anggaran
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="aging"
                                    >
                                        Piutang & Hutang
                                    </TabsTrigger>
                                    <TabsTrigger
                                        className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                        value="inventory"
                                    >
                                        Persediaan
                                    </TabsTrigger>
                                </>
                            )}
                            {workspace === 'controls' && (
                                <TabsTrigger
                                    className="h-9 rounded-lg px-4 text-xs font-medium sm:text-sm"
                                    value="controls"
                                >
                                    Kontrol & Audit
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    {/* Tab: Overview */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* Card: Cashflow */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardContent className="p-0">
                                    <div className="border-b p-4 sm:p-5">
                                        <h2 className="text-base font-bold text-foreground">
                                            Arus Kas Periode Ini
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-3 divide-x divide-border/60">
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                                <ArrowDownToLine className="size-3.5" />
                                                Kas Masuk
                                            </div>
                                            <p className="mt-2 text-lg font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.cashflow
                                                        .total_in_idr,
                                                )}
                                            </p>
                                        </div>
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                                <ArrowUpFromLine className="size-3.5" />
                                                Kas Keluar
                                            </div>
                                            <p className="mt-2 text-lg font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.cashflow
                                                        .total_out_idr,
                                                )}
                                            </p>
                                        </div>
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                <Landmark className="size-3.5" />
                                                Selisih Bersih
                                            </div>
                                            <p
                                                className={`mt-2 text-lg font-bold tabular-nums ${report.cashflow.net_idr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}
                                            >
                                                {formatIdr(
                                                    report.cashflow.net_idr,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card: Operational Position */}
                            <Card className="overflow-hidden border-border/70 shadow-sm">
                                <CardContent className="p-0">
                                    <div className="border-b p-4 sm:p-5">
                                        <h2 className="text-base font-bold text-foreground">
                                            Posisi Keuangan & Kewajiban
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-border/60">
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                DP / Uang Muka dari Jemaah
                                            </span>
                                            <span className="font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.summary
                                                        .customer_advance_idr,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Tagihan Jemaah Belum Lunas
                                                (Piutang)
                                            </span>
                                            <span className="font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.customer_receivables
                                                        .total_idr,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Tagihan Vendor Belum Dibayar
                                                (Hutang)
                                            </span>
                                            <span className="font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.vendor_payables
                                                        .total_idr,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Total Nilai Stok Perlengkapan
                                            </span>
                                            <span className="font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.inventory
                                                        .total_value_idr,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cashflow by Type Table */}
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="border-b p-4 sm:p-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Rincian Arus Kas Transaksi
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="w-36 font-semibold">
                                                Aktivitas
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Kategori Transaksi
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Masuk (+)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Keluar (-)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Bersih
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.cashflow.rows.length === 0 ? (
                                            <EmptyRow
                                                colSpan={5}
                                                text="Belum ada transaksi arus kas pada rentang tanggal ini."
                                            />
                                        ) : (
                                            report.cashflow.rows.map((row) => (
                                                <TableRow
                                                    key={row.transaction_type}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs font-medium"
                                                        >
                                                            {cashflowActivityLabels[
                                                                row
                                                                    .activity_category
                                                            ] ??
                                                                row.activity_category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-foreground">
                                                        {transactionLabels[
                                                            row.transaction_type
                                                        ] ??
                                                            row.transaction_type}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                                                        {row.cash_in_idr > 0
                                                            ? formatIdr(
                                                                  row.cash_in_idr,
                                                              )
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-rose-600 tabular-nums dark:text-rose-400">
                                                        {row.cash_out_idr > 0
                                                            ? formatIdr(
                                                                  row.cash_out_idr,
                                                              )
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-bold tabular-nums ${row.net_idr >= 0 ? 'text-foreground' : 'text-rose-600'}`}
                                                    >
                                                        {formatIdr(row.net_idr)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Saldo Akun */}
                    <TabsContent value="accounts">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="border-b p-4 sm:p-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Buku Saldo Akun
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table className="min-w-[850px]">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Nama Akun
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Jenis
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Total Masuk (Debit)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Total Keluar (Kredit)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Saldo Akhir
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.account_balances.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <div className="font-semibold text-foreground">
                                                        {row.name}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {row.code}
                                                        </span>
                                                        {row.is_cash_account && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] font-semibold tracking-wider uppercase"
                                                            >
                                                                Kas / Bank
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-muted-foreground capitalize">
                                                    {row.type}
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    {formatIdr(row.debit_total)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    {formatIdr(
                                                        row.credit_total,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                    {formatIdr(row.balance_idr)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Laba Rugi */}
                    <TabsContent value="profit-loss" className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                title="Total Pendapatan"
                                value={report.profit_loss.revenue_idr}
                                variant="emerald"
                                icon={<ArrowDownToLine className="size-5" />}
                            />
                            <StatCard
                                title="Total Biaya & Beban"
                                value={report.profit_loss.expenses_idr}
                                variant="rose"
                                icon={<ArrowUpFromLine className="size-5" />}
                            />
                            <StatCard
                                title="Laba Bersih"
                                value={report.profit_loss.net_profit_idr}
                                variant={
                                    report.profit_loss.net_profit_idr >= 0
                                        ? 'emerald'
                                        : 'rose'
                                }
                                badge={
                                    report.profit_loss.net_profit_idr >= 0
                                        ? 'Untung'
                                        : 'Rugi'
                                }
                                icon={<Banknote className="size-5" />}
                            />
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            {/* Rincian Akun */}
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                                <div className="border-b p-4 sm:p-5">
                                    <h2 className="text-base font-bold text-foreground">
                                        Rincian Pos Pendapatan & Biaya
                                    </h2>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Akun
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Nominal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.profit_loss.accounts.length ===
                                        0 ? (
                                            <EmptyRow
                                                colSpan={2}
                                                text="Belum ada transaksi pendapatan atau biaya."
                                            />
                                        ) : (
                                            report.profit_loss.accounts.map(
                                                (row) => (
                                                    <TableRow
                                                        key={row.code}
                                                        className="hover:bg-muted/30"
                                                    >
                                                        <TableCell>
                                                            <div className="font-medium text-foreground">
                                                                {row.name}
                                                            </div>
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {row.code} ·{' '}
                                                                {row.type}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                            {formatIdr(
                                                                row.amount_idr,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Monthly Breakdown */}
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                                <div className="border-b p-4 sm:p-5">
                                    <h2 className="text-base font-bold text-foreground">
                                        Tren Laba per Bulan
                                    </h2>
                                </div>
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Bulan
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Pendapatan
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Biaya
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Laba
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.profit_loss.monthly.length ===
                                        0 ? (
                                            <EmptyRow
                                                colSpan={4}
                                                text="Belum ada data bulanan."
                                            />
                                        ) : (
                                            report.profit_loss.monthly.map(
                                                (row) => (
                                                    <TableRow
                                                        key={row.month}
                                                        className="hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-medium text-foreground">
                                                            {formatMonth(
                                                                `${row.month}-01`,
                                                                {
                                                                    withYear: true,
                                                                },
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                                                            {formatIdr(
                                                                row.revenue_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-rose-600 tabular-nums dark:text-rose-400">
                                                            {formatIdr(
                                                                row.expenses_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`text-right font-bold tabular-nums ${row.net_profit_idr >= 0 ? 'text-foreground' : 'text-rose-600'}`}
                                                        >
                                                            {formatIdr(
                                                                row.net_profit_idr,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Neraca */}
                    <TabsContent value="balance-sheet" className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                title="Total Harta (Aset)"
                                value={report.balance_sheet.assets_idr}
                                variant="emerald"
                                icon={<Landmark className="size-5" />}
                            />
                            <StatCard
                                title="Total Hutang (Kewajiban)"
                                value={report.balance_sheet.liabilities_idr}
                                variant="rose"
                                icon={<ReceiptText className="size-5" />}
                            />
                            <StatCard
                                title="Modal & Laba Ditahan"
                                value={
                                    report.balance_sheet.equity_idr +
                                    report.balance_sheet.retained_earnings_idr
                                }
                                variant="blue"
                                icon={<WalletCards className="size-5" />}
                            />
                            <StatCard
                                title="Selisih Neraca"
                                value={report.balance_sheet.difference_idr}
                                variant={
                                    report.balance_sheet.difference_idr === 0
                                        ? 'emerald'
                                        : 'rose'
                                }
                                badge={
                                    report.balance_sheet.difference_idr === 0
                                        ? 'Seimbang (Balance)'
                                        : 'Ada Selisih'
                                }
                                icon={<Scale className="size-5" />}
                            />
                        </div>

                        <Card className="overflow-hidden border-border/70 shadow-sm">
                            <CardContent className="p-0">
                                <div className="border-b p-4 sm:p-5">
                                    <h2 className="text-base font-bold text-foreground">
                                        Keseimbangan Neraca Keuangan
                                    </h2>
                                </div>
                                <Table>
                                    <TableBody>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="font-semibold text-foreground">
                                                Total Aset / Harta
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.balance_sheet
                                                        .assets_idr,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground">
                                                Total Kewajiban (Hutang)
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.balance_sheet
                                                        .liabilities_idr,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground">
                                                Modal Pemilik (Ekuitas)
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.balance_sheet
                                                        .equity_idr,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground">
                                                Laba Ditahan
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.balance_sheet
                                                        .retained_earnings_idr,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="bg-muted/30 hover:bg-muted/50">
                                            <TableCell className="font-bold text-foreground">
                                                Total Kewajiban + Modal
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                {formatIdr(
                                                    report.balance_sheet
                                                        .liabilities_and_equity_idr,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Trip & HPP */}
                    <TabsContent value="trips">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="border-b p-4 sm:p-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Performa Keuntungan Paket Trip
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table className="min-w-[1000px]">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Paket Trip
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Estimasi Biaya (HPP)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Biaya Terpakai (Aktual)
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Selisih Biaya
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Pendapatan
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Keuntungan Kotor
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.trip_profitability.length ===
                                        0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="h-36 text-center"
                                                >
                                                    <div className="grid justify-items-center gap-3">
                                                        <p className="font-medium text-muted-foreground">
                                                            Belum ada data paket
                                                            trip pada periode
                                                            ini.
                                                        </p>
                                                        <Button
                                                            className="h-9 px-4"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link href="/admin/product-management/hpp-estimate">
                                                                Kelola Estimasi
                                                                HPP
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            report.trip_profitability.map(
                                                (row) => (
                                                    <TableRow
                                                        key={row.package_id}
                                                        className="hover:bg-muted/30"
                                                    >
                                                        <TableCell>
                                                            <div className="font-semibold text-foreground">
                                                                {row.name}
                                                            </div>
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {row.code} ·{' '}
                                                                {formatDate(
                                                                    row.start_date,
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs font-medium capitalize"
                                                            >
                                                                {row.operational_status.replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium tabular-nums">
                                                            {formatIdr(
                                                                row.budget_cost_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium tabular-nums">
                                                            {formatIdr(
                                                                row.actual_cost_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium tabular-nums">
                                                            {formatIdr(
                                                                row.variance_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium tabular-nums">
                                                            {formatIdr(
                                                                row.revenue_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                            {formatIdr(
                                                                row.gross_profit_idr,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Anggaran */}
                    <TabsContent value="budgets" className="space-y-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-foreground">
                                Rencana & Realisasi Anggaran
                            </h2>
                            {can('create') && (
                                <Button
                                    className="h-10 font-medium"
                                    onClick={() => openBudgetForm()}
                                >
                                    <Plus className="mr-2 size-4" /> Buat
                                    Anggaran
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                title="Total Rencana Anggaran"
                                value={report.budgets.planned_idr}
                                variant="blue"
                                icon={<PiggyBank className="size-5" />}
                            />
                            <StatCard
                                title="Realisasi Terpakai"
                                value={report.budgets.actual_idr}
                                variant={
                                    report.budgets.actual_idr >
                                    report.budgets.planned_idr
                                        ? 'rose'
                                        : 'neutral'
                                }
                                icon={<ReceiptText className="size-5" />}
                            />
                            <StatCard
                                title="Sisa Anggaran"
                                value={report.budgets.remaining_idr}
                                variant={
                                    report.budgets.remaining_idr >= 0
                                        ? 'emerald'
                                        : 'rose'
                                }
                                badge={
                                    report.budgets.remaining_idr >= 0
                                        ? 'Tersedia'
                                        : 'Overbudget'
                                }
                                icon={<WalletCards className="size-5" />}
                            />
                        </div>

                        {report.budgets.rows.length === 0 ? (
                            <Card className="border-border/70">
                                <CardContent className="grid gap-4 py-12 text-center">
                                    <p className="font-semibold text-muted-foreground">
                                        Belum ada anggaran pada periode ini.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {can('create') && (
                                            <Button
                                                className="h-9 font-medium"
                                                onClick={() => openBudgetForm()}
                                            >
                                                Buat Anggaran Sekarang
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-5">
                                {report.budgets.rows.map((budget) => (
                                    <Card
                                        key={budget.id}
                                        className="overflow-hidden border-border/70 shadow-sm"
                                    >
                                        <CardContent className="grid gap-5 p-5">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-base font-bold text-foreground">
                                                            {budget.name}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                budget.status ===
                                                                'approved'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className="text-xs font-medium"
                                                        >
                                                            {budget.status ===
                                                            'draft'
                                                                ? 'Draft'
                                                                : budget.status ===
                                                                    'approved'
                                                                  ? 'Disetujui'
                                                                  : 'Ditutup'}
                                                        </Badge>
                                                        {budget.remaining_amount_idr <
                                                            0 && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="text-xs font-medium"
                                                            >
                                                                Melebihi
                                                                Anggaran
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                        {budget.budget_number} ·{' '}
                                                        {formatDate(
                                                            budget.period_start,
                                                        )}{' '}
                                                        –{' '}
                                                        {formatDate(
                                                            budget.period_end,
                                                        )}
                                                        {budget.package_label
                                                            ? ` · ${budget.package_label}`
                                                            : ' · Operasional Umum'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {budget.status ===
                                                        'draft' &&
                                                        can('edit') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-9 font-medium"
                                                                onClick={() =>
                                                                    openBudgetForm(
                                                                        budget,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-1.5 size-3.5" />{' '}
                                                                Edit
                                                            </Button>
                                                        )}
                                                    {budget.status ===
                                                        'draft' &&
                                                        can('approve') && (
                                                            <Button
                                                                size="sm"
                                                                className="h-9 font-medium"
                                                                onClick={() =>
                                                                    transitionBudget(
                                                                        budget,
                                                                        'approved',
                                                                    )
                                                                }
                                                            >
                                                                Setujui
                                                            </Button>
                                                        )}
                                                    {budget.status ===
                                                        'approved' &&
                                                        can('approve') && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-9 font-medium"
                                                                onClick={() =>
                                                                    transitionBudget(
                                                                        budget,
                                                                        'closed',
                                                                    )
                                                                }
                                                            >
                                                                Tutup Anggaran
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <BudgetValue
                                                    label="Rencana"
                                                    value={
                                                        budget.planned_amount_idr
                                                    }
                                                />
                                                <BudgetValue
                                                    label="Realisasi"
                                                    value={
                                                        budget.actual_amount_idr
                                                    }
                                                />
                                                <BudgetValue
                                                    label="Sisa"
                                                    value={
                                                        budget.remaining_amount_idr
                                                    }
                                                    negative={
                                                        budget.remaining_amount_idr <
                                                        0
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted-foreground">
                                                    <span>
                                                        Realisasi Pemakaian
                                                    </span>
                                                    <span>
                                                        {
                                                            budget.utilization_percent
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <div
                                                    className="h-2.5 overflow-hidden rounded-full bg-muted"
                                                    role="progressbar"
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={Math.min(
                                                        100,
                                                        budget.utilization_percent,
                                                    )}
                                                >
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            budget.utilization_percent >
                                                            100
                                                                ? 'bg-rose-500'
                                                                : 'bg-primary'
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(100, budget.utilization_percent)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto rounded-xl border border-border/60">
                                                <Table>
                                                    <TableHeader className="bg-muted/40">
                                                        <TableRow>
                                                            <TableHead className="font-semibold">
                                                                Pos Biaya
                                                            </TableHead>
                                                            <TableHead className="text-right font-semibold">
                                                                Rencana
                                                            </TableHead>
                                                            <TableHead className="text-right font-semibold">
                                                                Terpakai
                                                            </TableHead>
                                                            <TableHead className="text-right font-semibold">
                                                                Sisa
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {budget.lines.map(
                                                            (line) => (
                                                                <TableRow
                                                                    key={
                                                                        line.id
                                                                    }
                                                                    className="hover:bg-muted/30"
                                                                >
                                                                    <TableCell className="font-medium text-foreground">
                                                                        {
                                                                            line.account_label
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-medium tabular-nums">
                                                                        {formatIdr(
                                                                            line.planned_amount_idr,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-medium tabular-nums">
                                                                        {formatIdr(
                                                                            line.actual_amount_idr,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        className={`text-right font-bold tabular-nums ${
                                                                            line.remaining_amount_idr <
                                                                            0
                                                                                ? 'text-rose-600'
                                                                                : 'text-foreground'
                                                                        }`}
                                                                    >
                                                                        {formatIdr(
                                                                            line.remaining_amount_idr,
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab: Piutang & Hutang */}
                    <TabsContent
                        value="aging"
                        className="grid gap-5 xl:grid-cols-2"
                    >
                        <AgingTable
                            title="Tagihan Jemaah Belum Lunas (Piutang)"
                            total={report.customer_receivables.total_idr}
                            rows={report.customer_receivables.rows}
                            kind="customer"
                        />
                        <AgingTable
                            title="Tagihan Vendor Belum Dibayar (Hutang)"
                            total={report.vendor_payables.total_idr}
                            rows={report.vendor_payables.rows}
                            kind="vendor"
                        />
                    </TabsContent>

                    {/* Tab: Persediaan */}
                    <TabsContent value="inventory">
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="flex items-center justify-between border-b p-4 sm:p-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Stok Perlengkapan & Koper
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Total Nilai:
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="text-sm font-bold tabular-nums"
                                    >
                                        {formatIdr(
                                            report.inventory.total_value_idr,
                                        )}
                                    </Badge>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Nama Barang
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Stok Fisik
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Direservasi
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Siap Pakai
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Harga Rata-rata
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Total Nilai
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.inventory.rows.length === 0 ? (
                                            <EmptyRow
                                                colSpan={6}
                                                text="Belum ada data barang perlengkapan."
                                            />
                                        ) : (
                                            report.inventory.rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <TableCell>
                                                        <div className="font-semibold text-foreground">
                                                            {row.item_name}
                                                        </div>
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {row.item_code}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {row.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {row.reserved_quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                        {row.available_quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {formatIdr(
                                                            row.average_unit_cost_idr,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                        {formatIdr(
                                                            row.value_idr,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Kontrol & Audit */}
                    <TabsContent value="controls" className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {can('create') &&
                                closedTransactionOptions.length > 0 && (
                                    <Button
                                        variant="outline"
                                        className="h-10 font-medium"
                                        onClick={() => setAdjustmentOpen(true)}
                                    >
                                        <BookOpenCheck className="mr-2 size-4 text-primary" />
                                        Buat Penyesuaian (Adjustment)
                                    </Button>
                                )}
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            <ControlTable title="Rekonsiliasi Bank">
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Rekening & Tanggal
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Saldo Bank
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.reconciliations.length === 0 ? (
                                        <EmptyRow
                                            colSpan={3}
                                            text="Belum ada catatan rekonsiliasi bank."
                                        />
                                    ) : (
                                        report.reconciliations.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <div className="font-semibold text-foreground">
                                                        {row.account_name}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            row.statement_date,
                                                        )}{' '}
                                                        ·{' '}
                                                        {row.reconciled_by_name ??
                                                            '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums">
                                                    {formatIdr(
                                                        row.statement_balance_idr,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant={
                                                            row.status ===
                                                            'matched'
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className="text-xs font-medium"
                                                    >
                                                        {row.status ===
                                                        'matched'
                                                            ? 'Cocok'
                                                            : formatIdr(
                                                                  row.difference_idr,
                                                              )}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </ControlTable>

                            <ControlTable title="Kontrol Periode Pembukuan">
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="font-semibold">
                                            Bulan
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Tindakan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.periods.length === 0 ? (
                                        <EmptyRow
                                            colSpan={3}
                                            text="Belum ada periode yang ditutup."
                                        />
                                    ) : (
                                        report.periods.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <div className="font-semibold text-foreground">
                                                        {formatMonth(
                                                            `${row.period_code}-01`,
                                                            { withYear: true },
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {row.events[0]
                                                            ?.reason ?? '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            row.status ===
                                                            'closed'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                        className="text-xs font-medium"
                                                    >
                                                        {row.status === 'closed'
                                                            ? 'Ditutup'
                                                            : 'Terbuka'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {row.status === 'closed' &&
                                                        Boolean(
                                                            auth.user
                                                                .is_super_admin,
                                                        ) && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 text-xs font-medium"
                                                                onClick={() =>
                                                                    setReopenPeriod(
                                                                        row,
                                                                    )
                                                                }
                                                            >
                                                                Buka Kembali
                                                            </Button>
                                                        )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </ControlTable>
                        </div>

                        {/* Audit Trail Table */}
                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="border-b p-4 sm:p-5">
                                <h2 className="text-base font-bold text-foreground">
                                    Riwayat Audit Transaksi
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table className="min-w-[900px]">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Nomor & Tanggal
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Jenis
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Keterangan
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Petugas
                                            </TableHead>
                                            <TableHead className="text-right font-semibold">
                                                Nominal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.audit_trail.length === 0 ? (
                                            <EmptyRow
                                                colSpan={5}
                                                text="Belum ada transaksi pada periode ini."
                                            />
                                        ) : (
                                            report.audit_trail.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <TableCell>
                                                        <div className="font-semibold text-foreground">
                                                            {
                                                                row.transaction_number
                                                            }
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(
                                                                row.transaction_date,
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs font-medium"
                                                        >
                                                            {transactionLabels[
                                                                row
                                                                    .transaction_type
                                                            ] ??
                                                                row.transaction_type}
                                                        </Badge>
                                                        {row.adjustment_of_number && (
                                                            <div className="mt-1 text-[11px] text-muted-foreground">
                                                                Asal:{' '}
                                                                {
                                                                    row.adjustment_of_number
                                                                }
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs text-sm whitespace-normal text-foreground">
                                                        {row.description ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {row.posted_by_name ??
                                                            '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                        {formatIdr(
                                                            row.amount_idr,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal: Unduh CSV */}
            <Dialog open={csvExportOpen} onOpenChange={setCsvExportOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Unduh Data CSV</DialogTitle>
                        <DialogDescription className="sr-only">
                            Pilih jenis data laporan CSV untuk diunduh.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Label
                            htmlFor="csv-report"
                            className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                            Pilih Jenis Laporan
                        </Label>
                        <Select value={csvReport} onValueChange={setCsvReport}>
                            <SelectTrigger
                                id="csv-report"
                                className="mt-2 h-11 w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {csvReportOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCsvExportOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={exportCsv}>
                            <Download className="mr-2 size-4" /> Unduh CSV
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Form Anggaran */}
            <Dialog
                open={budgetOpen}
                onOpenChange={(open) => {
                    setBudgetOpen(open);
                    if (!open) {
                        setEditingBudget(null);
                        budgetForm.clearErrors();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <form className="grid gap-5" onSubmit={submitBudget}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingBudget
                                    ? 'Edit Draft Anggaran'
                                    : 'Buat Rencana Anggaran Baru'}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Form pengisian alokasi anggaran biaya.
                            </DialogDescription>
                        </DialogHeader>
                        {budgetError && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {budgetError}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="budget-name">
                                    Nama Anggaran
                                </Label>
                                <Input
                                    id="budget-name"
                                    className="mt-1.5 h-11"
                                    required
                                    value={budgetForm.data.name}
                                    onChange={(event) =>
                                        budgetForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Operasional Trip Oktober 2026"
                                />
                                {budgetForm.errors.name && (
                                    <p
                                        className="mt-1 text-xs text-destructive"
                                        role="alert"
                                    >
                                        {budgetForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <SelectField
                                label="Kaitkan ke Trip (Opsional)"
                                value={budgetForm.data.package_id}
                                onChange={(value) =>
                                    budgetForm.setData(
                                        'package_id',
                                        value === 'none' ? '' : value,
                                    )
                                }
                                options={[
                                    { id: 0, label: 'Operasional Umum' },
                                    ...packageOptions,
                                ]}
                                emptyValue="none"
                                error={budgetForm.errors.package_id}
                            />
                            <div>
                                <Label htmlFor="budget-start">
                                    Mulai Periode
                                </Label>
                                <Input
                                    id="budget-start"
                                    className="mt-1.5 h-11"
                                    type="date"
                                    required
                                    max={
                                        budgetForm.data.period_end || undefined
                                    }
                                    value={budgetForm.data.period_start}
                                    onChange={(event) =>
                                        budgetForm.setData(
                                            'period_start',
                                            event.target.value,
                                        )
                                    }
                                />
                                {budgetForm.errors.period_start && (
                                    <p
                                        className="mt-1 text-xs text-destructive"
                                        role="alert"
                                    >
                                        {budgetForm.errors.period_start}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="budget-end">
                                    Sampai Periode
                                </Label>
                                <Input
                                    id="budget-end"
                                    className="mt-1.5 h-11"
                                    type="date"
                                    required
                                    min={
                                        budgetForm.data.period_start ||
                                        undefined
                                    }
                                    value={budgetForm.data.period_end}
                                    onChange={(event) =>
                                        budgetForm.setData(
                                            'period_end',
                                            event.target.value,
                                        )
                                    }
                                />
                                {budgetForm.errors.period_end && (
                                    <p
                                        className="mt-1 text-xs text-destructive"
                                        role="alert"
                                    >
                                        {budgetForm.errors.period_end}
                                    </p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="budget-notes">
                                    Catatan Anggaran
                                </Label>
                                <Textarea
                                    id="budget-notes"
                                    className="mt-1.5 min-h-20"
                                    value={budgetForm.data.notes}
                                    onChange={(event) =>
                                        budgetForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tujuan atau keterangan tambahan..."
                                />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground">
                                    Alokasi Pos Biaya
                                </h3>
                                <Button
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                    className="h-9 font-medium"
                                    onClick={() =>
                                        budgetForm.setData('lines', [
                                            ...budgetForm.data.lines,
                                            {
                                                financial_account_id: '',
                                                planned_amount_idr: '',
                                                notes: '',
                                            },
                                        ])
                                    }
                                >
                                    <Plus className="mr-1.5 size-3.5" /> Tambah
                                    Pos
                                </Button>
                            </div>

                            {budgetForm.data.lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="grid gap-3 rounded-xl border border-border/70 bg-card p-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.45fr)_40px]"
                                >
                                    <SelectField
                                        label={`Pos Biaya ${index + 1}`}
                                        value={line.financial_account_id}
                                        onChange={(value) => {
                                            const lines = [
                                                ...budgetForm.data.lines,
                                            ];
                                            lines[index] = {
                                                ...lines[index],
                                                financial_account_id: value,
                                            };
                                            budgetForm.setData('lines', lines);
                                        }}
                                        options={expenseAccountOptions}
                                        error={
                                            (
                                                budgetForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            )[
                                                `lines.${index}.financial_account_id`
                                            ]
                                        }
                                    />
                                    <div>
                                        <Label htmlFor={`budget-line-${index}`}>
                                            Nominal (IDR)
                                        </Label>
                                        <Input
                                            id={`budget-line-${index}`}
                                            className="mt-1.5 h-11"
                                            type="number"
                                            min="1"
                                            required
                                            value={line.planned_amount_idr}
                                            onChange={(event) => {
                                                const lines = [
                                                    ...budgetForm.data.lines,
                                                ];
                                                lines[index] = {
                                                    ...lines[index],
                                                    planned_amount_idr:
                                                        event.target.value,
                                                };
                                                budgetForm.setData(
                                                    'lines',
                                                    lines,
                                                );
                                            }}
                                        />
                                    </div>
                                    <Button
                                        aria-label={`Hapus alokasi ${index + 1}`}
                                        className="mt-7 size-10"
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={
                                            budgetForm.data.lines.length === 1
                                        }
                                        onClick={() =>
                                            budgetForm.setData(
                                                'lines',
                                                budgetForm.data.lines.filter(
                                                    (_, lineIndex) =>
                                                        lineIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            ))}

                            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                                <span className="text-sm font-semibold text-muted-foreground">
                                    Total Anggaran Direncanakan
                                </span>
                                <strong className="text-lg font-bold text-foreground tabular-nums">
                                    {formatIdr(
                                        budgetForm.data.lines.reduce(
                                            (total, line) =>
                                                total +
                                                Number(
                                                    line.planned_amount_idr ||
                                                        0,
                                                ),
                                            0,
                                        ),
                                    )}
                                </strong>
                            </div>
                        </div>

                        <DialogFooter className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setBudgetOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={
                                    budgetForm.processing ||
                                    !budgetForm.data.name.trim() ||
                                    !budgetForm.data.period_start ||
                                    !budgetForm.data.period_end ||
                                    budgetForm.data.period_start >
                                        budgetForm.data.period_end ||
                                    budgetForm.data.lines.some(
                                        (line) =>
                                            !line.financial_account_id ||
                                            Number(line.planned_amount_idr) <=
                                                0,
                                    )
                                }
                            >
                                {budgetForm.processing
                                    ? 'Menyimpan...'
                                    : editingBudget
                                      ? 'Simpan Perubahan'
                                      : 'Simpan Anggaran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Rekonsiliasi Bank */}
            <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
                <DialogContent>
                    <form onSubmit={submitReconciliation}>
                        <DialogHeader>
                            <DialogTitle>Rekonsiliasi Bank</DialogTitle>
                            <DialogDescription className="sr-only">
                                Cocokkan saldo rekening koran bank dengan
                                catatan buku.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            {reconciliationError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {reconciliationError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <SelectField
                                label="Pilih Rekening Bank"
                                value={
                                    reconciliationForm.data.financial_account_id
                                }
                                onChange={(value) =>
                                    reconciliationForm.setData(
                                        'financial_account_id',
                                        value,
                                    )
                                }
                                options={cashAccountOptions}
                                error={
                                    reconciliationForm.errors
                                        .financial_account_id
                                }
                            />
                            <div>
                                <Label htmlFor="statement-date">
                                    Tanggal Rekening Koran
                                </Label>
                                <Input
                                    id="statement-date"
                                    type="date"
                                    value={
                                        reconciliationForm.data.statement_date
                                    }
                                    max={today}
                                    onChange={(event) =>
                                        reconciliationForm.setData(
                                            'statement_date',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 h-11"
                                />
                            </div>
                            <div>
                                <Label htmlFor="statement-balance">
                                    Saldo Riil Menurut Bank (IDR)
                                </Label>
                                <Input
                                    id="statement-balance"
                                    type="number"
                                    value={
                                        reconciliationForm.data
                                            .statement_balance_idr
                                    }
                                    onChange={(event) =>
                                        reconciliationForm.setData(
                                            'statement_balance_idr',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 h-11"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reconcile-notes">
                                    Catatan Rekonsiliasi
                                </Label>
                                <Textarea
                                    id="reconcile-notes"
                                    value={reconciliationForm.data.notes}
                                    onChange={(event) =>
                                        reconciliationForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 min-h-20"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReconcileOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button disabled={reconciliationForm.processing}>
                                Simpan Rekonsiliasi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Tutup Periode */}
            <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
                <DialogContent>
                    <form onSubmit={submitPeriod}>
                        <DialogHeader>
                            <DialogTitle>Tutup Periode Pembukuan</DialogTitle>
                            <DialogDescription className="sr-only">
                                Penguncian data transaksi pada periode terpilih.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            {periodError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {periodError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div>
                                <Label htmlFor="period-code">
                                    Bulan Pembukuan
                                </Label>
                                <Input
                                    id="period-code"
                                    type="month"
                                    value={periodForm.data.period_code}
                                    onChange={(event) =>
                                        periodForm.setData(
                                            'period_code',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 h-11"
                                />
                            </div>
                            <div>
                                <Label htmlFor="period-reason">
                                    Alasan Penutupan
                                </Label>
                                <Textarea
                                    id="period-reason"
                                    value={periodForm.data.reason}
                                    onChange={(event) =>
                                        periodForm.setData(
                                            'reason',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 min-h-20"
                                    placeholder="Contoh: Rekonsiliasi bulanan telah disetujui."
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPeriodOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button disabled={periodForm.processing}>
                                Tutup Periode
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Buka Kembali Periode */}
            <Dialog
                open={Boolean(reopenPeriod)}
                onOpenChange={(open) => !open && setReopenPeriod(null)}
            >
                <DialogContent>
                    <form onSubmit={submitReopen}>
                        <DialogHeader>
                            <DialogTitle>Buka Kembali Periode</DialogTitle>
                            <DialogDescription className="sr-only">
                                Pembukaan kembali periode pembukuan untuk
                                koreksi data.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <Label htmlFor="reopen-reason">
                                Alasan Pembukaan Kembali
                            </Label>
                            <Textarea
                                id="reopen-reason"
                                value={reopenForm.data.reason}
                                onChange={(event) =>
                                    reopenForm.setData(
                                        'reason',
                                        event.target.value,
                                    )
                                }
                                className="mt-1.5 min-h-20"
                            />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReopenPeriod(null)}
                            >
                                Batal
                            </Button>
                            <Button disabled={reopenForm.processing}>
                                Buka Kembali
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Adjustment */}
            <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <form onSubmit={submitAdjustment}>
                        <DialogHeader>
                            <DialogTitle>
                                Penyesuaian (Adjustment) Periode
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Posting jurnal penyesuaian untuk transaksi pada
                                periode sebelumnya.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {adjustmentError && (
                                <Alert
                                    variant="destructive"
                                    className="sm:col-span-2"
                                >
                                    <AlertDescription>
                                        {adjustmentError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="sm:col-span-2">
                                <SelectField
                                    label="Transaksi Asal"
                                    value={adjustmentForm.data.adjustment_of_id}
                                    onChange={(value) =>
                                        adjustmentForm.setData(
                                            'adjustment_of_id',
                                            value,
                                        )
                                    }
                                    options={closedTransactionOptions}
                                    error={
                                        adjustmentForm.errors.adjustment_of_id
                                    }
                                />
                            </div>
                            <SelectField
                                label="Akun Masuk (Debit)"
                                value={adjustmentForm.data.debit_account_id}
                                onChange={(value) =>
                                    adjustmentForm.setData(
                                        'debit_account_id',
                                        value,
                                    )
                                }
                                options={accountOptions}
                                error={adjustmentForm.errors.debit_account_id}
                            />
                            <SelectField
                                label="Akun Keluar (Kredit)"
                                value={adjustmentForm.data.credit_account_id}
                                onChange={(value) =>
                                    adjustmentForm.setData(
                                        'credit_account_id',
                                        value,
                                    )
                                }
                                options={accountOptions}
                                error={adjustmentForm.errors.credit_account_id}
                            />
                            <div>
                                <Label htmlFor="adjustment-date">
                                    Tanggal Penyesuaian
                                </Label>
                                <Input
                                    id="adjustment-date"
                                    type="date"
                                    value={adjustmentForm.data.transaction_date}
                                    onChange={(event) =>
                                        adjustmentForm.setData(
                                            'transaction_date',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 h-11"
                                />
                            </div>
                            <div>
                                <Label htmlFor="adjustment-amount">
                                    Nominal (IDR)
                                </Label>
                                <Input
                                    id="adjustment-amount"
                                    type="number"
                                    min="1"
                                    value={adjustmentForm.data.amount_idr}
                                    onChange={(event) =>
                                        adjustmentForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 h-11"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="adjustment-reason">
                                    Alasan Penyesuaian
                                </Label>
                                <Textarea
                                    id="adjustment-reason"
                                    value={
                                        adjustmentForm.data.adjustment_reason
                                    }
                                    onChange={(event) =>
                                        adjustmentForm.setData(
                                            'adjustment_reason',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1.5 min-h-20"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAdjustmentOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button disabled={adjustmentForm.processing}>
                                Posting Penyesuaian
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}

function AgingTable({
    title,
    total,
    rows,
    kind,
}: {
    title: string;
    total: number;
    rows: AgingRow[];
    kind: 'customer' | 'vendor';
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b p-4 sm:p-5">
                <h2 className="text-base font-bold text-foreground">{title}</h2>
                <Badge
                    variant="secondary"
                    className="text-sm font-bold tabular-nums"
                >
                    {formatIdr(total)}
                </Badge>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="font-semibold">
                                {kind === 'customer'
                                    ? 'Kode / Nama Jemaah'
                                    : 'Vendor / Layanan'}
                            </TableHead>
                            <TableHead className="font-semibold">
                                Jatuh Tempo
                            </TableHead>
                            <TableHead className="font-semibold">
                                Status Umur
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                                Sisa Tagihan
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <EmptyRow
                                colSpan={4}
                                text={`Tidak ada data ${title.toLowerCase()} yang terbuka.`}
                            />
                        ) : (
                            rows.map((row, index) => (
                                <TableRow
                                    key={`${row.booking_code ?? row.invoice_number}-${index}`}
                                    className="hover:bg-muted/30"
                                >
                                    <TableCell>
                                        <div className="font-semibold text-foreground">
                                            {kind === 'customer'
                                                ? row.customer_name
                                                : (row.vendor_name ?? '-')}
                                        </div>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {kind === 'customer'
                                                ? row.booking_code
                                                : (row.invoice_number ??
                                                  row.package_code ??
                                                  '-')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatDate(row.due_date)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                row.aging_bucket ===
                                                'belum_jatuh_tempo'
                                                    ? 'outline'
                                                    : row.aging_bucket ===
                                                        '1_30'
                                                      ? 'secondary'
                                                      : 'destructive'
                                            }
                                            className="text-xs font-medium"
                                        >
                                            {agingLabels[row.aging_bucket] ??
                                                row.aging_bucket}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                                        {formatIdr(row.remaining_amount_idr)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function ControlTable({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="border-b p-4 sm:p-5">
                <h2 className="text-base font-bold text-foreground">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <Table>{children}</Table>
            </div>
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    error,
    emptyValue,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    error?: string;
    emptyValue?: string;
}) {
    const inputId = useId();
    const errorId = `${inputId}-error`;

    return (
        <div>
            <Label htmlFor={inputId}>{label}</Label>
            <Select value={value || emptyValue} onValueChange={onChange}>
                <SelectTrigger
                    id={inputId}
                    className="mt-1.5 h-11 w-full"
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={Boolean(error)}
                >
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem
                            key={option.id}
                            value={
                                option.id === 0 && emptyValue
                                    ? emptyValue
                                    : String(option.id)
                            }
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p
                    id={errorId}
                    className="mt-1 text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
