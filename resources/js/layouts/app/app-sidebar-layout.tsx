import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import BrandThemeStyle from '@/components/brand-theme-style';
import { DynamicSidebar } from '@/components/dynamic-sidebar';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    embedded = false,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; embedded?: boolean }>) {
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
                className="min-w-0 overflow-x-hidden bg-[#f5f7fb] px-3 pb-3 sm:px-4 sm:pb-4 dark:bg-[#0f131a]"
            >
                <div className="mx-auto w-full max-w-[1600px]">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <main className="relative mt-3 min-w-0 rounded-2xl border border-[#dbe3ee] bg-white px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.18)] sm:px-6 sm:py-6 dark:border-[#2b3648] dark:bg-[#171d27] dark:shadow-[0_12px_34px_-24px_rgba(0,0,0,0.6)]">
                        {children}
                    </main>
                </div>
            </AppContent>
        </AppShell>
    );
}
