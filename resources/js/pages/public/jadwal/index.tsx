import { MotionCard, MotionSection } from '@/components/public-motion';
import {
    IslamicLantern,
    IslamicOrnamentKhatam,
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { formatDate, usePublicData } from '@/lib/public-content';
import { Head, Link } from '@inertiajs/react';

const content = {
    id: {
        title: 'Jadwal Keberangkatan',
        meta: 'Jadwal keberangkatan umroh 2026 dengan seat terbaru.',
        subtitle: 'Daftar jadwal terbaru untuk keberangkatan umroh 2026.',
        table: {
            date: 'Tanggal',
            duration: 'Durasi',
            city: 'Kota Keberangkatan',
            seat: 'Seat',
            detail: 'Detail',
            cta: 'Detail Paket',
        },
        schedules: [
            {
                date: '10 Maret 2026',
                duration: '9 Hari',
                city: 'Jakarta',
                seat: '12',
                href: '/paket-umroh',
            },
            {
                date: '15 April 2026',
                duration: '10 Hari',
                city: 'Surabaya',
                seat: '8',
                href: '/paket-umroh',
            },
            {
                date: '05 Mei 2026',
                duration: '12 Hari',
                city: 'Jakarta',
                seat: '20',
                href: '/paket-umroh',
            },
        ],
    },
    en: {
        title: 'Departure Schedule',
        meta: '2026 umrah departure schedule with updated seat availability.',
        subtitle: 'Latest departure schedule for 2026 umrah journeys.',
        table: {
            date: 'Date',
            duration: 'Duration',
            city: 'Departure City',
            seat: 'Seats',
            detail: 'Details',
            cta: 'Package Details',
        },
        schedules: [
            {
                date: '10 March 2026',
                duration: '9 Days',
                city: 'Jakarta',
                seat: '12',
                href: '/paket-umroh',
            },
            {
                date: '15 April 2026',
                duration: '10 Days',
                city: 'Surabaya',
                seat: '8',
                href: '/paket-umroh',
            },
            {
                date: '05 May 2026',
                duration: '12 Days',
                city: 'Jakarta',
                seat: '20',
                href: '/paket-umroh',
            },
        ],
    },
};

export default function Jadwal() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const t = content[locale];
    const schedules =
        Array.isArray(publicData.schedules) && publicData.schedules.length > 0
            ? publicData.schedules.map((item: Record<string, any>) => ({
                  date: formatDate(item.departure_date, locale),
                  duration: `${item.package?.duration_days ?? 0} ${locale === 'id' ? 'Hari' : 'Days'}`,
                  city: item.departure_city,
                  seat: String(item.seats_available ?? 0),
                  href: item.package?.slug
                      ? `/paket-umroh/${item.package.slug}`
                      : '/paket-umroh',
              }))
            : t.schedules;

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
                            Schedule
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
                    <IslamicOrnamentOttomanAccent className="absolute bottom-[-34%] right-[-8%] h-[22rem] w-[22rem] rotate-[14deg] text-accent/10 sm:h-[28rem] sm:w-[28rem]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6">
                    <MotionCard className="rounded-2xl border border-border bg-card/90 shadow-sm">
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
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
