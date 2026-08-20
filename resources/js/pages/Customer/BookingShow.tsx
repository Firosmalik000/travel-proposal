import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerLayout from '@/layouts/customer-layout';
import BookingParticipantSheet, {
    type BookingParticipant,
} from '@/pages/Customer/components/BookingParticipantSheet';
import PaymentHistory, {
    type CustomerPaymentInvoice,
} from '@/pages/Customer/components/PaymentHistory';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    ExternalLink,
    FileText,
    LockKeyhole,
    MapPin,
    Pencil,
    Plus,
    ReceiptText,
    Star,
    Trash2,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

type Payment = CustomerPaymentInvoice;

type Booking = {
    id: number;
    record_type: 'booking' | 'registration';
    booking_code: string;
    status: string;
    payment_status: string;
    package_name: string;
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
    currency: string;
    participant_data_locked_at: string | null;
    participants: BookingParticipant[];
    payments: Payment[];
};

type PaymentSummaryCard = {
    label: string;
    amount: number;
    icon: LucideIcon;
};

const bookingStatusLabel: Record<string, string> = {
    registered: 'Terdaftar',
    pending: 'Menunggu Konfirmasi',
    cancelled: 'Dibatalkan',
};

const paymentStatusLabel: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overpaid: 'Lebih Bayar',
    unavailable: 'Belum Tersedia',
};

const transactionStatusMeta = {
    pending: {
        label: 'Menunggu Verifikasi',
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    },
    confirmed: {
        label: 'Terverifikasi',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    },
} as const;

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);

const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
        new Date(`${value}T00:00:00`),
    );
};

const roomConfigurationLabel = (
    roomConfiguration: Record<string, number> | null,
): string => {
    if (!roomConfiguration) {
        return '-';
    }

    const labels = [
        ['single', 'Single'],
        ['double', 'Double'],
        ['triple', 'Triple'],
        ['quad', 'Quad'],
    ] as const;

    return (
        labels
            .map(([key, label]) => {
                const count = Math.max(Number(roomConfiguration[key] ?? 0), 0);

                return count > 0 ? `${count} ${label}` : null;
            })
            .filter((value): value is string => value !== null)
            .join(' + ') || '-'
    );
};

function normalizedInitialTab(): 'overview' | 'payments' | 'participants' {
    if (typeof window === 'undefined') {
        return 'overview';
    }

    const requestedTab = (
        new URLSearchParams(window.location.search).get('tab') ?? ''
    )
        .toLowerCase()
        .replace(/[^a-z]/g, '');

    if (requestedTab === 'payments' || requestedTab === 'participants') {
        return requestedTab;
    }

    return 'overview';
}

