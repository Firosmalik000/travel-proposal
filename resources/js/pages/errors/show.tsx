import AppLogoIcon from '@/components/app-logo-icon';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Home, LogOut, RefreshCcw, Undo2 } from 'lucide-react';

type ErrorPageProps = {
    status: number;
    title?: string;
    description?: string;
};

const presets: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description:
            'Kamu tidak punya izin untuk mengakses halaman ini. Jika ini terasa salah, hubungi admin.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description:
            'Halaman yang kamu cari tidak ada atau sudah dipindahkan. Coba kembali ke beranda.',
    },
    419: {
        title: 'Sesi berakhir',
        description:
            'Sesi kamu sudah kedaluwarsa. Silakan muat ulang halaman untuk melanjutkan.',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        description:
            'Terlalu banyak request dalam waktu singkat. Coba lagi beberapa saat.',
    },
    500: {
        title: 'Terjadi kesalahan',
        description:
            'Ada kendala di server. Coba lagi sebentar, atau kembali ke halaman utama.',
    },
    503: {
        title: 'Layanan sedang sibuk',
        description:
            'Server sedang dalam perawatan atau overload. Silakan coba lagi nanti.',
    },
};

export default function ErrorPage({
    status,
    title,
    description,
}: ErrorPageProps) {
    const { auth, branding } = usePage<SharedData>().props as any;
    const isAuthenticated = Boolean(auth?.user);
    const isImpersonating = Boolean(auth?.impersonation?.is_impersonating);
    const preset = presets[status] ?? presets[500];
    const resolvedTitle = title ?? preset.title;
    const resolvedDescription = description ?? preset.description;

    const showReload = status === 419 || status === 503;

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground antialiased">
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <Head title={`${status} - ${resolvedTitle}`} />

            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-56 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-primary)_26%,transparent)_0%,color-mix(in_srgb,var(--brand-primary)_10%,transparent)_52%,transparent_72%)] opacity-80 blur-3xl dark:opacity-35" />
                <div className="absolute -right-40 -bottom-56 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-accent)_22%,transparent)_0%,color-mix(in_srgb,var(--brand-accent)_8%,transparent)_52%,transparent_72%)] opacity-70 blur-3xl dark:opacity-30" />
                <div className="absolute top-24 -left-36 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-secondary)_16%,transparent)_0%,color-mix(in_srgb,var(--brand-secondary)_6%,transparent)_56%,transparent_76%)] opacity-70 blur-3xl dark:opacity-35" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.08)_1px,_transparent_0)] [mask-image:radial-gradient(ellipse_at_center,_rgba(0,0,0,0.7)_0%,_transparent_68%)] [background-size:22px_22px] opacity-60 dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.06)_1px,_transparent_0)]" />

            <div className="relative z-10 w-full max-w-[720px]">
                <div className="flex flex-col items-center gap-8 text-center">
                    <Link
                        href={home()}
                        className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <div className="relative flex h-14 w-14 items-center justify-center">
                            <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-primary)_26%,transparent)_0%,transparent_70%)] opacity-75 blur-xl transition-opacity duration-300 group-hover:opacity-95" />
                            <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-border/60 bg-card/80 p-2 shadow-[0_30px_70px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
                                <AppLogoIcon className="h-9 w-auto" />
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-sm leading-tight font-semibold">
                                {branding?.company_name ?? 'Travel Proposal'}
                            </p>
                            <p className="text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
                                {branding?.company_subtitle ?? 'Portal'}
                            </p>
                        </div>
                    </Link>

                    <div className="w-full rounded-[32px] border border-border/60 bg-card/80 p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.7)] backdrop-blur-2xl md:p-10">
                        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
                            <div className="flex items-baseline gap-3">
                                <span className="text-6xl font-semibold tracking-tight text-foreground md:text-7xl">
                                    {status}
                                </span>
                                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-[0.62rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                                    Error
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                    {resolvedTitle}
                                </h1>
                                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                                    {resolvedDescription}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 pt-2">
                                {showReload ? (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="gap-2"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        Muat ulang
                                    </Button>
                                ) : (
                                    <Button asChild className="gap-2">
                                        <Link href={home()}>
                                            <Home className="h-4 w-4" />
                                            Beranda
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => window.history.back()}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali
                                </Button>

                                {isImpersonating ? (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Link
                                            href="/impersonation/stop"
                                            method="post"
                                            as="button"
                                        >
                                            <Undo2 className="h-4 w-4" />
                                            Kembali ke akun utama
                                        </Link>
                                    </Button>
                                ) : null}

                                {isAuthenticated ? (
                                    <>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Link href={dashboard()}>
                                                Dashboard
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Link>
                                        </Button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
