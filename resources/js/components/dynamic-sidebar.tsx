import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    BookOpen,
    Briefcase,
    Building,
    CalendarCheck,
    CalendarDays,
    Car,
    ChevronRight,
    ClipboardList,
    Clock,
    Database,
    DollarSign,
    FileText,
    Folder,
    FolderTree,
    HandCoins,
    Home,
    LayoutGrid,
    LogOut,
    MessageSquare,
    Package,
    Palette,
    Search,
    Settings,
    Share2,
    Shield,
    User,
    UserPlus,
    Users,
    Utensils,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';

interface MenuItem {
    id: number;
    name: string;
    menu_key: string;
    path: string;
    icon: string;
    children?: MenuItem[] | null;
}

function hasNavigablePath(path: string | null | undefined): boolean {
    return Boolean(path && path !== '#');
}

function canonicalAdminPath(path: string | null | undefined): string {
    if (! path) {
        return '';
    }

    return path.startsWith('/dashboard')
        ? path.replace('/dashboard', '/admin')
        : path;
}

const iconMap: Record<string, LucideIcon> = {
    Archive,
    BookOpen,
    Briefcase,
    Building,
    CalendarCheck,
    CalendarDays,
    Car,
    ClipboardList,
    Clock,
    Database,
    DollarSign,
    FileText,
    Folder,
    FolderTree,
    HandCoins,
    Home,
    LayoutGrid,
    LogOut,
    MessageSquare,
    Palette,
    Package,
    Search,
    Settings,
    Share2,
    Shield,
    Utensils,
    User,
    UserPlus,
    Users,
    Wallet,
};

