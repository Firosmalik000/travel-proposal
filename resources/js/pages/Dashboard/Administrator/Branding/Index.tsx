import { Head, useForm } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface BrandingPageProps {
    branding: {
        company_name: string;
        company_subtitle: string;
        logo_path: string;
        logo_white_path: string;
        palette: {
            primary: string;
            secondary: string;
            accent: string;
            accent_soft: string;
            surface: string;
        };
    };
}

export default function BrandingIndex({ branding }: BrandingPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: branding.company_name,
        company_subtitle: branding.company_subtitle,
        primary: branding.palette.primary,
        secondary: branding.palette.secondary,
        accent: branding.palette.accent,
        accent_soft: branding.palette.accent_soft,
        surface: branding.palette.surface,
        logo: null as File | null,
        logo_white: null as File | null,
        _method: 'PATCH',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/dashboard/website-management/branding', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Branding berhasil diperbarui'),
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Branding', href: '/dashboard/website-management/branding' }]}>
            <Head title="Branding" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Branding Default Asfar</CardTitle>
                        <CardDescription>
                            Default logo dan palet warna mengambil aset `docs/logo`. Kalau diubah di sini, public page dan portal admin langsung ikut branding baru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6" onSubmit={submit}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Nama Brand</Label>
                                    <Input id="company_name" value={data.company_name} onChange={(event) => setData('company_name', event.target.value)} />
                                    {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company_subtitle">Subtitle</Label>
                                    <Input id="company_subtitle" value={data.company_subtitle} onChange={(event) => setData('company_subtitle', event.target.value)} />
                                    {errors.company_subtitle && <p className="text-sm text-destructive">{errors.company_subtitle}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo Utama</Label>
                                    <Input id="logo" type="file" accept="image/*" onChange={(event) => setData('logo', event.target.files?.[0] ?? null)} />
                                    {errors.logo && <p className="text-sm text-destructive">{errors.logo}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo_white">Logo Putih</Label>
                                    <Input id="logo_white" type="file" accept="image/*" onChange={(event) => setData('logo_white', event.target.files?.[0] ?? null)} />
                                    {errors.logo_white && <p className="text-sm text-destructive">{errors.logo_white}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-5">
                                {[
                                    ['primary', 'Primary'],
                                    ['secondary', 'Secondary'],
                                    ['accent', 'Accent'],
                                    ['accent_soft', 'Accent Soft'],
                                    ['surface', 'Surface'],
                                ].map(([key, label]) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={key}>{label}</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={key}
                                                type="color"
                                                value={data[key as keyof typeof data] as string}
                                                onChange={(event) => setData(key as keyof typeof data, event.target.value as never)}
                                                className="h-10 w-14 p-1"
                                            />
                                            <Input
                                                value={data[key as keyof typeof data] as string}
                                                onChange={(event) => setData(key as keyof typeof data, event.target.value as never)}
                                            />
                                        </div>
                                        {errors[key as keyof typeof errors] && (
                                            <p className="text-sm text-destructive">{errors[key as keyof typeof errors]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3">
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-base">Preview Logo Utama</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex min-h-40 items-center justify-center rounded-lg" style={{ backgroundColor: data.surface }}>
                                        <img src={branding.logo_path} alt={branding.company_name} className="max-h-28 object-contain" />
                                    </CardContent>
                                </Card>
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-base">Preview Logo Putih</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex min-h-40 items-center justify-center rounded-lg bg-[#8c0a16]">
                                        <img src={branding.logo_white_path} alt={`${branding.company_name} white`} className="max-h-28 object-contain" />
                                    </CardContent>
                                </Card>
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-base">Preview Warna</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                        {[data.primary, data.secondary, data.accent, data.accent_soft, data.surface].map((color) => (
                                            <div key={color} className="space-y-2">
                                                <div className="h-20 rounded-md border" style={{ backgroundColor: color }} />
                                                <p className="text-xs font-medium">{color}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Branding
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
