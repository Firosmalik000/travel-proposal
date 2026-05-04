import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    SheetDescription as DrawerDescription,
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
    Copy,
    FileText,
    Mail,
    MapPin,
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

function normalizePhone(phone: string): string {
    const cleanedPhone = phone.replace(/[^\d]/g, '');

    if (cleanedPhone.startsWith('0')) {
        return `62${cleanedPhone.slice(1)}`;
    }

    return cleanedPhone;
}

function humanizePackageType(value: string | null): string {
    if (!value) {
        return '-';
    }

    return value
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
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
    const [actionState, setActionState] = useState<Record<number, string>>({});
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

    function handleActionChange(
        registration: Registration,
        action: string,
    ): void {
        if ((action === 'pdf' || action === 'invoice') && !canExport) {
            return;
        }

        if ((action === 'edit' || action === 'cancel') && !canEdit) {
            return;
        }

        if (action === 'delete' && !canDelete) {
            return;
        }

        setActionState((current) => ({
            ...current,
            [registration.id]: action,
        }));

        if (action === 'pdf') {
            window.open(
                `/admin/booking-management/listing/${registration.id}/participants.pdf`,
                '_blank',
                'noopener,noreferrer',
            );
        } else if (action === 'invoice') {
            window.open(
                `/admin/booking-management/listing/${registration.id}/invoice.pdf`,
                '_blank',
                'noopener,noreferrer',
            );
        } else if (action === 'review') {
            if (registration.review_url) {
                window.open(
                    registration.review_url,
                    '_blank',
                    'noopener,noreferrer',
                );
            }
        } else if (action === 'cancel') {
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
        } else if (action === 'edit') {
            openEditDialog(registration);
        } else if (action === 'delete') {
            setDeleteTarget(registration);
        }

        setTimeout(() => {
            setActionState((current) => ({
                ...current,
                [registration.id]: '',
            }));
        }, 0);
    }

    function openWhatsApp(registration: Registration): void {
        const packageName = packageDisplayName(
            registration.travel_package,
            locale,
        );
        const departureDate = formatDate(
            registration.departure_schedule.departure_date,
        );
        const message = [
            `Assalamu'alaikum ${registration.full_name},`,
            '',
            `kami menghubungi terkait booking ${registration.booking_code}.`,
            `Paket: ${packageName}`,
            `Keberangkatan: ${departureDate} - ${registration.departure_schedule.departure_city ?? '-'}`,
        ].join('\n');

        window.open(
            `https://wa.me/${normalizePhone(registration.phone)}?text=${encodeURIComponent(message)}`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function copyBooking(registration: Registration): void {
        const packageName = packageDisplayName(
            registration.travel_package,
            locale,
        );

        const details = [
            `Kode Booking: ${registration.booking_code}`,
            `Nama: ${registration.full_name}`,
            `WhatsApp: ${registration.phone}`,
            `Email: ${registration.email ?? '-'}`,
            `Paket: ${packageName}`,
            `Kota Asal: ${registration.origin_city}`,
            `Jumlah Pax: ${registration.passenger_count}`,
            `Status: ${registration.status}`,
        ].join('\n');

        navigator.clipboard.writeText(details);
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Booking',
                    href: '/admin/booking-management/listing',
                },
                {
                    label: 'Listing',
                    href: '/admin/booking-management/listing',
                },
            ]}
        >
            <Head title="Booking Listing" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Booking Listing
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Halaman booking yang sudah berstatus registered dan
                            siap dikelola lebih lanjut oleh admin.
                        </p>
                    </div>
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

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="flex items-center justify-between p-5">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-full bg-muted p-3">
                                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>Data Booking Jamaah</CardTitle>
                            <CardDescription>
                                Tabel booking yang lebih lengkap untuk keperluan
                                admin, termasuk kontak, jadwal, dan status.
                            </CardDescription>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari kode booking, nama, paket, kota, atau kontak..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_200px]">
                                <Select
                                    value={bookingTypeFilter}
                                    onValueChange={(value) => {
                                        setBookingTypeFilter(value);

                                        if (value === 'custom') {
                                            setPackageFilter('all');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipe booking" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">
                                            Booking paket
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom booking
                                        </SelectItem>
                                        <SelectItem value="all">
                                            Semua
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={packageFilter}
                                    disabled={bookingTypeFilter === 'custom'}
                                    onValueChange={(value) => {
                                        setPackageFilter(value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua paket
                                        </SelectItem>
                                        {packageOptions.map((travelPackage) => (
                                            <SelectItem
                                                key={travelPackage.id}
                                                value={String(travelPackage.id)}
                                            >
                                                {packageDisplayName(
                                                    travelPackage,
                                                    locale,
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status registered" />
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
                    </CardHeader>
                    <CardContent>
                        {registrationItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-6 py-12 text-center">
                                <p className="font-medium text-foreground">
                                    {registrations.total === 0
                                        ? 'Belum ada data booking.'
                                        : 'Data booking yang dicari tidak ditemukan.'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {registrations.total === 0
                                        ? 'Booking akan muncul di halaman ini setelah dibuat dari website atau admin dashboard.'
                                        : 'Coba ubah kata kunci atau filter status.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode Booking</TableHead>
                                            <TableHead>Jamaah</TableHead>
                                            <TableHead>Paket</TableHead>
                                            <TableHead>Jadwal</TableHead>
                                            <TableHead>Kontak</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Revenue
                                            </TableHead>
                                            <TableHead>Masuk</TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrationItems.map(
                                            (registration) => (
                                                <TableRow
                                                    key={registration.id}
                                                    className={
                                                        registration.status ===
                                                        'cancelled'
                                                            ? 'bg-rose-50/80 dark:bg-rose-950/20'
                                                            : undefined
                                                    }
                                                >
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
                                                    <TableCell className="min-w-56 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {
                                                                    registration.full_name
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                <span>
                                                                    {
                                                                        registration.origin_city
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    registration.passenger_count
                                                                }{' '}
                                                                pax
                                                            </p>
                                                            {registration.notes && (
                                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                                    {
                                                                        registration.notes
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {packageDisplayName(
                                                                    registration.travel_package,
                                                                    locale,
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    registration
                                                                        .travel_package
                                                                        .code
                                                                }
                                                            </p>
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize"
                                                            >
                                                                {humanizePackageType(
                                                                    registration
                                                                        .travel_package
                                                                        .package_type,
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {formatDate(
                                                                    registration
                                                                        .departure_schedule
                                                                        .departure_date,
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Pulang:{' '}
                                                                {formatDate(
                                                                    registration
                                                                        .departure_schedule
                                                                        .return_date,
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    registration
                                                                        .departure_schedule
                                                                        .departure_city
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-52 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {
                                                                    registration.phone
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {registration.email ??
                                                                    '-'}
                                                            </p>
                                                            <div className="flex gap-2 pt-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openWhatsApp(
                                                                            registration,
                                                                        )
                                                                    }
                                                                >
                                                                    WA
                                                                </Button>
                                                                {registration.email && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`mailto:${registration.email}`}
                                                                            aria-label={`Email ${registration.full_name}`}
                                                                        >
                                                                            <Mail className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        copyBooking(
                                                                            registration,
                                                                        )
                                                                    }
                                                                    aria-label={`Salin booking ${registration.full_name}`}
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
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
                                                        {registration.has_review ? (
                                                            <div className="mt-1 text-xs font-medium text-emerald-600">
                                                                Sudah review
                                                            </div>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell className="text-right align-top whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {formatCurrency(
                                                                    registration
                                                                        .revenue
                                                                        ?.amount ??
                                                                        0,
                                                                    registration
                                                                        .revenue
                                                                        ?.currency ??
                                                                        'IDR',
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {registration.booking_type ===
                                                                    'custom' &&
                                                                typeof registration.custom_unit_price ===
                                                                    'number'
                                                                    ? `${formatCurrency(
                                                                          registration.custom_unit_price,
                                                                          registration
                                                                              .revenue
                                                                              ?.currency ??
                                                                              'IDR',
                                                                      )} × ${registration.passenger_count} pax`
                                                                    : `${registration.passenger_count} pax`}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-sm whitespace-nowrap text-muted-foreground">
                                                        {formatDateTime(
                                                            registration.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="min-w-40 text-right align-top">
                                                        <Select
                                                            value={
                                                                actionState[
                                                                    registration
                                                                        .id
                                                                ] ?? ''
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleActionChange(
                                                                    registration,
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="ml-auto w-[150px]">
                                                                <SelectValue placeholder="Pilih aksi" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {canExport ? (
                                                                    <SelectItem value="pdf">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText className="h-4 w-4" />
                                                                            PDF
                                                                            peserta
                                                                        </div>
                                                                    </SelectItem>
                                                                ) : null}
                                                                {canExport ? (
                                                                    <SelectItem value="invoice">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText className="h-4 w-4" />
                                                                            PDF
                                                                            invoice
                                                                        </div>
                                                                    </SelectItem>
                                                                ) : null}
                                                                {!registration.has_review &&
                                                                    registration.review_url && (
                                                                        <SelectItem value="review">
                                                                            Beri
                                                                            Review
                                                                        </SelectItem>
                                                                    )}
                                                                {registration.status ===
                                                                    'registered' &&
                                                                    canEdit && (
                                                                        <SelectItem value="cancel">
                                                                            Batalkan
                                                                            booking
                                                                        </SelectItem>
                                                                    )}
                                                                {canEdit ? (
                                                                    <SelectItem value="edit">
                                                                        Edit
                                                                        booking
                                                                    </SelectItem>
                                                                ) : null}
                                                                {canDelete ? (
                                                                    <SelectItem value="delete">
                                                                        Hapus
                                                                        booking
                                                                    </SelectItem>
                                                                ) : null}
                                                            </SelectContent>
                                                        </Select>
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
                                <DrawerDescription>
                                    Isi data booking dengan lebih jelas: pilih
                                    paket & jadwal, lalu lengkapi data jamaah.
                                </DrawerDescription>
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
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Pilih paket dulu supaya opsi
                                                jadwal terfilter otomatis.
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
                                                        pax ×{' '}
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
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Gunakan nomor WhatsApp aktif untuk
                                        follow-up booking.
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
