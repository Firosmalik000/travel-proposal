import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

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
            { date: '10 Maret 2026', duration: '9 Hari', city: 'Jakarta', seat: '12' },
            { date: '15 April 2026', duration: '10 Hari', city: 'Surabaya', seat: '8' },
            { date: '05 Mei 2026', duration: '12 Hari', city: 'Jakarta', seat: '20' },
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
            { date: '10 March 2026', duration: '9 Days', city: 'Jakarta', seat: '12' },
            { date: '15 April 2026', duration: '10 Days', city: 'Surabaya', seat: '8' },
            { date: '05 May 2026', duration: '12 Days', city: 'Jakarta', seat: '20' },
        ],
    },
};

export default function Jadwal() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.meta} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 pt-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Schedule
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="rounded-2xl border border-border bg-card/90 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[640px] w-full text-left text-sm">
                            <thead className="bg-muted text-foreground">
                                <tr>
                                    <th className="px-4 py-3">{t.table.date}</th>
                                    <th className="px-4 py-3">{t.table.duration}</th>
                                    <th className="px-4 py-3">{t.table.city}</th>
                                    <th className="px-4 py-3">{t.table.seat}</th>
                                    <th className="px-4 py-3">{t.table.detail}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {t.schedules.map((item) => (
                                    <tr key={item.date} className="border-t border-border">
                                        <td className="px-4 py-3 text-foreground">{item.date}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.duration}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.city}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.seat}</td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href="/paket-umroh/detail"
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
                </div>
            </section>
        </PublicLayout>
    );
}
