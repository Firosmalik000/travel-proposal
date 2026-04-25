import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    IslamicOrnamentAbbasid,
    IslamicOrnamentKhatam,
    IslamicLantern,
    IslamicOrnamentOttoman,
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentRow1Col1,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
import {
    formatDate,
    formatPrice,
    getPublicAddress,
    getPublicEmail,
    getPublicPhoneNumber,
    getPublicSocialAccounts,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { type SharedData } from '@/types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    animate,
    motion,
    useInView,
    type Variants,
} from 'framer-motion';
import {
    CheckCircle,
    Clock,
    Facebook,
    Instagram,
    Mail,
    MapPin,
    MapPin as MapPinIcon,
    MessageCircle,
    Music2,
    Phone,
    Shield,
    Star,
    Twitter,
    Users,
    Youtube,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type StatItem = {
    value: string;
    label: string;
};

type PackageItem = {
    title: string;
    destination: string;
    image: string;
    price: string;
    duration: string;
};

type ServiceItem = {
    number: string;
    title: string;
    description: string;
};

type GalleryImage = {
    src: string;
    alt: string;
};

type FaqItem = {
    question: string;
    answer: string;
};

type ArticleItem = {
    title: string;
    excerpt: string;
    slug: string;
    image: string;
    publishedAt: string;
    readingTime: string;
};

const viewport = { once: false, amount: 0.15, margin: '12% 0px 30% 0px' };

const sectionStagger: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.08,
        },
    },
};

const heroStagger: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.14,
            delayChildren: 0.18,
        },
    },
};

