import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { DynamicSidebar } from '@/components/dynamic-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <DynamicSidebar />
            <AppContent
                variant="sidebar"
                className="overflow-x-hidden bg-[#eef2f7] dark:bg-[#0b1016]"
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
