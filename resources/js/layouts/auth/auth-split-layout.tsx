import BrandThemeStyle from '@/components/brand-theme-style';
import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ShieldCheck } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import { type SharedData } from '@/types';

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
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[var(--auth-shell)] px-6 py-10 font-[var(--font-auth-sans)] text-slate-900 dark:bg-[var(--auth-shell-dark)] dark:text-slate-50">
            <BrandThemeStyle />
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--brand-primary)_18%,transparent)_0%,_transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_color-mix(in_srgb,var(--brand-accent)_22%,transparent)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--brand-secondary)_10%,transparent)_1px,transparent_0)] [background-size:36px_36px]" />
            </div>

            <div className="relative w-full max-w-5xl">
                <div className="grid overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.32)] backdrop-blur-xl md:min-h-[520px] md:grid-cols-[1.05fr_1fr] dark:border-white/10 dark:bg-slate-950/90 dark:text-slate-50">
                    <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--auth-panel)] px-8 py-10 text-slate-900 md:px-10 dark:text-white">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-white/10" />
                            <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-white/15" />
                            <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white/10" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <Link href={home()} className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/35 p-2 dark:bg-white/15">
                                    <img src={branding.logo_white_path} alt={branding.company_name} className="h-full w-full object-contain" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="block text-sm font-semibold tracking-wide text-slate-900 dark:text-white/95">
                                        {branding.company_name}
                                    </span>
                                    <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-slate-800/80 dark:text-white/75">
                                        {branding.company_subtitle}
                                    </span>
                                </div>
                            </Link>
                        </div>

                        <div className="relative z-10 mt-10 space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-800/75 dark:text-white/75">
                                {resolvedSideTitle}
                            </p>
                            <h2 className="text-3xl font-[var(--font-auth-display)] font-semibold leading-tight text-slate-950 md:text-4xl dark:text-white">
                                {sideHeadline}
                            </h2>
                            <p className="max-w-sm text-sm text-slate-800/80 dark:text-white/75">
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
                                    <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-white/35 px-3 py-3 dark:bg-white/10">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/40 dark:bg-white/15">
                                            <item.icon className="h-4 w-4 text-slate-900 dark:text-white" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                                            <p className="text-xs text-slate-800/80 dark:text-white/70">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 text-xs text-slate-800/80 dark:text-white/70">
                            Layanan umroh terencana untuk keluarga dan jamaah Anda.
                        </div>
                    </div>

                    <div className="relative flex flex-col justify-center bg-white/92 px-8 py-10 text-slate-900 md:px-10 dark:bg-slate-950/85 dark:text-slate-50">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-24 top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
                            <div className="absolute -left-20 bottom-10 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />
                        </div>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-accent/30 to-transparent" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <img src={branding.logo_path} alt={branding.company_name} className="h-7 w-7 object-contain" />
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
