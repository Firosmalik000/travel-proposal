import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="text-white [&_[data-sidebar=sidebar]]:overflow-hidden [&_[data-sidebar=sidebar]]:border-white/10 [&_[data-sidebar=sidebar]]:bg-[linear-gradient(90deg,rgba(93,8,18,0.98)_0%,rgba(142,16,27,0.96)_34%,rgba(189,49,34,0.93)_64%,rgba(230,156,50,0.92)_100%)] [&_[data-sidebar=sidebar]]:shadow-[0_26px_60px_-36px_rgba(0,0,0,0.55)] [&_[data-sidebar=sidebar]]:before:absolute [&_[data-sidebar=sidebar]]:before:inset-0 [&_[data-sidebar=sidebar]]:before:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [&_[data-sidebar=sidebar]]:before:[background-size:18px_18px] [&_[data-sidebar=sidebar]]:before:opacity-60 [&_[data-sidebar=sidebar]]:before:content-[''] [&_[data-sidebar=sidebar]]:after:absolute [&_[data-sidebar=sidebar]]:after:inset-x-0 [&_[data-sidebar=sidebar]]:after:top-0 [&_[data-sidebar=sidebar]]:after:h-24 [&_[data-sidebar=sidebar]]:after:bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,transparent_100%)] [&_[data-sidebar=sidebar]]:after:content-['']"
        >
            <SidebarHeader className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_100%)]">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-2xl border border-white/14 bg-white/12 text-white shadow-[0_14px_32px_-20px_rgba(0,0,0,0.42)] transition hover:-translate-y-[1px] hover:bg-white/18 hover:text-white"
                        >
                            <Link href={dashboard()} prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center">
                                    <AppLogoIcon className="size-8 object-contain" />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.06)_100%)]">
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
