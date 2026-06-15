import GlobalFaviconHead from '@/components/global-favicon-head';
import PublicSeoHead from '@/components/public/seo-head';
import {
    formatPrice,
    getPublicAddress,
    getPublicEmail,
    getPublicPhoneNumber,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Bolt,
    Building2,
    CalendarDays,
    Camera,
    Check,
    ChevronDown,
    Clock3,
    Droplets,
    FileText,
    Headset,
    Hotel,
    Instagram,
    MapPin,
    MessageCircle,
    Music2,
    Plane,
    PlayCircle,
    ShieldCheck,
    Soup,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type CmsRecord = Record<string, unknown>;

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function splitLines(value: unknown): string[] {
    return text(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function iconFor(name: unknown) {
    const normalized = text(name).toLowerCase();

    switch (normalized) {
        case 'plane':
            return Plane;
        case 'hotel':
            return Hotel;
        case 'food':
            return Soup;
        case 'users':
            return Users;
        case 'pin':
            return MapPin;
        case 'clock':
            return Clock3;
        case 'cal':
            return CalendarDays;
        case 'user':
            return UserRound;
        case 'doc':
            return FileText;
        case 'bottle':
            return Droplets;
        case 'cam':
            return Camera;
        case 'bolt':
            return Bolt;
        case 'headset':
            return Headset;
        default:
            return ShieldCheck;
    }
}

function normalizeItems(
    items: unknown,
    defaults: Array<Record<string, string>>,
): Array<Record<string, string>> {
    if (Array.isArray(items)) {
        return items.map((item, index) => ({
            ...defaults[index],
            ...(typeof item === 'object' && item !== null
                ? (item as Record<string, string>)
                : {}),
        }));
    }

    return defaults;
}

function normalizeContent(content: CmsRecord): CmsRecord {
    const hero = (content.hero as CmsRecord) ?? {};
    const stats = Array.isArray(content.stats) ? content.stats : [];
    const services = Array.isArray((content.services as CmsRecord)?.items)
        ? (((content.services as CmsRecord).items as unknown[]) ?? [])
        : [];

    return {
        ...content,
        hero: {
            promo_pill: text(
                hero.promo_pill,
                'PROGRAM TERBATAS - SEATS TERBATAS',
            ),
            badge: text(hero.badge, text(hero.label, 'PAKET UMROH')),
            title: text(hero.title, 'SPECIAL 9 HARI\nAgustus'),
            duration_value: text(hero.duration_value, '9'),
            duration_suffix: text(hero.duration_suffix, 'HARI'),
            nav_items: Array.isArray(hero.nav_items)
                ? hero.nav_items
                : ['Paket Umroh', 'Fasilitas', 'Testimoni', 'FAQ'],
            nav_active_label: text(hero.nav_active_label, 'Paket Umroh'),
            subtitle: text(hero.subtitle, 'Berangkat Agustus 2026'),
            subtitle_badge: text(hero.subtitle_badge, '9 Hari Program'),
            description: text(
                hero.description,
                'Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.',
            ),
            checklist_items: Array.isArray(hero.checklist_items)
                ? hero.checklist_items
                : [
                      'Izin Resmi Kemenag RI',
                      '10+ Tahun Pengalaman',
                      'FREE Konsultasi Jabodetabek',
                  ],
            cta_label: text(hero.cta_label, 'Konsultasi Gratis'),
            secondary_cta_label: text(hero.secondary_cta_label, 'Lihat Paket'),
            navbar_cta_label: text(hero.navbar_cta_label, 'Konsultasi Gratis'),
            pricing_cards: normalizeItems(hero.pricing_cards, [
                { label: 'QUAD', price: 'Rp 33.500.000', note: '/Pax' },
                { label: 'TRIPLE', price: 'Rp 35.000.000', note: '/Pax' },
                { label: 'DOUBLE', price: 'Rp 36.500.000', note: '/Pax' },
            ]),
            feature_cards: normalizeItems(hero.feature_cards, [
                {
                    icon: 'plane',
                    title: 'Direct Flight',
                    description: 'Lion Air / Saudia',
                },
                {
                    icon: 'hotel',
                    title: 'Hotel Makkah',
                    description: 'Maysan Al Maqom',
                },
                {
                    icon: 'hotel',
                    title: 'Hotel Madinah',
                    description: 'Arkan Al Manar',
                },
                {
                    icon: 'food',
                    title: 'Konsumsi',
                    description: 'Makan 3x Sehari',
                },
            ]),
            free_badge_title: text(hero.free_badge_title, 'FREE'),
            free_badge_label: text(hero.free_badge_label, 'KONSULTASI'),
            free_badge_note: text(hero.free_badge_note, 'SE-JABODETABEK'),
        },
        package_details: {
            title: text(
                (content.package_details as CmsRecord)?.title,
                'PAKET KAMI',
            ),
            heading: text(
                (content.package_details as CmsRecord)?.heading,
                'Pilih Paket Umroh Terbaik\nUntuk Perjalanan Ibadah Anda',
            ),
            description: text(
                (content.package_details as CmsRecord)?.description,
                'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
            ),
            items: normalizeItems(
                (content.package_details as CmsRecord)?.items,
                [
                    {
                        icon: 'plane',
                        title: 'Maskapai',
                        description: 'Lion Air / Saudia\nDirect Flight',
                    },
                    {
                        icon: 'hotel',
                        title: 'Hotel Makkah',
                        description: 'Maysan Al Maqom\nBintang 4',
                    },
                    {
                        icon: 'hotel',
                        title: 'Hotel Madinah',
                        description: 'Arkan Al Manar\nBintang 3',
                    },
                    {
                        icon: 'cal',
                        title: 'Durasi',
                        description: '9 Hari\n7 Malam',
                    },
                    {
                        icon: 'food',
                        title: 'Makan',
                        description: 'Makan 3x\nSehari',
                    },
                    {
                        icon: 'user',
                        title: 'Mutawif',
                        description: 'Tour Leader & Mutawif\nBerpengalaman',
                    },
                    {
                        icon: 'doc',
                        title: 'Visa',
                        description: 'Visa Umroh\nResmi',
                    },
                    {
                        icon: 'bottle',
                        title: 'Zam-zam',
                        description: 'Air Zam-zam\n5 Liter',
                    },
                    {
                        icon: 'cam',
                        title: 'Dokumentasi',
                        description: 'Dokumentasi\nProfesional',
                    },
                ],
            ),
        },
        packages: {
            ...((content.packages as CmsRecord) ?? {}),
            title: text((content.packages as CmsRecord)?.title, 'PAKET KAMI'),
            heading: text(
                (content.packages as CmsRecord)?.heading,
                'Pilih Paket Umroh Terbaik\nUntuk Perjalanan Ibadah Anda',
            ),
            description: text(
                (content.packages as CmsRecord)?.description,
                'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
            ),
            more_packages_label: text(
                (content.packages as CmsRecord)?.more_packages_label,
                'Lihat Semua Paket',
            ),
            selected_package_ids: Array.isArray(
                (content.packages as CmsRecord)?.selected_package_ids,
            )
                ? (
                      (content.packages as CmsRecord)
                          .selected_package_ids as Array<unknown>
                  )
                      .map((value) => Number(value))
                      .filter((value) => Number.isFinite(value))
                      .slice(0, 3)
                : [],
        },
        included: {
            section_badge: text(
                (content.included as CmsRecord)?.section_badge,
                'DETAIL PAKET',
            ),
            section_heading: text(
                (content.included as CmsRecord)?.section_heading,
                'Yang Termasuk\ndalam Paket',
            ),
            title: text(
                (content.included as CmsRecord)?.title,
                'TERMASUK DALAM PAKET',
            ),
            image_url: text(
                (content.included as CmsRecord)?.image_url,
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
            ),
            items: Array.isArray((content.included as CmsRecord)?.items)
                ? (content.included as CmsRecord).items
                : [
                      'Tiket Pesawat PP Direct Flight',
                      'Air Zam-zam 5 Liter',
                      'Hotel Sesuai Paket',
                      'TL & Mutawif',
                      'Visa Umroh Resmi',
                      'Handling',
                      'Makan 3x Sehari',
                      'Dokumentasi',
                  ],
        },
        excluded: {
            title: text(
                (content.excluded as CmsRecord)?.title,
                'TIDAK TERMASUK DALAM PAKET',
            ),
            image_url: text(
                (content.excluded as CmsRecord)?.image_url,
                'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=85',
            ),
            items: Array.isArray((content.excluded as CmsRecord)?.items)
                ? (content.excluded as CmsRecord).items
                : [
                      'Pembuatan Paspor',
                      'Vaksin Meningitis',
                      'Pengeluaran Pribadi',
                      'Kelebihan Bagasi',
                      'Biaya Perubahan Jadwal (jika ada)',
                  ],
        },
        reasons: {
            title: text(
                (content.reasons as CmsRecord)?.title,
                'KENAPA PILIH KAMI',
            ),
            heading: text(
                (content.reasons as CmsRecord)?.heading,
                'Lebih dari Sekadar Perjalanan,\nIni Pengalaman Berharga',
            ),
            items: normalizeItems(
                (content.reasons as CmsRecord)?.items ?? services,
                [
                    {
                        icon: 'users',
                        title: 'Pembimbing Berpengalaman',
                        description:
                            'Tim mutawif ramah & profesional mendampingi setiap langkah ibadah Anda di Tanah Suci.',
                    },
                    {
                        icon: 'hotel',
                        title: 'Hotel Nyaman & Strategis',
                        description:
                            'Maysan Al Maqom (550m dari Haram) & Arkan Al Manar (200m dari Nabawi).',
                    },
                    {
                        icon: 'plane',
                        title: 'Direct Flight',
                        description:
                            'Penerbangan langsung tanpa transit - lebih nyaman dan efisien waktu untuk jamaah.',
                    },
                    {
                        icon: 'cam',
                        title: 'Dokumentasi Profesional',
                        description:
                            'Setiap momen ibadah diabadikan secara profesional sebagai kenangan seumur hidup.',
                    },
                    {
                        icon: 'pin',
                        title: 'Izin Resmi Kemenag RI',
                        description:
                            'Travel resmi berizin PPIU dari Kementerian Agama RI. Aman, legal, dan terpercaya.',
                    },
                    {
                        icon: 'headset',
                        title: 'Support 24/7',
                        description:
                            'Tim kami siap membantu sebelum, selama, dan setelah perjalanan ibadah Anda.',
                    },
                ],
            ),
            stats: normalizeItems(
                (content.reasons as CmsRecord)?.stats ?? stats,
                [
                    {
                        value: '10+',
                        label: 'Tahun Pengalaman',
                        note: 'Sejak 2015',
                    },
                    {
                        value: '2.500+',
                        label: 'Jamaah Telah Berangkat',
                        note: 'Dari seluruh Indonesia',
                    },
                    {
                        value: '98%',
                        label: 'Kepuasan Jamaah',
                        note: 'Rating rata-rata 4.9',
                    },
                ],
            ),
        },
        gallery: {
            title: text(
                (content.gallery as CmsRecord)?.title,
                'DOKUMENTASI JAMAAH',
            ),
            heading: text(
                (content.gallery as CmsRecord)?.heading,
                'Momen Berharga\nBersama Asfar Tour',
            ),
            description: text(
                (content.gallery as CmsRecord)?.description,
                'Setiap momen ibadah diabadikan secara profesional - kenangan yang akan selalu diingat.',
            ),
            cta_label: text(
                (content.gallery as CmsRecord)?.cta_label,
                'Lihat Semua Dokumentasi',
            ),
        },
        testimonials: {
            title: text(
                (content.testimonials as CmsRecord)?.title,
                'TESTIMONI JAMAAH',
            ),
            heading: text(
                (content.testimonials as CmsRecord)?.heading,
                'Apa Kata Mereka?',
            ),
            description: text(
                (content.testimonials as CmsRecord)?.description,
                'Ribuan jamaah telah mempercayakan perjalanan ibadahnya bersama Asfar Tour.',
            ),
            more_label: text(
                (content.testimonials as CmsRecord)?.more_label,
                'Lihat Semua Testimoni',
            ),
        },
        faq: {
            title: text(
                (content.faq as CmsRecord)?.title,
                'PERTANYAAN YANG SERING DIAJUKAN',
            ),
            description: text(
                (content.faq as CmsRecord)?.description,
                'Temukan jawaban untuk pertanyaan yang paling sering ditanyakan calon jamaah.',
            ),
        },
        location: {
            title: text(
                (content.location as CmsRecord)?.title,
                'Kunjungi Kantor Kami',
            ),
            description: text(
                (content.location as CmsRecord)?.description,
                'Kami siap melayani konsultasi umroh secara langsung maupun online.',
            ),
            office_hours_title: text(
                (content.location as CmsRecord)?.office_hours_title,
                'Jam Operasional',
            ),
            visit_points: Array.isArray(
                (content.location as CmsRecord)?.visit_points,
            )
                ? (content.location as CmsRecord).visit_points
                : [
                      'Kantor Dapat Dikunjungi',
                      'Konsultasi Langsung',
                      'Tim Siap Membantu',
                      'Lokasi Mudah Diakses',
                  ],
            whatsapp_label: text(
                (content.location as CmsRecord)?.whatsapp_label,
                'Konsultasi via WhatsApp',
            ),
            maps_label: text(
                (content.location as CmsRecord)?.maps_label,
                'Buka Google Maps',
            ),
            maps_cta_label: text(
                (content.location as CmsRecord)?.maps_cta_label,
                'Lihat Lokasi di Google Maps',
            ),
        },
        cta: {
            badge: text(
                (content.cta as CmsRecord)?.badge,
                'JANGAN TUNDA NIAT BAIK ANDA',
            ),
            title: text(
                (content.cta as CmsRecord)?.title,
                'Jangan Tunda Niat\nBaik Anda',
            ),
            description: text(
                (content.cta as CmsRecord)?.description,
                'Konsultasikan perjalanan ibadah Anda sekarang bersama tim Asfar Tour. Gratis, tanpa syarat, tanpa tekanan.',
            ),
            button_label: text(
                (content.cta as CmsRecord)?.button_label,
                'Konsultasi via WhatsApp',
            ),
            badges: Array.isArray((content.cta as CmsRecord)?.badges)
                ? (content.cta as CmsRecord).badges
                : [
                      'Resmi Kemenag',
                      'Fast Response',
                      'Amanah',
                      'Support 24 Jam',
                  ],
        },
        footer: {
            brand: text((content.footer as CmsRecord)?.brand, 'ASFAR TOUR'),
            subtitle: text(
                (content.footer as CmsRecord)?.subtitle,
                'HAJI & UMRAH',
            ),
            description: text(
                (content.footer as CmsRecord)?.description,
                'Jelas Rencananya, Terjamin Amanahnya. Melayani perjalanan umroh dengan sistem transparan & amanah sejak 2015.',
            ),
            package_links: Array.isArray(
                (content.footer as CmsRecord)?.package_links,
            )
                ? (content.footer as CmsRecord).package_links
                : [
                      'Umroh Quad',
                      'Umroh Triple',
                      'Umroh Double',
                      'Custom/Private',
                  ],
            company_links: Array.isArray(
                (content.footer as CmsRecord)?.company_links,
            )
                ? (content.footer as CmsRecord).company_links
                : ['Tentang Kami', 'Legalitas', 'Kantor', 'Galeri'],
            legal_links: Array.isArray(
                (content.footer as CmsRecord)?.legal_links,
            )
                ? (content.footer as CmsRecord).legal_links
                : [
                      'Syarat & Ketentuan',
                      'Kebijakan Privasi',
                      'Kebijakan Refund',
                      'Disclaimer',
                  ],
            bottom_links: Array.isArray(
                (content.footer as CmsRecord)?.bottom_links,
            )
                ? (content.footer as CmsRecord).bottom_links
                : ['Privasi', 'Syarat', 'Refund'],
            whatsapp_float_label: text(
                (content.footer as CmsRecord)?.whatsapp_float_label,
                'Konsultasi Gratis',
            ),
            copyright: text(
                (content.footer as CmsRecord)?.copyright,
                '© 2026 Asfar Tour · Terdaftar Kemenag RI · PPIU-2026-001 · Jakarta Selatan',
            ),
        },
    };
}

const sectionMotion = {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 },
    transition: { duration: 0.45 },
} as const;

export default function PublicLandingPage() {
    const page = usePage<SharedData>();
    const publicData = usePublicData() as CmsRecord;
    const homePage = usePublicPageContent('home_landing_mockup');
    const content = useMemo(
        () => normalizeContent((homePage?.content as CmsRecord) ?? {}),
        [homePage?.content],
    );
    const seoSettings = page.props?.seoSettings ?? {};
    const branding = page.props?.branding;
    const publicBranding = page.props?.publicBranding;

    const companyName = text(branding?.company_name, 'Asfar Tour');
    const companySubtitle = text(branding?.company_subtitle, 'Haji & Umrah');
    const resolvedLogoPath =
        publicBranding?.logo_path ?? branding?.logo_path ?? '/logo.svg';
    const whatsappHref = whatsappLinkFromSeo(seoSettings);
    const address = text(getPublicAddress(seoSettings ?? {}));
    const phone = text(getPublicPhoneNumber(seoSettings ?? {}));
    const email = text(getPublicEmail(seoSettings ?? {}));
    const seoContact = ((seoSettings as CmsRecord).contact as CmsRecord) ?? {};
    const operatingHours = ((seoContact.operatingHours as CmsRecord) ??
        {}) as CmsRecord;
    const officeHours = [
        text(operatingHours.weekday),
        text(operatingHours.weekend),
    ].filter(Boolean);
    const mapQuery = encodeURIComponent(address || companyName);
    const hero = (content.hero as CmsRecord) ?? {};
    const heroTitleLines = splitLines(hero.title);
    const heroPrimaryTitle = heroTitleLines[0] ?? '';
    const heroHighlightTitle = heroTitleLines[1] ?? '';
    const navItems = Array.isArray(hero.nav_items)
        ? (hero.nav_items as Array<unknown>)
        : [];
    const pricingCards = (hero.pricing_cards as Array<CmsRecord>) ?? [];
    const heroFeatureCards = (hero.feature_cards as Array<CmsRecord>) ?? [];
    const packageDetails = (content.package_details as CmsRecord) ?? {};
    const packagesContent = (content.packages as CmsRecord) ?? {};
    const included = (content.included as CmsRecord) ?? {};
    const excluded = (content.excluded as CmsRecord) ?? {};
    const reasons = (content.reasons as CmsRecord) ?? {};
    const reasonItems = (reasons.items as Array<CmsRecord>) ?? [];
    const reasonStats = (reasons.stats as Array<CmsRecord>) ?? [];
    const galleryImages = Array.isArray(publicData.gallery)
        ? (publicData.gallery as Array<CmsRecord>)
              .map((item) => text(item.image_path))
              .filter(Boolean)
              .slice(0, 7)
        : [];
    const testimonials = Array.isArray(publicData.testimonials)
        ? (publicData.testimonials as Array<CmsRecord>).slice(0, 4)
        : [];
    const faqs = Array.isArray(publicData.faqs)
        ? (publicData.faqs as Array<CmsRecord>).slice(0, 6)
        : [];
    const location = (content.location as CmsRecord) ?? {};
    const cta = (content.cta as CmsRecord) ?? {};
    const footer = (content.footer as CmsRecord) ?? {};
    const [activeFaq, setActiveFaq] = useState<number | null>(0);
    const allPackages = Array.isArray(publicData.packages)
        ? (publicData.packages as Array<CmsRecord>)
        : [];
    const selectedPackageIds = Array.isArray(
        packagesContent.selected_package_ids,
    )
        ? (packagesContent.selected_package_ids as Array<number>)
        : [];
    const fallbackPackages = allPackages.slice(0, 3);
    const selectedPackages =
        selectedPackageIds.length > 0
            ? selectedPackageIds
                  .map((id) =>
                      allPackages.find(
                          (item) => Number(item.id ?? 0) === Number(id),
                      ),
                  )
                  .filter((item): item is CmsRecord => Boolean(item))
                  .slice(0, 3)
            : fallbackPackages;
    const packageSlots: Array<CmsRecord | null> =
        selectedPackages.length <= 1
            ? [null, selectedPackages[0] ?? null, null]
            : selectedPackages.length === 2
              ? [selectedPackages[0] ?? null, selectedPackages[1] ?? null, null]
              : [
                    selectedPackages[0] ?? null,
                    selectedPackages[1] ?? null,
                    selectedPackages[2] ?? null,
                ];

    const navHrefFor = (item: unknown, index: number): string => {
        const label = text(item).toLowerCase();

        if (label.includes('paket')) {
            return '#detail';
        }

        if (label.includes('fasilitas') || label.includes('keunggulan')) {
            return '#why';
        }

        if (label.includes('testi')) {
            return '#testi';
        }

        if (label.includes('faq')) {
            return '#faq';
        }

        if (
            label.includes('lokasi') ||
            label.includes('kantor') ||
            label.includes('kontak')
        ) {
            return '#alamat';
        }

        return index === 0 ? '#landing-top' : '#landing-top';
    };

    return (
        <>
            <GlobalFaviconHead />
            <PublicSeoHead />
            <Head title={`${companyName} | Landing`} />

            <style>{`
                html{scroll-behavior:smooth}
                body{background:#f6e7c6;color:#40241d;overflow-x:hidden}
                .font-display{font-family:'Playfair Display',serif}
                .wrap{width:100%;max-width:1240px;margin:0 auto;padding-left:16px;padding-right:16px}
                .hero-bleed{position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;width:100vw}
                .landing-shell{border:1px solid rgba(113,2,20,.08);background:rgba(255,252,247,.98);box-shadow:0 16px 40px rgba(113,2,20,.055)}
                @media(min-width:640px){.wrap{padding-left:22px;padding-right:22px}}
                @media(min-width:1024px){.wrap{padding-left:28px;padding-right:28px}}
            `}</style>

            <header className="sticky top-0 z-40 border-b border-[#710214]/10 bg-[#fdf3e3]/95 backdrop-blur">
                <div className="wrap flex h-[55px] items-center justify-between gap-3">
                    <a href="#landing-top" className="flex items-center gap-2">
                        <img
                            src={resolvedLogoPath}
                            alt={companyName}
                            className="h-10 w-10 object-contain"
                        />
                        <div>
                            <div className="font-display text-[18px] leading-none font-black text-[#710214]">
                                {text(footer.brand, companyName).toUpperCase()}
                            </div>
                            <div className="mt-[2px] text-[7px] font-black tracking-[.28em] text-[#c88b2d] uppercase">
                                {text(footer.subtitle, companySubtitle)}
                            </div>
                        </div>
                    </a>
                    <nav className="hidden gap-7 text-[9px] font-black md:flex">
                        {navItems.map((item, index) => {
                            const label = text(item);
                            const href = navHrefFor(item, index);

                            return (
                                <a
                                    key={`nav-${index}`}
                                    href={href}
                                    className={
                                        label ===
                                        text(
                                            hero.nav_active_label,
                                            'Paket Umroh',
                                        )
                                            ? 'border-b-2 border-[#710214] pb-2 text-[#710214]'
                                            : 'text-[#40241d]'
                                    }
                                >
                                    {label}
                                </a>
                            );
                        })}
                    </nav>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-[#710214] px-3 py-2 text-[10px] font-black text-white sm:px-5 sm:py-2.5"
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {text(hero.navbar_cta_label, 'Konsultasi Gratis')}
                    </a>
                </div>
            </header>

            <main className="wrap pb-10">
                <div id="landing-top" />

                <section className="hero-bleed overflow-hidden rounded-b-[46px] bg-[linear-gradient(90deg,rgba(255,247,240,.98)_0%,rgba(255,243,232,.95)_34%,rgba(255,241,230,.62)_55%,rgba(255,241,230,.18)_100%),url('https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-[center_right] shadow-[0_24px_60px_rgba(113,2,20,.10)]">
                    <div className="wrap grid min-h-[720px] items-center lg:grid-cols-[.56fr_.44fr]">
                        <motion.div
                            className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-18"
                            {...sectionMotion}
                        >
                            <span className="inline-flex rounded-full border border-[#c88b2d]/30 bg-white/90 px-4 py-2 text-[10px] font-black tracking-[.2em] text-[#a46a16] uppercase shadow-sm">
                                {text(hero.promo_pill)}
                            </span>
                            <span className="inline-block rounded-full border border-[#c88b2d]/45 bg-white/95 px-4 py-2 text-[10px] font-black tracking-[.24em] text-[#c88b2d] uppercase">
                                {text(hero.badge)}
                            </span>
                            <h1 className="font-display mt-5 text-[48px] leading-[.84] font-black tracking-tight text-[#710214] sm:text-[64px] lg:text-[88px]">
                                <span className="block">
                                    {heroPrimaryTitle || 'SPECIAL UMROH'}
                                </span>
                                <span className="block text-[#c88b2d]">
                                    {heroHighlightTitle || 'AGUSTUS'}
                                </span>
                                <span className="mt-3 inline-flex translate-y-[-2px] items-center rounded-[18px] bg-[#710214] px-4 py-2 font-sans text-[28px] text-white shadow-[0_10px_24px_rgba(113,2,20,.18)] sm:text-[34px] lg:text-[40px]">
                                    {text(hero.duration_value)}
                                    <small className="ml-1 text-[10px]">
                                        {text(hero.duration_suffix)}
                                    </small>
                                </span>
                            </h1>
                            <p className="mt-5 flex flex-wrap items-center gap-3 text-[17px] leading-snug font-black text-[#2c1712] sm:text-[18px]">
                                <span>{text(hero.subtitle)}</span>
                                <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-[#710214] shadow-sm">
                                    {text(hero.subtitle_badge)}
                                </span>
                            </p>
                            <p className="mt-5 max-w-[560px] text-[14px] leading-[1.9] text-[#40241d]/80">
                                {text(hero.description)}
                            </p>

                            <div className="mt-8 grid w-full max-w-[540px] grid-cols-1 gap-4 sm:grid-cols-3">
                                {pricingCards.map((card, index) => (
                                    <motion.div
                                        key={`pricing-${index}`}
                                        className="mb-3 rounded-[18px] border border-[#710214]/10 bg-white/95 p-4 shadow-[0_8px_24px_rgba(113,2,20,.09)] sm:p-5"
                                        whileHover={{ y: -6 }}
                                    >
                                        <div className="flex items-center gap-1 text-[12px] font-black text-[#710214]">
                                            <Users className="h-4 w-4" />
                                            {text(card.label)}
                                        </div>
                                        <p className="mt-4 text-[20px] font-black text-[#40241d]">
                                            {text(card.price)}
                                        </p>
                                        <p className="mt-2 mb-1 text-[9px] font-bold text-[#40241d]/60">
                                            {text(card.note)}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#710214] px-5 py-3 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(113,2,20,.18)]"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    {text(hero.cta_label)}
                                </a>
                                <a
                                    href={
                                        text(
                                            hero.secondary_cta_href,
                                            '/paket-umroh',
                                        ) || '#detail'
                                    }
                                    className="inline-flex items-center rounded-xl border border-[#710214]/20 bg-white px-5 py-3 text-[12px] font-black text-[#710214]"
                                >
                                    {text(hero.secondary_cta_label)}
                                </a>
                            </div>

                            <div className="mt-7 flex flex-wrap gap-3 text-[12px] font-bold text-[#40241d]">
                                {(
                                    (hero.checklist_items as Array<unknown>) ??
                                    []
                                ).map((item, index) => (
                                    <span
                                        key={`hero-trust-${index}`}
                                        className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 shadow-sm"
                                    >
                                        <Check className="h-4 w-4 text-[#710214]" />
                                        {text(item)}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <div className="relative hidden lg:block">
                            <motion.div
                                className="absolute right-[18px] bottom-[62px] grid h-[132px] w-[132px] place-items-center rounded-[28px] bg-[#710214] text-center text-white shadow-[0_16px_34px_rgba(113,2,20,.2)]"
                                {...sectionMotion}
                            >
                                <div>
                                    <p className="text-[31px] leading-none font-black text-[#c88b2d]">
                                        {text(hero.free_badge_title)}
                                    </p>
                                    <p className="text-[13px] leading-none font-black">
                                        {text(hero.free_badge_label)}
                                    </p>
                                    <p className="mt-1 text-[7px] font-black">
                                        {text(hero.free_badge_note)}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="wrap -mt-6">
                        <div className="grid overflow-hidden rounded-[28px] bg-[#710214] text-white shadow-[0_16px_34px_rgba(113,2,20,.16)] sm:grid-cols-2 lg:grid-cols-4">
                            {heroFeatureCards.map((item, index) => {
                                const Icon = iconFor(item.icon);

                                return (
                                    <motion.div
                                        key={`hero-feature-${index}`}
                                        className={`flex items-center gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-7 ${
                                            index < heroFeatureCards.length - 1
                                                ? 'border-white/20 md:border-r'
                                                : ''
                                        }`}
                                        whileHover={{ y: -4 }}
                                    >
                                        <Icon className="h-8 w-8" />
                                        <div>
                                            <b className="block text-[11px]">
                                                {text(item.title)}
                                            </b>
                                            <span className="text-[9px] text-white/80">
                                                {text(item.description)}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <motion.section
                    id="detail"
                    className="landing-shell mt-6 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <span className="rounded border border-[#c88b2d]/40 bg-white px-3 py-1 text-[9px] font-black text-[#c88b2d]">
                            {text(
                                packageDetails.title,
                                text(packagesContent.title),
                            )}
                        </span>
                        <h2 className="font-display mt-3 text-[22px] font-black whitespace-pre-line text-[#710214]">
                            {text(
                                packageDetails.heading,
                                text(packagesContent.heading),
                            )}
                        </h2>
                        <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text(
                                packageDetails.description,
                                text(packagesContent.description),
                            )}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        {packageSlots.map((pkg, index) => {
                            if (!pkg) {
                                return (
                                    <div
                                        key={`package-slot-empty-${index}`}
                                        className="hidden lg:block"
                                    />
                                );
                            }

                            const packageName = localize(
                                pkg.name,
                                'id',
                                text(pkg.name, 'Paket Umrah'),
                            );
                            const packageType = text(
                                pkg.package_type,
                                'Reguler',
                            );
                            const packagePrice = formatPrice(
                                Number(pkg.price ?? 0),
                                'id',
                                text(pkg.currency, 'IDR'),
                            );
                            const packageOriginalPrice = pkg.original_price
                                ? formatPrice(
                                      Number(pkg.original_price),
                                      'id',
                                      text(pkg.currency, 'IDR'),
                                  )
                                : '';
                            const packageDuration = Number(
                                pkg.duration_days ?? 0,
                            );
                            const packageProducts = Array.isArray(pkg.products)
                                ? (pkg.products as Array<CmsRecord>)
                                      .map((product) =>
                                          localize(
                                              product.name,
                                              'id',
                                              text(product.name),
                                          ),
                                      )
                                      .filter(Boolean)
                                      .slice(0, 4)
                                : [];
                            const packageFeatures = [
                                packageDuration > 0
                                    ? `${packageDuration} Hari`
                                    : '',
                                localize(
                                    (pkg.content as CmsRecord)?.airline,
                                    'id',
                                    'Maskapai menyesuaikan',
                                ),
                                localize(
                                    (pkg.content as CmsRecord)?.hotel,
                                    'id',
                                    'Hotel sesuai paket',
                                ),
                                ...packageProducts,
                            ]
                                .filter(Boolean)
                                .slice(0, 5);

                            return (
                                <motion.article
                                    key={`landing-package-${pkg.id ?? index}`}
                                    className="overflow-hidden rounded-[28px] border border-[#d9c8b3] bg-white shadow-[0_16px_38px_rgba(113,2,20,.09)]"
                                    whileHover={{ y: -6 }}
                                >
                                    <div className="relative h-[170px] overflow-hidden">
                                        {pkg.original_price ? (
                                            <div className="absolute top-0 right-0 bg-[#f59e0b] px-4 py-2 text-[9px] font-black tracking-[.22em] text-white uppercase [clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]">
                                                {text(
                                                    pkg.discount_label,
                                                    'Promo',
                                                )}
                                            </div>
                                        ) : null}
                                        {text(pkg.image_path) ? (
                                            <img
                                                src={text(pkg.image_path)}
                                                alt={packageName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#3d0508,#8c0a16)] text-[#f4c577]">
                                                <Camera className="h-10 w-10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.06)_0%,rgba(0,0,0,.38)_100%)]" />
                                        <div className="absolute right-4 bottom-4 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black tracking-[.22em] text-[#710214] uppercase shadow-sm">
                                            {packageType}
                                        </div>
                                    </div>
                                    <div className="relative px-6 pb-6">
                                        <p className="mt-6 text-[10px] font-black tracking-[.32em] text-[#c88b2d] uppercase">
                                            {text(
                                                packagesContent.title,
                                                'Paket',
                                            )}
                                        </p>
                                        <h3 className="font-display mt-4 min-h-[52px] text-[22px] leading-tight font-black text-[#2c1712]">
                                            {packageName}
                                        </h3>
                                        <div className="mt-5">
                                            <p className="font-display text-[30px] leading-none font-black text-[#a60f24]">
                                                {packagePrice}
                                            </p>
                                            {packageOriginalPrice ? (
                                                <p className="mt-3 text-[12px] font-semibold text-[#8d7d74] line-through">
                                                    {packageOriginalPrice}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="border-t border-[#efe1d2] px-6 py-6">
                                        <ul className="space-y-3">
                                            {packageFeatures.map(
                                                (feature, featureIndex) => (
                                                    <li
                                                        key={`landing-package-feature-${index}-${featureIndex}`}
                                                        className="flex items-start gap-3 text-[12px] font-medium text-[#5b4b43]"
                                                    >
                                                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#fff1ee] text-[#a60f24]">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                        <a
                                            href={`/paket-umroh/${text(pkg.slug)}`}
                                            className="mt-6 block rounded-[14px] bg-[#a60f24] px-4 py-3 text-center text-[12px] font-black text-white shadow-[0_12px_24px_rgba(166,15,36,.18)]"
                                        >
                                            Tanya Paket Ini
                                        </a>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>

                    <div className="mt-5 text-center">
                        <a
                            href="/paket-umroh"
                            className="inline-flex rounded-md border border-[#710214]/15 bg-white px-5 py-3 text-[11px] font-black text-[#710214]"
                        >
                            {text(
                                packagesContent.more_packages_label,
                                'Lihat Semua Paket',
                            )}
                        </a>
                    </div>
                </motion.section>

                <motion.section
                    className="landing-shell mt-4 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <span className="rounded border border-[#c88b2d]/40 bg-white px-3 py-1 text-[9px] font-black text-[#c88b2d]">
                            {text(included.section_badge)}
                        </span>
                        <h2 className="font-display mt-3 text-[22px] font-black whitespace-pre-line text-[#710214]">
                            {text(included.section_heading)}
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                        {[
                            {
                                key: 'included',
                                data: included,
                                isOutline: false,
                            },
                            {
                                key: 'excluded',
                                data: excluded,
                                isOutline: true,
                            },
                        ].map(({ key, data, isOutline }) => (
                            <motion.section
                                key={key}
                                className="relative min-h-[178px] overflow-hidden rounded-[28px] border border-[#710214]/10 bg-[#fff7f2] p-4 shadow-[0_8px_24px_rgba(113,2,20,.08)] sm:p-5 lg:p-6"
                                {...sectionMotion}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-[center_right]"
                                    style={{
                                        backgroundImage: `linear-gradient(90deg,rgba(255,247,242,.98)_0%,rgba(255,247,242,.90)_48%,rgba(255,247,242,.58)_70%,rgba(255,247,242,.18)_100%),url('${text(data.image_url)}')`,
                                    }}
                                />
                                <div className="relative z-10">
                                    <span
                                        className={`rounded px-3 py-1.5 text-[9px] font-black ${
                                            isOutline
                                                ? 'border border-[#c88b2d]/40 bg-white text-[#c88b2d]'
                                                : 'bg-[#710214] text-white'
                                        }`}
                                    >
                                        {text(data.title)}
                                    </span>
                                    <ul
                                        className={`mt-4 grid gap-2 text-[12px] font-bold ${
                                            isOutline
                                                ? 'grid-cols-1'
                                                : 'grid-cols-2 gap-x-8'
                                        }`}
                                    >
                                        {(
                                            (data.items as Array<unknown>) ?? []
                                        ).map((item, index) => (
                                            <li key={`${key}-${index}`}>
                                                {isOutline ? (
                                                    <X className="mr-1 inline h-3.5 w-3.5 text-[#710214]" />
                                                ) : (
                                                    <Check className="mr-1 inline h-3.5 w-3.5 text-[#710214]" />
                                                )}
                                                {text(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.section>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    id="why"
                    className="landing-shell mt-6 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <h2 className="text-[13px] font-black tracking-[.24em] text-[#710214] uppercase">
                            {text(reasons.title)}
                        </h2>
                        <p className="font-display mt-3 text-[24px] leading-tight font-black whitespace-pre-line text-[#2c1712] lg:text-[32px]">
                            {text(reasons.heading)}
                        </p>
                    </div>
                    <div className="mt-5 grid items-center gap-5 lg:grid-cols-[1fr_220px]">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            {reasonItems.map((item, index) => {
                                const Icon = iconFor(item.icon);

                                return (
                                    <div
                                        key={`reason-${index}`}
                                        className="rounded-[20px] border border-[#710214]/8 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(113,2,20,.06)]"
                                    >
                                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1ee] text-[#710214]">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p>
                                            <b className="block text-[10px] text-[#710214]">
                                                {text(item.title)}
                                            </b>
                                            <span className="mt-1 block text-[10px] leading-[1.7] font-medium text-[#5b4b43]">
                                                {text(item.description)}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                            {reasonStats.map((item, index) => (
                                <div
                                    key={`reason-stat-${index}`}
                                    className="rounded-[20px] border border-[#710214]/8 bg-[#710214] px-4 py-4 text-center shadow-[0_10px_24px_rgba(113,2,20,.14)]"
                                >
                                    <b className="text-[22px] font-black text-[#f4c577]">
                                        {text(item.value)}
                                    </b>
                                    <p className="mt-1 text-[10px] font-bold text-white/90">
                                        {text(item.label)}
                                    </p>
                                    {text(item.note) ? (
                                        <p className="mt-1 text-[9px] text-white/65">
                                            {text(item.note)}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    className="landing-shell mt-6 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <h2 className="text-[13px] font-black text-[#710214]">
                            {text((content.gallery as CmsRecord).title)}
                        </h2>
                        <p className="font-display mt-3 text-[24px] leading-tight font-black whitespace-pre-line text-[#2c1712] lg:text-[32px]">
                            {text((content.gallery as CmsRecord).heading)}
                        </p>
                        <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text((content.gallery as CmsRecord).description)}
                        </p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:grid-rows-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-2">
                        {(galleryImages.length > 0
                            ? galleryImages
                            : [
                                  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1575101261474-5cb5653bb416?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1591276425709-b3a4a3a73c96?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=500&q=80',
                                  'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=500&q=80',
                              ]
                        ).map((image, index) => (
                            <div
                                key={`gallery-${index}`}
                                className={`overflow-hidden rounded-[20px] ${
                                    index === 0
                                        ? 'lg:row-span-2 lg:h-[370px]'
                                        : 'h-[180px]'
                                } ${index > 4 ? 'hidden lg:block' : ''}`}
                            >
                                <img
                                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                    src={image}
                                    alt={`Dokumentasi ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 text-center">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-md bg-[#710214] px-5 py-3 text-[11px] font-black text-white"
                        >
                            {text((content.gallery as CmsRecord).cta_label)}
                        </a>
                    </div>
                </motion.section>

                <motion.section
                    id="testi"
                    className="landing-shell mt-6 overflow-hidden rounded-[30px] p-4 shadow-[0_18px_42px_rgba(17,4,6,.10)] sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="relative text-center">
                        <h2 className="text-[13px] font-black tracking-[.24em] text-[#c88b2d] uppercase">
                            {text((content.testimonials as CmsRecord).title)}
                        </h2>
                        <p className="font-display mt-3 text-[24px] leading-tight font-black text-[#2c1712] lg:text-[30px]">
                            {text((content.testimonials as CmsRecord).heading)}
                        </p>
                        <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text(
                                (content.testimonials as CmsRecord).description,
                            )}
                        </p>
                        <a
                            href="/testimoni"
                            className="absolute top-0 right-0 text-[9px] font-black text-[#710214] underline"
                        >
                            {text(
                                (content.testimonials as CmsRecord).more_label,
                            )}
                        </a>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(testimonials.length > 0 ? testimonials : []).map(
                            (item, index) => (
                                <motion.div
                                    key={`testimonial-${index + 1}`}
                                    className={`rounded-[22px] border p-5 shadow-[0_12px_28px_rgba(113,2,20,.08)] ${
                                        index === 0
                                            ? 'border-[#c88b2d]/35 bg-white'
                                            : 'border-[#ead9ce] bg-[#fdf3e3]'
                                    }`}
                                    whileHover={{ y: -4 }}
                                >
                                    <p className="font-display text-[46px] leading-none text-[#c80012]/35">
                                        "
                                    </p>
                                    <p className="mt-1 text-[11px] tracking-[.22em] text-[#c88b2d]">
                                        ★★★★★
                                    </p>
                                    <p className="mt-3 min-h-[110px] text-[12px] leading-[1.9] font-medium text-[#5b4b43] italic">
                                        {text(item.quote)}
                                    </p>
                                    <div className="mt-4 border-t border-[#ead9ce] pt-4">
                                        <b className="block text-[10px] text-[#2c1712]">
                                            {text(item.name)}
                                        </b>
                                        <span className="text-[9px] text-[#8d7d74]">
                                            {text(item.origin_city)}
                                        </span>
                                    </div>
                                </motion.div>
                            ),
                        )}
                    </div>
                </motion.section>

                <motion.section
                    id="faq"
                    className="landing-shell mt-6 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <h2 className="text-[13px] font-black text-[#710214]">
                            {text((content.faq as CmsRecord).title)}
                        </h2>
                        <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text((content.faq as CmsRecord).description)}
                        </p>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {faqs.map((faq, index) => {
                            const isOpen = activeFaq === index;

                            return (
                                <div
                                    key={`faq-${index}`}
                                    className="rounded border border-[#710214]/10 bg-white px-4 py-2 text-[12px] font-bold"
                                >
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-3 text-left"
                                        onClick={() =>
                                            setActiveFaq(isOpen ? null : index)
                                        }
                                    >
                                        <span>{text(faq.question)}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen ? (
                                        <p className="mt-3 text-[11px] leading-[1.7] font-normal text-[#40241d]/70">
                                            {text(faq.answer)}
                                        </p>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                <motion.section
                    id="alamat"
                    className="landing-shell mt-6 rounded-[28px] p-4 sm:p-5 lg:p-7"
                    {...sectionMotion}
                >
                    <div className="text-center">
                        <h2 className="text-[13px] font-black text-[#710214]">
                            {text(location.title)}
                        </h2>
                        <p className="mx-auto mt-3 max-w-[560px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text(location.description)}
                        </p>
                    </div>
                    <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
                        <div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="flex gap-2">
                                    <MapPin className="h-6 w-6 shrink-0 text-[#710214]" />
                                    <p className="text-[9px] leading-snug font-bold whitespace-pre-line">
                                        {address || 'Alamat belum diatur'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Clock3 className="h-6 w-6 shrink-0 text-[#710214]" />
                                    <p className="text-[9px] leading-snug font-bold">
                                        <b>
                                            {text(location.office_hours_title)}
                                        </b>
                                        <br />
                                        {officeHours.join('\n')}
                                    </p>
                                </div>
                                <div className="space-y-2 text-[9px] font-bold">
                                    {(
                                        (location.visit_points as Array<unknown>) ??
                                        []
                                    ).map((item, index) => (
                                        <p key={`visit-${index}`}>
                                            <Check className="mr-1 inline h-3.5 w-3.5 text-[#710214]" />{' '}
                                            {text(item)}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md bg-[#710214] py-2.5 text-center text-[10px] font-black text-white"
                                >
                                    {text(location.whatsapp_label)}
                                </a>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md border border-[#c88b2d] bg-white py-2.5 text-center text-[10px] font-black text-[#710214]"
                                >
                                    {text(location.maps_label)}
                                </a>
                            </div>
                            <div className="mt-4 grid gap-1 text-[10px] text-[#40241d]/70">
                                <span>{phone}</span>
                                <span>{email}</span>
                            </div>
                        </div>
                        <div>
                            <iframe
                                className="h-[180px] w-full rounded-md border border-[#710214]/10"
                                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                            />
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 block rounded-md bg-[#710214] py-2.5 text-center text-[10px] font-black text-white"
                            >
                                {text(location.maps_cta_label)}
                            </a>
                        </div>
                    </div>
                </motion.section>
            </main>

            <motion.section
                className="mt-6 rounded-t-[30px] bg-[linear-gradient(180deg,#9f0f1f_0%,#710214_100%)] px-4 py-8 text-white shadow-[0_18px_42px_rgba(113,2,20,.18)] sm:px-5 lg:px-6 lg:py-10"
                {...sectionMotion}
            >
                <div className="wrap grid items-center gap-4 lg:grid-cols-[1fr_420px]">
                    <div className="flex items-center gap-4">
                        <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full border border-[#f4c577]/40 bg-white/8 text-[#f4c577]">
                            <Building2 className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-[.22em] text-[#f4c577] uppercase">
                                {text(cta.badge)}
                            </p>
                            <h2 className="font-display text-[28px] leading-none font-black whitespace-pre-line lg:text-[36px]">
                                {text(cta.title)}
                            </h2>
                            <p className="mt-3 max-w-[520px] text-[12px] leading-[1.9] font-medium text-white/82">
                                {text(cta.description)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-[16px] bg-[#ffe4bd] py-3 text-center text-[12px] font-black text-[#710214] shadow-[0_10px_24px_rgba(0,0,0,.18)]"
                        >
                            {text(cta.button_label)}
                        </a>
                        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] font-bold text-white/85">
                            {((cta.badges as Array<unknown>) ?? []).map(
                                (badge, index) => (
                                    <span key={`cta-badge-${index}`}>
                                        <Check className="mr-1 inline h-3.5 w-3.5 text-[#c88b2d]" />{' '}
                                        {text(badge)}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </motion.section>

            <footer className="bg-[#21080a] px-4 py-10 text-white sm:px-6 lg:px-8">
                <div className="wrap">
                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-[1.7fr_1fr_1fr_1fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    src={resolvedLogoPath}
                                    alt={companyName}
                                    className="h-10 w-10 object-contain"
                                />
                                <div>
                                    <div className="font-display text-[18px] font-black">
                                        {text(footer.brand, companyName)}
                                    </div>
                                    <div className="text-[9px] font-black tracking-[.28em] text-[#c88b2d] uppercase">
                                        {text(footer.subtitle, companySubtitle)}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 max-w-[280px] text-[12px] leading-[1.8] text-white/55">
                                {text(footer.description)}
                            </p>
                            <div className="mt-4 flex gap-2">
                                {[
                                    {
                                        icon: Instagram,
                                        href: 'https://instagram.com',
                                    },
                                    {
                                        icon: Music2,
                                        href: 'https://tiktok.com',
                                    },
                                    {
                                        icon: PlayCircle,
                                        href: 'https://youtube.com',
                                    },
                                    { icon: MessageCircle, href: whatsappHref },
                                ].map((item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <a
                                            key={`footer-social-${index}`}
                                            href={item.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:border-[#710214] hover:bg-[#710214]"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black tracking-[.2em] text-white/55 uppercase">
                                Paket
                            </h3>
                            <div className="mt-4 space-y-2 text-[12px] text-white/55">
                                {(
                                    (footer.package_links as Array<unknown>) ??
                                    []
                                ).map((item, index) => (
                                    <a
                                        key={`footer-package-${index}`}
                                        href="/paket-umroh"
                                        className="block transition hover:text-[#c88b2d]"
                                    >
                                        {text(item)}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black tracking-[.2em] text-white/55 uppercase">
                                Perusahaan
                            </h3>
                            <div className="mt-4 space-y-2 text-[12px] text-white/55">
                                {(
                                    (footer.company_links as Array<unknown>) ??
                                    []
                                ).map((item, index) => (
                                    <a
                                        key={`footer-company-${index}`}
                                        href="#landing-top"
                                        className="block transition hover:text-[#c88b2d]"
                                    >
                                        {text(item)}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black tracking-[.2em] text-white/55 uppercase">
                                Legal
                            </h3>
                            <div className="mt-4 space-y-2 text-[12px] text-white/55">
                                {(
                                    (footer.legal_links as Array<unknown>) ?? []
                                ).map((item, index) => (
                                    <a
                                        key={`footer-legal-${index}`}
                                        href="#landing-top"
                                        className="block transition hover:text-[#c88b2d]"
                                    >
                                        {text(item)}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-[11px] text-white/35 md:flex-row md:items-center md:justify-between">
                        <p>{text(footer.copyright)}</p>
                        <div className="flex flex-wrap gap-4">
                            {(
                                (footer.bottom_links as Array<unknown>) ?? []
                            ).map((item, index) => (
                                <a
                                    key={`footer-bottom-${index}`}
                                    href="#landing-top"
                                    className="transition hover:text-[#c88b2d]"
                                >
                                    {text(item)}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-[12px] font-black text-white shadow-[0_4px_16px_rgba(113,2,20,.09)] ring-4 ring-white/70"
            >
                <MessageCircle className="h-7 w-7" />
                <span>
                    {text(footer.whatsapp_float_label, 'Konsultasi Gratis')}
                </span>
            </a>
        </>
    );
}
