import PublicLayout from '@/layouts/PublicLayout';
import {
    formatPrice,
    getPublicAddress,
    getPublicEmail,
    getPublicPhoneNumber,
    hasPackageDiscount,
    localize,
    packageDiscountLabel,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    CreditCard,
    FileCheck2,
    Globe,
    Headset,
    HeartHandshake,
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
    Stars,
    Ticket,
    Users,
    Zap,
} from 'lucide-react';
import {
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type CSSProperties,
} from 'react';

type SectionBackgroundConfig = {
    type?: 'default' | 'color' | 'image';
    color?: string | null;
    image?: string | null;
    overlay_intensity?: 'soft' | 'medium' | 'strong' | null;
};

type SectionBackgroundTone = 'light' | 'dark';

function overlayIntensityMultiplier(
    background: SectionBackgroundConfig | null,
): number {
    const intensity = background?.overlay_intensity ?? 'medium';

    if (intensity === 'soft') {
        return 1;
    }

    if (intensity === 'strong') {
        return 1.85;
    }

    return 1.4;
}

function normalizeHexColor(value: string): string | null {
    const normalized = value.trim().replace('#', '');

    if (/^[0-9a-f]{3}$/i.test(normalized)) {
        return `#${normalized
            .split('')
            .map((part) => `${part}${part}`)
            .join('')
            .toLowerCase()}`;
    }

    if (/^[0-9a-f]{6}$/i.test(normalized)) {
        return `#${normalized.toLowerCase()}`;
    }

    return null;
}

function hexToRgb(value: string): [number, number, number] | null {
    const normalized = normalizeHexColor(value);

    if (!normalized) {
        return null;
    }

    const hex = normalized.slice(1);

    return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
    ];
}

function rgba(value: string, alpha: number): string {
    const rgb = hexToRgb(value);

    if (!rgb) {
        return `rgba(122, 13, 23, ${alpha})`;
    }

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function mixHexColors(color: string, mixWith: string, weight: number): string {
    const baseRgb = hexToRgb(color);
    const mixRgb = hexToRgb(mixWith);

    if (!baseRgb || !mixRgb) {
        return color;
    }

    const next = baseRgb.map((channel, index) => {
        return Math.round(channel + (mixRgb[index] - channel) * weight);
    });

    return `#${next.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function resolveAccentColor(
    background: SectionBackgroundConfig | null,
): string {
    const customColor = normalizeHexColor(String(background?.color ?? ''));

    return customColor ?? '#7a0d17';
}

function buildGradientBackgroundStyle(
    color: string,
    intensity: number,
    isDefault = false,
): CSSProperties {
    if (isDefault) {
        return {};
    }

    const lightMixWeight = isDefault
        ? 0.025 + intensity * 0.018
        : 0.22 + intensity * 0.06;
    const darkMixWeight = isDefault
        ? 0.05 + intensity * 0.024
        : 0.28 + intensity * 0.08;
    const lighterTone = mixHexColors(color, '#ffffff', lightMixWeight);
    const darkerTone = mixHexColors(color, '#09090b', darkMixWeight);

    return {
        backgroundColor: color,
        backgroundImage: [
            `radial-gradient(circle at bottom right, ${rgba(lighterTone, (isDefault ? 0.2 : 0.26) + intensity * (isDefault ? 0.06 : 0.08))} 0%, transparent 42%)`,
            `radial-gradient(circle at 82% 78%, ${rgba(color, (isDefault ? 0.16 : 0.14) + intensity * (isDefault ? 0.06 : 0.06))} 0%, transparent 36%)`,
            `radial-gradient(circle at top left, ${rgba(darkerTone, (isDefault ? 0.16 : 0.18) + intensity * (isDefault ? 0.06 : 0.08))} 0%, transparent 48%)`,
            `linear-gradient(to top left, ${lighterTone} 0%, ${color} 48%, ${darkerTone} 100%)`,
        ].join(', '),
    };
}

function sectionStyleFromBackground(
    background: SectionBackgroundConfig | null,
): CSSProperties | undefined {
    const type = background?.type ?? 'default';
    const intensity = overlayIntensityMultiplier(background);
    const accentColor = normalizeHexColor(String(background?.color ?? ''));

    if (type === 'color') {
        if (!accentColor) {
            return undefined;
        }

        return buildGradientBackgroundStyle(accentColor, intensity);
    }

    if (type === 'image') {
        const image = String(background?.image ?? '').trim();
        if (!image) {
            return undefined;
        }

        return {
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }

    if (type === 'default' && accentColor) {
        return buildGradientBackgroundStyle(accentColor, intensity, true);
    }

    return undefined;
}

function sectionOverlayStyleFromBackground(
    background: SectionBackgroundConfig | null,
    tone: SectionBackgroundTone,
): CSSProperties {
    const accentColor = resolveAccentColor(background);
    const type = background?.type ?? 'default';
    const intensity = overlayIntensityMultiplier(background);

    if (type === 'image') {
        return tone === 'dark'
            ? {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(5, 6, 10, ${(0.56 * intensity).toFixed(3)}) 0%, rgba(5, 6, 10, ${(0.38 * intensity).toFixed(3)}) 42%, rgba(5, 6, 10, ${(0.7 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at top right, ${rgba(accentColor, 0.26 * intensity)} 0%, transparent 44%)`,
                      `radial-gradient(circle at bottom left, rgba(255, 255, 255, ${(0.08 * intensity).toFixed(3)}) 0%, transparent 38%)`,
                  ].join(', '),
              }
            : {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(255, 255, 255, ${(0.74 * intensity).toFixed(3)}) 0%, rgba(255, 255, 255, ${(0.5 * intensity).toFixed(3)}) 42%, rgba(255, 255, 255, ${(0.8 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at top right, ${rgba(accentColor, 0.18 * intensity)} 0%, transparent 40%)`,
                      `radial-gradient(circle at bottom left, rgba(255, 255, 255, ${(0.22 * intensity).toFixed(3)}) 0%, transparent 42%)`,
                  ].join(', '),
              };
    }

    if (type === 'color') {
        return tone === 'dark'
            ? {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(255, 255, 255, ${(0.05 * intensity).toFixed(3)}) 0%, rgba(0, 0, 0, ${(0.14 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at top right, rgba(255, 255, 255, ${(0.14 * intensity).toFixed(3)}) 0%, transparent 36%)`,
                      `radial-gradient(circle at bottom left, ${rgba(accentColor, 0.16 * intensity)} 0%, transparent 42%)`,
                  ].join(', '),
              }
            : {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(255, 255, 255, ${(0.12 * intensity).toFixed(3)}) 0%, rgba(255, 255, 255, ${(0.22 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at top right, rgba(255, 255, 255, ${(0.16 * intensity).toFixed(3)}) 0%, transparent 38%)`,
                      `radial-gradient(circle at bottom left, ${rgba(accentColor, 0.14 * intensity)} 0%, transparent 42%)`,
                  ].join(', '),
              };
    }

    if (type === 'default') {
        return tone === 'dark'
            ? {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(6, 8, 12, ${(0.08 * intensity).toFixed(3)}) 0%, rgba(6, 8, 12, ${(0.18 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at bottom right, ${rgba(accentColor, 0.18 * intensity)} 0%, transparent 44%)`,
                      `radial-gradient(circle at top left, rgba(255, 255, 255, ${(0.05 * intensity).toFixed(3)}) 0%, transparent 36%)`,
                  ].join(', '),
              }
            : {
                  backgroundImage: [
                      `linear-gradient(180deg, rgba(255, 255, 255, ${(0.02 * intensity).toFixed(3)}) 0%, rgba(255, 255, 255, ${(0.06 * intensity).toFixed(3)}) 100%)`,
                      `radial-gradient(circle at bottom right, ${rgba(accentColor, 0.12 * intensity)} 0%, transparent 42%)`,
                      `radial-gradient(circle at top left, rgba(255, 255, 255, ${(0.08 * intensity).toFixed(3)}) 0%, transparent 34%)`,
                  ].join(', '),
              };
    }

    return tone === 'dark'
        ? {
              backgroundImage: [
                  'linear-gradient(180deg, rgba(8, 8, 10, 0.24) 0%, rgba(8, 8, 10, 0.38) 100%)',
                  `radial-gradient(circle at top right, ${rgba(accentColor, 0.18)} 0%, transparent 42%)`,
                  'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.06) 0%, transparent 34%)',
              ].join(', '),
          }
        : {
              backgroundImage: [
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  `radial-gradient(circle at top right, ${rgba(accentColor, 0.14)} 0%, transparent 40%)`,
                  'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.16) 0%, transparent 36%)',
              ].join(', '),
          };
}

