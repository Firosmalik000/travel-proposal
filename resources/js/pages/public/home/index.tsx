import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, Clock, MapPin as MapPinIcon, Shield, Star, Users } from 'lucide-react';
import { usePublicLocale } from '@/contexts/public-locale';
import { type SharedData } from '@/types';
import { formatPrice, localize, usePublicData, usePublicPageContent, whatsappLinkFromPhone } from '@/lib/public-content';

gsap.registerPlugin(ScrollTrigger);

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


export default function Home() {
    const { locale } = usePublicLocale();
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const publicData = usePublicData();
    const homePage = usePublicPageContent('home');
    const mainRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const heroLabel = localize(homePage?.content?.hero?.label, locale);
    const heroTitle = localize(homePage?.content?.hero?.title, locale);
    const heroDescription = localize(homePage?.content?.hero?.description, locale);
    const heroImage = homePage?.content?.hero?.image || '/images/dummy.jpg';
    const aboutTitle = localize(homePage?.content?.about?.title, locale);
    const aboutDescription = localize(homePage?.content?.about?.description, locale);
    const aboutCta = localize(homePage?.content?.about?.cta, locale);
    const aboutLabel = localize(homePage?.content?.about?.label, locale);
    const aboutPrimaryImage = homePage?.content?.about?.image_primary || '/images/dummy.jpg';
    const aboutSecondaryImage = homePage?.content?.about?.image_secondary || '/images/dummy.jpg';
    const packagesTitle = localize(homePage?.content?.packages?.title, locale);
    const pricePrefix = localize(homePage?.content?.packages?.price_prefix, locale);
    const servicesLabel = localize(homePage?.content?.services?.label, locale);
    const servicesTitle = localize(homePage?.content?.services?.title, locale);
    const servicesDescription = localize(homePage?.content?.services?.description, locale);
    const galleryTitle = localize(homePage?.content?.gallery?.title, locale);
    const galleryDescription = localize(homePage?.content?.gallery?.description, locale);
    const faqTitle = localize(homePage?.content?.faq?.title, locale);
    const faqDescription = localize(homePage?.content?.faq?.description, locale);
    const contactLabel = localize(homePage?.content?.contact?.label, locale);
    const contactTitle = localize(homePage?.content?.contact?.title, locale);
    const contactDescription = localize(homePage?.content?.contact?.description, locale);
    const contactWhatsapp = localize(homePage?.content?.contact?.whatsapp_label, locale);
    const contactFull = localize(homePage?.content?.contact?.contact_label, locale);
    const contactPhone = seo.contact?.phone ?? '';
    const contactEmail = seo.contact?.email ?? '';
    const contactAddress = localize(seo.contact?.address?.full, locale);
    const contactSocials = Array.isArray(seo.contact?.socials) ? seo.contact.socials : [];
    const whatsappLink = whatsappLinkFromPhone(seo.contact?.phone);
    const stats: StatItem[] = Array.isArray(homePage?.content?.stats) && homePage.content.stats.length > 0
        ? homePage.content.stats.map((item: Record<string, unknown>) => ({
            value: String(item.value ?? ''),
            label: localize(item.label, locale),
        }))
        : [];
    const packageItems: PackageItem[] = Array.isArray(publicData.packages) && publicData.packages.length > 0
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
        return Array.isArray(publicData.services) && publicData.services.length > 0
            ? publicData.services.map((item: Record<string, any>, index: number) => ({
                number: String(index + 1).padStart(2, '0'),
                title: localize(item.title, locale),
                description: localize(item.description, locale),
            }))
            : [];
    })();
    const landingGalleryImages = Array.isArray(homePage?.content?.gallery?.images) && homePage.content.gallery.images.length > 0
        ? homePage.content.gallery.images
            .map((item: Record<string, any>) => ({
                src: item?.src || '/images/dummy.jpg',
                alt: localize(item?.alt, locale, galleryTitle),
            }))
            .filter((item: GalleryImage) => Boolean(item.src))
        : [];
    const galleryImages: GalleryImage[] = landingGalleryImages.length > 0
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
    const faqItems: FaqItem[] = customFaqItems.length > 0
        ? customFaqItems
        : Array.isArray(publicData.faqs) && publicData.faqs.length > 0
        ? publicData.faqs.map((item: Record<string, unknown>) => ({
            question: localize(item.question, locale),
            answer: localize(item.answer, locale),
        }))
        : [];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // -- Hero: stagger badge ? h1 ? p ? buttons
            const heroTl = gsap.timeline({ delay: 0.2 });
            heroTl
                .from('.hero-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'back.out(1.7)' })
                .from('.hero-title', { opacity: 0, y: 60, duration: 0.9, ease: 'power4.out' }, '-=0.3')
                .from('.hero-desc', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' }, '-=0.5')
                .from('.hero-cta', { opacity: 0, y: 20, stagger: 0.15, duration: 0.6, ease: 'power3.out' }, '-=0.4')
                .from('.hero-stat', { opacity: 0, y: 30, stagger: 0.1, duration: 0.5, ease: 'power3.out' }, '-=0.3');

            // -- Hero parallax on scroll
            gsap.to('.hero-bg', {
                scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
                y: '30%',
                ease: 'none',
            });

            // -- Stats counter animation
            gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
                const raw = el.dataset.value ?? '';
                const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
                const suffix = raw.replace(/[0-9.]/g, '');
                if (!isNaN(num)) {
                    gsap.from({ val: 0 }, {
                        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
                        val: 0,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            el.textContent = Math.round((this as any).targets()[0].val) + suffix;
                        },
                        onComplete: () => { el.textContent = raw; },
                    });
                }
            });

            // -- About: slide left text, slide right image
            gsap.from('.about-text', {
                scrollTrigger: { trigger: '.about-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, x: -60, duration: 0.9, ease: 'power3.out', immediateRender: false,
            });
            gsap.from('.about-img-primary', {
                scrollTrigger: { trigger: '.about-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, x: 60, duration: 0.9, ease: 'power3.out', immediateRender: false,
            });
            gsap.from('.about-img-secondary', {
                scrollTrigger: { trigger: '.about-section', start: 'top 75%', toggleActions: 'play none none none' },
                opacity: 0, scale: 0.8, y: 40, duration: 0.8, ease: 'back.out(1.4)', delay: 0.3, immediateRender: false,
            });

            // -- Packages: stagger cards from bottom
            gsap.from('.pkg-card', {
                scrollTrigger: { trigger: '.packages-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, y: 80, stagger: 0.12, duration: 0.7, ease: 'power3.out', immediateRender: false,
            });

            // -- Services: label ? title ? desc ? cards stagger
            gsap.from('.services-header > *', {
                scrollTrigger: { trigger: '.services-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, y: 30, stagger: 0.15, duration: 0.7, ease: 'power3.out', immediateRender: false,
            });
            gsap.from('.service-card', {
                scrollTrigger: { trigger: '.services-section', start: 'top 75%', toggleActions: 'play none none none' },
                opacity: 0, y: 50, stagger: 0.1, duration: 0.6, ease: 'power3.out', immediateRender: false,
            });

            // -- Gallery: scale up stagger
            gsap.from('.gallery-item', {
                scrollTrigger: { trigger: '.gallery-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, scale: 0.85, stagger: 0.08, duration: 0.6, ease: 'back.out(1.2)', immediateRender: false,
            });

            // -- FAQ: slide from right stagger
            gsap.from('.faq-item', {
                scrollTrigger: { trigger: '.faq-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, x: 40, stagger: 0.1, duration: 0.6, ease: 'power3.out', immediateRender: false,
            });

            // -- Contact: scale up
            gsap.from('.contact-section > div', {
                scrollTrigger: { trigger: '.contact-section', start: 'top 80%', toggleActions: 'play none none none' },
                opacity: 0, scale: 0.95, y: 40, duration: 0.8, ease: 'power3.out', immediateRender: false,
            });
        }, mainRef);
        return () => ctx.revert();
    }, []);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };


    return (
        <PublicLayout>
            <Head title={localize(homePage?.title, locale)} />

            <main ref={mainRef} className="bg-background">
                {/* ── Hero ── */}
                <section className="hero-section relative min-h-[92vh] flex flex-col justify-end overflow-hidden">
                    <div className="hero-bg absolute inset-0">
                        <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/10" />
                        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/10 to-transparent" />
                    </div>
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-primary via-accent to-transparent" />

                    <div className="relative z-10 container mx-auto px-4 sm:px-6">
                        <div className="max-w-3xl py-24 sm:py-28 md:py-32">
                            <div className="hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-sm font-medium text-white">{heroLabel}</span>
                            </div>
                            <h1 className="hero-title font-heading text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                                {heroTitle}
                            </h1>
                            <p className="hero-desc mt-5 max-w-xl text-base text-white/70 sm:text-lg md:text-xl leading-relaxed">
                                {heroDescription}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/paket-umroh" className="hero-cta inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Lihat Paket Umroh' : 'View Umrah Packages'}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                                <Link href="/jadwal-keberangkatan" className="hero-cta inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Cek Jadwal' : 'Check Schedule'}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
                                {stats.map((stat: StatItem) => (
                                    <div key={stat.label} className="hero-stat px-6 py-5 text-center">
                                        <p className="stat-number font-heading text-2xl font-bold text-white sm:text-3xl" data-value={stat.value}>
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-white/55 sm:text-sm">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── About ── */}
                <section className="about-section container mx-auto grid items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
                    <div className="about-text">
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            {aboutLabel}
                        </span>
                        <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl leading-tight">
                            {aboutTitle}
                        </h2>
                        <p className="mt-5 text-base text-muted-foreground leading-relaxed">{aboutDescription}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {[
                                { icon: Shield, label: locale === 'id' ? 'Izin Resmi Kemenag' : 'Official License' },
                                { icon: Users, label: locale === 'id' ? '20K+ Jamaah' : '20K+ Pilgrims' },
                                { icon: Star, label: 'Rating 4.9/5' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                    {label}
                                </div>
                            ))}
                        </div>
                        <Link href="/tentang-kami" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-all hover:bg-foreground/85 hover:scale-105 active:scale-95">
                            {aboutCta}
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="relative h-72 sm:h-80 md:h-96">
                        <img src={aboutPrimaryImage} alt={aboutTitle} className="about-img-primary h-full w-full rounded-3xl object-cover shadow-2xl sm:w-3/4" />
                        <img src={aboutSecondaryImage} alt={aboutTitle} className="about-img-secondary absolute -bottom-6 right-0 w-2/3 rounded-2xl border-4 border-background shadow-2xl sm:w-1/2 sm:border-8" />
                        <div className="absolute -top-4 right-4 sm:right-8 flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 shadow-lg shadow-primary/30">
                            <CheckCircle className="h-4 w-4 text-white" />
                            <span className="text-xs font-bold text-white">{locale === 'id' ? 'Terpercaya Sejak 2009' : 'Trusted Since 2009'}</span>
                        </div>
                    </div>
                </section>

                {/* ── Packages ── */}
                <section className="packages-section py-20 sm:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                    {locale === 'id' ? 'Pilihan Terbaik' : 'Best Picks'}
                                </span>
                                <h2 className="font-heading mt-3 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">{packagesTitle}</h2>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleScroll('left')} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:border-primary hover:text-primary hover:scale-110">←</button>
                                <button onClick={() => handleScroll('right')} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-background text-foreground transition-all hover:border-primary hover:text-primary hover:scale-110">→</button>
                            </div>
                        </div>
                    </div>
                    <div ref={scrollContainerRef} className="flex gap-5 overflow-x-auto px-4 pb-4 sm:px-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="flex-shrink-0 w-2" />
                        {packageItems.map((pkg: PackageItem, i: number) => (
                            <Link key={pkg.title} href="/paket-umroh" className="pkg-card group relative h-[400px] w-64 flex-shrink-0 overflow-hidden rounded-3xl sm:h-[460px] sm:w-72 md:h-[480px] cursor-pointer">
                                <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                                {i === 0 && (
                                    <div className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
                                        {locale === 'id' ? 'Terlaris' : 'Best Seller'}
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <div className="flex items-center gap-1.5 text-xs text-white/70">
                                        <MapPinIcon className="h-3 w-3" />
                                        {pkg.destination}
                                    </div>
                                    <h3 className="font-heading mt-1.5 text-xl font-bold">{pkg.title}</h3>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-white/60">{pricePrefix}</p>
                                            <p className="text-lg font-extrabold text-accent">{pkg.price}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur-sm">
                                            <Clock className="h-3 w-3" />
                                            {pkg.duration}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                        {locale === 'id' ? 'Lihat Detail' : 'View Detail'}
                                        <ArrowRightIcon className="h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <div className="flex-shrink-0 w-2" />
                    </div>
                </section>

                {/* ── Services ── */}
                <section className="services-section container mx-auto grid items-start gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
                    <div className="services-header lg:sticky lg:top-24">
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">{servicesLabel}</span>
                        <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl leading-tight">{servicesTitle}</h2>
                        <p className="mt-5 text-base text-muted-foreground leading-relaxed">{servicesDescription}</p>
                        <Link href="/layanan" className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white hover:scale-105">
                            {locale === 'id' ? 'Semua Layanan' : 'All Services'}
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {serviceItems.map((item: ServiceItem) => (
                            <div key={item.number} className="service-card group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30">
                                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-150" />
                                <p className="font-heading text-4xl font-black text-primary/15 group-hover:text-primary/25 transition-colors">{item.number}</p>
                                <h3 className="font-heading mt-3 text-lg font-bold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Gallery ── */}
                <section className="gallery-section bg-foreground py-20 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/60">
                                    {locale === 'id' ? 'Momen Bersama' : 'Our Moments'}
                                </span>
                                <h2 className="font-heading mt-3 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">{galleryTitle}</h2>
                            </div>
                            <p className="max-w-xs text-sm text-white/50">{galleryDescription}</p>
                        </div>
                        <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:gap-4 md:auto-rows-[190px] md:grid-cols-4">
                            {galleryImages.map((img: GalleryImage, index: number) => {
                                const spans = ['md:col-span-2 md:row-span-2', 'md:col-span-1', 'md:col-span-1', 'md:col-span-2', 'md:col-span-1', 'md:col-span-1'];
                                return (
                                    <div key={index} className={`gallery-item group relative overflow-hidden rounded-2xl bg-white/5 ${spans[index % spans.length]}`}>
                                        <img src={img.src} alt={img.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <div className="absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <p className="text-xs font-semibold text-white drop-shadow">{img.alt}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="faq-section container mx-auto px-4 py-20 sm:px-6 sm:py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">FAQ</span>
                        <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">{faqTitle}</h2>
                        <p className="mt-4 text-base text-muted-foreground">{faqDescription}</p>
                    </div>
                    <div className="mx-auto mt-12 max-w-3xl space-y-3">
                        {faqItems.map((item: FaqItem, index: number) => (
                            <div key={`${item.question}_${index}`} className="faq-item overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                                <button className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <span className="text-sm font-semibold text-foreground">{item.question}</span>
                                    <span className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-border text-muted-foreground transition-all duration-300 ${openFaq === index ? 'rotate-45 border-primary text-primary bg-primary/10' : ''}`}>+</span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Contact ── */}
                <section className="contact-section container mx-auto px-4 pb-20 sm:px-6 sm:pb-24">
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-foreground via-foreground to-primary px-6 py-12 text-background shadow-2xl sm:px-10 sm:py-14 lg:px-14">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                            <div>
                                <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-background/60">{contactLabel}</span>
                                <h2 className="font-heading mt-5 text-3xl font-extrabold sm:text-4xl md:text-5xl leading-tight">{contactTitle}</h2>
                                <p className="mt-4 text-base text-background/65 leading-relaxed">{contactDescription}</p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <a href={whatsappLink} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                                        <MessageCircle className="h-4 w-4" />
                                        {contactWhatsapp}
                                    </a>
                                    <Link href="/kontak" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-background/30 px-6 py-3.5 text-sm font-bold text-background/85 transition-all hover:border-background/60 hover:bg-background/10 hover:scale-105 active:scale-95">
                                        {contactFull}
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                            <div className="grid gap-4 rounded-2xl bg-white/8 p-6 backdrop-blur-sm">
                                {[
                                    { icon: Phone, label: locale === 'id' ? 'Telepon' : 'Phone', value: contactPhone },
                                    { icon: Mail, label: locale === 'id' ? 'Email' : 'Email', value: contactEmail },
                                    { icon: MapPin, label: locale === 'id' ? 'Alamat Kantor' : 'Office Address', value: contactAddress },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-4 text-sm text-background/80">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-background/45">{label}</p>
                                            <p className="font-semibold">{value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <p className="text-xs uppercase tracking-widest text-background/45">{locale === 'id' ? 'Sosial Media' : 'Social Media'}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {(contactSocials.length > 0 ? contactSocials : [
                                            { label: 'Instagram', url: 'https://instagram.com/asfartour' },
                                            { label: 'YouTube', url: 'https://youtube.com/@asfartour' },
                                        ]).map((social: Record<string, unknown>, index: number) => {
                                            const icons = [Instagram, Facebook, Youtube, Twitter];
                                            const Icon = icons[index % icons.length];
                                            return (
                                                <a key={`${social.label}_${index}`} href={String(social.url ?? '#')} rel="noreferrer" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 text-xs font-semibold text-background/75 transition-all hover:border-background/50 hover:bg-background/10 hover:scale-105">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {String(social.label ?? `Social ${index + 1}`)}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
