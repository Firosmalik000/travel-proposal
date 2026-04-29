import GlobalFaviconHead from '@/components/global-favicon-head';
import {
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentRow1Col1,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
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
    Twitter,
    Youtube,
} from 'lucide-react';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';

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
                heading: 'Jelajah',
                links: [
                    { label: 'Paket Umroh', href: '/paket-umroh' },
                    { label: 'Jadwal', href: '/jadwal-keberangkatan' },
                    { label: 'Layanan', href: '/layanan' },
                    { label: 'Artikel', href: '/artikel' },
                ],
            },
            {
                heading: 'Kebijakan',
                links: [
                    { label: 'FAQ', href: '/faq' },
                    { label: 'Syarat & Ketentuan', href: '/terms-conditions' },
                    { label: 'Kebijakan Privasi', href: '/privacy-policy' },
                    { label: 'Kebijakan Refund', href: '/refund-policy' },
                    { label: 'Disclaimer', href: '/disclaimer' },
                ],
            },
        ],
        copyright: (year: number) =>
            `(c) ${year} Amanah Haramain Travel. Semua hak dilindungi.`,
        languageLabel: 'Bahasa',
        themeLabel: 'Tema',
    },
};

const packageNavItems = [
    { label: 'Reguler', href: '/paket-umroh' },
    { label: 'Custom', href: '/custom-umroh' },
] as const;


