import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate } from '@/lib/date-format';
import { formatIdr } from '@/lib/number-format';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Search,
    Users,
    WalletCards,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type Receivable = {
    id: number;
    booking_code: string;
    customer_name: string;
    phone: string;
    email: string | null;
    package_code: string | null;
    package_name: string;
    due_date: string | null;
    currency: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_percentage: number;
    payment_status: 'unpaid' | 'partial' | 'paid';
    is_overdue: boolean;
    payments_count: number;
    last_payment_date: string | null;
    last_payment_account: string | null;
    payment_url: string;
};

type Props = {
    filters: {
        search: string;
        package_id: string;
        payment_status: string;
    };
    summary: {
        bookings: number;
        unpaid: number;
        partial: number;
        paid: number;
        overdue: number;
        total_amount_idr: number;
        paid_amount_idr: number;
        remaining_amount_idr: number;
        non_idr_bookings: number;
    };
    packageOptions: Array<{ id: number; code: string; name: string }>;
    receivables: {
        data: Receivable[];
        from: number | null;
        to: number | null;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
};

const paymentStatus = {
    unpaid: {
        label: 'Belum bayar',
        className:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
    },
    partial: {
        label: 'DP / cicilan',
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    },
    paid: {
        label: 'Lunas',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
};

function money(amount: number, currency: string): string {
    if (currency === 'IDR') {
        return formatIdr(amount);
    }

    return `${currency} ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function Index({
    filters,
    summary,
    packageOptions,
    receivables,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [packageId, setPackageId] = useState(filters.package_id || 'all');
    const [status, setStatus] = useState(filters.payment_status || 'all');

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            window.location.pathname,
            {
                search: search || undefined,
                package_id: packageId === 'all' ? undefined : packageId,
                payment_status: status === 'all' ? undefined : status,
            },
            { preserveState: true, replace: true },
        );
    }

    function resetFilters() {
        setSearch('');
        setPackageId('all');
        setStatus('all');
        router.get(window.location.pathname, {}, { replace: true });
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Keuangan',
                    href: '/admin/financial-management/overview',
                },
                { title: 'Piutang Jemaah', href: '#' },
            ]}
        >
            <Head title="Piutang Jemaah" />
            <div className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:p-5">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Piutang Jemaah
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pantau total tagihan, pembayaran, kekurangan, dan
                        rekening penerima untuk setiap booking.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={Users}
                        label="Booking terpantau"
                        value={`${summary.bookings} booking`}
                        detail={`${summary.partial} cicilan · ${summary.unpaid} belum bayar`}
                    />
                    <SummaryCard
                        icon={CircleDollarSign}
                        label="Total tagihan IDR"
                        value={formatIdr(summary.total_amount_idr)}
                        detail={`${summary.non_idr_bookings} booking mata uang lain`}
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Sudah dibayar IDR"
                        value={formatIdr(summary.paid_amount_idr)}
                        detail={`${summary.paid} booking lunas`}
                    />
                    <SummaryCard
                        icon={AlertTriangle}
                        label="Sisa piutang IDR"
                        value={formatIdr(summary.remaining_amount_idr)}
                        detail={`${summary.overdue} melewati tanggal keberangkatan`}
                        danger={summary.overdue > 0}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form
                            onSubmit={applyFilters}
                            className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_280px_220px_auto]"
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="pl-9"
                                    placeholder="Cari nama, kode booking, telepon…"
                                />
                            </div>
                            <Select
                                value={packageId}
                                onValueChange={setPackageId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua trip" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua trip
                                    </SelectItem>
                                    {packageOptions.map((option) => (
                                        <SelectItem
                                            key={option.id}
                                            value={String(option.id)}
                                        >
                                            {option.code} · {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="unpaid">
                                        Belum bayar
                                    </SelectItem>
                                    <SelectItem value="partial">
                                        DP / cicilan
                                    </SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                    <SelectItem value="overdue">
                                        Terlambat
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button type="submit">Terapkan</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <WalletCards className="size-5" /> Daftar piutang
                            per booking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {receivables.data.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <CheckCircle2 className="mx-auto size-10 text-muted-foreground/50" />
                                <p className="mt-3 font-medium">
                                    Tidak ada data yang sesuai
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ubah filter atau periksa kembali data
                                    booking terdaftar.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Jemaah & trip</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Tagihan
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Dibayar
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Kekurangan
                                            </TableHead>
                                            <TableHead>
                                                Pembayaran terakhir
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receivables.data.map((row) => {
                                            const statusInfo =
                                                paymentStatus[
                                                    row.payment_status
                                                ];

                                            return (
                                                <TableRow key={row.id}>
                                                    <TableCell className="min-w-64">
                                                        <p className="font-medium">
                                                            {row.customer_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {row.booking_code} ·{' '}
                                                            {row.package_code ||
                                                                row.package_name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Jatuh tempo{' '}
                                                            {row.due_date
                                                                ? formatDate(
                                                                      row.due_date,
                                                                  )
                                                                : 'belum ditentukan'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1.5">
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    statusInfo.className
                                                                }
                                                            >
                                                                {
                                                                    statusInfo.label
                                                                }
                                                            </Badge>
                                                            {row.is_overdue ? (
                                                                <p className="flex items-center gap-1 text-xs font-medium text-destructive">
                                                                    <Clock3 className="size-3" />{' '}
                                                                    Terlambat
                                                                </p>
                                                            ) : null}
                                                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full bg-primary"
                                                                    style={{
                                                                        width: `${row.payment_percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {money(
                                                            row.total_amount,
                                                            row.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-emerald-700 tabular-nums dark:text-emerald-300">
                                                        {money(
                                                            row.paid_amount,
                                                            row.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <p
                                                            className={
                                                                row.remaining_amount >
                                                                0
                                                                    ? 'font-semibold text-rose-700 dark:text-rose-300'
                                                                    : 'font-medium text-emerald-700 dark:text-emerald-300'
                                                            }
                                                        >
                                                            {row.remaining_amount >
                                                            0
                                                                ? `Kurang ${money(row.remaining_amount, row.currency)}`
                                                                : 'Lunas'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="min-w-52 text-sm">
                                                        {row.last_payment_date ? (
                                                            <>
                                                                <p>
                                                                    {formatDate(
                                                                        row.last_payment_date,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {row.last_payment_account ||
                                                                        'Rekening belum dipetakan'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        row.payments_count
                                                                    }{' '}
                                                                    pembayaran
                                                                    terverifikasi
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Belum ada
                                                                pembayaran
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    row.payment_url
                                                                }
                                                            >
                                                                {row.payment_status ===
                                                                'paid'
                                                                    ? 'Lihat riwayat'
                                                                    : 'Kelola pembayaran'}
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                Menampilkan {receivables.from ?? 0}–
                                {receivables.to ?? 0} dari {receivables.total}{' '}
                                booking
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {receivables.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        size="sm"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        disabled={!link.url}
                                        asChild={Boolean(link.url)}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    detail,
    danger = false,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    detail: string;
    danger?: boolean;
}) {
    return (
        <Card>
            <CardContent className="flex gap-3 pt-5">
                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${danger ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-primary/10 text-primary'}`}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 truncate text-lg font-semibold tabular-nums">
                        {value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {detail}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