export function DynamicSidebar() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user-menus')
            .then((res) => res.json())
            .then((data) => {
                setMenus(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching menus:', error);
                setLoading(false);
            });
    }, []);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-sidebar-border/70 bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(255,248,242,0.92))] text-sidebar-foreground shadow-[0_26px_70px_-44px_rgba(74,12,20,0.22)] dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(15,23,42,0.94))] [&_[data-sidebar=sidebar]]:bg-transparent [&_[data-sidebar=sidebar]]:text-inherit"
        >
            <SidebarHeader className="relative border-b border-sidebar-border/70 bg-sidebar/90 px-3 py-3 shadow-[inset_0_-1px_0_rgba(140,10,22,0.05)] backdrop-blur">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-2xl border border-border/80 bg-card/95 px-3 text-card-foreground shadow-[0_16px_36px_-24px_rgba(140,10,22,0.16)] transition hover:-translate-y-[1px] hover:bg-card"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </SidebarHeader>

            <SidebarContent className="px-2 py-5">
                {/* <div className="mb-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {auth.user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {auth.user.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {auth.user.email}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                        {branding.company_subtitle}
                    </div>
                </div> */}
                {loading ? (
                    <div className="p-4 text-sm text-muted-foreground">
                        Loading menus...
                    </div>
                ) : (
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-3 text-[0.68rem] tracking-[0.3em] text-muted-foreground/80 uppercase">
                            Menu
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menus.map((menu) => (
                                    <MenuItemComponent
                                        key={menu.menu_key}
                                        item={menu}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}

function MenuItemComponent({ item }: { item: MenuItem }) {
    const IconComponent = iconMap[item.icon] || Folder;
    const { url } = usePage();
    const currentPath = normalizePath(url);
    const itemHref = canonicalAdminPath(item.path);
    const itemPath = normalizePath(itemHref);
    const canNavigate = hasNavigablePath(itemHref);

    const isActive =
        isSameOrChildPath(currentPath, itemPath) ||
        (item.children?.some((child) => isMenuActive(child, currentPath)) ??
            false);

    if (item.children && item.children.length > 0) {
        return (
            <Collapsible
                key={item.menu_key}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
            >
                <SidebarMenuItem>
                    {canNavigate ? (
                        <SidebarMenuButton
                            asChild
                            tooltip={item.name}
                            isActive={isActive}
                            className={cn(
                                'relative min-w-0 rounded-xl px-3 py-2 pr-10 text-slate-700 transition dark:text-slate-200',
                                'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-500 dark:[&>svg]:text-slate-300',
                                '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                                'hover:bg-slate-900/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white',
                                'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                                'data-[active=true]:before:absolute data-[active=true]:before:top-1 data-[active=true]:before:bottom-1 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary',
                            )}
                        >
                            <Link href={itemHref}>
                                <IconComponent className="mt-0.5 h-4 w-4 shrink-0" />
                                <span className="min-w-0 flex-1 font-semibold">
                                    {item.name}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    ) : (
                        <SidebarMenuButton
                            asChild
                            tooltip={item.name}
                            isActive={isActive}
                            className={cn(
                                'relative min-w-0 rounded-xl px-3 py-2 pr-10 text-slate-700 transition dark:text-slate-200',
                                'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-500 dark:[&>svg]:text-slate-300',
                                '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                                'hover:bg-slate-900/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white',
                                'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                                'data-[active=true]:before:absolute data-[active=true]:before:top-1 data-[active=true]:before:bottom-1 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary',
                            )}
                        >
                            <CollapsibleTrigger className="flex w-full items-start gap-3 text-left">
                                <IconComponent className="mt-0.5 h-4 w-4 shrink-0" />
                                <span className="min-w-0 flex-1 font-semibold">
                                    {item.name}
                                </span>
                            </CollapsibleTrigger>
                        </SidebarMenuButton>
                    )}
                    <CollapsibleTrigger asChild>
                        <SidebarMenuAction
                            showOnHover
                            className="top-1/2 right-2 -translate-y-1/2 rounded-md text-slate-400 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={`Toggle ${item.name}`}
                        >
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub className="mx-0 translate-x-0 border-l border-slate-200/70 pr-2 pl-4 dark:border-white/10">
                            {item.children.map((child) => (
                                <SubMenuItem
                                    key={child.menu_key}
                                    item={child}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem key={item.menu_key}>
            <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={isActive}
                className={cn(
                    'relative min-w-0 rounded-xl px-3 py-2 text-slate-700 transition dark:text-slate-200',
                    'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-500 dark:[&>svg]:text-slate-300',
                    '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                    'hover:bg-slate-900/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white',
                    'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                    'data-[active=true]:before:absolute data-[active=true]:before:top-1 data-[active=true]:before:bottom-1 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary',
                )}
            >
                <Link href={itemHref}>
                    <IconComponent className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 font-semibold">
                        {item.name}
                    </span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function normalizePath(path: string): string {
    const base = path.split('?')[0]?.split('#')[0] ?? path;
    if (base.length > 1 && base.endsWith('/')) {
        return base.slice(0, -1);
    }
    return base;
}

function isSameOrChildPath(currentPath: string, menuPath: string): boolean {
    if (menuPath === '/') {
        return currentPath === menuPath;
    }

    return currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);
}

function isMenuActive(menu: MenuItem, currentPath: string): boolean {
    const menuPath = normalizePath(canonicalAdminPath(menu.path));
    if (isSameOrChildPath(currentPath, menuPath)) {
        return true;
    }
    if (menu.children && menu.children.length > 0) {
        return menu.children.some((child) => isMenuActive(child, currentPath));
    }
    return false;
}

function SubMenuItem({ item }: { item: MenuItem }) {
    const IconComponent = iconMap[item.icon] || Folder;
    const { url } = usePage();
    const currentPath = normalizePath(url);
    const itemHref = canonicalAdminPath(item.path);
    const itemPath = normalizePath(itemHref);
    const canNavigate = hasNavigablePath(itemHref);

    const isActive =
        isSameOrChildPath(currentPath, itemPath) ||
        (item.children?.some((child) => isMenuActive(child, currentPath)) ??
            false);

    if (item.children && item.children.length > 0) {
        return (
            <Collapsible
                key={item.menu_key}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
            >
                <SidebarMenuSubItem>
                    {canNavigate ? (
                        <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                                'relative min-w-0 rounded-lg px-2.5 pr-9 text-slate-600 dark:text-slate-300',
                                'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-400 dark:[&>svg]:text-slate-400',
                                '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                                'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                                'data-[active=true]:before:absolute data-[active=true]:before:top-2 data-[active=true]:before:left-[-14px] data-[active=true]:before:h-2 data-[active=true]:before:w-2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary',
                            )}
                        >
                            <Link href={itemHref}>
                                <IconComponent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 flex-1 font-semibold">
                                    {item.name}
                                </span>
                            </Link>
                        </SidebarMenuSubButton>
                    ) : (
                        <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={cn(
                                'relative min-w-0 rounded-lg px-2.5 pr-9 text-slate-600 dark:text-slate-300',
                                'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-400 dark:[&>svg]:text-slate-400',
                                '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                                'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                                'data-[active=true]:before:absolute data-[active=true]:before:top-2 data-[active=true]:before:left-[-14px] data-[active=true]:before:h-2 data-[active=true]:before:w-2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary',
                            )}
                        >
                            <CollapsibleTrigger className="flex w-full items-start gap-3 text-left">
                                <IconComponent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 flex-1 font-semibold">
                                    {item.name}
                                </span>
                            </CollapsibleTrigger>
                        </SidebarMenuSubButton>
                    )}
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label={`Toggle ${item.name}`}
                        >
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub className="mx-0 translate-x-0 border-l border-slate-200/70 pr-2 pl-4 dark:border-white/10">
                            {item.children.map((child) => (
                                <SubMenuItem
                                    key={child.menu_key}
                                    item={child}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuSubItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuSubItem key={item.menu_key}>
            <SidebarMenuSubButton
                asChild
                isActive={isActive}
                className={cn(
                    'relative min-w-0 rounded-lg px-2.5 text-slate-600 dark:text-slate-300',
                    'items-start gap-3 overflow-visible text-left leading-snug [&>svg]:text-slate-400 dark:[&>svg]:text-slate-400',
                    '[&>span:last-child]:block [&>span:last-child]:break-words [&>span:last-child]:whitespace-normal',
                    'data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white',
                    'data-[active=true]:before:absolute data-[active=true]:before:top-2 data-[active=true]:before:left-[-14px] data-[active=true]:before:h-2 data-[active=true]:before:w-2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary',
                )}
            >
                <Link href={itemHref}>
                    <IconComponent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 font-semibold">
                        {item.name}
                    </span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}
