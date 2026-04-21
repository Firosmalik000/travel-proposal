import AppearanceSwitch from '@/components/appearance-switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import {
    type BreadcrumbItem as BreadcrumbItemType,
    type SharedData,
} from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    return (
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-white/12 bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)] px-3 text-white shadow-[0_18px_48px_-28px_rgba(0,0,0,0.45)] backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-lg border border-white/18 bg-white/10 text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.4)] transition hover:-translate-y-[1px] hover:bg-white/16" />
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.28em] text-white/65 uppercase">
                        Workspace
                    </p>
                    <p className="truncate text-sm font-semibold text-white sm:text-base">
                        {pageTitle}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <AppearanceSwitch />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-9 rounded-full border border-white/18 bg-white/10 px-2 text-white shadow-[0_12px_26px_-20px_rgba(0,0,0,0.35)] transition hover:-translate-y-[1px] hover:bg-white/16 sm:h-10"
                        >
                            <Avatar className="size-7 overflow-hidden rounded-full">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-white/85 text-xs text-[#7a0d17]">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden max-w-[140px] truncate pl-2 text-sm font-medium text-white md:block">
                                {auth.user.name}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
