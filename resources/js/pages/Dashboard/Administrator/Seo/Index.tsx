import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { toast } from 'sonner';

interface SeoSettingsPageProps {
    settings: Record<string, any>;
}

export default function SeoIndex({ settings }: SeoSettingsPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        site_name_id: settings.general?.siteName?.id ?? '',
        site_name_en: settings.general?.siteName?.en ?? '',
        tagline_id: settings.general?.tagline?.id ?? '',
        tagline_en: settings.general?.tagline?.en ?? '',
        default_description_id: settings.general?.defaultDescription?.id ?? '',
        default_description_en: settings.general?.defaultDescription?.en ?? '',
        keywords: settings.general?.keywords ?? '',
        phone: settings.contact?.phone ?? '',
        email: settings.contact?.email ?? '',
        address_id: settings.contact?.address?.full?.id ?? '',
        address_en: settings.contact?.address?.full?.en ?? '',
        map_link: settings.contact?.address?.mapLink ?? '',
        weekday_hours_id: settings.contact?.operatingHours?.weekday?.id ?? '',
        weekday_hours_en: settings.contact?.operatingHours?.weekday?.en ?? '',
        weekend_hours_id: settings.contact?.operatingHours?.weekend?.id ?? '',
        weekend_hours_en: settings.contact?.operatingHours?.weekend?.en ?? '',
        robots_default: settings.advanced?.robotsDefault ?? 'index, follow',
        canonical_base: settings.advanced?.canonicalBase ?? '',
        google_verification: settings.advanced?.googleVerification ?? '',
        bing_verification: settings.advanced?.bingVerification ?? '',
        primary: settings.colors?.primary ?? '#c80012',
        secondary: settings.colors?.secondary ?? '#8c0a16',
        accent: settings.colors?.accent ?? '#ff9200',
        accent_soft: settings.colors?.accent_soft ?? '#ffc578',
        surface: settings.colors?.surface ?? '#f6e7c6',
        logo: null as File | null,
        og_image: null as File | null,
        _method: 'PATCH',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/dashboard/website-management/seo', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('SEO settings berhasil disimpan'),
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'SEO Settings', href: '/dashboard/website-management/seo' }]}>
            <Head title="SEO Settings" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>SEO & Site Settings</CardTitle>
                        <CardDescription>Pusat metadata website, kontak, logo SEO, dan warna global travel umroh.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-8" onSubmit={submit}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name_id">Site Name ID</Label>
                                    <Input id="site_name_id" value={data.site_name_id} onChange={(event) => setData('site_name_id', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site_name_en">Site Name EN</Label>
                                    <Input id="site_name_en" value={data.site_name_en} onChange={(event) => setData('site_name_en', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagline_id">Tagline ID</Label>
                                    <Input id="tagline_id" value={data.tagline_id} onChange={(event) => setData('tagline_id', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagline_en">Tagline EN</Label>
                                    <Input id="tagline_en" value={data.tagline_en} onChange={(event) => setData('tagline_en', event.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="default_description_id">Default Description ID</Label>
                                    <Textarea id="default_description_id" value={data.default_description_id} onChange={(event) => setData('default_description_id', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="default_description_en">Default Description EN</Label>
                                    <Textarea id="default_description_en" value={data.default_description_en} onChange={(event) => setData('default_description_en', event.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="keywords">Keywords</Label>
                                    <Textarea id="keywords" value={data.keywords} onChange={(event) => setData('keywords', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="canonical_base">Canonical Base</Label>
                                    <Input id="canonical_base" value={data.canonical_base} onChange={(event) => setData('canonical_base', event.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" value={data.phone} onChange={(event) => setData('phone', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address_id">Address ID</Label>
                                    <Textarea id="address_id" value={data.address_id} onChange={(event) => setData('address_id', event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address_en">Address EN</Label>
                                    <Textarea id="address_en" value={data.address_en} onChange={(event) => setData('address_en', event.target.value)} />
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
                                        <Input id={key} value={data[key as keyof typeof data] as string} onChange={(event) => setData(key as keyof typeof data, event.target.value as never)} />
                                        {errors[key as keyof typeof errors] && <p className="text-sm text-destructive">{errors[key as keyof typeof errors]}</p>}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo SEO</Label>
                                    <Input id="logo" type="file" accept="image/*" onChange={(event) => setData('logo', event.target.files?.[0] ?? null)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="og_image">OG Image</Label>
                                    <Input id="og_image" type="file" accept="image/*" onChange={(event) => setData('og_image', event.target.files?.[0] ?? null)} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>Simpan SEO Settings</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
