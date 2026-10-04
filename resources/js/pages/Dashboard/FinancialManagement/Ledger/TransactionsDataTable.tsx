import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { formatDate } from '@/lib/date-format';
import { formatIdr } from '@/lib/number-format';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    RotateCcw,
    Search,
    TrendingUp,
    X,
} from 'lucide-react';
import { useState } from 'react';

export type TransactionLine = {
    id: number;
    entry_type: 'debit' | 'credit';
    amount_original: string;
    amount_idr: number;
    description: string | null;
    account: {
        id: number;
        code: string;
        name: string;
    };
};

export type TransactionItem = {
    id: number;
    transaction_number: string;
    transaction_date: string;
    transaction_type: string;
    category_code: string | null;
    category_label: string | null;
    status: 'draft' | 'posted' | 'reversed';
    currency: string;
    exchange_rate: string;
    amount_original: string;
    amount_idr: number;
    description: string | null;
    source_type: string | null;
    reversal_of_id: number | null;
    reversal_number: string | null;
    can_reverse: boolean;
    posted_at: string | null;
    posted_by_name: string | null;
    lines: TransactionLine[];
};

export type LedgerFilterState = {
    date_from: string;
    date_to: string;
    account_id: string;
    transaction_type: string;
    category_code: string;
    status: string;
    search: string;
};

