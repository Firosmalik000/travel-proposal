import { MotionCard, MotionSection } from '@/components/public/motion';
import {
    IslamicLantern,
    IslamicOrnamentKhatam,
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentZellige,
} from '@/components/public/ornaments';
import PublicLayout from '@/layouts/PublicLayout';
import { formatDate, usePublicData } from '@/lib/public/content';
import { Head, Link } from '@inertiajs/react';

type ScheduleItem = {
    departure_date?: string | null;
    departure_city?: string | null;
    seats_available?: number | null;
    package?: {
        slug?: string | null;
        duration_days?: number | null;
    } | null;
};

const content = {
    id: {
        title: 'Keberangkatan Paket',
        meta: 'Daftar keberangkatan paket umroh terbaru berdasarkan tanggal berangkat package.',
        subtitle:
            'Semua keberangkatan mengikuti start date dan end date di package.',
        table: {
            date: 'Tanggal',
            duration: 'Durasi',
            city: 'Kota Keberangkatan',
            seat: 'Seat',
            detail: 'Detail',
            cta: 'Detail Paket',
        },
    },
    en: {
        title: 'Package Departures',
        meta: 'Latest package departure list based on package departure dates.',
        subtitle: 'Every departure follows the package start and end date.',
        table: {
            date: 'Date',
            duration: 'Duration',
            city: 'Departure City',
            seat: 'Seats',
            detail: 'Details',
            cta: 'Package Details',
        },
    },
};

export default function Jadwal() {
    const locale: 'id' | 'en' = 'id';
    const publicData = usePublicData();
    const t = content[locale];
    const schedules =
        Array.isArray(publicData.schedules) && publicData.schedules.length > 0
            ? (publicData.schedules as ScheduleItem[]).map((item) => ({
                  date: formatDate(item.departure_date, locale),
                  duration: `${item.package?.duration_days ?? 0} ${locale === 'id' ? 'Hari' : 'Days'}`,
                  city: item.departure_city,
                  seat: String(item.seats_available ?? 0),
                  href: item.package?.slug
                      ? `/paket-umroh/${item.package.slug}`
                      : '/paket-umroh',
              }))
            : [];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.meta} />
            </Head>

            <MotionSection className="relative isolate overflow-hidden py-6 sm:py-10">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentZellige className="absolute top-[-34%] right-[-10%] h-[18rem] w-[18rem] rotate-[12deg] text-primary/12 sm:h-[22rem] sm:w-[22rem]" />
                    <IslamicLantern className="absolute bottom-[-30%] left-[2%] h-[18rem] w-[12rem] -rotate-[10deg] text-accent/12 sm:h-[24rem] sm:w-[16rem]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            Keberangkatan
                        </span>
                        <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                            {t.title}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {t.subtitle}
                        </p>
                    </div>
                </div>
            </MotionSection>

            <MotionSection className="relative isolate overflow-hidden pb-16 sm:pb-20">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentKhatam className="absolute top-[12%] left-[-6%] h-[18rem] w-[18rem] -rotate-[8deg] text-primary/10 sm:h-[22rem] sm:w-[22rem]" />
                    <IslamicOrnamentOttomanAccent className="absolute right-[-8%] bottom-[-34%] h-[22rem] w-[22rem] rotate-[14deg] text-accent/10 sm:h-[28rem] sm:w-[28rem]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6">
                    <MotionCard className="rounded-2xl border border-border bg-card/90 shadow-sm">
                        {schedules.length === 0 ? (
                            <div className="flex min-h-[240px] items-center justify-center px-6 py-12 text-center">
                                <div>
                                    <p className="text-lg font-semibold text-foreground">
                                        Belum ada keberangkatan aktif
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Package yang punya tanggal berangkat
                                        akan muncul di sini.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead className="bg-muted text-foreground">
                                        <tr>
                                            <th className="px-4 py-3">
                                                {t.table.date}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t.table.duration}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t.table.city}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t.table.seat}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t.table.detail}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((item) => (
                                            <tr
                                                key={item.date}
                                                className="border-t border-border"
                                            >
                                                <td className="px-4 py-3 text-foreground">
                                                    {item.date}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {item.duration}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {item.city}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {item.seat}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={item.href}
                                                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-muted"
                                                    >
                                                        {t.table.cta}
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