const slideUpStrong: Variants = {
    hidden: { opacity: 0, y: 52, scale: 0.96 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const slideLeftStrong: Variants = {
    hidden: { opacity: 0, x: -72, scale: 0.98 },
    show: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const slideRightStrong: Variants = {
    hidden: { opacity: 0, x: 72, scale: 0.98 },
    show: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const cardBurst: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.42,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

function parseAnimatedStat(value: string): {
    target: number;
    formatter: (nextValue: number) => string;
} {
    const trimmedValue = value.trim();

    if (/^\d+K\+$/.test(trimmedValue)) {
        const targetValue = parseInt(trimmedValue.replace(/[^\d]/g, ''), 10);

        return {
            target: targetValue,
            formatter: (nextValue) => `${Math.round(nextValue)}K+`,
        };
    }

    if (/^\d+%$/.test(trimmedValue)) {
        const targetValue = parseInt(trimmedValue.replace(/[^\d]/g, ''), 10);

        return {
            target: targetValue,
            formatter: (nextValue) => `${Math.round(nextValue)}%`,
        };
    }

    if (/^\d+\+$/.test(trimmedValue)) {
        const targetValue = parseInt(trimmedValue.replace(/[^\d]/g, ''), 10);

        return {
            target: targetValue,
            formatter: (nextValue) => `${Math.round(nextValue)}+`,
        };
    }

    const numericTarget = parseFloat(trimmedValue.replace(/[^0-9.]/g, ''));

    if (!Number.isNaN(numericTarget)) {
        return {
            target: numericTarget,
            formatter: (nextValue) => String(Math.round(nextValue)),
        };
    }

    return {
        target: 0,
        formatter: () => trimmedValue,
    };
}

function CountUpStat({ value, label }: StatItem) {
    const statRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(statRef, {
        amount: 0.5,
        margin: '12% 0px 30% 0px',
        once: false,
    });
    const lastCommittedValueRef = useRef<string>(value);
    const lastCommitAtRef = useRef<number>(0);
    const lastRunAtRef = useRef<number>(0);

    useEffect(() => {
        const { target, formatter } = parseAnimatedStat(value);

        if (!isInView || target <= 0) {
            lastCommittedValueRef.current = value;
            lastCommitAtRef.current = 0;
            if (valueRef.current) {
                valueRef.current.textContent = value;
            }

            return;
        }

        const now = performance.now();
        // Prevent rapid restarts when hovering around the viewport threshold.
        if (now - lastRunAtRef.current < 900) {
            return;
        }
        lastRunAtRef.current = now;

        const controls = animate(0, target, {
            duration: 1.35,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => {
                const now = performance.now();
                // Avoid forcing React re-renders on every animation frame.
                // 40ms ~= 25fps is plenty for a count-up effect and noticeably lighter.
                if (now - lastCommitAtRef.current < 40) {
                    return;
                }

                const nextText = formatter(latest);
                if (nextText === lastCommittedValueRef.current) {
                    return;
                }

                lastCommittedValueRef.current = nextText;
                lastCommitAtRef.current = now;
                if (valueRef.current) {
                    valueRef.current.textContent = nextText;
                }
            },
            onComplete: () => {
                const nextText = formatter(target);
                if (nextText === lastCommittedValueRef.current) {
                    return;
                }

                lastCommittedValueRef.current = nextText;
                if (valueRef.current) {
                    valueRef.current.textContent = nextText;
                }
            },
        });

        return () => controls.stop();
    }, [isInView, value]);

    return (
        <motion.div
            ref={statRef}
            className="hero-stat px-4 py-4 text-center sm:px-5"
            variants={slideUpStrong}
        >
            <p
                ref={valueRef}
                className="font-heading text-xl font-bold text-white sm:text-2xl"
                suppressHydrationWarning
            >
                {value}
            </p>
            <p className="mt-1 text-[11px] text-white/60 sm:text-xs">{label}</p>
        </motion.div>
    );
}

export default function Home() {
    const { locale } = usePublicLocale();
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const publicData = usePublicData();
    const homePage = usePublicPageContent('home');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const heroLabel = localize(homePage?.content?.hero?.label, locale);
    const heroTitle = localize(homePage?.content?.hero?.title, locale);
    const heroDescription = localize(
        homePage?.content?.hero?.description,
        locale,
    );
    const heroImage = homePage?.content?.hero?.image || '/images/dummy.jpg';
    const aboutTitle = localize(homePage?.content?.about?.title, locale);
    const aboutDescription = localize(
        homePage?.content?.about?.description,
        locale,
    );
    const aboutCta = localize(homePage?.content?.about?.cta, locale);
    const aboutLabel = localize(homePage?.content?.about?.label, locale);
    const aboutPrimaryImage =
        homePage?.content?.about?.image_primary || '/images/dummy.jpg';
    const aboutSecondaryImage =
        homePage?.content?.about?.image_secondary || '/images/dummy.jpg';
    const packagesTitle = localize(homePage?.content?.packages?.title, locale);
    const pricePrefix = localize(
        homePage?.content?.packages?.price_prefix,
        locale,
    );
    const servicesLabel = localize(homePage?.content?.services?.label, locale);
    const servicesTitle = localize(homePage?.content?.services?.title, locale);
    const servicesDescription = localize(
        homePage?.content?.services?.description,
        locale,
    );
    const galleryTitle = localize(homePage?.content?.gallery?.title, locale);
    const galleryDescription = localize(
        homePage?.content?.gallery?.description,
        locale,
    );
    const faqTitle = localize(homePage?.content?.faq?.title, locale);
    const faqDescription = localize(
        homePage?.content?.faq?.description,
        locale,
    );
    const contactLabel = localize(homePage?.content?.contact?.label, locale);
    const contactTitle = localize(homePage?.content?.contact?.title, locale);
    const contactDescription = localize(
        homePage?.content?.contact?.description,
        locale,
    );
    const contactWhatsapp = localize(
        homePage?.content?.contact?.whatsapp_label,
        locale,
    );
    const contactFull = localize(
        homePage?.content?.contact?.contact_label,
        locale,
    );
    const contactPhone = getPublicPhoneNumber(seo);
    const contactEmail = getPublicEmail(seo);
    const contactAddress = localize(getPublicAddress(seo), locale);
    const socialIconMap = {
        instagram: Instagram,
        facebook: Facebook,
        youtube: Youtube,
        tiktok: Music2,
        twitter: Twitter,
        x: Twitter,
    } as const;
    const contactSocials = getPublicSocialAccounts(seo).map((social) => ({
        ...social,
        icon:
            socialIconMap[
                social.platform.toLowerCase() as keyof typeof socialIconMap
            ] ?? Instagram,
    }));
    const whatsappLink = whatsappLinkFromSeo(seo);
    const contactInfoItems = [
        {
            icon: Phone,
            label: locale === 'id' ? 'Telepon' : 'Phone',
            value: contactPhone,
        },
        {
            icon: Mail,
            label: locale === 'id' ? 'Email' : 'Email',
            value: contactEmail,
        },
        {
            icon: MapPin,
            label: locale === 'id' ? 'Alamat Kantor' : 'Office Address',
            value: contactAddress,
        },
    ].filter((item) => item.value);
    const hasContactPanel = Boolean(
        whatsappLink ||
            contactInfoItems.length > 0 ||
            contactSocials.length > 0,
    );

    const stats: StatItem[] =
        Array.isArray(homePage?.content?.stats) &&
        homePage.content.stats.length > 0
            ? homePage.content.stats.map((item: Record<string, unknown>) => ({
                  value: String(item.value ?? ''),
                  label: localize(item.label, locale),
              }))
            : [];

    const packageItems: PackageItem[] =
        Array.isArray(publicData.packages) && publicData.packages.length > 0
            ? publicData.packages.map((pkg: Record<string, any>) => ({
                  title: localize(pkg.name, locale),
                  destination: pkg.departure_city,
                  image: pkg.image_path || '/images/dummy.jpg',
                  price: formatPrice(pkg.price, locale, pkg.currency),
                  duration: `${pkg.duration_days} ${locale === 'id' ? 'Hari' : 'Days'}`,
              }))
            : [];

    const serviceItems: ServiceItem[] = (() => {
        const cmsItems = homePage?.content?.services?.items;
        if (Array.isArray(cmsItems) && cmsItems.length > 0) {
            return cmsItems.map((item: Record<string, any>, index: number) => ({
                number: String(index + 1).padStart(2, '0'),
                title: localize(item.title, locale),
                description: localize(item.description, locale),
            }));
        }

        return Array.isArray(publicData.services) &&
            publicData.services.length > 0
            ? publicData.services.map(
                  (item: Record<string, any>, index: number) => ({
                      number: String(index + 1).padStart(2, '0'),
                      title: localize(item.title, locale),
                      description: localize(item.description, locale),
                  }),
              )
            : [];
    })();

    const landingGalleryImages =
        Array.isArray(homePage?.content?.gallery?.images) &&
        homePage.content.gallery.images.length > 0
            ? homePage.content.gallery.images
                  .map((item: Record<string, any>) => ({
                      src: item?.src || '/images/dummy.jpg',
                      alt: localize(item?.alt, locale, galleryTitle),
                  }))
                  .filter((item: GalleryImage) => Boolean(item.src))
            : [];

    const galleryImages: GalleryImage[] =
        landingGalleryImages.length > 0
            ? landingGalleryImages
            : Array.isArray(publicData.gallery) && publicData.gallery.length > 0
              ? publicData.gallery.map((item: Record<string, any>) => ({
                    src: item.image_path || '/images/dummy.jpg',
                    alt: localize(item.title, locale),
                }))
              : [];

    const faqItems: FaqItem[] =
        Array.isArray(publicData.faqs) && publicData.faqs.length > 0
            ? publicData.faqs.map((item: Record<string, unknown>) => ({
                  question: localize(item.question, locale),
                  answer: localize(item.answer, locale),
              }))
            : [];

    const latestArticles: ArticleItem[] =
        Array.isArray(publicData.articles) && publicData.articles.length > 0
            ? publicData.articles
                  .slice(0, 3)
                  .map((item: Record<string, any>) => ({
                      title: localize(item.title, locale),
                      excerpt: localize(item.excerpt, locale),
                      slug: String(item.slug ?? ''),
                      image: item.image_path || '/images/dummy.jpg',
                      publishedAt: formatDate(item.published_at, locale),
                      readingTime: `${item.reading_time_minutes ?? 1} ${locale === 'id' ? 'menit baca' : 'min read'}`,
                  }))
            : [];

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <PublicLayout>
            <Head title={localize(homePage?.title, locale)} />

            <main className="relative bg-background">
                <section
                    className="hero-section relative flex min-h-[90vh] flex-col justify-end overflow-hidden sm:min-h-[86vh]"
                >
                    <div className="hero-bg absolute inset-0">
                        <img
                            src={heroImage}
                            alt={heroTitle}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/20" />
                        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/20 to-transparent" />
                        <div className="pointer-events-none absolute inset-0">
                            {/* Hero ornaments: keep it elegant (avoid noisy blend modes). */}
                            <IslamicOrnamentRow1Col1 className="absolute -top-16 right-[-8%] h-[20rem] w-[20rem] rotate-[16deg] text-white/14 sm:h-[28rem] sm:w-[28rem]" />
                            <div className="absolute top-[4%] left-[8%] text-white/16 sm:top-[2%] sm:left-[12%] sm:text-white/18">
                                <div className="relative">
                                    <IslamicLantern className="h-36 w-24 -rotate-[7deg] sm:h-44 sm:w-28" />
                                    <IslamicLantern className="absolute top-6 left-20 h-28 w-20 rotate-[10deg] opacity-85 sm:top-8 sm:left-24 sm:h-36 sm:w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-primary via-accent to-transparent" />

                    <motion.div
                        className="relative z-10 container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.15, margin: '12% 0px 30% 0px' }}
                        variants={heroStagger}
                    >
                        <div className="max-w-4xl pt-24 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-24 lg:pt-48">
                            <motion.div
                                className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-1.5 shadow-sm shadow-black/20"
                                variants={slideUpStrong}
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                                <span className="text-[0.7rem] font-bold tracking-wider text-white uppercase sm:text-xs">
                                    {heroLabel}
                                </span>
                            </motion.div>
                            <motion.h1
                                className="hero-title font-heading text-3xl leading-[1.1] font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                                variants={slideUpStrong}
                            >
                                {heroTitle}
                            </motion.h1>
                            <motion.p
                                className="hero-desc mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg lg:text-xl"
                                variants={slideUpStrong}
                            >
                                {heroDescription}
                            </motion.p>
                            <motion.div
                                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                                variants={heroStagger}
                            >
                                <motion.div variants={slideUpStrong}>
                                    <Link
                                        href="/paket-umroh"
                                        className="hero-cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:w-auto"
                                    >
                                        {locale === 'id'
                                            ? 'Lihat Paket Umroh'
                                            : 'View Umrah Packages'}
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                                <motion.div variants={slideUpStrong}>
                                    <Link
                                        href="/jadwal-keberangkatan"
                                        className="hero-cta inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/12 px-8 py-4 text-sm font-bold text-white shadow-sm shadow-black/20 transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:w-auto"
                                    >
                                        {locale === 'id'
                                            ? 'Cek Jadwal'
                                            : 'Check Schedule'}
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {stats.length > 0 ? (
                        <motion.div
                            className="relative z-10 border-t border-white/10 bg-black/70"
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: false, amount: 0.2, margin: '12% 0px 30% 0px' }}
                            variants={sectionStagger}
                        >
                            <div className="container mx-auto px-4 sm:px-6">
                                <div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-2 md:grid-cols-4 lg:divide-x">
                                    {stats.map((stat) => (
                                        <CountUpStat
                                            key={stat.label}
                                            value={stat.value}
                                            label={stat.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </section>

                <section className="about-section relative isolate overflow-hidden py-16 sm:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px] [contain:paint]">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_24%,rgba(230,156,50,0.26)_0%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(189,49,34,0.18)_0%,transparent_50%),radial-gradient(circle_at_88%_70%,rgba(142,16,27,0.14)_0%,transparent_58%),radial-gradient(circle_at_20%_90%,rgba(93,8,18,0.10)_0%,transparent_62%),conic-gradient(from_210deg_at_20%_58%,rgba(230,156,50,0.12)_0deg,transparent_140deg,rgba(189,49,34,0.10)_230deg,transparent_360deg),linear-gradient(135deg,rgba(255,255,255,0.32)_0%,transparent_38%,rgba(230,156,50,0.10)_72%,transparent_100%),linear-gradient(180deg,transparent_0%,rgba(93,8,18,0.05)_62%,transparent_100%)] opacity-95 dark:opacity-40" />
                        <IslamicOrnamentRow1Col1 className="absolute top-[8%] left-[-4%] h-[18rem] w-[18rem] rotate-[-12deg] text-primary/15 sm:h-[22rem] sm:w-[22rem]" />
                        <IslamicLantern className="absolute bottom-[-20%] right-[0%] h-[18rem] w-[12rem] rotate-[10deg] text-accent/14 sm:h-[24rem] sm:w-[16rem]" />
                    </div>

                    <div className="container mx-auto grid items-center gap-10 px-4 sm:px-6 md:gap-16 lg:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={slideLeftStrong}
                    >
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-widest text-primary uppercase">
                            {aboutLabel}
                        </span>
                        <h2 className="font-heading mt-5 text-3xl leading-[1.2] font-extrabold text-foreground sm:text-4xl md:text-5xl">
                            {aboutTitle}
                        </h2>
                        <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {aboutDescription}
                        </p>
                        <motion.div
                            className="mt-8 flex flex-wrap gap-3"
                            initial="hidden"
                            whileInView="show"
                            viewport={viewport}
                            variants={sectionStagger}
                        >
                            {[
                                {
                                    icon: Shield,
                                    label:
                                        locale === 'id'
                                            ? 'Izin Resmi Kemenag'
                                            : 'Official License',
                                },
                                {
                                    icon: Users,
                                    label:
                                        locale === 'id'
                                            ? '20K+ Jamaah'
                                            : '20K+ Pilgrims',
                                },
                                { icon: Star, label: 'Rating 4.9/5' },
                            ].map(({ icon: Icon, label }) => (
                                <motion.div
                                    key={label}
                                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[0.7rem] font-bold text-foreground shadow-xs sm:text-xs"
                                    variants={cardBurst}
                                >
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                    {label}
                                </motion.div>
                            ))}
                        </motion.div>
                        <motion.div
                            variants={slideUpStrong}
                            initial="hidden"
                            whileInView="show"
                            viewport={viewport}
                        >
                            <Link
                                href="/tentang-kami"
                                className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background transition-all hover:scale-105 hover:bg-foreground/85 active:scale-95 sm:w-auto"
                            >
                                {aboutCta}
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="relative mt-8 h-[320px] sm:mt-0 sm:h-[400px] md:h-[480px]"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={slideRightStrong}
                    >
                        <img
                            src={aboutPrimaryImage}
                            alt={aboutTitle}
                            className="h-full w-4/5 rounded-3xl object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.02] sm:w-3/4"
                        />
                        <img
                            src={aboutSecondaryImage}
                            alt={aboutTitle}
                            className="absolute right-0 -bottom-4 w-3/5 rounded-2xl border-4 border-background shadow-2xl sm:-bottom-8 sm:w-1/2 sm:border-8"
                        />
                        <div
                            className="absolute top-[-1rem] right-4 flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 shadow-xl shadow-primary/30 sm:right-8"
                        >
                            <CheckCircle className="h-4 w-4 text-white" />
                            <span className="text-[0.7rem] font-bold text-white sm:text-xs">
                                {locale === 'id'
                                    ? 'Terpercaya Sejak 2009'
                                    : 'Trusted Since 2009'}
                            </span>
                        </div>
                    </motion.div>
                    </div>
                </section>

                <section className="packages-section relative isolate overflow-hidden bg-secondary/30 py-16 sm:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px] [contain:paint]">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(230,156,50,0.28)_0%,transparent_52%),radial-gradient(circle_at_88%_22%,rgba(142,16,27,0.18)_0%,transparent_56%),radial-gradient(circle_at_78%_82%,rgba(189,49,34,0.14)_0%,transparent_60%),conic-gradient(from_190deg_at_62%_34%,rgba(230,156,50,0.10)_0deg,transparent_150deg,rgba(93,8,18,0.10)_250deg,transparent_360deg),linear-gradient(135deg,rgba(255,255,255,0.40)_0%,transparent_34%,rgba(230,156,50,0.12)_70%,transparent_100%),linear-gradient(180deg,rgba(93,8,18,0.06)_0%,transparent_34%,rgba(230,156,50,0.08)_100%)] opacity-95 dark:opacity-34" />
                        <IslamicOrnamentAbbasid className="absolute top-[10%] right-[-4%] h-[18rem] w-[18rem] rotate-[6deg] text-primary/15 sm:h-[22rem] sm:w-[22rem]" />
                        <IslamicLantern className="absolute bottom-[-24%] left-[2%] h-[20rem] w-[13rem] -rotate-[10deg] text-primary/14 sm:h-[26rem] sm:w-[17rem]" />
                    </div>
                    <motion.div
                        className="container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <motion.div variants={slideLeftStrong}>
                                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-widest text-primary uppercase">
                                    {locale === 'id'
                                        ? 'Pilihan Terbaik'
                                        : 'Best Picks'}
                                </span>
                                <h2 className="font-heading mt-4 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                                    {packagesTitle}
                                </h2>
                            </motion.div>
                            <motion.div
                                className="hidden gap-3 sm:flex"
                                variants={slideRightStrong}
                            >
                                <button
                                    onClick={() => handleScroll('left')}
                                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:scale-110 hover:border-primary hover:text-primary"
                                    aria-label="Previous"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => handleScroll('right')}
                                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:scale-110 hover:border-primary hover:text-primary"
                                    aria-label="Next"
                                >
                                    →
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                    <motion.div
                        ref={scrollContainerRef}
                        className="relative flex gap-5 overflow-x-auto px-4 pb-4 sm:px-6"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <div className="w-2 shrink-0" />
                        {packageItems.map((pkg, index) => (
                            <motion.div
                                key={pkg.title}
                                variants={cardBurst}
                                className="shrink-0"
                            >
                                <Link
                                    href="/paket-umroh"
                                    className="pkg-card group relative block h-[400px] w-64 cursor-pointer overflow-hidden rounded-3xl sm:h-[460px] sm:w-72 md:h-[480px]"
                                >
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                    {index === 0 ? (
                                        <div
                                            className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow"
                                        >
                                            {locale === 'id'
                                                ? 'Terlaris'
                                                : 'Best Seller'}
                                        </div>
                                    ) : null}
                                    <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                                            <MapPinIcon className="h-3 w-3" />
                                            {pkg.destination}
                                        </div>
                                        <h3 className="font-heading mt-1.5 text-xl font-bold">
                                            {pkg.title}
                                        </h3>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-white/60">
                                                    {pricePrefix}
                                                </p>
                                                <p className="text-lg font-extrabold text-accent">
                                                    {pkg.price}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs">
                                                <Clock className="h-3 w-3" />
                                                {pkg.duration}
                                            </div>
                                        </div>
                                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                                            {locale === 'id'
                                                ? 'Lihat Detail'
                                                : 'View Detail'}
                                            <ArrowRightIcon className="h-3 w-3" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                        <div className="w-2 shrink-0" />
                    </motion.div>
                </section>

                <section className="services-section relative isolate overflow-hidden py-20 sm:py-24">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_34%,rgba(93,8,18,0.16)_0%,transparent_58%),radial-gradient(circle_at_92%_38%,rgba(230,156,50,0.22)_0%,transparent_60%),radial-gradient(circle_at_70%_92%,rgba(189,49,34,0.16)_0%,transparent_62%),radial-gradient(circle_at_20%_86%,rgba(255,214,146,0.20)_0%,transparent_64%),conic-gradient(from_210deg_at_18%_70%,rgba(93,8,18,0.08)_0deg,transparent_160deg,rgba(230,156,50,0.10)_260deg,transparent_360deg),linear-gradient(135deg,rgba(255,255,255,0.34)_0%,transparent_28%,transparent_58%,rgba(230,156,50,0.12)_100%)] opacity-92 dark:opacity-34" />
                        <IslamicOrnamentOttomanAccent className="absolute top-[14%] right-[-6%] h-[22rem] w-[22rem] rotate-[16deg] text-accent/15 sm:h-[28rem] sm:w-[28rem]" />
                        <IslamicLantern className="absolute bottom-[-28%] left-[6%] h-[18rem] w-[12rem] rotate-[8deg] text-primary/12 sm:h-[24rem] sm:w-[16rem]" />
                    </div>

                    <div className="container mx-auto grid items-start gap-12 px-4 sm:px-6 md:gap-16 lg:grid-cols-2">
                    <motion.div
                        className="services-header lg:sticky lg:top-24"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <motion.span
                            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase"
                            variants={slideUpStrong}
                        >
                            {servicesLabel}
                        </motion.span>
                        <motion.h2
                            className="font-heading mt-5 text-3xl leading-tight font-extrabold text-foreground sm:text-4xl md:text-5xl"
                            variants={slideUpStrong}
                        >
                            {servicesTitle}
                        </motion.h2>
                        <motion.p
                            className="mt-5 text-base leading-relaxed text-muted-foreground"
                            variants={slideUpStrong}
                        >
                            {servicesDescription}
                        </motion.p>
                        <motion.div variants={slideUpStrong}>
                            <Link
                                href="/layanan"
                                className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-all hover:scale-105 hover:bg-primary hover:text-white"
                            >
                                {locale === 'id'
                                    ? 'Semua Layanan'
                                    : 'All Services'}
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        {serviceItems.map((item) => (
                            <motion.div
                                key={item.number}
                                className="service-card group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                                variants={cardBurst}
                            >
                                <div className="absolute top-[-1.5rem] right-[-1.5rem] h-24 w-24 rounded-full bg-primary/5 transition-all duration-300 group-hover:scale-150 group-hover:bg-primary/10" />
                                <p className="font-heading text-4xl font-black text-primary/15 transition-colors group-hover:text-primary/25">
                                    {item.number}
                                </p>
                                <h3 className="font-heading mt-3 text-lg font-bold text-foreground">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                    </div>
                </section>

                {latestArticles.length > 0 ? (
                    <section className="relative isolate overflow-hidden container mx-auto px-4 py-20 sm:px-6 sm:py-24">
                        <div className="pointer-events-none absolute inset-0 -z-10">
                            <IslamicOrnamentZellige className="absolute top-[-10%] right-[2%] h-[18rem] w-[18rem] rotate-[10deg] text-primary/15 sm:h-[22rem] sm:w-[22rem]" />
                            <IslamicLantern className="absolute bottom-[-28%] left-[2%] h-[18rem] w-[12rem] -rotate-[8deg] text-accent/12 sm:h-[24rem] sm:w-[16rem]" />
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={viewport}
                            variants={sectionStagger}
                        >
                            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <motion.div variants={slideUpStrong}>
                                    <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                                        {locale === 'id'
                                            ? 'Artikel Terbaru'
                                            : 'Latest Articles'}
                                    </span>
                                    <h2 className="font-heading mt-3 text-3xl font-extrabold text-foreground sm:text-4xl">
                                        {locale === 'id'
                                            ? 'Insight Baru untuk Jamaah dan Travel Update'
                                            : 'Fresh Insights and Travel Updates'}
                                    </h2>
                                </motion.div>
                                <motion.div variants={slideUpStrong}>
                                    <Link
                                        href="/artikel"
                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm"
                                    >
                                        {locale === 'id'
                                            ? 'Lihat Semua Artikel'
                                            : 'View All Articles'}
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                            </div>

                            <motion.div
                                className="grid gap-6 md:grid-cols-3"
                                variants={sectionStagger}
                            >
                                {latestArticles.map((article) => (
                                    <motion.div
                                        key={article.slug}
                                        variants={cardBurst}
                                        className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                                    >
                                        <div className="aspect-[16/10] bg-muted">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-4 p-5">
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span>
                                                    {article.publishedAt}
                                                </span>
                                                <span>
                                                    {article.readingTime}
                                                </span>
                                            </div>
                                            <h3 className="font-heading text-xl font-bold text-foreground">
                                                {article.title}
                                            </h3>
                                            <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                                                {article.excerpt}
                                            </p>
                                            <Link
                                                href={`/artikel/${article.slug}`}
                                                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
                                            >
                                                {locale === 'id'
                                                    ? 'Baca Artikel'
                                                    : 'Read Article'}
                                                <ArrowRightIcon className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </section>
                ) : null}

                <section className="gallery-section relative isolate overflow-hidden bg-foreground py-16 sm:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px] [contain:paint]">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(230,156,50,0.42)_0%,transparent_52%),radial-gradient(circle_at_84%_20%,rgba(189,49,34,0.34)_0%,transparent_56%),radial-gradient(circle_at_78%_86%,rgba(142,16,27,0.26)_0%,transparent_62%),conic-gradient(from_210deg_at_18%_70%,rgba(230,156,50,0.14)_0deg,transparent_110deg,rgba(189,49,34,0.12)_220deg,transparent_360deg),linear-gradient(90deg,rgba(255,255,255,0.06)_0%,transparent_28%,transparent_72%,rgba(255,220,157,0.08)_100%),linear-gradient(180deg,rgba(0,0,0,0.74)_0%,rgba(0,0,0,0.22)_34%,rgba(0,0,0,0.82)_100%)] opacity-92" />
                        <IslamicOrnamentRow1Col1 className="absolute top-[8%] left-[-6%] h-[22rem] w-[22rem] rotate-[-6deg] text-white/15 mix-blend-overlay sm:h-[28rem] sm:w-[28rem]" />
                        <IslamicLantern className="absolute bottom-[-30%] right-[2%] h-[20rem] w-[13rem] rotate-[12deg] text-white/14 sm:h-[26rem] sm:w-[17rem]" />
                    </div>
                    <motion.div
                        className="container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <motion.div variants={slideLeftStrong}>
                                <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-widest text-white/60 uppercase">
                                    {locale === 'id'
                                        ? 'Momen Bersama'
                                        : 'Our Moments'}
                                </span>
                                <h2 className="font-heading mt-4 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
                                    {galleryTitle}
                                </h2>
                            </motion.div>
                            <motion.p
                                className="max-w-xs text-sm text-white/50"
                                variants={slideRightStrong}
                            >
                                {galleryDescription}
                            </motion.p>
                        </div>
                        <motion.div
                            className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:gap-4 md:auto-rows-[190px] md:grid-cols-4"
                            variants={sectionStagger}
                        >
                            {galleryImages.map((image, index) => {
                                const spans = [
                                    'col-span-2 row-span-2 md:col-span-2 md:row-span-2',
                                    'col-span-1',
                                    'col-span-1',
                                    'col-span-2 md:col-span-2',
                                    'col-span-1',
                                    'col-span-1',
                                ];

                                return (
                                    <motion.div
                                        key={index}
                                        className={`gallery-item group relative overflow-hidden rounded-2xl bg-white/5 ${spans[index % spans.length]}`}
                                        variants={cardBurst}
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <p className="text-[0.65rem] font-bold text-white drop-shadow-md sm:text-xs">
                                                {image.alt}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </section>

                <section className="faq-section relative isolate overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <IslamicOrnamentKhatam className="absolute top-[18%] right-[-6%] h-[18rem] w-[18rem] rotate-[12deg] text-accent/15 sm:h-[22rem] sm:w-[22rem]" />
                        <IslamicLantern className="absolute bottom-[-32%] left-[0%] h-[18rem] w-[12rem] -rotate-[10deg] text-primary/12 sm:h-[24rem] sm:w-[16rem]" />
                    </div>
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-widest text-primary uppercase">
                            FAQ
                        </span>
                        <h2 className="font-heading mt-4 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                            {faqTitle}
                        </h2>
                        <p className="mt-5 text-sm text-muted-foreground sm:text-base">
                            {faqDescription}
                        </p>
                    </div>

                    <div className="mx-auto mt-12 max-w-3xl space-y-4">
                        {faqItems.map((item, index) => (
                            <details
                                key={`${item.question}_${index}`}
                                className="group rounded-2xl border border-border bg-card shadow-xs"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left sm:px-7 [&::-webkit-details-marker]:hidden">
                                    <span className="text-sm font-bold text-foreground sm:text-base">
                                        {item.question}
                                    </span>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted-foreground group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <div className="px-5 pb-6 sm:px-7">
                                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {item.answer}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

                {hasContactPanel ? (
                    <section className="contact-section container mx-auto px-4 pb-16 sm:px-6 sm:pb-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px]">
                        <motion.div
                            className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-foreground via-foreground to-primary px-6 py-12 text-background shadow-2xl sm:rounded-[48px] sm:px-12 sm:py-16 lg:px-16"
                            initial={{ opacity: 0, y: 56, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={viewport}
                            transition={{
                                duration: 0.85,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <div className="pointer-events-none absolute inset-0">
                                <IslamicLantern className="absolute top-[-22%] left-[0%] h-[18rem] w-[12rem] rotate-[-8deg] text-white/14 sm:h-[24rem] sm:w-[16rem]" />
                                <IslamicOrnamentAbbasid
                                    className="absolute bottom-[-20%] right-[-6%] h-[22rem] w-[22rem] rotate-[14deg] text-white/15 mix-blend-overlay sm:h-[28rem] sm:w-[28rem]"
                                />
                            </div>
                            <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                                <motion.div
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={viewport}
                                    variants={sectionStagger}
                                >
                                    <motion.span
                                        className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-widest text-background/60 uppercase"
                                        variants={slideUpStrong}
                                    >
                                        {contactLabel}
                                    </motion.span>
                                    <motion.h2
                                        className="font-heading mt-5 text-3xl leading-tight font-extrabold sm:text-4xl md:text-5xl lg:text-6xl"
                                        variants={slideUpStrong}
                                    >
                                        {contactTitle}
                                    </motion.h2>
                                    <motion.p
                                        className="mt-6 text-sm leading-relaxed text-background/75 sm:text-base md:text-lg"
                                        variants={slideUpStrong}
                                    >
                                        {contactDescription}
                                    </motion.p>
                                    <motion.div
                                        className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
                                        variants={heroStagger}
                                    >
                                        {whatsappLink ? (
                                            <motion.a
                                                href={whatsappLink}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                                variants={slideUpStrong}
                                            >
                                                <MessageCircle className="h-5 w-5" />
                                                {contactWhatsapp}
                                            </motion.a>
                                        ) : null}
                                        <motion.div variants={slideUpStrong}>
                                            <Link
                                                href="/kontak"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-background/25 bg-background/8 px-8 py-4 text-sm font-bold text-background/90 transition-all hover:scale-105 hover:border-background/50 hover:bg-background/10 active:scale-95 sm:w-auto"
                                            >
                                                {contactFull}
                                                <ArrowRightIcon className="h-4 w-4" />
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    className="flex flex-col gap-5 rounded-[24px] bg-white/12 p-6 ring-1 ring-white/12 sm:p-8"
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={viewport}
                                    variants={sectionStagger}
                                >
                                    {contactInfoItems.map(
                                        ({ icon: Icon, label, value }) => (
                                            <motion.div
                                                key={label}
                                                className="flex items-start gap-5 text-sm text-background/85"
                                                variants={cardBurst}
                                            >
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[0.6rem] font-bold tracking-widest text-background/50 uppercase">
                                                        {label}
                                                    </p>
                                                    <p className="mt-1 break-words text-sm font-bold sm:text-base">
                                                        {value}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ),
                                    )}
                                    {contactSocials.length > 0 ? (
                                        <motion.div
                                            className="mt-4 pt-6 border-t border-white/10"
                                            variants={slideUpStrong}
                                        >
                                            <p className="text-[0.6rem] font-bold tracking-widest text-background/50 uppercase">
                                                {locale === 'id'
                                                    ? 'Media Sosial'
                                                    : 'Social Media'}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2.5">
                                                {contactSocials.map(
                                                    (social, index) => {
                                                        const Icon =
                                                            social.icon;

                                                        return (
                                                            <motion.a
                                                                key={`${social.label}_${index}`}
                                                                href={
                                                                    social.url
                                                                }
                                                                rel="noreferrer"
                                                                target="_blank"
                                                                className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-background/80 transition-all hover:scale-105 hover:border-background/50 hover:bg-white/10"
                                                                variants={
                                                                    cardBurst
                                                                }
                                                            >
                                                                <Icon className="h-4 w-4" />
                                                                {social.label}
                                                            </motion.a>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </motion.div>
                            </div>
                        </motion.div>
                    </section>
                ) : null}
            </main>
        </PublicLayout>
    );
}
