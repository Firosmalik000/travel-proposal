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
                className="overflow-x-hidden bg-background dark:bg-background"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
