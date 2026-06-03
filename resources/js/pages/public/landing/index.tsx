import GlobalFaviconHead from '@/components/global-favicon-head';
import PublicSeoHead from '@/components/public/seo-head';
import {
    formatPrice,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Building2,
    CalendarDays,
    Camera,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    FileCheck2,
    Globe,
    HandHeart,
    Handshake,
    Headset,
    Hotel,
    IdCard,
    Images,
    Landmark,
    Luggage,
    MapPin,
    MessageCircle,
    NotebookPen,
    Plane,
    ShieldCheck,
    Star,
    Ticket,
    Users,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

type CmsRecord = Record<string, unknown>;

function normalizeBrokenUtf8(value: string): string {
    const hasMojibakeMarkers = (input: string): boolean =>
        /(Ã.|â.|ðŸ|Â|\uFFFD)/.test(input);

    let current = value;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (!hasMojibakeMarkers(current)) {
            return current;
        }

        try {
            const bytes = Uint8Array.from(current, (character) => {
                return character.charCodeAt(0) & 0xff;
            });
            const decoded = new TextDecoder('utf-8').decode(bytes);
            if (decoded.trim().length === 0 || decoded === current) {
                return current;
            }
            current = decoded;
        } catch {
            return current;
        }
    }

    return current;
}

function text(value: unknown, fallback = ''): string {
    return normalizeBrokenUtf8(String(value ?? fallback)).trim();
}

function normalizeRatingStatValue(value: string): string {
    const numeric = value.match(/[\d.,]+/)?.[0]?.replace(',', '.') ?? '';
    if (!numeric) {
        return '4.9★';
    }
    return `${numeric}★`;
}

function initials(value: string): string {
    return value
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .slice(0, 2)
        .join('');
}

function packageFeatures(item: CmsRecord): string[] {
    const fromHighlights = Array.isArray(item.highlights)
        ? (item.highlights as unknown[])
              .map((entry) => text(entry))
              .filter(Boolean)
        : [];

    if (fromHighlights.length > 0) {
        return fromHighlights.slice(0, 6);
    }

    return [
        `${text(item.duration_days, '-') || '-'} Hari`,
        text(item.airline, 'Maskapai menyesuaikan'),
        text(item.hotel_summary, 'Hotel sesuai paket'),
        'Visa Umrah',
        'Pembimbing Ibadah',
    ];
}

function resolveServiceIcon(raw: unknown, index: number): string {
    const normalized = text(raw).toLowerCase();
    const iconBySlug: Record<string, string> = {
        hotel: '🏨',
        plane: '✈️',
        flight: '✈️',
        camera: '📸',
        image: '📸',
        users: '👥',
        handshake: '🤝',
        legal: '📋',
        shield: '🛡️',
    };
    if (iconBySlug[normalized]) {
        return iconBySlug[normalized];
    }
    const fallbackByIndex = ['🏨', '✈️', '📸', '📋'];
    return fallbackByIndex[index] ?? '•';
}

