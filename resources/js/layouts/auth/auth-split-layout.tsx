import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ShieldCheck } from 'lucide-react';
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
    sideHeadline = 'Umroh Profesional & Terpercaya',
    sideDescription = 'Kelola jadwal, paket, dan kebutuhan jamaah dengan layanan yang rapi dan transparan.',
}: PropsWithChildren<AuthSplitLayoutProps>) {
    const { branding } = usePage<SharedData>().props;
    const resolvedSideTitle = sideTitle ?? branding.company_subtitle;

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[linear-gradient(160deg,color-mix(in_srgb,var(--auth-shell)_78%,white_22%)_0%,white_42%,color-mix(in_srgb,var(--brand-accent)_10%,white)_100%)] px-6 py-10 font-[var(--font-auth-sans)] text-slate-900 dark:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--auth-shell-dark)_84%,black_16%)_0%,color-mix(in_srgb,var(--auth-shell-dark)_94%,var(--brand-primary)_6%)_100%)] dark:text-slate-50">
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_color-mix(in_srgb,var(--brand-primary)_20%,white_10%)_0%,_transparent_48%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_color-mix(in_srgb,var(--brand-accent)_30%,transparent)_0%,_transparent_58%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,var(--brand-secondary)_10%,transparent)_0%,_transparent_72%)]" />
                <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--brand-secondary)_11%,transparent)_1px,transparent_0)] [background-size:36px_36px] opacity-60" />
            </div>

            <div className="relative w-full max-w-5xl">
                <div className="grid overflow-hidden rounded-[32px] border border-white/70 bg-white/88 text-slate-900 shadow-[0_42px_120px_-64px_rgba(148,88,42,0.34)] backdrop-blur-xl md:min-h-[520px] md:grid-cols-[1.05fr_1fr] dark:border-white/10 dark:bg-slate-950/88 dark:text-slate-50">
                    <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,color-mix(in_srgb,var(--auth-panel)_82%,white_18%)_0%,color-mix(in_srgb,var(--brand-primary)_42%,white_58%)_58%,color-mix(in_srgb,var(--brand-accent)_58%,white_42%)_100%)] px-8 py-10 text-slate-900 md:px-10 dark:bg-[linear-gradient(150deg,color-mix(in_srgb,var(--auth-panel)_82%,black_18%)_0%,color-mix(in_srgb,var(--brand-primary)_38%,black_62%)_58%,color-mix(in_srgb,var(--brand-accent)_28%,black_72%)_100%)] dark:text-white">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-white/18 blur-xl" />
                            <div className="absolute right-10 bottom-10 h-24 w-24 rounded-full bg-amber-100/30 blur-lg dark:bg-white/15" />
                            <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white/14 blur-2xl" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.14)_100%)] dark:bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.06)_100%)]" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <Link
                                href={home()}
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/40 p-2 shadow-[0_14px_32px_-20px_rgba(255,255,255,0.85)] dark:bg-white/15">
                                    <img
                                        src={branding.logo_white_path}
                                        alt={branding.company_name}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="block text-sm font-semibold tracking-wide text-slate-900 dark:text-white/95">
                                        {branding.company_name}
                                    </span>
                                    <span className="block text-[0.68rem] tracking-[0.24em] text-slate-800/80 uppercase dark:text-white/75">
                                        {branding.company_subtitle}
                                    </span>
                                </div>
                            </Link>
                        </div>

                        <div className="relative z-10 mt-10 space-y-4">
                            <p className="text-xs font-semibold tracking-[0.35em] text-slate-900/70 uppercase dark:text-white/75">
                                {resolvedSideTitle}
                            </p>
                            <h2 className="text-3xl leading-tight font-[var(--font-auth-display)] font-semibold text-slate-950 md:text-4xl dark:text-white">
                                {sideHeadline}
                            </h2>
                            <p className="max-w-sm text-sm leading-6 text-slate-900/75 dark:text-white/75">
                                {sideDescription}
                            </p>
                            <div className="mt-6 grid gap-3 text-xs text-white/80">
                                {[
                                    {
                                        icon: BadgeCheck,
                                        title: 'Legalitas Terverifikasi',
                                        desc: 'Data jamaah dan dokumen selalu terjaga.',
                                    },
                                    {
                                        icon: CalendarDays,
                                        title: 'Jadwal Terstruktur',
                                        desc: 'Pantau seat dan keberangkatan lebih jelas.',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Layanan Aman',
                                        desc: 'Proses transparan dengan kontrol penuh.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="flex items-start gap-3 rounded-2xl border border-white/30 bg-white/38 px-3 py-3 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:bg-white/10"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/55 dark:bg-white/15">
                                            <item.icon className="h-4 w-4 text-slate-900 dark:text-white" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-slate-800/80 dark:text-white/70">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 text-xs text-slate-800/80 dark:text-white/70">
                            Layanan umroh terencana untuk keluarga dan jamaah
                            Anda.
                        </div>
                    </div>

                    <div className="relative flex flex-col justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,251,245,0.96)_100%)] px-8 py-10 text-slate-900 md:px-10 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.88)_0%,rgba(15,23,42,0.94)_100%)] dark:text-slate-50">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute top-10 -right-24 h-44 w-44 rounded-full bg-primary/14 blur-3xl" />
                            <div className="absolute bottom-10 -left-20 h-36 w-36 rounded-full bg-amber-200/30 blur-3xl dark:bg-accent/15" />
                        </div>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-amber-300/70 to-transparent" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100/80 bg-white/90 shadow-[0_16px_34px_-24px_rgba(148,88,42,0.45)] dark:border-slate-800 dark:bg-slate-900">
                                    <img
                                        src={branding.logo_path}
                                        alt={branding.company_name}
                                        className="h-7 w-7 object-contain"
                                    />
                                </div>
                                <h1 className="text-2xl font-[var(--font-auth-display)] font-semibold text-slate-900 md:text-3xl dark:text-slate-50">
                                    {title}
                                </h1>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        </div>
                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
