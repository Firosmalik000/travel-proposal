import type { ReactNode } from 'react';

export function LandingEditorGroup({
    title,
    desc,
    children,
}: {
    title: string;
    desc?: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-muted/10 p-4">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {desc ? (
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            ) : null}
            <div className="mt-3 space-y-4">{children}</div>
        </div>
    );
}
