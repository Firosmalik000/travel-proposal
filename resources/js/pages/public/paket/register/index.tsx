import InputError from '@/components/input-error';
import { MotionCard, MotionSection } from '@/components/public/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { packageImageStyle } from '@/lib/package-image-position';
import { formatDate, formatPrice, localize } from '@/lib/public/content';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    LockKeyhole,
    MapPin,
    UsersRound,
} from 'lucide-react';
import { FormEvent, useMemo } from 'react';
import { toast } from 'sonner';

type RoomType = 'double' | 'triple' | 'quad';

type RoomConfigurationForm = Record<RoomType, string>;

interface TravelPackageRegistrationPageProps extends SharedData {
    referralCode?: string | null;
    travelPackage: {
        id: number;
        slug: string;
        name: unknown;
        summary: unknown;
        image_path?: string | null;
        image_position?: {
            x: number;
            y: number;
            scale: number;
            version?: 2 | 3;
            frameScale?: number;
        } | null;
        price?: number | string | null;
        currency?: string;
        departure_city?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        seats_available?: number | null;
        duration_days?: number | null;
        room_prices?: Record<RoomType, number>;
        recommended_room_configuration?: Record<RoomType, number>;
    };
}

type PriceBreakdownRow = {
    type: RoomType;
    label: string;
    paxCount: number;
    unitPrice: number;
    subtotal: number;
};

const roomTypeMeta: Array<{
    type: RoomType;
    label: string;
    capacity: number;
}> = [
    { type: 'double', label: 'Double', capacity: 2 },
    { type: 'triple', label: 'Triple', capacity: 3 },
    { type: 'quad', label: 'Quad', capacity: 4 },
];

function recommendedRoomConfiguration(
    passengerCount: number,
): RoomConfigurationForm {
    const paxByType: Record<RoomType, number> = {
        double: 0,
        triple: 0,
        quad: 0,
    };
    const normalizedPassengerCount = Math.max(1, Math.floor(passengerCount));
    const quadPax = Math.floor(normalizedPassengerCount / 4) * 4;
    const remainingPax = normalizedPassengerCount - quadPax;

    paxByType.quad = quadPax;
    if (remainingPax === 3) {
        paxByType.triple = 3;
    } else {
        paxByType.double = remainingPax;
    }

    return {
        double: String(paxByType.double),
        triple: String(paxByType.triple),
        quad: String(paxByType.quad),
    };
}

function normalizeRoomConfiguration(
    configuration: RoomConfigurationForm,
): Record<RoomType, number> {
    return {
        double: Math.max(0, Number(configuration.double) || 0),
        triple: Math.max(0, Number(configuration.triple) || 0),
        quad: Math.max(0, Number(configuration.quad) || 0),
    };
}

function buildPriceBreakdownRows(
    configuration: Record<RoomType, number>,
    roomPrices: Partial<Record<RoomType, number>>,
): PriceBreakdownRow[] {
    return roomTypeMeta
        .map((roomType) => {
            const paxCount = configuration[roomType.type];
            const unitPrice = Number(roomPrices[roomType.type] ?? 0);

            if (paxCount < 1 || unitPrice < 1) {
                return null;
            }

            return {
                type: roomType.type,
                label: roomType.label,
                paxCount,
                unitPrice,
                subtotal: paxCount * unitPrice,
            };
        })
        .filter((row): row is PriceBreakdownRow => row !== null);
}

