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
                            className="group h-12 rounded-2xl border border-white/20 bg-white/12 text-white shadow-[0_12px_30px_-15px_rgba(15,23,42,0.2)] transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl hover:border-white/30 hover:bg-white/16 data-[state=open]:border-white/30 data-[state=open]:bg-white/20"
                            data-test="sidebar-menu-button"
                        >
                            <Avatar className="h-8 w-8 overflow-hidden rounded-full shadow-sm">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-full bg-white/20 text-xs font-bold text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-bold text-white">
                                    {auth.user.name}
                                </span>
                                <span className="truncate text-[0.7rem] font-medium text-white/75">
                                    {auth.user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-white/65 group-data-[collapsible=icon]:hidden" />
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
