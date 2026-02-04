import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- DATA ---

const stats = [
    { value: '15+', label: 'Tahun Melayani' },
    { value: '98%', label: 'Kepuasan Jamaah' },
    { value: '20K+', label: 'Jamaah Berangkat' },
    { value: '50+', label: 'Mitra Terpercaya' },
];

const packages = [
    {
        title: 'Paket Silver',
        destination: 'Makkah & Madinah',
        image: 'https://images.unsplash.com/photo-1542649764-b80c43086939?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        price: '29,9 Jt',
        duration: '9 Hari',
    },
    {
        title: 'Paket Gold',
        destination: 'Makkah & Madinah',
        image: 'https://images.unsplash.com/photo-1604424331929-79cf023eaf59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        price: '38,5 Jt',
        duration: '12 Hari',
    },
    {
        title: 'Paket Platinum',
        destination: 'Makkah & Madinah',
        image: 'https://images.unsplash.com/photo-1593095368383-a698a87693e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        price: 'Call Us',
        duration: 'by Request',
    },
    {
        title: 'Umroh Plus Turki',
        destination: 'Makkah, Madinah, Istanbul',
        image: 'https://images.unsplash.com/photo-1528340950346-8575ba6904c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        price: '45 Jt',
        duration: '14 Hari',
    },
];

const services = [
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
];

const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1583913469070-a6d7481cd632?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Detail arsitektur Masjid Nabawi' },
    { src: 'https://images.unsplash.com/photo-1562991283-a55f53b692a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Pemandangan kota Madinah' },
    { src: 'https://images.unsplash.com/photo-1614926750383-3878f44537a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Jamaah sedang berdoa' },
    { src: 'https://images.unsplash.com/photo-1600191833829-ce56c6463870?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Anak-anak di pelataran masjid' },
    { src: 'https://images.unsplash.com/photo-1518065330394-47339faf7a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Suasana malam di Masjid' },
    { src: 'https://images.unsplash.com/photo-1555980134-3a7b6a15d658?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80', alt: 'Interior Masjid yang megah' },
]

// --- React Component ---

