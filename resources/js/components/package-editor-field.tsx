import { Label } from '@/components/ui/label';
import type { ReactNode } from 'react';

export function PackageEditorField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium text-foreground">
                {label}
            </Label>
            {children}
            {error ? (
                <p className="mt-1 text-xs font-medium text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
