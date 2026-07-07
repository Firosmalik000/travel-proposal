import AppLogoIcon from '@/components/app-logo-icon';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type CSSProperties, type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { branding } = usePage<SharedData>().props;

    const authTheme = {
        '--auth-shell': '#f3f6fb',
        '--auth-shell-dark': '#0b1220',
        '--auth-card-bg': '#ffffff',
        '--auth-card-border': 'rgba(15, 23, 42, 0.08)',
        '--auth-card-foreground': '#0f172a',
        '--auth-card-muted': '#64748b',
        '--auth-panel': '#0f172a',
    } as CSSProperties;

    return (
        <div
            style={authTheme}
            className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[var(--auth-shell)] px-4 py-8 font-[var(--font-auth-sans)] text-[var(--auth-card-foreground)] sm:px-6 dark:bg-[var(--auth-shell-dark)]"
        >
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.10),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.78),rgba(2,6,23,0.96))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0f172a,#c80012,#0f172a)] opacity-90" />

            <div className="relative z-10 w-full max-w-[1080px]">
                <div className="grid animate-in overflow-hidden rounded-[28px] border border-[var(--auth-card-border)] bg-[var(--auth-card-bg)] shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] duration-700 fade-in slide-in-from-bottom-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="flex flex-col justify-between gap-10 bg-[var(--auth-panel)] p-8 text-white sm:p-10">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-3 font-medium transition-opacity hover:opacity-90"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <AppLogoIcon className="h-7 w-auto text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {branding.company_name}
                                </p>
                                <p className="text-[0.7rem] tracking-[0.22em] text-slate-300 uppercase">
                                    {branding.company_subtitle}
                                </p>
                            </div>
                        </Link>

                        <div className="space-y-4">
                            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-white uppercase">
                                Admin Access
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-[var(--font-auth-display)] font-semibold tracking-tight text-white md:text-4xl">
                                    {title}
                                </h1>
                                <p className="max-w-md text-sm leading-relaxed text-slate-300">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-slate-200">
                            <div className="flex items-start gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-white/70" />
                                <div>
                                    <p className="font-medium text-white">
                                        Stabil untuk operasional harian
                                    </p>
                                    <p className="mt-0.5 text-slate-300">
                                        Desain ringkas untuk akses kerja yang
                                        cepat.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-white/70" />
                                <div>
                                    <p className="font-medium text-white">
                                        Fokus ke data penting
                                    </p>
                                    <p className="mt-0.5 text-slate-300">
                                        Tanpa elemen visual yang mengganggu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 lg:p-10 dark:bg-slate-950">
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                                    Login Panel
                                </p>
                                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    Masuk menggunakan akun internal yang sudah
                                    terdaftar.
                                </p>
                            </div>
                        </div>

                        <div className="relative">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
