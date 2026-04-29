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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
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
    booking_code: string;
    travel_package_id: number;
    departure_schedule_id: number | null;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    passenger_count: number;
    notes: string | null;
    status: string;
    created_at: string | null;
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
    filters: {
        search: string;
        status: string;
        travel_package_id?: number | null;
    };
};

const defaultFormData: BookingFormData = {
    travel_package_id: '',
    departure_schedule_id: '',
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
    filters,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const registrationItems = Array.isArray(registrations?.data)
        ? registrations.data
        : [];
    const packageOptions = Array.isArray(packages) ? packages : [];
    const scheduleOptions = Array.isArray(schedules) ? schedules : [];
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || 'registered',
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

    const form = useForm<BookingFormData>(defaultFormData);

    const filteredSchedules = useMemo(() => {
        if (!form.data.travel_package_id) {
            return scheduleOptions;
        }

        const travelPackageId = Number(form.data.travel_package_id);

        return scheduleOptions.filter(
            (schedule) => schedule.travel_package_id === travelPackageId,
        );
    }, [form.data.travel_package_id, scheduleOptions]);

    const stats = [
        {
            label: 'Total Booking',
            value: registrations.total,
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
        setEditingRegistration(null);
        form.reset();
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function openEditDialog(registration: Registration): void {
        setEditingRegistration(registration);

        form.setData({
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
            status: registration.status,
        });
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function applyFilters(
        nextSearch: string,
        nextStatus: string,
        nextPackageId: string,
    ): void {
        router.get(
            '/admin/booking-management/listing',
            {
                search: nextSearch || undefined,
                status: nextStatus || 'registered',
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

    useEffect(() => {
        if (
            debouncedSearch === (filters.search ?? '') &&
            statusFilter === (filters.status || 'registered') &&
            packageFilter ===
                (filters.travel_package_id
                    ? String(filters.travel_package_id)
                    : 'all')
        ) {
            return;
        }

        applyFilters(debouncedSearch, statusFilter, packageFilter);
    }, [
        debouncedSearch,
        filters.search,
        filters.status,
        filters.travel_package_id,
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
        if (!deleteTarget) {
            return;
        }

        form.delete(
            `/admin/booking-management/listing/${deleteTarget.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteTarget(null);
                },
            },
        );
    }

    function handleActionChange(
        registration: Registration,
        action: string,
    ): void {
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
                    <Button
                        onClick={openCreateDialog}
                        className="w-full md:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Booking
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
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
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_460px]">
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
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                                <Select
                                    value={packageFilter}
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
                                        <SelectItem value="registered">
                                            Registered
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
                                            <TableHead>Masuk</TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrationItems.map(
                                            (registration) => (
                                                <TableRow key={registration.id}>
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
                                                                <SelectItem value="pdf">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF peserta
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="edit">
                                                                    Edit booking
                                                                </SelectItem>
                                                                <SelectItem value="delete">
                                                                    Hapus
                                                                    booking
                                                                </SelectItem>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingRegistration
                                    ? 'Edit Booking'
                                    : 'Tambah Booking'}
                            </DialogTitle>
                            <DialogDescription>
                                Kelola data booking admin dari satu form yang
                                lebih ringkas dan mudah dipakai.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4 md:grid-cols-2">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="travel_package_id">Paket</Label>
                                <Select
                                    value={form.data.travel_package_id}
                                    onValueChange={handlePackageChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packageOptions.map((travelPackage) => (
                                            <SelectItem
                                                key={travelPackage.id}
                                                value={String(travelPackage.id)}
                                            >
                                                {travelPackage.code} -{' '}
                                                {packageDisplayName(
                                                    travelPackage,
                                                    locale,
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.travel_package_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.travel_package_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="departure_schedule_id">
                                    Jadwal Keberangkatan
                                </Label>
                                <Select
                                    value={form.data.departure_schedule_id}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'departure_schedule_id',
                                            value === 'none' ? '' : value,
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
                                        {filteredSchedules.map((schedule) => (
                                            <SelectItem
                                                key={schedule.id}
                                                value={String(schedule.id)}
                                            >
                                                {scheduleLabel(schedule)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.departure_schedule_id && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.departure_schedule_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="full_name">Nama Lengkap</Label>
                                <Input
                                    id="full_name"
                                    value={form.data.full_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'full_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.full_name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.full_name}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">WhatsApp</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
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
                                />
                                {form.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="origin_city">Kota Asal</Label>
                                <Input
                                    id="origin_city"
                                    value={form.data.origin_city}
                                    onChange={(event) =>
                                        form.setData(
                                            'origin_city',
                                            event.target.value,
                                        )
                                    }
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
                                    value={form.data.passenger_count}
                                    onChange={(event) =>
                                        form.setData(
                                            'passenger_count',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.passenger_count && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.passenger_count}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status Booking</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData('status', value)
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
                                <Label htmlFor="notes">Catatan</Label>
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingRegistration(null);
                                    form.reset();
                                }}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Menyimpan...'
                                    : editingRegistration
                                      ? 'Simpan Perubahan'
                                      : 'Tambah Booking'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

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
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={form.processing}
                        >
                            Hapus Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}

