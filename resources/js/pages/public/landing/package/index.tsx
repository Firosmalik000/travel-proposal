import GlobalFaviconHead from '@/components/global-favicon-head';
import {
    formatDate,
    formatPrice,
    getPublicSocialAccounts,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BadgeCheck,
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    Hotel,
    Instagram,
    MapPin,
    MessageCircle,
    Music2,
    Plane,
    ShieldCheck,
    Soup,
    Star,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

type CmsRecord = Record<string, unknown>;

interface LandingPackagePageProps extends SharedData {
    travelPackage: CmsRecord;
}

type IconName =
    | 'badge'
    | 'calendar'
    | 'check'
    | 'clock'
    | 'hotel'
    | 'map'
    | 'plane'
    | 'shield'
    | 'soup'
    | 'star'
    | 'users';

const NAV_ITEMS = [
    { label: 'Detail Paket', href: '#detail' },
    { label: 'Fasilitas', href: '#fasilitas' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'FAQ', href: '#faq' },
] as const;

const FOOTER_LINKS = ['Paket Umroh', 'Fasilitas', 'Testimoni', 'FAQ'] as const;

const iconMap = {
    badge: BadgeCheck,
    calendar: CalendarDays,
    check: Check,
    clock: Clock3,
    hotel: Hotel,
    map: MapPin,
    plane: Plane,
    shield: ShieldCheck,
    soup: Soup,
    star: Star,
    users: Users,
} satisfies Record<IconName, typeof Check>;

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function splitLines(value: unknown): string[] {
    return text(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function asRecord(value: unknown): CmsRecord {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as CmsRecord)
        : {};
}

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => text(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        return splitLines(value);
    }

    if (value && typeof value === 'object') {
        const localized = localize(value, 'id');

        return splitLines(localized);
    }

    return [];
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function resolveRoomPrice(
    roomPrices: CmsRecord,
    keys: string[],
    basePrice: number | null,
): number | null {
    for (const key of keys) {
        const value = toNumber(roomPrices[key]);

        if (value !== null) {
            return value;
        }
    }

    return basePrice;
}

function hasRoomPrice(roomPrices: CmsRecord, keys: string[]): boolean {
    return keys.some((key) => toNumber(roomPrices[key]) !== null);
}

function iconFor(value: unknown) {
    const normalized = text(value, 'check').toLowerCase() as IconName;

    return iconMap[normalized] ?? Check;
}

function monthFromSchedule(value: unknown): string {
    const date = text(value);

    if (!date) {
        return 'Agustus';
    }

    return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
        new Date(date),
    );
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function RoomPriceRow({
    label,
    room,
    price,
}: {
    label: string;
    room: string;
    price: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#d9b56f] bg-[#fff7eb] px-4 py-3 first:bg-[#fff3f5] first:ring-2 first:ring-[#d80620]">
            <div className="flex items-center gap-4">
                <span className="rounded-[9px] bg-[#ffe1df] px-3 py-1 text-[11px] font-black tracking-[.08em] text-[#d80620] uppercase">
                    {label}
                </span>
                <span className="text-[13px] font-semibold text-[#7d6255]">
                    {room}
                </span>
            </div>
            <div className="text-right">
                <b className="font-display text-[18px] text-[#9b0715]">
                    {price}
                </b>
                <span className="text-[11px] text-[#8b6f63]"> /Pax</span>
            </div>
        </div>
    );
}

function Wave({ fill, flip = false }: { fill: string; flip?: boolean }) {
    return (
        <div className="-mb-px w-full overflow-hidden leading-none">
            <svg
                viewBox="0 0 1440 54"
                preserveAspectRatio="none"
                className={`block h-[54px] w-full ${flip ? 'rotate-180' : ''}`}
                aria-hidden="true"
            >
                <path
                    d="M0,34 C360,-8 1080,-8 1440,34 L1440,54 L0,54Z"
                    fill={fill}
                />
            </svg>
        </div>
    );
}

const sectionMotion = {
    initial: { opacity: 0, y: 42 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
} as const;

export default function LandingPackageDetail() {
    const page = usePage<LandingPackagePageProps>();
    const { travelPackage, seoSettings, branding, publicBranding } = page.props;
    const publicData = usePublicData();
    const landingPage = usePublicPageContent('home_landing_mockup');
    const landingContent = asRecord(landingPage?.content);
    const packageContent = asRecord(travelPackage.content);
    const packageDetails = asRecord(landingContent.package_details);
    const includedContent = asRecord(landingContent.included);
    const excludedContent = asRecord(landingContent.excluded);
    const reasonsContent = asRecord(landingContent.reasons);
    const faqContent = asRecord(landingContent.faq);
    const ctaContent = asRecord(landingContent.cta);

    const companyName = text(branding?.company_name, 'Asfar Tour');
    const companySubtitle = text(branding?.company_subtitle, 'Haji & Umrah');
    const logoPath =
        publicBranding?.logo_path ?? branding?.logo_path ?? '/logo.svg';
    const packageName = localize(travelPackage.name, 'id', 'Paket Umroh');
    const summary = localize(
        travelPackage.summary,
        'id',
        'Paket umroh nyaman dengan pelayanan lengkap untuk perjalanan ibadah Anda.',
    );
    const currency = text(travelPackage.currency, 'IDR');
    const schedules = Array.isArray(travelPackage.schedules)
        ? (travelPackage.schedules as CmsRecord[])
        : [];
    const firstSchedule = schedules[0] ?? {};
    const departureDate = text(firstSchedule.departure_date);
    const departureMonth = monthFromSchedule(departureDate);
    const durationDays = Number(travelPackage.duration_days ?? 0);
    const roomPrices = asRecord(packageContent.room_prices);
    const basePrice = toNumber(travelPackage.price);
    const hasCustomRoomPrice = hasRoomPrice(roomPrices, [
        'quad',
        'trpl',
        'triple',
        'dbl',
        'double',
    ]);
    const roomRows = (
        hasCustomRoomPrice
            ? [
                  {
                      label: 'Quad',
                      room: 'Kamar Berempat',
                      price: resolveRoomPrice(roomPrices, ['quad'], basePrice),
                  },
                  {
                      label: 'Triple',
                      room: 'Kamar Bertiga',
                      price: resolveRoomPrice(
                          roomPrices,
                          ['trpl', 'triple'],
                          basePrice,
                      ),
                  },
                  {
                      label: 'Double',
                      room: 'Kamar Berdua',
                      price: resolveRoomPrice(
                          roomPrices,
                          ['dbl', 'double'],
                          basePrice,
                      ),
                  },
              ]
            : [
                  {
                      label: 'Harga',
                      room: 'Harga Paket',
                      price: basePrice,
                  },
              ]
    ).filter((row) => row.price !== null);
    const includedItems =
        toStringArray(packageContent.included).length > 0
            ? toStringArray(packageContent.included)
            : toStringArray(includedContent.items);
    const excludedItems =
        toStringArray(packageContent.excluded).length > 0
            ? toStringArray(packageContent.excluded)
            : toStringArray(excludedContent.items);
    const featureCards = [
        {
            icon: 'plane',
            title: 'Direct Flight',
            description:
                localize(packageContent.airline, 'id') || 'Penerbangan nyaman',
        },
        {
            icon: 'hotel',
            title: 'Hotel Makkah',
            description:
                localize(packageContent.hotel_makkah, 'id') ||
                localize(packageContent.hotel, 'id') ||
                'Hotel sesuai paket',
        },
        {
            icon: 'hotel',
            title: 'Hotel Madinah',
            description:
                localize(packageContent.hotel_madinah, 'id') ||
                'Hotel sesuai paket',
        },
        {
            icon: 'soup',
            title: 'Konsumsi',
            description: localize(packageContent.meals, 'id') || 'Makan 3x',
        },
    ];
    const trustPoints = Array.isArray(
        asRecord(landingContent.hero).checklist_items,
    )
        ? (asRecord(landingContent.hero).checklist_items as unknown[])
              .map((item) => text(item))
              .filter(Boolean)
        : ['Izin Resmi Kemenag RI', '10+ Tahun Pengalaman', 'FREE Konsultasi'];
    const reasonItems = Array.isArray(reasonsContent.items)
        ? (reasonsContent.items as CmsRecord[])
        : [];
    const reasonStats = Array.isArray(reasonsContent.stats)
        ? (reasonsContent.stats as CmsRecord[])
        : [];
    const testimonials =
        Array.isArray(travelPackage.testimonials) &&
        travelPackage.testimonials.length > 0
            ? (travelPackage.testimonials as CmsRecord[])
            : Array.isArray(publicData.testimonials)
              ? (publicData.testimonials as CmsRecord[])
              : [];
    const faqs = Array.isArray(publicData.faqs)
        ? (publicData.faqs as CmsRecord[])
        : [];
    const itineraries = Array.isArray(travelPackage.itineraries)
        ? (travelPackage.itineraries as CmsRecord[])
        : [];
    const socialAccounts = getPublicSocialAccounts(seoSettings ?? {});
    const whatsappHref =
        whatsappLinkFromSeo(
            seoSettings ?? {},
            `Assalamualaikum, saya ingin konsultasi ${packageName}.`,
        ) || '#';
    const [activeFaq, setActiveFaq] = useState(0);

    const packageHeading = {
        title: text(packageDetails.title, 'PAKET KAMI'),
        heading: text(packageDetails.heading, 'Pilih Paket Umroh Terbaik'),
        heading2: text(packageDetails.heading2, 'Untuk Perjalanan Ibadah Anda'),
        description: text(
            packageDetails.description,
            'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
        ),
    };

    return (
        <>
            <GlobalFaviconHead />
            <Head title={`${packageName} | ${companyName}`} />
            <style>{`
                html{scroll-behavior:smooth}
                body{background:#fffaf1;color:#40241d;overflow-x:hidden}
                .font-display{font-family:'Playfair Display',serif}
                .wrap{width:100%;max-width:1140px;margin:0 auto;padding-left:20px;padding-right:20px}
                .hex-bg{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='76' viewBox='0 0 88 76'%3E%3Cpath d='M44 2 84 21v34L44 74 4 55V21Z' fill='none' stroke='%23cfa968' stroke-opacity='.18' stroke-width='1'/%3E%3C/svg%3E");background-size:88px 76px}
                @media(min-width:640px){.wrap{padding-left:28px;padding-right:28px}}
            `}</style>

            <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d9b56f]/45 bg-[#f6e7c6]/90 backdrop-blur">
                <div className="wrap flex h-[72px] items-center justify-between">
                    <Link href="/landing" className="flex items-center gap-3">
                        <img
                            src={logoPath}
                            alt={companyName}
                            className="h-11 w-auto object-contain"
                        />
                        <div>
                            <p className="font-display text-[20px] leading-none font-bold text-[#8c0a16]">
                                {companyName}
                            </p>
                            <p className="text-[11px] font-black tracking-[.28em] text-[#ff9200] uppercase">
                                {companySubtitle}
                            </p>
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-8 text-[14px] font-bold text-[#6f4c41] lg:flex">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="transition hover:text-[#a60f24]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <a
                        href={whatsappHref}
                        className="inline-flex items-center gap-2 rounded-full bg-[#b00016] px-5 py-3 text-[13px] font-black text-white shadow-[0_12px_30px_rgba(176,0,22,.28)]"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Konsultasi Gratis
                    </a>
                </div>
            </header>

            <main id="landing-package-top" className="pt-[72px]">
                <section className="hex-bg overflow-hidden bg-[#fff3dc]">
                    <div className="wrap grid min-h-[720px] items-center gap-12 py-16 lg:grid-cols-[1fr_420px] lg:gap-16 lg:py-20">
                        <motion.div {...sectionMotion}>
                            <div className="mb-5 inline-flex rounded-full border border-[#ef9d8f] bg-[#ffe6df] px-4 py-2 text-[11px] font-black tracking-[.15em] text-[#c80012] uppercase">
                                Program Terbatas - Seats Terbatas
                            </div>
                            <p className="mb-3 text-[13px] font-black tracking-[.24em] text-[#9b0715] uppercase">
                                Paket Umroh
                            </p>
                            <h1 className="font-display text-[clamp(42px,7vw,78px)] leading-[.95] font-black text-[#9b0715]">
                                {packageName}
                                <span className="block text-[#ff9200] italic">
                                    {departureMonth}
                                </span>
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-[15px] text-[#6f4c41]">
                                <span>
                                    {departureDate
                                        ? `Berangkat ${formatDate(departureDate)}`
                                        : 'Keberangkatan package tersedia'}
                                </span>
                                {durationDays > 0 ? (
                                    <span className="rounded-full bg-[#ff9200] px-3 py-1 text-[11px] font-black text-white">
                                        {durationDays} Hari Program
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-9 rounded-[22px] border border-[#d9b56f] bg-white/78 p-5 shadow-[0_20px_60px_rgba(140,10,22,.08)]">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="text-[10px] font-black tracking-[.3em] text-[#8c0a16] uppercase">
                                        Mulai Dari
                                    </span>
                                    <span className="h-px flex-1 bg-[#c9974c]" />
                                </div>
                                <div className="space-y-3">
                                    {roomRows.map((row) => (
                                        <RoomPriceRow
                                            key={row.label}
                                            label={row.label}
                                            room={row.room}
                                            price={formatPrice(
                                                row.price,
                                                'id',
                                                currency,
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div
                                id="fasilitas"
                                className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
                            >
                                {featureCards.map((item) => {
                                    const Icon = iconFor(item.icon);

                                    return (
                                        <div
                                            key={item.title}
                                            className="rounded-[14px] border border-[#d9b56f] bg-white/80 px-4 py-4 text-center"
                                        >
                                            <Icon className="mx-auto h-5 w-5 text-[#b00016]" />
                                            <p className="mt-2 text-[12px] font-black text-[#9b0715]">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] text-[#7a5c50]">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-5 max-w-[660px] text-[15px] leading-[1.85] text-[#5e4a42]">
                                {summary}
                            </p>
                            <div className="mt-6 grid max-w-[560px] gap-3">
                                <a
                                    href={whatsappHref}
                                    className="inline-flex justify-center rounded-[14px] bg-[#22c55e] px-6 py-4 text-[15px] font-black text-white shadow-[0_16px_30px_rgba(34,197,94,.28)]"
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Konsultasi Gratis via WhatsApp
                                </a>
                                <a
                                    href="#detail"
                                    className="inline-flex justify-center rounded-[14px] border border-[#d89d8f] bg-white/40 px-6 py-4 text-[14px] font-black text-[#9b0715]"
                                >
                                    Lihat Detail Paket Lengkap
                                </a>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-4">
                                {trustPoints.map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#7a5c50]"
                                    >
                                        <Check className="h-4 w-4 rounded-full bg-[#f8dfe0] p-0.5 text-[#d80620]" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            {...sectionMotion}
                            transition={{ duration: 0.6, delay: 0.08 }}
                            className="relative"
                        >
                            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#5d0208,#b00016)] shadow-[0_30px_70px_rgba(90,4,11,.24)]">
                                {text(travelPackage.image_path) ? (
                                    <img
                                        src={text(travelPackage.image_path)}
                                        alt={packageName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-[72px]">Ka'bah</div>
                                )}
                                <div className="absolute right-6 bottom-6 grid h-[112px] w-[112px] place-items-center rounded-full bg-[#ff9200] text-center text-[12px] leading-tight font-black text-white shadow-[0_18px_44px_rgba(255,146,0,.34)]">
                                    FREE
                                    <br />
                                    KONSULTASI
                                    <span className="text-[9px]">
                                        Se-Jabodetabek
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="bg-[#760710] text-white">
                    <div className="wrap grid gap-px py-5 sm:grid-cols-2 lg:grid-cols-4">
                        {featureCards.map((item) => {
                            const Icon = iconFor(item.icon);

                            return (
                                <div
                                    key={`strip-${item.title}`}
                                    className="flex items-center gap-3 border-white/10 px-4 lg:border-r"
                                >
                                    <Icon className="h-7 w-7 text-[#ff9200]" />
                                    <div>
                                        <p className="text-[10px] font-black tracking-[.18em] text-white/55 uppercase">
                                            {item.title}
                                        </p>
                                        <p className="text-[14px] font-black">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <motion.section
                    id="detail"
                    className="bg-white px-4 py-20 sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap text-center">
                        <span className="rounded-full border border-[#e2b278] bg-white px-4 py-1 text-[11px] font-black tracking-[.18em] text-[#a60f24] uppercase">
                            {packageHeading.title}
                        </span>
                        <h2 className="font-display mt-5 text-[34px] leading-tight font-black text-[#8c0a16] lg:text-[48px]">
                            {packageHeading.heading}
                            <span className="block text-[#ff9200] italic">
                                {packageHeading.heading2}
                            </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-[680px] text-[14px] leading-[1.8] text-[#7a5c50]">
                            {packageHeading.description}
                        </p>
                    </div>

                    <div className="wrap mt-12 grid gap-5 lg:grid-cols-3">
                        {[...featureCards, ...itineraries.slice(0, 2)].map(
                            (item, index) => {
                                const itemRecord = asRecord(item);
                                const Icon = iconFor(
                                    text(itemRecord.icon, 'check'),
                                );
                                const title =
                                    text(itemRecord.title) ||
                                    `Hari ${text(itemRecord.day_number, String(index + 1))}`;
                                const description =
                                    text(itemRecord.description) ||
                                    localize(itemRecord.activity, 'id') ||
                                    'Agenda perjalanan disiapkan tim Asfar Tour.';

                                return (
                                    <div
                                        key={`detail-card-${index}`}
                                        className="rounded-[20px] border border-[#e0c9a0] bg-[#fbf1dd] p-6"
                                    >
                                        <Icon className="mb-4 h-8 w-8 text-[#a60f24]" />
                                        <h3 className="text-[17px] font-black text-[#8c0a16]">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-[13px] leading-[1.7] text-[#7a5c50]">
                                            {description}
                                        </p>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </motion.section>

                <Wave fill="#f6e7c6" />
                <motion.section
                    className="bg-[#f6e7c6] px-4 py-20 sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap text-center">
                        <span className="rounded-full border border-[#deb579] bg-[#fff8ed] px-4 py-1 text-[11px] font-black tracking-[.18em] text-[#c8871f] uppercase">
                            {text(
                                includedContent.section_badge,
                                'Detail Paket',
                            )}
                        </span>
                        <h2 className="font-display mt-5 text-[34px] leading-tight font-black text-[#2c1712] lg:text-[48px]">
                            {text(
                                includedContent.section_heading_prefix,
                                'Yang',
                            )}{' '}
                            <span className="text-[#2c1712] italic">
                                {text(
                                    includedContent.section_heading_highlight,
                                    'Termasuk',
                                )}
                            </span>{' '}
                            {text(
                                includedContent.section_heading_suffix,
                                'dalam Paket',
                            )}
                        </h2>
                    </div>
                    <div className="wrap mt-12 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[26px] border border-[#efd6df] bg-white p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <h3 className="font-display text-[20px] font-black text-[#8d0917]">
                                    {text(
                                        includedContent.title,
                                        'Termasuk dalam Paket',
                                    )}
                                </h3>
                                <span className="rounded-md bg-[#f8dfe0] px-3 py-1 text-[10px] font-black text-[#d11c2d]">
                                    {text(
                                        includedContent.status_label,
                                        'Included',
                                    )}
                                </span>
                            </div>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {includedItems.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-[14px] font-semibold text-[#3f342f]"
                                    >
                                        <Check className="mt-0.5 h-5 w-5 rounded-full bg-[#f8dfe0] p-1 text-[#d11c2d]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[26px] border border-[#e2c78f] bg-[#fbf1dd] p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <h3 className="font-display text-[20px] font-black text-[#8a776d]">
                                    {text(
                                        excludedContent.title,
                                        'Tidak Termasuk',
                                    )}
                                </h3>
                                <span className="rounded-md bg-[#ece2d2] px-3 py-1 text-[10px] font-black text-[#8a776d]">
                                    {text(
                                        excludedContent.status_label,
                                        'Excluded',
                                    )}
                                </span>
                            </div>
                            <ul className="grid gap-3">
                                {excludedItems.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-[14px] font-semibold text-[#3f342f]"
                                    >
                                        <X className="mt-0.5 h-5 w-5 rounded-full bg-[#e9e0cf] p-1 text-[#999]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.section>
                <Wave fill="#f6e7c6" flip />

                <motion.section
                    className="bg-white px-4 py-20 sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap text-center">
                        <span className="rounded-full border border-[#e7c79b] bg-[#fff8ed] px-4 py-1 text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                            {text(reasonsContent.title, 'Kenapa Pilih Kami')}
                        </span>
                        <h2 className="font-display mt-5 text-[34px] leading-tight font-black text-[#8c0a16] lg:text-[48px]">
                            {splitLines(reasonsContent.heading)[0] ||
                                'Lebih dari Sekadar Perjalanan,'}
                            <span className="block text-[#ff9200] italic">
                                {splitLines(reasonsContent.heading)[1] ||
                                    'Ini Pengalaman Berharga'}
                            </span>
                        </h2>
                    </div>
                    <div className="wrap mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {reasonItems.map((item, index) => {
                            const Icon = iconFor(item.icon);

                            return (
                                <div
                                    key={`reason-${index}`}
                                    className="rounded-[20px] border border-[#e0c9a0] bg-[#fbf1dd] p-6"
                                >
                                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e6c691] bg-white text-[#d59a3d]">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-[17px] font-black text-[#8c0a16]">
                                        {text(item.title)}
                                    </h3>
                                    <p className="mt-2 text-[13px] leading-[1.8] text-[#a77d69]">
                                        {text(item.description)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    {reasonStats.length > 0 ? (
                        <div className="wrap mt-12 grid rounded-[22px] bg-[linear-gradient(135deg,#8c0a16,#3d0508)] px-8 py-8 sm:grid-cols-3">
                            {reasonStats.slice(0, 3).map((item, index) => (
                                <div
                                    key={`reason-stat-${index}`}
                                    className="border-white/10 px-4 text-center last:border-r-0 sm:border-r"
                                >
                                    <p className="font-display text-[38px] font-black text-white">
                                        {text(item.value)}
                                    </p>
                                    <p className="text-[12px] text-white/65">
                                        {text(item.label)}
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold text-[#ffc578]">
                                        {text(item.note)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </motion.section>

                <motion.section
                    id="testimoni"
                    className="bg-white px-4 py-20 sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap text-center">
                        <span className="rounded-full border border-[#e9b7bd] bg-white px-4 py-1 text-[11px] font-black tracking-[.18em] text-[#315dcc] uppercase">
                            Testimoni Jamaah
                        </span>
                        <h2 className="font-display mt-5 text-[34px] font-black text-[#8c0a16] lg:text-[48px]">
                            Apa Kata{' '}
                            <span className="text-[#ff9200] italic">
                                Mereka?
                            </span>
                        </h2>
                    </div>
                    <div className="wrap mt-12 grid gap-6 lg:grid-cols-3">
                        {testimonials.slice(0, 3).map((testimonial, index) => {
                            const name = text(testimonial.name, 'Jamaah Asfar');
                            const origin = text(testimonial.origin_city);

                            return (
                                <div
                                    key={`testimonial-${index}`}
                                    className={`rounded-[20px] border p-7 ${index === 0 ? 'bg-white' : 'bg-[#fff4df]'} border-[#e8c893]`}
                                >
                                    <p className="text-[24px] font-black text-[#f28a00]">
                                        *****
                                    </p>
                                    <p className="mt-4 min-h-[132px] text-[14px] leading-[1.9] text-[#6f4c41] italic">
                                        {text(testimonial.quote)}
                                    </p>
                                    <div className="mt-6 flex items-center gap-3 border-t border-[#d7b87a] pt-5">
                                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#b00016] text-[12px] font-black text-white">
                                            {initials(name)}
                                        </span>
                                        <div>
                                            <p className="font-black text-[#a60f24]">
                                                {name}
                                            </p>
                                            <p className="text-[12px] text-[#7a5c50]">
                                                {origin || 'Indonesia'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                <Wave fill="#f6e7c6" />
                <motion.section
                    id="faq"
                    className="bg-[#f6e7c6] px-4 py-20 sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap max-w-[860px] text-center">
                        <span className="rounded-full border border-[#e7c79b] bg-[#fff8ed] px-4 py-1 text-[11px] font-bold tracking-[.16em] text-[#a10a16] uppercase">
                            {text(
                                faqContent.title,
                                'Pertanyaan yang Sering Diajukan',
                            )}
                        </span>
                        <h2 className="font-display mt-5 text-[34px] font-black text-[#8c0a16] lg:text-[48px]">
                            {text(faqContent.heading_prefix, 'Pertanyaan yang')}{' '}
                            <span className="text-[#ff9200] italic">
                                {text(
                                    faqContent.heading_highlight,
                                    'Sering Ditanyakan',
                                )}
                            </span>
                        </h2>
                    </div>
                    <div className="wrap mt-10 max-w-[860px] space-y-3">
                        {faqs.slice(0, 5).map((faq, index) => {
                            const isOpen = activeFaq === index;

                            return (
                                <button
                                    key={`faq-${index}`}
                                    type="button"
                                    onClick={() =>
                                        setActiveFaq(isOpen ? -1 : index)
                                    }
                                    className="w-full rounded-[14px] bg-white px-5 py-4 text-left shadow-sm"
                                >
                                    <span className="flex items-center justify-between gap-4 text-[14px] font-black text-[#5b3127]">
                                        {localize(faq.question, 'id')}
                                        <ChevronRight
                                            className={`h-4 w-4 text-[#d80620] transition ${isOpen ? 'rotate-90' : ''}`}
                                        />
                                    </span>
                                    {isOpen ? (
                                        <span className="mt-3 block text-[13px] leading-[1.8] text-[#7a5c50]">
                                            {localize(faq.answer, 'id')}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </motion.section>
                <Wave fill="#f6e7c6" flip />

                <motion.section
                    className="bg-[linear-gradient(135deg,#8c0a16_0%,#d80620_100%)] px-4 py-20 text-center text-white sm:px-6 lg:px-8"
                    {...sectionMotion}
                >
                    <div className="wrap max-w-[720px]">
                        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-black tracking-[.2em] text-[#ffc578] uppercase">
                            {text(
                                ctaContent.badge,
                                'Jangan Tunda Niat Baik Anda',
                            )}
                        </span>
                        <h2 className="font-display mt-5 text-[36px] leading-tight font-black lg:text-[54px]">
                            {text(
                                ctaContent.title,
                                'Jangan Tunda Niat Baik Anda',
                            )}
                        </h2>
                        <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-[1.9] text-white/75">
                            {text(
                                ctaContent.description,
                                'Konsultasikan persiapan ibadah Anda sekarang bersama tim Asfar Tour.',
                            )}
                        </p>
                        <a
                            href={whatsappHref}
                            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#22c55e] px-9 py-4 text-[15px] font-black text-white shadow-[0_16px_40px_rgba(34,197,94,.28)]"
                        >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            {text(
                                ctaContent.button_label,
                                'Konsultasi via WhatsApp',
                            )}
                        </a>
                    </div>
                </motion.section>
            </main>

            <footer className="bg-[#3d0508] px-4 pt-12 pb-6 text-white sm:px-6 lg:px-8">
                <div className="wrap grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
                    <div>
                        <div className="flex items-center gap-3">
                            <img
                                src={logoPath}
                                alt={companyName}
                                className="h-10 w-auto object-contain"
                            />
                            <div>
                                <p className="font-display text-[18px] font-bold">
                                    {companyName}
                                </p>
                                <p className="text-[9px] tracking-[.28em] text-[#ff9200] uppercase">
                                    {companySubtitle}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-[320px] text-[13px] leading-[1.8] text-white/45">
                            Jelas rencananya, terjamin amanahnya. Perjalanan
                            ibadah dengan sistem transparan dan tim profesional.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {socialAccounts.map((item, index) => {
                                const platform = item.platform.toLowerCase();
                                const Icon = platform.includes('instagram')
                                    ? Instagram
                                    : platform.includes('tiktok')
                                      ? Music2
                                      : MessageCircle;

                                return (
                                    <a
                                        key={`footer-social-${index}`}
                                        href={item.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/5 text-white/75"
                                        aria-label={item.label}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black tracking-[.16em] text-white/50 uppercase">
                            Menu
                        </h3>
                        <div className="mt-4 space-y-2">
                            {FOOTER_LINKS.map((item) => (
                                <a
                                    key={item}
                                    href="#landing-package-top"
                                    className="block text-[13px] text-white/45 transition hover:text-[#ff9200]"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black tracking-[.16em] text-white/50 uppercase">
                            Paket
                        </h3>
                        <div className="mt-4 space-y-2">
                            <Link
                                href="/landing"
                                className="block text-[13px] text-white/45 transition hover:text-[#ff9200]"
                            >
                                Landing Promo
                            </Link>
                            <Link
                                href="/paket-umroh"
                                className="block text-[13px] text-white/45 transition hover:text-[#ff9200]"
                            >
                                Semua Paket
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="wrap mt-10 border-t border-white/10 pt-5 text-[12px] text-white/25">
                    (c) 2026 {companyName}. Semua hak dilindungi.
                </div>
            </footer>

            <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Konsultasi Gratis"
                className="fixed right-5 bottom-5 z-50 grid h-[58px] w-[58px] place-items-center rounded-full bg-[#22c55e] text-white shadow-[0_10px_28px_rgba(34,197,94,.45)]"
            >
                <MessageCircle className="h-7 w-7" />
            </a>
        </>
    );
}
