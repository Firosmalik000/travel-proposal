import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
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
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[linear-gradient(120deg,#f5f6f2_0%,#f7fbfb_45%,#f2f7f8_100%)] dark:bg-[linear-gradient(120deg,#0b1116_0%,#101620_55%,#111b24_100%)] px-6 py-10 font-[var(--font-auth-sans)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-56 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(15,118,110,0.24)_0%,_rgba(15,118,110,0.12)_45%,_transparent_70%)] blur-3xl opacity-80 dark:opacity-35" />
                <div className="absolute -bottom-52 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(224,168,88,0.2)_0%,_rgba(224,168,88,0.1)_45%,_transparent_70%)] blur-3xl opacity-70 dark:opacity-30" />
                <div className="absolute top-24 -left-32 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,_rgba(29,78,216,0.16)_0%,_rgba(29,78,216,0.06)_50%,_transparent_75%)] blur-2xl opacity-70 dark:opacity-35" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.08)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_0)] [background-size:22px_22px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,_rgba(0,0,0,0.7)_0%,_transparent_68%)]" />

            <div className="relative z-10 w-full max-w-[460px]">
                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-3 font-medium transition-transform duration-300 hover:scale-[1.03]"
                        >
                            <div className="relative flex h-16 w-16 items-center justify-center">
                                <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(circle,_rgba(237,28,36,0.28)_0%,_transparent_70%)] blur-xl opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-white/75 dark:bg-slate-950/70 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f766e] to-[#0b5f54] shadow-[0_18px_40px_-20px_rgba(15,118,110,0.55)]">
                                        <AppLogoIcon className="h-7 w-auto text-white drop-shadow-sm" />
                                    </div>
                                </div>
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-3 text-center">
                            <h1 className="text-3xl font-[var(--font-auth-display)] font-semibold tracking-tight text-slate-900 dark:text-white md:text-4xl">
                                {title}
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="relative group/card">
                        <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-primary/20 via-amber-200/30 to-primary/10 opacity-70 blur-2xl transition-opacity duration-300 group-hover/card:opacity-90 dark:from-primary/25 dark:via-amber-500/10 dark:to-primary/20" />

                        <div className="relative rounded-[32px] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-950/75 backdrop-blur-2xl p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.6)]">
                            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
