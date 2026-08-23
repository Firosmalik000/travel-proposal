import { formatDate, formatPrice, localize } from '@/lib/public/content';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    Check,
    ChevronDown,
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

interface RoomRow {
    label: string;
    room: string;
    price: number | null;
}

interface FeatureCard {
    icon: string;
    title: string;
    description: string;
}

interface PackageSalesExperienceProps {
    brand: {
        name: string;
        subtitle: string;
        logoPath: string;
    };
    offer: {
        name: string;
        summary: string;
        currency: string;
        departureDate: string;
        departureMonth: string;
        durationDays: number;
        imagePath: string;
        primaryPrice: number | null;
        roomRows: RoomRow[];
    };
    copy: {
        packageTitle: string;
        packageHeading: string;
        packageHighlight: string;
        packageDescription: string;
        includedTitle: string;
        includedLabel: string;
        excludedTitle: string;
        excludedLabel: string;
        faqTitle: string;
        faqHeading: string;
        faqHighlight: string;
        ctaBadge: string;
        ctaTitle: string;
        ctaDescription: string;
        ctaButton: string;
    };
    featureCards: FeatureCard[];
    trustPoints: string[];
    includedItems: string[];
    excludedItems: string[];
    reasonItems: CmsRecord[];
    reasonStats: CmsRecord[];
    testimonials: CmsRecord[];
    faqs: CmsRecord[];
    itineraries: CmsRecord[];
    socialAccounts: Array<{
        platform: string;
        url: string;
        label: string;
    }>;
    whatsappHref: string;
}

