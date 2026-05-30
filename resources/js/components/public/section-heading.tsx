import { cn } from '@/lib/utils';

type PublicSectionHeadingProps = {
    badge: string;
    title: string;
    description?: string;
    tone?: 'default' | 'dark';
    align?: 'left' | 'center';
    className?: string;
};

export default function PublicSectionHeading({
    badge,
    title,
    description,
    tone = 'default',
    align = 'left',
    className,
}: PublicSectionHeadingProps) {
    const isDark = tone === 'dark';
    const isCenter = align === 'center';

    return (
        <div className={cn(isCenter ? 'text-center' : 'text-left', className)}>
            <span
                className={cn(
                    'inline-block rounded-full px-4 py-1.5 text-[0.7rem] font-bold tracking-widest uppercase',
                    isDark
                        ? 'bg-white/10 text-white/60'
                        : 'bg-primary/10 text-primary',
                )}
            >
                {badge}
            </span>
            <h2
                className={cn(
                    'font-heading mt-4 text-3xl font-extrabold sm:text-4xl md:text-5xl',
                    isDark ? 'text-white' : 'text-foreground',
                )}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        'mt-5 text-sm sm:text-base',
                        isDark ? 'text-white/50' : 'text-muted-foreground',
                    )}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
