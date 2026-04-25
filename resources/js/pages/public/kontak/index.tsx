import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import {
    IslamicLantern,
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentRow1Col1,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    getPublicAddress,
    getPublicEmail,
    getPublicMapLink,
    getPublicPhoneNumber,
    getPublicSocialAccounts,
    getPublicWhatsappNumber,
    localize,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Music2, Twitter, Youtube } from 'lucide-react';

const content = {
    id: {
        title: 'Kontak',
        meta: 'Kontak resmi Asfar Tour, kantor, dan WhatsApp.',
        badge: 'Kontak Resmi',
        heading: 'Kontak Asfar Tour',
        desc: 'Kami siap membantu dari konsultasi paket sampai kebutuhan dokumen. Hubungi kami lewat kanal resmi berikut.',
        office: {
            title: 'Alamat Kantor',
            address: 'Jl. Amanah No. 12, Jakarta Pusat',
            hours: 'Senin - Sabtu, 08.00 - 20.00 WIB',
            tags: ['Kantor Resmi', 'Jam Layanan'],
        },
        contact: {
            title: 'Kontak Resmi',
            whatsapp: 'WhatsApp: 0812-3456-7890',
            phone: 'Telepon: (021) 555-1234',
            email: 'Email: info@asfartour.co.id',
            cta: 'Konsultasi WhatsApp',
        },
        social: {
            title: 'Sosial Media',
            desc: 'Ikuti update promo dan info keberangkatan terbaru.',
        },
        map: {
            title: 'Lokasi Kantor',
            badge: 'Maps',
        },
    },
    en: {
        title: 'Contact',
        meta: 'Official contact details for Asfar Tour, office, and WhatsApp.',
        badge: 'Official Contact',
        heading: 'Contact Asfar Tour',
        desc: 'We are ready to help from package consultation to document needs. Reach us through the official channels below.',
        office: {
            title: 'Office Address',
            address: 'Jl. Amanah No. 12, Central Jakarta',
            hours: 'Monday - Saturday, 08.00 - 20.00 WIB',
            tags: ['Official Office', 'Service Hours'],
        },
        contact: {
            title: 'Official Contact',
            whatsapp: 'WhatsApp: 0812-3456-7890',
            phone: 'Phone: (021) 555-1234',
            email: 'Email: info@asfartour.co.id',
            cta: 'WhatsApp Consultation',
        },
        social: {
            title: 'Social Media',
            desc: 'Follow promo updates and the latest departure info.',
        },
        map: {
            title: 'Office Location',
            badge: 'Maps',
        },
    },
};

