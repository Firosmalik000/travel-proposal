import PublicLayout from '@/layouts/PublicLayout';
import {
    formatPrice,
    getPublicAddress,
    getPublicEmail,
    getPublicPhoneNumber,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    HeartHandshake,
    Images,
    Landmark,
    MapPin,
    Plane,
    ShieldCheck,
    Star,
    Stars,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType } from 'react';

type SectionBackgroundConfig = {
    type?: 'default' | 'color' | 'image';
    color?: string | null;
    image?: string | null;
};

function sectionStyleFromBackground(
    background: SectionBackgroundConfig | null,
): React.CSSProperties | undefined {
    const type = background?.type ?? 'default';

    if (type === 'color') {
        const color = String(background?.color ?? '').trim();
        if (!color) {
            return undefined;
        }

        return { backgroundColor: color };
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

    return undefined;
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
    images: Images,
    star: Stars,
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
    const { branding, seoSettings } = page.props;
    const locale = 'id' as const;
    const shouldReduceMotion = useReducedMotion();
    const forceAnimations =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('animations') === '1';
    const animationsEnabled = forceAnimations || !shouldReduceMotion;
    const publicData = usePublicData();
    const homePage = usePublicPageContent('home');
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
    const heroBackgroundConfig =
        (hero.background as SectionBackgroundConfig | null) ?? null;
    const heroBackgroundType = heroBackgroundConfig?.type ?? 'default';
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
    const servicesSection = (homeContent.services as Record<string, any>) ?? {};
    const gallerySection = (homeContent.gallery as Record<string, any>) ?? {};
    const testimonialsSection =
        (homeContent.testimonials as Record<string, any>) ?? {};
    const packagesSection = (homeContent.packages as Record<string, any>) ?? {};
    const articlesSection = (homeContent.articles as Record<string, any>) ?? {};
    const timelineBackground =
        (timeline.background as SectionBackgroundConfig | null) ?? null;
    const servicesBackground =
        (servicesSection.background as SectionBackgroundConfig | null) ?? null;
    const galleryBackground =
        (gallerySection.background as SectionBackgroundConfig | null) ?? null;
    const testimonialsBackground =
        (testimonialsSection.background as SectionBackgroundConfig | null) ??
        null;
    const packagesBackground =
        (packagesSection.background as SectionBackgroundConfig | null) ?? null;
    const articlesBackground =
        (articlesSection.background as SectionBackgroundConfig | null) ?? null;
    const contactBackground =
        (contact.background as SectionBackgroundConfig | null) ?? null;
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

    const floatSlow = animationsEnabled
        ? {
              y: [0, -10, 0],
              x: [0, 6, 0],
          }
        : undefined;
    const floatFast = animationsEnabled
        ? {
              y: [0, 12, 0],
              x: [0, -8, 0],
          }
        : undefined;
    const floatTransitionSlow = animationsEnabled
        ? { duration: 8, repeat: Infinity, ease: 'easeInOut' as const }
        : undefined;
    const floatTransitionFast = animationsEnabled
        ? { duration: 6, repeat: Infinity, ease: 'easeInOut' as const }
        : undefined;
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
    const fadeIn = {
        hidden: { opacity: 0, scale: 0.98 },
        show: { opacity: 1, scale: 1, transition: punch },
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
                <section className="relative isolate min-h-[100svh] overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        {heroBackgroundType === 'image' ? (
                            <img
                                src={String(
                                    heroBackgroundConfig?.image ?? heroImage,
                                )}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                        {heroBackgroundType === 'default' ? (
                            <img
                                src={heroImage}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                        {heroBackgroundType === 'color' ? (
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundColor: String(
                                        heroBackgroundConfig?.color ?? '#000',
                                    ),
                                }}
                            />
                        ) : null}
                        <motion.div
                            className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#e6a34a]/35 blur-3xl"
                            animate={heroGlow}
                            transition={heroGlowTransition}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/30" />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#fff7ef]" />
                    </div>

                    <div
                        className="container mx-auto flex px-6 pb-12 sm:pb-16 lg:pb-20"
                        style={{
                            paddingTop:
                                'calc(var(--public-header-h, 88px) + 2.5rem)',
                            minHeight:
                                'calc(100svh - var(--public-header-h, 88px))',
                            alignItems: 'center',
                        }}
                    >
                        <div className="grid items-center gap-10 lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                <motion.p
                                    className="text-xs font-bold tracking-[0.28em] text-white/80 uppercase"
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={inViewViewport}
                                >
                                    {heroLabel}
                                </motion.p>
                                <motion.h1
                                    className="font-heading mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={inViewViewport}
                                >
                                    {heroTitle
                                        .split('\n')
                                        .map((line, index) => (
                                            <span key={index}>
                                                {line}
                                                {index === 0 ? <br /> : null}
                                            </span>
                                        ))}
                                </motion.h1>
                                <motion.p
                                    className="mt-6 max-w-xl text-sm leading-relaxed text-white/82 sm:text-base"
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={inViewViewport}
                                >
                                    {heroDescription}
                                </motion.p>
                            </div>

                            <div className="flex items-center lg:col-span-5 lg:justify-end">
                                <div className="flex flex-wrap items-center gap-3">
                                    {contactLink ? (
                                        <motion.a
                                            href={contactLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-600"
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { scale: 1.03 }
                                            }
                                            whileTap={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { scale: 0.98 }
                                            }
                                        >
                                            {heroCtaLabel}
                                        </motion.a>
                                    ) : null}
                                    <motion.div
                                        whileHover={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 1.02 }
                                        }
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.98 }
                                        }
                                    >
                                        <Link
                                            href={heroSecondaryCtaHref}
                                            className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/10 px-7 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-white/15"
                                        >
                                            {heroSecondaryCtaLabel}
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="jadwal"
                    className="relative overflow-hidden bg-[#fff7ef] py-12 sm:py-16"
                    style={sectionStyleFromBackground(timelineBackground)}
                >
                    <div className="absolute inset-0">
                        {(timelineBackground?.type ?? 'default') ===
                        'default' ? (
                            <img
                                src={heroBackground}
                                alt=""
                                className="h-full w-full object-cover opacity-25"
                            />
                        ) : null}
                        {(timelineBackground?.type ?? 'default') ===
                        'default' ? (
                            <div className="absolute inset-0 bg-gradient-to-b from-white/72 via-white/88 to-white/94" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/55 to-white/75" />
                        )}
                    </div>

                    <div className="relative container mx-auto px-6">
                        <motion.div
                            className="text-center"
                            {...getInViewProps(fadeDown)}
                        >
                            <p className="text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                {timelineLabel}
                            </p>
                        </motion.div>

                        <motion.div
                            className="mt-8 rounded-[28px] bg-black/30 p-6 shadow-sm ring-1 ring-white/18 backdrop-blur sm:mt-10 sm:p-8"
                            {...getInViewProps(fadeIn)}
                        >
                            <div className="relative">
                                <div className="pointer-events-none absolute top-6 right-6 left-6 hidden h-0.5 rounded-full bg-white/22 sm:block" />
                                <motion.div
                                    className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:gap-5 sm:overflow-visible sm:pb-0"
                                    {...getInViewProps(stagger)}
                                >
                                    {timelineSteps.map((item, index) => {
                                        const Icon = item.icon;
                                        const stepVariants =
                                            index % 4 === 0
                                                ? fadeLeft
                                                : index % 4 === 1
                                                  ? fadeDown
                                                  : index % 4 === 2
                                                    ? fadeUp
                                                    : fadeRight;

                                        return (
                                            <motion.div
                                                key={item.title}
                                                className="min-w-[12rem] shrink-0 text-center sm:min-w-0 sm:shrink"
                                                variants={stepVariants}
                                            >
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7a0d17] text-white shadow-sm ring-1 ring-[#7a0d17]/25">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <p className="mt-3 text-[0.6rem] font-extrabold tracking-[0.22em] text-white/72 uppercase">
                                                    {item.caption}
                                                </p>
                                                <p className="font-heading mt-1 text-sm font-extrabold text-white">
                                                    {item.title}
                                                </p>
                                                <p className="mt-2 text-xs leading-relaxed text-white/70">
                                                    {item.description}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.h2
                            className="font-heading mt-10 text-center text-2xl font-extrabold text-[#2a120c] sm:text-3xl"
                            {...getInViewProps(fadeUp)}
                        >
                            {timelineHeading}
                        </motion.h2>

                        <motion.div
                            className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                            {...getInViewProps(stagger)}
                        >
                            {timelineValueCards.map((item, index) => {
                                const Icon = item.icon;
                                const toneClass =
                                    item.tone === 'rose'
                                        ? 'bg-rose-500/12 text-rose-700 ring-rose-500/18'
                                        : item.tone === 'amber'
                                          ? 'bg-amber-500/14 text-amber-800 ring-amber-500/20'
                                          : item.tone === 'red'
                                            ? 'bg-red-500/12 text-red-700 ring-red-500/18'
                                            : 'bg-orange-500/14 text-orange-800 ring-orange-500/20';
                                const cardVariants =
                                    index % 4 === 0
                                        ? fadeLeft
                                        : index % 4 === 1
                                          ? fadeDown
                                          : index % 4 === 2
                                            ? fadeUp
                                            : fadeRight;

                                return (
                                    <motion.div
                                        key={item.title}
                                        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
                                        variants={cardVariants}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClass}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <p className="font-heading text-base font-extrabold text-[#2a120c]">
                                                {item.title}
                                            </p>
                                        </div>
                                        <p className="mt-4 text-sm leading-relaxed text-[#2a120c]/72">
                                            {item.description}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section
                    className="relative overflow-hidden bg-[#f3d8b5] py-14 sm:py-18"
                    style={sectionStyleFromBackground(
                        (problem.background as SectionBackgroundConfig | null) ??
                            null,
                    )}
                >
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="mx-auto max-w-4xl rounded-[28px] bg-white/35 p-8 ring-1 ring-black/5 backdrop-blur sm:p-10"
                            {...getInViewProps(fadeLeft)}
                        >
                            <p className="text-center text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                {problemLabel}
                            </p>
                            <h2 className="font-heading mt-4 text-center text-2xl font-extrabold text-[#2a120c] sm:text-3xl">
                                {problemHeading}
                            </h2>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                {problemBadges.map((text) => (
                                    <span
                                        key={text}
                                        className="inline-flex items-center rounded-full bg-[#7a0d17] px-4 py-2 text-xs font-bold text-white shadow-sm"
                                    >
                                        {text}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl bg-black/45 px-6 py-5 text-center text-sm font-semibold text-white shadow-sm">
                                {problemQuote}
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section
                    id="galeri"
                    className="relative bg-[#fff7ef] py-14 sm:py-18"
                    style={sectionStyleFromBackground(galleryBackground)}
                >
                    <div className="container mx-auto px-6">
                        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                            <div>
                                <motion.h2
                                    className="font-heading text-3xl font-extrabold text-[#2a120c]"
                                    {...getInViewProps(fadeLeft)}
                                >
                                    {galleryTitle}
                                </motion.h2>
                                <p
                                    className={
                                        galleryDescription
                                            ? 'hidden'
                                            : 'mt-4 text-sm leading-relaxed text-[#2a120c]/70'
                                    }
                                >
                                    "Setiap foto menyimpan cerita, setiap
                                    perjalanan membawa makna. Intip momen-momen
                                    berharga dan kebahagiaan para jamaah/klien
                                    yang telah menjadi bagian dari keluarga
                                    besar kami."
                                </p>
                                {galleryDescription ? (
                                    <motion.p
                                        className="mt-4 text-sm leading-relaxed text-[#2a120c]/70"
                                        {...getInViewProps(fadeUp)}
                                    >
                                        {galleryDescription}
                                    </motion.p>
                                ) : null}
                                <div className="mt-7">
                                    <Link
                                        href="/galeri"
                                        className="inline-flex items-center gap-2 rounded-full bg-[#2a120c] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#3a1b12]"
                                    >
                                        {galleryCtaLabel}
                                        <Images className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <motion.div
                                className="relative mx-auto w-full max-w-xl"
                                {...getInViewProps(fadeRight)}
                            >
                                <motion.div
                                    className="grid grid-cols-12 gap-4"
                                    variants={stagger}
                                >
                                    <div className="col-span-7">
                                        <motion.div
                                            className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10"
                                            variants={fadeUp}
                                        >
                                            <img
                                                src={
                                                    galleryPreviewImages[0] ??
                                                    '/images/dummy.jpg'
                                                }
                                                alt="Dokumentasi 1"
                                                className="h-52 w-full object-cover sm:h-64"
                                            />
                                        </motion.div>
                                    </div>
                                    <div className="col-span-5 grid gap-4">
                                        <motion.div
                                            className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10"
                                            variants={fadeUp}
                                        >
                                            <img
                                                src={
                                                    galleryPreviewImages[1] ??
                                                    '/images/dummy.jpg'
                                                }
                                                alt="Dokumentasi 2"
                                                className="h-24 w-full object-cover sm:h-30"
                                            />
                                        </motion.div>
                                        <motion.div
                                            className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10"
                                            variants={fadeUp}
                                        >
                                            <img
                                                src={
                                                    galleryPreviewImages[2] ??
                                                    '/images/dummy.jpg'
                                                }
                                                alt="Dokumentasi 3"
                                                className="h-24 w-full object-cover sm:h-30"
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-[#e6a34a]/25 blur-2xl"
                                    animate={floatSlow}
                                    transition={floatTransitionSlow}
                                />
                                <motion.div
                                    className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 rounded-full bg-[#7a0d17]/15 blur-3xl"
                                    animate={floatFast}
                                    transition={floatTransitionFast}
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section
                    className="relative bg-white py-14 sm:py-18"
                    style={sectionStyleFromBackground(servicesBackground)}
                >
                    <div className="container mx-auto px-6">
                        <motion.h2
                            className="font-heading text-center text-3xl font-extrabold text-[#2a120c]"
                            {...getInViewProps(fadeDown)}
                        >
                            {servicesTitle}
                        </motion.h2>

                        <motion.div
                            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                            {...getInViewProps(stagger)}
                        >
                            {services.slice(0, 4).map((item, index) => {
                                const Icon =
                                    iconMap[
                                        String(
                                            item?.icon ?? '',
                                        ) as keyof typeof iconMap
                                    ] ?? iconMap.plane;
                                const title = String(
                                    item?.title ?? item?.name ?? '',
                                );
                                const description = String(
                                    item?.description ?? '',
                                );
                                const cardVariants =
                                    index % 4 === 0
                                        ? fadeLeft
                                        : index % 4 === 1
                                          ? fadeDown
                                          : index % 4 === 2
                                            ? fadeUp
                                            : fadeRight;

                                return (
                                    <motion.div
                                        key={`${title}_${index}`}
                                        className="rounded-2xl bg-[#f6f1eb] p-6 ring-1 ring-black/5"
                                        variants={cardVariants}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#7a0d17] shadow-sm ring-1 ring-black/5">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <p className="font-heading text-base font-extrabold text-[#2a120c]">
                                                {title ||
                                                    `${servicesFallbackTitlePrefix} ${
                                                        index + 1
                                                    }`}
                                            </p>
                                        </div>
                                        <p className="mt-4 text-sm leading-relaxed text-[#2a120c]/70">
                                            {description ||
                                                servicesFallbackDescription}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section
                    id="paket"
                    className="relative bg-[#2a120c] py-14 sm:py-18"
                    style={sectionStyleFromBackground(packagesBackground)}
                >
                    <div className="container mx-auto px-6">
                        <div className="relative flex flex-col items-center gap-4 text-center sm:min-h-[3rem] sm:justify-center sm:gap-0">
                            <motion.h2
                                className="font-heading text-3xl font-extrabold text-white"
                                {...getInViewProps(fadeDown)}
                            >
                                {packagesHeading}
                            </motion.h2>
                            <div className="sm:absolute sm:top-1/2 sm:right-0 sm:-translate-y-1/2">
                                <Link
                                    href="/paket-umroh"
                                    className="inline-flex items-center justify-center rounded-full bg-white/12 px-6 py-3 text-sm font-extrabold text-white ring-1 ring-white/18 transition hover:bg-white/16"
                                >
                                    {packagesCtaLabel}
                                </Link>
                            </div>
                        </div>

                        <motion.div
                            className="mt-10 grid gap-6 lg:grid-cols-3"
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
                                    String(pkg.slug ?? packagesFallbackName),
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
                                const priceLabel = formatCompactPackagePrice(
                                    pkg.price,
                                    pkg.currency,
                                );
                                const ratingAvg = Number(pkg.rating_avg ?? 0);
                                const ratingCount = Number(
                                    pkg.rating_count ?? 0,
                                );

                                return (
                                    <motion.div
                                        key={String(pkg.slug ?? pkg.id)}
                                        className="group relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
                                        variants={cardVariants}
                                    >
                                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                                            {pkg.original_price ? (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-rose-600/95 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm ring-1 ring-white/20">
                                                    <Zap className="h-3.5 w-3.5" />
                                                    {pkg.discount_label ??
                                                        (pkg.discount_percent
                                                            ? `HEMAT ${pkg.discount_percent}%`
                                                            : 'DISKON')}
                                                </div>
                                            ) : null}

                                            {pkg.is_featured ? (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-extrabold text-amber-950 shadow-sm ring-1 ring-white/20">
                                                    <Stars className="h-3.5 w-3.5 fill-current" />
                                                    Featured
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="relative h-36 overflow-hidden">
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
                                                <p className="font-heading line-clamp-2 text-sm font-extrabold text-white">
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
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <p className="text-base font-extrabold text-[#7a0d17]">
                                                        {priceLabel}
                                                    </p>
                                                    <Link
                                                        href={`/paket-umroh/${String(
                                                            pkg.slug ?? '',
                                                        )}`}
                                                        className="rounded-xl bg-[#e48e28] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#f09c35]"
                                                    >
                                                        {packagesDetailLabel}
                                                    </Link>
                                                </div>
                                                {ratingAvg > 0 ? (
                                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                                        <div className="flex items-center">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((value) => (
                                                                <Star
                                                                    key={value}
                                                                    className={`h-4 w-4 ${
                                                                        value <=
                                                                        Math.round(
                                                                            ratingAvg,
                                                                        )
                                                                            ? 'fill-amber-400 text-amber-400'
                                                                            : 'text-[#2a120c]/20'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="font-semibold text-[#2a120c]">
                                                            {ratingAvg.toFixed(
                                                                1,
                                                            )}
                                                        </span>
                                                        {ratingCount > 0 ? (
                                                            <span className="text-[#2a120c]/60">
                                                                ({ratingCount})
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

                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/paket-umroh"
                                className="inline-flex items-center justify-center rounded-full bg-white/12 px-8 py-3 text-sm font-extrabold text-white ring-1 ring-white/18 transition hover:bg-white/16"
                            >
                                {packagesCtaLabel}
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="relative isolate overflow-hidden bg-black py-14 sm:py-18">
                    <div className="absolute inset-0 -z-10">
                        {testimonialsBackground?.type === 'image' ? (
                            <img
                                src={String(
                                    testimonialsBackground?.image ??
                                        '/images/dummy.jpg',
                                )}
                                alt=""
                                className="h-full w-full object-cover opacity-40"
                            />
                        ) : testimonialsBackground?.type === 'color' ? (
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundColor: String(
                                        testimonialsBackground?.color ?? '#000',
                                    ),
                                }}
                            />
                        ) : (
                            <img
                                src="/images/dummy.jpg"
                                alt=""
                                className="h-full w-full object-cover opacity-40"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/55 to-black/65" />
                    </div>

                    <div className="container mx-auto px-6">
                        <motion.h2
                            className="font-heading text-center text-3xl font-extrabold text-white"
                            {...getInViewProps(fadeDown)}
                        >
                            {testimonialHeading}
                        </motion.h2>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => scrollTestimonials('prev')}
                                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/18 transition hover:bg-white/16"
                                aria-label="Sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollTestimonials('next')}
                                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold text-white ring-1 ring-white/18 transition hover:bg-white/16"
                                aria-label="Berikutnya"
                            >
                                Berikutnya
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative mt-10">
                        <motion.div
                            ref={testimonialsSliderRef}
                            onMouseEnter={() => setIsTestimonialsPaused(true)}
                            onMouseLeave={() => setIsTestimonialsPaused(false)}
                            onFocusCapture={() => setIsTestimonialsPaused(true)}
                            onBlurCapture={() => setIsTestimonialsPaused(false)}
                            className="relative right-1/2 left-1/2 -mx-[50vw] flex w-screen snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:px-10 lg:px-14 [&::-webkit-scrollbar]:hidden"
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
                                        key={testimonial.name}
                                        className="relative w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/95 p-6 shadow-xl ring-1 ring-black/10 sm:w-[300px] lg:w-[320px]"
                                        variants={cardVariants}
                                    >
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f09c35]/18 to-transparent" />
                                        <p className="relative text-sm leading-relaxed text-[#2a120c]/75">
                                            {testimonial.quote ||
                                                testimonialsFallbackQuote}
                                        </p>
                                        <div className="relative mt-6 flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7a0d17] text-sm font-extrabold text-white ring-2 ring-white">
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-extrabold text-[#2a120c]">
                                                    {testimonial.name}
                                                </p>
                                                <span className="mt-1 inline-flex items-center gap-1 text-[#e48e28]">
                                                    {Array.from(
                                                        { length: 5 },
                                                        (_, index) => (
                                                            <Stars
                                                                key={index}
                                                                className={`h-4 w-4 ${
                                                                    index <
                                                                    rating
                                                                        ? 'fill-current'
                                                                        : 'opacity-25'
                                                                }`}
                                                            />
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                <section
                    id="artikel"
                    className="relative bg-[#fff7ef] py-14 sm:py-18"
                    style={sectionStyleFromBackground(articlesBackground)}
                >
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left"
                            {...getInViewProps(fadeLeft)}
                        >
                            <div>
                                <p className="text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                    {articlesLabel}
                                </p>
                                <h2 className="font-heading mt-2 text-3xl font-extrabold text-[#2a120c]">
                                    {articlesHeading}
                                </h2>
                            </div>
                            <Link
                                href="/artikel"
                                className="inline-flex items-center justify-center rounded-full bg-[#2a120c] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#3a1b12]"
                            >
                                {articlesCtaLabel}
                            </Link>
                        </motion.div>

                        {articles.length > 0 ? (
                            <motion.div
                                className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                                {...getInViewProps(stagger)}
                            >
                                {articles.slice(0, 4).map((article, index) => {
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
                                        <motion.div
                                            key={slug || index}
                                            variants={cardVariants}
                                        >
                                            <Link
                                                href={href}
                                                className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                                            >
                                                <div className="relative h-40">
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-85" />
                                                </div>
                                                <div className="p-6">
                                                    <p className="font-heading line-clamp-2 text-base font-extrabold text-[#2a120c]">
                                                        {title}
                                                    </p>
                                                    {excerpt ? (
                                                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#2a120c]/70">
                                                            {excerpt}
                                                        </p>
                                                    ) : null}
                                                    <p className="mt-5 text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                                        {articlesReadMoreLabel}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
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

                <section
                    id="kontak"
                    className="relative bg-[#fff7ef] py-14 sm:py-18"
                    style={sectionStyleFromBackground(contactBackground)}
                >
                    <div className="container mx-auto px-6">
                        <motion.div
                            className="grid gap-8 lg:grid-cols-12 lg:items-stretch"
                            {...getInViewProps(stagger)}
                        >
                            <motion.div
                                className="overflow-hidden rounded-[28px] bg-black/85 lg:col-span-7"
                                variants={fadeLeft}
                            >
                                <div className="relative h-72 sm:h-80">
                                    <img
                                        src={contactBannerImage}
                                        alt=""
                                        className="h-full w-full object-cover opacity-70"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute right-6 bottom-6 left-6">
                                        <p className="text-xs font-bold tracking-[0.24em] text-white/75 uppercase">
                                            {contactBannerKicker}
                                        </p>
                                        <p className="font-heading mt-2 text-2xl font-extrabold text-white">
                                            {contactBannerTitle.replace(
                                                '{company_name}',
                                                String(
                                                    branding?.company_name ??
                                                        '',
                                                ),
                                            )}
                                        </p>
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            {contactLink ? (
                                                <a
                                                    href={contactLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-600"
                                                >
                                                    {contactWhatsappLabel}
                                                </a>
                                            ) : null}
                                            <Link
                                                href={contactSecondaryHref}
                                                className="inline-flex items-center justify-center rounded-full bg-white/12 px-5 py-2.5 text-sm font-extrabold text-white ring-1 ring-white/18 transition hover:bg-white/16"
                                            >
                                                {contactSecondaryLabel}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-black/5 sm:p-8 lg:col-span-5"
                                variants={fadeRight}
                            >
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                            {contactAddressLabel}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-[#2a120c]">
                                            {localize(address, locale, '—')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                            {contactInfoLabel}
                                        </p>
                                        <div className="mt-2 space-y-1.5 text-sm font-semibold text-[#2a120c]">
                                            <p>{phone ?? '—'}</p>
                                            <p>{email ?? '—'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.24em] text-[#7a0d17]/70 uppercase">
                                            {contactOfficeHoursLabel}
                                        </p>
                                        {contactOfficeHoursLines.length > 0 ? (
                                            <div className="mt-2 space-y-1.5 text-sm font-semibold text-[#2a120c]">
                                                {contactOfficeHoursLines.map(
                                                    (line, index) => (
                                                        <p key={index}>
                                                            {line}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm font-semibold text-[#2a120c]">
                                                â€”
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
