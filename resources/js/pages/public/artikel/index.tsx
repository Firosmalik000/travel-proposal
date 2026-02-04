import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Artikel & Tips Umroh',
        meta: 'Artikel dan tips umroh untuk edukasi jamaah sebelum berangkat.',
        subtitle: 'Edukasi ringan agar jamaah siap berangkat dengan tenang.',
        cta: 'Baca Artikel',
        articles: [
            {
                title: 'Checklist Persiapan Umroh 2026',
                desc: 'Panduan dokumen, perlengkapan, dan persiapan fisik.',
            },
            {
                title: 'Tips Umroh Nyaman untuk Lansia',
                desc: 'Cara menjaga stamina, obat, dan pendampingan.',
            },
            {
                title: 'Memilih Paket Umroh Sesuai Budget',
                desc: 'Perbandingan fasilitas hemat, reguler, dan premium.',
            },
        ],
    },
    en: {
        title: 'Umrah Articles & Tips',
        meta: 'Articles and tips to help pilgrims prepare before departure.',
        subtitle: 'Short reads to help you depart calmly and well-prepared.',
        cta: 'Read Article',
        articles: [
            {
                title: '2026 Umrah Preparation Checklist',
                desc: 'Documents, essentials, and physical preparation guide.',
            },
            {
                title: 'Comfort Tips for Elderly Pilgrims',
                desc: 'Stamina, medicine, and assistance tips.',
            },
            {
                title: 'Choosing a Package by Budget',
                desc: 'Compare economy, regular, and premium facilities.',
            },
        ],
    },
};

export default function Artikel() {
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
                        Insight
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {t.subtitle}
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {t.articles.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <h3 className="public-heading text-lg font-semibold text-foreground">{item.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                            <button className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
                                {t.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
