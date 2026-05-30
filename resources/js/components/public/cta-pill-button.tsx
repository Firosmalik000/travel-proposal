import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type CtaPillButtonProps = {
    children: ReactNode;
    tone?: 'primary' | 'foreground' | 'outline' | 'ghost-dark';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function CtaPillButton({
    children,
    tone = 'primary',
    size = 'md',
    className,
    type = 'button',
    ...props
}: CtaPillButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95',
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
                    ? 'border border-background/20 bg-white/12 text-white ring-1 ring-white/18 hover:border-background/50 hover:bg-white/16'
                    : '',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
