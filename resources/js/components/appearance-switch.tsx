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
                'h-9 w-9 rounded-md border border-[#d7e2f2] bg-white text-[#475569] shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] transition hover:bg-[#f8fbff] hover:text-[#0f172a] dark:border-[#2c3648] dark:bg-[#1f2735] dark:text-[#e8edf7] dark:hover:bg-[#273247] dark:hover:text-white',
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
