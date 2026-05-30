import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

type CtaPillLinkProps = {
    href: string;
    children: ReactNode;
    icon?: ReactNode;
    tone?: 'primary' | 'foreground' | 'outline' | 'ghost-dark';
    size?: 'sm' | 'md' | 'lg';
    full?: boolean;
    className?: string;
};

export default function CtaPillLink({
    href,
    children,
    icon,
    tone = 'primary',
    size = 'md',
    full = false,
    className,
}: CtaPillLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95',
                full ? 'w-full sm:w-auto' : '',
                size === 'lg' ? 'px-8 py-4 text-sm' : '',
                size === 'md' ? 'px-6 py-3 text-sm' : '',
                size === 'sm' ? 'px-4 py-2 text-xs font-semibold' : '',
                tone === 'primary'
                    ? 'bg-primary text-white shadow-xl shadow-primary/40 hover:bg-primary/90'
                    : '',
                tone === 'foreground'
                    ? 'bg-foreground text-background hover:bg-foreground/85'
                    : '',
                tone === 'outline'
                    ? 'border border-border bg-card text-foreground shadow-sm'
                    : '',
                tone === 'ghost-dark'
                    ? 'border border-background/20 bg-white/5 text-background/80 hover:border-background/50 hover:bg-white/10'
                    : '',
                className,
            )}
        >
            {children}
            {icon}
        </Link>
    );
}
