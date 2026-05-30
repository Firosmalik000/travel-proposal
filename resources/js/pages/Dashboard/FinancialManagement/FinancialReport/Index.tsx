import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';

type BookingTypeFilter = 'regular' | 'custom' | 'all';
type StatusFilter = 'pending' | 'registered' | 'cancelled' | 'all';

type Row = {
    booking_type: 'regular' | 'custom';
    currency: string;
    amount: number;
    pax: number;
    bookings: number;
};

type Props = {
    filters: {
        booking_type: BookingTypeFilter;
        status: StatusFilter;
    };
    rows: Row[];
};

type CurrencySummary = {
    currency: string;
    amount: number;
    pax: number;
    bookings: number;
};

function formatCurrency(amount: number, currency: string): string {
    if (!Number.isFinite(amount)) {
        return '-';
    }

    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency || 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    }
}

function buildQueryParams(
    bookingType: BookingTypeFilter,
    status: StatusFilter,
) {
    const params = new URLSearchParams();

    if (bookingType !== 'all') {
        params.set('booking_type', bookingType);
    }

    if (status !== 'all') {
        params.set('status', status);
    }

    return params;
}

export default function FinancialReportIndex({ filters, rows }: Props) {
    const { can } = usePermission('financial_report');
    const [bookingType, setBookingType] = useState<BookingTypeFilter>(
        filters.booking_type ?? 'all',
    );
    const [status, setStatus] = useState<StatusFilter>(filters.status ?? 'all');

    const summary = useMemo(() => {
        return rows.reduce(
            (acc, row) => {
                acc.pax += row.pax ?? 0;
                acc.bookings += row.bookings ?? 0;
                return acc;
            },
            { pax: 0, bookings: 0 },
        );
    }, [rows]);

    const currencySummaries = useMemo<CurrencySummary[]>(() => {
        const map = new Map<string, CurrencySummary>();

        rows.forEach((row) => {
            const currency = row.currency || 'IDR';
            const current = map.get(currency) ?? {
                currency,
                amount: 0,
                pax: 0,
                bookings: 0,
            };

            current.amount += row.amount ?? 0;
            current.pax += row.pax ?? 0;
            current.bookings += row.bookings ?? 0;

            map.set(currency, current);
        });

        return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
    }, [rows]);

    function applyFilters(
        nextBookingType: BookingTypeFilter,
        nextStatus: StatusFilter,
    ): void {
        const params = buildQueryParams(nextBookingType, nextStatus);

        router.get(
            '/admin/financial-management/financial-report',
            Object.fromEntries(params.entries()),
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    function downloadPdf(): void {
        const params = buildQueryParams(bookingType, status);
        const query = params.toString();
        const href =
            '/admin/financial-management/financial-report/pdf' +
            (query ? `?${query}` : '');

        window.open(href, '_blank');
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Financial Report',
                    href: '/admin/financial-management/financial-report',
                },
            ]}
        >
            <Head title="Financial Report" />

            <div className="space-y-4 p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Financial Report
                        </h1>
                        {can('export') && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={downloadPdf}
                                className="w-full sm:w-auto"
                            >
                                <Download className="mr-2 size-4" />
                                Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-3">
                            <Select
                                value={bookingType}
                                onValueChange={(value) =>
                                    setBookingType(value as BookingTypeFilter)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Tipe booking" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="regular">
                                        Regular
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        Custom
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setStatus(value as StatusFilter)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="registered">
                                        Registered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setBookingType('all');
                                setStatus('all');
                                applyFilters('all', 'all');
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={() => applyFilters(bookingType, status)}
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Total Bookings
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {summary.bookings}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Total Pax
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {summary.pax}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="space-y-1 p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Total Revenue
                            </p>
                            {currencySummaries.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    -
                                </div>
                            ) : (
                                currencySummaries.map((item) => (
                                    <div
                                        key={item.currency}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <div className="text-sm font-medium">
                                            {item.currency}
                                        </div>
                                        <div className="text-sm font-semibold whitespace-nowrap tabular-nums">
                                            {formatCurrency(
                                                item.amount,
                                                item.currency,
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[860px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead className="text-right">
                                        Bookings
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Pax
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Revenue
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada data.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow
                                            key={`${row.booking_type}-${row.currency}`}
                                        >
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        row.booking_type ===
                                                        'custom'
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {row.booking_type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.currency}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.bookings}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.pax}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap tabular-nums">
                                                {formatCurrency(
                                                    row.amount,
                                                    row.currency,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
