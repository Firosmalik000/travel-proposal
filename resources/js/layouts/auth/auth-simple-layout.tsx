import AppLogoIcon from '@/components/app-logo-icon';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import KaabaIllustration from '@/components/kaaba-illustration';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, MapPin, Plane } from 'lucide-react';
import { type PropsWithChildren } from 'react';

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

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f5f3f0] px-4 py-8 font-[var(--font-auth-sans)] text-slate-950 sm:px-6 dark:bg-[#0d1117] dark:text-slate-50">
            <GlobalFaviconHead />
            <BrandThemeStyle />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-44 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] blur-3xl" />
                <div className="absolute -right-40 -bottom-44 h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary)_12%,transparent)] blur-3xl" />
                <div className="absolute top-10 left-8 h-40 w-40 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] sm:left-16" />
                <div className="absolute top-16 left-14 h-28 w-28 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] sm:left-[5.5rem]" />
            </div>

            <div className="relative z-10 w-full max-w-[460px]">
                <Link
                    href={home()}
                    className="mx-auto mb-6 flex w-fit items-center gap-3 transition-opacity hover:opacity-75"
                >
                    <AppLogoIcon className="h-11 w-auto" />
                    <div>
                        <p className="text-sm font-semibold tracking-wide">
                            {branding.company_name}
                        </p>
                        <p className="mt-0.5 text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                            {branding.company_subtitle}
                        </p>
                    </div>
                </Link>

                <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    <span>Makkah</span>
                    <span className="h-px w-7 border-t border-dashed border-slate-300 dark:border-white/20" />
                    <Plane className="h-3.5 w-3.5 rotate-12 text-[var(--brand-primary)]" />
                    <span>Madinah</span>
                </div>

                <main className="relative overflow-hidden rounded-[28px] bg-white px-6 py-8 shadow-[0_28px_90px_-52px_rgba(15,23,42,0.55)] ring-1 ring-black/5 sm:px-10 sm:py-10 dark:bg-[#151a22] dark:ring-white/10">
                    <div className="relative -mx-6 -mt-8 mb-8 h-32 overflow-hidden bg-[var(--brand-secondary)] px-6 sm:-mx-10 sm:-mt-10 sm:px-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(255,255,255,0.2),transparent_35%),linear-gradient(135deg,transparent_30%,rgba(0,0,0,0.18))]" />
                        <KaabaIllustration className="absolute -right-1 bottom-[-4.5rem] h-48 w-64 text-white/90 sm:right-4" />
                        <div className="relative flex h-full items-end pb-4">
                            <div className="rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-white backdrop-blur-sm">
                                <p className="text-[9px] font-semibold tracking-[0.18em] text-white/60 uppercase">
                                    Perjalanan ibadah
                                </p>
                                <p className="mt-1 text-xs font-medium">
                                    Makkah dan Madinah
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute top-24 right-4 h-24 w-24 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)]" />
                    <div className="mb-8">
                        <div className="mb-5 flex items-center gap-2 text-[var(--brand-primary)]">
                            <span className="h-1 w-10 rounded-full bg-[var(--brand-primary)]" />
                            <span className="h-1 w-1 rounded-full bg-[var(--brand-primary)]/45" />
                            <span className="h-1 w-1 rounded-full bg-[var(--brand-primary)]/25" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                    {children}
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
                        <span>Jelas rencananya</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Terjamin amanahnya</span>
                    </div>
                </main>
            </div>
        </div>
    );
}