function sectionGlowStyleFromBackground(
    background: SectionBackgroundConfig | null,
    tone: SectionBackgroundTone,
): CSSProperties {
    const accentColor = resolveAccentColor(background);
    const intensity = overlayIntensityMultiplier(background);
    const type = background?.type ?? 'default';

    if (type === 'default') {
        return {
            backgroundImage: [
                `radial-gradient(circle at top left, ${rgba(accentColor, (tone === 'dark' ? 0.12 : 0.08) * intensity)} 0%, transparent 36%)`,
                `radial-gradient(circle at bottom right, ${rgba(accentColor, (tone === 'dark' ? 0.14 : 0.1) * intensity)} 0%, transparent 34%)`,
            ].join(', '),
        };
    }

    return {
        backgroundImage: [
            `radial-gradient(circle at top left, ${rgba(accentColor, (tone === 'dark' ? 0.2 : 0.14) * intensity)} 0%, transparent 34%)`,
            `radial-gradient(circle at bottom right, rgba(255, 255, 255, ${((tone === 'dark' ? 0.08 : 0.12) * intensity).toFixed(3)}) 0%, transparent 32%)`,
        ].join(', '),
    };
}

function sectionSurfaceClass(
    background: SectionBackgroundConfig | null,
    tone: SectionBackgroundTone,
    variant: 'panel' | 'card' = 'panel',
): string {
    if (tone === 'dark') {
        return variant === 'panel'
            ? 'bg-black/46 ring-1 ring-white/24 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl'
            : 'bg-white/90 ring-1 ring-white/40 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-lg';
    }

    return variant === 'panel'
        ? 'bg-white/58 ring-1 ring-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl'
        : 'bg-white/78 ring-1 ring-white/70 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-lg';
}

