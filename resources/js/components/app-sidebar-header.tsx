import { AdminLocaleSwitch } from '@/components/admin-locale-switch';
import AppearanceSwitch from '@/components/appearance-switch';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    return (
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-3 text-foreground shadow-[0_14px_40px_-26px_rgba(140,10,22,0.18)] backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-lg border border-border bg-card text-foreground shadow-[0_10px_24px_-18px_rgba(140,10,22,0.16)] transition hover:-translate-y-[1px] hover:bg-card/90" />
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Workspace
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {pageTitle}
                    </p>
                </div>
            </div>

            <div className="hidden flex-1 items-center justify-center lg:flex">
                <div className="rounded-full border border-dashed border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                    Mode input konten mengikuti bahasa yang dipilih
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-2 py-1 shadow-sm sm:flex">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <AdminLocaleSwitch />
                </div>
                <AppearanceSwitch />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-9 rounded-full border border-border bg-card px-2 text-foreground shadow-[0_12px_26px_-20px_rgba(140,10,22,0.16)] transition hover:-translate-y-[1px] hover:bg-card/90 sm:h-10"
                        >
                            <Avatar className="size-7 overflow-hidden rounded-full">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-secondary text-xs text-secondary-foreground">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden max-w-[140px] truncate pl-2 text-sm font-medium text-foreground md:block">
                                {auth.user.name}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
