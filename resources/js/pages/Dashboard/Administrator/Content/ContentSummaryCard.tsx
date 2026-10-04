import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type ContentSummaryCardProps = {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color?: 'green' | 'primary' | 'slate';
    compact?: boolean;
};

export function ContentSummaryCard({
    label,
    value,
    icon: Icon,
    color = 'primary',
    compact = false,
}: ContentSummaryCardProps) {
    const iconClassName =
        color === 'green'
            ? 'bg-green-500 text-white shadow-green-500/40'
            : color === 'slate'
              ? 'bg-[#2d1810] text-white shadow-black/40'
              : 'bg-primary text-white shadow-primary/40';
    const cardClassName =
        color === 'green'
            ? 'bg-white border-green-500/20'
            : color === 'slate'
              ? 'bg-white border-[#2d1810]/20'
              : 'bg-white border-primary/20';

    if (compact) {
        return (
            <Card
                className={cn(
                    'rounded-xl border bg-card shadow-sm',
                    cardClassName,
                )}
            >
                <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {label}
                        </p>
                        <p className="text-3xl font-semibold tracking-tight text-[#2d1810]">
                            {value}
                        </p>
                    </div>
                    <div
                        className={cn(
                            'rounded-lg p-2 text-white',
                            iconClassName,
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'group overflow-hidden rounded-[4rem] border-4 border-b-[20px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all hover:translate-y-[-15px] active:scale-95',
                cardClassName,
            )}
        >
            <CardContent className="relative flex items-center justify-between overflow-hidden p-12">
                <div className="absolute top-0 right-0 transform p-4 opacity-5 transition-opacity duration-1000 group-hover:scale-150 group-hover:opacity-20">
                    <Icon className="h-48 w-48 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                    <p className="text-[13px] font-black tracking-[0.5em] text-muted-foreground/30 uppercase">
                        {label}
                    </p>
                    <p className="origin-left text-8xl leading-none font-black tracking-tighter text-[#2d1810] transition-transform group-hover:scale-110">
                        {value}
                    </p>
                </div>
                <div
                    className={cn(
                        'relative z-10 rounded-[3rem] border-8 border-white p-8 shadow-2xl transition-all duration-1000 group-hover:rotate-[360deg]',
                        iconClassName,
                    )}
                >
                    <Icon className="h-10 w-10 stroke-[4px]" />
                </div>
            </CardContent>
        </Card>
    );
}
