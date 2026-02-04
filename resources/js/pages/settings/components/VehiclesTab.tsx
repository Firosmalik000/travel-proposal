import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Car as CarIcon, Loader2 } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

interface Kendaraan {
    id: number;
    user_id: number;
    plat: string;
    merk: string;
    warna: string;
    cc: string;
}

interface Props {
    kendaraan: Kendaraan[];
}

export default function VehiclesTab({ kendaraan = [] }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingKendaraan, setEditingKendaraan] = useState<Kendaraan | null>(null);
    const [deletingKendaraan, setDeletingKendaraan] = useState<Kendaraan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, reset, errors } = useForm({
        plat: '',
        merk: '',
        warna: '',
        cc: '',
    });

    const openAddDialog = () => {
        reset();
        setEditingKendaraan(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (kend: Kendaraan) => {
        setData({
            plat: kend.plat,
            merk: kend.merk,
            warna: kend.warna,
            cc: kend.cc,
        });
        setEditingKendaraan(kend);
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (kend: Kendaraan) => {
        setDeletingKendaraan(kend);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editingKendaraan) {
            // Update kendaraan
            router.patch(`/settings/profile/kendaraan/${editingKendaraan.id}`, data, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kendaraan berhasil diperbarui');
                    setIsDialogOpen(false);
                    reset();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Gagal memperbarui kendaraan');
                    setIsSubmitting(false);
                },
            });
        } else {
            // Add new kendaraan
            post('/settings/profile/kendaraan', {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kendaraan berhasil ditambahkan');
                    setIsDialogOpen(false);
                    reset();
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Gagal menambahkan kendaraan');
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingKendaraan) return;

        setIsSubmitting(true);
        router.delete(`/settings/profile/kendaraan/${deletingKendaraan.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kendaraan berhasil dihapus');
                setIsDeleteDialogOpen(false);
                setDeletingKendaraan(null);
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal menghapus kendaraan');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Kelola data kendaraan yang terdaftar untuk parkir di perusahaan
                    </p>
                </div>
                <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kendaraan
                </Button>
            </div>

            {kendaraan.length === 0 ? (
                <div className="border rounded-lg p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <CarIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Belum ada kendaraan terdaftar</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tambahkan kendaraan Anda untuk terdaftar di sistem parkir perusahaan
                    </p>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kendaraan Pertama
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plat Nomor</TableHead>
                                <TableHead>Merk</TableHead>
                                <TableHead>Warna</TableHead>
                                <TableHead>CC</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kendaraan.map((kend) => (
                                <TableRow key={kend.id}>
                                    <TableCell className="font-medium">{kend.plat}</TableCell>
                                    <TableCell>{kend.merk}</TableCell>
                                    <TableCell>{kend.warna}</TableCell>
                                    <TableCell>{kend.cc}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(kend)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => openDeleteDialog(kend)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingKendaraan ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingKendaraan
                                ? 'Ubah informasi kendaraan yang sudah terdaftar'
                                : 'Tambahkan kendaraan baru untuk terdaftar di sistem parkir'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="plat">
                                Plat Nomor <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="plat"
                                value={data.plat}
                                onChange={(e) => setData('plat', e.target.value)}
                                placeholder="B 1234 XYZ"
                                required
                            />
                            {errors.plat && (
                                <p className="text-sm text-destructive">{errors.plat}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="merk">
                                Merk Kendaraan <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="merk"
                                value={data.merk}
                                onChange={(e) => setData('merk', e.target.value)}
                                placeholder="Honda Beat, Toyota Avanza, dll"
                                required
                            />
                            {errors.merk && (
                                <p className="text-sm text-destructive">{errors.merk}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="warna">
                                Warna <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="warna"
                                value={data.warna}
                                onChange={(e) => setData('warna', e.target.value)}
                                placeholder="Merah, Hitam, Putih, dll"
                                required
                            />
                            {errors.warna && (
                                <p className="text-sm text-destructive">{errors.warna}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cc">
                                CC / Kapasitas Mesin <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="cc"
                                value={data.cc}
                                onChange={(e) => setData('cc', e.target.value)}
                                placeholder="110, 125, 1500, dll"
                                required
                            />
                            {errors.cc && (
                                <p className="text-sm text-destructive">{errors.cc}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingKendaraan ? 'Update' : 'Tambah'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kendaraan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kendaraan{' '}
                            <strong>{deletingKendaraan?.plat}</strong>? Tindakan ini tidak dapat
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
