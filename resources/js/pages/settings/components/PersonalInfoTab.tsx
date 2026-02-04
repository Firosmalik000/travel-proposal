import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
}

interface Jabatan {
    id: number;
    name: string;
}

interface Karyawan {
    id: number;
    nik: string;
    nama_lengkap: string;
    nama_panggilan: string;
    gender: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    agama: string;
    status_pernikahan: string;
    email: string;
    no_telp: string;
    foto?: string;
    foto_url?: string;
    department?: Department;
    jabatan?: Jabatan;
}

interface Props {
    karyawan?: Karyawan;
}

export default function PersonalInfoTab({ karyawan }: Props) {
    const [fotoPreview, setFotoPreview] = useState<string | null>(
        karyawan?.foto_url || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: karyawan?.nama_lengkap || '',
        nama_panggilan: karyawan?.nama_panggilan || '',
        gender: karyawan?.gender || 'L',
        tempat_lahir: karyawan?.tempat_lahir || '',
        tanggal_lahir: karyawan?.tanggal_lahir || '',
        alamat: karyawan?.alamat || '',
        agama: karyawan?.agama || '',
        status_pernikahan: karyawan?.status_pernikahan || 'Belum Menikah',
        no_telp: karyawan?.no_telp || '',
        foto: null as File | null,
        _method: 'PATCH',
    });

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        post('/settings/profile/personal-info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Informasi pribadi berhasil diperbarui');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal memperbarui informasi pribadi');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Profil */}
            <div className="flex justify-center">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={fotoPreview || undefined} />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-primary/10">
                            {data.nama_lengkap?.charAt(0) || 'K'}
                        </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="foto"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                    >
                        <Camera className="h-4 w-4" />
                        <input
                            type="file"
                            id="foto"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFotoChange}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIK - Read only */}
                <div className="space-y-2">
                    <Label htmlFor="nik">NIK</Label>
                    <Input
                        id="nik"
                        value={karyawan?.nik || ''}
                        disabled
                        className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">NIK tidak dapat diubah</p>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-2">
                    <Label htmlFor="nama_lengkap">
                        Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="nama_lengkap"
                        value={data.nama_lengkap}
                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                        placeholder="Nama Lengkap"
                        required
                    />
                    {errors.nama_lengkap && (
                        <p className="text-sm text-destructive">{errors.nama_lengkap}</p>
                    )}
                </div>

                {/* Nama Panggilan */}
                <div className="space-y-2">
                    <Label htmlFor="nama_panggilan">Nama Panggilan</Label>
                    <Input
                        id="nama_panggilan"
                        value={data.nama_panggilan}
                        onChange={(e) => setData('nama_panggilan', e.target.value)}
                        placeholder="Nama Panggilan"
                    />
                    {errors.nama_panggilan && (
                        <p className="text-sm text-destructive">{errors.nama_panggilan}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label htmlFor="gender">
                        Jenis Kelamin <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.gender}
                        onValueChange={(value) => setData('gender', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && (
                        <p className="text-sm text-destructive">{errors.gender}</p>
                    )}
                </div>

                {/* Tempat Lahir */}
                <div className="space-y-2">
                    <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                    <Input
                        id="tempat_lahir"
                        value={data.tempat_lahir}
                        onChange={(e) => setData('tempat_lahir', e.target.value)}
                        placeholder="Tempat Lahir"
                    />
                    {errors.tempat_lahir && (
                        <p className="text-sm text-destructive">{errors.tempat_lahir}</p>
                    )}
                </div>

                {/* Tanggal Lahir */}
                <div className="space-y-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input
                        id="tanggal_lahir"
                        type="date"
                        value={data.tanggal_lahir}
                        onChange={(e) => setData('tanggal_lahir', e.target.value)}
                    />
                    {errors.tanggal_lahir && (
                        <p className="text-sm text-destructive">{errors.tanggal_lahir}</p>
                    )}
                </div>

                {/* Agama */}
                <div className="space-y-2">
                    <Label htmlFor="agama">Agama</Label>
                    <Select
                        value={data.agama || 'none'}
                        onValueChange={(value) => setData('agama', value === 'none' ? '' : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- Pilih Agama --</SelectItem>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Kristen">Kristen</SelectItem>
                            <SelectItem value="Katolik">Katolik</SelectItem>
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Buddha">Buddha</SelectItem>
                            <SelectItem value="Konghucu">Konghucu</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.agama && (
                        <p className="text-sm text-destructive">{errors.agama}</p>
                    )}
                </div>

                {/* Status Pernikahan */}
                <div className="space-y-2">
                    <Label htmlFor="status_pernikahan">Status Pernikahan</Label>
                    <Select
                        value={data.status_pernikahan}
                        onValueChange={(value) => setData('status_pernikahan', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                            <SelectItem value="Menikah">Menikah</SelectItem>
                            <SelectItem value="Cerai">Cerai</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status_pernikahan && (
                        <p className="text-sm text-destructive">{errors.status_pernikahan}</p>
                    )}
                </div>

                {/* No Telepon */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="no_telp">No. Telepon</Label>
                    <Input
                        id="no_telp"
                        value={data.no_telp}
                        onChange={(e) => setData('no_telp', e.target.value)}
                        placeholder="08123456789"
                    />
                    {errors.no_telp && (
                        <p className="text-sm text-destructive">{errors.no_telp}</p>
                    )}
                </div>

                {/* Alamat */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                        id="alamat"
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        placeholder="Alamat lengkap"
                        rows={3}
                    />
                    {errors.alamat && (
                        <p className="text-sm text-destructive">{errors.alamat}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting || processing}>
                    {(isSubmitting || processing) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}
