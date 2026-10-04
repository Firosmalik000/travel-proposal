import type { ReactNode } from 'react';

export function LandingEditorRow({ children }: { children: ReactNode }) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
