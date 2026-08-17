import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useDebounce } from '@/hooks/use-debounce';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, RotateCcw, Search, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
    CustomerDataFilters,
    CustomerDataSummary,
    PackageGroup,
} from './types';

type Props = {
    filters: CustomerDataFilters;
    summary: CustomerDataSummary;
    packages: PackageGroup[];
};

export default function BookingCustomerDataIndex({
    filters,
    summary,
    packages,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'registered');
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (
            debouncedSearch === (filters.search ?? '') &&
            status === (filters.status || 'registered')
        ) {
            return;
        }

        router.get(
            '/admin/booking-management/customer-data',
            {
                search: debouncedSearch || undefined,
                status,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    }, [debouncedSearch, filters.search, filters.status, status]);

    const resetFilters = (): void => {
        setSearch('');
        setStatus('registered');
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Booking Management',
                    href: '/admin/booking-management/listing',
                },
                {
                    title: 'Data Customer',
                    href: '/admin/booking-management/customer-data',
                },
            ]}
        >
            <Head title="Data Customer" />

            <div className="space-y-4 p-3 md:p-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            <UsersRound className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Data Customer
                        </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="secondary">
                            {summary.packages} Package
                        </Badge>
                        <Badge variant="secondary">
                            {summary.bookings} Booking
                        </Badge>
                        <Badge variant="secondary">
                            {summary.customers} Pax
                        </Badge>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                            {summary.participants} Terisi
                        </Badge>
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                            {summary.remaining} Belum Terisi
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto] md:p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari data customer"
                            className="pl-9"
                            aria-label="Cari data customer"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger aria-label="Filter status booking">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="registered">
                                Registered
                            </SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="all">Semua Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                        disabled={search === '' && status === 'registered'}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package</TableHead>
                                    <TableHead className="text-center">
                                        Jadwal
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Booking
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Pax
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Terisi
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Belum Terisi
                                    </TableHead>
                                    <TableHead className="w-24 text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {packages.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            Data tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    packages.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium">
                                                        {pkg.name}
                                                    </div>
                                                    {pkg.code ? (
                                                        <Badge variant="outline">
                                                            {pkg.code}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {pkg.schedules.length}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {pkg.booking_count}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {pkg.customers}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                                                {pkg.participants}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-amber-600 dark:text-amber-400">
                                                {pkg.remaining}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/admin/booking-management/customer-data/${pkg.id}?status=${status}`}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Lihat
                                                    </Link>
                                                </Button>
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
