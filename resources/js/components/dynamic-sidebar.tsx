import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
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
    BadgeDollarSign,
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
    Handshake,
    History,
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
import { useEffect, useMemo, useState } from 'react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';
import { Input } from './ui/input';

interface MenuItem {
    id: number;
    name: string;
    menu_key: string;
    path: string;
    icon: string;
    children?: MenuItem[] | null;
}

const SIDEBAR_MENU_CACHE_KEY = 'travel-proposal:sidebar-menus:v3';

function canonicalAdminPath(path: string | null | undefined): string {
    if (!path) {
        return '';
    }

    return path.startsWith('/dashboard')
        ? path.replace('/dashboard', '/admin')
        : path;
}

const iconMap: Record<string, LucideIcon> = {
    Archive,
    BadgeDollarSign,
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
    Handshake,
    History,
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
    const [menus, setMenus] = useState<MenuItem[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const cached = window.sessionStorage.getItem(
                SIDEBAR_MENU_CACHE_KEY,
            );
            if (!cached) {
                return [];
            }

            const parsed = JSON.parse(cached) as MenuItem[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(menus.length === 0);
    const [searchQuery, setSearchQuery] = useState('');
    const { url } = usePage();
    const currentPath = useMemo(() => normalizePath(url), [url]);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/user-menus', { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => {
                setMenus(data);
                try {
                    window.sessionStorage.setItem(
                        SIDEBAR_MENU_CACHE_KEY,
                        JSON.stringify(data),
                    );
                } catch {
                    // ignore storage failures
                }
                setLoading(false);
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    console.error('Error fetching menus:', error);
                }
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, []);

    const filteredMenus = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return menus.filter((menu) => {
            const matchesName = menu.name.toLowerCase().includes(query);
            const matchesChildren = menu.children?.some((child) =>
                child.name.toLowerCase().includes(query),
            );
            return matchesName || matchesChildren;
        });
    }, [menus, searchQuery]);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-white/10 bg-[#121826] text-white shadow-[0_20px_40px_-26px_rgba(0,0,0,0.55)] [&_[data-sidebar=sidebar]]:bg-[#121826]"
        >
            <SidebarHeader className="border-b border-white/10 bg-transparent px-3 pt-3 pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-12 rounded-2xl border border-transparent bg-transparent shadow-none transition-colors hover:bg-transparent"
                        >
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="mt-2 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/65" />
                        <Input
                            placeholder="Cari menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 rounded-xl border-white/15 bg-white/10 pl-9 text-xs text-white shadow-none ring-offset-background placeholder:text-white/45 focus-visible:ring-1 focus-visible:ring-white/30"
                        />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                {loading ? (
                    <div className="space-y-2 px-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-10 w-full animate-pulse rounded-lg bg-sidebar-accent/50"
                            />
                        ))}
                    </div>
                ) : (
                    <SidebarGroup className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                        <SidebarGroupLabel className="px-3 text-[0.62rem] font-medium tracking-[0.14em] text-white/50 uppercase">
                            Menu Navigasi
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1 px-2">
                                {filteredMenus.map((menu) => (
                                    <MenuItemComponent
                                        key={menu.menu_key}
                                        item={menu}
                                        currentPath={currentPath}
                                    />
                                ))}
                                {filteredMenus.length === 0 && !searchQuery && (
                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                        Belum ada akses menu. Minta admin assign
                                        role yang sesuai.
                                    </div>
                                )}
                                {filteredMenus.length === 0 && searchQuery && (
                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                        Tidak ada menu ditemukan
                                    </div>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 bg-transparent p-2.5">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

function MenuItemComponent({
    item,
    currentPath,
}: {
    item: MenuItem;
    currentPath: string;
}) {
    const IconComponent = iconMap[item.icon] || Folder;
    const itemHref = canonicalAdminPath(item.path);
    const itemPath = normalizePath(itemHref);

    const isActive =
        isSameOrChildPath(currentPath, itemPath) ||
        (item.children?.some((child) => isMenuActive(child, currentPath)) ??
            false);

    const buttonClasses = cn(
        'group relative flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium tracking-[0.01em] transition-colors',
        isActive
            ? 'border-white/35 bg-white/18 text-white shadow-[0_10px_22px_-16px_rgba(0,0,0,0.35)]'
            : 'text-white/90 hover:border-white/25 hover:bg-white/12 hover:text-white',
    );

    if (item.children && item.children.length > 0) {
        return (
            <Collapsible
                key={item.menu_key}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
            >
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            tooltip={item.name}
                            isActive={isActive}
                            className={buttonClasses}
                        >
                            <IconComponent
                                className={cn(
                                    'size-4 shrink-0',
                                    isActive
                                        ? 'text-white'
                                        : 'text-white/70 group-hover:text-white',
                                )}
                            />
                            <span className="flex-1 truncate">{item.name}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-0 py-1">
                        <SidebarMenuSub className="mr-0 ml-4 border-l border-sidebar-border/70 pr-0 pl-2">
                            {item.children.map((child) => (
                                <SubMenuItem
                                    key={child.menu_key}
                                    item={child}
                                    currentPath={currentPath}
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
                className={buttonClasses}
            >
                <Link href={itemHref}>
                    <div className="flex size-5 items-center justify-center transition-transform group-hover:scale-110">
                        <IconComponent
                            className={cn(
                                'size-full shrink-0',
                                isActive
                                    ? 'text-white'
                                    : 'text-white/70 group-hover:text-white',
                            )}
                        />
                    </div>
                    <span className="flex-1 truncate leading-none">
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

function SubMenuItem({
    item,
    currentPath,
}: {
    item: MenuItem;
    currentPath: string;
}) {
    const IconComponent = iconMap[item.icon] || Folder;
    const itemHref = canonicalAdminPath(item.path);
    const itemPath = normalizePath(itemHref);

    const isActive =
        isSameOrChildPath(currentPath, itemPath) ||
        (item.children?.some((child) => isMenuActive(child, currentPath)) ??
            false);

    const subButtonClasses = cn(
        'group relative flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-1.5 text-[0.82rem] font-medium transition-colors',
        isActive
            ? 'border-white/35 bg-white/18 text-white'
            : 'text-white/85 hover:border-white/20 hover:bg-white/10 hover:text-white',
    );

    if (item.children && item.children.length > 0) {
        return (
            <Collapsible
                key={item.menu_key}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
            >
                <SidebarMenuSubItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuSubButton
                            isActive={isActive}
                            className={subButtonClasses}
                        >
                            <IconComponent
                                className={cn(
                                    'size-3.5 shrink-0',
                                    isActive
                                        ? 'text-white'
                                        : 'text-white/70 group-hover:text-white',
                                )}
                            />
                            <span className="flex-1 truncate">{item.name}</span>
                            <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuSubButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-0 py-1">
                        <SidebarMenuSub className="mr-0 ml-2 border-l border-sidebar-border/60 pr-0 pl-2">
                            {item.children.map((child) => (
                                <SubMenuItem
                                    key={child.menu_key}
                                    item={child}
                                    currentPath={currentPath}
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
                className={subButtonClasses}
            >
                <Link href={itemHref}>
                    <IconComponent
                        className={cn(
                            'size-3.5 shrink-0',
                            isActive
                                ? 'text-white'
                                : 'text-white/70 group-hover:text-white',
                        )}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}
