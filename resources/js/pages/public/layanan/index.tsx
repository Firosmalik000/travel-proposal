import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Layanan Kami',
        meta: 'Layanan tambahan Amanah Haramain Travel untuk perjalanan umroh.',
        subtitle: 'Layanan tambahan yang membuat perjalanan lebih nyaman.',
        services: [
            {
                title: 'Manasik terjadwal',
                desc: 'Online dan offline untuk kesiapan jamaah.',
            },
            {
                title: 'Visa dan handling',
                desc: 'Proses dokumen dibantu dari awal sampai selesai.',
            },
            {
                title: 'Tour leader',
                desc: 'Pendampingan selama perjalanan dan ibadah.',
            },
            {
                title: 'Perlengkapan',
                desc: 'Perlengkapan standar sesuai paket pilihan.',
            },
        ],
    },
    en: {
        title: 'Our Services',
        meta: 'Additional services by Amanah Haramain Travel for umrah journeys.',
        subtitle: 'Extra services that make your journey more comfortable.',
        services: [
            {
                title: 'Scheduled manasik',
                desc: 'Online and offline sessions for readiness.',
            },
            {
                title: 'Visa & handling',
                desc: 'Document process assisted from start to finish.',
            },
            {
                title: 'Tour leader',
                desc: 'Guidance throughout the journey and worship.',
            },
            {
                title: 'Travel kit',
                desc: 'Standard kit according to selected package.',
            },
        ],
    },
};

export default function Layanan() {
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
                        Services
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-4 md:grid-cols-2">
                    {t.services.map((item, idx) => (
                        <div
                            key={item.title}
                            className="flex items-start gap-4 rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                                L{idx + 1}
                            </div>
                            <div>
                                <p className="public-heading text-base font-semibold text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