function serviceIconTone(raw: unknown, index: number): {
    iconClassName: string;
    badgeClassName: string;
} {
    const normalized = text(raw).toLowerCase();
    const toneMap: Record<
        string,
        { iconClassName: string; badgeClassName: string }
    > = {
        hotel: {
            iconClassName: 'text-amber-300',
            badgeClassName: 'bg-amber-500/18 ring-1 ring-amber-400/24',
        },
        plane: {
            iconClassName: 'text-sky-300',
            badgeClassName: 'bg-sky-500/16 ring-1 ring-sky-400/24',
        },
        flight: {
            iconClassName: 'text-sky-300',
            badgeClassName: 'bg-sky-500/16 ring-1 ring-sky-400/24',
        },
        camera: {
            iconClassName: 'text-rose-300',
            badgeClassName: 'bg-rose-500/16 ring-1 ring-rose-400/24',
        },
        image: {
            iconClassName: 'text-rose-300',
            badgeClassName: 'bg-rose-500/16 ring-1 ring-rose-400/24',
        },
        images: {
            iconClassName: 'text-rose-300',
            badgeClassName: 'bg-rose-500/16 ring-1 ring-rose-400/24',
        },
        users: {
            iconClassName: 'text-fuchsia-300',
            badgeClassName: 'bg-fuchsia-500/16 ring-1 ring-fuchsia-400/24',
        },
        handshake: {
            iconClassName: 'text-orange-300',
            badgeClassName: 'bg-orange-500/16 ring-1 ring-orange-400/24',
        },
        'heart-handshake': {
            iconClassName: 'text-orange-300',
            badgeClassName: 'bg-orange-500/16 ring-1 ring-orange-400/24',
        },
        legal: {
            iconClassName: 'text-emerald-300',
            badgeClassName: 'bg-emerald-500/16 ring-1 ring-emerald-400/24',
        },
        shield: {
            iconClassName: 'text-emerald-300',
            badgeClassName: 'bg-emerald-500/16 ring-1 ring-emerald-400/24',
        },
        'shield-check': {
            iconClassName: 'text-emerald-300',
            badgeClassName: 'bg-emerald-500/16 ring-1 ring-emerald-400/24',
        },
        'credit-card': {
            iconClassName: 'text-cyan-300',
            badgeClassName: 'bg-cyan-500/16 ring-1 ring-cyan-400/24',
        },
        'check-circle-2': {
            iconClassName: 'text-lime-300',
            badgeClassName: 'bg-lime-500/16 ring-1 ring-lime-400/24',
        },
        landmark: {
            iconClassName: 'text-violet-300',
            badgeClassName: 'bg-violet-500/16 ring-1 ring-violet-400/24',
        },
        'calendar-days': {
            iconClassName: 'text-blue-300',
            badgeClassName: 'bg-blue-500/16 ring-1 ring-blue-400/24',
        },
        'map-pin': {
            iconClassName: 'text-red-300',
            badgeClassName: 'bg-red-500/16 ring-1 ring-red-400/24',
        },
        briefcase: {
            iconClassName: 'text-stone-300',
            badgeClassName: 'bg-stone-500/16 ring-1 ring-stone-400/24',
        },
        'building-2': {
            iconClassName: 'text-yellow-200',
            badgeClassName: 'bg-yellow-500/16 ring-1 ring-yellow-400/24',
        },
        'circle-dollar-sign': {
            iconClassName: 'text-green-300',
            badgeClassName: 'bg-green-500/16 ring-1 ring-green-400/24',
        },
        'clipboard-list': {
            iconClassName: 'text-pink-300',
            badgeClassName: 'bg-pink-500/16 ring-1 ring-pink-400/24',
        },
        'file-check-2': {
            iconClassName: 'text-teal-300',
            badgeClassName: 'bg-teal-500/16 ring-1 ring-teal-400/24',
        },
        globe: {
            iconClassName: 'text-indigo-300',
            badgeClassName: 'bg-indigo-500/16 ring-1 ring-indigo-400/24',
        },
        headset: {
            iconClassName: 'text-cyan-300',
            badgeClassName: 'bg-cyan-500/16 ring-1 ring-cyan-400/24',
        },
        'id-card': {
            iconClassName: 'text-slate-300',
            badgeClassName: 'bg-slate-500/16 ring-1 ring-slate-400/24',
        },
        luggage: {
            iconClassName: 'text-amber-200',
            badgeClassName: 'bg-amber-500/16 ring-1 ring-amber-400/24',
        },
        'message-circle': {
            iconClassName: 'text-green-300',
            badgeClassName: 'bg-green-500/16 ring-1 ring-green-400/24',
        },
        'notebook-pen': {
            iconClassName: 'text-orange-200',
            badgeClassName: 'bg-orange-500/16 ring-1 ring-orange-400/24',
        },
        star: {
            iconClassName: 'text-yellow-300',
            badgeClassName: 'bg-yellow-500/16 ring-1 ring-yellow-400/24',
        },
        ticket: {
            iconClassName: 'text-rose-300',
            badgeClassName: 'bg-rose-500/16 ring-1 ring-rose-400/24',
        },
    };

    if (toneMap[normalized]) {
        return toneMap[normalized];
    }

    const fallbackByIndex = [
        {
            iconClassName: 'text-amber-300',
            badgeClassName: 'bg-amber-500/18 ring-1 ring-amber-400/24',
        },
        {
            iconClassName: 'text-sky-300',
            badgeClassName: 'bg-sky-500/16 ring-1 ring-sky-400/24',
        },
        {
            iconClassName: 'text-rose-300',
            badgeClassName: 'bg-rose-500/16 ring-1 ring-rose-400/24',
        },
        {
            iconClassName: 'text-emerald-300',
            badgeClassName: 'bg-emerald-500/16 ring-1 ring-emerald-400/24',
        },
    ];

    return (
        fallbackByIndex[index] ?? {
            iconClassName: 'text-amber-300',
            badgeClassName: 'bg-amber-500/18 ring-1 ring-amber-400/24',
        }
    );
}

function renderServiceIcon(raw: unknown, index: number): ReactElement {
    const normalized = text(raw).toLowerCase();
    const { iconClassName } = serviceIconTone(raw, index);
    const iconMap: Record<string, ReactElement> = {
        hotel: <Hotel className={`h-5 w-5 ${iconClassName}`} />,
        plane: <Plane className={`h-5 w-5 ${iconClassName}`} />,
        flight: <Plane className={`h-5 w-5 ${iconClassName}`} />,
        camera: <Camera className={`h-5 w-5 ${iconClassName}`} />,
        image: <Camera className={`h-5 w-5 ${iconClassName}`} />,
        images: <Images className={`h-5 w-5 ${iconClassName}`} />,
        users: <Users className={`h-5 w-5 ${iconClassName}`} />,
        handshake: <Handshake className={`h-5 w-5 ${iconClassName}`} />,
        'heart-handshake': (
            <Handshake className={`h-5 w-5 ${iconClassName}`} />
        ),
        legal: <ShieldCheck className={`h-5 w-5 ${iconClassName}`} />,
        shield: <ShieldCheck className={`h-5 w-5 ${iconClassName}`} />,
        'shield-check': (
            <ShieldCheck className={`h-5 w-5 ${iconClassName}`} />
        ),
        'credit-card': <CreditCard className={`h-5 w-5 ${iconClassName}`} />,
        'check-circle-2': (
            <CheckCircle2 className={`h-5 w-5 ${iconClassName}`} />
        ),
        landmark: <Landmark className={`h-5 w-5 ${iconClassName}`} />,
        'calendar-days': (
            <CalendarDays className={`h-5 w-5 ${iconClassName}`} />
        ),
        'map-pin': <MapPin className={`h-5 w-5 ${iconClassName}`} />,
        briefcase: <Briefcase className={`h-5 w-5 ${iconClassName}`} />,
        'building-2': <Building2 className={`h-5 w-5 ${iconClassName}`} />,
        'circle-dollar-sign': (
            <CircleDollarSign className={`h-5 w-5 ${iconClassName}`} />
        ),
        'clipboard-list': (
            <ClipboardList className={`h-5 w-5 ${iconClassName}`} />
        ),
        'file-check-2': (
            <FileCheck2 className={`h-5 w-5 ${iconClassName}`} />
        ),
        globe: <Globe className={`h-5 w-5 ${iconClassName}`} />,
        headset: <Headset className={`h-5 w-5 ${iconClassName}`} />,
        'id-card': <IdCard className={`h-5 w-5 ${iconClassName}`} />,
        luggage: <Luggage className={`h-5 w-5 ${iconClassName}`} />,
        'message-circle': (
            <MessageCircle className={`h-5 w-5 ${iconClassName}`} />
        ),
        'notebook-pen': (
            <NotebookPen className={`h-5 w-5 ${iconClassName}`} />
        ),
        star: <Star className={`h-5 w-5 ${iconClassName}`} />,
        ticket: <Ticket className={`h-5 w-5 ${iconClassName}`} />,
    };

    if (iconMap[normalized]) {
        return iconMap[normalized];
    }

    const byIndex = [
        <Hotel key="hotel" className={`h-5 w-5 ${iconClassName}`} />,
        <Plane key="plane" className={`h-5 w-5 ${iconClassName}`} />,
        <Camera key="camera" className={`h-5 w-5 ${iconClassName}`} />,
        <ClipboardList
            key="clipboard"
            className={`h-5 w-5 ${iconClassName}`}
        />,
    ];

    return (
        byIndex[index] ?? (
            <ShieldCheck className={`h-5 w-5 ${iconClassName}`} />
        )
    );
}

