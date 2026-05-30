import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    SheetFooter as DrawerFooter,
    SheetHeader as DrawerHeader,
    SheetTitle as DrawerTitle,
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CircleDollarSign,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Registration = {
    id: number;
    booking_type: string;
    booking_code: string;
    travel_package_id: number;
    departure_schedule_id: number | null;
    custom_unit_price?: number | null;
    custom_total_amount?: number | null;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    passenger_count: number;
    revenue?: {
        currency: string;
        amount: number;
    };
    notes: string | null;
    status: string;
    created_at: string | null;
    has_review?: boolean;
    review_url?: string | null;
    travel_package: {
        code: string | null;
        slug: string | null;
        name: Record<string, string> | null;
        package_type: string | null;
    };
    departure_schedule: {
        departure_date: string | null;
        return_date: string | null;
        departure_city: string | null;
        status: string | null;
    };
};

type TravelPackageOption = {
    id: number;
    code: string | null;
    name: Record<string, string> | null;
    package_type: string | null;
};

type ScheduleOption = {
    id: number;
    travel_package_id: number;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    status: string | null;
    seats_available: number | null;
};

type BookingFormData = {
    travel_package_id: string;
    departure_schedule_id: string;
    custom_departure_date: string;
    custom_return_date: string;
    custom_unit_price: string;
    full_name: string;
    phone: string;
    email: string;
    origin_city: string;
    passenger_count: string;
    notes: string;
    status: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedRegistrations = {
    data: Registration[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Props = {
    registrations: PaginatedRegistrations;
    packages: TravelPackageOption[];
    schedules: ScheduleOption[];
    revenue: {
        by_currency: Array<{
            currency: string;
            amount: number;
            pax: number;
            bookings: number;
        }>;
    };
    filters: {
        search: string;
        status: string;
        travel_package_id?: number | null;
        booking_type?: string | null;
    };
};

const defaultFormData: BookingFormData = {
    travel_package_id: '',
    departure_schedule_id: '',
    custom_departure_date: '',
    custom_return_date: '',
    custom_unit_price: '',
    full_name: '',
    phone: '',
    email: '',
    origin_city: '',
    passenger_count: '1',
    notes: '',
    status: 'registered',
};

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(`${value}T00:00:00`));
}

function statusBadgeVariant(
    status: string,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (status === 'registered') {
        return 'default';
    }

    if (status === 'cancelled') {
        return 'destructive';
    }

    return 'secondary';
}

function packageDisplayName(
    travelPackage: TravelPackageOption | Registration['travel_package'],
    locale: string,
): string {
    if (typeof travelPackage.name === 'string') {
        return travelPackage.name || '-';
    }

    return travelPackage.name?.[locale] ?? travelPackage.name?.id ?? '-';
}

function scheduleLabel(schedule: ScheduleOption): string {
    return `${formatDate(schedule.departure_date)} - ${schedule.departure_city ?? '-'} - ${schedule.seats_available ?? 0} seat`;
}

export default function BookingListingIndex({
    registrations,
    packages,
    schedules,
    revenue,
    filters,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const { can } = usePermission('booking_listing');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canExport = can('export');
    const registrationItems = Array.isArray(registrations?.data)
        ? registrations.data
        : [];
    const packageOptions = Array.isArray(packages) ? packages : [];
    const scheduleOptions = Array.isArray(schedules) ? schedules : [];
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || 'registered',
    );
    const [bookingTypeFilter, setBookingTypeFilter] = useState(
        filters.booking_type || 'regular',
    );
    const [packageFilter, setPackageFilter] = useState(
        filters.travel_package_id ? String(filters.travel_package_id) : 'all',
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRegistration, setEditingRegistration] =
        useState<Registration | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
    const debouncedSearch = useDebounce(search, 300);
    const isEditingCustomBooking =
        editingRegistration?.booking_type === 'custom';

    const form = useForm<BookingFormData>(defaultFormData);
    const computedCustomTotal =
        isEditingCustomBooking && form.data.custom_unit_price
            ? (Number(form.data.custom_unit_price) || 0) *
              (Number(form.data.passenger_count) || 0)
            : 0;

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

    const filteredSchedules = useMemo(() => {
        if (!form.data.travel_package_id) {
            return scheduleOptions;
        }

        const travelPackageId = Number(form.data.travel_package_id);

        return scheduleOptions.filter(
            (schedule) => schedule.travel_package_id === travelPackageId,
        );
    }, [form.data.travel_package_id, scheduleOptions]);

    const primaryRevenue = revenue?.by_currency?.[0] ?? null;

    const stats = [
        {
            label: 'Total Booking',
            value: registrations.total,
            icon: CircleDollarSign,
        },
        {
            label: 'Revenue (Estimasi)',
            value: primaryRevenue
                ? formatCurrency(primaryRevenue.amount, primaryRevenue.currency)
                : formatCurrency(0, 'IDR'),
            icon: CircleDollarSign,
        },
        {
            label: 'Registered',
            value: registrationItems.filter(
                (registration) => registration.status === 'registered',
            ).length,
            icon: CalendarDays,
        },
        {
            label: 'Total Pax',
            value: registrationItems.reduce(
                (total, registration) => total + registration.passenger_count,
                0,
            ),
            icon: Users,
        },
    ];

    function openCreateDialog(): void {
        if (!canCreate) {
            return;
        }

        setEditingRegistration(null);
        form.reset();
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function openEditDialog(registration: Registration): void {
        if (!canEdit) {
            return;
        }

        setEditingRegistration(registration);

        form.setData({
            travel_package_id: String(registration.travel_package_id),
            departure_schedule_id: registration.departure_schedule_id
                ? String(registration.departure_schedule_id)
                : '',
            custom_departure_date:
                registration.booking_type === 'custom'
                    ? (registration.departure_schedule.departure_date ?? '')
                    : '',
            custom_return_date:
                registration.booking_type === 'custom'
                    ? (registration.departure_schedule.return_date ?? '')
                    : '',
            custom_unit_price:
                registration.booking_type === 'custom' &&
                typeof registration.custom_unit_price === 'number'
                    ? String(registration.custom_unit_price)
                    : '',
            full_name: registration.full_name,
            phone: registration.phone,
            email: registration.email ?? '',
            origin_city: registration.origin_city,
            passenger_count: String(registration.passenger_count),
            notes: registration.notes ?? '',
            status: registration.status,
        });
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function applyFilters(
        nextSearch: string,
        nextStatus: string,
        nextBookingType: string,
        nextPackageId: string,
    ): void {
        router.get(
            '/admin/booking-management/listing',
            {
                search: nextSearch || undefined,
                status: nextStatus || 'registered',
                booking_type:
                    nextBookingType === 'regular' ? undefined : nextBookingType,
                travel_package_id:
                    nextPackageId === 'all' ? undefined : nextPackageId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function openFilteredPdf(): void {
        if (!canExport) {
            return;
        }

        const params = new URLSearchParams();

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        }

        if (statusFilter && statusFilter !== 'registered') {
            params.set('status', statusFilter);
        }

        if (packageFilter && packageFilter !== 'all') {
            params.set('travel_package_id', packageFilter);
        }

        if (bookingTypeFilter && bookingTypeFilter !== 'regular') {
            params.set('booking_type', bookingTypeFilter);
        }

        const url = `/admin/booking-management/listing.pdf${
            params.toString() ? `?${params.toString()}` : ''
        }`;

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    useEffect(() => {
        if (
            debouncedSearch === (filters.search ?? '') &&
            statusFilter === (filters.status || 'registered') &&
            bookingTypeFilter === (filters.booking_type || 'regular') &&
            packageFilter ===
                (filters.travel_package_id
                    ? String(filters.travel_package_id)
                    : 'all')
        ) {
            return;
        }

        applyFilters(
            debouncedSearch,
            statusFilter,
            bookingTypeFilter,
            packageFilter,
        );
    }, [
        debouncedSearch,
        filters.search,
        filters.status,
        filters.travel_package_id,
        filters.booking_type,
        bookingTypeFilter,
        packageFilter,
        statusFilter,
    ]);

    function handlePackageChange(value: string): void {
        form.setData((data) => ({
            ...data,
            travel_package_id: value,
            departure_schedule_id: '',
        }));
    }

    function handleSubmit(event: React.FormEvent): void {
        event.preventDefault();

        if (editingRegistration) {
            form.put(
                `/admin/booking-management/listing/${editingRegistration.id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setEditingRegistration(null);
                        form.reset();
                    },
                },
            );

            return;
        }

        form.post('/admin/booking-management/listing', {
            preserveScroll: true,
            onSuccess: () => {
                setIsDialogOpen(false);
                form.reset();
            },
        });
    }

    function handleDelete(): void {
        if (!canDelete) {
            return;
        }

        if (!deleteTarget) {
            return;
        }

        form.delete(`/admin/booking-management/listing/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
            },
        });
    }

    function openParticipantsPdf(registration: Registration): void {
        if (!canExport) {
            return;
        }

        window.open(
            `/admin/booking-management/listing/${registration.id}/participants.pdf`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function openInvoicePdf(registration: Registration): void {
        if (!canExport) {
            return;
        }

        window.open(
            `/admin/booking-management/listing/${registration.id}/invoice.pdf`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function openReviewUrl(registration: Registration): void {
        if (!registration.review_url) {
            return;
        }

        window.open(registration.review_url, '_blank', 'noopener,noreferrer');
    }

    function markAsCancelled(registration: Registration): void {
        if (!canEdit) {
            return;
        }

        router.put(
            `/admin/booking-management/listing/${registration.id}`,
            {
                travel_package_id: String(registration.travel_package_id),
                departure_schedule_id: registration.departure_schedule_id
                    ? String(registration.departure_schedule_id)
                    : '',
                full_name: registration.full_name,
                phone: registration.phone,
                email: registration.email ?? '',
                origin_city: registration.origin_city,
                passenger_count: String(registration.passenger_count),
                notes: registration.notes ?? '',
                status: 'cancelled',
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Booking Listing',
                    href: '/admin/booking-management/listing',
                },
            ]}
        >
            <Head title="Booking Listing" />

            <div className="min-w-0 space-y-4 overflow-x-hidden p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Booking Listing
                        </h1>
                        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                            {canExport ? (
                                <Button
                                    variant="outline"
                                    onClick={openFilteredPdf}
                                    className="w-full gap-2 md:w-auto"
                                >
                                    <FileText className="h-4 w-4" />
                                    Export PDF
                                </Button>
                            ) : null}
                            {canCreate ? (
                                <Button
                                    onClick={openCreateDialog}
                                    className="w-full md:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Booking
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-border/60 shadow-sm"
                        >
                            <CardContent className="flex items-center justify-between p-3.5">
                                <div>
                                    <p className="text-xs text-muted-foreground md:text-sm">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-xl font-semibold md:text-2xl">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-full bg-muted p-2.5">
                                    <stat.icon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="min-w-0 border-border/60 shadow-sm">
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>Data Booking Jamaah</CardTitle>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                            <div className="relative min-w-0">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari kode, nama, paket, kota..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-[140px_180px_140px]">
                                <div className="min-w-0">
                                    <Select
                                        value={bookingTypeFilter}
                                        onValueChange={(value) => {
                                            setBookingTypeFilter(value);

                                            if (value === 'custom') {
                                                setPackageFilter('all');
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="regular">
                                                Paket
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                Custom
                                            </SelectItem>
                                            <SelectItem value="all">
                                                Semua
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0">
                                    <Select
                                        value={packageFilter}
                                        disabled={
                                            bookingTypeFilter === 'custom'
                                        }
                                        onValueChange={(value) => {
                                            setPackageFilter(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Paket" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua paket
                                            </SelectItem>
                                            {packageOptions.map(
                                                (travelPackage) => (
                                                    <SelectItem
                                                        key={travelPackage.id}
                                                        value={String(
                                                            travelPackage.id,
                                                        )}
                                                    >
                                                        {packageDisplayName(
                                                            travelPackage,
                                                            locale,
                                                        )}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => {
                                            setStatusFilter(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua status
                                            </SelectItem>
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
                        </div>
                    </CardHeader>
                    <CardContent className="min-w-0">
                        {registrationItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-6 py-12 text-center">
                                <p className="font-medium text-foreground">
                                    {registrations.total === 0
                                        ? 'Belum ada data booking.'
                                        : 'Data booking yang dicari tidak ditemukan.'}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-[1320px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center">
                                                No
                                            </TableHead>
                                            <TableHead className="w-20 text-right">
                                                Aksi
                                            </TableHead>
                                            <TableHead>Kode Booking</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Kota</TableHead>
                                            <TableHead className="text-center">
                                                Pax
                                            </TableHead>
                                            <TableHead>Paket</TableHead>
                                            <TableHead>Berangkat</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Revenue
                                            </TableHead>
                                            <TableHead>Masuk</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrationItems.map(
                                            (registration, index) => (
                                                <TableRow
                                                    key={registration.id}
                                                    className={
                                                        registration.status ===
                                                        'cancelled'
                                                            ? 'bg-rose-50/80 dark:bg-rose-950/20'
                                                            : undefined
                                                    }
                                                >
                                                    <TableCell className="text-center align-top text-sm text-muted-foreground">
                                                        {(registrations.from ??
                                                            1) + index}
                                                    </TableCell>
                                                    <TableCell className="min-w-20 text-right align-top">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="ml-auto"
                                                                    aria-label={`Aksi ${registration.booking_code}`}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsPdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openInvoicePdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Invoice
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {!registration.has_review &&
                                                                registration.review_url ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openReviewUrl(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Review
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {registration.status ===
                                                                    'registered' &&
                                                                canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            markAsCancelled(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canDelete ? (
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setDeleteTarget(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                    <TableCell className="min-w-40 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold">
                                                                {
                                                                    registration.booking_code
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID #
                                                                {
                                                                    registration.id
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top font-medium">
                                                        {registration.full_name}
                                                    </TableCell>
                                                    <TableCell className="min-w-44 align-top text-sm text-muted-foreground">
                                                        {
                                                            registration.origin_city
                                                        }
                                                    </TableCell>
                                                    <TableCell className="min-w-20 text-center align-top font-medium whitespace-nowrap">
                                                        {
                                                            registration.passenger_count
                                                        }
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top">
                                                        {packageDisplayName(
                                                            registration.travel_package,
                                                            locale,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="min-w-44 align-top whitespace-nowrap">
                                                        {formatDate(
                                                            registration
                                                                .departure_schedule
                                                                .departure_date,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Badge
                                                            variant={statusBadgeVariant(
                                                                registration.status,
                                                            )}
                                                            className="capitalize"
                                                        >
                                                            {
                                                                registration.status
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right align-top whitespace-nowrap">
                                                        {formatCurrency(
                                                            registration.revenue
                                                                ?.amount ?? 0,
                                                            registration.revenue
                                                                ?.currency ??
                                                                'IDR',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top text-sm whitespace-nowrap text-muted-foreground">
                                                        {formatDateTime(
                                                            registration.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden min-w-20 text-right align-top">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="ml-auto"
                                                                    aria-label={`Aksi ${registration.booking_code}`}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsPdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openInvoicePdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Invoice
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {!registration.has_review &&
                                                                registration.review_url ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openReviewUrl(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Review
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {registration.status ===
                                                                    'registered' &&
                                                                canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            markAsCancelled(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canDelete ? (
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setDeleteTarget(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            <p>
                                Menampilkan{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.from ?? 0}
                                </span>{' '}
                                -{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.to ?? 0}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.total}
                                </span>{' '}
                                booking
                            </p>
                            <div className="flex flex-wrap justify-end gap-2">
                                {registrations.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={link.url === null}
                                        onClick={() => {
                                            if (!link.url) {
                                                return;
                                            }

                                            router.visit(link.url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingRegistration(null);
                        form.reset();
                        form.clearErrors();
                    }
                }}
            >
                <SheetContent side="right" className="w-full p-0 sm:max-w-3xl">
                    <form
                        onSubmit={handleSubmit}
                        className="flex max-h-[90vh] flex-col overflow-hidden"
                    >
                        <div className="border-b bg-card px-4 py-4 sm:px-6">
                            <DrawerHeader className="space-y-2 p-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            editingRegistration
                                                ? 'secondary'
                                                : 'default'
                                        }
                                    >
                                        {editingRegistration
                                            ? 'Edit'
                                            : 'Tambah'}
                                    </Badge>
                                    {editingRegistration?.booking_code ? (
                                        <span className="text-sm text-muted-foreground">
                                            {editingRegistration.booking_code}
                                        </span>
                                    ) : null}
                                </div>
                                <DrawerTitle className="text-lg sm:text-xl">
                                    {editingRegistration
                                        ? 'Edit Booking'
                                        : 'Tambah Booking'}
                                </DrawerTitle>
                            </DrawerHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                            <div className="space-y-4">
                                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Paket & Jadwal
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="travel_package_id">
                                                Paket
                                            </Label>
                                            <Select
                                                value={
                                                    form.data.travel_package_id
                                                }
                                                onValueChange={
                                                    handlePackageChange
                                                }
                                                disabled={
                                                    isEditingCustomBooking
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih paket" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packageOptions.map(
                                                        (travelPackage) => (
                                                            <SelectItem
                                                                key={
                                                                    travelPackage.id
                                                                }
                                                                value={String(
                                                                    travelPackage.id,
                                                                )}
                                                            >
                                                                {
                                                                    travelPackage.code
                                                                }{' '}
                                                                -{' '}
                                                                {packageDisplayName(
                                                                    travelPackage,
                                                                    locale,
                                                                )}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.travel_package_id && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .travel_package_id
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {isEditingCustomBooking ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="custom_departure_date">
                                                        Tanggal berangkat
                                                    </Label>
                                                    <Input
                                                        id="custom_departure_date"
                                                        type="date"
                                                        value={
                                                            form.data
                                                                .custom_departure_date
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_departure_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_departure_date ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_departure_date
                                                            }
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="custom_return_date">
                                                        Tanggal pulang
                                                    </Label>
                                                    <Input
                                                        id="custom_return_date"
                                                        type="date"
                                                        value={
                                                            form.data
                                                                .custom_return_date
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_return_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_return_date ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_return_date
                                                            }
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-2 md:col-span-2">
                                                    <Label htmlFor="custom_unit_price">
                                                        Harga satuan (IDR)
                                                    </Label>
                                                    <Input
                                                        id="custom_unit_price"
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            form.data
                                                                .custom_unit_price
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_unit_price',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_unit_price ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_unit_price
                                                            }
                                                        </p>
                                                    ) : null}
                                                    <p className="text-xs text-muted-foreground">
                                                        Total otomatis:{' '}
                                                        <span className="font-medium text-foreground">
                                                            {formatCurrency(
                                                                computedCustomTotal,
                                                                'IDR',
                                                            )}
                                                        </span>{' '}
                                                        (
                                                        {
                                                            form.data
                                                                .passenger_count
                                                        }{' '}
                                                        pax x{' '}
                                                        {form.data
                                                            .custom_unit_price ||
                                                            0}
                                                        )
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="grid gap-2 md:col-span-2">
                                                <Label htmlFor="departure_schedule_id">
                                                    Jadwal Keberangkatan
                                                </Label>
                                                <Select
                                                    value={
                                                        form.data
                                                            .departure_schedule_id
                                                    }
                                                    onValueChange={(value) =>
                                                        form.setData(
                                                            'departure_schedule_id',
                                                            value === 'none'
                                                                ? ''
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jadwal atau kosongkan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Tanpa jadwal dulu
                                                        </SelectItem>
                                                        {filteredSchedules.map(
                                                            (schedule) => (
                                                                <SelectItem
                                                                    key={
                                                                        schedule.id
                                                                    }
                                                                    value={String(
                                                                        schedule.id,
                                                                    )}
                                                                >
                                                                    {scheduleLabel(
                                                                        schedule,
                                                                    )}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {form.errors
                                                    .departure_schedule_id && (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .departure_schedule_id
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-card p-4">
                                    <p className="text-sm font-semibold">
                                        Data Jamaah
                                    </p>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="full_name">
                                                Nama Lengkap
                                            </Label>
                                            <Input
                                                id="full_name"
                                                value={form.data.full_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'full_name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Nama sesuai KTP / paspor"
                                            />
                                            {form.errors.full_name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.full_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                WhatsApp
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 081234567890"
                                            />
                                            {form.errors.phone && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="opsional"
                                            />
                                            {form.errors.email && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="origin_city">
                                                Kota Asal
                                            </Label>
                                            <Input
                                                id="origin_city"
                                                value={form.data.origin_city}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'origin_city',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Surabaya"
                                            />
                                            {form.errors.origin_city && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.origin_city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="passenger_count">
                                                Jumlah Pax
                                            </Label>
                                            <Input
                                                id="passenger_count"
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={
                                                    form.data.passenger_count
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'passenger_count',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.passenger_count && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .passenger_count
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Status Booking
                                            </Label>
                                            <Select
                                                value={form.data.status}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'status',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="registered">
                                                        Registered
                                                    </SelectItem>
                                                    <SelectItem value="cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.errors.status && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.status}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="notes">
                                                Catatan
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={form.data.notes}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={4}
                                                placeholder="Tambahkan catatan khusus booking jika diperlukan"
                                            />
                                            {form.errors.notes && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t bg-card px-4 py-4 sm:px-6">
                            <DrawerFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingRegistration(null);
                                        form.reset();
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full sm:w-auto"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : editingRegistration
                                          ? 'Simpan Perubahan'
                                          : 'Tambah Booking'}
                                </Button>
                            </DrawerFooter>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Booking</DialogTitle>
                        <DialogDescription>
                            Booking{' '}
                            <strong>{deleteTarget?.booking_code ?? '-'}</strong>{' '}
                            akan dihapus permanen dari listing admin.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Batal
                        </Button>
                        {canDelete ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={form.processing}
                            >
                                Hapus Booking
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
