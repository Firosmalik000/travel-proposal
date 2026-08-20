import InputError from '@/components/input-error';
import { MotionCard, MotionSection } from '@/components/public/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/PublicLayout';
import { formatDate, formatPrice, localize } from '@/lib/public/content';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useMemo } from 'react';
import { toast } from 'sonner';

type RoomType = 'single' | 'double' | 'triple' | 'quad';

type RoomConfigurationForm = Record<RoomType, string>;

interface TravelPackageRegistrationPageProps extends SharedData {
    referralCode?: string | null;
    travelPackage: {
        id: number;
        slug: string;
        name: unknown;
        summary: unknown;
        image_path?: string | null;
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
    roomCount: number;
    paxCount: number;
    unitPrice: number;
    subtotal: number;
};

const roomTypeMeta: Array<{
    type: RoomType;
    label: string;
    capacity: number;
}> = [
    { type: 'single', label: 'Single', capacity: 1 },
    { type: 'double', label: 'Double', capacity: 2 },
    { type: 'triple', label: 'Triple', capacity: 3 },
    { type: 'quad', label: 'Quad', capacity: 4 },
];

function recommendedRoomConfiguration(
    passengerCount: number,
): RoomConfigurationForm {
    const remainingByType: Record<RoomType, number> = {
        single: 0,
        double: 0,
        triple: 0,
        quad: 0,
    };

    let remaining = Math.max(1, passengerCount);

    for (const roomType of [...roomTypeMeta].sort(
        (left, right) => right.capacity - left.capacity,
    )) {
        if (remaining < roomType.capacity) {
            continue;
        }

        const roomCount = Math.floor(remaining / roomType.capacity);
        remainingByType[roomType.type] = roomCount;
        remaining -= roomCount * roomType.capacity;
    }

    return {
        single: String(remainingByType.single),
        double: String(remainingByType.double),
        triple: String(remainingByType.triple),
        quad: String(remainingByType.quad),
    };
}

function normalizeRoomConfiguration(
    configuration: RoomConfigurationForm,
): Record<RoomType, number> {
    return {
        single: Math.max(0, Number(configuration.single) || 0),
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
            const roomCount = configuration[roomType.type];
            const unitPrice = Number(roomPrices[roomType.type] ?? 0);
            const paxCount = roomCount * roomType.capacity;

            if (roomCount < 1 || unitPrice < 1) {
                return null;
            }

            return {
                type: roomType.type,
                label: roomType.label,
                roomCount,
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
    const allocatedRoomPax = useMemo(
        () =>
            roomTypeMeta.reduce(
                (total, roomType) =>
                    total +
                    normalizedRoomConfiguration[roomType.type] *
                        roomType.capacity,
                0,
            ),
        [normalizedRoomConfiguration],
    );
    const remainingRoomPax = selectedPassengerCount - allocatedRoomPax;
    const isRoomConfigurationValid = remainingRoomPax === 0;
    const roomSummary = roomTypeMeta
        .map((roomType) => {
            const count = normalizedRoomConfiguration[roomType.type];

            return count > 0 ? `${count} ${roomType.label}` : null;
        })
        .filter(Boolean)
        .join(' + ');
    const estimatedTotalPrice = roomTypeMeta.reduce((total, roomType) => {
        const pricePerPax = Number(
            travelPackage.room_prices?.[roomType.type] ?? 0,
        );
        const roomCount = normalizedRoomConfiguration[roomType.type];

        return total + roomCount * roomType.capacity * pricePerPax;
    }, 0);
    const selectedRoomBreakdown = buildPriceBreakdownRows(
        normalizedRoomConfiguration,
        travelPackage.room_prices ?? {},
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
        const parsedValue = Math.max(0, Number(nextValue) || 0);

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
                'Komposisi kamar harus sama dengan jumlah jamaah.',
            );
            toast.error('Komposisi kamar harus sama dengan jumlah jamaah.');

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

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-8 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <MotionCard className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                        <img
                            src={
                                travelPackage.image_path || '/images/dummy.jpg'
                            }
                            alt={packageName}
                            className="h-64 w-full object-cover"
                        />
                        <div className="space-y-4 p-6">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                                    Form Pendaftaran
                                </p>
                                <h1 className="public-heading mt-2 text-2xl font-bold text-foreground">
                                    {packageName}
                                </h1>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {localize(travelPackage.summary, 'id')}
                                </p>
                            </div>

                            <div className="grid gap-2 rounded-2xl bg-muted/35 p-4 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Harga mulai
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {formatPrice(
                                            travelPackage.price,
                                            'id',
                                            travelPackage.currency,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Keberangkatan
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {travelPackage.departure_city}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Durasi
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {travelPackage.duration_days} Hari
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 rounded-2xl bg-muted/18 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Harga per Tipe Kamar
                                    </h2>
                                    <span className="text-xs text-muted-foreground">
                                        per jamaah
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    {roomTypeMeta.map((roomType) => (
                                        <div
                                            key={roomType.type}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-background/80 px-3 py-2"
                                        >
                                            <span className="text-sm font-medium text-foreground">
                                                {roomType.label}
                                            </span>
                                            <span className="text-sm font-semibold text-primary">
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
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Keberangkatan
                                    </h2>
                                    <div className="mt-3 grid gap-2">
                                        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-semibold text-foreground">
                                                    {formatDate(
                                                        travelPackage.start_date,
                                                        'id',
                                                    )}
                                                </span>
                                                <span className="text-xs text-emerald-600">
                                                    {
                                                        travelPackage.seats_available
                                                    }{' '}
                                                    seat tersedia
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {travelPackage.departure_city}
                                                {travelPackage.end_date
                                                    ? ` - Pulang ${formatDate(travelPackage.end_date, 'id')}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Link
                                href={`/paket-umroh/${travelPackage.slug}`}
                                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                Kembali ke detail paket
                            </Link>
                        </div>
                    </MotionCard>

                    <MotionCard className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                                Isi Data Jamaah
                            </p>
                            <h2 className="public-heading mt-2 text-2xl font-bold text-foreground">
                                Daftar Paket Sekarang
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tim admin akan menghubungi Anda untuk konfirmasi
                                seat, dokumen, dan langkah pembayaran.
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
                            <form onSubmit={submit} className="grid gap-5">
                                <div className="grid gap-2">
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
                                            message={form.errors.origin_city}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="referral_code">
                                            Kode Referral Agent (Opsional)
                                        </Label>
                                        <Input
                                            id="referral_code"
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
                                            message={form.errors.referral_code}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="passenger_count">
                                            Jumlah Jamaah
                                        </Label>
                                        <Input
                                            id="passenger_count"
                                            type="number"
                                            min="1"
                                            max={selectedScheduleAvailableSeats}
                                            value={form.data.passenger_count}
                                            onChange={(event) =>
                                                syncPassengerCount(
                                                    Number(event.target.value),
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maksimal sesuai seat tersedia
                                            package:{' '}
                                            {selectedScheduleAvailableSeats}
                                        </p>
                                        <InputError
                                            message={
                                                form.errors.passenger_count
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 rounded-2xl bg-muted/20 p-4">
                                    <div className="space-y-1">
                                        <Label>Komposisi Kamar</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Susun kamar sesuai jumlah pax.
                                            Contoh 3 pax bisa 1 triple, atau 1
                                            double + 1 single.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {roomTypeMeta.map((roomType) => (
                                            <div
                                                key={roomType.type}
                                                className="grid gap-2 rounded-xl bg-background p-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {roomType.label}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {roomType.capacity}{' '}
                                                            pax per kamar
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary">
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
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-2 rounded-xl bg-background/85 p-4 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Pax terisi
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {allocatedRoomPax} /{' '}
                                                {selectedPassengerCount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Sisa pax
                                            </span>
                                            <span
                                                className={
                                                    remainingRoomPax === 0
                                                        ? 'font-semibold text-emerald-600'
                                                        : 'font-semibold text-amber-600'
                                                }
                                            >
                                                {remainingRoomPax}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Ringkasan
                                            </span>
                                            <span className="text-right font-semibold text-foreground">
                                                {roomSummary || '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Estimasi total
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {formatPrice(
                                                    estimatedTotalPrice,
                                                    'id',
                                                    travelPackage.currency,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedRoomBreakdown.length > 0 ? (
                                        <div className="rounded-xl bg-background p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold text-foreground">
                                                    Rincian Harga Sesuai Tipe
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    otomatis mengikuti pilihan
                                                    kamar
                                                </span>
                                            </div>
                                            <div className="mt-3 grid gap-2">
                                                {selectedRoomBreakdown.map(
                                                    (row) => (
                                                        <div
                                                            key={row.type}
                                                            className="flex items-center justify-between gap-3 rounded-xl bg-muted/20 px-3 py-2.5"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {
                                                                        row.roomCount
                                                                    }{' '}
                                                                    kamar{' '}
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
                                </div>

                                <div className="grid gap-2">
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
                                    />
                                    <InputError message={form.errors.notes} />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing ||
                                        !isRoomConfigurationValid
                                    }
                                    className="h-11 text-sm font-semibold"
                                >
                                    {form.processing
                                        ? 'Mengirim...'
                                        : 'Kirim Pendaftaran'}
                                </Button>
                            </form>
                        )}
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
