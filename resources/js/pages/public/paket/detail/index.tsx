import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';
import { formatDate, formatPrice, localize, usePublicData, usePublicPageContent, whatsappLinkFromPhone } from '@/lib/public-content';
import { type SharedData } from '@/types';

interface TravelPackagePageProps extends SharedData {
    travelPackage?: Record<string, any>;
}

export default function PaketDetail() {
    const { locale } = usePublicLocale();
    const { travelPackage, seoSettings } = usePage<TravelPackagePageProps>().props;
    const publicData = usePublicData();
    const page = usePublicPageContent('paket-detail');
    const packageItem = travelPackage ?? (Array.isArray(publicData.packages) ? publicData.packages[0] : null);
    const seo = (seoSettings as Record<string, any>) ?? {};
    const whatsappLink = whatsappLinkFromPhone(seo.contact?.phone);

    if (!packageItem) {
        return (
            <PublicLayout>
                <Head title="Package Detail" />
                <section className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
                    <h1 className="text-2xl font-semibold text-foreground">Package tidak ditemukan.</h1>
                </section>
            </PublicLayout>
        );
    }

    const schedules = Array.isArray(packageItem.schedules) ? packageItem.schedules : [];
    const firstSchedule = schedules[0] ?? null;
    const content = packageItem.content ?? {};
    const itinerary = Array.isArray(content.itinerary) ? content.itinerary : [];
    const included = Array.isArray(content.included?.[locale] ?? content.included?.id) ? (content.included?.[locale] ?? content.included?.id) : [];
    const excluded = Array.isArray(content.excluded?.[locale] ?? content.excluded?.id) ? (content.excluded?.[locale] ?? content.excluded?.id) : [];
    const requirements = Array.isArray(content.requirements?.[locale] ?? content.requirements?.id) ? (content.requirements?.[locale] ?? content.requirements?.id) : [];
    const paymentLines = Array.isArray(content.payment?.[locale] ?? content.payment?.id) ? (content.payment?.[locale] ?? content.payment?.id) : [];
    const summaryItems = Array.isArray(packageItem.products) ? packageItem.products.map((item: Record<string, unknown>) => localize(item.name, locale)) : [];

    return (
        <PublicLayout>
            <Head title={`${localize(packageItem.name, locale)} | ${localize(page?.title, locale, 'Detail Paket')}`}>
                <meta name="description" content={localize(packageItem.summary, locale)} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12">
                <div className="relative overflow-hidden rounded-[32px] border border-border bg-card/90 p-6 shadow-lg sm:p-8 lg:rounded-[40px] lg:p-12">
                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-accent/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                                {localize(content.badge, locale, packageItem.package_type)}
                            </span>
                            <h1 className="public-heading mt-5 text-[clamp(2rem,4vw,3.4rem)] font-semibold text-foreground">
                                {localize(packageItem.name, locale)}
                                <span className="block text-[clamp(1.6rem,3.2vw,2.4rem)] text-primary">
                                    {localize(content.period, locale, firstSchedule ? formatDate(firstSchedule.departure_date, locale) : '')}
                                </span>
                            </h1>
                            <p className="mt-3 text-2xl font-semibold text-primary">
                                {formatPrice(packageItem.price, locale, packageItem.currency)}
                            </p>
                            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                <p>{firstSchedule ? `${locale === 'id' ? 'Keberangkatan' : 'Departure'}: ${formatDate(firstSchedule.departure_date, locale)}` : '-'}</p>
                                <p>{packageItem.departure_city} • {packageItem.duration_days} {locale === 'id' ? 'Hari' : 'Days'}</p>
                                <p>{firstSchedule ? `${locale === 'id' ? 'Seat tersisa' : 'Seats left'}: ${firstSchedule.seats_available}` : '-'}</p>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a href={whatsappLink} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg sm:w-auto">
                                    {localize(page?.content?.ctas?.book, locale, 'Booking')}
                                </a>
                                <button className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted sm:w-auto">
                                    {localize(page?.content?.ctas?.brochure, locale, 'Brochure')}
                                </button>
                            </div>
                        </div>
                        <div className="relative space-y-5">
                            <div className="relative flex items-center justify-center">
                                <div className="parallax-frame h-56 w-56 overflow-hidden rounded-full border-[10px] border-border shadow-lg sm:h-64 sm:w-64 lg:h-72 lg:w-72" data-parallax data-speed="0.36">
                                    <img src={packageItem.image_path || '/images/dummy.jpg'} alt={localize(packageItem.name, locale)} className="parallax-img h-full w-full object-cover" loading="lazy" />
                                </div>
                                <div className="mt-3 rounded-3xl bg-card/90 px-4 py-3 text-xs text-muted-foreground shadow-lg sm:absolute sm:-bottom-4 sm:right-0 sm:mt-0">
                                    <p className="font-semibold text-foreground">{localize(content.highlight?.title, locale, 'Highlight')}</p>
                                    <p>{localize(content.highlight?.desc, locale, localize(packageItem.summary, locale))}</p>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    {localize(page?.content?.summary_title, locale, 'Ringkasan Paket')}
                                </p>
                                <ul className="mt-3 space-y-2">
                                    {summaryItems.map((item: string) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                        <h2 className="public-heading text-lg font-semibold text-foreground">{localize(page?.content?.included_title, locale, 'Included')}</h2>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {included.map((item: string) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                        <h2 className="public-heading text-lg font-semibold text-foreground">{localize(page?.content?.excluded_title, locale, 'Excluded')}</h2>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {excluded.map((item: string) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.itinerary_title, locale, 'Itinerary')}</h2>
                <div className="mt-4 space-y-3">
                    {itinerary.map((item: Record<string, unknown>, index: number) => (
                        <details key={index} className="rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm">
                            <summary className="cursor-pointer text-sm font-semibold text-foreground">{localize(item.title, locale)}</summary>
                            <p className="mt-2 text-sm text-muted-foreground">{localize(item.desc, locale)}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.facilities_title, locale, 'Facilities')}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {summaryItems.map((item: string, idx: number) => (
                        <div key={item} className="flex items-start gap-4 rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                                F{idx + 1}
                            </div>
                            <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.requirements_title, locale, 'Requirements')}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    <ul className="space-y-2">
                        {requirements.map((item: string) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.payment_title, locale, 'Payment')}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    {paymentLines.map((line: string) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.policy_title, locale, 'Policy')}</h2>
                <div className="rounded-2xl border border-border bg-accent/30 p-5 text-sm text-foreground">
                    {localize(content.policy, locale)}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
                <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card/80 px-6 py-8 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h2 className="public-heading text-2xl font-semibold text-foreground">
                            {localize(page?.content?.cta_block?.title, locale, 'CTA')}
                        </h2>
                        <p className="mt-2 text-muted-foreground">{localize(page?.content?.cta_block?.description, locale)}</p>
                    </div>
                    <a href={whatsappLink} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:w-auto">
                        {localize(page?.content?.cta_block?.button, locale, 'WhatsApp')}
                    </a>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{localize(page?.content?.interest?.title, locale, 'Interest Form')}</h2>
                <form className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/90 p-5 shadow-sm sm:gap-4 sm:p-6 md:grid-cols-3">
                    {(Array.isArray(page?.content?.interest?.placeholders) ? page.content.interest.placeholders : []).map((item: unknown, index: number) => (
                        <input key={index} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder={localize(item, locale)} />
                    ))}
                    <div className="md:col-span-3">
                        <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:w-auto" type="submit">
                            {localize(page?.content?.interest?.button, locale, 'Submit')}
                        </button>
                    </div>
                </form>
            </section>
        </PublicLayout>
    );
}
