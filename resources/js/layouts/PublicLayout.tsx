import { Head, Link, usePage } from '@inertiajs/react';
import BrandThemeStyle from '@/components/brand-theme-style';
import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { PublicLocaleProvider, usePublicLocale, type PublicLocale } from '@/contexts/public-locale';
import { whatsappLinkFromPhone } from '@/lib/public-content';

const content = {
    id: {
        nav: [
            { label: 'Home', href: '/' },
            { label: 'Paket Umroh', href: '/paket-umroh' },
            { label: 'Jadwal', href: '/jadwal-keberangkatan' },
            { label: 'Tentang Kami', href: '/tentang-kami' },
        ],
        signIn: 'Masuk',
        contactCta: 'Kontak Kami',
        footerIntro:
            'Wujudkan perjalanan suci Anda dengan layanan umroh yang amanah, profesional, dan terpercaya.',
        footer: [
            {
                heading: 'Perusahaan',
                links: [
                    { label: 'Tentang Kami', href: '/tentang-kami' },
                    { label: 'Legalitas', href: '/legalitas' },
                    { label: 'Kontak', href: '/kontak' },
                    { label: 'Karier', href: '/karier' },
                ],
            },
            {
                heading: 'Layanan',
                links: [
                    { label: 'Paket Umroh', href: '/paket-umroh' },
                    { label: 'Jadwal', href: '/jadwal-keberangkatan' },
                    { label: 'Custom Umroh', href: '/custom-umroh' },
                    { label: 'Testimoni', href: '/testimoni' },
                ],
            },
            {
                heading: 'Sumber Daya',
                links: [
                    { label: 'Artikel', href: '/artikel' },
                    { label: 'Galeri', href: '/galeri' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Mitra', href: '/mitra' },
                ],
            },
        ],
        copyright: (year: number) =>
            `(c) ${year} Amanah Haramain Travel. Semua hak dilindungi.`,
        languageLabel: 'Bahasa',
        themeLabel: 'Tema',
    },
    en: {
        nav: [
            { label: 'Home', href: '/' },
            { label: 'Umrah Packages', href: '/paket-umroh' },
            { label: 'Schedule', href: '/jadwal-keberangkatan' },
            { label: 'About Us', href: '/tentang-kami' },
        ],
        signIn: 'Sign In',
        contactCta: 'Contact Us',
        footerIntro:
            'Plan your sacred journey with a trusted, professional, and transparent umrah partner.',
        footer: [
            {
                heading: 'Company',
                links: [
                    { label: 'About Us', href: '/tentang-kami' },
                    { label: 'Licenses', href: '/legalitas' },
                    { label: 'Contact', href: '/kontak' },
                    { label: 'Careers', href: '/karier' },
                ],
            },
            {
                heading: 'Services',
                links: [
                    { label: 'Umrah Packages', href: '/paket-umroh' },
                    { label: 'Schedule', href: '/jadwal-keberangkatan' },
                    { label: 'Custom Umrah', href: '/custom-umroh' },
                    { label: 'Testimonials', href: '/testimoni' },
                ],
            },
            {
                heading: 'Resources',
                links: [
                    { label: 'Articles', href: '/artikel' },
                    { label: 'Gallery', href: '/galeri' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Partners', href: '/mitra' },
                ],
            },
        ],
        copyright: (year: number) =>
            `(c) ${year} Amanah Haramain Travel. All rights reserved.`,
        languageLabel: 'Language',
        themeLabel: 'Theme',
    },
};

function PublicLayoutInner({ children }: PropsWithChildren) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage();
    const { branding, seoSettings } = usePage<any>().props;
    const { appearance, updateAppearance } = useAppearance();
    const { locale, setLocale } = usePublicLocale();
    const t = content[locale];
    const seo = (seoSettings as Record<string, any>) ?? {};
    const contactLink = whatsappLinkFromPhone(seo.contact?.phone);

    const isDark = useMemo(() => {
        if (appearance === 'dark') {
            return true;
        }
        if (appearance === 'light') {
            return false;
        }
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }, [appearance]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on initial load

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [page.url]);

    useEffect(() => {
        if (!mobileOpen) {
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileOpen]);

    return (
        <div className="public-shell bg-background font-sans text-foreground antialiased">
            <BrandThemeStyle />
            <Head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </Head>
            <style>{`
                :root { 
                    scroll-behavior: smooth; 
                }
                .font-heading { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; }
                .font-sans { font-family: 'Segoe UI', Arial, sans-serif; }
            `}</style>
            
            <header 
                className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/85 shadow-md backdrop-blur-lg' : 'bg-transparent'} relative`}
            >
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src={branding.logo_path} alt={branding.company_name} className="h-10 w-10 object-contain" />
                        <div>
                            <p className="font-heading text-lg font-bold text-foreground">
                                {branding.company_name}
                            </p>
                            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">{branding.company_subtitle}</p>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        {t.nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="transition hover:text-primary"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-border bg-card px-1 py-1 text-xs font-semibold text-muted-foreground">
                            {(['id', 'en'] as PublicLocale[]).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    className={`rounded-full px-3 py-1 transition ${locale === lang ? 'bg-primary text-primary-foreground' : 'hover:text-foreground'}`}
                                    onClick={() => setLocale(lang)}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            aria-label={t.themeLabel}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
                            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                         <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                            {t.signIn}
                        </Link>
                        <a
                            className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
                            href={contactLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t.contactCta}
                        </a>
                    </div>
                    <div className="lg:hidden">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border border-border bg-card/80 p-2 text-foreground shadow-sm transition hover:bg-card"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            type="button"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div
                    id="mobile-menu"
                    className={`lg:hidden absolute left-0 right-0 top-full border-t border-border bg-card/95 shadow-lg transition-all duration-200 ${mobileOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
                >
                    <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
                        {t.nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
                                <span className="text-xs font-semibold text-muted-foreground">{t.languageLabel}</span>
                                <div className="flex items-center rounded-full border border-border bg-background px-1 py-1 text-xs font-semibold text-muted-foreground">
                                    {(['id', 'en'] as PublicLocale[]).map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            className={`rounded-full px-3 py-1 transition ${locale === lang ? 'bg-primary text-primary-foreground' : 'hover:text-foreground'}`}
                                            onClick={() => setLocale(lang)}
                                        >
                                            {lang.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
                                onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                            >
                                <span>{t.themeLabel}</span>
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                            >
                                {t.signIn}
                            </Link>
                            <a
                                className="inline-flex items-center justify-center rounded-xl bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
                                href={contactLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t.contactCta}
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {mobileOpen && (
                <button
                    className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
                    aria-hidden="true"
                    onClick={() => setMobileOpen(false)}
                    type="button"
                />
            )}

            <main>{children}</main>

            <footer className="mt-16 bg-card text-foreground">
                <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <img src={branding.logo_path} alt={branding.company_name} className="h-10 w-10 object-contain" />
                            <div>
                                <p className="font-heading text-lg font-bold text-foreground">
                                    {branding.company_name}
                                </p>
                                <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">{branding.company_subtitle}</p>
                            </div>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                           {t.footerIntro}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:col-span-3">
                        {t.footer.map((section) => (
                             <div key={section.heading}>
                                <h3 className="font-heading font-semibold text-foreground">{section.heading}</h3>
                                <ul className="mt-4 space-y-3">
                                    {section.links.map((item) => (
                                        <li key={item.label}>
                                            <Link className="text-sm text-muted-foreground transition hover:text-primary" href={item.href}>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="border-t border-border py-6">
                    <div className="container mx-auto text-center text-sm text-muted-foreground">
                       {t.copyright(new Date().getFullYear()).replace('Amanah Haramain Travel', branding.company_name)}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <PublicLocaleProvider>
            <PublicLayoutInner>{children}</PublicLayoutInner>
        </PublicLocaleProvider>
    );
}

