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
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#d7e2f2] bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(244,248,255,0.88)_100%)] px-4 shadow-[0_12px_28px_-20px_rgba(37,99,235,0.24)] backdrop-blur dark:border-[#2c3648] dark:bg-[linear-gradient(145deg,rgba(23,29,39,0.96)_0%,rgba(18,24,35,0.92)_100%)] dark:shadow-[0_16px_30px_-24px_rgba(0,0,0,0.7)]">
                <div className="flex min-w-0 items-center gap-4">
                    <SidebarTrigger className="-ml-1 rounded-xl border border-[#d7e2f2] bg-white/90 px-2 text-foreground transition-colors hover:border-primary/25 hover:bg-primary/6 dark:border-[#2c3648] dark:bg-[#1f2735] dark:text-[#e8edf7] dark:hover:border-primary/35 dark:hover:bg-primary/15" />
                    <div className="h-6 w-px bg-[#d9e3f2] dark:bg-[#324055]" />
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
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
