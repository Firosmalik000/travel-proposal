import AppearanceSwitch from '@/components/appearance-switch';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    const pageTitle =
        activeBreadcrumb?.title ??
        (activeBreadcrumb as { label?: string } | undefined)?.label ??
        'Dashboard';

    return (
        <header className="sticky top-0 z-30 py-2 text-foreground transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#dbe3ee] bg-white px-4 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.18)] backdrop-blur dark:border-[#2c3648] dark:bg-[#171d27] dark:shadow-[0_16px_30px_-24px_rgba(0,0,0,0.7)]">
                <div className="flex min-w-0 items-center gap-4">
                    <SidebarTrigger className="-ml-1 rounded-xl border border-[#dbe3ee] bg-slate-50 px-2 text-foreground transition-colors hover:border-primary/25 hover:bg-slate-100 dark:border-[#2c3648] dark:bg-[#1f2735] dark:text-[#e8edf7] dark:hover:border-primary/35 dark:hover:bg-white/10" />
                    <div className="h-6 w-px bg-[#dbe3ee] dark:bg-[#324055]" />
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg dark:text-white">
                            {pageTitle}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <AppearanceSwitch />
                </div>
            </div>
        </header>
    );
}
