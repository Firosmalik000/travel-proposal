import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
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
    AnimatePresence,
    animate,
    motion,
    useInView,
    useScroll,
    useTransform,
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

const viewport = { once: false, amount: 0.2 };

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
    hidden: { opacity: 0, y: 70, scale: 0.9, rotateX: 12 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 16,
            mass: 0.9,
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
    const isInView = useInView(statRef, { amount: 0.7, once: false });
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const { target, formatter } = parseAnimatedStat(value);

        if (!isInView || target <= 0) {
            setDisplayValue(value);

            return;
        }

        const controls = animate(0, target, {
            duration: 1.35,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => {
                setDisplayValue(formatter(latest));
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
            <p className="font-heading text-xl font-bold text-white sm:text-2xl">
                {displayValue}
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
    const heroRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const heroImageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);

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

    const customFaqItems = Array.isArray(homePage?.content?.faq?.items)
        ? homePage.content.faq.items
              .map((item: Record<string, any>) => ({
                  question: localize(item?.question, locale),
                  answer: localize(item?.answer, locale),
              }))
              .filter((item: FaqItem) => item.question && item.answer)
        : [];

    const faqItems: FaqItem[] =
        customFaqItems.length > 0
            ? customFaqItems
            : Array.isArray(publicData.faqs) && publicData.faqs.length > 0
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

    const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                    ref={heroRef}
                    className="hero-section relative flex min-h-[86vh] flex-col justify-end overflow-hidden"
                >
                    <motion.div
                        className="hero-bg absolute inset-0"
                        style={{ y: heroImageY, scale: heroImageScale }}
                    >
                        <img
                            src={heroImage}
                            alt={heroTitle}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10" />
                        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/10 to-transparent" />
                    </motion.div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-primary via-accent to-transparent" />

                    <motion.div
                        className="relative z-10 container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: false, amount: 0.35 }}
                        variants={heroStagger}
                    >
                        <div className="max-w-3xl pt-16 pb-12 sm:pt-20 sm:pb-14 md:pt-24 md:pb-16">
                            <motion.div
                                className="hero-badge mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
                                variants={slideUpStrong}
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                                <span className="text-xs font-medium text-white sm:text-sm">
                                    {heroLabel}
                                </span>
                            </motion.div>
                            <motion.h1
                                className="hero-title font-heading text-4xl leading-[1.04] font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl"
                                variants={slideUpStrong}
                            >
                                {heroTitle}
                            </motion.h1>
                            <motion.p
                                className="hero-desc mt-4 max-w-lg text-sm leading-relaxed text-white/72 sm:text-base md:text-lg"
                                variants={slideUpStrong}
                            >
                                {heroDescription}
                            </motion.p>
                            <motion.div
                                className="mt-7 flex flex-wrap gap-3"
                                variants={heroStagger}
                            >
                                <motion.div variants={slideUpStrong}>
                                    <Link
                                        href="/paket-umroh"
                                        className="hero-cta inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
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
                                        className="hero-cta inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
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
                            className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md"
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: false, amount: 0.7 }}
                            variants={sectionStagger}
                        >
                            <div className="container mx-auto px-4 sm:px-6">
                                <div className="grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
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

                <section className="about-section container mx-auto grid items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={slideLeftStrong}
                    >
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                            {aboutLabel}
                        </span>
                        <h2 className="font-heading mt-5 text-3xl leading-tight font-extrabold text-foreground sm:text-4xl md:text-5xl">
                            {aboutTitle}
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                            {aboutDescription}
                        </p>
                        <motion.div
                            className="mt-6 flex flex-wrap gap-3"
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
                                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm"
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
                                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-all hover:scale-105 hover:bg-foreground/85 active:scale-95"
                            >
                                {aboutCta}
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="relative h-72 sm:h-80 md:h-96"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={slideRightStrong}
                    >
                        <motion.img
                            src={aboutPrimaryImage}
                            alt={aboutTitle}
                            className="h-full w-full rounded-3xl object-cover shadow-2xl sm:w-3/4"
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.35 }}
                        />
                        <motion.img
                            src={aboutSecondaryImage}
                            alt={aboutTitle}
                            className="absolute right-0 -bottom-6 w-2/3 rounded-2xl border-4 border-background shadow-2xl sm:w-1/2 sm:border-8"
                            initial={{
                                opacity: 0,
                                y: 40,
                                scale: 0.86,
                                rotate: -4,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                rotate: 0,
                            }}
                            viewport={viewport}
                            transition={{
                                type: 'spring',
                                stiffness: 120,
                                damping: 16,
                                delay: 0.18,
                            }}
                        />
                        <motion.div
                            className="absolute top-[-1rem] right-4 flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 shadow-lg shadow-primary/30 sm:right-8"
                            initial={{ opacity: 0, scale: 0.84, y: 24 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={viewport}
                            transition={{
                                type: 'spring',
                                stiffness: 140,
                                damping: 14,
                                delay: 0.28,
                            }}
                        >
                            <CheckCircle className="h-4 w-4 text-white" />
                            <span className="text-xs font-bold text-white">
                                {locale === 'id'
                                    ? 'Terpercaya Sejak 2009'
                                    : 'Trusted Since 2009'}
                            </span>
                        </motion.div>
                    </motion.div>
                </section>

                <section className="packages-section bg-secondary/30 py-20 sm:py-24">
                    <motion.div
                        className="container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <motion.div variants={slideLeftStrong}>
                                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                                    {locale === 'id'
                                        ? 'Pilihan Terbaik'
                                        : 'Best Picks'}
                                </span>
                                <h2 className="font-heading mt-3 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                                    {packagesTitle}
                                </h2>
                            </motion.div>
                            <motion.div
                                className="flex gap-2"
                                variants={slideRightStrong}
                            >
                                <button
                                    onClick={() => handleScroll('left')}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:scale-110 hover:border-primary hover:text-primary"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => handleScroll('right')}
                                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:scale-110 hover:border-primary hover:text-primary"
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
                                    <motion.img
                                        src={pkg.image}
                                        alt={pkg.title}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.08 }}
                                        transition={{ duration: 0.55 }}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                    {index === 0 ? (
                                        <motion.div
                                            className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow"
                                            initial={{
                                                scale: 0.72,
                                                opacity: 0,
                                            }}
                                            whileInView={{
                                                scale: 1,
                                                opacity: 1,
                                            }}
                                            viewport={viewport}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 180,
                                                damping: 12,
                                                delay: 0.12,
                                            }}
                                        >
                                            {locale === 'id'
                                                ? 'Terlaris'
                                                : 'Best Seller'}
                                        </motion.div>
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
                                            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                                                <Clock className="h-3 w-3" />
                                                {pkg.duration}
                                            </div>
                                        </div>
                                        <motion.div
                                            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold"
                                            initial={{
                                                opacity: 0,
                                                y: 18,
                                                scale: 0.94,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            whileHover={{ x: 4, scale: 1.03 }}
                                            viewport={viewport}
                                            transition={{
                                                duration: 0.45,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        >
                                            {locale === 'id'
                                                ? 'Lihat Detail'
                                                : 'View Detail'}
                                            <ArrowRightIcon className="h-3 w-3" />
                                        </motion.div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                        <div className="w-2 shrink-0" />
                    </motion.div>
                </section>

                <section className="services-section container mx-auto grid items-start gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
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
                </section>

                {latestArticles.length > 0 ? (
                    <section className="container mx-auto px-4 py-20 sm:px-6 sm:py-24">
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

                <section className="gallery-section bg-foreground py-20 sm:py-24">
                    <motion.div
                        className="container mx-auto px-4 sm:px-6"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <motion.div variants={slideLeftStrong}>
                                <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-white/60 uppercase">
                                    {locale === 'id'
                                        ? 'Momen Bersama'
                                        : 'Our Moments'}
                                </span>
                                <h2 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
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
                            className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:gap-4 md:auto-rows-[190px] md:grid-cols-4"
                            variants={sectionStagger}
                        >
                            {galleryImages.map((image, index) => {
                                const spans = [
                                    'md:col-span-2 md:row-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                    'md:col-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                ];

                                return (
                                    <motion.div
                                        key={index}
                                        className={`gallery-item group relative overflow-hidden rounded-2xl bg-white/5 ${spans[index % spans.length]}`}
                                        variants={cardBurst}
                                    >
                                        <motion.img
                                            src={image.src}
                                            alt={image.alt}
                                            className="absolute inset-0 h-full w-full object-cover"
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <p className="text-xs font-semibold text-white drop-shadow">
                                                {image.alt}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </section>

                <section className="faq-section container mx-auto px-4 py-20 sm:px-6 sm:py-24">
                    <motion.div
                        className="mx-auto max-w-2xl text-center"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        <motion.span
                            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase"
                            variants={slideUpStrong}
                        >
                            FAQ
                        </motion.span>
                        <motion.h2
                            className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl"
                            variants={slideUpStrong}
                        >
                            {faqTitle}
                        </motion.h2>
                        <motion.p
                            className="mt-4 text-base text-muted-foreground"
                            variants={slideUpStrong}
                        >
                            {faqDescription}
                        </motion.p>
                    </motion.div>
                    <motion.div
                        className="mx-auto mt-12 max-w-3xl space-y-3"
                        initial="hidden"
                        whileInView="show"
                        viewport={viewport}
                        variants={sectionStagger}
                    >
                        {faqItems.map((item, index) => (
                            <motion.div
                                key={`${item.question}_${index}`}
                                className="faq-item overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                                variants={cardBurst}
                            >
                                <button
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    onClick={() =>
                                        setOpenFaq(
                                            openFaq === index ? null : index,
                                        )
                                    }
                                >
                                    <span className="text-sm font-semibold text-foreground">
                                        {item.question}
                                    </span>
                                    <motion.span
                                        animate={{
                                            rotate: openFaq === index ? 45 : 0,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 220,
                                            damping: 18,
                                        }}
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted-foreground ${openFaq === index ? 'border-primary bg-primary/10 text-primary' : ''}`}
                                    >
                                        +
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === index ? (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: 'auto',
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.28,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <motion.p
                                                initial={{ y: -8, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -8, opacity: 0 }}
                                                transition={{ duration: 0.22 }}
                                                className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground"
                                            >
                                                {item.answer}
                                            </motion.p>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {hasContactPanel ? (
                    <section className="contact-section container mx-auto px-4 pb-20 sm:px-6 sm:pb-24">
                        <motion.div
                            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-foreground via-foreground to-primary px-6 py-12 text-background shadow-2xl sm:px-10 sm:py-14 lg:px-14"
                            initial={{ opacity: 0, y: 56, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={viewport}
                            transition={{
                                duration: 0.85,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <div className="absolute top-[-5rem] right-[-5rem] h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                            <div className="absolute bottom-[-5rem] left-[-5rem] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                                <motion.div
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={viewport}
                                    variants={sectionStagger}
                                >
                                    <motion.span
                                        className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-background/60 uppercase"
                                        variants={slideUpStrong}
                                    >
                                        {contactLabel}
                                    </motion.span>
                                    <motion.h2
                                        className="font-heading mt-5 text-3xl leading-tight font-extrabold sm:text-4xl md:text-5xl"
                                        variants={slideUpStrong}
                                    >
                                        {contactTitle}
                                    </motion.h2>
                                    <motion.p
                                        className="mt-4 text-base leading-relaxed text-background/65"
                                        variants={slideUpStrong}
                                    >
                                        {contactDescription}
                                    </motion.p>
                                    <motion.div
                                        className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                                        variants={heroStagger}
                                    >
                                        {whatsappLink ? (
                                            <motion.a
                                                href={whatsappLink}
                                                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                                variants={slideUpStrong}
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                {contactWhatsapp}
                                            </motion.a>
                                        ) : null}
                                        <motion.div variants={slideUpStrong}>
                                            <Link
                                                href="/kontak"
                                                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-background/30 px-6 py-3.5 text-sm font-bold text-background/85 transition-all hover:scale-105 hover:border-background/60 hover:bg-background/10 active:scale-95"
                                            >
                                                {contactFull}
                                                <ArrowRightIcon className="h-4 w-4" />
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                                <motion.div
                                    className="grid gap-4 rounded-2xl bg-white/8 p-6 backdrop-blur-sm"
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={viewport}
                                    variants={sectionStagger}
                                >
                                    {contactInfoItems.map(
                                        ({ icon: Icon, label, value }) => (
                                            <motion.div
                                                key={label}
                                                className="flex items-center gap-4 text-sm text-background/80"
                                                variants={cardBurst}
                                            >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <div>
                                                    <p className="text-xs tracking-widest text-background/45 uppercase">
                                                        {label}
                                                    </p>
                                                    <p className="font-semibold">
                                                        {value}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ),
                                    )}
                                    {contactSocials.length > 0 ? (
                                        <motion.div
                                            className="pt-2"
                                            variants={slideUpStrong}
                                        >
                                            <p className="text-xs tracking-widest text-background/45 uppercase">
                                                {locale === 'id'
                                                    ? 'Sosial Media'
                                                    : 'Social Media'}
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
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
                                                                className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 text-xs font-semibold text-background/75 transition-all hover:scale-105 hover:border-background/50 hover:bg-background/10"
                                                                variants={
                                                                    cardBurst
                                                                }
                                                            >
                                                                <Icon className="h-3.5 w-3.5" />
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