function packageBadgeIcon(index: number): ReactElement {
    if (index === 0) {
        return <Camera className="h-7 w-7 text-[#d7a246]" />;
    }
    return <Users className="h-7 w-7 text-white" />;
}

function highlightWord(value: string, word: string): ReactElement | string {
    if (!value.includes(word)) {
        return value;
    }

    const [before, ...rest] = value.split(word);
    const after = rest.join(word);

    return (
        <>
            {before}
            <em className="text-[#c80012] not-italic">{word}</em>
            {after}
        </>
    );
}

const stagger = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.06,
        },
    },
};

const punchIn = {
    hidden: { opacity: 0, y: 108, scale: 0.82, rotate: -5 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 235,
            damping: 15,
            mass: 0.68,
        },
    },
};

const sectionRise = {
    hidden: { opacity: 0, y: 148, scale: 0.86 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 175,
            damping: 16,
            mass: 0.76,
        },
    },
};

const sectionSplit = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.11,
            delayChildren: 0.08,
        },
    },
};

const sectionLead = {
    hidden: { opacity: 0, y: 88, scale: 0.88 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 210,
            damping: 15,
            mass: 0.7,
        },
    },
};

export default function PublicLandingPage() {
    const page = usePage<SharedData>();
    const publicData = usePublicData() as CmsRecord;
    const homePage = usePublicPageContent('home_landing_mockup');
    const content = (homePage?.content as CmsRecord) ?? {};
    const seo = page.props?.seoSettings ?? {};
    const branding = page.props?.branding;
    const publicBranding = page.props?.publicBranding;

    const hero = (content.hero as CmsRecord) ?? {};
    const servicesSection = (content.services as CmsRecord) ?? {};
    const packagesSection = (content.packages as CmsRecord) ?? {};
    const testimonialsSection = (content.testimonials as CmsRecord) ?? {};
    const faqSection = (content.faq as CmsRecord) ?? {};
    const contactSection = (content.contact as CmsRecord) ?? {};
    const footerSection = (content.footer as CmsRecord) ?? {};

    const services = Array.isArray(servicesSection.items)
        ? (servicesSection.items as CmsRecord[])
        : [];
    const heroFeatureCards = Array.isArray(hero.feature_cards)
        ? (hero.feature_cards as CmsRecord[])
        : services.slice(0, 3);
    const stats = Array.isArray(content?.stats)
        ? (content.stats as CmsRecord[])
        : [];
    const packages = Array.isArray(publicData?.packages)
        ? (publicData.packages as CmsRecord[])
        : [];
    const testimonials = Array.isArray(publicData?.testimonials)
        ? (publicData.testimonials as CmsRecord[])
        : [];
    const faqs = Array.isArray(publicData?.faqs)
        ? (publicData.faqs as CmsRecord[])
        : [];

    const [activeFaq, setActiveFaq] = useState<number | null>(0);
    const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
    const [testimonialStart, setTestimonialStart] = useState(0);

    const whatsappHref = whatsappLinkFromSeo(seo);
    const resolvedLogoPath =
        publicBranding?.logo_path ?? branding?.logo_path ?? '/logo.svg';
    const resolvedLogoWhitePath = branding?.logo_white_path ?? resolvedLogoPath;
    const companyName = branding?.company_name ?? 'Asfar Tour';
    const companySubtitle = branding?.company_subtitle ?? 'Hajj & Umrah';
    const hasStoredPackageSelection = Array.isArray(
        packagesSection.selected_package_ids,
    );
    const selectedPackageIds = hasStoredPackageSelection
        ? (packagesSection.selected_package_ids as Array<string | number>)
              .map((value) => Number(value))
              .filter((value) => Number.isFinite(value))
        : [];
    const selectedPackageSet = new Set<number>(selectedPackageIds);
    const selectedPackages = hasStoredPackageSelection
        ? packages.filter((pkg) =>
              selectedPackageSet.has(Number((pkg.id as number) ?? 0)),
          )
        : packages;
    const packageCards = selectedPackages.slice(0, 3);
    const packageLayoutClass =
        packageCards.length === 1
            ? 'justify-center'
            : 'justify-start';
    const testimonialCards =
        testimonials.length <= 3
            ? testimonials
            : Array.from({ length: 3 }, (_, offset) => {
                  return testimonials[
                      (testimonialStart + offset) % testimonials.length
                  ];
              });
    const heroTitleLines = useMemo(
        () =>
            text(hero.title, 'Perjalanan Menuju\nTanah Suci\nImpian Anda')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
        [hero.title],
    );
    const strokeLine =
        heroTitleLines.length >= 5
            ? heroTitleLines[4]
            : heroTitleLines.length >= 4
              ? heroTitleLines[3]
              : '';
    const primaryLines =
        heroTitleLines.length >= 4
            ? heroTitleLines.slice(0, heroTitleLines.length >= 5 ? 4 : 3)
            : heroTitleLines;

    useEffect(() => {
        const onScroll = () => {
            setIsNavbarScrolled(window.scrollY > 60);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (testimonials.length <= 3) {
            setTestimonialStart(0);
        } else if (testimonialStart >= testimonials.length) {
            setTestimonialStart(0);
        }
    }, [testimonialStart, testimonials.length]);

    return (
        <>
            <GlobalFaviconHead />
            <PublicSeoHead />
            <Head title={`${companyName} | Landing`} />

            <style>{`
                html{scroll-behavior:smooth}
                body{line-height:1.7;overflow-x:hidden;font-family:'Inter',sans-serif}
                .font-display{font-family:'Playfair Display',serif}
                .hero-pattern{background-image:url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z' fill='none' stroke='%23ffd700' stroke-width='0.8'/%3E%3Cpath d='M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z' fill='none' stroke='%23ffd700' stroke-width='0.5'/%3E%3C/svg%3E")}
                .hex-pattern{background-image:url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z' fill='none' stroke='%23ffd700' stroke-width='1'/%3E%3C/svg%3E")}
                .loop-float{will-change:transform}
                .loop-float-soft{will-change:transform}
                .stroke-title{-webkit-text-stroke:1px rgba(255,255,255,.4);color:transparent}
                .hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to bottom,transparent,#0f0505);z-index:2;pointer-events:none}
                .why-bg::after{content:'';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#0f0505,#fdf6ec);z-index:2;pointer-events:none}
                .pkg-bg::after{content:'';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#fdf6ec,#0f0505);z-index:2;pointer-events:none}
                .testi-bg::after{content:'';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#0f0505,#fff);z-index:2;pointer-events:none}
                .faq-bg::after{content:'';position:absolute;bottom:0;left:0;right:0;height:100px;background:linear-gradient(to bottom,#fff,#0f0505);z-index:2;pointer-events:none}
            `}</style>

            <div id="landing-top" />
            <nav
                className={`fixed inset-x-0 top-0 z-[100] flex h-[72px] items-center justify-between px-5 transition-all duration-300 sm:px-12 ${
                    isNavbarScrolled
                        ? 'bg-white/95 shadow-[0_1px_40px_rgba(0,0,0,.08)]'
                        : 'bg-transparent'
                }`}
            >
                <a href="#landing-top" className="flex items-center gap-3">
                    <img
                        src={
                            isNavbarScrolled
                                ? resolvedLogoPath
                                : resolvedLogoWhitePath
                        }
                        alt={companyName}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    />
                    <div>
                        <div
                            className={`font-display text-xl leading-none font-bold tracking-[1px] transition-colors duration-300 ${
                                isNavbarScrolled
                                    ? 'text-[#8c0a16]'
                                    : 'text-white'
                            }`}
                        >
                            {text(footerSection.brand, companyName)}
                        </div>
                        <div
                            className={`text-[9px] font-semibold tracking-[3px] uppercase transition-colors duration-300 ${
                                isNavbarScrolled
                                    ? 'text-[#ff9200]'
                                    : 'text-[#ffc578]'
                            }`}
                        >
                            {text(footerSection.subtitle, companySubtitle)}
                        </div>
                    </div>
                </a>
                <div className="flex items-center gap-8">
                    <a
                        href="#keunggulan"
                        className={`hidden text-[13px] font-medium tracking-[.5px] transition sm:inline ${
                            isNavbarScrolled
                                ? 'text-[#555] hover:text-[#c80012]'
                                : 'text-white/80 hover:text-[#ffc578]'
                        }`}
                    >
                        Keunggulan
                    </a>
                    <a
                        href="#paket"
                        className={`hidden text-[13px] font-medium tracking-[.5px] transition sm:inline ${
                            isNavbarScrolled
                                ? 'text-[#555] hover:text-[#c80012]'
                                : 'text-white/80 hover:text-[#ffc578]'
                        }`}
                    >
                        Paket
                    </a>
                    <a
                        href="#testimoni"
                        className={`hidden text-[13px] font-medium tracking-[.5px] transition sm:inline ${
                            isNavbarScrolled
                                ? 'text-[#555] hover:text-[#c80012]'
                                : 'text-white/80 hover:text-[#ffc578]'
                        }`}
                    >
                        Testimoni
                    </a>
                    <a
                        href="#faq"
                        className={`hidden text-[13px] font-medium tracking-[.5px] transition sm:inline ${
                            isNavbarScrolled
                                ? 'text-[#555] hover:text-[#c80012]'
                                : 'text-white/80 hover:text-[#ffc578]'
                        }`}
                    >
                        FAQ
                    </a>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-[#ff9200] px-[26px] py-[11px] text-[13px] font-bold tracking-[.3px] text-white shadow-[0_4px_20px_rgba(255,146,0,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,146,0,.45)]"
                    >
                        {text(
                            contactSection.navbar_whatsapp_label,
                            'Chat Admin',
                        )}
                    </a>
                </div>
            </nav>

            <section className="hero relative flex min-h-screen items-center overflow-hidden bg-[#0f0505]">
                <div className="absolute inset-0 bg-[linear-gradient(125deg,#0f0505_0%,#2a0608_40%,#8c0a16_100%)]" />
                <div className="hero-pattern absolute inset-0 z-[1] bg-[length:80px] bg-repeat opacity-[.06]" />
                <div className="absolute -top-20 right-0 z-[1] h-[700px] w-[700px] bg-[radial-gradient(circle,rgba(200,0,18,.25)_0%,transparent_65%)]" />
                <div className="absolute -bottom-[100px] -left-[50px] z-[1] h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(255,146,0,.12)_0%,transparent_65%)]" />

                <div className="relative z-[2] mx-auto grid w-full max-w-[1140px] grid-cols-1 items-center gap-[60px] px-6 pt-[110px] pb-[60px] md:grid-cols-[1fr_420px] md:px-12 md:pt-[130px] md:pb-20">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={punchIn}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 14,
                        }}
                    >
                        <div className="mb-7 inline-flex items-center gap-2.5">
                            <div className="h-px w-8 bg-[#ff9200]" />
                            <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                                {text(hero.label, 'Hajj & Umrah Terpercaya')}
                            </div>
                        </div>
                        <h1 className="font-display mb-7 text-[clamp(36px,5vw,64px)] leading-[1.03] font-extrabold text-white">
                            {primaryLines.map((line, index) => (
                                <span
                                    key={`${line}-${index}`}
                                    className={`block ${index >= 2 ? 'text-[#ff9200]' : 'text-white'}`}
                                >
                                    {line}
                                </span>
                            ))}
                            {strokeLine ? (
                                <span className="stroke-title block">
                                    {strokeLine}
                                </span>
                            ) : null}
                        </h1>
                        <p className="mb-10 max-w-[500px] text-[17px] leading-[1.75] text-white/70">
                            {text(hero.description)}
                        </p>
                        <div className="mb-[60px] flex flex-col gap-3.5 sm:flex-row sm:items-center">
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#ff9200,#e07f00)] px-[34px] py-[15px] text-[15px] font-bold tracking-[.3px] text-white shadow-[0_8px_32px_rgba(255,146,0,0.4)] transition hover:-translate-y-0.5"
                            >
                                <MessageCircle className="h-4 w-4" />
                                {text(hero.cta_label, 'Konsultasi Gratis')}
                            </a>
                            <a
                                href="#paket"
                                className="rounded-full border border-white/20 px-[30px] py-[15px] text-[15px] font-medium tracking-[.3px] text-white/85 transition hover:border-white/40 hover:bg-white/10"
                            >
                                {text(
                                    hero.secondary_cta_label,
                                    'Lihat Paket ->',
                                )}
                            </a>
                        </div>
                        <motion.div
                            className="grid border-t border-white/10 pt-8 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-6 sm:gap-x-8"
                            variants={stagger}
                        >
                            {stats.map((item, index) =>
                                (() => {
                                    const statLabel = text(item.label);
                                    const isRatingStat = statLabel
                                        .toLowerCase()
                                        .includes('rating');
                                    const statValue = isRatingStat
                                        ? normalizeRatingStatValue(
                                              text(item.value),
                                          )
                                        : text(item.value);

                                    return (
                                        <motion.div
                                            key={`stat-${index}`}
                                            className={`min-w-0 ${index < stats.length - 1 ? 'sm:border-r sm:border-white/10 sm:pr-8' : ''}`}
                                            variants={punchIn}
                                            whileHover={{ y: -10, scale: 1.04 }}
                                        >
                                            <div className="font-display text-[32px] leading-none font-bold text-white">
                                                {statValue}
                                            </div>
                                            <div className="mt-1.5 text-xs tracking-[.5px] text-white/45">
                                                {statLabel}
                                            </div>
                                        </motion.div>
                                    );
                                })(),
                            )}
                        </motion.div>
                    </motion.div>

                    <div className="hidden flex-col gap-3.5 md:flex">
                        {heroFeatureCards.slice(0, 3).map((item, index) => (
                            <motion.div
                                key={`hero-svc-${index}`}
                                className="loop-float-soft rounded-[20px] border border-white/10 bg-white/[.04] p-[22px] transition hover:-translate-x-2 hover:-translate-y-1.5 hover:border-[#ffc578]/20 hover:bg-white/[.07]"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: false, amount: 0.35 }}
                                transition={{
                                    duration: 0.45,
                                    delay: index * 0.07,
                                }}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8c0a16,#c80012)] text-xl">
                                        {renderServiceIcon(item.icon, index)}
                                    </div>
                                    <div>
                                        <div className="mb-0.5 text-sm font-semibold text-white">
                                            {text(item.title)}
                                        </div>
                                        <div className="text-xs text-white/45">
                                            {text(item.description)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                id="keunggulan"
                className="why-bg relative bg-[#0f0505] px-5 py-[72px] sm:px-12 sm:py-[100px]"
            >
                <motion.div
                    className="loop-float-soft mx-auto max-w-[1100px]"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.16 }}
                    variants={sectionRise}
                >
                    <motion.div
                        className="loop-float-soft mb-16"
                        variants={sectionLead}
                    >
                        <div className="mb-4 inline-flex items-center gap-2.5">
                            <div className="h-px w-6 bg-[#ff9200]" />
                            <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                                {text(
                                    servicesSection.title,
                                    'Mengapa Asfar Tour',
                                )}
                            </div>
                        </div>
                        <h2 className="font-display mb-4 text-[clamp(28px,4vw,46px)] leading-[1.2] font-bold text-white">
                            {(() => {
                                const headingTop = text(
                                    servicesSection.heading_top,
                                );
                                const headingHighlight = text(
                                    servicesSection.heading_highlight,
                                    text(
                                        servicesSection.highlight_word,
                                        'Bermakna',
                                    ),
                                );
                                const headingBottom = text(
                                    servicesSection.heading_bottom,
                                );

                                if (headingTop || headingBottom) {
                                    return (
                                        <>
                                            <span className="block">
                                                {headingTop || 'Ibadah Lebih'}{' '}
                                                <span className="text-[#c80012]">
                                                    {headingHighlight}
                                                </span>
                                            </span>
                                            <span className="block">
                                                {headingBottom ||
                                                    'Bersama Kami'}
                                            </span>
                                        </>
                                    );
                                }

                                return String(
                                    text(
                                        servicesSection.heading,
                                        'Ibadah Lebih Bermakna\nBersama Kami',
                                    ),
                                )
                                    .split('\n')
                                    .map((line, index) => (
                                        <span
                                            key={`services-heading-${index}`}
                                            className="block"
                                        >
                                            {highlightWord(
                                                line,
                                                headingHighlight,
                                            )}
                                        </span>
                                    ));
                            })()}
                        </h2>
                        <p className="max-w-[520px] text-base leading-[1.8] text-white/45">
                            {text(servicesSection.description)}
                        </p>
                    </motion.div>
                    <motion.div
                        className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-px overflow-hidden rounded-3xl border border-white/[.06] bg-white/[.06]"
                        variants={stagger}
                    >
                        {services.map((item, index) => (
                            <motion.div
                                key={`svc-${index}`}
                                className="loop-float group relative overflow-hidden bg-[#0f0505] px-8 py-10 transition hover:bg-[#1a0808]"
                                variants={punchIn}
                                whileHover={{ y: -12, scale: 1.03 }}
                            >
                                <div className="absolute top-5 right-6 font-serif text-5xl leading-none font-bold text-white/[.04]">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <span
                                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-[32px] ${serviceIconTone(item.icon, index).badgeClassName}`}
                                >
                                    {renderServiceIcon(item.icon, index)}
                                </span>
                                <h3 className="mb-2.5 text-base font-semibold tracking-[.3px] text-white">
                                    {text(item.title)}
                                </h3>
                                <p className="text-[13px] leading-[1.75] text-white/40">
                                    {text(item.description)}
                                </p>
                                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[linear-gradient(90deg,#c80012,#ff9200)] transition duration-300 group-hover:scale-x-100" />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            <section
                id="paket"
                className="pkg-bg relative bg-[#fdf6ec] px-5 py-[72px] sm:px-12 sm:py-[100px]"
            >
                <motion.div
                    className="loop-float-soft mx-auto max-w-[1100px]"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.16 }}
                    variants={sectionRise}
                >
                    <motion.div
                        className="loop-float-soft mb-16 text-center"
                        variants={sectionLead}
                    >
                        <div className="mb-4 inline-flex items-center justify-center gap-2.5">
                            <div className="h-px w-6 bg-[#ff9200]" />
                            <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                                {text(packagesSection.title, 'Pilihan Paket')}
                            </div>
                            <div className="h-px w-6 bg-[#ff9200]" />
                        </div>
                        <h2 className="font-display mb-4 text-[clamp(28px,4vw,46px)] leading-[1.2] font-bold text-[#0f0505]">
                            {highlightWord(
                                text(
                                    packagesSection.heading,
                                    'Paket Umrah Kami',
                                ),
                                'Umrah',
                            )}
                        </h2>
                        <p className="mx-auto max-w-[520px] text-base leading-[1.8] text-[#888]">
                            {text(packagesSection.description)}
                        </p>
                    </motion.div>
                    <motion.div
                        className={`mx-auto flex w-full max-w-[1100px] flex-wrap gap-4 sm:gap-6 ${packageLayoutClass}`}
                        variants={stagger}
                    >
                        {packageCards.map((pkg, index) => (
                            <motion.div
                                key={`pkg-${index}`}
                                className={`loop-float relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white transition duration-300 hover:-translate-y-1.5 md:flex-[0_1_calc(50%-12px)] lg:flex-[0_1_calc((100%-48px)/3)] ${
                                    index === 1
                                        ? 'border-[1.5px] border-[#ff9200] shadow-[0_12px_40px_rgba(255,146,0,.12)]'
                                        : 'border border-[#ede0d0]'
                                }`}
                                variants={punchIn}
                                whileHover={{ y: -14, scale: 1.035 }}
                            >
                                {pkg.original_price ? (
                                    <>
                                        <div className="absolute top-0 right-0 z-[1] h-24 w-24 overflow-hidden">
                                            <div className="absolute top-4 right-[-30px] w-[132px] rotate-45 bg-[linear-gradient(135deg,#ffb11a,#ff9200)] py-1.5 text-center text-[10px] font-black tracking-[1.4px] text-white uppercase shadow-[0_10px_22px_rgba(255,146,0,.28)]">
                                                {text(
                                                    pkg.discount_label,
                                                    pkg.discount_percent
                                                        ? `Hemat ${text(pkg.discount_percent)}%`
                                                        : text(
                                                              packagesSection.discount_badge_label,
                                                              'Promo',
                                                          ),
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 z-[1] h-2 w-2 rounded-full bg-white/70" />
                                    </>
                                ) : null}
                                <div className="border-b border-[#f5ece0] px-5 pt-7 pb-6 sm:px-8 sm:pt-9 sm:pb-7">
                                    <div
                                        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                                            index === 1
                                                ? 'bg-[linear-gradient(135deg,#8c0a16,#c80012)]'
                                                : 'bg-[linear-gradient(135deg,#fff5e6,#f6e7c6)]'
                                        }`}
                                    >
                                        {packageBadgeIcon(index)}
                                    </div>
                                    <span className="mb-5 block text-[11px] font-semibold tracking-[2px] text-[#ff9200] uppercase">
                                        {text(pkg.package_type, 'Reguler')}
                                    </span>
                                    <h3 className="font-display mb-1.5 text-[22px] font-bold text-[#0f0505]">
                                        {text(pkg.name)}
                                    </h3>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-display text-[34px] font-bold text-[#8c0a16]">
                                            {formatPrice(
                                                (pkg.price as
                                                    | string
                                                    | number
                                                    | null
                                                    | undefined) ?? null,
                                                'id',
                                                text(pkg.currency, 'IDR'),
                                            )}
                                        </span>
                                    </div>
                                    {pkg.original_price ? (
                                        <div className="mt-2 text-sm text-[#9f8c7a] line-through">
                                            {formatPrice(
                                                (pkg.original_price as
                                                    | string
                                                    | number
                                                    | null
                                                    | undefined) ?? null,
                                                'id',
                                                text(pkg.currency, 'IDR'),
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="px-5 py-6 sm:px-8 sm:py-7">
                                    <ul className="mb-7">
                                        {packageFeatures(pkg).map(
                                            (feature, featureIndex) => (
                                                <li
                                                    key={`pkg-${index}-f-${featureIndex}`}
                                                    className={`flex items-center gap-3 py-2.5 text-sm text-[#555] ${featureIndex < packageFeatures(pkg).length - 1 ? 'border-b border-[#f8f0e8]' : ''}`}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 text-[#c80012]" />
                                                    {feature}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={`/paket-umroh/${text(pkg.slug)}`}
                                        className={`block w-full rounded-[14px] p-[15px] text-center text-sm font-bold tracking-[.3px] transition ${
                                            index === 1
                                                ? 'bg-[linear-gradient(135deg,#8c0a16,#c80012)] text-white'
                                                : 'bg-[#f6e7c6] text-[#8c0a16] hover:bg-[#c80012] hover:text-white'
                                        }`}
                                    >
                                        {text(
                                            packagesSection.detail_label,
                                            'Tanya Paket Ini →',
                                        )}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    <div className="mt-8 text-center">
                        <Link
                            href="/paket-umroh"
                            className="loop-float inline-flex rounded-full border border-[#8c0a16]/30 px-5 py-2.5 text-sm font-semibold text-[#8c0a16] transition hover:border-[#8c0a16] hover:bg-[#8c0a16] hover:text-white"
                        >
                            {text(
                                packagesSection.more_packages_label,
                                'Lihat Paket Lainnya',
                            )}
                        </Link>
                    </div>
                </motion.div>
            </section>

            <section
                id="testimoni"
                className="testi-bg relative bg-[#0f0505] px-5 py-[72px] sm:px-12 sm:py-[100px]"
            >
                <motion.div
                    className="loop-float-soft mx-auto max-w-[1100px]"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.16 }}
                    variants={sectionRise}
                >
                    <motion.div
                        className="loop-float-soft mb-16 text-center"
                        variants={sectionLead}
                    >
                        <div className="mb-4 inline-flex items-center justify-center gap-2.5">
                            <div className="h-px w-6 bg-[#ff9200]" />
                            <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                                {text(
                                    testimonialsSection.title,
                                    'Testimoni Jamaah',
                                )}
                            </div>
                            <div className="h-px w-6 bg-[#ff9200]" />
                        </div>
                        <h2 className="font-display mb-4 text-[clamp(28px,4vw,46px)] leading-[1.2] font-bold text-white">
                            {highlightWord(
                                text(
                                    testimonialsSection.heading,
                                    'Mereka Sudah Merasakan',
                                ),
                                'Merasakan',
                            )}
                        </h2>
                        {testimonials.length > 3 ? (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    className="loop-float-soft rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-[#ff9200] hover:text-[#ff9200]"
                                    onClick={() =>
                                        setTestimonialStart((current) =>
                                            current === 0
                                                ? testimonials.length - 1
                                                : current - 1,
                                        )
                                    }
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    type="button"
                                    className="loop-float-soft rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-[#ff9200] hover:text-[#ff9200]"
                                    onClick={() =>
                                        setTestimonialStart(
                                            (current) =>
                                                (current + 1) %
                                                testimonials.length,
                                        )
                                    }
                                >
                                    Berikutnya
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                    <motion.div
                        className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-5"
                        variants={stagger}
                    >
                        {testimonialCards.map((item, index) => (
                            <motion.div
                                key={`testi-${index}`}
                                className="loop-float-soft rounded-[20px] border border-white/[.07] bg-white/[.03] p-8"
                                variants={punchIn}
                                whileHover={{ y: -12, scale: 1.03 }}
                            >
                                <div className="mb-4 text-[13px] tracking-[2px] text-[#ff9200]">
                                    ★★★★★
                                </div>
                                <p className="mb-6 text-sm leading-[1.85] text-white/60">
                                    {text(item.quote)}
                                </p>
                                <div className="mb-5 h-px bg-white/[.07]" />
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8c0a16,#c80012)] font-serif text-[13px] font-bold text-white">
                                        {initials(text(item.name))}
                                    </div>
                                    <div>
                                        <div className="mb-0.5 text-sm font-semibold text-white">
                                            {text(item.name)}
                                        </div>
                                        <div className="text-[11px] tracking-[.5px] text-white/35">
                                            {text(item.origin_city)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            <section
                id="faq"
                className="faq-bg relative bg-white px-5 py-[72px] sm:px-12 sm:py-[100px]"
            >
                <motion.div
                    className="loop-float-soft mx-auto max-w-[1100px]"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.16 }}
                    variants={sectionRise}
                >
                    <motion.div
                        className="loop-float-soft mb-16"
                        variants={sectionLead}
                    >
                        <div className="mb-4 inline-flex items-center gap-2.5">
                            <div className="h-px w-6 bg-[#ff9200]" />
                            <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                                {text(faqSection.label, 'FAQ')}
                            </div>
                        </div>
                        <h2 className="font-display mb-4 text-[clamp(28px,4vw,46px)] leading-[1.2] font-bold text-[#0f0505]">
                            {highlightWord(
                                text(
                                    faqSection.title,
                                    'Pertanyaan yang Sering Ditanyakan',
                                ),
                                'Sering Ditanyakan',
                            )}
                        </h2>
                        <p className="max-w-[520px] text-base leading-[1.8] text-[#888]">
                            {text(faqSection.description)}
                        </p>
                    </motion.div>
                    <motion.div
                        className="loop-float-soft mx-auto max-w-[720px]"
                        variants={sectionSplit}
                    >
                        {faqs.slice(0, 5).map((faq, index) => {
                            const isOpen = activeFaq === index;
                            return (
                                <motion.div
                                    key={`faq-${index}`}
                                    className="loop-float-soft overflow-hidden border-b border-[#f0e4d8]"
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.4 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.04,
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-5 py-6 text-left text-[15px] font-medium text-[#0f0505] transition hover:text-[#c80012]"
                                        onClick={() =>
                                            setActiveFaq(isOpen ? null : index)
                                        }
                                    >
                                        {text(faq.question)}
                                        <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] text-lg font-light transition ${
                                                isOpen
                                                    ? 'rotate-45 border-[#c80012] bg-[#c80012] text-white'
                                                    : 'border-[#e0d0c8] text-[#c80012]'
                                            }`}
                                        >
                                            +
                                        </span>
                                    </button>
                                    {isOpen ? (
                                        <div className="pb-6 text-sm leading-[1.85] text-[#888]">
                                            {text(faq.answer)}
                                        </div>
                                    ) : null}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </section>

            <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f0505_0%,#8c0a16_50%,#6b0010_100%)] px-5 py-[120px] text-center sm:px-12">
                <div className="hex-pattern absolute inset-0 bg-[length:80px] bg-repeat opacity-[.05]" />
                <motion.div
                    className="loop-float-soft relative z-[1] mx-auto max-w-[600px]"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.22 }}
                    variants={sectionRise}
                >
                    <div className="mb-6 inline-flex items-center justify-center gap-2.5">
                        <div className="h-px w-6 bg-[#ff9200]" />
                        <div className="text-[11px] font-bold tracking-[3px] text-[#ff9200] uppercase">
                            {text(
                                contactSection.banner_kicker,
                                'Mulai Perjalanan Anda',
                            )}
                        </div>
                        <div className="h-px w-6 bg-[#ff9200]" />
                    </div>
                    <h2 className="font-display mb-4 text-[clamp(28px,5vw,48px)] leading-[1.2] font-bold text-white">
                        {text(
                            contactSection.banner_title,
                            'Siap Melangkah ke Tanah Suci?',
                        )}
                    </h2>
                    <p className="mb-11 text-base leading-[1.8] text-white/60">
                        {text(contactSection.description)}
                    </p>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="loop-float inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#ff9200,#d97700)] px-12 py-[18px] text-base font-bold tracking-[.3px] text-white shadow-[0_8px_32px_rgba(255,146,0,0.4)]"
                    >
                        <MessageCircle className="h-5 w-5" />
                        {text(
                            contactSection.whatsapp_label,
                            'Chat Admin WhatsApp Sekarang',
                        )}
                    </a>
                </motion.div>
            </section>

            <motion.footer
                className="flex flex-col items-center justify-between gap-4 bg-[#080202] px-5 py-7 text-center sm:flex-row sm:px-12 sm:py-9 sm:text-left"
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.45 }}
                variants={sectionSplit}
            >
                <motion.div
                    className="loop-float-soft flex items-center gap-3"
                    variants={sectionLead}
                >
                    <img
                        src={resolvedLogoWhitePath}
                        alt={companyName}
                        className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                    />
                    <div>
                        <div className="font-display text-lg font-bold text-white">
                            {text(footerSection.brand, companyName)}
                        </div>
                        <div className="text-[9px] tracking-[3px] text-[#ffc578] uppercase">
                            {text(footerSection.subtitle, companySubtitle)}
                        </div>
                    </div>
                </motion.div>
                <motion.p
                    className="loop-float-soft text-xs tracking-[.5px] text-[#ffc578]/30"
                    variants={sectionLead}
                >
                    {text(
                        footerSection.copyright,
                        '(c) 2025 Asfar Tour - Terdaftar Kemenag RI',
                    )}
                </motion.p>
            </motion.footer>
            <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat WhatsApp"
                className="loop-float fixed right-5 bottom-5 z-[120] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(37,211,102,.45)] transition hover:scale-105 hover:shadow-[0_14px_36px_rgba(37,211,102,.55)]"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                >
                    <path
                        fill="currentColor"
                        d="M20.52 3.48A11.84 11.84 0 0 0 12.06 0C5.5 0 .14 5.36.14 11.92c0 2.1.55 4.16 1.6 5.98L0 24l6.27-1.65a11.9 11.9 0 0 0 5.8 1.5h.01c6.56 0 11.92-5.36 11.92-11.92a11.83 11.83 0 0 0-3.48-8.45Zm-8.45 18.35h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.72.98.99-3.62-.24-.37a9.9 9.9 0 0 1-1.51-5.3C2.18 6.45 6.6 2.03 12.06 2.03c2.64 0 5.12 1.03 7 2.91a9.85 9.85 0 0 1 2.9 7c0 5.46-4.43 9.89-9.89 9.89Zm5.42-7.42c-.3-.15-1.75-.86-2.03-.95-.27-.1-.47-.15-.67.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.63.07-.3-.15-1.24-.45-2.37-1.45-.87-.77-1.47-1.73-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.48 1.69.61.71.23 1.35.2 1.86.12.56-.08 1.75-.71 2-1.4.25-.68.25-1.27.17-1.4-.07-.12-.27-.2-.57-.35Z"
                    />
                </svg>
            </a>
        </>
    );
}
