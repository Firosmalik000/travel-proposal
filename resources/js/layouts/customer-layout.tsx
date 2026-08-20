import AppearanceSwitch from '@/components/appearance-switch';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BookOpenCheck, LogOut, PlaneTakeoff, ShieldCheck } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type CustomerLayoutProps = PropsWithChildren<{
    title?: string;
}>;

const navigation = [
    {
        title: 'Dashboard',
        href: '/customer',
        icon: BookOpenCheck,
    },
    {
        title: 'Booking Saya',
        href: '/customer/bookings',
        icon: PlaneTakeoff,
    },
] as const;

function normalizePath(path: string): string {
    const pathname = path.split('?')[0]?.split('#')[0] ?? path;

    return pathname.length > 1 && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;
}

function CustomerSidebar() {
    const { auth, branding, url } = usePage<SharedData>().props;
    const currentPath = normalizePath(url ?? '/customer');
    const avatar =
        typeof auth.user.avatar === 'string' ? auth.user.avatar : undefined;
    const initials = auth.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-white/10 text-white [&_[data-sidebar=sidebar]]:bg-[#123b36]"
        >
            <SidebarHeader className="border-b border-white/10 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 rounded-2xl border border-white/10 bg-white/8 text-white hover:bg-white/12 hover:text-white"
                        >
                            <Link href="/customer">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#d9b66f] text-[#173c36] shadow-sm">
                                    <PlaneTakeoff className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-sm font-bold">
                                        Portal Customer
                                    </span>
                                    <span className="truncate text-[0.68rem] text-white/65">
                                        {branding.company_name}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="rounded-2xl border border-white/10 bg-white/5 p-2">
                    <SidebarGroupLabel className="px-3 text-[0.62rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
                        Portal Saya
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {navigation.map((item) => {
                                const active =
                                    item.href === '/customer'
                                        ? currentPath === '/customer' ||
                                          currentPath.startsWith(
                                              '/customer/bookings/',
                                          )
                                        : currentPath === item.href;

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={active}
                                            className={cn(
                                                'h-10 rounded-xl border px-3 text-sm font-semibold transition-colors',
                                                active
                                                    ? 'border-white/25 bg-white/16 text-white hover:bg-white/20 hover:text-white'
                                                    : 'border-transparent text-white/75 hover:border-white/10 hover:bg-white/10 hover:text-white',
                                            )}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-2.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-2 text-left transition group-data-[collapsible=icon]:justify-center hover:border-white/20 hover:bg-white/12"
                            aria-label="Buka menu akun"
                        >
                            <Avatar className="size-9 border border-white/15">
                                <AvatarImage
                                    src={avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="bg-[#d9b66f] text-xs font-bold text-[#173c36]">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                                <p className="truncate text-sm font-bold text-white">
                                    {auth.user.name}
                                </p>
                                <p className="truncate text-[0.68rem] text-white/60">
                                    {auth.user.email}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        side="top"
                        sideOffset={12}
                        className="w-64 rounded-xl p-2 shadow-2xl"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full"
                                    href="/settings/profile"
                                >
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    className="block w-full"
                                    href="/customer/password"
                                >
                                    Keamanan Akun
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                className="block w-full"
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => router.flushAll()}
                            >
                                <LogOut />
                                Keluar
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default function CustomerLayout({
    children,
    title = 'Portal Customer',
}: CustomerLayoutProps) {
    const { sidebarOpen } = usePage<SharedData>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <CustomerSidebar />
            <SidebarInset className="min-w-0 overflow-x-hidden bg-[#f5f7fb] px-3 pb-3 sm:px-4 sm:pb-4 dark:bg-[#0f131a]">
                <div className="mx-auto w-full max-w-[1600px]">
                    <header className="sticky top-0 z-30 py-2">
                        <div className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#dbe3ee] bg-white px-4 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.18)] dark:border-[#2c3648] dark:bg-[#171d27]">
                            <div className="flex min-w-0 items-center gap-4">
                                <SidebarTrigger className="-ml-1 rounded-xl border border-[#dbe3ee] bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-[#2c3648] dark:bg-[#1f2735] dark:text-white dark:hover:bg-white/10" />
                                <div className="h-6 w-px bg-[#dbe3ee] dark:bg-[#324055]" />
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                                        {title}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 md:flex dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <ShieldCheck className="size-3.5" /> Akses
                                    Customer
                                </div>
                                <AppearanceSwitch />
                            </div>
                        </div>
                    </header>

                    <main className="relative mt-3 min-w-0 rounded-2xl border border-[#dbe3ee] bg-white px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.18)] sm:px-6 sm:py-6 dark:border-[#2b3648] dark:bg-[#171d27]">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
