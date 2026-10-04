import AppLogoIcon from '@/components/app-logo-icon';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import KaabaIllustration from '@/components/kaaba-illustration';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Home,
    LogOut,
    MapPin,
    RefreshCcw,
    Undo2,
} from 'lucide-react';

type ErrorPageProps = {
    status: number;
    title?: string;
    description?: string;
};

const presets: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description: 'Kamu tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description:
            'Halaman ini mungkin sudah dipindahkan atau tidak tersedia.',
    },
    419: {
        title: 'Sesi berakhir',
        description: 'Muat ulang halaman untuk melanjutkan.',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        description: 'Tunggu sebentar lalu coba kembali.',
    },
    500: {
        title: 'Terjadi kesalahan',
        description: 'Ada kendala di server. Silakan coba kembali.',
    },
    503: {
        title: 'Layanan sedang sibuk',
        description: 'Layanan sedang dipersiapkan. Coba lagi sebentar.',
    },
};

export default function ErrorPage({
    status,
    title,
    description,
}: ErrorPageProps) {
    const { auth, branding } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth?.user);
    const isImpersonating = Boolean(auth?.impersonation?.is_impersonating);
    const preset = presets[status] ?? presets[500];
    const resolvedTitle = title ?? preset.title;
    const resolvedDescription = description ?? preset.description;
    const showReload = status === 419 || status === 503;

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f5f3f0] px-5 py-10 text-slate-950 antialiased dark:bg-[#0d1117] dark:text-slate-50">
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <Head title={`${status} - ${resolvedTitle}`} />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] blur-3xl" />
                <div className="absolute -right-40 -bottom-44 h-[30rem] w-[30rem] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary)_14%,transparent)] blur-3xl" />
            </div>

            <main className="relative z-10 w-full max-w-[620px]">
                <Link
                    href={home()}
                    className="mx-auto mb-8 flex w-fit items-center gap-3 transition-opacity hover:opacity-75"
                >
                    <AppLogoIcon className="h-11 w-auto" />
                    <div>
                        <p className="text-sm font-semibold tracking-wide">
                            {branding?.company_name ?? 'Travel Proposal'}
                        </p>
                        <p className="mt-0.5 text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                            {branding?.company_subtitle ?? 'Portal'}
                        </p>
                    </div>
                </Link>

                <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                    Perjalanan Anda tetap kami jaga
                </div>

                <section className="relative overflow-hidden rounded-[28px] bg-white px-6 py-9 text-center shadow-[0_28px_90px_-52px_rgba(15,23,42,0.55)] ring-1 ring-black/5 sm:px-12 sm:py-12 dark:bg-[#151a22] dark:ring-white/10">
                    <div className="relative mx-auto mb-5 h-28 max-w-sm overflow-hidden rounded-2xl bg-[var(--brand-secondary)] text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(255,255,255,0.2),transparent_35%),linear-gradient(135deg,transparent_30%,rgba(0,0,0,0.2))]" />
                        <KaabaIllustration className="absolute right-1 bottom-[-4.5rem] h-48 w-60 text-white/90" />
                        <div className="relative flex h-full items-end p-3 text-left">
                            <p className="rounded-lg border border-white/15 bg-black/10 px-2.5 py-1.5 text-[10px] font-medium backdrop-blur-sm">
                                Tetap tenang, kami bantu lanjutkan perjalanan
                            </p>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)]" />
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] text-[var(--brand-primary)]">
                        <span className="text-2xl font-semibold tracking-[-0.06em]">
                            {status}
                        </span>
                    </div>

                    <h1 className="mt-7 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                        {resolvedTitle}
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {resolvedDescription}
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                        {showReload ? (
                            <Button
                                onClick={() => window.location.reload()}
                                className="gap-2 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Muat ulang
                            </Button>
                        ) : (
                            <Button
                                asChild
                                className="gap-2 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90"
                            >
                                <Link href={home()}>
                                    <Home className="h-4 w-4" />
                                    Beranda
                                </Link>
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>

                        {isAuthenticated ? (
                            <Button asChild variant="ghost" className="gap-2">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : null}

                        {isImpersonating ? (
                            <Button asChild variant="ghost" className="gap-2">
                                <Link
                                    href="/impersonation/stop"
                                    method="post"
                                    as="button"
                                >
                                    <Undo2 className="h-4 w-4" />
                                    Akun utama
                                </Link>
                            </Button>
                        ) : null}

                        {isAuthenticated ? (
                            <Button asChild variant="ghost" className="gap-2">
                                <Link href="/logout" method="post" as="button">
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
