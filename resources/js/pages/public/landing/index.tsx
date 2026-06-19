import GlobalFaviconHead from '@/components/global-favicon-head';
import PublicSeoHead from '@/components/public/seo-head';
import {
    formatPrice,
    getPublicAddress,
    getPublicEmail,
    getPublicPhoneNumber,
    getPublicSocialAccounts,
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
    CalendarDays,
    Camera,
    Check,
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

const LANDING_NAV_ITEMS = [
    { label: 'Paket Umroh', href: '#detail' },
    { label: 'Fasilitas', href: '#why' },
    { label: 'Testimoni', href: '#testi' },
    { label: 'FAQ', href: '#faq' },
] as const;

const LANDING_FOOTER_PACKAGE_LINKS = [
    'Umroh Quad',
    'Umroh Triple',
    'Umroh Double',
    'Custom/Private',
] as const;

const LANDING_FOOTER_COMPANY_LINKS = [
    'Tentang Kami',
    'Legalitas',
    'Kantor',
    'Galeri',
] as const;

const LANDING_FOOTER_LEGAL_LINKS = [
    'Syarat & Ketentuan',
    'Kebijakan Privasi',
    'Kebijakan Refund',
    'Disclaimer',
] as const;

const LANDING_FOOTER_BOTTOM_LINKS = ['Privasi', 'Syarat', 'Refund'] as const;

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

function heroFeatureIconFor(name: unknown) {
    const normalized = text(name).toLowerCase();

    switch (normalized) {
        case 'plane':
            return Plane;
        case 'hotel':
            return Hotel;
        case 'images':
        case 'cam':
            return Camera;
        case 'food':
            return Soup;
        default:
            return MapPin;
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
            subtitle: text(hero.subtitle, 'Berangkat Agustus 2026'),
            subtitle_badge: text(hero.subtitle_badge, '9 Hari Program'),
            checklist_items: Array.isArray(hero.checklist_items)
                ? hero.checklist_items
                : [
                      'Izin Resmi Kemenag RI',
                      '10+ Tahun Pengalaman',
                      'FREE Konsultasi Jabodetabek',
                  ],
            cta_label: text(hero.cta_label, 'Konsultasi Gratis'),
            secondary_cta_label: text(hero.secondary_cta_label, 'Lihat Paket'),
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
                'Pilih Paket Umroh Terbaik',
            ),
            heading2: text(
                (content.package_details as CmsRecord)?.heading2,
                'Untuk Perjalanan Ibadah Anda',
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
                'Pilih Paket Umroh Terbaik',
            ),
            heading2: text(
                (content.packages as CmsRecord)?.heading2,
                'Untuk Perjalanan Ibadah Anda',
            ),
            description: text(
                (content.packages as CmsRecord)?.description,
                'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
            ),
            more_packages_label: text(
                (content.packages as CmsRecord)?.more_packages_label,
                'Lihat Semua Paket',
            ),
            detail_label: text(
                (content.packages as CmsRecord)?.detail_label,
                'Tanya Paket Ini',
            ),
            price_unit_label: text(
                (content.packages as CmsRecord)?.price_unit_label,
                '/pax',
            ),
            duration_suffix: text(
                (content.packages as CmsRecord)?.duration_suffix,
                'Hari',
            ),
            fallback_name: text(
                (content.packages as CmsRecord)?.fallback_name,
                'Paket Umrah',
            ),
            fallback_airline: text(
                (content.packages as CmsRecord)?.fallback_airline,
                'Maskapai menyesuaikan',
            ),
            fallback_hotel: text(
                (content.packages as CmsRecord)?.fallback_hotel,
                'Hotel sesuai paket',
            ),
            disclaimer: text(
                (content.packages as CmsRecord)?.disclaimer,
                '* Harga dapat berubah sewaktu-waktu. Syarat & ketentuan berlaku.',
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
            section_heading_prefix: text(
                (content.included as CmsRecord)?.section_heading_prefix,
                'Yang',
            ),
            section_heading_highlight: text(
                (content.included as CmsRecord)?.section_heading_highlight,
                'Termasuk',
            ),
            section_heading_suffix: text(
                (content.included as CmsRecord)?.section_heading_suffix,
                'dalam Paket',
            ),
            section_heading: text(
                (content.included as CmsRecord)?.section_heading,
                'Yang Termasuk\ndalam Paket',
            ),
            title: text(
                (content.included as CmsRecord)?.title,
                'TERMASUK DALAM PAKET',
            ),
            status_label: text(
                (content.included as CmsRecord)?.status_label,
                'INCLUDED',
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
            status_label: text(
                (content.excluded as CmsRecord)?.status_label,
                'EXCLUDED',
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
            heading_prefix: text(
                (content.testimonials as CmsRecord)?.heading_prefix,
                'Apa Kata',
            ),
            heading_highlight: text(
                (content.testimonials as CmsRecord)?.heading_highlight,
                'Mereka',
            ),
            heading_suffix: text(
                (content.testimonials as CmsRecord)?.heading_suffix,
                '?',
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
            title: text((content.faq as CmsRecord)?.title, 'FAQ'),
            heading_prefix: text(
                (content.faq as CmsRecord)?.heading_prefix,
                'Pertanyaan yang',
            ),
            heading_highlight: text(
                (content.faq as CmsRecord)?.heading_highlight,
                'Sering Ditanyakan',
            ),
            heading_suffix: text(
                (content.faq as CmsRecord)?.heading_suffix,
                '',
            ),
        },
        location: {
            title: text(
                (content.location as CmsRecord)?.title,
                'Kunjungi Kantor Kami',
            ),
            heading_prefix: text(
                (content.location as CmsRecord)?.heading_prefix,
                'Kunjungi',
            ),
            heading_highlight: text(
                (content.location as CmsRecord)?.heading_highlight,
                'Kantor Kami',
            ),
            heading_suffix: text(
                (content.location as CmsRecord)?.heading_suffix,
                '',
            ),
            description: text(
                (content.location as CmsRecord)?.description,
                'Kami siap melayani konsultasi umroh secara langsung maupun online.',
            ),
            office_hours_title: text(
                (content.location as CmsRecord)?.office_hours_title,
                'Jam Operasional',
            ),
            address_label: text(
                (content.location as CmsRecord)?.address_label,
                'Alamat',
            ),
            address_empty_label: text(
                (content.location as CmsRecord)?.address_empty_label,
                'Alamat belum diatur',
            ),
            contact_label: text(
                (content.location as CmsRecord)?.contact_label,
                'Kontak',
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
    };
}

const sectionMotion = {
    initial: { y: 24 },
    whileInView: { y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.5, ease: 'easeOut' },
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
    const socialAccounts = getPublicSocialAccounts(seoSettings ?? {});
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
    const pricingCards = (hero.pricing_cards as Array<CmsRecord>) ?? [];
    const heroFeatureCards = (hero.feature_cards as Array<CmsRecord>) ?? [];
    const packageDetails = (content.package_details as CmsRecord) ?? {};
    const packagesContent = (content.packages as CmsRecord) ?? {};
    const included = (content.included as CmsRecord) ?? {};
    const excluded = (content.excluded as CmsRecord) ?? {};
    const includedHeadingPrefix = text(included.section_heading_prefix, 'Yang');
    const includedHeadingHighlight = text(
        included.section_heading_highlight,
        'Termasuk',
    );
    const includedHeadingSuffix = text(
        included.section_heading_suffix,
        'dalam Paket',
    );
    const reasons = (content.reasons as CmsRecord) ?? {};
    const reasonItems = (reasons.items as Array<CmsRecord>) ?? [];
    const reasonStats = (reasons.stats as Array<CmsRecord>) ?? [];
    const reasonHeadingLines = splitLines(text(reasons.heading));
    const reasonCardStyles = [
        {
            iconWrap: 'bg-[#fff7ee] text-[#d59a3d] border-[#e6c691]',
            title: 'text-[#8c0a16]',
        },
        {
            iconWrap: 'bg-[#fff5ea] text-[#ff8f7a] border-[#e6c691]',
            title: 'text-[#8c0a16]',
        },
        {
            iconWrap: 'bg-[#f4f1ff] text-[#7390e8] border-[#dcd5ff]',
            title: 'text-[#8c0a16]',
        },
        {
            iconWrap: 'bg-[#fff5f6] text-[#c97f8a] border-[#e6c691]',
            title: 'text-[#8c0a16]',
        },
        {
            iconWrap: 'bg-[#f5f3ff] text-[#8b7fd6] border-[#ddd7ff]',
            title: 'text-[#8c0a16]',
        },
        {
            iconWrap: 'bg-[#fff4ee] text-[#ee8a58] border-[#e6c691]',
            title: 'text-[#8c0a16]',
        },
    ];
    const packageHeadingLines = splitLines(
        text(packageDetails.heading, text(packagesContent.heading)),
    );
    const packageHeadingMain =
        packageHeadingLines[0] ?? text(packagesContent.heading);
    const packageHeadingSecondarySource = text(
        packageDetails.heading2,
        text(packagesContent.heading2),
    );
    const packageHeadingSecondary =
        packageHeadingSecondarySource &&
        packageHeadingSecondarySource !== packageHeadingMain
            ? packageHeadingSecondarySource
            : (packageHeadingLines[1] ?? '');
    const testimonialHeading = {
        prefix: text(
            (content.testimonials as CmsRecord)?.heading_prefix,
            'Apa Kata',
        ),
        highlight: text(
            (content.testimonials as CmsRecord)?.heading_highlight,
            'Mereka',
        ),
        suffix: text((content.testimonials as CmsRecord)?.heading_suffix, '?'),
    };
    const faqHeading = {
        prefix: text(
            (content.faq as CmsRecord)?.heading_prefix,
            'Pertanyaan yang',
        ),
        highlight: text(
            (content.faq as CmsRecord)?.heading_highlight,
            'Sering Ditanyakan',
        ),
        suffix: text((content.faq as CmsRecord)?.heading_suffix, ''),
    };
    const locationHeading = {
        prefix: text(
            (content.location as CmsRecord)?.heading_prefix,
            'Kunjungi',
        ),
        highlight: text(
            (content.location as CmsRecord)?.heading_highlight,
            'Kantor Kami',
        ),
        suffix: text((content.location as CmsRecord)?.heading_suffix, ''),
    };
    const testimonials = Array.isArray(publicData.testimonials)
        ? (publicData.testimonials as Array<CmsRecord>).slice(0, 3)
        : [];
    const faqs = Array.isArray(publicData.faqs)
        ? (publicData.faqs as Array<CmsRecord>).slice(0, 6)
        : [];
    const location = (content.location as CmsRecord) ?? {};
    const cta = (content.cta as CmsRecord) ?? {};
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

    return (
        <>
            <GlobalFaviconHead />
            <PublicSeoHead />
            <Head title={`${companyName} | Landing`} />

            <style>{`
                html{scroll-behavior:smooth}
                body{background:#f6e7c6;color:#40241d;overflow-x:hidden}
                .font-display{font-family:'Playfair Display',serif}
                .wrap{width:100%;max-width:1140px;margin:0 auto;padding-left:20px;padding-right:20px}
                .hero-bleed{position:relative;left:50%;transform:translateX(-50%);width:100vw;max-width:100vw}
                .full-bleed{width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}
                .landing-shell{border:1px solid rgba(113,2,20,.08);background:rgba(255,252,247,.98);box-shadow:0 16px 40px rgba(113,2,20,.055)}
                .wave-divider{line-height:0;overflow:hidden}
                .wave-divider svg{display:block;width:100%;height:50px}
                @media(min-width:640px){.wrap{padding-left:28px;padding-right:28px}}
                @media(min-width:1024px){.wrap{padding-left:40px;padding-right:40px}}
            `}</style>

            <header className="fixed top-0 right-0 left-0 z-40 border-b border-[#e0c9a0] bg-[#f6e7c6]/95 backdrop-blur-[16px]">
                <div className="wrap flex h-[68px] items-center justify-between gap-3">
                    <a
                        href="#landing-top"
                        className="flex items-center gap-[10px]"
                    >
                        <img
                            src={resolvedLogoPath}
                            alt={companyName}
                            className="h-10 w-auto object-contain"
                        />
                        <div>
                            <div className="font-display text-[16px] leading-none font-bold text-[#8c0a16]">
                                {companyName.toUpperCase()}
                            </div>
                            <div className="mt-[2px] text-[9px] font-bold tracking-[2px] text-[#ff9200] uppercase">
                                {companySubtitle}
                            </div>
                        </div>
                    </a>
                    <nav className="hidden items-center gap-6 md:flex">
                        {LANDING_NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={
                                    item.href === '#detail'
                                        ? 'text-[13px] font-medium text-[#8c0a16]'
                                        : 'text-[13px] font-medium text-[#7a5c50] transition hover:text-[#8c0a16]'
                                }
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <a
                        href="#cta"
                        className="inline-flex items-center gap-[7px] rounded-[22px] bg-[linear-gradient(135deg,#8c0a16,#c80012)] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(200,0,18,.25)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(200,0,18,.35)]"
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Konsultasi Gratis
                    </a>
                </div>
            </header>

            <main className="pb-0">
                <div id="landing-top" />
                {/* hero */}
                <section className="hero-bleed relative overflow-hidden bg-[linear-gradient(160deg,#fff8f0_0%,#fdf3e3_48%,#f6e7c6_100%)] pt-[68px]">
                    <div className="absolute inset-0 z-[1] bg-[linear-gradient(120deg,rgba(246,231,198,.96)_0%,rgba(253,243,227,.92)_42%,rgba(246,231,198,.82)_100%)]" />
                    <div
                        className="absolute inset-0 z-[1] opacity-[.04]"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 6L74 24v32L40 74 6 56V24Z' fill='none' stroke='%238c0a16' stroke-width='1'/%3E%3C/svg%3E\")",
                            backgroundSize: '80px',
                        }}
                    />
                    <div className="wrap relative z-[2] grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:py-12">
                        <motion.div className="px-0 py-0" {...sectionMotion}>
                            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c80012]/25 bg-[#c80012]/10 px-[13px] py-[5px] text-[11px] font-bold tracking-[1.5px] text-[#c80012] uppercase">
                                {text(hero.promo_pill)}
                            </span>
                            <span className="mb-1.5 block text-[12px] font-bold tracking-[2.4px] text-[#8c0a16] uppercase">
                                {text(hero.badge)}
                            </span>
                            <h1 className="font-display mb-1.5 max-w-[500px] text-[clamp(32px,5vw,56px)] leading-[.98] font-extrabold tracking-normal text-[#8c0a16]">
                                <span className="block">
                                    {' '}
                                    {heroPrimaryTitle || 'SPECIAL UMROH'}
                                </span>
                                <span className="block text-[#ff9200] italic">
                                    {heroHighlightTitle || 'AGUSTUS'}
                                </span>
                            </h1>
                            <p className="mb-5 flex max-w-[500px] flex-wrap items-center gap-2 text-[14px] leading-[1.7] font-medium text-[#7a5c50]">
                                <span>{text(hero.subtitle)}</span>
                                <span className="rounded-lg bg-[#ff9200] px-2.5 py-1 text-[11px] font-bold text-white">
                                    {text(
                                        hero.subtitle_badge,
                                        `${text(hero.duration_value)} ${text(hero.duration_suffix)} Program`,
                                    )}
                                </span>
                            </p>
                            <div className="max-w-[600px] rounded-[18px] border-[1.5px] border-[#e0c9a0] bg-white p-[18px] shadow-[0_8px_32px_rgba(140,10,22,.09)]">
                                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-[#7a5c50] uppercase">
                                    <span>MULAI DARI</span>
                                    <span className="h-px flex-1 bg-[#e0c9a0]" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {pricingCards.map((card, index) => (
                                        <motion.div
                                            key={`pricing-${index}`}
                                            className={`flex cursor-default items-center justify-between rounded-xl border-[1.5px] px-[12px] py-[8px] transition ${
                                                index === 0
                                                    ? 'border-[#c80012] bg-[#c80012]/[.05]'
                                                    : 'border-[#e0c9a0] bg-[#fdf3e3]'
                                            }`}
                                            whileHover={{ y: -2 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-[.04em] ${
                                                        index === 0
                                                            ? 'bg-[#c80012] text-white'
                                                            : 'bg-[#c80012]/10 text-[#c80012]'
                                                    }`}
                                                >
                                                    {text(card.label)}
                                                </span>
                                                <span className="text-[12px] text-[#7a5c50]">
                                                    {index === 0
                                                        ? 'Kamar Berempat'
                                                        : index === 1
                                                          ? 'Kamar Bertiga'
                                                          : 'Kamar Berdua'}
                                                </span>
                                            </div>
                                            <div className="font-display text-[18px] font-bold text-[#8c0a16]">
                                                {text(card.price)}
                                                <sub className="ml-1 font-sans text-[11px] font-normal text-[#7a5c50]">
                                                    {text(card.note)}
                                                </sub>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3 grid max-w-[600px] grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-[8px]">
                                {heroFeatureCards.map((item, index) => {
                                    const Icon = heroFeatureIconFor(item.icon);

                                    return (
                                        <div
                                            key={`hero-mini-feature-${index}`}
                                            className="min-w-0 rounded-xl border border-[#e0c9a0] bg-white px-[7px] py-[9px] text-center transition hover:border-[#ff9200]"
                                        >
                                            <div className="mb-1 flex justify-center">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c80012]/10 text-[#8c0a16]">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                            </div>
                                            <div className="text-[10px] leading-tight font-bold text-[#8c0a16]">
                                                {text(item.title)}
                                            </div>
                                            <div className="mt-0.5 text-[9px] leading-tight text-[#7a5c50]">
                                                {text(item.description)
                                                    .replace(
                                                        'Lion Air / Saudia',
                                                        'Langsung',
                                                    )
                                                    .replace(
                                                        'Maysan Al Maqom',
                                                        '★★★★ 550m',
                                                    )
                                                    .replace(
                                                        'Arkan Al Manar',
                                                        '★★★ 200m',
                                                    )
                                                    .replace(
                                                        'Makan 3x Sehari',
                                                        'Free',
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 mb-4 flex max-w-[600px] flex-col gap-[9px]">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#25d366,#1a9e4e)] px-[26px] py-[13px] text-[14px] font-extrabold text-white shadow-[0_8px_24px_rgba(37,211,102,.3)] transition hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(37,211,102,.45)]"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    {text(hero.cta_label, 'Konsultasi Gratis')}
                                </a>
                                <a
                                    href={
                                        text(
                                            hero.secondary_cta_href,
                                            '/paket-umroh',
                                        ) || '#detail'
                                    }
                                    className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[14px] border border-[#f0c9c2] bg-transparent px-[24px] py-[11px] text-[13px] font-bold text-[#8c0a16] transition hover:border-[#c80012] hover:bg-[#8c0a16]/[.04]"
                                >
                                    {text(
                                        hero.secondary_cta_label,
                                        'Lihat Paket',
                                    )}
                                </a>
                            </div>

                            <div className="flex max-w-[600px] flex-wrap gap-x-[12px] gap-y-2 text-[11px] font-semibold text-[#7a5c50]">
                                {(
                                    (hero.checklist_items as Array<unknown>) ??
                                    []
                                )
                                    .map((item) => text(item).trim())
                                    .filter(Boolean)
                                    .map((item, index) => (
                                        <span
                                            key={`hero-trust-${index}`}
                                            className="inline-flex items-center gap-2"
                                        >
                                            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#c80012]/10">
                                                <Check className="h-3 w-3 text-[#8c0a16]" />
                                            </span>
                                            {item}
                                        </span>
                                    ))}
                            </div>
                        </motion.div>

                        <div className="relative hidden lg:block">
                            <motion.div
                                className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#69000f_0%,#8c0a16_48%,#69000f_100%)] shadow-[0_24px_60px_rgba(140,10,22,.25)]"
                                {...sectionMotion}
                            >
                                <div
                                    className="absolute inset-0 opacity-[.06]"
                                    style={{
                                        backgroundImage:
                                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cpath d='M36 10 58 20v22L36 62 14 42V20Z' fill='none' stroke='%23ffbf73' stroke-width='1.25'/%3E%3C/svg%3E\")",
                                        backgroundSize: '72px',
                                    }}
                                />
                                <div className="relative z-[1] flex h-[88px] w-[88px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#2f2a3e,#5c4868)] text-[#ffbe52] shadow-[0_10px_28px_rgba(0,0,0,.18)]">
                                    <svg
                                        viewBox="0 0 64 64"
                                        className="h-[44px] w-[44px]"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 18L32 10l20 8v28l-20 8-20-8V18Z"
                                            fill="#3c3a48"
                                        />
                                        <path
                                            d="M14 21l18-7 18 7v5l-18 7-18-7v-5Z"
                                            fill="#201d28"
                                        />
                                        <path
                                            d="M32 14v42"
                                            stroke="#ffbe52"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="20"
                                            cy="30"
                                            r="1.8"
                                            fill="#ffbe52"
                                        />
                                        <circle
                                            cx="26"
                                            cy="32"
                                            r="1.8"
                                            fill="#ffbe52"
                                        />
                                        <circle
                                            cx="32"
                                            cy="30"
                                            r="1.8"
                                            fill="#ffbe52"
                                        />
                                        <circle
                                            cx="38"
                                            cy="32"
                                            r="1.8"
                                            fill="#ffbe52"
                                        />
                                        <circle
                                            cx="44"
                                            cy="30"
                                            r="1.8"
                                            fill="#ffbe52"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute right-[16px] bottom-[16px] flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff9200,#d97700)] text-center text-white shadow-[0_8px_24px_rgba(255,146,0,.4)]">
                                    <p className="text-[10px] leading-none font-extrabold">
                                        {text(hero.free_badge_title)}
                                    </p>
                                    <p className="text-[13px] leading-none font-black">
                                        {text(hero.free_badge_label)}
                                    </p>
                                    <p className="mt-1 text-[9px] font-bold text-white/85">
                                        {text(hero.free_badge_note)}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative z-[2] bg-[linear-gradient(135deg,#8c0a16,#3d0508)] px-5 py-4 sm:px-10">
                        <div className="wrap flex overflow-x-auto text-white">
                            {heroFeatureCards.map((item, index) => {
                                return (
                                    <motion.div
                                        key={`hero-feature-${index}`}
                                        className={`flex min-w-[130px] flex-1 items-center gap-[10px] px-[18px] ${
                                            index < heroFeatureCards.length - 1
                                                ? 'border-r border-white/12'
                                                : ''
                                        }`}
                                        whileHover={{ y: -2 }}
                                    >
                                        <span className="shrink-0 text-[22px]">
                                            {item.icon === 'plane'
                                                ? '✈️'
                                                : item.icon === 'hotel'
                                                  ? index === 2
                                                      ? '🕌'
                                                      : '🏨'
                                                  : '🍽️'}
                                        </span>
                                        <div>
                                            <div className="text-[10px] tracking-[.05em] text-white/55 uppercase">
                                                {text(item.title)}
                                            </div>
                                            <div className="text-[13px] leading-tight font-bold text-white">
                                                {text(item.description)}
                                            </div>
                                            <div className="text-[10px] text-[#ffc578]">
                                                {item.icon === 'plane'
                                                    ? 'Penerbangan Langsung'
                                                    : item.icon === 'hotel'
                                                      ? index === 2
                                                          ? 'Bintang 3 · 200 Meter'
                                                          : 'Bintang 4 · 550 Meter'
                                                      : 'Menu Enak & Variatif'}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <motion.section
                    id="detail"
                    className="mt-0 bg-white px-4 py-[80px] sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap text-center">
                        {' '}
                        <span className="rounded border border-[#c88b2d]/40 bg-white px-3 py-1 text-[9px] font-black text-[#c88b2d]">
                            {text(
                                packageDetails.title,
                                text(packagesContent.title),
                            )}
                        </span>
                        <h2 className="font-display mt-3 text-[22px] leading-tight font-black text-[#a60f24] lg:text-[32px]">
                            {packageHeadingMain}
                        </h2>
                        {packageHeadingSecondary ? (
                            <h2 className="font-display mt-1 text-[22px] leading-tight font-black text-[#ff9200] lg:text-[32px]">
                                {packageHeadingSecondary}
                            </h2>
                        ) : null}
                        <p className="mx-auto mt-3 max-w-[360px] text-[11px] leading-[1.8] text-[#40241d]/70">
                            {text(
                                packageDetails.description,
                                text(packagesContent.description),
                            )}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 lg:grid-cols-3">
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
                                text(
                                    pkg.name,
                                    text(packagesContent.fallback_name),
                                ),
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
                                    ? `${packageDuration} ${text(packagesContent.duration_suffix)}`
                                    : '',
                                localize(
                                    (pkg.content as CmsRecord)?.airline,
                                    'id',
                                    text(packagesContent.fallback_airline),
                                ),
                                localize(
                                    (pkg.content as CmsRecord)?.hotel,
                                    'id',
                                    text(packagesContent.fallback_hotel),
                                ),
                                ...packageProducts,
                            ]
                                .filter(Boolean)
                                .slice(0, 5);

                            return (
                                <motion.article
                                    key={`landing-package-${pkg.id ?? index}`}
                                    className="overflow-hidden rounded-[18px] border border-[#d9c8b3] bg-white shadow-[0_16px_38px_rgba(113,2,20,.09)]"
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
                                    <div className="relative px-6">
                                        <h3 className="font-display mt-4 text-[22px] leading-tight font-black text-[#2c1712]">
                                            {packageName}
                                        </h3>
                                        <div className="mt-5">
                                            <div className="flex items-end">
                                                <p className="font-display text-[30px] leading-none font-black text-[#a60f24]">
                                                    {packagePrice}
                                                </p>

                                                <p className="font-display text-[12px] leading-none font-black text-[#8d7d74]">
                                                    {text(
                                                        packagesContent.price_unit_label,
                                                    )}
                                                </p>
                                            </div>

                                            {packageOriginalPrice ? (
                                                <p className="mt-3 text-[12px] font-semibold text-[#8d7d74] line-through">
                                                    {packageOriginalPrice}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4">
                                        <ul className="mb-4 space-y-2">
                                            {packageFeatures.map(
                                                (feature, featureIndex) => (
                                                    <li
                                                        key={`landing-package-feature-${index}-${featureIndex}`}
                                                        className="flex items-start gap-3 text-[12px] font-medium text-[#5b4b43]"
                                                    >
                                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#fff1ee] text-[#a60f24]">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                        <a
                                            href={`/paket-umroh/${text(pkg.slug)}`}
                                            className="my-2 block rounded-[14px] bg-[#a60f24] px-4 py-3 text-center text-[12px] font-black text-white shadow-[0_12px_24px_rgba(166,15,36,.18)]"
                                        >
                                            {text(packagesContent.detail_label)}
                                        </a>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>

                    <div className="mt-5 text-center">
                        <p className="px-5 py-3 text-[11px] font-black text-[#836e66]">
                            {text(packagesContent.disclaimer)}
                        </p>
                    </div>
                    <div className="mt-2 text-center">
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
                    <div className="full-bleed wave-divider bg-white">
                        <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                            <path
                                d="M0,0 C480,46 960,46 1440,0 L1440,50 L0,50Z"
                                fill="#f6e7c6"
                            />
                        </svg>
                    </div>

                    <section className="full-bleed bg-[#f6e7c6] px-0 py-[96px] sm:py-[112px]">
                        <div className="wrap text-center">
                            <span className="inline-flex rounded-full border border-[#deb579] bg-[#fff8ed] px-3 py-1 text-[9px] font-black tracking-[.18em] text-[#c8871f]">
                                {text(included.section_badge)}
                            </span>
                            <h2 className="font-display my-4 text-[24px] leading-[1.12] font-black text-[#8c0a16] lg:text-[36px]">
                                <span>{includedHeadingPrefix} </span>
                                <em className="font-display text-[#ff9200] italic">
                                    {includedHeadingHighlight}
                                </em>{' '}
                                <span>{includedHeadingSuffix}</span>
                            </h2>
                        </div>

                        <div className="wrap mt-14 grid gap-5 lg:grid-cols-2">
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
                                <div
                                    key={key}
                                    className={`relative overflow-hidden rounded-[24px] border px-6 py-7 sm:px-7 sm:py-8 ${
                                        isOutline
                                            ? 'border-[#e2c78f] bg-[#fbf1dd]'
                                            : 'border-[#efd6df] bg-white'
                                    }`}
                                >
                                    <div className="relative z-10">
                                        <div className="mb-5 flex items-center gap-2.5">
                                            <h3
                                                className={`font-display text-[15px] font-semibold tracking-[.01em] uppercase lg:text-[16px] ${
                                                    isOutline
                                                        ? 'text-[#8a776d]'
                                                        : 'text-[#8d0917]'
                                                }`}
                                            >
                                                {text(data.title)}
                                            </h3>
                                            <span
                                                className={`rounded-md px-2.5 py-1 text-[9px] font-black tracking-[.08em] ${
                                                    isOutline
                                                        ? 'bg-[#ece2d2] text-[#8a776d]'
                                                        : 'bg-[#f8dfe0] text-[#d11c2d]'
                                                }`}
                                            >
                                                {text(
                                                    isOutline
                                                        ? excluded.status_label
                                                        : included.status_label,
                                                )}
                                            </span>
                                        </div>
                                        <ul
                                            className={`grid gap-y-3 text-[14px] font-medium ${
                                                isOutline
                                                    ? 'grid-cols-1'
                                                    : 'grid-cols-1 lg:grid-cols-2 lg:gap-x-10'
                                            }`}
                                        >
                                            {(
                                                (data.items as Array<unknown>) ??
                                                []
                                            ).map((item, index) => (
                                                <li
                                                    key={`${key}-${index}`}
                                                    className="flex items-start gap-3"
                                                >
                                                    {isOutline ? (
                                                        <span className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#e9e0cf] text-[#999]">
                                                            <X className="h-3 w-3" />
                                                        </span>
                                                    ) : (
                                                        <span className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#f8dfe0] text-[#d11c2d]">
                                                            <Check className="h-3 w-3" />
                                                        </span>
                                                    )}
                                                    <span className="leading-[1.7] text-[#3f342f]">
                                                        {text(item)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="full-bleed wave-divider bg-[#f6e7c6]">
                        <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                            <path
                                d="M0,50 C480,0 960,0 1440,50 L1440,50 L0,50Z"
                                fill="#ffffff"
                            />
                        </svg>
                    </div>

                    <motion.section
                        id="why"
                        className="bg-white px-4 py-[96px] sm:px-6 lg:px-8 lg:py-[116px]"
                        {...sectionMotion}
                    >
                        <div className="wrap mx-auto max-w-[980px] text-center">
                            <h2 className="inline-flex rounded-full border border-[#e7c79b] bg-[#fff8ed] px-[14px] py-[5px] text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                                {text(reasons.title)}
                            </h2>
                            <div className="mt-5">
                                <p className="font-display text-[28px] leading-[1.05] font-bold text-[#8c0a16] lg:text-[44px]">
                                    {reasonHeadingLines[0] ??
                                        text(reasons.heading)}
                                </p>
                                {reasonHeadingLines.length > 1 ? (
                                    <p className="font-display mt-[2px] text-[28px] leading-[1.05] font-bold text-[#ff9200] italic lg:text-[44px]">
                                        {reasonHeadingLines.slice(1).join(' ')}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-12 grid items-start gap-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {reasonItems.map((item, index) => {
                                    const Icon = iconFor(item.icon);
                                    const cardStyle =
                                        reasonCardStyles[
                                            index % reasonCardStyles.length
                                        ];

                                    return (
                                        <div
                                            key={`reason-${index}`}
                                            className="relative overflow-hidden rounded-[18px] border border-[#e0c9a0] bg-[#fbf1dd] px-5 py-6 transition hover:-translate-y-1 hover:border-[rgba(200,0,18,.2)] hover:shadow-[0_14px_36px_rgba(140,10,22,.1)]"
                                        >
                                            <div
                                                className={`mb-4 inline-flex h-[40px] w-[40px] items-center justify-center rounded-[12px] border ${cardStyle.iconWrap}`}
                                            >
                                                <Icon className="h-[18px] w-[18px]" />
                                            </div>
                                            <p>
                                                <b
                                                    className={`block text-[16px] leading-[1.25] ${cardStyle.title}`}
                                                >
                                                    {text(item.title)}
                                                </b>
                                                <span className="mt-2 block text-[13px] leading-[1.7] font-normal text-[#a77d69]">
                                                    {text(item.description)}
                                                </span>
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-12 grid rounded-[20px] bg-[linear-gradient(135deg,#8c0a16,#3d0508)] px-8 py-7 sm:grid-cols-3">
                                {reasonStats.map((item, index) => (
                                    <div
                                        key={`reason-stat-${index}`}
                                        className={`px-4 text-center ${index < reasonStats.length - 1 ? 'border-b border-white/10 pb-4 sm:border-r sm:border-b-0' : ''}`}
                                    >
                                        <b className="font-display text-[36px] leading-none font-bold text-white">
                                            {text(item.value)}
                                        </b>
                                        <p className="mt-1 text-[12px] text-white/60">
                                            {text(item.label)}
                                        </p>
                                        {text(item.note) ? (
                                            <p className="mt-1 text-[10px] font-semibold text-[#ffc578]">
                                                {text(item.note)}
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>

                    <div className="wave-divider -mb-px bg-white">
                        <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                            <path
                                d="M0,50 C360,0 1080,0 1440,50 L1440,50 L0,50Z"
                                fill="#f6e7c6"
                            />
                        </svg>
                    </div>

                    <motion.section
                        className="full-bleed relative -mt-px bg-[#f6e7c6] px-4 pt-[68px] pb-[110px] sm:px-6 lg:px-8 lg:pt-[78px] lg:pb-[120px]"
                        {...sectionMotion}
                    >
                        <div className="wrap">
                            <div className="text-center">
                                <h2 className="inline-flex rounded-full border border-[#e7c79b] bg-[#fff8ed] px-[14px] py-[5px] text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                                    {text((content.gallery as CmsRecord).title)}
                                </h2>
                                <p className="font-display mt-5 text-[28px] leading-[1.08] font-bold text-[#8c0a16] lg:text-[42px]">
                                    {text(
                                        (content.gallery as CmsRecord).heading,
                                    )}
                                </p>
                                <p className="mx-auto mt-3 max-w-[620px] text-[12px] leading-[1.8] text-[#7a5c50]">
                                    {text(
                                        (content.gallery as CmsRecord)
                                            .description,
                                    )}
                                </p>
                            </div>
                            <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[170px_170px]">
                                {[
                                    {
                                        icon: '🕋',
                                        title: "Jamaah di Ka'bah",
                                        label: 'Momen di Masjidil Haram',
                                        className:
                                            'bg-[linear-gradient(135deg,#5f0710_0%,#840a16_55%,#a60d18_100%)] text-white lg:row-span-2',
                                    },
                                    {
                                        icon: '🏨',
                                        title: 'Hotel Makkah',
                                        label: 'Maysan Al Maqom',
                                        className:
                                            'bg-[linear-gradient(135deg,#9b5a00_0%,#d27a00_100%)] text-white',
                                    },
                                    {
                                        icon: '🕌',
                                        title: 'Hotel Madinah',
                                        label: 'Arkan Al Manar',
                                        className:
                                            'bg-[linear-gradient(135deg,#b70014_0%,#cf0b18_100%)] text-white',
                                    },
                                    {
                                        icon: '🤲',
                                        title: 'Momen Ibadah',
                                        label: 'Kekhusyukan Ibadah',
                                        className:
                                            'bg-[linear-gradient(135deg,#00785e_0%,#00906f_100%)] text-white',
                                    },
                                    {
                                        icon: '✈️',
                                        title: 'Keberangkatan',
                                        label: 'Momen menuju Tanah Suci',
                                        className:
                                            'bg-[linear-gradient(135deg,#0a4f8d_0%,#0864c7_100%)] text-white',
                                    },
                                ].map((item, index) => (
                                    <div
                                        key={`gallery-${index}`}
                                        className={`relative flex min-h-[170px] items-center justify-center overflow-hidden rounded-[20px] px-5 py-6 text-center shadow-[0_10px_24px_rgba(140,10,22,.06)] ${
                                            index === 0
                                                ? 'lg:col-span-1 lg:h-full'
                                                : 'lg:h-full'
                                        } ${item.className}`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="text-[34px] leading-none">
                                                {item.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black tracking-[.18em] text-white/70 uppercase">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] leading-[1.5] font-semibold text-white/85">
                                                    {item.label}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 text-center">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded-[12px] bg-[linear-gradient(135deg,#8c0a16,#c80012)] px-5 py-3 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(140,10,22,.18)]"
                                >
                                    {text(
                                        (content.gallery as CmsRecord)
                                            .cta_label,
                                    )}
                                </a>
                            </div>
                        </div>
                    </motion.section>

                    <div className="wave-divider bg-[#f6e7c6]">
                        <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                            <path
                                d="M0,0 C480,50 960,50 1440,0 L1440,50 L0,50Z"
                                fill="#ffffff"
                            />
                        </svg>
                    </div>

                    <motion.section
                        id="testi"
                        className="bg-white px-4 py-[92px] sm:px-6 lg:px-8 lg:py-[112px]"
                        {...sectionMotion}
                    >
                        <div className="wrap relative text-center">
                            <h2 className="inline-flex rounded-full border border-[#e7c79b] bg-[#fff8ed] px-[14px] py-[5px] text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                                {text(
                                    (content.testimonials as CmsRecord).title,
                                )}
                            </h2>
                            <div className="font-display mt-3 text-[clamp(26px,4vw,42px)] leading-[1.05] font-bold whitespace-nowrap text-[#8c0a16]">
                                <span>{testimonialHeading.prefix} </span>
                                <span className="text-[#ff9200] italic">
                                    {testimonialHeading.highlight}
                                </span>
                                <span>{testimonialHeading.suffix}</span>
                            </div>
                            <p className="mx-auto mt-3 max-w-[580px] text-[12px] leading-[1.8] text-[#7a5c50]">
                                {text(
                                    (content.testimonials as CmsRecord)
                                        .description,
                                )}
                            </p>
                            <a
                                href="/testimoni"
                                className="absolute top-0 right-0 text-[10px] font-bold text-[#8c0a16] underline decoration-[#8c0a16]/25 underline-offset-4"
                            >
                                {text(
                                    (content.testimonials as CmsRecord)
                                        .more_label,
                                )}
                            </a>
                        </div>
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {(testimonials.length > 0 ? testimonials : []).map(
                                (item, index) => (
                                    <motion.div
                                        key={`testimonial-${index + 1}`}
                                        className={`rounded-[18px] border px-6 py-6 transition hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(140,10,22,.08)] ${
                                            index === 0
                                                ? 'border-[rgba(200,0,18,.2)] bg-white'
                                                : 'border-[#ead9ce] bg-[#fdf3e3]'
                                        }`}
                                        whileHover={{ y: -4 }}
                                    >
                                        <p className="font-display text-[52px] leading-none text-[#c80012]/35">
                                            "
                                        </p>
                                        <p className="mt-2 text-[11px] tracking-[.22em] text-[#ff9200]">
                                            ★★★★★
                                        </p>
                                        <p className="mt-4 min-h-[112px] text-[12.5px] leading-[1.95] font-normal text-[#806d64] italic">
                                            {text(item.quote)}
                                        </p>
                                        <div className="mt-4 border-t border-[#e3ccb3] pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c80012] text-[12px] font-black text-white">
                                                    {text(item.name)
                                                        .split(/\s+/)
                                                        .filter(Boolean)
                                                        .slice(0, 2)
                                                        .map((part) => part[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <b className="block text-[12px] leading-none text-[#a10a16]">
                                                        {text(item.name)}
                                                    </b>
                                                    <span className="mt-1 block text-[10px] leading-none text-[#a67f6d]">
                                                        {text(item.origin_city)}
                                                    </span>
                                                    <span className="mt-2 inline-flex rounded-full bg-[#f6dca9] px-2.5 py-1 text-[9px] font-semibold text-[#7f5b22]">
                                                        {text(
                                                            item.package_name,
                                                            'Paket Umrah',
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ),
                            )}
                        </div>
                    </motion.section>
                </motion.section>

                <div className="wave-divider bg-white">
                    <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                        <path
                            d="M0,50 C360,0 1080,0 1440,50 L1440,50 L0,50Z"
                            fill="#f6e7c6"
                        />
                    </svg>
                </div>

                <motion.section
                    id="faq"
                    className="relative -mt-px overflow-hidden bg-[#f6e7c6] px-4 pt-[68px] pb-[110px] sm:px-6 lg:px-8 lg:pt-[78px] lg:pb-[120px]"
                    {...sectionMotion}
                >
                    <div className="absolute inset-0 -z-10 bg-[#f6e7c6]" />
                    <div className="wrap relative z-[1]">
                        <div className="text-center">
                            <h2 className="inline-flex rounded-full border border-[#e7c79b] bg-[#fff8ed] px-[14px] py-[5px] text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                                {text((content.faq as CmsRecord).title)}
                            </h2>
                            <p className="font-display mt-5 text-[28px] leading-[1.1] font-bold text-[#8c0a16] lg:text-[42px]">
                                {faqHeading.prefix}{' '}
                                <span className="text-[#ff9200] italic">
                                    {faqHeading.highlight}
                                </span>
                                {faqHeading.suffix}
                            </p>
                            <p className="mx-auto mt-3 max-w-[620px] text-[12px] leading-[1.8] text-[#7a5c50]">
                                {text((content.faq as CmsRecord).description)}
                            </p>
                        </div>
                        <div className="mx-auto mt-12 max-w-[760px]">
                            {faqs.map((faq, index) => {
                                const isOpen = activeFaq === index;

                                return (
                                    <div
                                        key={`faq-${index}`}
                                        className={`mb-3 overflow-hidden rounded-[14px] border bg-white transition ${
                                            isOpen
                                                ? 'border-[rgba(200,0,18,.2)] shadow-[0_6px_20px_rgba(140,10,22,.09)]'
                                                : 'border-[#e0c9a0]'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-semibold text-[#8c0a16]"
                                            onClick={() =>
                                                setActiveFaq(
                                                    isOpen ? null : index,
                                                )
                                            }
                                        >
                                            <span>{text(faq.question)}</span>
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[17px] transition ${
                                                    isOpen
                                                        ? 'rotate-45 border-[#c80012] bg-[#c80012] text-white'
                                                        : 'border-[#e0c9a0] bg-white text-[#c80012]'
                                                }`}
                                            >
                                                +
                                            </span>
                                        </button>
                                        {isOpen ? (
                                            <p className="px-5 pb-4 text-[14px] leading-[1.8] font-light text-[#7a5c50]">
                                                {text(faq.answer)}
                                            </p>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>
                <div className="wave-divider bg-[#f6e7c6]">
                    <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                        <path
                            d="M0,0 C480,50 960,50 1440,0 L1440,50 L0,50Z"
                            fill="#ffffff"
                        />
                    </svg>
                </div>
                <motion.section
                    id="alamat"
                    className="bg-white px-4 py-[92px] sm:px-6 lg:px-8 lg:py-[110px]"
                    {...sectionMotion}
                >
                    <div className="wrap">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#e7c79b] bg-[#fff8ed] px-[14px] py-[5px] text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                                {text(location.title)}
                            </span>
                            <h2 className="font-display mt-5 text-[28px] font-bold text-[#8c0a16] lg:text-[42px]">
                                {locationHeading.prefix}{' '}
                                <span className="text-[#ff9200] italic">
                                    {locationHeading.highlight}
                                </span>
                                {locationHeading.suffix}
                            </h2>
                            <p className="mx-auto mt-3 max-w-[620px] text-[12px] leading-[1.8] text-[#7a5c50]">
                                {text(location.description)}
                            </p>
                        </div>

                        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
                            <div>
                                <div className="mb-5 flex flex-col gap-3">
                                    <div className="flex items-start gap-3 rounded-[14px] border border-[#e0c9a0] bg-[#fdf3e3] px-4 py-4 shadow-[0_6px_18px_rgba(140,10,22,.05)] transition hover:border-[#c80012]/20">
                                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#c80012]/10 text-[#c80012]">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold tracking-[.05em] text-[#7a5c50] uppercase">
                                                {text(location.address_label)}
                                            </p>
                                            <p className="text-[14px] leading-[1.6] font-semibold whitespace-pre-line text-[#8c0a16]">
                                                {address ||
                                                    text(
                                                        location.address_empty_label,
                                                    )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-[14px] border border-[#e0c9a0] bg-[#fdf3e3] px-4 py-4 shadow-[0_6px_18px_rgba(140,10,22,.05)] transition hover:border-[#c80012]/20">
                                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#c80012]/10 text-[#c80012]">
                                            <Clock3 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold tracking-[.05em] text-[#7a5c50] uppercase">
                                                {text(
                                                    location.office_hours_title,
                                                )}
                                            </p>
                                            <p className="text-[14px] leading-[1.6] font-semibold whitespace-pre-line text-[#8c0a16]">
                                                {officeHours.join('\n')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-[14px] border border-[#e0c9a0] bg-[#fdf3e3] px-4 py-4 shadow-[0_6px_18px_rgba(140,10,22,.05)] transition hover:border-[#c80012]/20">
                                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#c80012]/10 text-[#c80012]">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold tracking-[.05em] text-[#7a5c50] uppercase">
                                                {text(location.contact_label)}
                                            </p>
                                            <p className="text-[14px] leading-[1.6] font-semibold text-[#8c0a16]">
                                                {phone}
                                            </p>
                                            <p className="text-[13px] leading-[1.6] text-[#7a5c50]">
                                                {email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {(
                                        (location.visit_points as Array<unknown>) ??
                                        []
                                    ).map((item, index) => (
                                        <div
                                            key={`visit-${index}`}
                                            className="flex items-center gap-2 rounded-[12px] border border-[#e0c9a0] bg-[#fdf3e3] px-3 py-3 text-[13px] font-semibold text-[#8c0a16]"
                                        >
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c80012]/10 text-[#c80012]">
                                                <Check className="h-3 w-3" />
                                            </span>
                                            {text(item)}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#8c0a16] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#3d0508] hover:shadow-[0_8px_20px_rgba(140,10,22,.25)]"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        {text(location.maps_cta_label)}
                                    </a>
                                    <a
                                        href={whatsappHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(135deg,#25d366,#1a9e4e)] px-5 py-3 text-[14px] font-bold text-white transition hover:shadow-[0_8px_20px_rgba(37,211,102,.3)]"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        {text(location.whatsapp_label)}
                                    </a>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-[20px] border border-[#e0c9a0] shadow-[0_12px_36px_rgba(140,10,22,.1)]">
                                <iframe
                                    className="block h-[420px] w-full border-0"
                                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                                />
                                <div className="bg-[#8c0a16] px-5 py-3 text-center text-[12px] font-semibold text-white">
                                    {text(location.maps_label)}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>
            <div className="full-bleed wave-divider bg-white">
                <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                    <path
                        d="M0,0 C480,46 960,46 1440,0 L1440,50 L0,50Z"
                        fill="#8c0a16"
                    />
                </svg>
            </div>
            {/* <div className="wave-divider bg-white">
                <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
                    <path
                        d="M0,50 C360,0 1080,0 1440,50 L1440,50 L0,50Z"
                        fill="#8c0a16"
                    />
                </svg>
            </div> */}

            <motion.section
                id="cta"
                className="relative overflow-hidden bg-[linear-gradient(135deg,#8c0a16_0%,#b70714_55%,#7b0710_100%)] px-4 py-[104px] text-center text-white sm:px-6 lg:px-8 lg:py-[124px]"
                {...sectionMotion}
            >
                <div
                    className="absolute inset-0 opacity-[.06]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 5L75 22.5v35L40 75 5 57.5v-35Z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E\")",
                        backgroundSize: '80px',
                    }}
                />
                <div className="wrap relative z-[1] mx-auto max-w-[640px]">
                    <p className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-[14px] py-[5px] text-[11px] font-bold tracking-[.2em] text-[#ffc578] uppercase">
                        <span className="text-[12px]">🕌</span>
                        {text(cta.badge)}
                    </p>
                    <h2 className="font-display text-[34px] leading-[1.12] font-bold whitespace-pre-line text-white lg:text-[48px]">
                        {text(cta.title)}
                    </h2>
                    <p className="mt-4 text-[15px] leading-[1.8] font-light text-white/72">
                        {text(cta.description)}
                    </p>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#25d366,#1a9e4e)] px-10 py-[16px] text-[15px] font-extrabold text-white shadow-[0_8px_28px_rgba(37,211,102,.3)] transition hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(37,211,102,.5)]"
                    >
                        <MessageCircle className="h-5 w-5" />
                        {text(cta.button_label)}
                    </a>
                    <div className="mt-8 flex flex-wrap justify-center gap-[14px] sm:gap-[18px]">
                        {(
                            [
                                {
                                    icon: ShieldCheck,
                                    label: text(
                                        (cta.badges as Array<unknown>)?.[0] ??
                                            'Resmi Kemenag',
                                    ),
                                },
                                {
                                    icon: Bolt,
                                    label: text(
                                        (cta.badges as Array<unknown>)?.[1] ??
                                            'Fast Response',
                                    ),
                                },
                                {
                                    icon: Users,
                                    label: text(
                                        (cta.badges as Array<unknown>)?.[2] ??
                                            'Amanah',
                                    ),
                                },
                                {
                                    icon: Clock3,
                                    label: text(
                                        (cta.badges as Array<unknown>)?.[3] ??
                                            'Support 24 Jam',
                                    ),
                                },
                            ] as Array<{
                                icon: typeof ShieldCheck;
                                label: string;
                            }>
                        ).map((badge, index) => {
                            const Icon = badge.icon;

                            return (
                                <span
                                    key={`cta-badge-${index}`}
                                    className="flex items-center gap-1.5 text-[13px] font-semibold text-white/82"
                                >
                                    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/15 text-[11px]">
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    {badge.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            <footer className="bg-[#3d0508] px-4 pt-12 pb-6 text-white sm:px-6 lg:px-8">
                <div className="wrap">
                    <div className="mb-10 grid gap-9 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    src={resolvedLogoPath}
                                    alt={companyName}
                                    className="h-10 w-auto object-contain"
                                />
                                <div>
                                    <div className="font-display text-[18px] font-bold tracking-[.01em]">
                                        {companyName}
                                    </div>
                                    <div className="text-[9px] tracking-[.28em] text-[#ff9200] uppercase">
                                        {companySubtitle}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-4 max-w-[240px] text-[13px] leading-[1.75] font-light text-white/35">
                                Jelas Rencananya, Terjamin Amanahnya. Melayani
                                perjalanan umroh dengan sistem transparan &
                                amanah sejak 2015.
                            </p>
                            <div className="mt-5 flex gap-2">
                                {socialAccounts.map((item, index) => {
                                    const platform =
                                        item.platform.toLowerCase();
                                    const Icon = platform.includes('instagram')
                                        ? Instagram
                                        : platform.includes('tiktok')
                                          ? Music2
                                          : platform.includes('youtube')
                                            ? PlayCircle
                                            : MessageCircle;

                                    return (
                                        <a
                                            key={`footer-social-${index}`}
                                            href={item.url}
                                            aria-label={item.label}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white/80 transition hover:border-[#c80012] hover:bg-[#c80012]"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold tracking-[.12em] text-white/50 uppercase">
                                Paket
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] font-light text-white/35">
                                {LANDING_FOOTER_PACKAGE_LINKS.map(
                                    (item, index) => (
                                        <a
                                            key={`footer-package-${index}`}
                                            href="/paket-umroh"
                                            className="block transition hover:text-[#c88b2d]"
                                        >
                                            {text(item)}
                                        </a>
                                    ),
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold tracking-[.12em] text-white/50 uppercase">
                                Perusahaan
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] font-light text-white/35">
                                {LANDING_FOOTER_COMPANY_LINKS.map(
                                    (item, index) => (
                                        <a
                                            key={`footer-company-${index}`}
                                            href="#landing-top"
                                            className="block transition hover:text-[#c88b2d]"
                                        >
                                            {text(item)}
                                        </a>
                                    ),
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold tracking-[.12em] text-white/50 uppercase">
                                Legal
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] font-light text-white/35">
                                {LANDING_FOOTER_LEGAL_LINKS.map(
                                    (item, index) => (
                                        <a
                                            key={`footer-legal-${index}`}
                                            href="#landing-top"
                                            className="block transition hover:text-[#c88b2d]"
                                        >
                                            {text(item)}
                                        </a>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-white/7 pt-5 text-[12px] text-white/20 md:flex-row md:items-center md:justify-between">
                        <p>
                            (c) 2026 Asfar Tour. Terdaftar Kemenag RI.
                            PPIU-2026-001. Jakarta Selatan.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {LANDING_FOOTER_BOTTOM_LINKS.map((item, index) => (
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
                aria-label="Konsultasi Gratis"
                className="fixed right-5 bottom-5 z-50 inline-flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#25d366,#1a9e4e)] text-white shadow-[0_10px_28px_rgba(37,211,102,.45)] transition hover:scale-[1.04]"
            >
                <MessageCircle className="h-7 w-7" />
            </a>
        </>
    );
}
