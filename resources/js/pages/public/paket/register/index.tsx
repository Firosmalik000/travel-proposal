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

interface TravelPackageRegistrationPageProps extends SharedData {
    travelPackage: {
        id: number;
        slug: string;
        name: unknown;
        summary: unknown;
        image_path?: string | null;
        price?: number | string | null;
        currency?: string;
        departure_city?: string | null;
        duration_days?: number | null;
        schedules?: PackageSchedule[];
    };
}

type PackageSchedule = {
    id: number;
    departure_date: string;
    return_date?: string | null;
    departure_city?: string | null;
    seats_available?: number | null;
};

export default function PackageRegistrationPage() {
    const { travelPackage } =
        usePage<TravelPackageRegistrationPageProps>().props;
    const packageName = localize(travelPackage.name, 'id');
    const schedules = useMemo(
        () =>
            Array.isArray(travelPackage.schedules)
                ? travelPackage.schedules
                : [],
        [travelPackage.schedules],
    );
    const defaultScheduleId = schedules[0]?.id ? String(schedules[0].id) : '';
    const initialScheduleId =
        typeof window !== 'undefined'
            ? (new URLSearchParams(window.location.search).get('schedule') ??
              defaultScheduleId)
            : defaultScheduleId;

    const form = useForm({
        departure_schedule_id: initialScheduleId,
        full_name: '',
        phone: '',
        email: '',
        origin_city: '',
        passenger_count: '1',
        notes: '',
    });
    const selectedSchedule = useMemo(
        () =>
            schedules.find(
                (schedule) =>
                    String(schedule.id) === form.data.departure_schedule_id,
            ) ?? null,
        [schedules, form.data.departure_schedule_id],
    );
    const selectedScheduleAvailableSeats = Math.max(
        1,
        Number(selectedSchedule?.seats_available ?? 0),
    );

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        form.post(`/paket-umroh/${travelPackage.slug}/daftar`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset(
                    'full_name',
                    'phone',
                    'email',
                    'origin_city',
                    'passenger_count',
                    'notes',
                );
                form.setData('departure_schedule_id', initialScheduleId);
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

                            <div className="grid gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
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

                            {schedules.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Jadwal tersedia
                                    </h2>
                                    <div className="mt-3 grid gap-2">
                                        {schedules.map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="font-semibold text-foreground">
                                                        {formatDate(
                                                            schedule.departure_date,
                                                            'id',
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-emerald-600">
                                                        {
                                                            schedule.seats_available
                                                        }{' '}
                                                        seat tersedia
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {schedule.departure_city}
                                                    {schedule.return_date
                                                        ? ` - Pulang ${formatDate(schedule.return_date, 'id')}`
                                                        : ''}
                                                </p>
                                            </div>
                                        ))}
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

                        {form.recentlySuccessful && (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                Pendaftaran berhasil dikirim. Tim kami akan
                                segera menghubungi Anda.
                            </div>
                        )}

                        <form onSubmit={submit} className="grid gap-5">
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
                                    placeholder="Contoh: Ahmad Fauzi"
                                />
                                <InputError message={form.errors.full_name} />
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
                                    <InputError message={form.errors.phone} />
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
                                    <InputError message={form.errors.email} />
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
                                        onChange={(event) => {
                                            const rawValue = Number(
                                                event.target.value,
                                            );
                                            const clampedValue = Number.isNaN(
                                                rawValue,
                                            )
                                                ? 1
                                                : Math.min(
                                                      Math.max(rawValue, 1),
                                                      selectedScheduleAvailableSeats,
                                                  );
                                            form.setData(
                                                'passenger_count',
                                                String(clampedValue),
                                            );
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maksimal sesuai seat tersedia jadwal:{' '}
                                        {selectedScheduleAvailableSeats}
                                    </p>
                                    <InputError
                                        message={form.errors.passenger_count}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="departure_schedule_id">
                                    Pilih Jadwal Keberangkatan
                                </Label>
                                <select
                                    id="departure_schedule_id"
                                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                                    value={form.data.departure_schedule_id}
                                    onChange={(event) => {
                                        const nextScheduleId =
                                            event.target.value;
                                        form.setData(
                                            'departure_schedule_id',
                                            nextScheduleId,
                                        );

                                        const nextSchedule = schedules.find(
                                            (schedule) =>
                                                String(schedule.id) ===
                                                nextScheduleId,
                                        );
                                        const nextAvailableSeats = Math.max(
                                            1,
                                            Number(
                                                nextSchedule?.seats_available ??
                                                    0,
                                            ),
                                        );
                                        const currentPassengerCount = Math.max(
                                            1,
                                            Number(form.data.passenger_count),
                                        );

                                        if (
                                            currentPassengerCount >
                                            nextAvailableSeats
                                        ) {
                                            form.setData(
                                                'passenger_count',
                                                String(nextAvailableSeats),
                                            );
                                        }
                                    }}
                                >
                                    <option value="">
                                        Pilih nanti dengan admin
                                    </option>
                                    {schedules.map((schedule) => (
                                        <option
                                            key={schedule.id}
                                            value={schedule.id}
                                        >
                                            {formatDate(
                                                schedule.departure_date,
                                                'id',
                                            )}{' '}
                                            - {schedule.departure_city} (
                                            {schedule.seats_available} seat)
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={form.errors.departure_schedule_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Catatan Tambahan</Label>
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
                                disabled={form.processing}
                                className="h-11 text-sm font-semibold"
                            >
                                {form.processing
                                    ? 'Mengirim...'
                                    : 'Kirim Pendaftaran'}
                            </Button>
                        </form>
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
