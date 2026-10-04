import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import KaabaIllustration from '@/components/kaaba-illustration';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Compass, MapPin, Plane } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthSplitLayoutProps {
    title: string;
    description: string;
    sideTitle?: string;
    sideHeadline?: string;
    sideDescription?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    sideTitle,
    sideHeadline = 'Perjalanan dimulai dari sini',
    sideDescription = 'Kelola kebutuhan perjalanan umroh dengan lebih tenang, rapi, dan aman.',
}: PropsWithChildren<AuthSplitLayoutProps>) {
    const { branding } = usePage<SharedData>().props;
    const resolvedSideTitle = sideTitle ?? branding.company_subtitle;

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f5f3f0] px-4 py-6 font-[var(--font-auth-sans)] text-slate-950 sm:px-6 sm:py-10 dark:bg-[#0d1117] dark:text-slate-50">
            <GlobalFaviconHead />
            <BrandThemeStyle />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] blur-3xl" />
                <div className="absolute -right-32 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary)_14%,transparent)] blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-[980px]">
                <div className="grid overflow-hidden rounded-[24px] bg-white shadow-[0_28px_90px_-52px_rgba(15,23,42,0.55)] ring-1 ring-black/5 lg:grid-cols-[0.92fr_1.08fr] dark:bg-[#151a22] dark:ring-white/10">
                    <aside className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[var(--brand-secondary)] px-7 py-7 text-white sm:px-10 sm:py-9 lg:min-h-[590px]">
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-black/15 blur-3xl" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="absolute top-1/2 -right-16 h-64 w-64 -translate-y-1/2 rounded-full border border-white/15" />
                            <div className="absolute top-1/2 -right-6 h-48 w-48 -translate-y-1/2 rounded-full border border-white/10" />
                            <div className="absolute right-8 bottom-28 h-24 w-24 rounded-t-full border border-b-0 border-white/10" />
                        </div>

                        <Link
                            href={home()}
                            className="relative inline-flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
                        >
                            <img
                                src={branding.logo_white_path}
                                alt={branding.company_name}
                                className="h-10 w-auto object-contain"
                            />
                            <span className="text-sm font-semibold tracking-wide">
                                {branding.company_name}
                            </span>
                        </Link>

                        <div className="relative mt-10 max-w-sm lg:mt-0">
                            <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-white/65 uppercase">
                                {resolvedSideTitle}
                            </p>
                            <h2 className="max-w-xs text-3xl leading-[1.08] font-semibold tracking-[-0.03em] sm:text-4xl">
                                {sideHeadline}
                            </h2>
                            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
                                {sideDescription}
                            </p>
                        </div>

                        <div className="relative mt-8 flex items-end justify-between gap-4 lg:mt-0">
                            <div className="absolute inset-x-0 bottom-0 h-44 rounded-[40%] bg-white/[0.04] blur-2xl" />
                            <KaabaIllustration className="relative -mb-4 -ml-6 h-48 w-[min(100%,320px)] text-white sm:h-56" />
                            <div className="relative mb-4 shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
                                <p className="text-[9px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                                    Baitullah
                                </p>
                                <p className="mt-1 text-xs font-medium text-white/90">
                                    Niat baik, perjalanan baik
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-10 max-w-sm rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.16em] text-white/60 uppercase">
                                <span>Rute perjalanan</span>
                                <Compass className="h-4 w-4 text-white/70" />
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Makkah
                                    </p>
                                    <p className="text-[11px] text-white/55">
                                        Ibadah utama
                                    </p>
                                </div>
                                <div className="mx-1 flex min-w-12 flex-1 items-center gap-1">
                                    <span className="h-px flex-1 border-t border-dashed border-white/35" />
                                    <Plane className="h-3.5 w-3.5 rotate-12 text-white/70" />
                                    <span className="h-px flex-1 border-t border-dashed border-white/35" />
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        Madinah
                                    </p>
                                    <p className="text-[11px] text-white/55">
                                        Ziarah penuh makna
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="relative flex items-center bg-white px-6 py-8 sm:px-10 sm:py-12 lg:px-14 dark:bg-[#151a22]">
                        <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 overflow-hidden opacity-70">
                            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)]" />
                            <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)]" />
                        </div>
                        <div className="w-full max-w-md">
                            <div className="mb-8 border-b border-slate-200/80 pb-6 dark:border-white/10">
                                <div className="mb-5 flex items-center gap-2 text-[var(--brand-primary)]">
                                    <span className="h-1 w-10 rounded-full bg-[var(--brand-primary)]" />
                                    <span className="h-1 w-1 rounded-full bg-[var(--brand-primary)]/45" />
                                    <span className="h-1 w-1 rounded-full bg-[var(--brand-primary)]/25" />
                                </div>
                                <h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-3xl dark:text-white">
                                    {title}
                                </h1>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    {description}
                                </p>
                            </div>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
