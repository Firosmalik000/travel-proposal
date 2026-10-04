import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

type Props = {
    icon: ElementType;
    title: string;
    desc: string;
    children: ReactNode;
    collapsible?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sectionId?: string;
    actions?: ReactNode;
};

export function LandingEditorSection({
    icon: Icon,
    title,
    desc,
    children,
    collapsible = false,
    open,
    onOpenChange,
    sectionId,
    actions,
}: Props) {
    const header = (
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {collapsible ? (
                    <ChevronDown
                        className={`mt-1 h-4 w-4 text-muted-foreground transition ${open ? 'rotate-180' : ''}`}
                    />
                ) : null}
            </div>
        </div>
    );

    const content = (
        <div
            id={sectionId}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
            {collapsible ? (
                <CollapsibleTrigger asChild>
                    <button type="button" className="mb-4 w-full text-left">
                        {header}
                    </button>
                </CollapsibleTrigger>
            ) : (
                <div className="mb-4">{header}</div>
            )}
            {collapsible ? (
                <CollapsibleContent>
                    <div className="space-y-4">{children}</div>
                </CollapsibleContent>
            ) : (
                <div className="space-y-4">{children}</div>
            )}
        </div>
    );

    if (!collapsible) {
        return content;
    }

    return (
        <Collapsible open={Boolean(open)} onOpenChange={onOpenChange}>
            {content}
        </Collapsible>
    );
}
