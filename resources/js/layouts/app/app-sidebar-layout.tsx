import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BrandThemeStyle from '@/components/brand-theme-style';
import { DynamicSidebar } from '@/components/dynamic-sidebar';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    embedded = false,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; embedded?: boolean }>) {
    const activeSubmitToastIdRef = useRef<string | null>(null);

    useEffect(() => {
        const startCleanup = router.on('start', (event) => {
            const method = String(
                event.detail.visit.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                return;
            }

            const toastId = `admin-submit-${Date.now()}`;
            activeSubmitToastIdRef.current = toastId;
            toast.loading('Menyimpan perubahan...', { id: toastId });
        });

        const successCleanup = router.on('success', (event) => {
            const method = String(
                event.detail.visit.method ?? 'get',
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
            const method = String(
                event.detail.visit.method ?? 'get',
            ).toLowerCase();
            if (method === 'get') {
                return;
            }

            const toastId =
                activeSubmitToastIdRef.current ?? `admin-submit-${Date.now()}`;
            const firstError = Object.values(event.detail.errors ?? {})[0];
            toast.error(
                typeof firstError === 'string'
                    ? firstError
                    : 'Gagal menyimpan perubahan.',
                { id: toastId },
            );
            activeSubmitToastIdRef.current = null;
        });

        const invalidCleanup = router.on('invalid', (event) => {
            const method = String(
                event.detail.visit.method ?? 'get',
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
            const toastId = activeSubmitToastIdRef.current;
            if (!toastId) {
                return;
            }

            toast.dismiss(toastId);
            activeSubmitToastIdRef.current = null;
        });

        return () => {
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
                className="bg-background dark:bg-background"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
