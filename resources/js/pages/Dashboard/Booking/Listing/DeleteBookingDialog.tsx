import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type DeleteBookingDialogProps = {
    bookingCode: string | null;
    canDelete: boolean;
    isDeleting: boolean;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteBookingDialog({
    bookingCode,
    canDelete,
    isDeleting,
    open,
    onClose,
    onConfirm,
}: DeleteBookingDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Booking</DialogTitle>
                    <DialogDescription>
                        Booking <strong>{bookingCode ?? '-'}</strong> akan
                        dihapus permanen dari listing admin.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    {canDelete ? (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isDeleting}
                        >
                            Hapus Booking
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
