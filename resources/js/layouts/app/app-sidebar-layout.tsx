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
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
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
