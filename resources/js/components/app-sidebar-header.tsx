import AppearanceSwitch from '@/components/appearance-switch';
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, Filter, Search, Settings } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.title ?? 'Dashboard';

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-6 text-slate-900 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.35)] backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:border-white/10 dark:bg-[#0f1621]/90 dark:text-white">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 rounded-lg border border-slate-200/70 bg-white text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.2)] transition hover:-translate-y-[1px] hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" />
                <div className="hidden sm:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-400">
                        Workspace
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                        {pageTitle}
                    </p>
                </div>
            </div>

            <div className="hidden flex-1 items-center gap-3 lg:flex">
                <div className="relative w-full max-w-lg">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Find something here..."
                        className="h-10 rounded-full border border-slate-200/70 bg-slate-50 pl-9 text-sm text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] transition focus-visible:ring-2 focus-visible:ring-primary/25 dark:border-white/10 dark:bg-white/10 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-300">
                    <button className="transition hover:text-slate-900 dark:hover:text-white">Socials</button>
                    <button className="transition hover:text-slate-900 dark:hover:text-white">Live Training</button>
                    <button className="transition hover:text-slate-900 dark:hover:text-white">Blog</button>
                    <button className="transition hover:text-slate-900 dark:hover:text-white">Access News</button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-10 w-10 rounded-full border border-slate-200/70 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 md:inline-flex"
                >
                    <Bell className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-10 w-10 rounded-full border border-slate-200/70 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 md:inline-flex"
                >
                    <Settings className="h-5 w-5" />
                </Button>
                <AppearanceSwitch />
                <Button className="hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white shadow-[0_12px_30px_-20px_rgba(15,118,110,0.55)] transition hover:-translate-y-[1px] md:inline-flex">
                    <Filter className="h-4 w-4" />
                    Filter Periode
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 rounded-full border border-slate-200/70 bg-white px-2 text-slate-700 shadow-[0_12px_26px_-20px_rgba(15,23,42,0.18)] transition hover:-translate-y-[1px] hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        >
                            <Avatar className="size-7 overflow-hidden rounded-full">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-slate-200 text-xs text-slate-700 dark:bg-white/20 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden max-w-[140px] truncate pl-2 text-sm font-medium text-slate-700 md:block dark:text-white/90">
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