export default function Kontak() {
    const { locale } = usePublicLocale();
    const t = content[locale];
    const pageContent = usePublicPageContent('kontak');
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const address = localize(getPublicAddress(seo), locale);
    const weekdayHours = localize(seo.contact?.operatingHours?.weekday, locale);
    const socialIconMap = {
        instagram: Instagram,
        facebook: Facebook,
        youtube: Youtube,
        tiktok: Music2,
        twitter: Twitter,
        x: Twitter,
    } as const;
    const seoSocialAccounts = getPublicSocialAccounts(seo);
    const socialItems =
        seoSocialAccounts.length > 0
            ? seoSocialAccounts.map((item, index) => ({
                  label: item.label,
                  href: item.url,
                  icon:
                      socialIconMap[
                          item.platform.toLowerCase() as keyof typeof socialIconMap
                      ] ?? [Instagram, Facebook, Youtube, Twitter][index % 4],
              }))
            : [];
    const whatsappNumber = getPublicWhatsappNumber(seo);
    const phoneNumber = getPublicPhoneNumber(seo);
    const emailAddress = getPublicEmail(seo);
    const mapLink = getPublicMapLink(seo);
    const whatsappLink = whatsappLinkFromSeo(seo);
    const contactItems = [
        whatsappNumber ? `WhatsApp: ${whatsappNumber}` : '',
        phoneNumber ? `Telepon: ${phoneNumber}` : '',
        emailAddress ? `Email: ${emailAddress}` : '',
    ].filter(Boolean);
    const hasOfficeInfo = Boolean(address || weekdayHours);
    const hasContactInfo = contactItems.length > 0;
    const hasSocialInfo = socialItems.length > 0;

    return (
        <PublicLayout>
            <Head title={localize(pageContent?.title, locale, t.title)}>
                <meta
                    name="description"
                    content={localize(pageContent?.excerpt, locale, t.meta)}
                />
            </Head>

            <MotionSection className="relative isolate overflow-hidden py-6 sm:py-10">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentZellige className="absolute top-[-34%] right-[-10%] h-[18rem] w-[18rem] rotate-[12deg] text-primary/12 sm:h-[22rem] sm:w-[22rem]" />
                    <IslamicLantern className="absolute bottom-[-28%] left-[2%] h-[18rem] w-[12rem] -rotate-[10deg] text-accent/12 sm:h-[24rem] sm:w-[16rem]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            {t.badge}
                        </span>
                        <h1 className="public-heading text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                            {localize(
                                pageContent?.content?.heading,
                                locale,
                                t.heading,
                            )}
                        </h1>
                        <p className="max-w-2xl text-muted-foreground">
                            {localize(
                                pageContent?.content?.description,
                                locale,
                                t.desc,
                            )}
                        </p>
                    </div>
                </div>
            </MotionSection>

            <MotionSection className="relative isolate overflow-hidden pb-16 sm:pb-20">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentRow1Col1 className="absolute top-[10%] left-[-6%] h-[18rem] w-[18rem] rotate-[-10deg] text-primary/10 sm:h-[22rem] sm:w-[22rem]" />
                    <IslamicOrnamentOttomanAccent className="absolute bottom-[-34%] right-[-8%] h-[22rem] w-[22rem] rotate-[14deg] text-accent/10 sm:h-[28rem] sm:w-[28rem]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <MotionGroup className="space-y-6">
                        {hasOfficeInfo ? (
                            <MotionCard className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                                <h3 className="public-heading text-lg font-semibold text-foreground">
                                    {t.office.title}
                                </h3>
                                {address ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {address}
                                    </p>
                                ) : null}
                                {weekdayHours ? (
                                    <p className="text-sm text-muted-foreground">
                                        {weekdayHours}
                                    </p>
                                ) : null}
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
                                    {t.office.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-muted px-3 py-2 text-muted-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </MotionCard>
                        ) : null}

                        {hasContactInfo ? (
                            <MotionCard className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                                <h3 className="public-heading text-lg font-semibold text-foreground">
                                    {t.contact.title}
                                </h3>
                                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    {contactItems.map((item) => (
                                        <p key={item}>{item}</p>
                                    ))}
                                </div>
                                {whatsappNumber ? (
                                    <a
                                        href={whatsappLink}
                                        className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground"
                                    >
                                        {t.contact.cta}
                                    </a>
                                ) : null}
                            </MotionCard>
                        ) : null}

                        {hasSocialInfo ? (
                            <MotionCard className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                                <h3 className="public-heading text-lg font-semibold text-foreground">
                                    {t.social.title}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t.social.desc}
                                </p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {socialItems.map(
                                        (
                                            item: (typeof socialItems)[number],
                                        ) => {
                                            const Icon = item.icon;
                                            return (
                                                <a
                                                    key={item.label}
                                                    className="group flex items-center gap-3 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted"
                                                    href={item.href}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    {item.label}
                                                </a>
                                            );
                                        },
                                    )}
                                </div>
                            </MotionCard>
                        ) : null}
                    </MotionGroup>

                    {mapLink ? (
                        <MotionCard className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="public-heading text-lg font-semibold text-foreground">
                                    {t.map.title}
                                </h3>
                                <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-foreground">
                                    {localize(
                                        pageContent?.content?.map?.badge,
                                        locale,
                                        t.map.badge,
                                    )}
                                </span>
                            </div>
                            {(() => {
                                let embedSrc = '';
                                if (mapLink.includes('maps/embed')) {
                                    embedSrc = mapLink;
                                } else {
                                    embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapLink)}&output=embed`;
                                }
                                return (
                                    <div className="h-64 overflow-hidden rounded-2xl border border-border sm:h-80 lg:h-[420px]">
                                        <iframe
                                            src={embedSrc}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={t.map.title}
                                        />
                                    </div>
                                );
                            })()}
                            <a
                                href={mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                                {locale === 'id'
                                    ? 'Buka di Google Maps'
                                    : 'Open in Google Maps'}{' '}
                                ↗
                            </a>
                        </MotionCard>
                    ) : null}
                    </div>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}