type Props = {
    transactions: {
        data: TransactionItem[];
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        per_page?: number;
        last_page?: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    activeAccounts: Array<{
        id: number;
        code: string;
        name: string;
    }>;
    filters: LedgerFilterState;
    onFilterChange: (filters: LedgerFilterState) => void;
    onApplyFilters: (filters?: LedgerFilterState) => void;
    onResetFilters: () => void;
    onDatePreset: (preset: 'today' | 'yesterday' | 'month') => void;
    processing: boolean;
    today: string;
    detailContext?: 'transactions' | 'accounting';
};

const transactionTypeMeta: Record<
    string,
    { label: string; variant: string; icon?: typeof TrendingUp }
> = {
    transfer: {
        label: 'Transfer Dana',
        variant:
            'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    },
    other_income: {
        label: 'Uang Masuk',
        variant:
            'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    booking_payment: {
        label: 'Pembayaran Booking',
        variant:
            'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    capital_contribution: {
        label: 'Setoran Modal',
        variant:
            'border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    },
    operating_expense: {
        label: 'Uang Keluar',
        variant:
            'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    customer_refund: {
        label: 'Refund Jemaah',
        variant:
            'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    },
    vendor_payment: {
        label: 'Pembayaran Vendor',
        variant:
            'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    },
    vendor_bill: {
        label: 'Tagihan Vendor',
        variant:
            'border-slate-500/30 bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
    },
    manual_journal: {
        label: 'Jurnal Manual',
        variant:
            'border-purple-500/30 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    },
    reversal: {
        label: 'Reversal',
        variant:
            'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    },
    opening_balance: {
        label: 'Saldo Awal',
        variant:
            'border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    },
};

export default function TransactionsDataTable({
    transactions,
    activeAccounts,
    filters,
    onFilterChange,
    onApplyFilters,
    onResetFilters,
    onDatePreset,
    processing,
    detailContext = 'transactions',
}: Props) {
    const [showMoreFilters, setShowMoreFilters] = useState(
        Boolean(
            filters.date_from ||
                filters.date_to ||
                filters.account_id ||
                filters.transaction_type ||
                filters.category_code,
        ),
    );

    const hasActiveFilters = Boolean(
        filters.search ||
            filters.date_from ||
            filters.date_to ||
            filters.account_id ||
            filters.transaction_type ||
            filters.category_code ||
            filters.status,
    );
    const detailHref = (transactionId: number): string =>
        `/admin/financial-management/transactions/${transactionId}?from=${detailContext}`;

    return (
        <div className="space-y-4">
            {/* Filter Toolbar Modern & Ringkas */}
            <Card className="border bg-card shadow-xs">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                        {/* Baris 1: Search & Quick Actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nomor transaksi atau deskripsi..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        onFilterChange({
                                            ...filters,
                                            search: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') onApplyFilters();
                                    }}
                                    className="pr-9 pl-9"
                                />
                                {filters.search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = {
                                                ...filters,
                                                search: '',
                                            };
                                            onFilterChange(updated);
                                            onApplyFilters(updated);
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                                <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2.5 text-xs font-normal"
                                        onClick={() => onDatePreset('today')}
                                    >
                                        Hari ini
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2.5 text-xs font-normal"
                                        onClick={() =>
                                            onDatePreset('yesterday')
                                        }
                                    >
                                        Kemarin
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2.5 text-xs font-normal"
                                        onClick={() => onDatePreset('month')}
                                    >
                                        Bulan ini
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        showMoreFilters
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className="h-8 gap-1.5 px-3 text-xs"
                                    onClick={() =>
                                        setShowMoreFilters(!showMoreFilters)
                                    }
                                >
                                    <Filter className="size-3.5" />
                                    <span>Filter</span>
                                    {(filters.account_id ||
                                        filters.transaction_type ||
                                        filters.category_code ||
                                        filters.date_from ||
                                        filters.date_to) && (
                                        <span className="size-1.5 rounded-full bg-primary" />
                                    )}
                                </Button>

                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(val) => {
                                        const updated = {
                                            ...filters,
                                            status: val === 'all' ? '' : val,
                                        };
                                        onFilterChange(updated);
                                        onApplyFilters(updated);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[130px] text-xs">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Status
                                        </SelectItem>
                                        <SelectItem value="posted">
                                            Diposting
                                        </SelectItem>
                                        <SelectItem value="reversed">
                                            Direversal
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasActiveFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={onResetFilters}
                                        title="Reset semua filter"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:ml-1">
                                            Reset
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Baris 2: Extended Filters (Toggleable/Collapsible) */}
                        {showMoreFilters && (
                            <div className="grid grid-cols-1 gap-2.5 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">
                                        Dari Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        className="h-8 text-xs"
                                        value={filters.date_from}
                                        max={filters.date_to || undefined}
                                        onChange={(e) =>
                                            onFilterChange({
                                                ...filters,
                                                date_from: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">
                                        Sampai Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        className="h-8 text-xs"
                                        value={filters.date_to}
                                        min={filters.date_from || undefined}
                                        onChange={(e) =>
                                            onFilterChange({
                                                ...filters,
                                                date_to: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">
                                        Akun Terkait
                                    </label>
                                    <Select
                                        value={filters.account_id || 'all'}
                                        onValueChange={(val) =>
                                            onFilterChange({
                                                ...filters,
                                                account_id:
                                                    val === 'all' ? '' : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua Akun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Akun
                                            </SelectItem>
                                            {activeAccounts.map((account) => (
                                                <SelectItem
                                                    key={account.id}
                                                    value={account.id.toString()}
                                                >
                                                    {account.code} ·{' '}
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">
                                        Jenis / Alur
                                    </label>
                                    <Select
                                        value={
                                            filters.transaction_type || 'all'
                                        }
                                        onValueChange={(val) =>
                                            onFilterChange({
                                                ...filters,
                                                transaction_type:
                                                    val === 'all' ? '' : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua Jenis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Jenis
                                            </SelectItem>
                                            {Object.entries(
                                                transactionTypeMeta,
                                            ).map(([val, meta]) => (
                                                <SelectItem
                                                    key={val}
                                                    value={val}
                                                >
                                                    {meta.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-end justify-end gap-2 sm:col-span-2 lg:col-span-4">
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 px-4 text-xs"
                                        disabled={
                                            processing ||
                                            Boolean(
                                                filters.date_from &&
                                                    filters.date_to &&
                                                    filters.date_from >
                                                        filters.date_to,
                                            )
                                        }
                                        onClick={() => onApplyFilters()}
                                    >
                                        {processing
                                            ? 'Memuat...'
                                            : 'Terapkan Filter'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* DataTable Transaksi Keuangan */}
            <Card className="overflow-hidden border bg-card shadow-xs">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-48 text-xs">
                                        Transaksi
                                    </TableHead>
                                    <TableHead className="w-36 text-xs">
                                        Jenis
                                    </TableHead>
                                    <TableHead className="text-xs">
                                        Akun / Keterangan
                                    </TableHead>
                                    <TableHead className="w-36 text-right text-xs">
                                        Nominal (IDR)
                                    </TableHead>
                                    <TableHead className="w-28 text-center text-xs">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-16 text-center text-xs">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-48 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <Calendar className="size-8 stroke-1 text-muted-foreground/60" />
                                                <p className="text-sm font-medium">
                                                    Tidak ada transaksi yang
                                                    ditemukan.
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-1 h-7 text-xs"
                                                        onClick={onResetFilters}
                                                    >
                                                        Reset Filter
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.data.map((transaction) => {
                                        const typeMeta = transactionTypeMeta[
                                            transaction.transaction_type
                                        ] ?? {
                                            label: transaction.transaction_type,
                                            variant: 'border-muted',
                                        };

                                        const isTransfer =
                                            transaction.transaction_type ===
                                            'transfer';
                                        const sourceLine = isTransfer
                                            ? transaction.lines.find(
                                                  (l) =>
                                                      l.entry_type === 'credit',
                                              )
                                            : null;
                                        const destLine = isTransfer
                                            ? transaction.lines.find(
                                                  (l) =>
                                                      l.entry_type === 'debit',
                                              )
                                            : null;

                                        const isPosted =
                                            transaction.status === 'posted';

                                        return (
                                            <TableRow
                                                key={transaction.id}
                                                className="group transition-colors hover:bg-muted/40"
                                            >
                                                <TableCell>
                                                    <Link
                                                        href={detailHref(
                                                            transaction.id,
                                                        )}
                                                        className="font-mono text-xs font-semibold text-foreground hover:text-primary hover:underline"
                                                    >
                                                        {
                                                            transaction.transaction_number
                                                        }
                                                    </Link>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatDate(
                                                            transaction.transaction_date,
                                                        )}
                                                    </p>
                                                </TableCell>

                                                {/* 4. Jenis / Alur */}
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            className={`w-fit px-2 py-0.5 text-[11px] font-medium ${typeMeta.variant}`}
                                                        >
                                                            {typeMeta.label}
                                                        </Badge>
                                                        {transaction.category_label &&
                                                            !isTransfer &&
                                                            transaction.category_label !==
                                                                transaction.transaction_type && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {
                                                                        transaction.category_label
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>

                                                {/* 5. Akun / Keterangan */}
                                                <TableCell className="max-w-[320px]">
                                                    {isTransfer &&
                                                    sourceLine &&
                                                    destLine ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                                <span className="truncate text-amber-700 dark:text-amber-400">
                                                                    {
                                                                        sourceLine
                                                                            .account
                                                                            .name
                                                                    }
                                                                </span>
                                                                <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                                                                <span className="truncate text-emerald-700 dark:text-emerald-400">
                                                                    {
                                                                        destLine
                                                                            .account
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                            {transaction.description && (
                                                                <p className="truncate text-[11px] text-muted-foreground">
                                                                    {
                                                                        transaction.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="truncate text-xs font-medium text-foreground">
                                                                {transaction
                                                                    .lines[0]
                                                                    ?.account
                                                                    .name ??
                                                                    '—'}
                                                            </div>
                                                            <p className="truncate text-[11px] text-muted-foreground">
                                                                {transaction.description ||
                                                                    '—'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* 6. Nominal (IDR) */}
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                                                            {formatIdr(
                                                                transaction.amount_idr,
                                                            )}
                                                        </span>
                                                        {transaction.currency !==
                                                            'IDR' && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {
                                                                    transaction.currency
                                                                }{' '}
                                                                {
                                                                    transaction.amount_original
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* 7. Status */}
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${
                                                            isPosted
                                                                ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`size-1.5 rounded-full ${
                                                                isPosted
                                                                    ? 'bg-emerald-600 dark:bg-emerald-400'
                                                                    : 'bg-rose-600 dark:bg-rose-400'
                                                            }`}
                                                        />
                                                        {isPosted
                                                            ? 'Diposting'
                                                            : 'Direversal'}
                                                    </Badge>
                                                </TableCell>

                                                {/* 8. Aksi (Mata) */}
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="size-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                        title="Lihat detail transaksi"
                                                    >
                                                        <Link
                                                            href={detailHref(
                                                                transaction.id,
                                                            )}
                                                        >
                                                            <Eye className="size-4" />
                                                            <span className="sr-only">
                                                                Lihat detail
                                                            </span>
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Bar */}
                    {(transactions.total ?? transactions.data.length) > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan{' '}
                                <span className="font-medium text-foreground">
                                    {transactions.from ?? 1}
                                </span>{' '}
                                sampai{' '}
                                <span className="font-medium text-foreground">
                                    {transactions.to ??
                                        transactions.data.length}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-foreground">
                                    {transactions.total ??
                                        transactions.data.length}
                                </span>{' '}
                                transaksi
                            </p>

                            <div className="flex flex-wrap items-center gap-1">
                                {transactions.links.map((link, idx) => {
                                    const isPrev =
                                        link.label.includes('Previous') ||
                                        link.label.includes('&laquo;');
                                    const isNext =
                                        link.label.includes('Next') ||
                                        link.label.includes('&raquo;');

                                    return (
                                        <Button
                                            key={idx}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className={`h-7 px-2.5 text-xs ${
                                                !link.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }`}
                                            asChild={Boolean(link.url)}
                                            disabled={!link.url}
                                        >
                                            {link.url ? (
                                                <Link
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                >
                                                    {isPrev ? (
                                                        <ChevronLeft className="size-3.5" />
                                                    ) : isNext ? (
                                                        <ChevronRight className="size-3.5" />
                                                    ) : (
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )}
                                                </Link>
                                            ) : (
                                                <span>
                                                    {isPrev ? (
                                                        <ChevronLeft className="size-3.5" />
                                                    ) : isNext ? (
                                                        <ChevronRight className="size-3.5" />
                                                    ) : (
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
