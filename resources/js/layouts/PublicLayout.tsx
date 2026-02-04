import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect, type PropsWithChildren } from 'react';

// Simplified nav links for the new design
const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Paket Umroh', href: '/paket-umroh' },
    { label: 'Jadwal', href: '/jadwal-keberangkatan' },
    { label: 'Tentang Kami', href: '/tentang-kami' },
];

const footerLinks = [
    { heading: 'Perusahaan', links: [
        { label: 'Tentang Kami', href: '/tentang-kami' },
        { label: 'Legalitas', href: '/legalitas' },
        { label: 'Kontak', href: '/kontak' },
        { label: 'Karier', href: '/karier' },
    ]},
    { heading: 'Layanan', links: [
        { label: 'Paket Umroh', href: '/paket-umroh' },
        { label: 'Jadwal', href: '/jadwal-keberangkatan' },
        { label: 'Custom Umroh', href: '/custom-umroh' },
        { label: 'Testimoni', href: '/testimoni' },
    ]},
    { heading: 'Sumber Daya', links: [
        { label: 'Artikel', href: '/artikel' },
        { label: 'Galeri', href: '/galeri' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Mitra', href: '/mitra' },
    ]},
];

export default function PublicLayout({ children }: PropsWithChildren) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on initial load

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-gray-50 font-sans text-gray-800 antialiased">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <style>{`
                :root { 
                    scroll-behavior: smooth; 
                    --flygo-primary: #2563eb; /* Blue-600 */
                    --flygo-dark: #1e293b; /* Slate-800 */
                }
                .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
            `}</style>
            
            <header 
                className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-md backdrop-blur-lg' : 'bg-transparent'}`}
            >
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                            AH
                        </div>
                        <div>
                            <p className="font-heading text-lg font-bold text-slate-800">
                                Amanah Haramain
                            </p>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
                        {navLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="transition hover:text-blue-600"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden lg:flex items-center gap-4">
                         <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                            Sign In
                        </Link>
                        <a
                            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Kontak Kami
                        </a>
                    </div>
                     <div className="lg:hidden">
                        {/* Mobile menu button can be added here */}
                        <button className="p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
                    </div>
                </div>
            </header>

            <main>{children}</main>

            <footer className="mt-16 bg-white text-slate-700">
                <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                                AH
                            </div>
                            <p className="font-heading text-lg font-bold text-slate-800">
                                Amanah Haramain
                            </p>
                        </Link>
                        <p className="mt-4 text-sm text-slate-600">
                           Wujudkan perjalanan suci Anda dengan layanan umroh yang amanah, profesional, dan terpercaya.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:col-span-3">
                        {footerLinks.map((section) => (
                             <div key={section.heading}>
                                <h3 className="font-heading font-semibold text-slate-800">{section.heading}</h3>
                                <ul className="mt-4 space-y-3">
                                    {section.links.map((item) => (
                                        <li key={item.label}>
                                            <Link className="text-sm text-slate-600 transition hover:text-blue-600" href={item.href}>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="border-t py-6">
                    <div className="container mx-auto text-center text-sm text-slate-500">
                       &copy; {new Date().getFullYear()} Amanah Haramain Travel. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}