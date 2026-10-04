import { Skeleton } from '@/components/ui/skeleton';

export function PackageEditorItinerarySkeleton() {
    return (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-16" />
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <Skeleton className="h-28 rounded-2xl" />
        </div>
    );
}