export default function Home() {
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
            <Head title="Amanah Haramain - Umroh Profesional & Terpercaya" />

            <main ref={mainRef} className="bg-gray-50 pt-8">
                {/* Hero Section */}
                <section className="container mx-auto px-4 fade-in-section">
                    <div className="relative bg-slate-800 rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-center overflow-hidden">
                        <div className="relative z-10 lg:w-1/2 text-white">
                            <p className="font-medium">PT Amanah Haramain</p>
                            <h1 className="font-heading text-5xl md:text-7xl font-extrabold mt-2">
                                Jelajahi Tanah Suci
                            </h1>
                            <p className="mt-4 text-lg text-slate-300">
                                Pengalaman ibadah umroh yang khusyuk, nyaman, dan tak terlupakan dengan layanan profesional.
                            </p>
                        </div>
                        <div className="relative mt-8 lg:mt-0 lg:w-1/2 h-80 lg:h-auto">
                            <img 
                                src="https://images.unsplash.com/photo-1593095368383-a698a87693e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                                alt="Kaaba"
                                className="absolute -right-1/4 top-1/2 -translate-y-1/2 w-full max-w-xl lg:max-w-2xl rounded-2xl"
                            />
                        </div>
                    </div>
                </section>
                
                {/* Stats Section */}
                <section className="container mx-auto px-4 py-20 fade-in-section">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(stat => (
                            <div key={stat.label}>
                                <p className="font-heading text-4xl md:text-5xl font-bold text-blue-600">{stat.value}</p>
                                <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Introduction Section */}
                <section className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center fade-in-section">
                    <div className="text-sm text-slate-500">
                        <p className="font-medium uppercase tracking-wider">Tentang Kami</p>
                        <h2 className="font-heading text-4xl font-bold text-slate-800 mt-4">
                            Mengakselerasi Perubahan dengan Pelayanan Terbaik
                        </h2>
                        <p className="mt-4 text-base text-slate-600 leading-relaxed">
                            Kami adalah travel umroh yang berizin resmi dan terpercaya, berkomitmen untuk membawa standar baru dalam industri dengan mengutamakan transparansi, kenyamanan, dan bimbingan ibadah yang berkualitas.
                        </p>
                        <Link href="/tentang-kami" className="inline-block mt-6 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition">
                            Baca Selengkapnya
                        </Link>
                    </div>
                    <div className="relative h-80">
                         <img src="https://images.unsplash.com/photo-1583913469070-a6d7481cd632?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Islamic Architecture" className="w-2/3 h-full object-cover rounded-2xl shadow-lg"/>
                         <img src="https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Jamaah" className="absolute right-0 bottom-0 w-1/2 border-8 border-gray-50 rounded-2xl shadow-xl transform translate-y-1/4"/>
                    </div>
                </section>

                {/* Packages Section (Routes) */}
                <section className="py-20 fade-in-section">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                             <h2 className="font-heading text-4xl font-bold text-slate-800">Paket Unggulan</h2>
                             <div className="flex gap-2">
                                <button onClick={() => handleScroll('left')} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-slate-100 transition">&larr;</button>
                                <button onClick={() => handleScroll('right')} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-slate-100 transition">&rarr;</button>
                             </div>
                        </div>
                    </div>
                    <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 px-4" style={{ scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
                        <div className="flex-shrink-0 w-4 md:w-auto"></div> {/* Spacer */}
                        {packages.map(pkg => (
                            <div key={pkg.title} className="flex-shrink-0 w-72 rounded-3xl overflow-hidden relative group h-[450px]">
                                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <p className="text-sm">{pkg.destination}</p>
                                    <h3 className="font-heading text-xl font-bold mt-1">{pkg.title}</h3>
                                    <p className="mt-2 text-sm">Mulai {pkg.price} / {pkg.duration}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex-shrink-0 w-4 md:w-auto"></div> {/* Spacer */}
                    </div>
                </section>

                {/* Services Section (What We Do) */}
                <section className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center fade-in-section">
                     <div>
                        <p className="font-medium uppercase tracking-wider text-slate-500">Layanan Kami</p>
                        <h2 className="font-heading text-4xl font-bold text-slate-800 mt-4">
                            Apa yang Kami Tawarkan?
                        </h2>
                        <p className="mt-4 text-base text-slate-600 leading-relaxed">
                            Kami menyediakan layanan umroh yang lengkap dan terintegrasi untuk memastikan perjalanan ibadah Anda berjalan lancar, aman, dan penuh makna.
                        </p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {services.map(item => (
                             <div key={item.number} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                                <p className="font-heading font-bold text-2xl text-blue-200">{item.number}</p>
                                <h3 className="font-heading font-bold text-lg text-slate-800 mt-4">{item.title}</h3>
                                <p className="text-sm text-slate-600 mt-2">{item.description}</p>
                             </div>
                         ))}
                     </div>
                </section>
                
                {/* LAYOUT FIX: Changed to a more robust grid with aspect ratios */}
                <section className="bg-gray-50 py-24 fade-in-section">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-4xl font-bold text-slate-800">Galeri Perjalanan</h2>
                            <p className="mt-3 text-base text-slate-600">Momen-momen tak terlupakan bersama jamaah Amanah Haramain.</p>
                        </div>
                        {/* The grid now uses fixed auto-rows to keep the gallery compact */}
                        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] md:auto-rows-[180px] lg:auto-rows-[200px] gap-4">
                            {galleryImages.map((img, index) => {
                                const spans = [
                                    'md:col-span-2 md:row-span-2', // First image
                                    'md:col-span-1',
                                    'md:col-span-1',
                                    'md:col-span-2',
                                    'md:col-span-1',
                                    'md:col-span-1',
                                ];
                                return (
                                    <div key={index} className={`relative overflow-hidden rounded-2xl shadow-lg group ${spans[index % spans.length]}`}>
                                        <img src={img.src} alt={img.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="container mx-auto px-4 pb-24 fade-in-section">
                    <div className="grid gap-8 rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Kontak Cepat</p>
                            <h2 className="font-heading text-4xl font-bold mt-3">Siap berangkat? Konsultasi gratis dulu.</h2>
                            <p className="mt-3 text-slate-300 leading-relaxed">
                                Tim Amanah Haramain siap membantu memilih paket terbaik, jadwal keberangkatan, dan kebutuhan dokumen Anda.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href="https://wa.me/6281234567890"
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-xs font-semibold text-white"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Konsultasi WhatsApp
                                </a>
                                <Link
                                    href="/kontak"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-500 px-5 py-3 text-xs font-semibold text-white/90 transition hover:border-white/60 hover:bg-white/10"
                                >
                                    Lihat Kontak Lengkap
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 rounded-2xl bg-white/5 p-6">
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                    <Phone className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Telepon</p>
                                    <p className="font-semibold">(021) 555-1234</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                                    <p className="font-semibold">info@amanahharamain.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-200">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alamat Kantor</p>
                                    <p className="font-semibold">Jl. Amanah No. 12, Jakarta Pusat</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sosial Media</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 transition hover:border-white/40 hover:bg-white/10"
                                        href="https://instagram.com/amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Instagram className="h-4 w-4" />
                                        Instagram
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 transition hover:border-white/40 hover:bg-white/10"
                                        href="https://facebook.com/amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Facebook className="h-4 w-4" />
                                        Facebook
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 transition hover:border-white/40 hover:bg-white/10"
                                        href="https://youtube.com/@amanahharamain"
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <Youtube className="h-4 w-4" />
                                        YouTube
                                    </a>
                                    <a
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 transition hover:border-white/40 hover:bg-white/10"
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
