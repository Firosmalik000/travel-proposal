import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

type PublicCardShellProps = {
    children: ReactNode;
    className?: string;
};

export default function PublicCardShell({
    children,
    className,
}: PublicCardShellProps) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-3xl border border-border bg-card shadow-sm',
                className,
            )}
        >
            {children}
        </div>
    );
}
