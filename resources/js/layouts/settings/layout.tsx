import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { KeyRound, ShieldCheck, SunMoon, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: KeyRound,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: SunMoon,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="relative px-4 py-6">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-[-12%] top-[8%] h-96 w-96 rounded-full bg-foreground/5 blur-3xl dark:bg-primary/10" />
            </div>

            <div className="mx-auto max-w-7xl space-y-6">
                <Heading
                    title="Settings"
                    description="Manage your profile and account settings"
                />

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    <aside className="w-full lg:w-72">
                        <Card className="bg-card/90 p-2 shadow-sm ring-1 ring-border/60 backdrop-blur">
                            <nav className="flex flex-col gap-1">
                                {sidebarNavItems.map((item, index) => {
                                    const isActive = isSameUrl(
                                        currentPath,
                                        item.href,
                                    );

                                    return (
                                        <Button
                                            key={`${resolveUrl(item.href)}-${index}`}
                                            size="sm"
                                            variant="ghost"
                                            asChild
                                            className={cn(
                                                'relative w-full justify-start gap-2 rounded-xl px-3 py-5 text-sm',
                                                'transition hover:bg-accent/70',
                                                isActive &&
                                                    'bg-primary/10 text-primary hover:bg-primary/15',
                                            )}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className="h-4 w-4" />
                                                )}
                                                <span className="flex-1 text-left">
                                                    {item.title}
                                                </span>
                                                {isActive && (
                                                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                                                )}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </nav>
                        </Card>
                    </aside>

                    <Separator className="lg:hidden" />

                    <div className="min-w-0 flex-1">
                        <section className="space-y-8">{children}</section>
                    </div>
                </div>
            </div>
        </div>
    );
}
