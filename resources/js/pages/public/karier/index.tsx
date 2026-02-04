import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Karier di Amanah Haramain',
        meta: 'Lowongan kerja di Amanah Haramain Travel.',
        subtitle: 'Bergabung dengan tim yang melayani jamaah dengan amanah.',
        cta: 'Lihat Detail',
        jobs: [
            { title: 'Customer Service', desc: 'Pengalaman 1 tahun di bidang pelayanan.' },
            { title: 'Tour Leader', desc: 'Pengalaman handling jamaah dan komunikasi baik.' },
            { title: 'Marketing Umroh', desc: 'Terbiasa dengan promosi digital dan offline.' },
        ],
    },
    en: {
        title: 'Careers at Amanah Haramain',
        meta: 'Job openings at Amanah Haramain Travel.',
        subtitle: 'Join a team that serves pilgrims with integrity.',
        cta: 'View Details',
        jobs: [
            { title: 'Customer Service', desc: '1+ year experience in service roles.' },
            { title: 'Tour Leader', desc: 'Experience assisting pilgrims with good communication.' },
            { title: 'Umrah Marketing', desc: 'Familiar with digital and offline promotion.' },
        ],
    },
};

export default function Karier() {
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
                        Career
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {t.jobs.map((item) => (
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
