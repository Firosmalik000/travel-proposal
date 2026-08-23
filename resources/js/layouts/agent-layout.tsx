import AppearanceSwitch from '@/components/appearance-switch';
import BrandThemeStyle from '@/components/brand-theme-style';
import GlobalFaviconHead from '@/components/global-favicon-head';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
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
import {
    BadgePercent,
    BookOpenCheck,
    ChartNoAxesCombined,
    HandCoins,
    KeyRound,
    LogOut,
    PlaneTakeoff,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';

const navigation = [
    { title: 'Dashboard', href: '/agent', icon: ChartNoAxesCombined },
    { title: 'Leads Referral', href: '/agent/leads', icon: UsersRound },
    { title: 'Booking', href: '/agent/bookings', icon: BookOpenCheck },
    { title: 'Komisi', href: '/agent/commissions', icon: HandCoins },
    { title: 'Fee Package', href: '/agent/packages', icon: BadgePercent },
] as const;

const normalizePath = (path: string) => {
    const pathname = path.split('?')[0]?.split('#')[0] ?? path;
    return pathname.length > 1 && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;
};

function AgentSidebar() {
    const { auth, branding, url } = usePage<SharedData>().props;
    const currentPath = normalizePath(url ?? '/agent');
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
                            <Link href="/agent">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#d9b66f] text-[#173c36]">
                                    <PlaneTakeoff className="size-5" />
                                </span>
                                <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-sm font-bold">
                                        Portal Agent
                                    </span>
                                    <span className="truncate text-[0.68rem] text-white/65">
                                        {branding.company_name}
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="rounded-2xl border border-white/10 bg-white/5 p-2">
                    <SidebarGroupLabel className="px-3 text-[0.62rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
                        Bisnis Saya
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {navigation.map((item) => {
                                const active =
                                    item.href === '/agent'
                                        ? currentPath === '/agent'
                                        : currentPath === item.href ||
                                          currentPath.startsWith(
                                              `${item.href}/`,
                                          );
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
                            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-2 text-left transition group-data-[collapsible=icon]:justify-center hover:bg-white/12"
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
                            <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                                <span className="block truncate text-sm font-bold text-white">
                                    {auth.user.name}
                                </span>
                                <span className="block truncate text-[0.68rem] text-white/60">
                                    {auth.user.email}
                                </span>
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        side="top"
                        sideOffset={12}
                        className="w-64 rounded-xl p-2"
                    >
                        <DropdownMenuItem asChild>
                            <Link href="/agent/account">
                                <UserRound /> Profil & Rekening
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/agent/password">
                                <KeyRound /> Keamanan Akun
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                onClick={() => router.flushAll()}
                            >
                                <LogOut /> Keluar
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default function AgentLayout({
    children,
    title = 'Portal Agent',
}: PropsWithChildren<{ title?: string }>) {
    const { sidebarOpen } = usePage<SharedData>().props;
    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <GlobalFaviconHead />
            <BrandThemeStyle />
            <AgentSidebar />
            <SidebarInset className="min-w-0 overflow-x-hidden bg-[#f5f7fb] px-2 pb-2 min-[375px]:px-3 min-[375px]:pb-3 sm:px-4 sm:pb-4 dark:bg-[#0f131a]">
                <div className="mx-auto w-full max-w-[1600px]">
                    <header className="sticky top-0 z-30 py-2">
                        <div className="flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-[#dbe3ee] bg-white px-3 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.18)] min-[375px]:px-4 dark:border-[#2c3648] dark:bg-[#171d27]">
                            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                <SidebarTrigger className="-ml-1 rounded-xl border border-[#dbe3ee] bg-slate-50 text-slate-700 dark:border-[#2c3648] dark:bg-[#1f2735] dark:text-white" />
                                <div className="h-6 w-px bg-[#dbe3ee] dark:bg-[#324055]" />
                                <p className="truncate text-sm font-semibold text-slate-900 min-[375px]:text-base sm:text-lg dark:text-white">
                                    {title}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 lg:flex dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                    <ShieldCheck className="size-3.5" /> Akses
                                    Agent
                                </div>
                                <AppearanceSwitch />
                            </div>
                        </div>
                    </header>
                    <main className="relative mt-2 min-w-0 rounded-2xl border border-[#dbe3ee] bg-white px-3 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.18)] min-[375px]:mt-3 min-[375px]:px-4 sm:px-6 sm:py-6 dark:border-[#2b3648] dark:bg-[#171d27]">
                        {children}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
