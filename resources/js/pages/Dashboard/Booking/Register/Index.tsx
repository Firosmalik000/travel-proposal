import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Copy,
    Mail,
    PackageCheck,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type Registration = {
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
        name: Record<string, string> | null;
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

export default function BookingRegisterIndex({ registrations }: Props) {
    const locale: 'id' | 'en' = 'id';
    const registrationItems = Array.isArray(registrations)
        ? registrations
        : Array.isArray(registrations?.data)
          ? registrations.data
          : [];
    const [search, setSearch] = useState('');

    const filteredRegistrations = registrationItems.filter((registration) => {
        const packageName =
            typeof registration.travel_package.name === 'string'
                ? registration.travel_package.name
                : (registration.travel_package.name?.[locale] ??
                  registration.travel_package.name?.id ??
                  '');
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
        const packageName =
            typeof registration.travel_package.name === 'string'
                ? registration.travel_package.name
                : (registration.travel_package.name?.[locale] ??
                  registration.travel_package.name?.id ??
                  'Paket Umroh');
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

        navigator.clipboard.writeText(details);
    }

    function markAsRegistered(registration: Registration): void {
        router.put(
            `/admin/booking-management/register/${registration.id}/mark-registered`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function deleteRegistration(registration: Registration): void {
        if (!window.confirm(`Hapus data register ${registration.full_name}?`)) {
            return;
        }

        router.delete(`/admin/booking-management/register/${registration.id}`, {
            preserveScroll: true,
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

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Booking Register
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Menampilkan data calon jamaah yang masih berstatus
                        pending sebelum dipindahkan ke listing registered.
                    </p>
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
                    <CardHeader className="gap-3">
                        <div>
                            <CardTitle>Data Register</CardTitle>
                            <CardDescription>
                                Daftar pendaftar pending dari halaman paket
                                umroh.
                            </CardDescription>
                        </div>
                        <div className="relative max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama, paket, kota, atau nomor telepon..."
                                className="pl-9"
                            />
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pendaftar</TableHead>
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
                                    {filteredRegistrations.map(
                                        (registration) => {
                                            const packageName =
                                                registration.travel_package
                                                    .name?.[locale] ??
                                                registration.travel_package.name
                                                    ?.id ??
                                                '-';

                                            return (
                                                <TableRow key={registration.id}>
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
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {packageName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {registration
                                                                    .travel_package
                                                                    .code ??
                                                                    '-'}
                                                            </p>
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
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    markAsRegistered(
                                                                        registration,
                                                                    )
                                                                }
                                                            >
                                                                Registered
                                                            </Button>
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
                                                                    copyContact(
                                                                        registration,
                                                                    )
                                                                }
                                                                aria-label={`Salin kontak ${registration.full_name}`}
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    deleteRegistration(
                                                                        registration,
                                                                    )
                                                                }
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}

