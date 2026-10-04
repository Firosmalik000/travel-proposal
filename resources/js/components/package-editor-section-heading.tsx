import type { ElementType } from 'react';

type Props = {
    icon: ElementType;
    title: string;
};

export function PackageEditorSectionHeader({ icon: Icon, title }: Props) {
    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
            </div>
        </div>
    );
}
