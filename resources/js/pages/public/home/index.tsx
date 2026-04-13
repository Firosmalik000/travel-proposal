import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePage } from '@inertiajs/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

const content = {
    id: {
        pageTitle: ':brand - Umroh Profesional & Terpercaya',
        hero: {
            label: ':brand',
            title: 'Jelajahi Tanah Suci',
            desc: 'Pengalaman ibadah umroh yang khusyuk, nyaman, dan tak terlupakan dengan layanan profesional.',
            imageAlt: 'Kaaba',
        },
        stats: [
            { value: '15+', label: 'Tahun Melayani' },
            { value: '98%', label: 'Kepuasan Jamaah' },
            { value: '20K+', label: 'Jamaah Berangkat' },
            { value: '50+', label: 'Mitra Terpercaya' },
        ],
        about: {
            label: 'Tentang Kami',
            title: 'Mengakselerasi Perubahan dengan Pelayanan Terbaik',
            desc: 'Kami adalah travel umroh yang berizin resmi dan terpercaya, berkomitmen untuk membawa standar baru dalam industri dengan mengutamakan transparansi, kenyamanan, dan bimbingan ibadah yang berkualitas.',
            cta: 'Baca Selengkapnya',
            imageAltOne: 'Islamic Architecture',
            imageAltTwo: 'Jamaah',
        },
        packages: {
            title: 'Paket Unggulan',
            pricePrefix: 'Mulai',
            items: [
                {
                    title: 'Paket Silver',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: '29,9 Jt',
                    duration: '9 Hari',
                },
                {
                    title: 'Paket Gold',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: '38,5 Jt',
                    duration: '12 Hari',
                },
                {
                    title: 'Paket Platinum',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: 'Call Us',
                    duration: 'by Request',
                },
                {
                    title: 'Umroh Plus Turki',
                    destination: 'Makkah, Madinah, Istanbul',
                    image: '/images/dummy.jpg',
                    price: '45 Jt',
                    duration: '14 Hari',
                },
            ],
        },
        services: {
            label: 'Layanan Kami',
            title: 'Apa yang Kami Tawarkan?',
            desc: 'Kami menyediakan layanan umroh yang lengkap dan terintegrasi untuk memastikan perjalanan ibadah Anda berjalan lancar, aman, dan penuh makna.',
            items: [
                {
                    number: '01',
                    title: 'Legalitas Terjamin',
                    description: 'Kami adalah travel berizin resmi Kemenag, memastikan keamanan dan kepastian keberangkatan Anda.',
                },
                {
                    number: '02',
                    title: 'Pembimbing Profesional',
                    description: 'Dibimbing oleh ustadz berpengalaman dan amanah yang siap mendampingi ibadah Anda dari awal hingga akhir.',
                },
                {
                    number: '03',
                    title: 'Akomodasi Terbaik',
                    description: 'Pilihan hotel bintang 4 & 5 yang strategis dekat Masjidil Haram dan Masjid Nabawi.',
                },
                {
                    number: '04',
                    title: 'Layanan Menyeluruh',
                    description: 'Kami urus semua kebutuhan Anda: visa, tiket pesawat, manasik, hingga perlengkapan umroh.',
                },
            ],
        },
        gallery: {
            title: 'Galeri Perjalanan',
            desc: 'Momen-momen tak terlupakan bersama jamaah :brand.',
            images: [
                { src: '/images/dummy.jpg', alt: 'Detail arsitektur Masjid Nabawi' },
                { src: '/images/dummy.jpg', alt: 'Pemandangan kota Madinah' },
                { src: '/images/dummy.jpg', alt: 'Jamaah sedang berdoa' },
                { src: '/images/dummy.jpg', alt: 'Anak-anak di pelataran masjid' },
                { src: '/images/dummy.jpg', alt: 'Suasana malam di Masjid' },
                { src: '/images/dummy.jpg', alt: 'Interior Masjid yang megah' },
            ],
        },
        faq: {
            title: 'Pertanyaan yang Sering Ditanyakan',
            desc: 'Jawaban singkat untuk hal-hal yang paling sering ditanyakan calon jamaah.',
            items: [
                {
                    question: 'Biaya paket umroh sudah termasuk apa saja?',
                    answer: 'Umumnya sudah termasuk tiket, hotel, visa, konsumsi, transportasi, manasik, dan pendamping ibadah.',
                },
                {
                    question: 'Dokumen apa yang perlu disiapkan?',
                    answer: 'Biasanya paspor, KTP, KK, foto, dan dokumen tambahan lain jika ada kebutuhan khusus.',
                },
                {
                    question: 'Apakah tersedia cicilan atau pembayaran bertahap?',
                    answer: 'Bisa disesuaikan dengan kebijakan pembayaran yang berlaku pada package yang dipilih.',
                },
            ],
        },
        contact: {
            label: 'Kontak Cepat',
            title: 'Siap berangkat? Konsultasi gratis dulu.',
            desc: 'Tim :brand siap membantu memilih paket terbaik, jadwal keberangkatan, dan kebutuhan dokumen Anda.',
            whatsapp: 'Konsultasi WhatsApp',
            fullContact: 'Lihat Kontak Lengkap',
            phoneLabel: 'Telepon',
            emailLabel: 'Email',
            addressLabel: 'Alamat Kantor',
            socialLabel: 'Sosial Media',
        },
    },
    en: {
        pageTitle: ':brand - Professional & Trusted Umrah',
        hero: {
            label: ':brand',
            title: 'Journey to the Holy Land',
            desc: 'A focused, comfortable, and memorable umrah experience with professional guidance.',
            imageAlt: 'Kaaba',
        },
        stats: [
            { value: '15+', label: 'Years of Service' },
            { value: '98%', label: 'Pilgrim Satisfaction' },
            { value: '20K+', label: 'Pilgrims Departed' },
            { value: '50+', label: 'Trusted Partners' },
        ],
        about: {
            label: 'About Us',
            title: 'Raising the Bar with Trusted Service',
            desc: 'We are a licensed and trusted umrah travel partner, committed to higher standards through transparency, comfort, and quality guidance.',
            cta: 'Read More',
            imageAltOne: 'Islamic Architecture',
            imageAltTwo: 'Pilgrims',
        },
        packages: {
            title: 'Featured Packages',
            pricePrefix: 'From',
            items: [
                {
                    title: 'Silver Package',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: '29.9 M',
                    duration: '9 Days',
                },
                {
                    title: 'Gold Package',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: '38.5 M',
                    duration: '12 Days',
                },
                {
                    title: 'Platinum Package',
                    destination: 'Makkah & Madinah',
                    image: '/images/dummy.jpg',
                    price: 'Call Us',
                    duration: 'By Request',
                },
                {
                    title: 'Umrah + Turkey',
                    destination: 'Makkah, Madinah, Istanbul',
                    image: '/images/dummy.jpg',
                    price: '45 M',
                    duration: '14 Days',
                },
            ],
        },
        services: {
            label: 'Our Services',
            title: 'What We Offer',
            desc: 'We deliver a complete and integrated umrah service to keep your journey smooth, safe, and meaningful.',
            items: [
                {
                    number: '01',
                    title: 'Verified Licenses',
                    description: 'Officially licensed by the Ministry of Religious Affairs for secure departures.',
                },
                {
                    number: '02',
                    title: 'Professional Guides',
                    description: 'Experienced ustadz and mentors support your worship from start to finish.',
                },
                {
                    number: '03',
                    title: 'Top Accommodations',
                    description: 'Carefully selected 4-5 star hotels near Masjid al-Haram and Masjid Nabawi.',
                },
                {
                    number: '04',
                    title: 'All-in Service',
                    description: 'We handle visas, flights, manasik, and essential kits for your umrah.',
                },
            ],
        },
        gallery: {
            title: 'Travel Gallery',
            desc: 'Memorable moments with :brand pilgrims.',
            images: [
                { src: '/images/dummy.jpg', alt: 'Masjid Nabawi architecture detail' },
                { src: '/images/dummy.jpg', alt: 'Madinah city view' },
                { src: '/images/dummy.jpg', alt: 'Pilgrims praying' },
                { src: '/images/dummy.jpg', alt: 'Children at the mosque courtyard' },
                { src: '/images/dummy.jpg', alt: 'Night atmosphere at the mosque' },
                { src: '/images/dummy.jpg', alt: 'Grand mosque interior' },
            ],
        },
        faq: {
            title: 'Frequently Asked Questions',
            desc: 'Short answers to the questions prospective pilgrims ask most often.',
            items: [
                {
                    question: 'What is usually included in the umrah package price?',
                    answer: 'It usually covers flights, hotel, visa, meals, transportation, manasik, and worship assistance.',
                },
                {
                    question: 'Which documents should be prepared?',
                    answer: 'Usually a passport, ID card, family card, photo, and any additional documents for special cases.',
                },
                {
                    question: 'Is installment payment available?',
                    answer: 'It can be adjusted based on the payment policy of the selected package.',
                },
            ],
        },
        contact: {
            label: 'Quick Contact',
            title: 'Ready to go? Get a free consultation.',
            desc: 'Our team helps you pick the right package, schedule, and documents with clarity.',
            whatsapp: 'WhatsApp Consultation',
            fullContact: 'View Full Contact',
            phoneLabel: 'Phone',
            emailLabel: 'Email',
            addressLabel: 'Office Address',
            socialLabel: 'Social Media',
        },
    },
};

