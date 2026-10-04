import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export type BookingListingStat = {
    label: string;
    value: string | number;
    icon: LucideIcon;
};

export function BookingListingStats({
    stats,
}: {
    stats: BookingListingStat[];
}) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/60 shadow-sm">
                    <CardContent className="flex items-center justify-between p-3.5">
                        <div>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                {stat.label}
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {stat.value}
                            </p>
                        </div>
                        <div className="rounded-full bg-muted p-2.5">
                            <stat.icon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