export default function BookingShow({ booking }: { booking: Booking }) {
    const isRegistration = booking.record_type === 'registration';
    const [activeTab, setActiveTab] = useState(
        isRegistration ? 'overview' : normalizedInitialTab(),
    );
    const [participantSheetOpen, setParticipantSheetOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] =
        useState<BookingParticipant | null>(null);
    const [selectedSlot, setSelectedSlot] = useState(1);
    const locked = Boolean(booking.participant_data_locked_at);
    const completeParticipantCount = booking.participants.filter(
        (participant) => participant.is_complete,
    ).length;
    const participantProgress = Math.min(
        booking.passenger_count > 0
            ? (completeParticipantCount / booking.passenger_count) * 100
            : 0,
        100,
    );
    const paymentSummaryCards: PaymentSummaryCard[] = [
        {
            label: 'Total Tagihan',
            amount: booking.total_amount,
            icon: CircleDollarSign,
        },
        {
            label: 'Sudah Dibayar',
            amount: booking.paid_amount,
            icon: CheckCircle2,
        },
        {
            label: 'Sisa Tagihan',
            amount: booking.remaining_amount,
            icon: ReceiptText,
        },
    ];

    const openParticipantForm = (
        participant: BookingParticipant | null,
        slotNumber: number,
    ) => {
        setSelectedParticipant(participant);
        setSelectedSlot(slotNumber);
        setParticipantSheetOpen(true);
    };

    const changeTab = (tab: string) => {
        const nextTab = tab as 'overview' | 'payments' | 'participants';
        setActiveTab(nextTab);

        const url = new URL(window.location.href);
        url.searchParams.set('tab', nextTab);
        window.history.replaceState({}, '', url);
    };

    if (!isRegistration && activeTab === 'payments') {
        return <PaymentHistory booking={booking} />;
    }

    return (
        <CustomerLayout title={`Detail Booking ${booking.booking_code}`}>
            <Head title={`Booking ${booking.booking_code}`} />

            <Button variant="ghost" asChild className="mb-4 -ml-3">
                <Link href="/customer/bookings">
                    <ArrowLeft className="size-4" /> Booking Saya
                </Link>
            </Button>

            <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-[linear-gradient(135deg,#143f39_0%,#0d5c52_100%)] text-white shadow-lg shadow-emerald-950/10">
                <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                                {booking.booking_code}
                            </Badge>
                            <Badge className="bg-[#e1b86a] text-[#3b2a0e] hover:bg-[#e1b86a]">
                                {bookingStatusLabel[booking.status] ??
                                    booking.status}
                            </Badge>
                        </div>
                        <h1 className="mt-3 truncate font-serif text-2xl font-bold sm:text-3xl">
                            {booking.package_name}
                        </h1>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-emerald-50/80">
                            <span className="flex items-center gap-2">
                                <CalendarDays className="size-4" />
                                {formatDate(booking.departure_date)} -{' '}
                                {formatDate(booking.return_date)}
                            </span>
                            {booking.departure_city ? (
                                <span className="flex items-center gap-2">
                                    <MapPin className="size-4" />{' '}
                                    {booking.departure_city}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {booking.package_url ? (
                            <Button asChild variant="secondary" size="sm">
                                <Link href={booking.package_url}>
                                    <ExternalLink className="size-4" /> Detail
                                    Paket
                                </Link>
                            </Button>
                        ) : null}
                        {!isRegistration ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => changeTab('payments')}
                                >
                                    <ReceiptText className="size-4" /> Riwayat
                                    Pembayaran
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-white text-[#123f39] hover:bg-emerald-50"
                                    onClick={() => changeTab('participants')}
                                >
                                    <Users className="size-4" /> Isi Peserta
                                </Button>
                                {booking.review_url ? (
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="secondary"
                                    >
                                        <Link href={booking.review_url}>
                                            <Star className="size-4" /> Review
                                        </Link>
                                    </Button>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </div>
            </section>

            {isRegistration ? (
                <Card className="mt-5 border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <CardContent className="flex gap-3 p-4 text-sm text-amber-900 dark:text-amber-100">
                        <ClipboardList className="mt-0.5 size-5 shrink-0" />
                        <p>
                            Pendaftaran sedang diproses admin. Pengisian
                            peserta, invoice, dan review akan aktif setelah kode
                            booking diterbitkan.
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            <Tabs value={activeTab} onValueChange={changeTab} className="mt-5">
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/70 p-1">
                    <TabsTrigger value="overview" className="gap-2 py-2.5">
                        <ClipboardList className="hidden size-4 sm:block" />{' '}
                        Ringkasan
                    </TabsTrigger>
                    <TabsTrigger
                        value="payments"
                        className="gap-2 py-2.5"
                        disabled={isRegistration}
                    >
                        <ReceiptText className="hidden size-4 sm:block" />{' '}
                        Riwayat Pembayaran
                    </TabsTrigger>
                    <TabsTrigger
                        value="participants"
                        className="gap-2 py-2.5"
                        disabled={isRegistration}
                    >
                        <Users className="hidden size-4 sm:block" /> Peserta
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-5 grid gap-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Data Pendaftaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                ['Nama Pemesan', booking.full_name],
                                ['WhatsApp', booking.phone],
                                ['Email', booking.email ?? '-'],
                                ['Kota Asal', booking.origin_city],
                                [
                                    'Jumlah Pax',
                                    `${booking.passenger_count} peserta`,
                                ],
                                [
                                    'Komposisi Kamar',
                                    booking.room_summary ??
                                        roomConfigurationLabel(
                                            booking.room_configuration,
                                        ),
                                ],
                                ['Kode Referral', booking.referral_code ?? '-'],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="min-w-0 border-b pb-3 last:border-0"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold break-words">
                                        {value}
                                    </p>
                                </div>
                            ))}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-xs text-muted-foreground">
                                    Catatan
                                </p>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                    {booking.notes || '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {!isRegistration ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                            {paymentSummaryCards.map(
                                ({ label, amount, icon: Icon }) => (
                                    <Card key={label}>
                                        <CardContent className="flex items-start gap-3 p-4">
                                            <div className="rounded-xl bg-emerald-50 p-2 text-[#0d5c52] dark:bg-emerald-950/30">
                                                <Icon className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    {label}
                                                </p>
                                                <p className="mt-1 text-base font-bold">
                                                    {money(
                                                        amount,
                                                        booking.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ),
                            )}
                        </div>
                    ) : null}
                </TabsContent>

                <TabsContent value="payments" className="mt-5 grid gap-5">
                    <Card>
                        <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-semibold">
                                        Invoice {booking.booking_code}
                                    </h2>
                                    <Badge variant="outline">
                                        {paymentStatusLabel[
                                            booking.payment_status
                                        ] ?? booking.payment_status}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-2xl font-bold">
                                    {money(
                                        booking.total_amount,
                                        booking.currency,
                                    )}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm sm:min-w-72">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Terbayar
                                    </p>
                                    <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                                        {money(
                                            booking.paid_amount,
                                            booking.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Sisa
                                    </p>
                                    <p className="mt-1 font-semibold">
                                        {money(
                                            booking.remaining_amount,
                                            booking.currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                                Riwayat Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {booking.payments.map((payment, index) => (
                                <div
                                    key={payment.id}
                                    className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                                >
                                    <div className="grid size-9 place-items-center rounded-full bg-emerald-50 text-sm font-bold text-[#0d5c52] dark:bg-emerald-950/30">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold">
                                                {payment.payment_method}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    transactionStatusMeta[
                                                        payment.status
                                                    ].className
                                                }
                                            >
                                                {
                                                    transactionStatusMeta[
                                                        payment.status
                                                    ].label
                                                }
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {formatDate(payment.payment_date)}
                                            {payment.reference_number
                                                ? ` · ${payment.reference_number}`
                                                : ''}
                                        </p>
                                        {payment.notes ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {payment.notes}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p
                                            className={`text-sm font-bold ${payment.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}
                                        >
                                            {money(
                                                payment.amount,
                                                booking.currency,
                                            )}
                                        </p>
                                        {payment.status === 'pending' ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Belum mengurangi sisa tagihan
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                            {booking.payments.length === 0 ? (
                                <div className="grid place-items-center gap-2 py-10 text-center">
                                    <ReceiptText className="size-8 text-muted-foreground/40" />
                                    <p className="text-sm font-medium">
                                        Belum ada pembayaran
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Pembayaran yang dicatat admin akan
                                        tampil di sini.
                                    </p>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="participants" className="mt-5 grid gap-4">
                    <Card>
                        <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-semibold">
                                        Data Peserta
                                    </h2>
                                    {locked ? (
                                        <Badge variant="outline">
                                            <LockKeyhole className="size-3" />{' '}
                                            Dikunci Admin
                                        </Badge>
                                    ) : null}
                                </div>
                                <Badge variant="secondary" className="mt-2">
                                    {completeParticipantCount}/
                                    {booking.passenger_count} lengkap
                                </Badge>
                            </div>
                            <div className="min-w-44">
                                <div className="mb-1 flex justify-between text-xs font-medium">
                                    <span>Kelengkapan</span>
                                    <span>
                                        {Math.round(participantProgress)}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-[#0d5c52] transition-[width]"
                                        style={{
                                            width: `${participantProgress}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3">
                        {Array.from(
                            { length: booking.passenger_count },
                            (_, index) => {
                                const participant =
                                    booking.participants[index] ?? null;
                                const slotNumber = index + 1;
                                const participantPhoto =
                                    participant?.documents.photo ?? null;
                                const completedDocumentCount = participant
                                    ? Object.values(
                                          participant.documents,
                                      ).filter(Boolean).length
                                    : 0;

                                return (
                                    <Card
                                        key={
                                            participant?.id ??
                                            `slot-${slotNumber}`
                                        }
                                        className={
                                            participant?.is_complete
                                                ? 'overflow-hidden border-emerald-200 bg-emerald-50/45 shadow-sm shadow-emerald-950/5 dark:border-emerald-900/60 dark:bg-emerald-950/15'
                                                : participant
                                                  ? 'overflow-hidden border-amber-200 bg-amber-50/45 shadow-sm shadow-amber-950/5 dark:border-amber-900/60 dark:bg-amber-950/15'
                                                  : 'border-dashed bg-muted/10'
                                        }
                                    >
                                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                                            <div
                                                className={`relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 ${
                                                    participant?.is_complete
                                                        ? 'border-white bg-emerald-100 text-[#0d5c52] shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30'
                                                        : participant
                                                          ? 'border-white bg-amber-100 text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
                                                          : 'border-dashed border-muted-foreground/25 bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {participantPhoto ? (
                                                    <img
                                                        src={participantPhoto}
                                                        alt={`Pas foto ${participant?.full_name}`}
                                                        className="size-full object-cover object-top"
                                                    />
                                                ) : participant ? (
                                                    <UserRound className="size-5" />
                                                ) : (
                                                    <span className="text-sm font-bold">
                                                        {slotNumber}
                                                    </span>
                                                )}
                                                {participant ? (
                                                    <span
                                                        className={`absolute right-1 bottom-1 grid size-5 place-items-center rounded-full text-white ring-2 ring-white dark:ring-slate-950 ${participant.is_complete ? 'bg-emerald-600' : 'bg-amber-500'}`}
                                                    >
                                                        {participant.is_complete ? (
                                                            <CheckCircle2 className="size-3" />
                                                        ) : (
                                                            <AlertCircle className="size-3" />
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-semibold">
                                                        {participant?.full_name ??
                                                            `Peserta ${slotNumber}`}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            participant?.is_complete
                                                                ? 'border-emerald-200 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                : participant
                                                                  ? 'border-amber-200 bg-white text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                                                  : ''
                                                        }
                                                    >
                                                        {participant?.is_complete ? (
                                                            <CheckCircle2 className="size-3" />
                                                        ) : participant ? (
                                                            <AlertCircle className="size-3" />
                                                        ) : null}
                                                        {participant?.is_complete
                                                            ? 'Data Lengkap'
                                                            : participant
                                                              ? 'Belum Lengkap'
                                                              : 'Belum Diisi'}
                                                    </Badge>
                                                </div>
                                                {participant ? (
                                                    <>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:ring-slate-800">
                                                                {
                                                                    completedDocumentCount
                                                                }
                                                                /
                                                                {
                                                                    participant.documents_total
                                                                }{' '}
                                                                dokumen
                                                            </span>
                                                            {!participant.is_complete ? (
                                                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800">
                                                                    {
                                                                        participant.missing_count
                                                                    }{' '}
                                                                    belum
                                                                    lengkap
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                            {!locked ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={
                                                            participant
                                                                ? 'outline'
                                                                : 'default'
                                                        }
                                                        size="sm"
                                                        className={
                                                            participant
                                                                ? ''
                                                                : 'bg-[#0d5c52] hover:bg-[#0a4a42]'
                                                        }
                                                        onClick={() =>
                                                            openParticipantForm(
                                                                participant,
                                                                slotNumber,
                                                            )
                                                        }
                                                    >
                                                        {participant ? (
                                                            <Pencil className="size-4" />
                                                        ) : (
                                                            <Plus className="size-4" />
                                                        )}
                                                        {participant
                                                            ? 'Ubah'
                                                            : 'Isi Data'}
                                                    </Button>
                                                    {participant ? (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-destructive"
                                                            aria-label={`Hapus ${participant.full_name}`}
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        `Hapus data ${participant.full_name}?`,
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        `/customer/bookings/${booking.id}/participants/${participant.id}`,
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                );
                            },
                        )}
                    </div>

                    {booking.review_url ? (
                        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                                <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    <Star className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">
                                        Review Perjalanan
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Beri rating, testimoni, dan foto
                                        perjalanan Anda.
                                    </p>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={booking.review_url}>
                                        <FileText className="size-4" /> Isi
                                        Review
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : null}
                </TabsContent>
            </Tabs>

            {!isRegistration && participantSheetOpen ? (
                <BookingParticipantSheet
                    bookingId={booking.id}
                    slotNumber={selectedSlot}
                    participant={selectedParticipant}
                    open={participantSheetOpen}
                    onOpenChange={setParticipantSheetOpen}
                />
            ) : null}
        </CustomerLayout>
    );
}
