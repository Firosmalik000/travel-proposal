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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { requestMessageFrom } from '@/lib/request-toasts';
import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Copy,
    Mail,
    MoreHorizontal,
    PackageCheck,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Registration = {
    inventory: {
        has_tracked_inventory: boolean;
        total_tracked_products: number;
        insufficient_items: Array<{
            product_name: string;
            available: number;
            required: number;
        }>;
    };
    id: number;
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
        name: Record<string, string> | string | null;
        display_name?: string | null;
    };
    departure_schedule: {
        departure_date: string | null;
        departure_city: string | null;
    };
};

type Props = {
    registrations:
        | Registration[]
        | {
              data?: Registration[];
          };
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
    }).format(new Date(value));
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

function packageDisplayName(
    registration: Registration,
    locale: 'id' | 'en',
): string {
    const directDisplayName = registration.travel_package.display_name?.trim();

    if (directDisplayName) {
        return directDisplayName;
    }

    const rawName = registration.travel_package.name;

    if (typeof rawName === 'string') {
        const trimmedName = rawName.trim();

        if (trimmedName === '') {
            return registration.travel_package.code ?? '-';
        }

        try {
            const parsedName = JSON.parse(trimmedName) as Record<
                string,
                string
            > | null;

            if (parsedName && typeof parsedName === 'object') {
                return (
                    parsedName[locale] ||
                    parsedName.id ||
                    parsedName.en ||
                    registration.travel_package.code ||
                    '-'
                );
            }
        } catch {
            return trimmedName;
        }

        return trimmedName;
    }

    if (rawName && typeof rawName === 'object') {
        return (
            rawName[locale] ||
            rawName.id ||
            rawName.en ||
            registration.travel_package.code ||
            '-'
        );
    }

    return registration.travel_package.code ?? '-';
}

