import GlobalFaviconHead from '@/components/global-favicon-head';
import PublicSeoHead from '@/components/public/seo-head';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import {
    getPublicSocialAccounts,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import { dashboard } from '@/routes';
import customer from '@/routes/customer';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AtSign,
    ChevronDown,
    Facebook,
    Instagram,
    Linkedin,
    MessageCircle,
    Music2,
    Pin,
    Send,
    Share2,
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
            { label: 'Artikel', href: '/artikel' },
            { label: 'Galeri', href: '/galeri' },
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
    const [mobileOpen, setMobileOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(88);
    const headerRef = useRef<HTMLElement | null>(null);
    const page = usePage<SharedData>();
    const { auth, branding, seoSettings, publicBranding } = page.props;
    const t = content.id;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const resolvedLogoPath = publicBranding?.logo_path ?? branding.logo_path;
    const getInitials = useInitials();
    const contactLink = whatsappLinkFromSeo(seo);
    const accountHref = auth.user?.is_super_admin
        ? dashboard().url
        : customer.dashboard().url;
    const accountAvatar = auth.user?.avatar;
    const accountInitials = auth.user?.name ? getInitials(auth.user.name) : 'U';
    const socialIconMap = {
        instagram: Instagram,
        facebook: Facebook,
        youtube: Youtube,
        tiktok: Music2,
        twitter: Twitter,
        x: Twitter,
        whatsapp: MessageCircle,
        telegram: Send,
        linkedin: Linkedin,
        threads: AtSign,
        pinterest: Pin,
        custom: Share2,
    } as const;
    const resolveSocialIcon = (platform: string, url: string) => {
        const normalizedPlatform = platform.toLowerCase().trim();
        const mapped =
            socialIconMap[normalizedPlatform as keyof typeof socialIconMap];

        if (mapped) {
            return mapped;
        }

        const normalizedUrl = url.toLowerCase();
        if (normalizedUrl.includes('instagram.com')) {
            return Instagram;
        }
        if (normalizedUrl.includes('facebook.com')) {
            return Facebook;
        }
        if (
            normalizedUrl.includes('youtube.com') ||
            normalizedUrl.includes('youtu.be')
        ) {
            return Youtube;
        }
        if (normalizedUrl.includes('tiktok.com')) {
            return Music2;
        }
        if (
            normalizedUrl.includes('twitter.com') ||
            normalizedUrl.includes('x.com')
        ) {
            return Twitter;
        }
        if (
            normalizedUrl.includes('wa.me') ||
            normalizedUrl.includes('whatsapp.com')
        ) {
            return MessageCircle;
        }
        if (
            normalizedUrl.includes('t.me') ||
            normalizedUrl.includes('telegram.me')
        ) {
            return Send;
        }
        if (normalizedUrl.includes('linkedin.com')) {
            return Linkedin;
        }
        if (normalizedUrl.includes('threads.net')) {
            return AtSign;
        }
        if (normalizedUrl.includes('pinterest.com')) {
            return Pin;
        }

        return Share2;
    };
    const footerSocials = getPublicSocialAccounts(seo).map((social) => ({
        ...social,
        icon: resolveSocialIcon(social.platform, social.url),
    }));
    const resolvedPathname =
        typeof window !== 'undefined'
            ? window.location.pathname
            : (String(page.url ?? '').split('?')[0] ?? '');
    const isHomePage = resolvedPathname === '/';
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
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
            className="public-shell flex min-h-screen flex-col overflow-x-hidden bg-background font-sans text-foreground antialiased"
            style={{
                ['--public-header-h' as any]: `${headerHeight}px`,
            }}
        >
            <GlobalFaviconHead />
            <PublicSeoHead />
            <style>{`
                :root { 
                    scroll-behavior: smooth; 
                    scroll-padding-top: var(--public-header-h, 88px);
                }
                .font-heading { font-family: 'Outfit', 'Trebuchet MS', sans-serif; }
                .font-sans { font-family: 'Manrope', 'Segoe UI', sans-serif; }
            `}</style>

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff7ef_0%,#fff1dc_15%,#f6dfc7_34%,#efcfb7_56%,#f8ece1_78%,#fff8f2_100%)] dark:bg-[linear-gradient(180deg,#220b11_0%,#17070d_18%,#1d0d14_42%,#15080f_68%,#10060b_100%)]" />
                <div className="absolute inset-x-0 top-0 h-[24rem] bg-[linear-gradient(180deg,rgba(126,11,24,0.18)_0%,rgba(126,11,24,0.08)_28%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(226,167,78,0.08)_0%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(230,156,50,0.12)_0%,transparent_46%),radial-gradient(circle_at_78%_16%,rgba(189,49,34,0.10)_0%,transparent_50%),radial-gradient(circle_at_72%_76%,rgba(142,16,27,0.08)_0%,transparent_56%),radial-gradient(circle_at_22%_86%,rgba(93,8,18,0.06)_0%,transparent_56%)] opacity-90 dark:opacity-55" />
                <div className="absolute inset-y-0 right-[22%] w-40 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.24)_18%,transparent_58%)] opacity-55 blur-xl dark:opacity-18" />
            </div>

            <header
                ref={headerRef}
                className="fixed top-0 right-0 left-0 z-50 border-b border-[#d8bd91]/35 bg-white/90 shadow-[0_12px_40px_rgba(58,14,32,0.07)] backdrop-blur-xl"
            >
                <div className="relative container mx-auto flex items-center justify-between gap-4 px-5 py-3 text-[#64132e] sm:px-6">
                    <Link
                        href="/"
                        className="flex min-w-0 items-center gap-2 sm:gap-3"
                    >
                        <img
                            src={resolvedLogoPath}
                            alt={branding.company_name}
                            className="h-11 w-11 object-contain sm:h-14 sm:w-14"
                        />
                        <div className="max-w-[13.5rem] min-w-0 sm:max-w-[14rem] md:max-w-[10rem]">
                            <p className="font-heading truncate text-xs font-bold text-current sm:text-base">
                                {branding.company_name}
                            </p>
                            <p className="mt-0.5 [display:-webkit-box] overflow-hidden text-[0.6rem] leading-snug tracking-[0.08em] text-current/75 uppercase [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-[0.68rem] sm:tracking-[0.12em]">
                                {branding.company_subtitle}
                            </p>
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium text-current/80 lg:flex">
                        {t.nav.map((item) =>
                            item.href === '/paket-umroh' ? (
                                <div key={item.href} className="group relative">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 transition hover:text-current"
                                    >
                                        {item.label}
                                        <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                                    </button>
                                    <div className="pointer-events-none absolute top-full left-0 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                                        <div className="min-w-52 overflow-hidden rounded-2xl border border-[#d8bd91]/45 bg-[#fffdf9]/98 p-2 shadow-[0_24px_60px_rgba(58,14,32,0.16)] backdrop-blur-xl">
                                            {packageNavItems.map(
                                                (packageItem) => (
                                                    <Link
                                                        key={packageItem.href}
                                                        href={packageItem.href}
                                                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#64132e]/75 transition hover:bg-[#f7ead7] hover:text-[#64132e]"
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
                                    className="transition hover:text-current"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>
                    <div className="hidden items-center gap-3 lg:flex">
                        {auth.user ? (
                            <Link
                                href={accountHref}
                                className="inline-flex items-center gap-2 rounded-full border border-[#d8bd91]/45 bg-white/75 px-2.5 py-1.5 text-sm font-semibold text-[#64132e] shadow-[0_10px_24px_rgba(58,14,32,0.06)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(58,14,32,0.1)]"
                            >
                                <Avatar className="h-8 w-8 border border-[#d8bd91]/40">
                                    <AvatarImage
                                        src={accountAvatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="bg-[#f4e5ce] text-xs font-bold text-[#64132e]">
                                        {accountInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden xl:inline">
                                    Portal Saya
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-full border border-[#d8bd91]/45 bg-white/75 px-4 py-2 text-sm font-semibold text-[#64132e] shadow-[0_10px_24px_rgba(58,14,32,0.06)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(58,14,32,0.1)]"
                            >
                                {t.signIn}
                            </Link>
                        )}
                        {contactLink ? (
                            <a
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#4a0d21] to-[#7d1b3d] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(74,13,33,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(74,13,33,0.24)]"
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
                            className="inline-flex items-center justify-center rounded-xl border border-[#d8bd91]/50 bg-white p-2 text-current shadow-sm transition hover:bg-[#fff8ed]"
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
                    className={`absolute top-full right-0 left-0 border-t border-[#d8bd91]/35 bg-[#fffaf3]/98 text-[#64132e] shadow-[0_22px_50px_rgba(58,14,32,0.14)] backdrop-blur-xl transition-all duration-200 lg:hidden ${mobileOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
                >
                    <div className="relative container mx-auto flex flex-col gap-2 overflow-hidden px-4 py-4">
                        {t.nav.map((item) =>
                            item.href === '/paket-umroh' ? (
                                <div
                                    key={item.href}
                                    className="rounded-xl border border-[#d8bd91]/35 bg-white/65 p-2"
                                >
                                    <p className="px-2 py-1 text-sm font-semibold text-current">
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
                                                className="rounded-xl px-3 py-2 text-sm font-medium text-current/80 transition hover:bg-[#f4e5ce] hover:text-current"
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
                                    className="rounded-xl px-3 py-2 text-sm font-semibold text-current transition hover:bg-[#f4e5ce]"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                        <div className="mt-2 flex flex-col gap-2">
                            {auth.user ? (
                                <Link
                                    href={accountHref}
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center gap-3 rounded-xl border border-[#d8bd91]/35 bg-white/70 px-3 py-2.5 text-sm font-semibold text-[#64132e] transition hover:bg-white"
                                >
                                    <Avatar className="h-9 w-9 border border-[#d8bd91]/35">
                                        <AvatarImage
                                            src={accountAvatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="bg-[#f4e5ce] text-xs font-bold text-[#64132e]">
                                            {accountInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 text-left">
                                        <p className="truncate text-sm font-semibold text-current">
                                            Portal Saya
                                        </p>
                                        <p className="truncate text-xs text-current/65">
                                            {auth.user.name}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center rounded-xl border border-[#d8bd91]/45 bg-white/75 px-3 py-2.5 text-sm font-semibold text-[#64132e] transition hover:bg-white"
                                >
                                    {t.signIn}
                                </Link>
                            )}
                            {contactLink ? (
                                <a
                                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#4a0d21] to-[#7d1b3d] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
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
                className={`relative z-10 flex-1 ${isHomePage ? 'pt-0' : 'pt-[var(--public-header-h)]'}`}
            >
                {!isHomePage ? (
                    <>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/28 via-white/10 to-transparent dark:from-white/[0.03] dark:via-transparent" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(230,156,50,0.10)_0%,transparent_40%),radial-gradient(circle_at_86%_22%,rgba(189,49,34,0.08)_0%,transparent_46%),radial-gradient(circle_at_78%_92%,rgba(93,8,18,0.06)_0%,transparent_55%)] opacity-70 dark:opacity-35" />
                    </>
                ) : null}
                {children}
            </main>

            {contactLink ? (
                <a
                    href={contactLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Hubungi kami via WhatsApp"
                    className="fixed right-5 bottom-5 z-[120] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(37,211,102,.45)] transition hover:scale-105 hover:shadow-[0_14px_36px_rgba(37,211,102,.55)]"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-8 w-8"
                    >
                        <path
                            fill="currentColor"
                            d="M20.52 3.48A11.84 11.84 0 0 0 12.06 0C5.5 0 .14 5.36.14 11.92c0 2.1.55 4.16 1.6 5.98L0 24l6.27-1.65a11.9 11.9 0 0 0 5.8 1.5h.01c6.56 0 11.92-5.36 11.92-11.92a11.83 11.83 0 0 0-3.48-8.45Zm-8.45 18.35h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.72.98.99-3.62-.24-.37a9.9 9.9 0 0 1-1.51-5.3C2.18 6.45 6.6 2.03 12.06 2.03c2.64 0 5.12 1.03 7 2.91a9.85 9.85 0 0 1 2.9 7c0 5.46-4.43 9.89-9.89 9.89Zm5.42-7.42c-.3-.15-1.75-.86-2.03-.95-.27-.1-.47-.15-.67.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.63.07-.3-.15-1.24-.45-2.37-1.45-.87-.77-1.47-1.73-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52s1.08 2.93 1.23 3.13c.15.2 2.1 3.2 5.08 4.5.71.3 1.26.48 1.69.61.71.23 1.35.2 1.86.12.56-.08 1.75-.71 2-1.4.25-.68.25-1.27.17-1.4-.07-.12-.27-.2-.57-.35Z"
                        />
                    </svg>
                </a>
            ) : null}

            <footer className="relative mt-auto overflow-hidden bg-gradient-to-br from-[#220611] via-[#64132e] to-[#220611] py-14 text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgba(224,178,100,0.12)_0%,transparent_32%),radial-gradient(circle_at_88%_70%,rgba(255,255,255,0.06)_0%,transparent_34%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bd91]/65 to-transparent" />

                <div className="relative container mx-auto grid gap-10 px-6 lg:grid-cols-[1.25fr_.75fr_.75fr_.9fr]">
                    <div className="max-w-md">
                        <Link href="/" className="flex items-center gap-3.5">
                            <img
                                src={resolvedLogoPath}
                                alt={branding.company_name}
                                className="h-14 w-14 object-contain"
                            />
                            <div>
                                <p className="font-heading text-2xl font-bold text-white">
                                    {branding.company_name}
                                </p>
                                <p className="mt-1 text-xs font-semibold tracking-[0.08em] text-[#e4c27c]">
                                    {branding.company_subtitle}
                                </p>
                            </div>
                        </Link>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
                            {t.footerIntro}
                        </p>
                        {footerSocials.length > 0 ? (
                            <div className="mt-6 flex flex-wrap gap-2.5">
                                {footerSocials.map((social, index) => {
                                    const Icon = social.icon;

                                    return (
                                        <a
                                            key={`${social.label}_${index}`}
                                            href={social.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={social.label}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] text-white/70 transition hover:-translate-y-0.5 hover:border-[#e4c27c]/45 hover:bg-[#e4c27c]/12 hover:text-[#f2dba8]"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                    {t.footer.map((section) => (
                        <div key={section.heading}>
                            <h3 className="font-heading text-xs font-bold tracking-[0.18em] text-[#e4c27c] uppercase">
                                {section.heading}
                            </h3>
                            <ul className="mt-5 flex flex-col gap-3">
                                {section.links.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            className="text-sm text-white/65 transition hover:text-white"
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
                <div className="relative container mx-auto mt-10 px-6">
                    <div className="border-t border-white/10 pt-6 text-center text-xs tracking-wide text-white/45 sm:text-left">
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
