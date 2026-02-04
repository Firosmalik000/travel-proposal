import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Custom atau Private Umroh',
        meta: 'Paket custom atau private umroh untuk keluarga dan komunitas.',
        subtitle: 'Untuk keluarga, komunitas, atau corporate dengan kebutuhan khusus.',
        desc:
            'Kami menyesuaikan jadwal, hotel, maskapai, dan itinerary sesuai kebutuhan rombongan. Hubungi admin untuk konsultasi paket custom dan penawaran khusus.',
        cta: 'Konsultasi WhatsApp',
    },
    en: {
        title: 'Custom or Private Umrah',
        meta: 'Custom or private umrah packages for families and communities.',
        subtitle: 'For families, communities, or corporate groups with special needs.',
        desc:
            'We customize schedules, hotels, airlines, and itinerary based on your group needs. Contact our admin for custom packages and special offers.',
        cta: 'WhatsApp Consultation',
    },
};

export default function Custom() {
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
                        Custom
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    <p>{t.desc}</p>
                    <a
                        href="https://wa.me/6281234567890"
                        className="mt-5 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                    >
                        {t.cta}
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
