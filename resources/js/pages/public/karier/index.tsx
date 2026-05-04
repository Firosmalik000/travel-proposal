import { MotionSection } from '@/components/public-motion';
import PublicLayout from '@/layouts/PublicLayout';
import {
    localize,
    usePublicData,
    usePublicPageContent,
} from '@/lib/public-content';
import { Head } from '@inertiajs/react';

export default function Karier() {
    const locale: 'id' | 'en' = 'id';
    const publicData = usePublicData();
    const page = usePublicPageContent('karier');
    const jobs = Array.isArray(publicData.career_openings)
        ? publicData.career_openings
        : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, 'Karier')}>
                <meta
                    name="description"
                    content={localize(
                        page?.excerpt,
                        locale,
                        'Lowongan kerja travel',
                    )}
                />
            </Head>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                        {localize(page?.content?.badge, locale, 'Career')}
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(page?.title, locale, 'Karier')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {localize(page?.content?.subtitle, locale, '')}
                    </p>
                </div>
            </MotionSection>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {jobs.map((item: Record<string, unknown>) => (
                        <div
                            key={`${item.sort_order}_${localize(item.title, locale)}`}
                            className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <h3 className="public-heading text-lg font-semibold text-foreground">
                                {localize(item.title, locale)}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {localize(item.description, locale)}
                            </p>
                            <p className="mt-3 text-xs tracking-[0.2em] text-primary uppercase">
                                {String(item.location || '-')} •{' '}
                                {String(item.employment_type || '-')}
                            </p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {localize(item.requirements, locale)}
                            </p>
                            <button className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
                                {localize(
                                    page?.content?.cta,
                                    locale,
                                    'Lihat Detail',
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