function SectionBackgroundLayer({
    background,
    tone,
    defaultImage,
    defaultImageClassName = 'h-full w-full object-cover',
    bottomFadeTo,
}: {
    background: SectionBackgroundConfig | null;
    tone: SectionBackgroundTone;
    defaultImage?: string | null;
    defaultImageClassName?: string;
    bottomFadeTo?: string;
}) {
    const type = background?.type ?? 'default';
    const image = String(background?.image ?? '').trim();
    const shouldRenderDefaultImage =
        type === 'default' && Boolean(defaultImage);
    const shouldRenderCustomImage = type === 'image' && image !== '';

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {shouldRenderDefaultImage ? (
                <img
                    src={String(defaultImage)}
                    alt=""
                    className={defaultImageClassName}
                />
            ) : null}
            {shouldRenderCustomImage ? (
                <img src={image} alt="" className={defaultImageClassName} />
            ) : null}
            <div
                className="absolute inset-0"
                style={sectionOverlayStyleFromBackground(background, tone)}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={sectionGlowStyleFromBackground(background, tone)}
            />
            {bottomFadeTo ? (
                <div
                    className="absolute inset-x-0 bottom-0 h-24"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, transparent, ${bottomFadeTo})`,
                    }}
                />
            ) : null}
        </div>
    );
}

type StepItem = {
    title: string;
    description: string;
    caption: string;
    icon: ComponentType<{ className?: string }>;
};

type CardItem = {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tone?: 'rose' | 'amber' | 'red' | 'orange';
};

const iconMap = {
    users: Users,
    'credit-card': CreditCard,
    'check-circle-2': CheckCircle2,
    plane: Plane,
    landmark: Landmark,
    'calendar-days': CalendarDays,
    'shield-check': ShieldCheck,
    'heart-handshake': HeartHandshake,
    'map-pin': MapPin,
    briefcase: Briefcase,
    'building-2': Building2,
    'circle-dollar-sign': CircleDollarSign,
    'clipboard-list': ClipboardList,
    'file-check-2': FileCheck2,
    globe: Globe,
    headset: Headset,
    hotel: Hotel,
    'id-card': IdCard,
    images: Images,
    luggage: Luggage,
    'message-circle': MessageCircle,
    'notebook-pen': NotebookPen,
    star: Stars,
    ticket: Ticket,
} as const;

const heroBackground = '/images/dummy.jpg';

function formatCompactPackagePrice(
    value: number | string | null | undefined,
    currency: string | null | undefined,
): string {
    return formatPrice(value ?? null, 'id', currency || 'IDR');
}

export default function PublicHomeLanding() {
    const page = usePage<any>();
    const forceWebsite = page.props.forceWebsite === true;
    const forceMockup = page.props.forceMockup === true;
    const pageSlug = forceMockup
        ? 'home_landing_mockup'
        : forceWebsite
          ? 'home_landing'
          : String(page.props.pageSlug ?? 'home_landing');
    const { branding, seoSettings } = page.props;
    const locale = 'id' as const;
    const shouldReduceMotion = useReducedMotion();
    const forceAnimations =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('animations') === '1';
    const animationsEnabled = forceAnimations || !shouldReduceMotion;
    const publicData = usePublicData();
    const homePage = usePublicPageContent(pageSlug);
    const homeContent = (homePage?.content as Record<string, any>) ?? {};
    const contactLink = whatsappLinkFromSeo(seoSettings ?? {});
    const address = getPublicAddress(seoSettings ?? {});
    const phone = getPublicPhoneNumber(seoSettings ?? {});
    const email = getPublicEmail(seoSettings ?? {});
    const articles = Array.isArray(publicData?.articles)
        ? (publicData.articles as Array<Record<string, any>>)
        : [];
    const packages = Array.isArray(publicData?.packages)
        ? (publicData.packages as Array<Record<string, any>>)
        : [];
    const services =
        Array.isArray(homeContent?.services?.items) &&
        homeContent.services.items.length > 0
            ? (homeContent.services.items as Array<Record<string, any>>)
            : Array.isArray(publicData?.services)
              ? (publicData.services as Array<Record<string, any>>)
              : [];
    const galleryItems = Array.isArray(publicData?.gallery)
        ? (publicData.gallery as Array<Record<string, any>>)
        : [];

    const hero = (homeContent.hero as Record<string, any>) ?? {};
    const heroLabel = String(hero.label ?? '');
    const heroTitle = String(hero.title ?? '');
    const heroDescription = String(hero.description ?? '');
    const heroImage = String(hero.image ?? heroBackground);
    const heroCtaLabel = String(hero.cta_label ?? '');
    const heroSecondaryCtaLabel = String(hero.secondary_cta_label ?? '');
    const heroSecondaryCtaHref = String(
        hero.secondary_cta_href ?? '/paket-umroh',
    );
    const packagesHeading = String(homeContent.packages?.heading ?? '');
    const packagesCtaLabel = String(homeContent.packages?.cta_label ?? '');
    const packagesDetailLabel = String(
        homeContent.packages?.detail_label ?? '',
    );
    const packagesDurationSuffix = String(
        homeContent.packages?.duration_suffix ?? '',
    );
    const packagesFallbackName = String(
        homeContent.packages?.fallback_name ?? '',
    );
    const packagesFallbackSummary = String(
        homeContent.packages?.fallback_summary ?? '',
    );
    const servicesTitle = String(homeContent.services?.title ?? '');
    const servicesFallbackTitlePrefix = String(
        homeContent.services?.fallback_title_prefix ?? '',
    );
    const servicesFallbackDescription = String(
        homeContent.services?.fallback_description ?? '',
    );
    const galleryTitle = String(homeContent.gallery?.title ?? '');
    const galleryDescription = String(homeContent.gallery?.description ?? '');
    const galleryCtaLabel = String(homeContent.gallery?.cta_label ?? '');
    const testimonialHeading = String(homeContent.testimonials?.heading ?? '');
    const testimonialsFallbackQuote = String(
        homeContent.testimonials?.fallback_quote ?? '',
    );
    const articlesHeading = String(homeContent.articles?.heading ?? '');
    const articlesCtaLabel = String(homeContent.articles?.cta_label ?? '');
    const articlesLabel = String(homeContent.articles?.label ?? '');
    const articlesReadMoreLabel = String(
        homeContent.articles?.read_more_label ?? '',
    );
    const articlesFallbackItemTitlePrefix = String(
        homeContent.articles?.fallback_item_title_prefix ?? '',
    );
    const articlesEmptyTitle = String(homeContent.articles?.empty_title ?? '');
    const articlesEmptyDescription = String(
        homeContent.articles?.empty_description ?? '',
    );

    const contact = (homeContent.contact as Record<string, any>) ?? {};
    const timeline = (homeContent.timeline as Record<string, any>) ?? {};
    const timelineLabel = String(timeline.label ?? '');
    const timelineHeading = String(timeline.heading ?? '');
    const contactBannerImage = String(contact.banner_image ?? heroBackground);
    const contactBannerKicker = String(contact.banner_kicker ?? '');
    const contactBannerTitle = String(contact.banner_title ?? '');
    const contactWhatsappLabel = String(contact.whatsapp_label ?? '');
    const contactSecondaryLabel = String(contact.secondary_label ?? '');
    const contactSecondaryHref = String(
        contact.secondary_href ?? '/paket-umroh',
    );
    const contactAddressLabel = String(contact.address_label ?? '');
    const contactInfoLabel = String(contact.contact_info_label ?? '');
    const contactOfficeHoursLabel = 'Jam Operasional';
    const contactOfficeHoursLines = [
        String(seoSettings?.contact?.operatingHours?.weekday ?? '').trim(),
        String(seoSettings?.contact?.operatingHours?.weekend ?? '').trim(),
    ].filter(Boolean);

    const cmsTimelineSteps = Array.isArray(homeContent.timeline?.steps)
        ? homeContent.timeline.steps
        : null;
    const timelineSteps: StepItem[] = cmsTimelineSteps
        ? cmsTimelineSteps
              .map((step: any, index: number) => ({
                  title: String(step?.title ?? ''),
                  caption: String(step?.caption ?? ''),
                  description: String(step?.description ?? ''),
                  icon:
                      iconMap[
                          String(step?.icon ?? '') as keyof typeof iconMap
                      ] ??
                      [
                          Users,
                          CreditCard,
                          CheckCircle2,
                          Plane,
                          Landmark,
                          CalendarDays,
                      ][index] ??
                      Users,
              }))
              .filter((step: StepItem) => step.title.trim() !== '')
        : [];

    const cmsValueCards = Array.isArray(homeContent.timeline?.value_cards)
        ? homeContent.timeline.value_cards
        : null;
    const timelineValueCards: CardItem[] = cmsValueCards
        ? cmsValueCards
              .map((card: any, index: number) => ({
                  title: String(card?.title ?? ''),
                  description: String(card?.description ?? ''),
                  icon:
                      iconMap[
                          String(card?.icon ?? '') as keyof typeof iconMap
                      ] ??
                      [ShieldCheck, CalendarDays, HeartHandshake, CheckCircle2][
                          index
                      ] ??
                      ShieldCheck,
                  tone: (['rose', 'amber', 'red', 'orange'][index] ??
                      'rose') as CardItem['tone'],
              }))
              .filter((card: CardItem) => card.title.trim() !== '')
        : [];

    const problem = (homeContent.problem as Record<string, any>) ?? {};
    const problemLabel = String(problem.label ?? '');
    const problemHeading = String(problem.heading ?? '');
    const problemBadges = Array.isArray(problem.badges)
        ? (problem.badges as string[])
              .map((badge) => String(badge))
              .filter(Boolean)
        : [];
    const problemQuote = String(problem.quote ?? '');

    const packageCards = packages.slice(0, 3);
    const galleryPreviewImages = galleryItems
        .map((item) => String(item?.image_path ?? ''))
        .filter(Boolean)
        .slice(0, 3);

    const testimonials = Array.isArray(publicData?.testimonials)
        ? (publicData.testimonials as Array<Record<string, any>>)
              .map((item) => ({
                  name: [item.name, item.origin_city]
                      .filter(Boolean)
                      .map((part) => String(part))
                      .join(', ')
                      .trim(),
                  quote: localize(item.quote, locale, ''),
                  rating: Number(item.rating ?? 5),
              }))
              .filter((item) => item.name !== '' && item.quote !== '')
        : [];

    const heroGlow = animationsEnabled
        ? { opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }
        : undefined;
    const heroGlowTransition = animationsEnabled
        ? { duration: 7.5, repeat: Infinity, ease: 'easeInOut' as const }
        : undefined;

    const inViewViewport = { once: false, amount: 0.18 };
    const punch = {
        type: 'spring' as const,
        stiffness: 420,
        damping: 34,
        mass: 0.75,
        bounce: 0.18,
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 64, scale: 0.94 },
        show: { opacity: 1, y: 0, scale: 1, transition: punch },
    };
    const fadeDown = {
        hidden: { opacity: 0, y: -64, scale: 0.94 },
        show: { opacity: 1, y: 0, scale: 1, transition: punch },
    };
    const fadeLeft = {
        hidden: { opacity: 0, x: -72, scale: 0.94, rotate: -4 },
        show: { opacity: 1, x: 0, scale: 1, rotate: 0, transition: punch },
    };
    const fadeRight = {
        hidden: { opacity: 0, x: 72, scale: 0.94, rotate: 4 },
        show: { opacity: 1, x: 0, scale: 1, rotate: 0, transition: punch },
    };
    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.09 } },
    };

    const getInViewProps = <T,>(variants: T) =>
        animationsEnabled
            ? ({
                  variants,
                  initial: 'hidden',
                  whileInView: 'show',
                  viewport: inViewViewport,
              } as const)
            : ({} as const);

    const testimonialsSliderRef = useRef<HTMLDivElement | null>(null);
    const [isTestimonialsPaused, setIsTestimonialsPaused] = useState(false);

    function scrollTestimonials(direction: 'prev' | 'next'): void {
        const slider = testimonialsSliderRef.current;
        if (!slider) {
            return;
        }

        const scrollAmount = Math.max(slider.clientWidth * 0.85, 280);
        slider.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth',
        });
    }

    useEffect(() => {
        if (
            !animationsEnabled ||
            isTestimonialsPaused ||
            testimonials.length <= 1
        ) {
            return;
        }

        const slider = testimonialsSliderRef.current;
        if (!slider) {
            return;
        }

        const interval = window.setInterval(() => {
            const activeSlider = testimonialsSliderRef.current;
            if (!activeSlider) {
                return;
            }

            const isAtEnd =
                activeSlider.scrollLeft + activeSlider.clientWidth >=
                activeSlider.scrollWidth - 12;

            if (isAtEnd) {
                activeSlider.scrollTo({ left: 0, behavior: 'smooth' });
                return;
            }

            const scrollAmount = Math.max(activeSlider.clientWidth * 0.85, 280);
            activeSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }, 4200);

        return () => window.clearInterval(interval);
    }, [animationsEnabled, isTestimonialsPaused, testimonials.length]);

    return (
        <PublicLayout>
            <Head title={String(branding?.company_name ?? heroTitle)} />

            <main className="min-h-screen">
                <section className="relative isolate overflow-hidden bg-[#fffaf3]">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_18%,rgba(203,153,67,0.20),transparent_28rem),radial-gradient(circle_at_92%_16%,rgba(100,19,46,0.14),transparent_30rem),linear-gradient(180deg,#fffdf8_0%,#fff8ee_100%)]" />
                    <motion.div
                        className="pointer-events-none absolute -top-24 left-[46%] -z-10 h-96 w-96 rounded-full bg-[#c99a43]/18 blur-3xl"
                        animate={heroGlow}
                        transition={heroGlowTransition}
                    />

                    <div
                        className="container mx-auto grid min-h-[780px] items-center gap-14 px-6 pb-16 lg:grid-cols-[0.92fr_1.08fr] lg:pb-24"
                        style={{
                            paddingTop:
                                'calc(var(--public-header-h, 88px) + 4.5rem)',
                        }}
                    >
                        <motion.div
                            className="max-w-[620px]"
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={inViewViewport}
                        >
                            <p className="inline-flex items-center gap-2 rounded-full border border-[#c99a43]/30 bg-white/75 px-4 py-2 text-[0.68rem] font-extrabold tracking-[0.24em] text-[#7a0d17] uppercase shadow-sm backdrop-blur">
                                <Stars className="h-4 w-4 text-[#c99a43]" />
                                {heroLabel}
                            </p>
                            <h1 className="font-heading mt-6 text-[2.85rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-[#64132e] sm:text-[4rem] lg:text-[4.75rem]">
                                {heroTitle}
                            </h1>
                            <p className="mt-7 max-w-[560px] text-base leading-8 text-[#6d5a61]">
                                {heroDescription}
                            </p>

                            <div className="mt-9 flex flex-wrap gap-3">
                                {contactLink ? (
                                    <motion.a
                                        href={contactLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4a0d21] to-[#7d1b3d] px-7 py-3.5 text-sm font-extrabold text-white shadow-[0_18px_40px_-18px_rgba(74,13,33,0.8)] transition hover:-translate-y-0.5"
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.98 }
                                        }
                                    >
                                        {heroCtaLabel}
                                        <ChevronRight className="h-4 w-4" />
                                    </motion.a>
                                ) : null}
                                <Link
                                    href={heroSecondaryCtaHref}
                                    className="inline-flex items-center justify-center rounded-full border border-[#d8bd91] bg-white/85 px-7 py-3.5 text-sm font-extrabold text-[#64132e] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                                >
                                    {heroSecondaryCtaLabel}
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative mx-auto w-full max-w-[660px]"
                            variants={fadeRight}
                            initial="hidden"
                            whileInView="show"
                            viewport={inViewViewport}
                        >
                            <div className="pointer-events-none absolute -top-8 right-8 h-[88%] w-[74%] rounded-t-[18rem] border border-[#c99a43]/35" />
                            <div className="relative ml-auto aspect-[0.94] w-[82%] overflow-hidden rounded-t-[15rem] rounded-b-[2.25rem] bg-[#eadcc6] shadow-[0_34px_90px_-28px_rgba(58,14,32,0.42)] ring-1 ring-[#7d1b3d]/10">
                                <img
                                    src={heroImage}
                                    alt={heroTitle}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#32101c]/45 via-transparent to-white/5" />
                            </div>

                            <div className="absolute top-[17%] left-0 rounded-2xl border border-white/70 bg-white/88 px-4 py-3 shadow-xl backdrop-blur-md">
                                <p className="text-[0.58rem] font-extrabold tracking-[0.18em] text-[#9a7b4c] uppercase">
                                    Paket tersedia
                                </p>
                                <p className="font-heading mt-1 text-lg font-extrabold text-[#64132e]">
                                    {packages.length} pilihan aktif
                                </p>
                            </div>

                            <div className="absolute right-1 bottom-[9%] flex items-center gap-3 rounded-2xl border border-white/65 bg-[#64132e]/90 px-4 py-3 text-white shadow-xl backdrop-blur-md">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2cd7a]/18 text-[#f2cd7a]">
                                    <Headset className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-[0.58rem] font-bold tracking-[0.16em] text-white/65 uppercase">
                                        Pendampingan
                                    </p>
                                    <p className="text-sm font-extrabold">
                                        Terarah & transparan
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-2 left-[2%] h-36 w-28 -rotate-3 overflow-hidden rounded-[1.6rem] border-[5px] border-[#fffaf3] bg-[#eadcc6] shadow-xl sm:h-44 sm:w-36">
                                <img
                                    src={galleryPreviewImages[0] ?? heroImage}
                                    alt="Dokumentasi perjalanan"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section
                    id="jadwal"
                    className="relative overflow-hidden bg-[#fffdf9] py-20 lg:py-28"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_12%,rgba(203,153,67,0.12),transparent_28rem),radial-gradient(circle_at_94%_88%,rgba(100,19,46,0.08),transparent_32rem)]" />

                    <div className="relative container mx-auto px-6">
                        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                            <motion.div {...getInViewProps(fadeLeft)}>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.24em] text-[#a27535] uppercase">
                                    Alur perjalanan
                                </p>
                                <h2 className="font-heading mt-4 text-[2.4rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.3rem]">
                                    {timelineLabel}
                                </h2>
                                <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#64132e] to-[#c99a43]" />
                                <p className="mt-6 max-w-[470px] text-sm leading-7 text-[#756269]">
                                    Setiap tahap dibuat jelas sejak awal,
                                    sehingga jamaah memahami persiapan, proses,
                                    dan pendampingan selama perjalanan.
                                </p>

                                <div className="relative mt-10 min-h-[420px] overflow-hidden rounded-[2.1rem] bg-[#eadcc6] shadow-[0_28px_76px_rgba(58,14,32,0.12)]">
                                    <img
                                        src={
                                            galleryPreviewImages[0] ?? heroImage
                                        }
                                        alt="Perjalanan jamaah"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#260712]/70 via-[#260712]/10 to-transparent" />
                                    <div className="absolute right-6 bottom-6 left-6 rounded-3xl border border-white/15 bg-[#3e0b1e]/45 p-6 text-white shadow-xl backdrop-blur-md">
                                        <p className="text-[0.62rem] font-extrabold tracking-[0.18em] text-[#f2cd7a] uppercase">
                                            {heroLabel}
                                        </p>
                                        <p className="font-heading mt-2 text-2xl leading-tight font-extrabold">
                                            Dari persiapan hingga pulang, satu
                                            alur yang terarah.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="relative"
                                {...getInViewProps(stagger)}
                            >
                                <div className="pointer-events-none absolute top-8 bottom-8 left-7 w-px bg-gradient-to-b from-transparent via-[#c99a43]/55 to-transparent" />
                                <div className="grid gap-4">
                                    {timelineSteps.map((item, index) => {
                                        const Icon = item.icon;
                                        const iconTones = [
                                            'bg-[#fff1cf] text-[#7a5520]',
                                            'bg-[#fbe7ed] text-[#64132e]',
                                            'bg-[#e8f4eb] text-[#347949]',
                                            'bg-[#e7f1f8] text-[#326d96]',
                                        ];

                                        return (
                                            <motion.article
                                                key={`${item.title}-${index}`}
                                                className="relative grid grid-cols-[3.5rem_1fr] gap-5 rounded-[1.65rem] border border-[#c99a43]/16 bg-white/90 p-5 shadow-[0_14px_36px_rgba(58,14,32,0.05)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(58,14,32,0.10)]"
                                                variants={fadeUp}
                                            >
                                                <div
                                                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${iconTones[index % iconTones.length]}`}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <p className="text-[0.62rem] font-extrabold tracking-[0.16em] text-[#9b7640] uppercase">
                                                            {item.caption}
                                                        </p>
                                                        <span className="font-heading text-xl font-extrabold text-[#64132e]/22">
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-heading mt-1 text-2xl font-extrabold text-[#64132e]">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-6 text-[#756269]">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </motion.article>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-24 grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                            <motion.div
                                className="relative min-h-[560px] overflow-hidden rounded-[2.1rem] bg-[#eadcc6] shadow-[0_28px_76px_rgba(58,14,32,0.14)]"
                                {...getInViewProps(fadeLeft)}
                            >
                                <img
                                    src={heroImage}
                                    alt={timelineHeading}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#260712]/70 via-transparent to-transparent" />
                                <div className="absolute right-6 bottom-6 left-6 rounded-3xl border border-white/15 bg-[#3e0b1e]/40 p-6 text-white backdrop-blur-md">
                                    <p className="text-[0.65rem] font-bold tracking-[0.18em] text-[#f2cd7a] uppercase">
                                        {heroLabel}
                                    </p>
                                    <p className="font-heading mt-2 text-2xl font-extrabold">
                                        Jelas prosesnya. Tenang perjalanannya.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div {...getInViewProps(fadeRight)}>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#a27535] uppercase">
                                    Tentang sistem kami
                                </p>
                                <h2 className="font-heading mt-4 text-[2.4rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.15rem]">
                                    {timelineHeading}
                                </h2>
                                <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#64132e] to-[#c99a43]" />
                                <div className="mt-9 grid gap-4">
                                    {timelineValueCards.map((item, index) => {
                                        const Icon = item.icon;

                                        return (
                                            <div
                                                key={`${item.title}-${index}`}
                                                className="flex gap-4 rounded-[1.4rem] border border-[#c99a43]/16 bg-white/90 p-5 shadow-[0_12px_30px_rgba(58,14,32,0.05)]"
                                            >
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#64132e]/8 text-[#64132e]">
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <h3 className="font-heading text-xl font-extrabold text-[#64132e]">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm leading-6 text-[#756269]">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-gradient-to-br from-[#220611] via-[#64132e] to-[#310915] py-20 text-white lg:py-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(214,169,91,0.18),transparent_28rem)]" />
                    <div className="relative container mx-auto grid gap-12 px-6 lg:grid-cols-2 lg:items-end">
                        <motion.div {...getInViewProps(fadeLeft)}>
                            <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#f2cd7a] uppercase">
                                {problemLabel}
                            </p>
                            <h2 className="font-heading mt-4 text-[2.4rem] leading-[1.07] font-extrabold tracking-[-0.03em] text-white sm:text-[3.35rem]">
                                {problemHeading}
                            </h2>
                        </motion.div>
                        <motion.div {...getInViewProps(fadeRight)}>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {problemBadges.map((text, index) => (
                                    <div
                                        key={`${text}-${index}`}
                                        className="rounded-[1.25rem] border border-white/12 bg-white/8 p-5 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-md"
                                    >
                                        {text}
                                    </div>
                                ))}
                            </div>
                            <blockquote className="font-heading mt-8 border-l-2 border-[#f2cd7a] pl-5 text-2xl leading-snug text-[#f9eed3]">
                                {problemQuote}
                            </blockquote>
                        </motion.div>
                    </div>
                </section>

                <section id="galeri" className="bg-[#fffaf3] py-20 lg:py-28">
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
                            {...getInViewProps(fadeUp)}
                        >
                            <div>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#a27535] uppercase">
                                    {galleryTitle}
                                </p>
                                <h2 className="font-heading mt-3 text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.35rem]">
                                    {galleryTitle}
                                </h2>
                                <p className="mt-3 text-sm text-[#77656c]">
                                    {galleryDescription}
                                </p>
                            </div>
                            <Link
                                href="/galeri"
                                className="inline-flex items-center gap-2 text-[0.68rem] font-extrabold tracking-[0.16em] text-[#a8742f] uppercase"
                            >
                                {galleryCtaLabel}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </motion.div>

                        <motion.div
                            className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
                            {...getInViewProps(stagger)}
                        >
                            {[0, 1, 2].map((imageIndex) => {
                                const galleryItem = galleryItems[imageIndex];
                                const image =
                                    galleryPreviewImages[imageIndex] ??
                                    heroImage;
                                const title = localize(
                                    galleryItem?.title,
                                    locale,
                                    `Dokumentasi ${imageIndex + 1}`,
                                );
                                const isPrimary = imageIndex === 0;

                                return (
                                    <motion.figure
                                        key={`${image}-${imageIndex}`}
                                        className={`group relative overflow-hidden bg-[#eadcc6] shadow-[0_24px_70px_rgba(58,14,32,0.12)] ${
                                            isPrimary
                                                ? 'min-h-[460px] rounded-[2rem] lg:row-span-2 lg:min-h-[590px]'
                                                : 'min-h-[270px] rounded-[1.9rem]'
                                        }`}
                                        variants={fadeUp}
                                        style={
                                            isPrimary
                                                ? { gridRow: 'span 2' }
                                                : undefined
                                        }
                                    >
                                        <img
                                            src={image}
                                            alt={title}
                                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#230815]/70 via-transparent to-transparent" />
                                        <figcaption className="absolute bottom-6 left-6 z-10 text-sm font-semibold text-white">
                                            {title}
                                        </figcaption>
                                    </motion.figure>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section className="relative overflow-hidden py-20 text-white lg:py-28">
                    <img
                        src={galleryPreviewImages[0] ?? heroImage}
                        alt={servicesTitle}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#220611]/96 via-[#64132e]/88 to-[#220611]/92" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(242,205,122,0.18),transparent_28rem)]" />

                    <div className="relative container mx-auto grid gap-10 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
                        <motion.div
                            className="rounded-[2rem] border border-white/12 bg-white/7 p-7 backdrop-blur-md sm:p-9"
                            {...getInViewProps(fadeLeft)}
                        >
                            <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#f2cd7a] uppercase">
                                {servicesTitle}
                            </p>
                            <h2 className="font-heading mt-4 text-[2.6rem] leading-tight font-extrabold tracking-[-0.03em] text-white sm:text-[3.4rem]">
                                {servicesTitle}
                            </h2>
                        </motion.div>

                        <motion.div
                            className="overflow-hidden rounded-[2rem] border border-white/12 bg-[#260711]/44 p-3 backdrop-blur-md"
                            {...getInViewProps(stagger)}
                        >
                            {services.slice(0, 4).map((item, index) => {
                                const title = String(
                                    item?.title ?? item?.name ?? '',
                                );
                                const description = String(
                                    item?.description ?? '',
                                );

                                return (
                                    <motion.div
                                        key={`${title}-${index}`}
                                        className="grid grid-cols-[3.5rem_1fr] gap-5 border-b border-white/10 p-5 last:border-b-0 sm:p-6"
                                        variants={fadeUp}
                                    >
                                        <span className="font-heading text-3xl font-extrabold text-[#f2cd7a]/55">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <p className="text-[0.62rem] font-extrabold tracking-[0.14em] text-[#f2cd7a] uppercase">
                                                {title ||
                                                    `${servicesFallbackTitlePrefix} ${index + 1}`}
                                            </p>
                                            <h3 className="font-heading mt-2 text-2xl font-extrabold text-white sm:text-[1.7rem]">
                                                {title ||
                                                    `${servicesFallbackTitlePrefix} ${index + 1}`}
                                            </h3>
                                            <p className="mt-2 text-sm leading-7 text-white/80">
                                                {description ||
                                                    servicesFallbackDescription}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section
                    id="paket"
                    className="relative overflow-hidden bg-[#fffaf3] py-20 lg:py-28"
                >
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                            {...getInViewProps(fadeUp)}
                        >
                            <div>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#a27535] uppercase">
                                    {packagesHeading}
                                </p>
                                <h2 className="font-heading mt-3 text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.35rem]">
                                    {packagesHeading}
                                </h2>
                            </div>
                            <div>
                                <Link
                                    href="/paket-umroh"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d8bd91] bg-white px-6 py-3 text-sm font-extrabold text-[#64132e] shadow-sm transition hover:-translate-y-0.5"
                                >
                                    {packagesCtaLabel}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>

                        <div className="mt-10 rounded-[2rem] border border-[#c99a43]/18 bg-white/75 p-5 shadow-[0_22px_60px_rgba(58,14,32,0.08)] sm:p-7">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <p className="text-[0.68rem] font-extrabold tracking-[0.16em] text-[#a8742f] uppercase">
                                    {packageCards.length} paket tersedia
                                </p>
                                <div className="h-px flex-1 bg-gradient-to-r from-[#c99a43]/30 to-transparent" />
                            </div>
                            <motion.div
                                className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                {...getInViewProps(stagger)}
                            >
                                {packageCards.map((pkg, index) => {
                                    const cardVariants =
                                        index % 3 === 0
                                            ? fadeLeft
                                            : index % 3 === 1
                                              ? fadeUp
                                              : fadeRight;
                                    const name = localize(
                                        pkg.name,
                                        locale,
                                        String(
                                            pkg.slug ?? packagesFallbackName,
                                        ),
                                    );
                                    const summary = localize(
                                        pkg.summary,
                                        locale,
                                        packagesFallbackSummary,
                                    );
                                    const firstSchedule =
                                        Array.isArray(pkg.schedules) &&
                                        pkg.schedules.length > 0
                                            ? pkg.schedules[0]
                                            : null;
                                    const departureDate = String(
                                        firstSchedule?.departure_date ?? '',
                                    );
                                    const departureCity = String(
                                        firstSchedule?.departure_city ??
                                            pkg.departure_city ??
                                            '',
                                    );
                                    const hotel = localize(
                                        pkg.content?.hotel,
                                        locale,
                                        '',
                                    );
                                    const airline = localize(
                                        pkg.content?.airline,
                                        locale,
                                        '',
                                    );
                                    const priceLabel =
                                        formatCompactPackagePrice(
                                            pkg.price,
                                            pkg.currency,
                                        );
                                    const hasDiscount = hasPackageDiscount(pkg);
                                    const discountLabel =
                                        packageDiscountLabel(pkg);
                                    const originalPriceLabel = hasDiscount
                                        ? formatCompactPackagePrice(
                                              pkg.original_price,
                                              pkg.currency,
                                          )
                                        : '';
                                    const ratingAvg = Number(
                                        pkg.rating_avg ?? 0,
                                    );
                                    const ratingCount = Number(
                                        pkg.rating_count ?? 0,
                                    );

                                    return (
                                        <motion.div
                                            key={String(pkg.slug ?? pkg.id)}
                                            className="group relative flex min-w-[18rem] snap-start flex-col overflow-hidden rounded-[1.7rem] border border-[#c99a43]/16 bg-white shadow-[0_18px_44px_rgba(58,14,32,0.08)] sm:min-w-[22rem] lg:min-w-[24rem]"
                                            variants={cardVariants}
                                        >
                                            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                                                {hasDiscount ? (
                                                    <div className="inline-flex items-center gap-1 rounded-full bg-rose-600/95 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm ring-1 ring-white/20">
                                                        <Zap className="h-3.5 w-3.5" />
                                                        {discountLabel}
                                                    </div>
                                                ) : null}

                                                {pkg.is_featured ? (
                                                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-extrabold text-amber-950 shadow-sm ring-1 ring-white/20">
                                                        <Stars className="h-3.5 w-3.5 fill-current" />
                                                        Featured
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={String(
                                                        pkg.image_path ??
                                                            '/images/dummy.jpg',
                                                    )}
                                                    alt={name}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                                                <div className="absolute right-4 bottom-4 left-4">
                                                    <p className="font-heading line-clamp-2 text-xl font-extrabold text-white">
                                                        {name}
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-white/85">
                                                        {pkg.duration_days
                                                            ? `${pkg.duration_days} ${packagesDurationSuffix}`.trim()
                                                            : ''}
                                                        {departureCity
                                                            ? ` • ${departureCity}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-1 flex-col gap-3 p-5">
                                                <div className="space-y-1.5">
                                                    {airline ? (
                                                        <div className="flex items-center gap-2 text-xs text-[#2a120c]/65">
                                                            <span className="w-4 text-center">
                                                                <Plane className="h-4 w-4 shrink-0 text-[#7a0d17]/80" />
                                                            </span>
                                                            <span className="line-clamp-1">
                                                                {airline}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {hotel ? (
                                                        <div className="flex items-center gap-2 text-xs text-[#2a120c]/65">
                                                            <span className="w-4 text-center">
                                                                <Building2 className="h-4 w-4 shrink-0 text-[#7a0d17]/80" />
                                                            </span>
                                                            <span className="line-clamp-1">
                                                                {hotel}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                    {departureDate ? (
                                                        <div className="flex items-center gap-2 text-xs text-[#2a120c]/65">
                                                            <span className="w-4 text-center">
                                                                <CalendarDays className="h-4 w-4 shrink-0 text-[#7a0d17]/80" />
                                                            </span>
                                                            <span className="line-clamp-1">
                                                                Berangkat{' '}
                                                                {departureDate}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="mt-auto border-t border-black/10 pt-3">
                                                    <div className="flex items-end justify-between gap-3">
                                                        <div>
                                                            <p className="text-lg font-extrabold text-[#64132e]">
                                                                {priceLabel}
                                                            </p>
                                                            {originalPriceLabel ? (
                                                                <p className="mt-0.5 text-xs font-semibold text-[#2a120c]/45 line-through">
                                                                    {
                                                                        originalPriceLabel
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                        <Link
                                                            href={`/paket-umroh/${String(
                                                                pkg.slug ?? '',
                                                            )}`}
                                                            className="rounded-full bg-gradient-to-r from-[#4a0d21] to-[#7d1b3d] px-4 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
                                                        >
                                                            {
                                                                packagesDetailLabel
                                                            }
                                                        </Link>
                                                    </div>
                                                    {ratingAvg > 0 ? (
                                                        <div className="mt-2 flex items-center gap-2 text-xs">
                                                            <div className="flex items-center">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (value) => (
                                                                        <Star
                                                                            key={
                                                                                value
                                                                            }
                                                                            className={`h-4 w-4 ${
                                                                                value <=
                                                                                Math.round(
                                                                                    ratingAvg,
                                                                                )
                                                                                    ? 'fill-amber-400 text-amber-400'
                                                                                    : 'text-[#2a120c]/20'
                                                                            }`}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-[#2a120c]">
                                                                {ratingAvg.toFixed(
                                                                    1,
                                                                )}
                                                            </span>
                                                            {ratingCount > 0 ? (
                                                                <span className="text-[#2a120c]/60">
                                                                    (
                                                                    {
                                                                        ratingCount
                                                                    }
                                                                    )
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#2a120c]/70">
                                                        {summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/paket-umroh"
                                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#64132e]"
                            >
                                {packagesCtaLabel}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[#f7ede1] py-20 lg:py-28">
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
                            {...getInViewProps(fadeUp)}
                        >
                            <div>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#a27535] uppercase">
                                    {testimonialHeading}
                                </p>
                                <h2 className="font-heading mt-4 text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.35rem]">
                                    {testimonialHeading}
                                </h2>
                                <div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#64132e] to-[#c99a43]" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => scrollTestimonials('prev')}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8bd91] bg-white text-[#64132e] shadow-sm transition hover:-translate-y-0.5"
                                    aria-label="Sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollTestimonials('next')}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8bd91] bg-white text-[#64132e] shadow-sm transition hover:-translate-y-0.5"
                                    aria-label="Berikutnya"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="relative mt-10">
                        <motion.div
                            ref={testimonialsSliderRef}
                            onMouseEnter={() => setIsTestimonialsPaused(true)}
                            onMouseLeave={() => setIsTestimonialsPaused(false)}
                            onFocusCapture={() => setIsTestimonialsPaused(true)}
                            onBlurCapture={() => setIsTestimonialsPaused(false)}
                            className="container mx-auto flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            {...getInViewProps(stagger)}
                        >
                            {testimonials.map((testimonial, index) => {
                                const initials = testimonial.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((part) => part.slice(0, 1))
                                    .join('')
                                    .toUpperCase();
                                const rating = Number.isFinite(
                                    testimonial.rating,
                                )
                                    ? Math.max(
                                          1,
                                          Math.min(5, testimonial.rating),
                                      )
                                    : 5;
                                const cardVariants =
                                    index % 3 === 0
                                        ? fadeLeft
                                        : index % 3 === 1
                                          ? fadeUp
                                          : fadeRight;

                                return (
                                    <motion.div
                                        key={`${testimonial.name}-${testimonial.quote}-${index}`}
                                        className="relative min-h-[300px] w-[290px] shrink-0 snap-start overflow-hidden rounded-[1.8rem] border border-[#c99a43]/18 bg-white p-7 shadow-[0_18px_48px_rgba(58,14,32,0.08)] sm:w-[360px]"
                                        variants={cardVariants}
                                    >
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f09c35]/18 to-transparent" />
                                        <div className="relative flex items-center justify-between gap-4">
                                            <span className="inline-flex items-center gap-1 text-[#c99a43]">
                                                {Array.from(
                                                    { length: 5 },
                                                    (_, index) => (
                                                        <Stars
                                                            key={index}
                                                            className={`h-4 w-4 ${
                                                                index < rating
                                                                    ? 'fill-current'
                                                                    : 'opacity-25'
                                                            }`}
                                                        />
                                                    ),
                                                )}
                                            </span>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e4ea] text-sm font-extrabold text-[#64132e]">
                                                {initials}
                                            </div>
                                        </div>
                                        <p className="font-heading relative mt-6 text-[1.55rem] leading-snug font-semibold text-[#64132e]">
                                            “
                                            {testimonial.quote ||
                                                testimonialsFallbackQuote}
                                            ”
                                        </p>
                                        <p className="relative mt-7 border-t border-[#ead8bb] pt-5 text-sm font-extrabold text-[#64132e]">
                                            {testimonial.name}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section
                    id="artikel"
                    className="relative bg-[#fffaf3] py-20 lg:py-28"
                >
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
                            {...getInViewProps(fadeLeft)}
                        >
                            <div>
                                <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#a27535] uppercase">
                                    {articlesLabel}
                                </p>
                                <h2 className="font-heading mt-3 text-[2.5rem] font-extrabold tracking-[-0.03em] text-[#64132e] sm:text-[3.35rem]">
                                    {articlesHeading}
                                </h2>
                            </div>
                            <Link
                                href="/artikel"
                                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#64132e]"
                            >
                                {articlesCtaLabel}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </motion.div>

                        {articles.length > 0 ? (
                            <motion.div
                                className="mt-10 grid gap-6 lg:grid-cols-12"
                                {...getInViewProps(stagger)}
                            >
                                {articles.slice(0, 3).map((article, index) => {
                                    const title = localize(
                                        article.title,
                                        locale,
                                        `${articlesFallbackItemTitlePrefix} ${index + 1}`.trim(),
                                    );
                                    const excerpt = localize(
                                        article.excerpt,
                                        locale,
                                        '',
                                    );
                                    const slug = String(article.slug ?? '');
                                    const href = slug
                                        ? `/artikel/${slug}`
                                        : '/artikel';
                                    const image = article.image_path
                                        ? String(article.image_path).startsWith(
                                              '/',
                                          )
                                            ? String(article.image_path)
                                            : `/storage/${article.image_path}`
                                        : '/images/dummy.jpg';
                                    const cardVariants =
                                        index % 4 === 0
                                            ? fadeLeft
                                            : index % 4 === 1
                                              ? fadeDown
                                              : index % 4 === 2
                                                ? fadeUp
                                                : fadeRight;

                                    return (
                                        <motion.article
                                            key={slug || index}
                                            className={`h-full ${
                                                index === 0
                                                    ? 'lg:col-span-7 lg:row-span-2'
                                                    : 'lg:col-span-5'
                                            }`}
                                            variants={cardVariants}
                                        >
                                            <Link
                                                href={href}
                                                className={`group h-full overflow-hidden rounded-[1.9rem] border border-[#c99a43]/16 bg-white shadow-[0_18px_48px_rgba(58,14,32,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_58px_rgba(58,14,32,0.12)] ${
                                                    index === 0
                                                        ? 'flex flex-col'
                                                        : 'grid sm:grid-cols-[0.9fr_1.1fr]'
                                                }`}
                                            >
                                                <div
                                                    className={`relative overflow-hidden bg-[#eadcc6] ${
                                                        index === 0
                                                            ? 'h-[22rem]'
                                                            : 'min-h-[13.5rem]'
                                                    }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col p-6 sm:p-7">
                                                    <h3
                                                        className={`font-heading line-clamp-2 font-extrabold text-[#64132e] ${
                                                            index === 0
                                                                ? 'text-[2rem]'
                                                                : 'text-2xl'
                                                        }`}
                                                    >
                                                        {title}
                                                    </h3>
                                                    {excerpt ? (
                                                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#756269]">
                                                            {excerpt}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-auto pt-5 text-xs font-extrabold tracking-[0.16em] text-[#64132e] uppercase">
                                                        {articlesReadMoreLabel}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.article>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5"
                                {...getInViewProps(fadeUp)}
                            >
                                <p className="font-heading text-lg font-extrabold text-[#2a120c]">
                                    {articlesEmptyTitle}
                                </p>
                                <p className="mt-2 text-sm text-[#2a120c]/70">
                                    {articlesEmptyDescription}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </section>

                <section className="relative min-h-[540px] overflow-hidden text-white">
                    <img
                        src={contactBannerImage}
                        alt={contactBannerTitle}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#220611]/96 via-[#64132e]/78 to-[#220611]/45" />
                    <div className="relative container mx-auto flex min-h-[540px] items-center px-6 py-20">
                        <motion.div
                            className="max-w-[800px]"
                            {...getInViewProps(fadeLeft)}
                        >
                            <p className="text-[0.68rem] font-extrabold tracking-[0.22em] text-[#f2cd7a] uppercase">
                                {contactBannerKicker}
                            </p>
                            <h2 className="font-heading mt-4 text-[2.7rem] leading-[1.03] font-extrabold tracking-[-0.035em] text-white sm:text-[3.8rem]">
                                {contactBannerTitle.replace(
                                    '{company_name}',
                                    String(branding?.company_name ?? ''),
                                )}
                            </h2>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {contactLink ? (
                                    <a
                                        href={contactLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#18a95d] to-[#2bc875] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"
                                    >
                                        {contactWhatsappLabel}
                                    </a>
                                ) : null}
                                <Link
                                    href={contactSecondaryHref}
                                    className="inline-flex items-center justify-center rounded-full bg-[#fff5db] px-6 py-3.5 text-sm font-extrabold text-[#64132e] transition hover:-translate-y-0.5"
                                >
                                    {contactSecondaryLabel}
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="kontak" className="bg-[#f7ede1] py-16">
                    <motion.div
                        className="container mx-auto grid gap-8 px-6 lg:grid-cols-[1.25fr_0.75fr_0.75fr]"
                        {...getInViewProps(stagger)}
                    >
                        <motion.div variants={fadeUp}>
                            <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-[#a27535] uppercase">
                                {contactAddressLabel}
                            </p>
                            <p className="mt-3 max-w-[620px] text-sm leading-7 text-[#756269]">
                                {localize(address, locale, '—')}
                            </p>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-[#a27535] uppercase">
                                {contactInfoLabel}
                            </p>
                            <div className="mt-3 grid gap-1 text-sm leading-7 text-[#756269]">
                                <p>{phone || '—'}</p>
                                {email ? (
                                    <a
                                        href={`mailto:${email}`}
                                        className="font-semibold text-[#64132e]"
                                    >
                                        {email}
                                    </a>
                                ) : null}
                            </div>
                        </motion.div>
                        <motion.div variants={fadeUp}>
                            <p className="text-[0.68rem] font-extrabold tracking-[0.2em] text-[#a27535] uppercase">
                                {contactOfficeHoursLabel}
                            </p>
                            <div className="mt-3 grid gap-1 text-sm leading-7 text-[#756269]">
                                {contactOfficeHoursLines.length > 0 ? (
                                    contactOfficeHoursLines.map(
                                        (line, index) => (
                                            <p key={`${line}-${index}`}>
                                                {line}
                                            </p>
                                        ),
                                    )
                                ) : (
                                    <p>—</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </section>
            </main>
        </PublicLayout>
    );
}
