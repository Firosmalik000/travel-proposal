import { Label } from '@/components/ui/label';
import type { ReactNode } from 'react';

export function LandingEditorField({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
            {children}
            {hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}
