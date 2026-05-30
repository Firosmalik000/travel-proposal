import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BrandThemeStyle from '@/components/brand-theme-style';
import { DynamicSidebar } from '@/components/dynamic-sidebar';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import {
    type PropsWithChildren,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';

function AdminRouteSkeleton(): ReactNode {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/3 rounded-xl bg-slate-200/80 dark:bg-slate-700/60" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="h-24 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-24 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-24 rounded-2xl bg-slate-200/80 dark:bg-slate-700/60" />
            </div>
            <div className="h-12 w-2/5 rounded-xl bg-slate-200/80 dark:bg-slate-700/60" />
            <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
                <div className="h-4 w-full rounded bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-4 w-11/12 rounded bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-4 w-8/12 rounded bg-slate-200/80 dark:bg-slate-700/60" />
                <div className="h-48 rounded-xl bg-slate-200/80 dark:bg-slate-700/60" />
            </div>
        </div>
    );
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    embedded = false,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; embedded?: boolean }>) {
    const activeSubmitToastIdRef = useRef<string | null>(null);
    const routeLoadingToastTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);
    const routeLoadingToastIdRef = useRef<string | null>(null);
    const [isRouteNavigating, setIsRouteNavigating] = useState(false);

    useEffect(() => {
        const startCleanup = router.on('start', (event) => {
            const inertiaEvent = event as unknown as {
                detail?: { visit?: { method?: string } };
            };
            const method = String(
                inertiaEvent.detail?.visit?.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                setIsRouteNavigating(true);
                if (routeLoadingToastTimerRef.current !== null) {
                    clearTimeout(routeLoadingToastTimerRef.current);
                }

                routeLoadingToastTimerRef.current = setTimeout(() => {
                    const toastId = `admin-route-loading-${Date.now()}`;
                    routeLoadingToastIdRef.current = toastId;
                    toast.loading('Sedang membuka halaman...', { id: toastId });
                }, 800);

                return;
            }

            const toastId = `admin-submit-${Date.now()}`;
            activeSubmitToastIdRef.current = toastId;
            toast.loading('Menyimpan perubahan...', { id: toastId });
        });

        const successCleanup = router.on('success', (event) => {
            const inertiaEvent = event as unknown as {
                detail?: { visit?: { method?: string } };
            };
            const method = String(
                inertiaEvent.detail?.visit?.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                return;
            }

            const toastId = activeSubmitToastIdRef.current;
            if (!toastId) {
                return;
            }

            toast.success('Perubahan berhasil disimpan.', { id: toastId });
            activeSubmitToastIdRef.current = null;
        });

        const errorCleanup = router.on('error', (event) => {
            const inertiaEvent = event as unknown as {
                detail?: {
                    visit?: { method?: string };
                    errors?: Record<string, string>;
                };
            };
            const method = String(
                inertiaEvent.detail?.visit?.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                return;
            }

            const toastId =
                activeSubmitToastIdRef.current ?? `admin-submit-${Date.now()}`;
            const firstError = Object.values(
                inertiaEvent.detail?.errors ?? {},
            )[0];
            toast.error(
                typeof firstError === 'string'
                    ? firstError
                    : 'Gagal menyimpan perubahan.',
                { id: toastId },
            );
            activeSubmitToastIdRef.current = null;
        });

        const invalidCleanup = router.on('invalid', (event) => {
            const inertiaEvent = event as unknown as {
                detail?: { visit?: { method?: string } };
            };
            const method = String(
                inertiaEvent.detail?.visit?.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                return;
            }

            const toastId =
                activeSubmitToastIdRef.current ?? `admin-submit-${Date.now()}`;
            toast.error('Validasi gagal. Periksa input Anda.', { id: toastId });
            activeSubmitToastIdRef.current = null;
        });

        const finishCleanup = router.on('finish', () => {
            setIsRouteNavigating(false);

            if (routeLoadingToastTimerRef.current !== null) {
                clearTimeout(routeLoadingToastTimerRef.current);
                routeLoadingToastTimerRef.current = null;
            }

            if (routeLoadingToastIdRef.current !== null) {
                toast.dismiss(routeLoadingToastIdRef.current);
                routeLoadingToastIdRef.current = null;
            }

            const toastId = activeSubmitToastIdRef.current;
            if (!toastId) {
                return;
            }

            toast.dismiss(toastId);
            activeSubmitToastIdRef.current = null;
        });

        return () => {
            setIsRouteNavigating(false);

            if (routeLoadingToastTimerRef.current !== null) {
                clearTimeout(routeLoadingToastTimerRef.current);
                routeLoadingToastTimerRef.current = null;
            }

            if (routeLoadingToastIdRef.current !== null) {
                toast.dismiss(routeLoadingToastIdRef.current);
                routeLoadingToastIdRef.current = null;
            }

            startCleanup();
            successCleanup();
            errorCleanup();
            invalidCleanup();
            finishCleanup();
        };
    }, []);

    if (embedded) {
        return (
            <AppShell variant="header">
                <GlobalFaviconHead />
                <BrandThemeStyle />
                <AppContent
                    variant="header"
                    className="max-w-none overflow-x-hidden bg-background dark:bg-background"
                >
                    {children}
                </AppContent>
            </AppShell>
        );
    }

    return (
        <AppShell variant="sidebar">
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <DynamicSidebar />
            <AppContent
                variant="sidebar"
                className="min-w-0 overflow-x-hidden bg-[#f4f6fb] px-3 pb-3 sm:px-4 sm:pb-4 dark:bg-[#0f131a]"
            >
                <div
                    aria-hidden={!isRouteNavigating}
                    className={`pointer-events-none fixed inset-x-0 top-0 z-[70] transition-opacity duration-200 ${
                        isRouteNavigating ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="h-1 w-full bg-[#0f172a]/10 dark:bg-white/10">
                        <div className="h-full w-1/3 animate-[route-progress_1.1s_ease-in-out_infinite] bg-[#0f172a] dark:bg-white" />
                    </div>
                    <div className="flex items-center justify-end px-4 pt-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#0f172a] shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-[#111827]/95 dark:text-slate-100 dark:ring-white/10">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Memuat halaman admin...
                        </div>
                    </div>
                </div>
                <div className="mx-auto w-full max-w-[1600px]">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <main className="relative mt-3 min-w-0 rounded-2xl border border-[#e8edf5] bg-white px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.24)] sm:px-6 sm:py-6 dark:border-[#2b3648] dark:bg-[#171d27] dark:shadow-[0_12px_34px_-24px_rgba(0,0,0,0.6)]">
                        <div className={isRouteNavigating ? 'opacity-60' : ''}>
                            {children}
                        </div>
                        {isRouteNavigating ? (
                            <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-white/75 p-4 backdrop-blur-[1px] sm:p-6 dark:bg-[#171d27]/80">
                                <AdminRouteSkeleton />
                            </div>
                        ) : null}
                    </main>
                </div>
            </AppContent>
        </AppShell>
    );
}
