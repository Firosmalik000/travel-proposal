import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

type Props = {
    canCreate: boolean;
    canExport: boolean;
    onCreate: () => void;
    onExport: () => void;
};

export function BookingListingHeader({
    canCreate,
    canExport,
    onCreate,
    onExport,
}: Props) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                    Booking Listing
                </h1>
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                    {canExport ? (
                        <Button
                            variant="outline"
                            onClick={onExport}
                            className="w-full gap-2 md:w-auto"
                        >
                            <FileText className="h-4 w-4" />
                            Export PDF
                        </Button>
                    ) : null}
                    {canCreate ? (
                        <Button onClick={onCreate} className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Booking
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
