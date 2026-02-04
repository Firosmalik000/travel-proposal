import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { ButtonHTMLAttributes, MouseEventHandler, useMemo } from 'react';

export default function AppearanceSwitch({
    className,
    onClick,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const isDark = useMemo(() => {
        if (appearance === 'dark') return true;
        if (appearance === 'light') return false;

        if (typeof window === 'undefined') return false;
        return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    }, [appearance]);

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        onClick?.(event);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            aria-label="Toggle theme"
            className={cn(
                'h-9 w-9 rounded-md border border-white/10 bg-white/10 text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.5)] transition hover:bg-white/20 hover:text-white',
                className,
            )}
            {...props}
        >
            {isDark ? (
                <Moon className="h-4 w-4" />
            ) : (
                <Sun className="h-4 w-4" />
            )}
        </Button>
    );
}
