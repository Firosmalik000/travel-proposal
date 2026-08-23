import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CustomerLayout from '@/layouts/customer-layout';
import { formatDate } from '@/lib/date-format';
import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CalendarDays,
    CircleDollarSign,
    Eye,
    FileText,
    MoreVertical,
    PlaneTakeoff,
    Users,
    type LucideIcon,
} from 'lucide-react';

type Booking = {
    id: number;
    record_type: 'booking' | 'registration';
    booking_code: string;
    status: string;
    package_name: string | null;
    package_url: string | null;
    detail_url: string | null;
    participants_url: string | null;
    invoice_url: string | null;
    review_url: string | null;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    passenger_count: number;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    referral_code: string | null;
    room_configuration: Record<string, number> | null;
    room_summary: string | null;
    notes: string | null;
    participants_count: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: string;
    currency: string;
};

type Summary = {
    total_bookings: number;
    total_spent: number;
    total_due: number;
    remaining_payment: number;
};

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);

const bookingStatusLabel: Record<string, string> = {
    registered: 'Terdaftar',
    pending: 'Menunggu',
    cancelled: 'Batal',
};

const paymentStatusLabel: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overpaid: 'Lebih Bayar',
    unavailable: 'Belum Tersedia',
};

const statusBadgeClass: Record<string, string> = {
    registered:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    cancelled:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
};

const paymentBadgeClass: Record<string, string> = {
    unpaid: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
    partial:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    overpaid:
        'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300',
    unavailable:
        'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
};

type StatCard = {
    label: string;
    value: string | number;
    icon: LucideIcon;
};

