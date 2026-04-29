import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import PublicLayout from '@/layouts/PublicLayout';
import {
    localize,
    usePublicData,
    usePublicPageContent,
} from '@/lib/public-content';
import { Head } from '@inertiajs/react';

export default function Galeri() {
    const locale: 'id' | 'en' = 'id';
    const publicData = usePublicData();
    const page = usePublicPageContent('galeri');
    const items = Array.isArray(publicData.gallery) ? publicData.gallery : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, 'Galeri')}>
                <meta
                    name="description"
                    content={localize(
                        page?.excerpt,
                        locale,
                        'Galeri perjalanan',
                    )}
                />
            </Head>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                        {localize(page?.content?.badge, locale, 'Gallery')}
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(page?.title, locale, 'Galeri Foto & Video')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {localize(page?.content?.description, locale, '')}
                    </p>
                </div>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <MotionGroup className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {items.map((item: Record<string, unknown>) => (
                        <MotionCard
                            key={`${item.sort_order}_${localize(item.title, locale)}`}
                            className="group parallax-frame relative h-36 overflow-hidden rounded-2xl border border-border shadow-sm sm:h-44"
                            data-parallax
                            data-speed="0.28"
                        >
                            <img
                                src={String(
                                    item.image_path || '/images/dummy.jpg',
                                )}
                                alt={localize(item.title, locale)}
                                className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition duration-700 group-hover:opacity-90" />
                            <span className="absolute bottom-3 left-3 text-sm font-semibold text-white transition duration-500 group-hover:-translate-y-1">
                                {localize(item.title, locale)}
                            </span>
                        </MotionCard>
                    ))}
                </MotionGroup>
            </MotionSection>
        </PublicLayout>
    );
}