const NAVIGATION = [
    { label: 'Harga', href: '#harga' },
    { label: 'Perjalanan', href: '#perjalanan' },
    { label: 'Fasilitas', href: '#fasilitas' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'FAQ', href: '#faq' },
] as const;

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function iconFor(value: string) {
    const normalized = value.toLowerCase();

    if (normalized.includes('plane')) return Plane;
    if (normalized.includes('hotel')) return Hotel;
    if (normalized.includes('soup')) return Soup;
    if (normalized.includes('shield')) return ShieldCheck;
    if (normalized.includes('user')) return Users;
    if (normalized.includes('map')) return MapPin;

    return BadgeCheck;
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

const reveal = {
    initial: { opacity: 1, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
} as const;

function ArchMark() {
    return (
        <svg viewBox="0 0 160 190" aria-hidden="true" className="h-full w-full">
            <path
                d="M80 4C37 28 12 64 12 106v80h136v-80C148 64 123 28 80 4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M80 28c-30 20-46 47-46 80v58h92v-58c0-33-16-60-46-80Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
            />
        </svg>
    );
}

function PriceBoard({ rows, currency }: { rows: RoomRow[]; currency: string }) {
    return (
        <div className="divide-y divide-[#d7b987] border-y border-[#d7b987]">
            {rows.map((row, index) => (
                <div
                    key={row.label}
                    className="grid grid-cols-[auto_1fr] items-center gap-4 py-4 sm:grid-cols-[110px_1fr_auto] sm:gap-6"
                >
                    <span
                        className={`w-fit rounded-full px-3 py-1 text-[10px] font-black tracking-[.14em] uppercase ${
                            index === 0
                                ? 'bg-[#8c0a16] text-white'
                                : 'bg-[#f3dfc4] text-[#8c0a16]'
                        }`}
                    >
                        {row.label}
                    </span>
                    <span className="text-[12px] font-semibold text-[#6f5147] sm:text-[13px]">
                        {row.room}
                    </span>
                    <span className="font-display col-span-2 text-[22px] font-black text-[#8c0a16] sm:col-span-1 sm:text-[24px]">
                        {formatPrice(row.price, 'id', currency)}
                        <small className="ml-1 font-sans text-[10px] font-semibold text-[#8d7166]">
                            /jamaah
                        </small>
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function PackageSalesExperience({
    brand,
    offer,
    copy,
    featureCards,
    trustPoints,
    includedItems,
    excludedItems,
    reasonItems,
    reasonStats,
    testimonials,
    faqs,
    itineraries,
    socialAccounts,
    whatsappHref,
}: PackageSalesExperienceProps) {
    const [activeFaq, setActiveFaq] = useState(0);
    const journeyItems = itineraries.slice(0, 5);
    const reasons = reasonItems.length > 0 ? reasonItems.slice(0, 6) : [];

    return (
        <div className="package-experience min-h-screen overflow-x-clip bg-[#fbf4e7] text-[#33150f] selection:bg-[#8c0a16] selection:text-white">
            <style>{`
                html{scroll-behavior:smooth}
                body{margin:0;background:#fbf4e7;overflow-x:hidden}
                .package-experience{--maroon:#8c0a16;--maroon-deep:#3d0508;--orange:#ff9200;--cream:#fbf4e7;--sand:#f0dfbd}
                .package-experience .display{font-family:'Playfair Display',Georgia,serif}
                .package-experience .shell{width:min(100% - 32px,1240px);margin-inline:auto}
                .package-experience .geometry{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='98' viewBox='0 0 112 98'%3E%3Cg fill='none' stroke='%23e1c58f' stroke-opacity='.23'%3E%3Cpath d='m56 1 54 30v36L56 97 2 67V31Z'/%3E%3Cpath d='m56 18 36 20v22L56 80 20 60V38Z'/%3E%3C/g%3E%3C/svg%3E");background-size:112px 98px}
                .package-experience :focus-visible{outline:3px solid #ff9200;outline-offset:4px}
                .package-experience ::-webkit-scrollbar{width:10px}
                .package-experience ::-webkit-scrollbar-track{background:#fbf4e7}
                .package-experience ::-webkit-scrollbar-thumb{background:#8c0a16;border:3px solid #fbf4e7;border-radius:99px}
                @media(min-width:768px){.package-experience .shell{width:min(100% - 64px,1240px)}}
            `}</style>

            <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#3d0508] text-white shadow-[0_12px_36px_rgba(61,5,8,.18)]">
                <div className="shell flex h-[72px] items-center justify-between gap-5">
                    <Link href="/landing" className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#fbf4e7]">
                            <img
                                src={brand.logoPath}
                                alt={brand.name}
                                className="h-7 w-auto object-contain"
                            />
                        </span>
                        <span>
                            <b className="display block text-[17px] leading-none">
                                {brand.name}
                            </b>
                            <span className="mt-1 block text-[8px] font-black tracking-[.3em] text-[#ffb446] uppercase">
                                {brand.subtitle}
                            </span>
                        </span>
                    </Link>
                    <nav className="hidden items-center gap-8 text-[12px] font-bold text-white/62 lg:flex">
                        {NAVIGATION.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="transition hover:text-[#ffb446]"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <a
                        href={whatsappHref}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ff9200] px-4 text-[11px] font-black text-[#3d0508] shadow-[0_10px_30px_rgba(255,146,0,.25)] transition hover:-translate-y-0.5 sm:px-6 sm:text-[12px]"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Konsultasi</span>
                        Gratis
                    </a>
                </div>
            </header>

            <main className="pt-[72px]">
                <section className="geometry relative min-h-[calc(100svh-72px)] overflow-hidden bg-[#fbf4e7]">
                    <div className="absolute inset-y-0 right-0 hidden w-[33vw] bg-[#8c0a16] lg:block" />
                    <div className="absolute top-[-90px] left-[-50px] h-[280px] w-[280px] text-[#8c0a16]/10">
                        <ArchMark />
                    </div>

                    <div className="shell relative grid min-h-[calc(100svh-72px)] content-center gap-10 py-12 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,.82fr)] lg:gap-16 lg:py-16">
                        <motion.div {...reveal} className="relative z-10">
                            <div className="mb-7 flex items-center gap-3">
                                <span className="h-px w-12 bg-[#8c0a16]" />
                                <span className="text-[10px] font-black tracking-[.25em] text-[#8c0a16] uppercase">
                                    Program Umroh Pilihan
                                </span>
                            </div>
                            <h1 className="display max-w-[820px] text-[clamp(48px,7.5vw,108px)] leading-[.86] font-black tracking-[-.035em] text-[#8c0a16]">
                                {offer.name}
                            </h1>
                            <p className="display mt-2 text-[clamp(38px,6vw,82px)] leading-none font-bold text-[#ff9200] italic">
                                {offer.departureMonth}
                            </p>

                            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-y border-[#d9bc88] py-4 text-[12px] font-bold text-[#694b41]">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[#8c0a16]" />
                                    {offer.departureDate
                                        ? formatDate(offer.departureDate)
                                        : 'Jadwal tersedia'}
                                </span>
                                {offer.durationDays > 0 ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Clock3 className="h-4 w-4 text-[#8c0a16]" />
                                        {offer.durationDays} hari perjalanan
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center gap-2 text-[#8c0a16]">
                                    <ShieldCheck className="h-4 w-4" />
                                    Pendampingan penuh
                                </span>
                            </div>

                            <p className="mt-6 max-w-[640px] text-[15px] leading-[1.9] text-[#684c42] sm:text-[17px]">
                                {offer.summary}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={whatsappHref}
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#8c0a16] px-7 text-[14px] font-black text-white shadow-[0_16px_40px_rgba(140,10,22,.22)] transition hover:-translate-y-1 hover:bg-[#6f0712]"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Tanya Program Ini
                                </a>
                                <a
                                    href="#harga"
                                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[14px] border border-[#8c0a16]/25 px-7 text-[14px] font-black text-[#8c0a16] transition hover:bg-white"
                                >
                                    Lihat Biaya
                                    <ArrowDown className="h-4 w-4" />
                                </a>
                            </div>
                            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                                {trustPoints.slice(0, 4).map((point) => (
                                    <span
                                        key={point}
                                        className="inline-flex items-center gap-2 text-[10px] font-bold text-[#72584e] sm:text-[11px]"
                                    >
                                        <Check className="h-4 w-4 rounded-full bg-[#f2d9d7] p-0.5 text-[#8c0a16]" />
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 1, x: 36 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.85,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="relative z-10 lg:pr-8"
                        >
                            <div className="relative mx-auto max-w-[500px]">
                                <div className="absolute -top-6 -left-5 z-20 grid h-24 w-24 place-items-center rounded-full bg-[#ff9200] text-center text-[10px] leading-tight font-black text-[#3d0508] shadow-[0_18px_38px_rgba(255,146,0,.3)] sm:h-28 sm:w-28">
                                    FREE
                                    <br />
                                    KONSULTASI
                                    <span className="text-[8px] font-bold">
                                        TANPA TEKANAN
                                    </span>
                                </div>
                                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[180px] rounded-b-[22px] bg-[#610811] shadow-[0_36px_80px_rgba(61,5,8,.3)]">
                                    <div className="geometry absolute inset-0 opacity-30" />
                                    {offer.imagePath ? (
                                        <img
                                            src={offer.imagePath}
                                            alt={offer.name}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center text-[#f1ca7d]">
                                            <div className="h-44 w-36">
                                                <ArchMark />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3d0508] via-transparent to-transparent" />
                                    <div className="absolute right-0 bottom-0 left-0 p-6 text-white sm:p-8">
                                        <p className="text-[9px] font-black tracking-[.25em] text-[#ffc76a] uppercase">
                                            Investasi Ibadah Mulai
                                        </p>
                                        <p className="display mt-2 text-[30px] font-black sm:text-[38px]">
                                            {formatPrice(
                                                offer.primaryPrice,
                                                'id',
                                                offer.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="harga" className="bg-[#3d0508] text-white">
                    <div className="shell grid lg:grid-cols-[.78fr_1.22fr]">
                        <div className="border-b border-white/10 py-12 lg:border-r lg:border-b-0 lg:py-16 lg:pr-14">
                            <p className="text-[10px] font-black tracking-[.24em] text-[#ffb446] uppercase">
                                Mulai dari
                            </p>
                            <h2 className="display mt-3 text-[38px] leading-[1.05] font-black sm:text-[52px]">
                                Biaya jelas.
                                <span className="block text-[#ffb446] italic">
                                    Ibadah lebih tenang.
                                </span>
                            </h2>
                            <p className="mt-5 max-w-[430px] text-[13px] leading-[1.8] text-white/58">
                                Pilih konfigurasi kamar yang paling nyaman. Tim
                                kami siap menjelaskan rincian tanpa biaya
                                tersembunyi.
                            </p>
                        </div>
                        <div className="py-10 lg:py-16 lg:pl-14">
                            <PriceBoard
                                rows={offer.roomRows}
                                currency={offer.currency}
                            />
                            <a
                                href={whatsappHref}
                                className="mt-7 inline-flex items-center gap-2 text-[13px] font-black text-[#ffb446]"
                            >
                                Konsultasikan pilihan kamar
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </section>

                <section id="perjalanan" className="bg-white py-20 lg:py-28">
                    <motion.div {...reveal} className="shell">
                        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
                            <div className="lg:sticky lg:top-28 lg:self-start">
                                <span className="text-[10px] font-black tracking-[.24em] text-[#8c0a16] uppercase">
                                    {copy.packageTitle}
                                </span>
                                <h2 className="display mt-4 text-[42px] leading-[1.02] font-black text-[#8c0a16] sm:text-[58px]">
                                    {copy.packageHeading}
                                    <span className="block text-[#ff9200] italic">
                                        {copy.packageHighlight}
                                    </span>
                                </h2>
                                <p className="mt-6 max-w-[520px] text-[14px] leading-[1.9] text-[#72584e]">
                                    {copy.packageDescription}
                                </p>
                            </div>

                            <div className="relative border-l border-[#dabb83] pl-7 sm:pl-10">
                                {(journeyItems.length > 0
                                    ? journeyItems
                                    : featureCards
                                ).map((item, index) => {
                                    const record = item as CmsRecord;
                                    const title =
                                        localize(record.title, 'id') ||
                                        localize(record.activity, 'id') ||
                                        (item as FeatureCard).title ||
                                        `Hari ${index + 1}`;
                                    const description =
                                        localize(record.description, 'id') ||
                                        localize(record.activity, 'id') ||
                                        (item as FeatureCard).description ||
                                        'Agenda perjalanan disiapkan dengan tertata.';

                                    return (
                                        <div
                                            key={`journey-${index}`}
                                            className="relative border-b border-[#eadcc2] py-7 first:pt-0 last:border-b-0"
                                        >
                                            <span className="absolute top-8 -left-[34px] grid h-4 w-4 place-items-center rounded-full bg-[#8c0a16] ring-4 ring-white sm:-left-[44px]">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#ffb446]" />
                                            </span>
                                            <div className="grid gap-2 sm:grid-cols-[70px_1fr] sm:gap-5">
                                                <span className="display text-[30px] font-black text-[#d8b77b]">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0',
                                                    )}
                                                </span>
                                                <div>
                                                    <h3 className="text-[18px] font-black text-[#8c0a16]">
                                                        {title}
                                                    </h3>
                                                    <p className="mt-2 text-[13px] leading-[1.8] text-[#72584e]">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section
                    id="fasilitas"
                    className="geometry bg-[#f0dfbd] py-20 lg:py-28"
                >
                    <div className="shell">
                        <motion.div {...reveal} className="max-w-[760px]">
                            <h2 className="display text-[42px] leading-[1.02] font-black text-[#8c0a16] sm:text-[60px]">
                                Satu perjalanan,
                                <span className="block text-[#ff9200] italic">
                                    semua lebih terarah.
                                </span>
                            </h2>
                            <p className="mt-5 max-w-[600px] text-[14px] leading-[1.9] text-[#72584e]">
                                Empat hal penting yang kami siapkan agar jamaah
                                bisa menjaga fokusnya pada ibadah.
                            </p>
                        </motion.div>

                        <div className="mt-12 grid border-y border-[#cfae72] sm:grid-cols-2 lg:grid-cols-4">
                            {featureCards.map((item, index) => {
                                const Icon = iconFor(item.icon);

                                return (
                                    <div
                                        key={item.title}
                                        className={`group border-b border-[#cfae72] py-8 sm:px-6 lg:border-r lg:border-b-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 ${index % 2 === 0 ? 'sm:border-r' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Icon className="h-7 w-7 text-[#8c0a16]" />
                                            <span className="display text-[26px] text-[#8c0a16]/18">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                        </div>
                                        <h3 className="mt-7 text-[15px] font-black text-[#8c0a16]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-[12px] leading-[1.7] text-[#72584e]">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="bg-[#fbf4e7] py-20 lg:py-28">
                    <div className="shell grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[16px] bg-[#8c0a16] p-7 text-white sm:p-10">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="display text-[32px] font-black sm:text-[40px]">
                                    {copy.includedTitle}
                                </h2>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-[9px] font-black tracking-[.12em] text-[#ffc76a] uppercase">
                                    {copy.includedLabel}
                                </span>
                            </div>
                            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                                {includedItems.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-[13px] leading-[1.65] text-white/82"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ffc76a]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-[16px] border border-[#d7ba86] p-7 sm:p-10">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="display text-[32px] font-black text-[#4e3027] sm:text-[40px]">
                                    {copy.excludedTitle}
                                </h2>
                                <span className="rounded-full bg-[#efe1c8] px-3 py-1 text-[9px] font-black tracking-[.12em] text-[#795c50] uppercase">
                                    {copy.excludedLabel}
                                </span>
                            </div>
                            <ul className="mt-8 grid gap-y-4">
                                {excludedItems.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-[13px] leading-[1.65] text-[#674d43]"
                                    >
                                        <X className="mt-0.5 h-4 w-4 shrink-0 text-[#8c0a16]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-white py-20 lg:py-28">
                    <div className="absolute top-[-110px] right-[-30px] h-[360px] w-[300px] text-[#8c0a16]/6">
                        <ArchMark />
                    </div>
                    <div className="shell relative">
                        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                            <div>
                                <h2 className="display text-[44px] leading-[1] font-black text-[#8c0a16] sm:text-[62px]">
                                    Bukan sekadar berangkat.
                                    <span className="block text-[#ff9200] italic">
                                        Pulang membawa makna.
                                    </span>
                                </h2>
                            </div>
                            <div className="grid gap-x-10 sm:grid-cols-2">
                                {(reasons.length > 0
                                    ? reasons
                                    : featureCards
                                ).map((item, index) => {
                                    const record = item as CmsRecord;
                                    const Icon = iconFor(
                                        text(record.icon, 'shield'),
                                    );
                                    const title =
                                        localize(record.title, 'id') ||
                                        (item as FeatureCard).title;
                                    const description =
                                        localize(record.description, 'id') ||
                                        (item as FeatureCard).description;

                                    return (
                                        <div
                                            key={`reason-${index}`}
                                            className="border-t border-[#dfc99f] py-6"
                                        >
                                            <Icon className="h-5 w-5 text-[#8c0a16]" />
                                            <h3 className="mt-4 text-[15px] font-black text-[#8c0a16]">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-[12px] leading-[1.75] text-[#72584e]">
                                                {description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {reasonStats.length > 0 ? (
                            <div className="mt-14 grid divide-y divide-white/10 rounded-[16px] bg-[#3d0508] px-6 py-2 text-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0">
                                {reasonStats.slice(0, 3).map((stat, index) => (
                                    <div
                                        key={`stat-${index}`}
                                        className="py-7 text-center sm:px-8"
                                    >
                                        <p className="display text-[34px] font-black text-[#ffc76a]">
                                            {text(stat.value)}
                                        </p>
                                        <p className="mt-1 text-[10px] font-bold tracking-[.12em] text-white/55 uppercase">
                                            {text(stat.label)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>

                <section
                    id="testimoni"
                    className="geometry bg-[#f0dfbd] py-20 lg:py-28"
                >
                    <div className="shell">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                            <h2 className="display max-w-[760px] text-[44px] leading-[1] font-black text-[#8c0a16] sm:text-[62px]">
                                Cerita mereka,
                                <span className="text-[#ff9200] italic">
                                    {' '}
                                    bukti pelayanan kami.
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-[11px] font-black text-[#8c0a16]">
                                <Star className="h-4 w-4 fill-[#ff9200] text-[#ff9200]" />
                                Pengalaman Jamaah
                            </div>
                        </div>

                        <div className="mt-12 grid gap-5 lg:grid-cols-3">
                            {testimonials
                                .slice(0, 3)
                                .map((testimonial, index) => {
                                    const name = text(
                                        testimonial.name,
                                        'Jamaah Asfar Tour',
                                    );
                                    const origin = text(
                                        testimonial.location,
                                        text(testimonial.city, 'Indonesia'),
                                    );

                                    return (
                                        <article
                                            key={`testimonial-${index}`}
                                            className={`rounded-[16px] p-7 ${
                                                index === 1
                                                    ? 'bg-[#8c0a16] text-white lg:-translate-y-6'
                                                    : 'border border-[#d1ad70] bg-[#fbf4e7]'
                                            }`}
                                        >
                                            <div className="flex gap-1 text-[#ff9200]">
                                                {Array.from({ length: 5 }).map(
                                                    (_, starIndex) => (
                                                        <Star
                                                            key={starIndex}
                                                            className="h-3.5 w-3.5 fill-current"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                            <p
                                                className={`mt-6 min-h-[150px] text-[14px] leading-[1.9] italic ${index === 1 ? 'text-white/78' : 'text-[#674d43]'}`}
                                            >
                                                “{text(testimonial.quote)}”
                                            </p>
                                            <div
                                                className={`mt-6 flex items-center gap-3 border-t pt-5 ${index === 1 ? 'border-white/15' : 'border-[#d8bd8d]'}`}
                                            >
                                                <span
                                                    className={`grid h-10 w-10 place-items-center rounded-full text-[11px] font-black ${index === 1 ? 'bg-[#ff9200] text-[#3d0508]' : 'bg-[#8c0a16] text-white'}`}
                                                >
                                                    {initials(name)}
                                                </span>
                                                <div>
                                                    <p className="text-[12px] font-black">
                                                        {name}
                                                    </p>
                                                    <p
                                                        className={`mt-0.5 text-[10px] ${index === 1 ? 'text-white/48' : 'text-[#84695f]'}`}
                                                    >
                                                        {origin}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                        </div>
                    </div>
                </section>

                <section
                    id="faq"
                    className="bg-[#3d0508] py-20 text-white lg:py-28"
                >
                    <div className="shell grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
                        <div>
                            <span className="text-[10px] font-black tracking-[.24em] text-[#ffb446] uppercase">
                                {copy.faqTitle}
                            </span>
                            <h2 className="display mt-4 text-[42px] leading-[1.02] font-black sm:text-[58px]">
                                {copy.faqHeading}
                                <span className="block text-[#ffb446] italic">
                                    {copy.faqHighlight}
                                </span>
                            </h2>
                            <p className="mt-5 max-w-[430px] text-[13px] leading-[1.8] text-white/55">
                                Temukan jawaban cepat sebelum melanjutkan
                                konsultasi dengan tim kami.
                            </p>
                        </div>
                        <div className="divide-y divide-white/12 border-y border-white/12">
                            {faqs.slice(0, 6).map((faq, index) => {
                                const isOpen = activeFaq === index;

                                return (
                                    <button
                                        key={`faq-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setActiveFaq(isOpen ? -1 : index)
                                        }
                                        className="w-full py-5 text-left"
                                    >
                                        <span className="flex items-center justify-between gap-5 text-[14px] font-black sm:text-[16px]">
                                            {localize(faq.question, 'id')}
                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-[#ffb446] transition ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </span>
                                        {isOpen ? (
                                            <span className="mt-4 block max-w-[720px] text-[13px] leading-[1.85] text-white/58">
                                                {localize(faq.answer, 'id')}
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[#8c0a16] py-20 text-white lg:py-28">
                    <div className="geometry absolute inset-0 opacity-20" />
                    <div className="absolute top-[-70px] right-[5%] h-[320px] w-[260px] text-white/8">
                        <ArchMark />
                    </div>
                    <div className="shell relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
                        <div>
                            <span className="text-[10px] font-black tracking-[.25em] text-[#ffc76a] uppercase">
                                {copy.ctaBadge}
                            </span>
                            <h2 className="display mt-4 max-w-[820px] text-[46px] leading-[.98] font-black sm:text-[68px]">
                                {copy.ctaTitle}
                            </h2>
                            <p className="mt-6 max-w-[620px] text-[14px] leading-[1.85] text-white/62">
                                {copy.ctaDescription}
                            </p>
                        </div>
                        <a
                            href={whatsappHref}
                            className="inline-flex min-h-16 items-center justify-center gap-3 rounded-[14px] bg-[#ff9200] px-8 text-[14px] font-black text-[#3d0508] shadow-[0_20px_44px_rgba(61,5,8,.24)] transition hover:-translate-y-1"
                        >
                            <MessageCircle className="h-5 w-5" />
                            {copy.ctaButton}
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    </div>
                </section>
            </main>

            <footer className="bg-[#240204] pt-14 pb-24 text-white lg:pb-8">
                <div className="shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#fbf4e7]">
                                <img
                                    src={brand.logoPath}
                                    alt={brand.name}
                                    className="h-8 w-auto object-contain"
                                />
                            </span>
                            <div>
                                <p className="display text-[19px] font-black">
                                    {brand.name}
                                </p>
                                <p className="text-[8px] font-black tracking-[.3em] text-[#ffb446] uppercase">
                                    {brand.subtitle}
                                </p>
                            </div>
                        </div>
                        <p className="mt-5 max-w-[390px] text-[12px] leading-[1.8] text-white/42">
                            Perjalanan ibadah yang terencana, transparan, dan
                            didampingi dengan sepenuh hati.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {socialAccounts.map((account) => {
                                const platform = account.platform.toLowerCase();
                                const Icon = platform.includes('instagram')
                                    ? Instagram
                                    : platform.includes('tiktok')
                                      ? Music2
                                      : MessageCircle;

                                return (
                                    <a
                                        key={account.url}
                                        href={account.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={account.label}
                                        className="grid h-9 w-9 place-items-center rounded-[12px] border border-white/10 text-white/55 transition hover:border-[#ff9200] hover:text-[#ff9200]"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black tracking-[.18em] text-white/35 uppercase">
                            Jelajahi
                        </p>
                        <div className="mt-5 grid gap-3">
                            {NAVIGATION.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-[12px] text-white/48 transition hover:text-[#ffb446]"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black tracking-[.18em] text-white/35 uppercase">
                            Halaman
                        </p>
                        <div className="mt-5 grid gap-3">
                            <Link
                                href="/landing"
                                className="text-[12px] text-white/48 transition hover:text-[#ffb446]"
                            >
                                Landing Promo
                            </Link>
                            <Link
                                href="/paket-umroh"
                                className="text-[12px] text-white/48 transition hover:text-[#ffb446]"
                            >
                                Semua Paket
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="shell mt-10 border-t border-white/8 py-5 text-[10px] text-white/28">
                    © {new Date().getFullYear()} {brand.name}. Semua hak
                    dilindungi.
                </div>
            </footer>

            <div className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-[16px] bg-[#fbf4e7] p-2.5 shadow-[0_18px_60px_rgba(61,5,8,.22)] lg:hidden">
                <div className="min-w-0 flex-1 px-2">
                    <p className="text-[9px] font-black tracking-[.12em] text-[#80645a] uppercase">
                        Mulai dari
                    </p>
                    <p className="display truncate text-[18px] font-black text-[#8c0a16]">
                        {formatPrice(offer.primaryPrice, 'id', offer.currency)}
                    </p>
                </div>
                <a
                    href={whatsappHref}
                    className="inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-[#22c55e] px-5 text-[12px] font-black text-white"
                >
                    <MessageCircle className="h-4 w-4" />
                    Chat Admin
                </a>
            </div>
        </div>
    );
}