export default function BookingRegisterIndex({ registrations }: Props) {
    const { can } = usePermission('booking_register');
    const canApprove = can('approve');
    const canDelete = can('delete');
    const locale: 'id' | 'en' = 'id';
    const registrationItems = Array.isArray(registrations)
        ? registrations
        : Array.isArray(registrations?.data)
          ? registrations.data
          : [];
    const [search, setSearch] = useState('');

    const filteredRegistrations = registrationItems.filter((registration) => {
        const packageName = packageDisplayName(registration, locale);
        const keyword = search.toLowerCase();

        return [
            registration.full_name,
            registration.phone,
            registration.email ?? '',
            registration.origin_city,
            registration.travel_package.code ?? '',
            packageName,
            registration.departure_schedule.departure_city ?? '',
        ].some((value) => value.toLowerCase().includes(keyword));
    });

    const stats = [
        {
            label: 'Total Pending',
            value: registrationItems.length,
            icon: Users,
        },
        {
            label: 'Pending',
            value: registrationItems.filter(
                (registration) => registration.status === 'pending',
            ).length,
            icon: CalendarDays,
        },
        {
            label: 'Total Seat',
            value: registrationItems.reduce(
                (total, registration) => total + registration.passenger_count,
                0,
            ),
            icon: PackageCheck,
        },
    ];

    function openWhatsApp(registration: Registration): void {
        const packageName = packageDisplayName(registration, locale);
        const departureDate = formatDate(
            registration.departure_schedule.departure_date,
        );
        const message = [
            `Assalamu'alaikum ${registration.full_name},`,
            '',
            `kami menghubungi terkait pendaftaran ${packageName}.`,
            `Jadwal: ${departureDate} - ${registration.departure_schedule.departure_city ?? '-'}`,
        ].join('\n');

        window.open(
            `https://wa.me/${normalizePhone(registration.phone)}?text=${encodeURIComponent(message)}`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function copyContact(registration: Registration): void {
        const details = [
            `Nama: ${registration.full_name}`,
            `WhatsApp: ${registration.phone}`,
            `Email: ${registration.email ?? '-'}`,
            `Kota Asal: ${registration.origin_city}`,
        ].join('\n');

        if (!navigator.clipboard) {
            toast.error('Browser tidak mendukung penyalinan kontak otomatis.');

            return;
        }

        void navigator.clipboard
            .writeText(details)
            .then(() => toast.success('Kontak berhasil disalin.'))
            .catch(() => toast.error('Kontak belum dapat disalin.'));
    }

    function markAsRegistered(registration: Registration): void {
        if (!canApprove) {
            return;
        }

        router.put(
            `/admin/booking-management/register/${registration.id}/mark-registered`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Booking berhasil dipindahkan ke registered.',
                    );
                },
                onError: (errors) => {
                    toast.error(
                        requestMessageFrom(errors) ??
                            'Booking belum bisa dipindahkan ke registered.',
                    );
                },
            },
        );
    }

    function deleteRegistration(registration: Registration): void {
        if (!canDelete) {
            return;
        }

        if (!window.confirm(`Hapus data register ${registration.full_name}?`)) {
            return;
        }

        router.delete(`/admin/booking-management/register/${registration.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Data registrasi berhasil dihapus.');
            },
            onError: (errors) => {
                toast.error(
                    requestMessageFrom(errors) ??
                        'Data registrasi belum dapat dihapus.',
                );
            },
        });
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Booking',
                    href: '/admin/booking-management/listing',
                },
                {
                    label: 'Register',
                    href: '/admin/booking-management/register',
                },
            ]}
        >
            <Head title="Booking Register" />

            <div className="space-y-4 p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Booking Register
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-border/60 shadow-sm"
                        >
                            <CardContent className="flex items-center justify-between p-3.5">
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-muted p-2.5">
                                    <stat.icon className="h-4.5 w-4.5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="gap-3 border-b border-border/60 pb-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                            <div>
                                <CardTitle>Data Register</CardTitle>
                                <CardDescription className="text-xs">
                                    Total data: {registrationItems.length}
                                </CardDescription>
                            </div>
                            <div className="relative w-full lg:w-[420px]">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama, paket, kota, atau nomor telepon..."
                                    className="h-10 rounded-lg pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredRegistrations.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-6 py-12 text-center">
                                <p className="font-medium text-foreground">
                                    {registrationItems.length === 0
                                        ? 'Belum ada data register.'
                                        : 'Data yang dicari tidak ditemukan.'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {registrationItems.length === 0
                                        ? 'Data akan muncul di sini setelah ada pendaftar dari form paket.'
                                        : 'Coba gunakan kata kunci yang berbeda.'}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-[1100px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center">
                                                No
                                            </TableHead>
                                            <TableHead className="w-20 text-right">
                                                Aksi
                                            </TableHead>
                                            <TableHead>Pendaftar</TableHead>
                                            <TableHead>Paket</TableHead>
                                            <TableHead>Jadwal</TableHead>
                                            <TableHead>Kontak</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Masuk</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRegistrations.map(
                                            (registration, index) => {
                                                const packageName =
                                                    packageDisplayName(
                                                        registration,
                                                        locale,
                                                    );
                                                const hasTrackedInventory =
                                                    registration.inventory
                                                        .has_tracked_inventory;
                                                const hasInsufficientInventory =
                                                    registration.inventory
                                                        .insufficient_items
                                                        .length > 0;

                                                return (
                                                    <TableRow
                                                        key={registration.id}
                                                    >
                                                        <TableCell className="text-center text-sm text-muted-foreground">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="min-w-20">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="ml-auto"
                                                                        aria-label={`Aksi ${registration.full_name}`}
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {canApprove ? (
                                                                        <DropdownMenuItem
                                                                            disabled={
                                                                                hasInsufficientInventory
                                                                            }
                                                                            onClick={() =>
                                                                                markAsRegistered(
                                                                                    registration,
                                                                                )
                                                                            }
                                                                        >
                                                                            Registered
                                                                        </DropdownMenuItem>
                                                                    ) : null}
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openWhatsApp(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        WA
                                                                    </DropdownMenuItem>
                                                                    {registration.email ? (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                window.open(
                                                                                    `mailto:${registration.email}`,
                                                                                    '_blank',
                                                                                    'noopener,noreferrer',
                                                                                )
                                                                            }
                                                                        >
                                                                            <Mail className="h-4 w-4" />
                                                                            Email
                                                                        </DropdownMenuItem>
                                                                    ) : null}
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            copyContact(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                        Copy
                                                                    </DropdownMenuItem>
                                                                    {canDelete ? (
                                                                        <DropdownMenuItem
                                                                            variant="destructive"
                                                                            onClick={() =>
                                                                                deleteRegistration(
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
                                                        <TableCell className="min-w-52">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">
                                                                    {
                                                                        registration.full_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        registration.origin_city
                                                                    }{' '}
                                                                    -{' '}
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
                                                        <TableCell className="min-w-52">
                                                            <div className="space-y-1.5">
                                                                <p className="font-medium">
                                                                    {
                                                                        packageName
                                                                    }
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            hasTrackedInventory
                                                                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                        }
                                                                    >
                                                                        {hasTrackedInventory
                                                                            ? `Tracked stock (${registration.inventory.total_tracked_products})`
                                                                            : 'Unlimited'}
                                                                    </Badge>
                                                                </div>
                                                                {hasInsufficientInventory ? (
                                                                    <div className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-700">
                                                                        <p className="font-semibold">
                                                                            Stok
                                                                            tidak
                                                                            cukup
                                                                            untuk
                                                                            register.
                                                                        </p>
                                                                        {registration.inventory.insufficient_items.map(
                                                                            (
                                                                                item,
                                                                            ) => (
                                                                                <p
                                                                                    key={`${registration.id}-${item.product_name}`}
                                                                                >
                                                                                    {
                                                                                        item.product_name
                                                                                    }

                                                                                    :{' '}
                                                                                    stok{' '}
                                                                                    {
                                                                                        item.available
                                                                                    }{' '}
                                                                                    /
                                                                                    butuh{' '}
                                                                                    {
                                                                                        item.required
                                                                                    }
                                                                                </p>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="min-w-44">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">
                                                                    {formatDate(
                                                                        registration
                                                                            .departure_schedule
                                                                            .departure_date,
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {registration
                                                                        .departure_schedule
                                                                        .departure_city ??
                                                                        '-'}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="min-w-44">
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
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
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
                                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                                            {formatDateTime(
                                                                registration.created_at,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            },
                                        )}
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