export default function Home() {
    const { locale } = usePublicLocale();
    const { branding, seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const publicData = usePublicData();
    const homePage = usePublicPageContent('home');
    const t = JSON.parse(JSON.stringify(content[locale]).replaceAll(':brand', branding.company_name));
    const mainRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const heroLabel = localize(homePage?.content?.hero?.label, locale, t.hero.label);
    const heroTitle = localize(homePage?.content?.hero?.title, locale, t.hero.title);
    const heroDescription = localize(homePage?.content?.hero?.description, locale, t.hero.desc);
    const heroImage = homePage?.content?.hero?.image || '/images/dummy.jpg';
    const aboutTitle = localize(homePage?.content?.about?.title, locale, t.about.title);
    const aboutDescription = localize(homePage?.content?.about?.description, locale, t.about.desc);
    const aboutCta = localize(homePage?.content?.about?.cta, locale, t.about.cta);
    const aboutLabel = localize(homePage?.content?.about?.label, locale, t.about.label);
    const aboutPrimaryImage = homePage?.content?.about?.image_primary || '/images/dummy.jpg';
    const aboutSecondaryImage = homePage?.content?.about?.image_secondary || '/images/dummy.jpg';
    const packagesTitle = localize(homePage?.content?.packages?.title, locale, t.packages.title);
    const pricePrefix = localize(homePage?.content?.packages?.price_prefix, locale, t.packages.pricePrefix);
    const servicesLabel = localize(homePage?.content?.services?.label, locale, t.services.label);
    const servicesTitle = localize(homePage?.content?.services?.title, locale, t.services.title);
    const servicesDescription = localize(homePage?.content?.services?.description, locale, t.services.desc);
    const galleryTitle = localize(homePage?.content?.gallery?.title, locale, t.gallery.title);
    const galleryDescription = localize(homePage?.content?.gallery?.description, locale, t.gallery.desc);
    const faqTitle = localize(homePage?.content?.faq?.title, locale, t.faq.title);
    const faqDescription = localize(homePage?.content?.faq?.description, locale, t.faq.desc);
    const contactLabel = localize(homePage?.content?.contact?.label, locale, t.contact.label);
    const contactTitle = localize(homePage?.content?.contact?.title, locale, t.contact.title);
    const contactDescription = localize(homePage?.content?.contact?.description, locale, t.contact.desc);
    const contactWhatsapp = localize(homePage?.content?.contact?.whatsapp_label, locale, t.contact.whatsapp);
    const contactFull = localize(homePage?.content?.contact?.contact_label, locale, t.contact.fullContact);
    const contactPhone = seo.contact?.phone ?? '(021) 555-1234';
    const contactEmail = seo.contact?.email ?? 'info@asfartour.co.id';
    const contactAddress = localize(seo.contact?.address?.full, locale, 'Jl. Asfar No. 12, Jakarta Pusat');
    const contactSocials = Array.isArray(seo.contact?.socials) ? seo.contact.socials : [];
    const whatsappLink = whatsappLinkFromPhone(seo.contact?.phone);
    const stats: StatItem[] = Array.isArray(homePage?.content?.stats) && homePage.content.stats.length > 0
        ? homePage.content.stats.map((item: Record<string, unknown>) => ({
            value: String(item.value ?? ''),
            label: localize(item.label, locale),
        }))
        : t.stats;
    const packageItems: PackageItem[] = Array.isArray(publicData.packages) && publicData.packages.length > 0
        ? publicData.packages.map((pkg: Record<string, any>) => ({
            title: localize(pkg.name, locale),
            destination: pkg.departure_city,
            image: pkg.image_path || '/images/dummy.jpg',
            price: formatPrice(pkg.price, locale, pkg.currency),
            duration: `${pkg.duration_days} ${locale === 'id' ? 'Hari' : 'Days'}`,
        }))
        : t.packages.items;
    const serviceItems: ServiceItem[] = Array.isArray(publicData.services) && publicData.services.length > 0
        ? publicData.services.map((item: Record<string, any>, index: number) => ({
            number: String(index + 1).padStart(2, '0'),
            title: localize(item.title, locale),
            description: localize(item.description, locale),
        }))
        : t.services.items;
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
        : t.gallery.images;
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
        : t.faq.items;

    useEffect(() => {
        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray('.fade-in-section');
            sections.forEach((section: any) => {
                gsap.from(section, {
                    scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' },
                    opacity: 0,
                    y: 40,
                    duration: 1,
                    ease: 'power3.out',
                });
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
            <Head title={t.pageTitle} />

            <main ref={mainRef} className="bg-background pt-6 sm:pt-8">
                {/* Hero Section */}
                <section className="container mx-auto px-4 sm:px-6 fade-in-section">
                    <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-white via-white to-secondary/45 p-6 shadow-[0_24px_70px_-40px_rgba(122,21,32,0.22)] sm:p-8 md:p-12 lg:flex-row lg:p-16">
                        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-radial-[circle_at_top_right] from-secondary/45 via-secondary/10 to-transparent lg:block" />
                        <div className="relative z-10 lg:w-1/2 text-foreground">
                            <p className="font-medium text-primary">{heroLabel}</p>
                            <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl">
                                {heroTitle}
                            </h1>
                            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                                {heroDescription}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/paket-umroh"
                                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                                >
                                    {locale === 'id' ? 'Lihat Paket Umroh' : 'View Umrah Packages'}
                                </Link>
                                <Link
                                    href="/jadwal-keberangkatan"
                                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                                >
                                    {locale === 'id' ? 'Cek Jadwal' : 'Check Schedule'}
                                </Link>
                            </div>
                        </div>
                        <div className="relative mt-2 h-56 w-full sm:mt-6 sm:h-64 md:h-72 lg:mt-0 lg:h-auto lg:w-1/2">
                            <img
                                src={heroImage}
                                alt={t.hero.imageAlt}
                                className="h-full w-full rounded-2xl object-cover shadow-2xl lg:absolute lg:-right-1/4 lg:top-1/2 lg:h-auto lg:max-w-2xl lg:-translate-y-1/2"
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="container mx-auto px-4 sm:px-6 py-14 sm:py-16 md:py-20 fade-in-section">
                    <div className="grid grid-cols-2 gap-6 text-center sm:gap-8 md:grid-cols-4">
                        {stats.map((stat: StatItem) => (
                            <div key={stat.label}>
                                <p className="font-heading text-3xl font-bold text-primary sm:text-4xl md:text-5xl">{stat.value}</p>
                                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Introduction Section */}
                <section className="container mx-auto grid items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 md:gap-12 md:py-20 lg:grid-cols-2 fade-in-section">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium uppercase tracking-wider">{aboutLabel}</p>
                        <h2 className="font-heading mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                            {aboutTitle}
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                            {aboutDescription}
                        </p>
                        <Link
                            href="/tentang-kami"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition hover:bg-muted sm:w-auto"
                        >
                            {aboutCta}
                        </Link>
                    </div>
                    <div className="relative h-64 sm:h-72 md:h-80">
                        <img src={aboutPrimaryImage} alt={t.about.imageAltOne} className="h-full w-full rounded-2xl object-cover shadow-lg sm:w-2/3" />
                        <img
                            src={aboutSecondaryImage}
                            alt={t.about.imageAltTwo}
                            className="absolute bottom-0 right-0 w-2/3 rounded-2xl border-4 border-background shadow-xl sm:w-1/2 sm:border-8 md:translate-y-1/4"
                        />
                    </div>
                </section>

                {/* Packages Section */}
                <section className="py-14 sm:py-16 md:py-20 fade-in-section">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{packagesTitle}</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleScroll('left')}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
                                >
                                    &larr;
                                </button>
                                <button
                                    onClick={() => handleScroll('right')}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-muted"
                                >
                                    &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto px-4 sm:px-6"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex-shrink-0 w-4 md:w-auto" />
                        {packageItems.map((pkg: PackageItem) => (
                            <div
                                key={pkg.title}
                                className="group relative h-[360px] w-64 flex-shrink-0 overflow-hidden rounded-3xl sm:h-[420px] sm:w-72 md:h-[450px]"
                            >
                                <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <p className="text-sm">{pkg.destination}</p>
                                    <h3 className="font-heading mt-1 text-xl font-bold">{pkg.title}</h3>
                                    <p className="mt-2 text-sm">
                                        {pricePrefix} {pkg.price} / {pkg.duration}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="flex-shrink-0 w-4 md:w-auto" />
                    </div>
                </section>

                {/* Services Section */}
                <section className="container mx-auto grid items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 md:gap-12 md:py-20 md:grid-cols-2 fade-in-section">
                    <div>
                        <p className="font-medium uppercase tracking-wider text-muted-foreground">{servicesLabel}</p>
                        <h2 className="font-heading mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                            {servicesTitle}
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                            {servicesDescription}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {serviceItems.map((item: ServiceItem) => (
                            <div key={item.number} className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                                <p className="font-heading text-2xl font-bold text-primary/40">{item.number}</p>
                                <h3 className="font-heading mt-4 text-lg font-bold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Section */}
                <section className="bg-secondary/18 py-16 sm:py-20 md:py-24 fade-in-section">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{galleryTitle}</h2>
                            <p className="mt-3 text-base text-muted-foreground">{galleryDescription}</p>
                        </div>
                        <div className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[150px] sm:gap-4 md:auto-rows-[180px] md:grid-cols-4 lg:auto-rows-[200px]">
                            {galleryImages.map((img: GalleryImage, index: number) => {
                                const spans = [
                                    'md:col-span-2 md:row-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                    'md:col-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                ];
                                return (
                                    <div key={index} className={`group relative overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg ${spans[index % spans.length]}`}>
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20 md:py-24 fade-in-section">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{faqTitle}</h2>
                        <p className="mt-3 text-base text-muted-foreground">{faqDescription}</p>
                    </div>

                    <div className="mx-auto mt-10 grid max-w-4xl gap-3">
                        {faqItems.map((item: FaqItem, index: number) => (
                            <details key={`${item.question}_${index}`} className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                                <summary className="cursor-pointer text-sm font-semibold text-foreground">{item.question}</summary>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24 fade-in-section">
                    <div className="grid gap-8 rounded-3xl bg-linear-to-br from-foreground via-foreground to-primary px-6 py-8 text-background shadow-2xl sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-background/70">{contactLabel}</p>
                            <h2 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">{contactTitle}</h2>
                            <p className="mt-3 text-background/70 leading-relaxed">
                                {contactDescription}
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href={whatsappLink}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground sm:w-auto"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    {contactWhatsapp}
                                </a>
                                <Link
                                    href="/kontak"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-background/40 px-5 py-3 text-xs font-semibold text-background/90 transition hover:border-background/70 hover:bg-background/10 sm:w-auto"
                                >
                                    {contactFull}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 rounded-2xl bg-background/10 p-5 sm:p-6">
                            <div className="flex items-center gap-3 text-sm text-background/80">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
                                    <Phone className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.phoneLabel}</p>
                                    <p className="font-semibold">{contactPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-background/80">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.emailLabel}</p>
                                    <p className="font-semibold">{contactEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-background/80">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.addressLabel}</p>
                                    <p className="font-semibold">{contactAddress}</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.socialLabel}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-background/80">
                                    {(contactSocials.length > 0 ? contactSocials : [
                                        { label: 'Instagram', url: 'https://instagram.com/asfartour' },
                                        { label: 'YouTube', url: 'https://youtube.com/@asfartour' },
                                    ]).map((social: Record<string, unknown>, index: number) => {
                                        const icons = [Instagram, Facebook, Youtube, Twitter];
                                        const Icon = icons[index % icons.length];

                                        return (
                                            <a
                                                key={`${social.label}_${index}`}
                                                className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 transition hover:border-background/50 hover:bg-background/10"
                                                href={String(social.url ?? '#')}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                <Icon className="h-4 w-4" />
                                                {String(social.label ?? `Social ${index + 1}`)}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
