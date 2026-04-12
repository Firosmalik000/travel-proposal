import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';
import { localize, usePublicData, usePublicPageContent } from '@/lib/public-content';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function Mitra() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const page = usePublicPageContent('mitra');
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const partners = Array.isArray(publicData.partners) ? publicData.partners : [];
    const whatsappLink = seo.contact?.phone ? `https://wa.me/${String(seo.contact.phone).replace(/[^\d]/g, '')}` : 'https://wa.me/6281234567890';

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, 'Mitra')}>
                <meta name="description" content={localize(page?.excerpt, locale, 'Program kerja sama')} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {localize(page?.content?.badge, locale, 'Partner')}
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(page?.title, locale, 'Mitra')}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{localize(page?.content?.subtitle, locale, '')}</p>
                </div>
            </section>

            <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner: Record<string, unknown>) => (
                    <div key={String(partner.name)} className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                        <img src={String(partner.logo_path || '/images/dummy.jpg')} alt={String(partner.name)} className="h-16 w-16 rounded-xl object-cover" />
                        <h3 className="mt-4 text-lg font-semibold text-foreground">{String(partner.name)}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">{String(partner.category || '-')}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{localize(partner.description, locale)}</p>
                    </div>
                ))}
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    <p>{localize(page?.content?.description, locale)}</p>
                    <a href={whatsappLink} className="mt-5 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                        {localize(page?.content?.cta, locale, 'Hubungi')}
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}
