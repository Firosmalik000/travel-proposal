import AppearanceSwitch from '@/components/appearance-switch';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    return (
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-[var(--admin-header-bg)] px-4 text-foreground shadow-sm backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
                <SidebarTrigger className="-ml-1 rounded-xl border border-border/60 bg-background/50 text-foreground shadow-sm transition-all hover:bg-background hover:shadow-md" />
                <div className="h-6 w-px bg-border/60" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight text-foreground sm:text-lg">
                        {pageTitle}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
                <div className="hidden flex-col items-end leading-none sm:flex">
                    <p className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-80">
                        Admin Workspace
                    </p>
                    <p className="text-[0.6rem] font-medium text-primary/70">
                        Asfar Tour & Travel
                    </p>
                </div>
                <div className="mx-1 hidden h-8 w-px bg-border/60 sm:block" />
                <AppearanceSwitch />
            </div>
        </header>
    );
}
