import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group h-12 rounded-2xl border border-transparent bg-white/60 text-sidebar-foreground shadow-[0_12px_30px_-15px_rgba(15,23,42,0.15)] transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl hover:border-primary/20 hover:bg-white data-[state=open]:border-primary/20 data-[state=open]:bg-white dark:bg-white/5 dark:hover:border-primary/30 dark:hover:bg-white/10 dark:data-[state=open]:border-primary/30 dark:data-[state=open]:bg-white/10"
                            data-test="sidebar-menu-button"
                        >
                            <Avatar className="h-8 w-8 overflow-hidden rounded-full shadow-sm">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-bold">
                                    {auth.user.name}
                                </span>
                                <span className="truncate text-[0.7rem] font-medium text-muted-foreground">
                                    {auth.user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/60 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2 shadow-2xl"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'top'
                        }
                        sideOffset={12}
                    >
                        <UserMenuContent />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
