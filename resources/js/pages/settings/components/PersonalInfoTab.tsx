import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface ProfileData {
    id: number;
    full_name: string | null;
    phone: string | null;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    address: string | null;
    photo_path: string | null;
}

interface Props {
    profile?: ProfileData;
}

export default function PersonalInfoTab({ profile }: Props) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photo_path ? `/storage/${profile.photo_path}` : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        gender: profile?.gender || '',
        birth_place: profile?.birth_place || '',
        birth_date: profile?.birth_date || '',
        address: profile?.address || '',
        photo: null as File | null,
        _method: 'PATCH',
    });

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setData('photo', file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        post('/settings/profile/personal-info', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Informasi pribadi berhasil diperbarui');
                setIsSubmitting(false);
            },
            onError: () => {
                toast.error('Gagal memperbarui informasi pribadi');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
                <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={photoPreview || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-4xl">
                            {data.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="photo"
                        className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                    >
                        <Camera className="h-4 w-4" />
                        <input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                        id="full_name"
                        value={data.full_name}
                        onChange={(event) => setData('full_name', event.target.value)}
                        placeholder="Nama lengkap"
                    />
                    {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(event) => setData('phone', event.target.value)}
                        placeholder="08123456789"
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select value={data.gender || 'none'} onValueChange={(value) => setData('gender', value === 'none' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Belum disetel</SelectItem>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="birth_place">Tempat Lahir</Label>
                    <Input
                        id="birth_place"
                        value={data.birth_place}
                        onChange={(event) => setData('birth_place', event.target.value)}
                        placeholder="Tempat lahir"
                    />
                    {errors.birth_place && <p className="text-sm text-destructive">{errors.birth_place}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="birth_date">Tanggal Lahir</Label>
                    <Input
                        id="birth_date"
                        type="date"
                        value={data.birth_date}
                        onChange={(event) => setData('birth_date', event.target.value)}
                    />
                    {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                        id="address"
                        value={data.address}
                        onChange={(event) => setData('address', event.target.value)}
                        placeholder="Alamat lengkap"
                        rows={3}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
            </div>

            <div className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={isSubmitting || processing}>
                    {(isSubmitting || processing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}