export default function Bookings({
    bookings,
    summary,
}: {
    bookings: Booking[];
    summary: Summary;
}) {
    const cards: StatCard[] = [
        {
            label: 'Total Pesanan',
            value: summary.total_bookings,
            icon: PlaneTakeoff,
        },
        {
            label: 'Total Pengeluaran',
            value: money(summary.total_spent, 'IDR'),
            icon: CircleDollarSign,
        },
        {
            label: 'Jumlah Harus Dibayar',
            value: money(summary.total_due, 'IDR'),
            icon: CalendarDays,
        },
        {
            label: 'Sisa Pembayaran',
            value: money(summary.remaining_payment, 'IDR'),
            icon: CircleDollarSign,
        },
    ];

    const columns: ColumnDef<Booking>[] = [
        {
            id: 'index',
            header: '#',
            cell: ({ row }) => (
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {row.index + 1}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/20 dark:text-slate-300 dark:hover:bg-slate-800"
                            aria-label={`Aksi ${row.original.booking_code}`}
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-64 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xl dark:border-slate-700/80 dark:bg-[#111827]"
                    >
                        <DropdownMenuLabel className="px-2 pb-2 text-[10px] font-semibold tracking-[0.24em] text-slate-400 uppercase dark:text-slate-500">
                            Detail
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link
                                className="w-full"
                                href={
                                    row.original.detail_url ??
                                    `/customer/bookings/${row.original.booking_code}`
                                }
                            >
                                <Eye className="mr-2 size-4 text-slate-500" />
                                Detail Booking
                            </Link>
                        </DropdownMenuItem>
                        {row.original.package_url ? (
                            <DropdownMenuItem asChild>
                                <Link
                                    className="w-full"
                                    href={row.original.package_url}
                                >
                                    <FileText className="mr-2 size-4 text-slate-500" />
                                    Detail Paket
                                </Link>
                            </DropdownMenuItem>
                        ) : null}
                        {row.original.record_type === 'booking' ? (
                            <>
                                <DropdownMenuSeparator className="my-2" />
                                <DropdownMenuLabel className="px-2 pb-2 text-[10px] font-semibold tracking-[0.24em] text-slate-400 uppercase dark:text-slate-500">
                                    Tindakan
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link
                                        className="w-full"
                                        href={
                                            row.original.participants_url ?? '#'
                                        }
                                    >
                                        <Users className="mr-2 size-4 text-slate-500" />
                                        Isi Peserta
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        className="w-full"
                                        href={row.original.invoice_url ?? '#'}
                                    >
                                        <CircleDollarSign className="mr-2 size-4 text-slate-500" />
                                        Riwayat Pembayaran
                                    </Link>
                                </DropdownMenuItem>
                                {row.original.review_url ? (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            className="w-full"
                                            href={row.original.review_url}
                                        >
                                            <FileText className="mr-2 size-4 text-slate-500" />
                                            Isi / Ubah Review
                                        </Link>
                                    </DropdownMenuItem>
                                ) : null}
                            </>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
        {
            accessorKey: 'booking_code',
            header: 'Kode',
            cell: ({ row }) => (
                <p className="min-w-40 text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">
                    {row.original.booking_code}
                </p>
            ),
        },
        {
            accessorKey: 'package_name',
            header: 'Paket',
            cell: ({ row }) => (
                <p className="min-w-52 text-sm font-medium text-slate-900 dark:text-white">
                    {row.original.package_name ?? '-'}
                </p>
            ),
        },
        {
            accessorKey: 'departure_date',
            header: 'Tanggal Berangkat',
            cell: ({ row }) => (
                <p className="min-w-40 text-sm font-medium whitespace-nowrap">
                    {formatDate(row.original.departure_date)}
                </p>
            ),
        },
        {
            accessorKey: 'departure_city',
            header: 'Kota Keberangkatan',
            cell: ({ row }) => (
                <p className="min-w-36 text-sm font-medium whitespace-nowrap">
                    {row.original.departure_city || 'Belum ditentukan'}
                </p>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={`w-fit border text-[11px] ${statusBadgeClass[row.original.status] ?? statusBadgeClass.cancelled}`}
                >
                    {bookingStatusLabel[row.original.status] ??
                        row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'payment_status',
            header: 'Status Pembayaran',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={`w-fit border text-[11px] whitespace-nowrap ${paymentBadgeClass[row.original.payment_status] ?? paymentBadgeClass.unavailable}`}
                >
                    {paymentStatusLabel[row.original.payment_status] ??
                        row.original.payment_status}
                </Badge>
            ),
        },
        {
            accessorKey: 'total_amount',
            header: 'Total Tagihan',
            cell: ({ row }) => (
                <p className="text-right text-sm font-semibold whitespace-nowrap tabular-nums">
                    {money(row.original.total_amount, row.original.currency)}
                </p>
            ),
        },
        {
            accessorKey: 'paid_amount',
            header: 'Terbayar',
            cell: ({ row }) => (
                <p className="text-right text-sm font-semibold whitespace-nowrap text-emerald-700 tabular-nums dark:text-emerald-300">
                    {money(row.original.paid_amount, row.original.currency)}
                </p>
            ),
        },
        {
            accessorKey: 'remaining_amount',
            header: 'Sisa Tagihan',
            cell: ({ row }) => (
                <p className="text-right text-sm font-semibold whitespace-nowrap tabular-nums">
                    {money(
                        row.original.remaining_amount,
                        row.original.currency,
                    )}
                </p>
            ),
        },
        {
            accessorKey: 'passenger_count',
            header: 'Peserta',
            cell: ({ row }) => {
                const totalSlots = row.original.passenger_count;
                const filledSlots = row.original.participants_count;
                return (
                    <p className="text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">
                        {filledSlots} dari {totalSlots} peserta
                    </p>
                );
            },
        },
    ];

    return (
        <CustomerLayout title="Booking Saya">
            <Head title="Booking Saya" />

            <section className="rounded-3xl bg-[linear-gradient(135deg,#123f39_0%,#0d5c52_100%)] p-5 text-white shadow-xl shadow-emerald-950/10 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                            Booking Saya
                        </h1>
                    </div>
                    <Button
                        asChild
                        className="rounded-full bg-white px-4 text-sm text-[#123f39] shadow-sm hover:bg-emerald-50"
                    >
                        <Link href="/customer">Dashboard</Link>
                    </Button>
                </div>
            </section>

            <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card
                        key={label}
                        className="border-[#dfd3bf] bg-[#fffaf1]/90 shadow-sm dark:border-[#334155] dark:bg-[#202836]"
                    >
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-xl bg-[#ead8b8] p-2.5 text-[#74501d]">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                                    {value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Daftar Booking
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {bookings.length} data
                    </p>
                </div>

                <Card className="border-[#dbe3ee] bg-white shadow-sm dark:border-[#2b3648] dark:bg-[#171d27]">
                    <CardContent className="p-3 sm:p-4">
                        {bookings.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={bookings}
                                searchKeys={[
                                    'booking_code',
                                    'package_name',
                                    'departure_city',
                                    'full_name',
                                ]}
                                searchPlaceholder="Cari kode, paket, kota, atau nama..."
                                filters={[
                                    {
                                        columnId: 'status',
                                        label: 'Status Booking',
                                        options: [
                                            {
                                                label: 'Terdaftar',
                                                value: 'registered',
                                            },
                                            {
                                                label: 'Menunggu',
                                                value: 'pending',
                                            },
                                            {
                                                label: 'Dibatalkan',
                                                value: 'cancelled',
                                            },
                                        ],
                                    },
                                    {
                                        columnId: 'payment_status',
                                        label: 'Status Pembayaran',
                                        options: [
                                            {
                                                label: 'Belum Dibayar',
                                                value: 'unpaid',
                                            },
                                            {
                                                label: 'Dibayar Sebagian',
                                                value: 'partial',
                                            },
                                            { label: 'Lunas', value: 'paid' },
                                            {
                                                label: 'Lebih Bayar',
                                                value: 'overpaid',
                                            },
                                            {
                                                label: 'Belum Tersedia',
                                                value: 'unavailable',
                                            },
                                        ],
                                    },
                                ]}
                                tableMinWidth="min-w-[1480px]"
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-[#dbe3ee] bg-transparent py-12 text-center text-sm text-slate-500 dark:border-[#2b3648] dark:text-slate-400">
                                Belum ada booking yang terhubung ke akun ini.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </CustomerLayout>
    );
}
