import { Badge } from '@/components/ui/badge';
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
import { useDebounce } from '@/hooks/use-debounce';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { CalendarDays, CircleDollarSign, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type CustomBookingRow = {
    id: number;
    booking_code: string;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    passenger_count: number;
    custom_departure_date: string | null;
    custom_return_date: string | null;
    revenue: { currency: string; amount: number | null };
    notes: string | null;
    status: 'pending' | 'registered' | 'cancelled' | string;
    created_at: string | null;
};

type PaginatedCustomBookings = {
    data: CustomBookingRow[];
    links: PaginationLink[];
    total: number;
    current_page?: number;
    last_page?: number;
};

type RevenueSummary = {
    by_currency: Array<{
        currency: string;
        amount: number;
        pax: number;
        bookings: number;
    }>;
};

function statusBadgeTone(status: string): string {
    if (status === 'registered') {
        return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'cancelled') {
        return 'bg-rose-100 text-rose-700';
    }

    return 'bg-amber-100 text-amber-700';
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(value));
}

function formatCurrency(amount: number | null, currency: string): string {
    if (amount === null || !Number.isFinite(amount)) {
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

export default function CustomBookingsIndex({
    bookings,
    filters,
    revenue,
}: {
    bookings: PaginatedCustomBookings;
    filters: { search: string; status: string };
    revenue: RevenueSummary;
}) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const debouncedSearch = useDebounce(search, 350);

    useEffect(() => {
        router.get(
            '/admin/booking-management/custom-bookings',
            {
                search: debouncedSearch,
                status: status === 'all' ? '' : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, [debouncedSearch, status]);

    const bookingItems = useMemo(() => bookings.data ?? [], [bookings.data]);
    const primaryRevenue = revenue?.by_currency?.[0] ?? null;

    const stats = [
        {
            label: 'Total Custom Booking',
            value: bookings.total,
            icon: CircleDollarSign,
        },
        {
            label: 'Revenue',
            value: primaryRevenue
                ? formatCurrency(primaryRevenue.amount, primaryRevenue.currency)
                : formatCurrency(0, 'IDR'),
            icon: CircleDollarSign,
        },
        {
            label: 'Total Pax',
            value: bookingItems.reduce(
                (total, booking) => total + booking.passenger_count,
                0,
            ),
            icon: Users,
        },
        {
            label: 'Jadwal Di-set',
            value: bookingItems.filter(
                (booking) => booking.custom_departure_date !== null,
            ).length,
            icon: CalendarDays,
        },
    ];

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Booking',
                    href: '/admin/booking-management/listing',
                },
                {
                    title: 'Custom Bookings',
                    href: '/admin/booking-management/custom-bookings',
                },
            ]}
        >
            <Head title="Custom Bookings" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Custom Bookings
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Booking hasil approval custom request. List dan revenue
                        terpisah dari booking reguler.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-border bg-card p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="text-xl font-semibold text-foreground">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted p-2 text-muted-foreground">
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari kode, nama, phone, kotaâ€¦"
                            className="pl-9"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label className="sr-only">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua status
                                </SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
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

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead>Jadwal</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookingItems.length ? (
                                bookingItems.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    {booking.booking_code}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.created_at
                                                        ? new Intl.DateTimeFormat(
                                                              'id-ID',
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                                  timeStyle:
                                                                      'short',
                                                              },
                                                          ).format(
                                                              new Date(
                                                                  booking.created_at,
                                                              ),
                                                          )
                                                        : '-'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    {booking.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.phone} â€¢{' '}
                                                    {booking.origin_city}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm text-foreground">
                                                    {formatDate(
                                                        booking.custom_departure_date,
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(
                                                        booking.custom_return_date,
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    {formatCurrency(
                                                        booking.revenue.amount,
                                                        booking.revenue
                                                            .currency,
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.passenger_count}{' '}
                                                    pax
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={statusBadgeTone(
                                                    booking.status,
                                                )}
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada custom booking.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