export default function PackageRegistrationPage() {
    const { travelPackage, referralCode, flash } =
        usePage<TravelPackageRegistrationPageProps>().props;
    const packageName = localize(travelPackage.name, 'id');
    const successMessage =
        typeof flash?.success === 'string' && flash.success.trim() !== ''
            ? flash.success.trim()
            : '';
    const defaultRoomConfiguration = recommendedRoomConfiguration(1);

    const form = useForm({
        full_name: '',
        phone: '',
        email: '',
        origin_city: '',
        referral_code: referralCode ?? '',
        passenger_count: '1',
        room_configuration_unit: 'pax',
        room_configuration: defaultRoomConfiguration,
        notes: '',
    });
    const selectedScheduleAvailableSeats = Math.max(
        1,
        Number(travelPackage.seats_available ?? 0),
    );
    const selectedPassengerCount = Math.max(
        1,
        Number(form.data.passenger_count) || 1,
    );
    const normalizedRoomConfiguration = useMemo(
        () => normalizeRoomConfiguration(form.data.room_configuration),
        [form.data.room_configuration],
    );
    const allocatedPassengerCount = useMemo(
        () =>
            roomTypeMeta.reduce(
                (total, roomType) =>
                    total + normalizedRoomConfiguration[roomType.type],
                0,
            ),
        [normalizedRoomConfiguration],
    );
    const remainingPassengerCount =
        selectedPassengerCount - allocatedPassengerCount;
    const isRoomConfigurationValid = remainingPassengerCount === 0;
    const roomSummary = roomTypeMeta
        .map((roomType) => {
            const count = normalizedRoomConfiguration[roomType.type];

            return count > 0 ? `${count} pax ${roomType.label}` : null;
        })
        .filter(Boolean)
        .join(' + ');
    const selectedRoomBreakdown = buildPriceBreakdownRows(
        normalizedRoomConfiguration,
        travelPackage.room_prices ?? {},
    );
    const estimatedTotalPrice = selectedRoomBreakdown.reduce(
        (total, row) => total + row.subtotal,
        0,
    );

    const syncPassengerCount = (nextPassengerCount: number): void => {
        const clampedValue = Math.min(
            Math.max(nextPassengerCount, 1),
            selectedScheduleAvailableSeats,
        );

        form.clearErrors('room_configuration');

        form.setData((data) => ({
            ...data,
            passenger_count: String(clampedValue),
            room_configuration: recommendedRoomConfiguration(clampedValue),
        }));
    };

    const updateRoomConfiguration = (
        roomType: RoomType,
        nextValue: string,
    ): void => {
        const parsedValue = Math.min(
            selectedPassengerCount,
            Math.max(0, Math.floor(Number(nextValue) || 0)),
        );

        form.clearErrors('room_configuration');

        form.setData('room_configuration', {
            ...form.data.room_configuration,
            [roomType]: String(parsedValue),
        });
    };

    const getSubmissionErrorMessage = (
        errors: Record<string, string | undefined>,
    ): string => {
        if (errors.passenger_count) {
            return 'Jumlah jamaah belum valid. Periksa lagi angka yang diisi.';
        }

        if (errors.room_configuration) {
            return 'Komposisi kamar harus sesuai dengan jumlah jamaah.';
        }

        if (errors.full_name || errors.phone || errors.origin_city) {
            return 'Ada data wajib yang belum lengkap. Silakan cek kembali isian form.';
        }

        return 'Pendaftaran gagal dikirim. Periksa kembali isian Anda.';
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (!isRoomConfigurationValid) {
            form.setError(
                'room_configuration',
                'Total pax Double, Triple, dan Quad harus sama dengan jumlah jamaah.',
            );
            toast.error(
                'Total komposisi tipe harga harus sama dengan jumlah jamaah.',
            );

            return;
        }

        form.post(`/paket-umroh/${travelPackage.slug}/daftar`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    'Pendaftaran berhasil dikirim. Tim kami akan segera menghubungi Anda.',
                );
            },
            onError: (errors) => {
                toast.error(getSubmissionErrorMessage(errors));
            },
        });
    };

    return (
        <PublicLayout>
            <Head title={`Daftar ${packageName}`}>
                <meta
                    name="description"
                    content={`Form pendaftaran untuk paket ${packageName}.`}
                />
            </Head>

            <MotionSection className="relative mx-auto w-full max-w-7xl px-4 pt-5 pb-16 sm:px-6 sm:pt-8">
                <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-72 w-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(159,42,57,0.10),transparent_68%)] blur-2xl" />
                <div className="mb-6 flex items-center justify-between gap-4">
                    <Link
                        href={`/paket-umroh/${travelPackage.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke detail paket
                    </Link>
                    <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
                        <LockKeyhole className="h-3.5 w-3.5 text-emerald-600" />
                        Data Anda tersimpan dengan aman
                    </div>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[0.78fr_1.22fr] xl:gap-8">
                    <MotionCard className="overflow-hidden rounded-[2rem] bg-[#25171a] text-white shadow-[0_24px_70px_-34px_rgba(37,23,26,0.75)] lg:sticky lg:top-24">
                        <div className="relative">
                            <img
                                src={
                                    travelPackage.image_path ||
                                    '/images/dummy.jpg'
                                }
                                alt={packageName}
                                className="aspect-video w-full object-cover"
                                style={packageImageStyle(
                                    travelPackage.image_position ?? undefined,
                                )}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#25171a] via-transparent to-transparent" />
                        </div>
                        <div className="space-y-5 p-5 sm:p-6">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.22em] text-white/50 uppercase">
                                    Paket pilihan Anda
                                </p>
                                <h1 className="public-heading mt-2 text-2xl font-bold text-white sm:text-3xl">
                                    {packageName}
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed text-white/60">
                                    {localize(travelPackage.summary, 'id')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-white/10 py-5 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-white/50">
                                        Mulai dari
                                    </span>
                                    <span className="font-bold text-white">
                                        {formatPrice(
                                            travelPackage.price,
                                            'id',
                                            travelPackage.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-right">
                                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                    <span className="font-semibold text-white">
                                        {travelPackage.departure_city}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-white/70">
                                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                                    <span className="font-semibold text-white">
                                        {travelPackage.duration_days} Hari
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-white">
                                        Harga per Tipe Kamar
                                    </h2>
                                    <span className="text-xs text-white/45">
                                        per jamaah
                                    </span>
                                </div>
                                <div className="grid gap-1.5">
                                    {roomTypeMeta.map((roomType) => (
                                        <div
                                            key={roomType.type}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-white/7 px-3 py-2.5 ring-1 ring-white/8"
                                        >
                                            <span className="text-sm font-medium text-white/70">
                                                {roomType.label}
                                            </span>
                                            <span className="text-sm font-bold text-white">
                                                {formatPrice(
                                                    travelPackage.room_prices?.[
                                                        roomType.type
                                                    ] ?? 0,
                                                    'id',
                                                    travelPackage.currency,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {travelPackage.start_date && (
                                <div className="rounded-2xl bg-white/7 p-4 ring-1 ring-white/8">
                                    <h2 className="text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">
                                        Jadwal perjalanan
                                    </h2>
                                    <div className="mt-2 grid gap-2">
                                        <div className="text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-semibold text-white">
                                                    {formatDate(
                                                        travelPackage.start_date,
                                                        'id',
                                                    )}
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-300">
                                                    {
                                                        travelPackage.seats_available
                                                    }{' '}
                                                    seat tersedia
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-white/50">
                                                {travelPackage.departure_city}
                                                {travelPackage.end_date
                                                    ? ` - Pulang ${formatDate(travelPackage.end_date, 'id')}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3 rounded-2xl bg-white/7 p-4 text-xs leading-5 text-white/60">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                Belum ada pembayaran pada tahap ini. Tim kami
                                akan mengonfirmasi data dan ketersediaan seat
                                lebih dahulu.
                            </div>
                        </div>
                    </MotionCard>

                    <MotionCard className="rounded-[2rem] bg-card p-5 shadow-[0_24px_80px_-42px_rgba(87,28,36,0.35)] ring-1 ring-black/5 sm:p-8 lg:p-10">
                        <div className="mb-8 border-b border-border pb-6">
                            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                                Pendaftaran jamaah
                            </p>
                            <h2 className="public-heading mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                                Amankan seat perjalanan
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                Lengkapi data kontak dan komposisi kamar. Tim
                                Asfar akan menghubungi Anda untuk konfirmasi
                                berikutnya.
                            </p>
                        </div>

                        {successMessage ? (
                            <div className="relative flex min-h-[520px] overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50 via-background to-background px-6 py-10 text-center shadow-sm">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_68%)]" />
                                <div className="relative z-10 mx-auto flex max-w-md flex-1 flex-col items-center justify-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-600 shadow-[0_12px_30px_rgba(16,185,129,0.12)]">
                                        <span className="text-3xl leading-none">
                                            ✓
                                        </span>
                                    </div>
                                    <p className="mt-5 text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
                                        Pendaftaran diterima
                                    </p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                        Terima kasih
                                    </h2>
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                                        {successMessage}
                                    </p>
                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                        <span className="rounded-full border border-emerald-200 bg-emerald-100/80 px-3 py-1 text-xs font-medium text-emerald-700">
                                            Admin akan follow up
                                        </span>
                                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                            Estimasi 7 x 24 jam
                                        </span>
                                    </div>
                                    <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                                        Sambil menunggu, Anda bisa melihat
                                        detail paket kembali atau langsung
                                        kembali ke beranda.
                                    </p>
                                    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                                        <Link
                                            href={`/paket-umroh/${travelPackage.slug}`}
                                            className="inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
                                        >
                                            Lihat Paket
                                        </Link>
                                        <Link
                                            href="/"
                                            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                                        >
                                            Ke Beranda
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="grid gap-8">
                                <section className="grid gap-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <UsersRound className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-foreground">
                                                Data pemesan
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Kontak utama yang akan kami
                                                hubungi.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            id="full_name"
                                            className="h-12 rounded-xl bg-muted/25"
                                            value={form.data.full_name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'full_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Ahmad Fauzi"
                                        />
                                        <InputError
                                            message={form.errors.full_name}
                                        />
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Nomor WhatsApp
                                            </Label>
                                            <Input
                                                id="phone"
                                                className="h-12 rounded-xl bg-muted/25"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="08xxxxxxxxxx"
                                            />
                                            <InputError
                                                message={form.errors.phone}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="h-12 rounded-xl bg-muted/25"
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="nama@email.com"
                                            />
                                            <InputError
                                                message={form.errors.email}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="origin_city">
                                                Kota Asal
                                            </Label>
                                            <Input
                                                id="origin_city"
                                                className="h-12 rounded-xl bg-muted/25"
                                                value={form.data.origin_city}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'origin_city',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Jakarta"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.origin_city
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="referral_code">
                                                Kode Referral Agent (Opsional)
                                            </Label>
                                            <Input
                                                id="referral_code"
                                                className="h-12 rounded-xl bg-muted/25"
                                                value={form.data.referral_code}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'referral_code',
                                                        event.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="Contoh: AGENT-001"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.referral_code
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="passenger_count">
                                                Jumlah Jamaah
                                            </Label>
                                            <Input
                                                id="passenger_count"
                                                type="number"
                                                className="h-12 rounded-xl bg-muted/25"
                                                min="1"
                                                max={
                                                    selectedScheduleAvailableSeats
                                                }
                                                value={
                                                    form.data.passenger_count
                                                }
                                                onChange={(event) =>
                                                    syncPassengerCount(
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maksimal{' '}
                                                {selectedScheduleAvailableSeats}{' '}
                                                jamaah sesuai seat tersedia.
                                            </p>
                                            <InputError
                                                message={
                                                    form.errors.passenger_count
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="grid gap-5 border-t border-border pt-7">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <UsersRound className="h-4 w-4" />
                                        </span>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-foreground">
                                                Komposisi tipe harga
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Tentukan jumlah jamaah untuk
                                                harga Double, Triple, atau Quad.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {roomTypeMeta.map((roomType) => (
                                            <div
                                                key={roomType.type}
                                                className="grid gap-3 rounded-2xl bg-muted/25 p-4 ring-1 ring-border/60 transition focus-within:ring-primary/40"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {roomType.label}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Harga per jamaah
                                                        </p>
                                                    </div>
                                                    <span className="text-right text-xs font-bold text-primary">
                                                        {formatPrice(
                                                            travelPackage
                                                                .room_prices?.[
                                                                roomType.type
                                                            ] ?? 0,
                                                            'id',
                                                            travelPackage.currency,
                                                        )}
                                                        /pax
                                                    </span>
                                                </div>

                                                <Input
                                                    min="0"
                                                    type="number"
                                                    max={selectedPassengerCount}
                                                    aria-label={`Jumlah jamaah harga ${roomType.label}`}
                                                    className="h-11 rounded-xl bg-background text-center text-base font-bold"
                                                    value={
                                                        form.data
                                                            .room_configuration[
                                                            roomType.type
                                                        ]
                                                    }
                                                    onChange={(event) =>
                                                        updateRoomConfiguration(
                                                            roomType.type,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <span className="text-center text-xs font-medium text-muted-foreground">
                                                    pax {roomType.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-3 rounded-2xl bg-[#25171a] p-5 text-sm text-white sm:grid-cols-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-white/55">
                                                Jamaah teralokasi
                                            </span>
                                            <span className="font-semibold text-white">
                                                {allocatedPassengerCount} /{' '}
                                                {selectedPassengerCount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-white/55">
                                                Belum dialokasikan
                                            </span>
                                            <span
                                                className={
                                                    remainingPassengerCount ===
                                                    0
                                                        ? 'font-semibold text-emerald-300'
                                                        : 'font-semibold text-amber-300'
                                                }
                                            >
                                                {Math.max(
                                                    0,
                                                    remainingPassengerCount,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-white/55">
                                                Ringkasan
                                            </span>
                                            <span className="text-right font-semibold text-white">
                                                {roomSummary || '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-white/55">
                                                Estimasi total
                                            </span>
                                            <span className="text-lg font-bold text-white">
                                                {formatPrice(
                                                    estimatedTotalPrice,
                                                    'id',
                                                    travelPackage.currency,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedRoomBreakdown.length > 0 ? (
                                        <div className="rounded-2xl bg-muted/20 p-4 sm:p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-foreground">
                                                    Rincian Harga Sesuai Tipe
                                                </p>
                                            </div>
                                            <div className="mt-3 grid gap-2">
                                                {selectedRoomBreakdown.map(
                                                    (row) => (
                                                        <div
                                                            key={row.type}
                                                            className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-0"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {
                                                                        row.paxCount
                                                                    }{' '}
                                                                    pax{' '}
                                                                    {row.label}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        row.paxCount
                                                                    }{' '}
                                                                    pax x{' '}
                                                                    {formatPrice(
                                                                        row.unitPrice,
                                                                        'id',
                                                                        travelPackage.currency,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-bold text-primary">
                                                                {formatPrice(
                                                                    row.subtotal,
                                                                    'id',
                                                                    travelPackage.currency,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                    <InputError
                                        message={form.errors.room_configuration}
                                    />
                                </section>

                                <div className="grid gap-2 border-t border-border pt-7">
                                    <Label htmlFor="notes">
                                        Catatan Tambahan
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
                                        placeholder="Contoh: ingin kamar triple, berangkat berdua, atau butuh bantuan paspor."
                                        rows={5}
                                        className="min-h-28 rounded-2xl bg-muted/25"
                                    />
                                    <InputError message={form.errors.notes} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !isRoomConfigurationValid
                                    }
                                    className="h-13 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
                                >
                                    {form.processing
                                        ? 'Mengirim...'
                                        : 'Kirim Pendaftaran'}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <LockKeyhole className="h-3.5 w-3.5 text-emerald-600" />
                                    Tidak ada pembayaran saat mengirim formulir
                                    ini.
                                </div>
                            </form>
                        )}
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
