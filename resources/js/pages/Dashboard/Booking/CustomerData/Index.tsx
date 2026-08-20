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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleUserRound,
    Clock3,
    Eye,
    LoaderCircle,
    Mail,
    Package2,
    RotateCcw,
    Search,
    UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
    CustomerBooking,
    CustomerDataFilters,
    CustomerDataSummary,
    PackageGroup,
} from './types';

type Props = {
    filters: CustomerDataFilters;
    summary: CustomerDataSummary;
    packages: PackageGroup[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function BookingRow({
    booking,
    status,
}: {
    booking: CustomerBooking;
    status: string;
}) {
    const isComplete = booking.is_complete;

    return (
        <Card className="border-border/60 py-0 shadow-none">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        <CircleUserRound className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                                {booking.booking_code}
                            </span>
                            <Badge
                                variant={isComplete ? 'default' : 'secondary'}
                                className={
                                    isComplete
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                        : ''
                                }
                            >
                                {isComplete ? (
                                    <CheckCircle2 className="size-3" />
                                ) : (
                                    <Clock3 className="size-3" />
                                )}
                                {isComplete
                                    ? 'Lengkap'
                                    : `${booking.outstanding_count} belum lengkap`}
                            </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium">
                            {booking.full_name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{booking.phone}</span>
                            <span>{booking.origin_city || '-'}</span>
                            <span>
                                {booking.participants_count}/
                                {booking.passenger_count} peserta diisi
                            </span>
                        </div>
                    </div>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link
                        href={`/admin/booking-management/customer-data/${booking.id}?status=${status}`}
                    >
                        Detail Peserta
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function BookingCustomerDataIndex({
    filters,
    summary,
    packages,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status || 'registered');
    const [selectedPackage, setSelectedPackage] = useState<PackageGroup | null>(
        null,
    );
    const [broadcastingPackageId, setBroadcastingPackageId] = useState<
        number | null
    >(null);
    const { can } = usePermission('booking_customer_data');
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
            { search: debouncedSearch || undefined, status },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }, [debouncedSearch, filters.search, filters.status, status]);

    const resetFilters = (): void => {
        setSearch('');
        setStatus('registered');
    };

    const sendReminders = (pkg: PackageGroup): void => {
        if (
            !window.confirm(
                `Kirim reminder ke booking yang datanya belum lengkap pada ${pkg.name}?`,
            )
        ) {
            return;
        }

        router.post(
            `/admin/booking-management/customer-data/packages/${pkg.id}/reminders`,
            { status },
            {
                preserveScroll: true,
                onStart: () => setBroadcastingPackageId(pkg.id),
                onFinish: () => setBroadcastingPackageId(null),
            },
        );
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Booking Management',
                    href: '/admin/booking-management/listing',
                },
                {
                    title: 'Data Peserta',
                    href: '/admin/booking-management/customer-data',
                },
            ]}
        >
            <Head title="Data Peserta" />

            <div className="space-y-4 p-3 md:p-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            <UsersRound className="size-5" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Data Peserta
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
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari package, booking, atau pemesan"
                            className="pl-9"
                            aria-label="Cari data peserta"
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
                        <RotateCcw className="size-4" /> Reset
                    </Button>
                </div>

                <div className="grid gap-3 md:hidden">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="border-border/60">
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Package2 className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">
                                            {pkg.name}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {pkg.code ? (
                                                <Badge variant="outline">
                                                    {pkg.code}
                                                </Badge>
                                            ) : null}
                                            <Badge variant="secondary">
                                                {pkg.booking_count} Booking
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="rounded-xl bg-muted/50 p-2">
                                        <strong className="block text-sm">
                                            {pkg.customers}
                                        </strong>
                                        Pax
                                    </div>
                                    <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
                                        <strong className="block text-sm">
                                            {pkg.participants}
                                        </strong>
                                        Terisi
                                    </div>
                                    <div className="rounded-xl bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300">
                                        <strong className="block text-sm">
                                            {pkg.remaining}
                                        </strong>
                                        Belum
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedPackage(pkg)}
                                >
                                    <Eye className="size-4" /> Lihat Booking
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {packages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                            Data package tidak ditemukan.
                        </div>
                    ) : null}
                </div>

                <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:block">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Jadwal</TableHead>
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
                                        Belum
                                    </TableHead>
                                    <TableHead className="w-36 text-right">
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
                                            Data package tidak ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    packages.map((pkg) => {
                                        const schedule = pkg.schedules[0];
                                        return (
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
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CalendarDays className="size-4 text-muted-foreground" />
                                                        {formatDate(
                                                            schedule?.departure_date ??
                                                                null,
                                                        )}
                                                    </div>
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
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedPackage(
                                                                pkg,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="size-4" />{' '}
                                                        Booking
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Sheet
                open={selectedPackage !== null}
                onOpenChange={(open) => !open && setSelectedPackage(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    {selectedPackage ? (
                        <div className="space-y-5 p-1">
                            <SheetHeader>
                                <SheetTitle className="flex flex-wrap items-center gap-2 pr-8">
                                    <Package2 className="size-5" />{' '}
                                    {selectedPackage.name}
                                    {selectedPackage.code ? (
                                        <Badge variant="outline">
                                            {selectedPackage.code}
                                        </Badge>
                                    ) : null}
                                </SheetTitle>
                            </SheetHeader>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <strong className="block text-base">
                                        {selectedPackage.booking_count}
                                    </strong>
                                    Booking
                                </div>
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                                    <strong className="block text-base">
                                        {selectedPackage.participants}
                                    </strong>
                                    Terisi
                                </div>
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                                    <strong className="block text-base">
                                        {selectedPackage.remaining}
                                    </strong>
                                    Belum
                                </div>
                            </div>
                            {can('edit') ? (
                                <Button
                                    type="button"
                                    className="w-full"
                                    disabled={
                                        selectedPackage.incomplete_booking_count ===
                                            0 ||
                                        broadcastingPackageId ===
                                            selectedPackage.id
                                    }
                                    onClick={() =>
                                        sendReminders(selectedPackage)
                                    }
                                >
                                    {broadcastingPackageId ===
                                    selectedPackage.id ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <Mail className="size-4" />
                                    )}
                                    Broadcast Reminder (
                                    {selectedPackage.incomplete_booking_count})
                                </Button>
                            ) : null}
                            <div className="grid gap-3">
                                {selectedPackage.bookings.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                        status={status}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
