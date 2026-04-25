import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
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

function hasNavigablePath(path: string | null | undefined): boolean {
    return Boolean(path && path !== '#');
}

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
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredMenus = menus.filter((menu) => {
        const matchesName = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChildren = menu.children?.some(child => 
            child.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesName || matchesChildren;
    });

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-sidebar-border/50 bg-sidebar text-sidebar-foreground shadow-xl [&_[data-sidebar=sidebar]]:bg-sidebar"
        >
            <SidebarHeader className="border-b border-sidebar-border/60 bg-[var(--brand-surface)]/10 p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-12 rounded-xl border border-sidebar-border/40 bg-white/80 shadow-sm transition-all hover:bg-white hover:shadow-md dark:bg-black/20"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                
                <div className="mt-4 group-data-[collapsible=icon]:hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input 
                            placeholder="Cari menu..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 border-sidebar-border/60 bg-white/40 pl-9 text-xs shadow-none ring-offset-background placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30 dark:bg-black/20"
                        />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                {loading ? (
                    <div className="space-y-2 px-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-sidebar-accent/50" />
                        ))}
                    </div>
                ) : (
                    <SidebarGroup className="p-0">
                        <SidebarGroupLabel className="px-4 text-[0.65rem] font-bold tracking-widest text-muted-foreground/50 uppercase">
                            Menu Navigasi
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1 px-2">
                                {filteredMenus.map((menu) => (
                                    <MenuItemComponent
                                        key={menu.menu_key}
                                        item={menu}
                                    />
                                ))}
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

            <SidebarFooter className="border-t border-sidebar-border/40 p-3 bg-sidebar/50 backdrop-blur">
                <NavUser />
            </SidebarFooter>
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

    const buttonClasses = cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive 
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
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
                            <IconComponent className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                            <span className="flex-1 truncate">{item.name}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-0 py-1">
                        <SidebarMenuSub className="ml-4 mr-0 border-l border-sidebar-border/60 pl-2 pr-0">
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
                className={buttonClasses}
            >
                <Link href={itemHref}>
                    <div className="flex size-5 items-center justify-center transition-transform group-hover:scale-110">
                        <IconComponent className={cn("size-full shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
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

    const subButtonClasses = cn(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.825rem] font-medium transition-colors',
        isActive 
            ? 'bg-primary/10 text-primary' 
            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
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
                            <IconComponent className={cn("size-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                            <span className="flex-1 truncate">{item.name}</span>
                            <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuSubButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-0 py-1">
                        <SidebarMenuSub className="ml-2 mr-0 border-l border-sidebar-border/60 pl-2 pr-0">
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
                className={subButtonClasses}
            >
                <Link href={itemHref}>
                    <IconComponent className={cn("size-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} />
                    <span className="flex-1 truncate">{item.name}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}