function PublicLayoutInner({ children }: PropsWithChildren) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(88);
    const headerRef = useRef<HTMLElement | null>(null);
    const page = usePage();
    const { branding, seoSettings, publicBranding } = usePage<any>().props;
    const locale = 'id' as const;
    const t = content.id;
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
    const resolvedPathname =
        typeof window !== 'undefined'
            ? window.location.pathname
            : String(page.url ?? '').split('?')[0] ?? '';
    const isHomePage = resolvedPathname === '/';
    const shouldUseSolidHeader = scrolled || mobileOpen || !isHomePage;

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    useEffect(() => {
        let rafId: number | null = null;

        const updateScrolled = () => {
            rafId = null;
            const nextScrolled = window.scrollY > 10;

            setScrolled((current) =>
                current === nextScrolled ? current : nextScrolled,
            );
        };

        const handleScroll = () => {
            if (rafId !== null) {
                return;
            }

            rafId = window.requestAnimationFrame(updateScrolled);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check on initial load

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
        };
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

    useEffect(() => {
        const el = headerRef.current;
        if (!el) {
            return;
        }

        const updateHeight = () => {
            const nextHeight = Math.max(
                1,
                Math.ceil(el.getBoundingClientRect().height),
            );

            setHeaderHeight((current) =>
                current === nextHeight ? current : nextHeight,
            );
        };

        updateHeight();

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => updateHeight());
            resizeObserver.observe(el);
        }

        window.addEventListener('resize', updateHeight, { passive: true });

        return () => {
            window.removeEventListener('resize', updateHeight);
            resizeObserver?.disconnect();
        };
    }, []);

    return (
        <div
            className="public-shell bg-background font-sans text-foreground antialiased overflow-x-hidden"
            style={{
                ['--public-header-h' as any]: `${headerHeight}px`,
            }}
        >
            <GlobalFaviconHead />
            <style>{`
                :root { 
                    scroll-behavior: smooth; 
                    scroll-padding-top: var(--public-header-h, 88px);
                }
                .font-heading { font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; }
                .font-sans { font-family: 'Segoe UI', Arial, sans-serif; }
            `}</style>

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff7ef_0%,#fff1dc_15%,#f6dfc7_34%,#efcfb7_56%,#f8ece1_78%,#fff8f2_100%)] dark:bg-[linear-gradient(180deg,#220b11_0%,#17070d_18%,#1d0d14_42%,#15080f_68%,#10060b_100%)]" />
                <div className="absolute inset-x-0 top-0 h-[24rem] bg-[linear-gradient(180deg,rgba(126,11,24,0.18)_0%,rgba(126,11,24,0.08)_28%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(226,167,78,0.08)_0%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(230,156,50,0.12)_0%,transparent_46%),radial-gradient(circle_at_78%_16%,rgba(189,49,34,0.10)_0%,transparent_50%),radial-gradient(circle_at_72%_76%,rgba(142,16,27,0.08)_0%,transparent_56%),radial-gradient(circle_at_22%_86%,rgba(93,8,18,0.06)_0%,transparent_56%)] opacity-90 dark:opacity-55" />
                <div className="absolute inset-y-0 right-[22%] w-40 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.24)_18%,transparent_58%)] opacity-55 blur-xl dark:opacity-18" />
            </div>

            <header
                ref={headerRef}
                className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${shouldUseSolidHeader ? 'shadow-md' : ''}`}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className={`absolute inset-0 transition-all duration-300 ${
                            shouldUseSolidHeader
                                ? 'bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)]'
                                : 'bg-transparent'
                        }`}
                    />
                    {shouldUseSolidHeader ? (
                        <>
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0.14)_58%,transparent_100%)] dark:hidden" />
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_30%,rgba(255,214,146,0.18)_0%,transparent_52%),radial-gradient(circle_at_82%_26%,rgba(189,49,34,0.14)_0%,transparent_56%)] opacity-70" />
                            <div className="pointer-events-none absolute inset-y-0 left-[12%] w-24 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.2)_18%,transparent_62%)] opacity-60 blur-xl" />
                            <div className="pointer-events-none absolute top-0 right-8 h-full w-36 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_100%)] opacity-80" />
                            <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/42 to-transparent" />
                        </>
                    ) : null}
                </div>

                <div className="relative container mx-auto flex items-center justify-between gap-4 p-4">
                    <Link
                        href="/"
                        className="flex min-w-0 items-center gap-2 sm:gap-3"
                    >
                        <img
                            src={resolvedLogoPath}
                            alt={branding.company_name}
                            className="h-12 w-12 object-contain sm:h-20 sm:w-20"
                        />
                        <div className="min-w-0 max-w-[13.5rem] sm:max-w-[14rem] md:max-w-[10rem]">
                            <p className="font-heading truncate text-xs font-bold text-white sm:text-base">
                                {branding.company_name}
                            </p>
                            <p className="mt-0.5 overflow-hidden text-[0.6rem] leading-snug tracking-[0.08em] text-white/70 uppercase [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-[0.68rem] sm:tracking-[0.12em]">
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
                                        <div className="min-w-48 overflow-hidden rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(98,12,20,0.98)_0%,rgba(70,10,18,0.98)_100%)] p-2 shadow-xl">
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

            <main
                className={`relative z-10 ${isHomePage ? 'pt-0' : 'pt-[var(--public-header-h)]'}`}
            >
                {!isHomePage ? (
                    <>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/28 via-white/10 to-transparent dark:from-white/[0.03] dark:via-transparent" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(230,156,50,0.10)_0%,transparent_40%),radial-gradient(circle_at_86%_22%,rgba(189,49,34,0.08)_0%,transparent_46%),radial-gradient(circle_at_78%_92%,rgba(93,8,18,0.06)_0%,transparent_55%)] opacity-70 dark:opacity-35" />
                    </>
                ) : null}
                {children}
            </main>

            <footer className="relative mt-16 overflow-hidden bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)] text-white dark:bg-[linear-gradient(90deg,rgba(71,9,16,0.98)_0%,rgba(111,14,24,0.97)_34%,rgba(158,32,28,0.94)_64%,rgba(207,135,44,0.9)_100%)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a35b2e]/40 to-transparent dark:via-[#d7a760]/30" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_18%,rgba(255,220,157,0.12)_42%,transparent_64%,rgba(92,10,20,0.16)_100%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_0%,transparent_22%,rgba(234,186,98,0.08)_46%,transparent_70%,rgba(76,10,18,0.14)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_32%,rgba(255,255,255,0.10)_0%,transparent_56%),radial-gradient(circle_at_82%_68%,rgba(255,220,157,0.16)_0%,transparent_62%)] opacity-80 dark:opacity-55" />
                <div className="pointer-events-none absolute inset-0 bg-black/28 dark:hidden" />
                <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent dark:via-white/14" />

                {/* Background ornaments: intentional (max 2) */}
                <div className="pointer-events-none absolute top-[-8%] right-[-6%] text-white/16 mix-blend-overlay sm:text-white/18 dark:text-white/10">
                    <IslamicOrnamentZellige className="h-[16rem] w-[16rem] rotate-[12deg] sm:h-[19rem] sm:w-[19rem]" />
                </div>
                <div className="pointer-events-none absolute bottom-12 left-6 text-white/26 dark:text-white/16">
                    <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                        <div className="absolute inset-0 text-white/10 dark:text-white/8">
                            <IslamicOrnamentOttomanAccent className="h-full w-full rotate-[6deg] scale-[1.06]" />
                        </div>
                        <div className="absolute inset-0 text-white/30 dark:text-white/18">
                            <IslamicOrnamentRow1Col1 className="h-full w-full -rotate-[8deg]" />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto grid gap-10 px-6 py-12 lg:grid-cols-4 lg:py-16">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src={resolvedLogoPath}
                                alt={branding.company_name}
                                className="h-14 w-14 object-contain sm:h-20 sm:w-20"
                            />
                            <div>
                                <p className="font-heading text-sm font-bold text-white sm:text-base">
                                    {branding.company_name}
                                </p>
                                <p className="text-[0.62rem] tracking-[0.18em] text-white/72 uppercase sm:text-[0.68rem] sm:tracking-[0.2em]">
                                    {branding.company_subtitle}
                                </p>
                            </div>
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-white/78">
                            {t.footerIntro}
                        </p>
                        {footerSocials.length > 0 ? (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {footerSocials.map((social, index) => {
                                    const Icon = social.icon;

                                    return (
                                        <a
                                            key={`${social.label}_${index}`}
                                            href={social.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={social.label}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/22 bg-white/10 text-white shadow-[0_16px_30px_-16px_rgba(55,6,13,0.55)] transition hover:-translate-y-0.5 hover:border-white/42 hover:bg-white/16 hover:text-white"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:col-span-3">
                        {t.footer.map((section) => (
                            <div key={section.heading}>
                                <h3 className="font-heading text-sm font-semibold tracking-wider text-white uppercase sm:text-base">
                                    {section.heading}
                                </h3>
                                <ul className="mt-4 space-y-2.5 sm:mt-5">
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
    return <PublicLayoutInner>{children}</PublicLayoutInner>;
}
