import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
                    label: 'Financial Management',
                    href: '/admin/financial-management',
                },
                {
                    label: 'Financial Report',
                    href: '/admin/financial-management/financial-report',
                },
            ]}
        >
            <Head title="Financial Report" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Financial Report
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan revenue booking berdasarkan currency.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                        <div className="grid w-full gap-2 sm:grid-cols-2">
                            <Select
                                value={bookingType}
                                onValueChange={(value) => {
                                    const nextValue =
                                        value as BookingTypeFilter;
                                    setBookingType(nextValue);
                                    applyFilters(nextValue, status);
                                }}
                            >
                                <SelectTrigger>
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

                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    const nextValue = value as StatusFilter;
                                    setStatus(nextValue);
                                    applyFilters(bookingType, nextValue);
                                }}
                            >
                                <SelectTrigger>
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

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {summary.bookings}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Total Pax</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {summary.pax}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
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

                <Card>
                    <CardHeader>
                        <CardTitle>By Currency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rows.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                                Belum ada data.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
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
                                        {rows.map((row) => (
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
