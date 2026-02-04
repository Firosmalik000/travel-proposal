import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Mitra, Corporate, & Komunitas',
        meta: 'Program kerja sama umroh untuk corporate dan komunitas.',
        subtitle: 'Program kerja sama untuk kantor, komunitas, dan organisasi.',
        desc:
            'Kami menyediakan penawaran khusus untuk perjalanan rombongan dan corporate. Hubungi tim kami untuk proposal lengkap dan jadwal briefing.',
        cta: 'Hubungi Tim Mitra',
    },
    en: {
        title: 'Partners, Corporate, & Community',
        meta: 'Umrah partnership programs for corporate and communities.',
        subtitle: 'Collaboration programs for offices, communities, and organizations.',
        desc:
            'We provide special offers for group and corporate trips. Contact our team for a full proposal and briefing schedule.',
        cta: 'Contact Partner Team',
    },
};

export default function Mitra() {
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
                        Partner
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
