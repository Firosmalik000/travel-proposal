import type { ElementType } from 'react';

export function PackageEditorInfoHeading({
    icon: Icon,
    title,
}: {
    icon: ElementType;
    title: string;
}) {
    return (
        <div className="flex items-start gap-3 border-t border-border/70 pt-5">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
            </div>
        </div>
    );
}
