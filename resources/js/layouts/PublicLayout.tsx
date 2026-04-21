import GlobalFaviconHead from '@/components/global-favicon-head';
import {
    PublicLocaleProvider,
    usePublicLocale,
    type PublicLocale,
} from '@/contexts/public-locale';
import { useAppearance } from '@/hooks/use-appearance';
import {
    getPublicSocialAccounts,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Facebook,
    Instagram,
    Music2,
    Moon,
    Sun,
    Twitter,
    Youtube,
} from 'lucide-react';
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

const content = {
    id: {
        nav: [
            { label: 'Paket Umroh', href: '/paket-umroh' },
            { label: 'Jadwal', href: '/jadwal-keberangkatan' },
            { label: 'Tentang Kami', href: '/tentang-kami' },
            { label: 'Kontak', href: '/kontak' },
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
            { label: 'Umrah Packages', href: '/paket-umroh' },
            { label: 'Schedule', href: '/jadwal-keberangkatan' },
            { label: 'About Us', href: '/tentang-kami' },
            { label: 'Contact', href: '/kontak' },
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

const packageNavItems = [
    { label: 'Reguler', href: '/paket-umroh' },
    { label: 'Custom', href: '/custom-umroh' },
] as const;

function OrnamentRosette({
    className,
    tone = 'warm',
}: {
    className: string;
    tone?: 'warm' | 'deep';
}) {
    const palette =
        tone === 'deep'
            ? 'border-[#7f1520]/18 bg-[radial-gradient(circle,rgba(127,21,32,0.08)_0%,rgba(127,21,32,0.02)_55%,transparent_74%)]'
            : 'border-[#d8ae63]/30 bg-[radial-gradient(circle,rgba(216,174,99,0.16)_0%,rgba(216,174,99,0.04)_55%,transparent_74%)]';

    return (
        <div className={`pointer-events-none absolute ${className}`}>
            <div
                className={`relative h-full w-full rounded-full border ${palette}`}
            >
                <div
                    className={`absolute inset-[14%] rounded-full border ${palette}`}
                />
                <div
                    className={`absolute inset-[29%] rounded-full border ${palette}`}
                />
                <div className="absolute inset-1/2 h-[76%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-white/35 to-transparent" />
                <div className="absolute inset-1/2 h-px w-[76%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="absolute inset-1/2 h-[76%] w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-1/2 h-[76%] w-px -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>
        </div>
    );
}

function PublicLayoutInner({ children }: PropsWithChildren) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage();
    const { branding, seoSettings, publicBranding } = usePage<any>().props;
    const { appearance, updateAppearance } = useAppearance();
    const { locale, setLocale } = usePublicLocale();
    const t = content[locale];
    const seo = (seoSettings as Record<string, any>) ?? {};
    const resolvedLogoPath = publicBranding?.logo_path ?? branding.logo_path;
    const contactLink = whatsappLinkFromSeo(seo);
    const socialIconMap = {
        instagram: Instagram,
        facebook: Facebook,
        youtube: Youtube,
        tiktok: Music2,
        twitter: Twitter,
        x: Twitter,
    } as const;
    const footerSocials = getPublicSocialAccounts(seo).map((social) => ({
        ...social,
        icon:
            socialIconMap[
                social.platform.toLowerCase() as keyof typeof socialIconMap
            ] ?? Instagram,
    }));

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
            <GlobalFaviconHead />
            <style>{`
                :root { 
                    scroll-behavior: smooth; 
                }
                .font-heading { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; }
                .font-sans { font-family: 'Segoe UI', Arial, sans-serif; }
            `}</style>

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff7ef_0%,#fff1dc_15%,#f6dfc7_34%,#efcfb7_56%,#f8ece1_78%,#fff8f2_100%)] dark:bg-[linear-gradient(180deg,#220b11_0%,#17070d_18%,#1d0d14_42%,#15080f_68%,#10060b_100%)]" />
                <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(115,12,24,0.12)_1px,transparent_0)] [background-size:26px_26px] opacity-[0.42] dark:opacity-[0.14]" />
                <div className="absolute inset-x-0 top-0 h-[24rem] bg-[linear-gradient(180deg,rgba(126,11,24,0.18)_0%,rgba(126,11,24,0.08)_28%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(226,167,78,0.08)_0%,transparent_100%)]" />
                <div className="absolute top-[-4%] -left-28 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(124,10,22,0.28)_0%,rgba(124,10,22,0.12)_34%,rgba(124,10,22,0.03)_54%,transparent_74%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(214,159,72,0.16)_0%,rgba(214,159,72,0.05)_40%,transparent_74%)]" />
                <div className="absolute top-[10%] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(227,162,71,0.34)_0%,rgba(227,162,71,0.14)_36%,rgba(227,162,71,0.03)_56%,transparent_76%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(139,19,31,0.28)_0%,rgba(139,19,31,0.08)_42%,transparent_74%)]" />
                <div className="absolute top-[42%] left-[6%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,228,191,0.96)_0%,rgba(255,228,191,0.34)_40%,rgba(255,228,191,0.08)_56%,transparent_76%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(205,148,60,0.14)_0%,rgba(205,148,60,0.04)_44%,transparent_76%)]" />
                <div className="absolute right-[10%] bottom-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(132,17,29,0.22)_0%,rgba(132,17,29,0.09)_36%,rgba(132,17,29,0.02)_54%,transparent_74%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(232,185,101,0.18)_0%,rgba(232,185,101,0.04)_40%,transparent_74%)]" />
                <div className="absolute inset-y-0 right-[22%] w-40 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.32)_18%,transparent_58%)] opacity-60 blur-2xl dark:opacity-20" />

                <OrnamentRosette
                    className="top-20 left-[-2.5rem] h-44 w-44 opacity-80 dark:opacity-38"
                    tone="warm"
                />
                <OrnamentRosette
                    className="top-[19rem] right-2 h-32 w-32 opacity-70 dark:opacity-32"
                    tone="deep"
                />
                <OrnamentRosette
                    className="bottom-28 left-[5%] h-36 w-36 opacity-60 dark:opacity-32"
                    tone="warm"
                />
                <OrnamentRosette
                    className="right-[-1.5rem] bottom-12 h-48 w-48 opacity-62 dark:opacity-34"
                    tone="deep"
                />

                <div className="absolute top-[16%] left-[4%] h-px w-44 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#db9a37]/60 to-transparent dark:via-[#d8a760]/30" />
                <div className="absolute top-[54%] right-[7%] h-px w-52 rotate-[12deg] bg-gradient-to-r from-transparent via-[#8c1020]/48 to-transparent dark:via-[#e0b16a]/24" />
                <div className="absolute bottom-[16%] left-[14%] h-px w-36 rotate-[24deg] bg-gradient-to-r from-transparent via-[#c77f2f]/52 to-transparent dark:via-[#d6a45f]/24" />
            </div>

            <header
                className={`relative sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md backdrop-blur-lg' : ''}`}
            >
                <div
                    className={`absolute inset-0 transition-all duration-300 ${
                        scrolled
                            ? 'bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)]'
                            : 'bg-[linear-gradient(90deg,rgba(93,8,18,0.92)_0%,rgba(142,16,27,0.88)_34%,rgba(189,49,34,0.84)_64%,rgba(230,156,50,0.82)_100%)]'
                    }`}
                />
                <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:20px_20px] opacity-60" />
                <div className="pointer-events-none absolute inset-y-0 left-[12%] w-24 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.2)_18%,transparent_62%)] opacity-60 blur-xl" />
                <div className="pointer-events-none absolute top-1/2 -left-10 h-32 w-32 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,202,124,0.34)_0%,transparent_70%)] blur-2xl" />
                <div className="pointer-events-none absolute top-0 right-8 h-full w-36 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_100%)] opacity-80" />
                <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/42 to-transparent" />

                <div className="relative container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src={resolvedLogoPath}
                            alt={branding.company_name}
                            className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                        />
                        <div>
                            <p className="font-heading text-sm font-bold text-white sm:text-base">
                                {branding.company_name}
                            </p>
                            <p className="text-[0.68rem] tracking-[0.2em] text-white/70 uppercase">
                                {branding.company_subtitle}
                            </p>
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium text-white/78 lg:flex">
                        {t.nav.map((item) =>
                            item.href === '/paket-umroh' ? (
                                <div key={item.href} className="group relative">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 transition hover:text-white"
                                    >
                                        {item.label}
                                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                                    </button>
                                    <div className="pointer-events-none absolute top-full left-0 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                                        <div className="min-w-48 overflow-hidden rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(98,12,20,0.98)_0%,rgba(70,10,18,0.98)_100%)] p-2 shadow-xl backdrop-blur">
                                            {packageNavItems.map(
                                                (packageItem) => (
                                                    <Link
                                                        key={packageItem.href}
                                                        href={packageItem.href}
                                                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
                                                    >
                                                        {packageItem.label}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="transition hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>
                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="flex items-center rounded-full border border-white/16 bg-white/10 px-1 py-1 text-xs font-semibold text-white/70">
                            {(['id', 'en'] as PublicLocale[]).map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    className={`rounded-full px-3 py-1 transition ${locale === lang ? 'bg-white text-[#7a0d17]' : 'hover:text-white'}`}
                                    onClick={() => setLocale(lang)}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            aria-label={t.themeLabel}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white transition hover:bg-white/16"
                            onClick={() =>
                                updateAppearance(isDark ? 'light' : 'dark')
                            }
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>
                        {contactLink ? (
                            <a
                                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#7a0d17] transition hover:bg-[#fff4db]"
                                href={contactLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t.contactCta}
                            </a>
                        ) : null}
                    </div>
                    <div className="lg:hidden">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border border-white/16 bg-white/10 p-2 text-white shadow-sm transition hover:bg-white/16"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            type="button"
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16m-7 6h7"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div
                    id="mobile-menu"
                    className={`absolute top-full right-0 left-0 border-t border-white/12 bg-[linear-gradient(180deg,rgba(98,12,20,0.98)_0%,rgba(70,10,18,0.98)_100%)] shadow-lg transition-all duration-200 lg:hidden ${mobileOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
                >
                    <div className="relative container mx-auto flex flex-col gap-2 overflow-hidden px-4 py-4">
                        <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,190,92,0.35)_0%,transparent_72%)] blur-2xl" />
                        {t.nav.map((item) =>
                            item.href === '/paket-umroh' ? (
                                <div
                                    key={item.href}
                                    className="rounded-xl border border-white/10 bg-white/6 p-2"
                                >
                                    <p className="px-2 py-1 text-sm font-semibold text-white">
                                        {item.label}
                                    </p>
                                    <div className="mt-1 flex flex-col gap-1">
                                        {packageNavItems.map((packageItem) => (
                                            <Link
                                                key={packageItem.href}
                                                href={packageItem.href}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="rounded-xl px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                                            >
                                                {packageItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/8 px-3 py-2">
                                <span className="text-xs font-semibold text-white/66">
                                    {t.languageLabel}
                                </span>
                                <div className="flex items-center rounded-full border border-white/14 bg-black/10 px-1 py-1 text-xs font-semibold text-white/68">
                                    {(['id', 'en'] as PublicLocale[]).map(
                                        (lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                className={`rounded-full px-3 py-1 transition ${locale === lang ? 'bg-white text-[#7a0d17]' : 'hover:text-white'}`}
                                                onClick={() => setLocale(lang)}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center justify-between rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white"
                                onClick={() =>
                                    updateAppearance(isDark ? 'light' : 'dark')
                                }
                            >
                                <span>{t.themeLabel}</span>
                                {isDark ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </button>
                            {contactLink ? (
                                <a
                                    className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#7a0d17] transition hover:bg-[#fff4db]"
                                    href={contactLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {t.contactCta}
                                </a>
                            ) : null}
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

            <main className="relative z-10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/28 via-white/10 to-transparent dark:from-white/[0.03] dark:via-transparent" />
                {children}
            </main>

            <footer className="relative mt-16 overflow-hidden bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)] text-white dark:bg-[linear-gradient(90deg,rgba(71,9,16,0.98)_0%,rgba(111,14,24,0.97)_34%,rgba(158,32,28,0.94)_64%,rgba(207,135,44,0.9)_100%)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a35b2e]/40 to-transparent dark:via-[#d7a760]/30" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_18%,rgba(255,220,157,0.12)_42%,transparent_64%,rgba(92,10,20,0.16)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,transparent_22%,rgba(234,186,98,0.08)_46%,transparent_70%,rgba(76,10,18,0.14)_100%)]" />
                <div className="pointer-events-none absolute bottom-10 -left-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,214,146,0.34)_0%,transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(215,165,84,0.16)_0%,transparent_72%)]" />
                <div className="pointer-events-none absolute top-10 right-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(108,10,23,0.28)_0%,transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(240,189,99,0.1)_0%,transparent_72%)]" />
                <OrnamentRosette
                    className="top-8 right-10 h-24 w-24 opacity-45 dark:opacity-25"
                    tone="warm"
                />
                <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src={resolvedLogoPath}
                                alt={branding.company_name}
                                className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                            />
                            <div>
                                <p className="font-heading text-sm font-bold text-white sm:text-base">
                                    {branding.company_name}
                                </p>
                                <p className="text-[0.68rem] tracking-[0.2em] text-white/72 uppercase">
                                    {branding.company_subtitle}
                                </p>
                            </div>
                        </Link>
                        <p className="mt-4 text-sm text-white/78">
                            {t.footerIntro}
                        </p>
                        {footerSocials.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {footerSocials.map((social, index) => {
                                    const Icon = social.icon;

                                    return (
                                        <a
                                            key={`${social.label}_${index}`}
                                            href={social.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={social.label}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/22 bg-white/10 text-white shadow-[0_16px_30px_-16px_rgba(55,6,13,0.55)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/42 hover:bg-white/16 hover:text-white"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-3">
                        {t.footer.map((section) => (
                            <div key={section.heading}>
                                <h3 className="font-heading font-semibold text-white">
                                    {section.heading}
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {section.links.map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                className="text-sm text-white/76 transition hover:text-white"
                                                href={item.href}
                                            >
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
                    <div className="container mx-auto text-center text-sm text-white/72">
                        {t
                            .copyright(new Date().getFullYear())
                            .replace(
                                'Amanah Haramain Travel',
                                branding.company_name,
                            )}
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
