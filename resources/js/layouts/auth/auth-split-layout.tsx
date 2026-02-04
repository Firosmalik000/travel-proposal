import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
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
    sideTitle = 'AMANAH HARMAIN',
    sideHeadline = 'Umroh Profesional & Terpercaya',
    sideDescription = 'Kelola jadwal, paket, dan kebutuhan jamaah dengan layanan yang rapi dan transparan.',
}: PropsWithChildren<AuthSplitLayoutProps>) {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f5f8fd_0%,#eef3fa_50%,#f7f3ea_100%)] px-6 py-10 font-[var(--font-auth-sans)] text-[var(--ink-700)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(43,69,112,0.12)_0%,_transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(200,164,96,0.2)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(43,69,112,0.08)_1px,transparent_0)] [background-size:36px_36px]" />
            </div>

            <div className="relative w-full max-w-5xl">
                <div className="grid overflow-hidden rounded-[36px] border border-white/70 bg-white text-slate-900 shadow-[0_40px_120px_-70px_rgba(31,47,77,0.45)] md:min-h-[520px] md:grid-cols-[1.05fr_1fr]">
                    <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(140deg,#1f2f4d_0%,#2b4570_55%,#0f766e_100%)] px-8 py-10 md:px-10">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-white/10" />
                            <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-white/15" />
                            <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white/10" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <Link href={home()} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                    <AppLogoIcon className="h-5 w-auto text-white" />
                                </div>
                                <span className="text-sm font-semibold tracking-wide text-white/90">
                                    Amanah Haramain
                                </span>
                            </Link>
                        </div>

                        <div className="relative z-10 mt-10 space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
                                {sideTitle}
                            </p>
                            <h2 className="text-3xl font-[var(--font-auth-display)] font-semibold leading-tight text-white md:text-4xl">
                                {sideHeadline}
                            </h2>
                            <p className="max-w-sm text-sm text-white/75">
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
                                    <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-white/10 px-3 py-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                                            <item.icon className="h-4 w-4 text-white" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{item.title}</p>
                                            <p className="text-xs text-white/70">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 text-xs text-white/70">
                            Layanan umroh terencana untuk keluarga dan jamaah Anda.
                        </div>
                    </div>

                    <div className="relative flex flex-col justify-center px-8 py-10 text-[var(--ink-700)] md:px-10">
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-24 top-10 h-44 w-44 rounded-full bg-[rgba(43,69,112,0.08)] blur-3xl" />
                            <div className="absolute -left-20 bottom-10 h-36 w-36 rounded-full bg-[rgba(200,164,96,0.12)] blur-3xl" />
                        </div>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[rgba(43,69,112,0.5)] via-[rgba(43,69,112,0.15)] to-transparent" />
                        <div className="space-y-2">
                            <h1 className="text-2xl font-[var(--font-auth-display)] font-semibold text-[var(--emerald-900)] md:text-3xl">
                                {title}
                            </h1>
                            <p className="text-sm text-[var(--ink-600)]">
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
