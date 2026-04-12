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

            <div className="hidden flex-1 items-center gap-3 lg:flex">
                <div className="relative w-full max-w-lg">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari menu, paket, atau konten..."
                        className="h-10 rounded-full border border-border bg-card pl-9 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(140,10,22,0.05)] transition focus-visible:ring-2 focus-visible:ring-primary/25"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <button className="transition hover:text-foreground">Paket</button>
                    <button className="transition hover:text-foreground">Keberangkatan</button>
                    <button className="transition hover:text-foreground">Konten</button>
                    <button className="transition hover:text-foreground">Branding</button>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-card/90 md:inline-flex"
                >
                    <Bell className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-card/90 md:inline-flex"
                >
                    <Settings className="h-5 w-5" />
                </Button>
                <AppearanceSwitch />
                <Button className="hidden h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-20px_rgba(140,10,22,0.4)] transition hover:-translate-y-[1px] xl:inline-flex">
                    <Filter className="h-4 w-4" />
                    Filter Jadwal
                </Button>
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
