import { Head } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';
import { usePage } from '@inertiajs/react';
import { localize, usePublicPageContent, whatsappLinkFromPhone } from '@/lib/public-content';
import { type SharedData } from '@/types';

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
            items: [
                { label: 'Instagram', href: 'https://instagram.com/asfartour', icon: Instagram },
                { label: 'Facebook', href: 'https://facebook.com/asfartour', icon: Facebook },
                { label: 'YouTube', href: 'https://youtube.com/@asfartour', icon: Youtube },
                { label: 'X (Twitter)', href: 'https://x.com/asfartour', icon: Twitter },
            ],
        },
        map: {
            title: 'Lokasi Kantor',
            badge: 'Maps',
            placeholder: 'Maps belum ditambahkan',
            note: 'Lokasi akan ditampilkan setelah data koordinat ditentukan.',
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
            items: [
                { label: 'Instagram', href: 'https://instagram.com/asfartour', icon: Instagram },
                { label: 'Facebook', href: 'https://facebook.com/asfartour', icon: Facebook },
                { label: 'YouTube', href: 'https://youtube.com/@asfartour', icon: Youtube },
                { label: 'X (Twitter)', href: 'https://x.com/asfartour', icon: Twitter },
            ],
        },
        map: {
            title: 'Office Location',
            badge: 'Maps',
            placeholder: 'Map is not available yet',
            note: 'Location will appear once coordinates are provided.',
        },
    },
};

export default function Kontak() {
    const { locale } = usePublicLocale();
    const t = content[locale];
    const pageContent = usePublicPageContent('kontak');
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const address = localize(seo.contact?.address?.full, locale, t.office.address);
    const weekdayHours = localize(seo.contact?.operatingHours?.weekday, locale, t.office.hours);
    const socialItems = Array.isArray(seo.contact?.socials) && seo.contact.socials.length > 0
        ? seo.contact.socials.map((item: Record<string, unknown>, index: number) => {
            const icons = [Instagram, Facebook, Youtube, Twitter];
            return {
                label: String(item.label ?? `Social ${index + 1}`),
                href: String(item.url ?? '#'),
                icon: icons[index % icons.length],
            };
        })
        : t.social.items;
    const whatsappLink = whatsappLinkFromPhone(seo.contact?.phone);

    return (
        <PublicLayout>
            <Head title={localize(pageContent?.title, locale, t.title)}>
                <meta name="description" content={localize(pageContent?.excerpt, locale, t.meta)} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 pt-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {t.badge}
                    </span>
                    <h1 className="public-heading text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(pageContent?.content?.heading, locale, t.heading)}
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        {localize(pageContent?.content?.description, locale, t.desc)}
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                            <h3 className="public-heading text-lg font-semibold text-foreground">{t.office.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{address}</p>
                            <p className="text-sm text-muted-foreground">{weekdayHours}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                                {t.office.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-muted px-3 py-2 text-muted-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                            <h3 className="public-heading text-lg font-semibold text-foreground">{t.contact.title}</h3>
                            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                                <p>{seo.contact?.phone ? `WhatsApp: ${seo.contact.phone}` : t.contact.whatsapp}</p>
                                <p>{seo.contact?.phone ? `Telepon: ${seo.contact.phone}` : t.contact.phone}</p>
                                <p>{seo.contact?.email ? `Email: ${seo.contact.email}` : t.contact.email}</p>
                            </div>
                            <a
                                href={whatsappLink}
                                className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground"
                            >
                                {t.contact.cta}
                            </a>
                        </div>

                        <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                            <h3 className="public-heading text-lg font-semibold text-foreground">{t.social.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{t.social.desc}</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {socialItems.map((item: (typeof socialItems)[number]) => {
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
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="public-heading text-lg font-semibold text-foreground">{t.map.title}</h3>
                            <span className="rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-foreground">
                                {localize(pageContent?.content?.map?.badge, locale, t.map.badge)}
                            </span>
                        </div>
                        {(() => {
                            const mapLink: string = seo.contact?.address?.mapLink || seo.contact?.mapLink || seo.contact?.map_link || '';
                            // Convert regular Google Maps URL to embed URL if needed
                            let embedSrc = '';
                            if (mapLink.includes('maps/embed')) {
                                embedSrc = mapLink;
                            } else if (mapLink && mapLink !== 'https://maps.google.com') {
                                // Encode the URL as a q parameter for embed
                                embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapLink)}&output=embed`;
                            } else {
                                // Fallback: embed by address
                                embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
                            }
                            return (
                                <div className="overflow-hidden rounded-2xl border border-border h-64 sm:h-80 lg:h-[420px]">
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
                        {(seo.contact?.address?.mapLink || seo.contact?.mapLink) && (
                            <a
                                href={seo.contact?.address?.mapLink || seo.contact?.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                                {locale === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'} ↗
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
