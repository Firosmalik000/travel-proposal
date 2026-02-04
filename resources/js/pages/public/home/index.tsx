import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePublicLocale } from '@/contexts/public-locale';

gsap.registerPlugin(ScrollTrigger);

const content = {
    id: {
        pageTitle: 'Amanah Haramain - Umroh Profesional & Terpercaya',
        hero: {
            label: 'PT Amanah Haramain',
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
            desc: 'Momen-momen tak terlupakan bersama jamaah Amanah Haramain.',
            images: [
                { src: '/images/dummy.jpg', alt: 'Detail arsitektur Masjid Nabawi' },
                { src: '/images/dummy.jpg', alt: 'Pemandangan kota Madinah' },
                { src: '/images/dummy.jpg', alt: 'Jamaah sedang berdoa' },
                { src: '/images/dummy.jpg', alt: 'Anak-anak di pelataran masjid' },
                { src: '/images/dummy.jpg', alt: 'Suasana malam di Masjid' },
                { src: '/images/dummy.jpg', alt: 'Interior Masjid yang megah' },
            ],
        },
        contact: {
            label: 'Kontak Cepat',
            title: 'Siap berangkat? Konsultasi gratis dulu.',
            desc: 'Tim Amanah Haramain siap membantu memilih paket terbaik, jadwal keberangkatan, dan kebutuhan dokumen Anda.',
            whatsapp: 'Konsultasi WhatsApp',
            fullContact: 'Lihat Kontak Lengkap',
            phoneLabel: 'Telepon',
            emailLabel: 'Email',
            addressLabel: 'Alamat Kantor',
            socialLabel: 'Sosial Media',
        },
    },
    en: {
        pageTitle: 'Amanah Haramain - Professional & Trusted Umrah',
        hero: {
            label: 'PT Amanah Haramain',
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
            desc: 'Memorable moments with Amanah Haramain pilgrims.',
            images: [
                { src: '/images/dummy.jpg', alt: 'Masjid Nabawi architecture detail' },
                { src: '/images/dummy.jpg', alt: 'Madinah city view' },
                { src: '/images/dummy.jpg', alt: 'Pilgrims praying' },
                { src: '/images/dummy.jpg', alt: 'Children at the mosque courtyard' },
                { src: '/images/dummy.jpg', alt: 'Night atmosphere at the mosque' },
                { src: '/images/dummy.jpg', alt: 'Grand mosque interior' },
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
    const t = content[locale];
    const mainRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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
                    <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl bg-slate-800 p-6 sm:p-8 md:p-12 lg:flex-row lg:p-16">
                        <div className="relative z-10 lg:w-1/2 text-white">
                            <p className="font-medium">{t.hero.label}</p>
                            <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl">
                                {t.hero.title}
                            </h1>
                            <p className="mt-4 text-base text-white/70 sm:text-lg">
                                {t.hero.desc}
                            </p>
                        </div>
                        <div className="relative mt-2 h-56 w-full sm:mt-6 sm:h-64 md:h-72 lg:mt-0 lg:h-auto lg:w-1/2">
                            <img
                                src="/images/dummy.jpg"
                                alt={t.hero.imageAlt}
                                className="h-full w-full rounded-2xl object-cover lg:absolute lg:-right-1/4 lg:top-1/2 lg:h-auto lg:max-w-2xl lg:-translate-y-1/2"
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="container mx-auto px-4 sm:px-6 py-14 sm:py-16 md:py-20 fade-in-section">
                    <div className="grid grid-cols-2 gap-6 text-center sm:gap-8 md:grid-cols-4">
                        {t.stats.map((stat) => (
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
                        <p className="font-medium uppercase tracking-wider">{t.about.label}</p>
                        <h2 className="font-heading mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                            {t.about.title}
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                            {t.about.desc}
                        </p>
                        <Link
                            href="/tentang-kami"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition hover:bg-muted sm:w-auto"
                        >
                            {t.about.cta}
                        </Link>
                    </div>
                    <div className="relative h-64 sm:h-72 md:h-80">
                        <img src="/images/dummy.jpg" alt={t.about.imageAltOne} className="h-full w-full rounded-2xl object-cover shadow-lg sm:w-2/3" />
                        <img
                            src="/images/dummy.jpg"
                            alt={t.about.imageAltTwo}
                            className="absolute bottom-0 right-0 w-2/3 rounded-2xl border-4 border-background shadow-xl sm:w-1/2 sm:border-8 md:translate-y-1/4"
                        />
                    </div>
                </section>

                {/* Packages Section */}
                <section className="py-14 sm:py-16 md:py-20 fade-in-section">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{t.packages.title}</h2>
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
                        {t.packages.items.map((pkg) => (
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
                                        {t.packages.pricePrefix} {pkg.price} / {pkg.duration}
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
                        <p className="font-medium uppercase tracking-wider text-muted-foreground">{t.services.label}</p>
                        <h2 className="font-heading mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                            {t.services.title}
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                            {t.services.desc}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {t.services.items.map((item) => (
                            <div key={item.number} className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                                <p className="font-heading text-2xl font-bold text-primary/40">{item.number}</p>
                                <h3 className="font-heading mt-4 text-lg font-bold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Section */}
                <section className="bg-muted/40 py-16 sm:py-20 md:py-24 fade-in-section">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{t.gallery.title}</h2>
                            <p className="mt-3 text-base text-muted-foreground">{t.gallery.desc}</p>
                        </div>
                        <div className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[150px] sm:gap-4 md:auto-rows-[180px] md:grid-cols-4 lg:auto-rows-[200px]">
                            {t.gallery.images.map((img, index) => {
                                const spans = [
                                    'md:col-span-2 md:row-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                    'md:col-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                ];
                                return (
                                    <div
                                        key={index}
                                        className={`group relative overflow-hidden rounded-2xl shadow-lg ${spans[index % spans.length]}`}
                                    >
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

                {/* Contact Section */}
                <section className="container mx-auto px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24 fade-in-section">
                    <div className="grid gap-8 rounded-3xl bg-foreground px-6 py-8 text-background shadow-2xl sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-background/70">{t.contact.label}</p>
                            <h2 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">{t.contact.title}</h2>
                            <p className="mt-3 text-background/70 leading-relaxed">
                                {t.contact.desc}
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href="https://wa.me/6281234567890"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground sm:w-auto"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    {t.contact.whatsapp}
                                </a>
                                <Link
                                    href="/kontak"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-background/40 px-5 py-3 text-xs font-semibold text-background/90 transition hover:border-background/70 hover:bg-background/10 sm:w-auto"
                                >
                                    {t.contact.fullContact}
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
                                    <p className="font-semibold">(021) 555-1234</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-background/80">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.emailLabel}</p>
                                    <p className="font-semibold">info@amanahharamain.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-background/80">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.addressLabel}</p>
                                    <p className="font-semibold">Jl. Amanah No. 12, Jakarta Pusat</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-background/50">{t.contact.socialLabel}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-background/80">
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 transition hover:border-background/50 hover:bg-background/10"
                                        href="https://instagram.com/amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Instagram className="h-4 w-4" />
                                        Instagram
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 transition hover:border-background/50 hover:bg-background/10"
                                        href="https://facebook.com/amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Facebook className="h-4 w-4" />
                                        Facebook
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 transition hover:border-background/50 hover:bg-background/10"
                                        href="https://youtube.com/@amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Youtube className="h-4 w-4" />
                                        YouTube
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-2 transition hover:border-background/50 hover:bg-background/10"
                                        href="https://x.com/amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Twitter className="h-4 w-4" />
                                        X (Twitter)
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
