import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
        public_theme: {
            gradient_from: string;
            gradient_to: string;
            text: string;
        };
    };
}

const DEFAULT_PUBLIC_THEME = {
    gradientFrom: '#5d0812',
    gradientTo: '#e69c32',
    text: '#ffffff',
} as const;

export default function BrandingIndex({ branding }: BrandingPageProps) {
    const { can } = usePermission('branding');
    const canEdit = can('edit');
    const { data, setData, post, processing, errors } = useForm({
        company_name: branding.company_name,
        company_subtitle: branding.company_subtitle,
        primary: branding.palette.primary,
        secondary: branding.palette.secondary,
        accent: branding.palette.accent,
        accent_soft: branding.palette.accent_soft,
        surface: branding.palette.surface,
        public_gradient_from:
            branding.public_theme.gradient_from ??
            (branding.public_theme as any).navbar_gradient_from,
        public_gradient_to:
            branding.public_theme.gradient_to ??
            (branding.public_theme as any).navbar_gradient_to,
        public_text:
            branding.public_theme.text ??
            (branding.public_theme as any).navbar_text,
        logo: null as File | null,
        logo_white: null as File | null,
        _method: 'PATCH',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!canEdit) {
            return;
        }

        post('/admin/website-management/branding', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Branding berhasil diperbarui'),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Branding',
                    href: '/admin/website-management/branding',
                },
            ]}
        >
            <Head title="Branding" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Branding Default Asfar</CardTitle>
                        <CardDescription>
                            Pisahkan pengaturan branding untuk kebutuhan public
                            website dan dashboard admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="public" className="space-y-6">
                            <TabsList className="grid h-auto w-full grid-cols-2">
                                <TabsTrigger value="public">
                                    Public Website
                                </TabsTrigger>
                                <TabsTrigger value="dashboard">
                                    Dashboard/Admin
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="public" className="space-y-4">
                                <form className="space-y-6" onSubmit={submit}>
                                    <Card className="border-dashed">
                                        <CardHeader>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        Warna Navbar & Footer
                                                        Public
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Custom gradient
                                                        navbar/footer serta
                                                        warna teks untuk layout
                                                        public website.
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing || !canEdit
                                                    }
                                                >
                                                    {processing && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Simpan Warna Navbar &
                                                    Footer
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {[
                                                    [
                                                        'public_gradient_from',
                                                        'Gradient From (Navbar & Footer)',
                                                    ],
                                                    [
                                                        'public_gradient_to',
                                                        'Gradient To (Navbar & Footer)',
                                                    ],
                                                    [
                                                        'public_text',
                                                        'Warna Teks (Navbar & Footer)',
                                                    ],
                                                ].map(([key, label]) => (
                                                    <div
                                                        key={key}
                                                        className="space-y-2"
                                                    >
                                                        <Label htmlFor={key}>
                                                            {label}
                                                        </Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                id={key}
                                                                type="color"
                                                                value={
                                                                    data[
                                                                        key as keyof typeof data
                                                                    ] as string
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setData(
                                                                        key as keyof typeof data,
                                                                        event
                                                                            .target
                                                                            .value as never,
                                                                    )
                                                                }
                                                                className="h-10 w-14 p-1"
                                                            />
                                                            <Input
                                                                value={
                                                                    data[
                                                                        key as keyof typeof data
                                                                    ] as string
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setData(
                                                                        key as keyof typeof data,
                                                                        event
                                                                            .target
                                                                            .value as never,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        {errors[
                                                            key as keyof typeof errors
                                                        ] && (
                                                            <p className="text-sm text-destructive">
                                                                {
                                                                    errors[
                                                                        key as keyof typeof errors
                                                                    ]
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <Card className="border-dashed">
                                                <CardHeader>
                                                    <CardTitle className="text-base">
                                                        Preview Public Theme
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Simulasi warna untuk
                                                        navbar dan footer
                                                        sebelum submit.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div
                                                        className="overflow-hidden rounded-xl border"
                                                        style={{
                                                            background: `linear-gradient(90deg, ${data.public_gradient_from}, ${data.public_gradient_to})`,
                                                            color: data.public_text,
                                                        }}
                                                    >
                                                        <div className="h-5 border-b border-white/25" />
                                                        <div className="flex h-16 items-center justify-center px-3">
                                                            <span className="rounded-full border border-white/35 bg-black/10 px-3 py-1 text-xs font-semibold tracking-wide">
                                                                Sample Text
                                                                Color
                                                            </span>
                                                        </div>
                                                        <div className="h-5 border-t border-white/25" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setData(
                                                            'public_gradient_from',
                                                            DEFAULT_PUBLIC_THEME.gradientFrom as never,
                                                        );
                                                        setData(
                                                            'public_gradient_to',
                                                            DEFAULT_PUBLIC_THEME.gradientTo as never,
                                                        );
                                                        setData(
                                                            'public_text',
                                                            DEFAULT_PUBLIC_THEME.text as never,
                                                        );
                                                    }}
                                                >
                                                    Gunakan Warna Default
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing || !canEdit
                                                    }
                                                >
                                                    {processing && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Simpan Warna Navbar & Footer
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                >
                                                    <Link href="/admin/website-management/seo">
                                                        Buka SEO Settings
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                >
                                                    <Link href="/admin/website-management/landing">
                                                        Buka Landing Content
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </form>
                            </TabsContent>

                            <TabsContent
                                value="dashboard"
                                className="space-y-6"
                            >
                                <form className="space-y-6" onSubmit={submit}>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">
                                                Nama Brand
                                            </Label>
                                            <Input
                                                id="company_name"
                                                value={data.company_name}
                                                disabled={!canEdit}
                                                onChange={(event) =>
                                                    setData(
                                                        'company_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {errors.company_name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.company_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_subtitle">
                                                Subtitle
                                            </Label>
                                            <Input
                                                id="company_subtitle"
                                                value={data.company_subtitle}
                                                disabled={!canEdit}
                                                onChange={(event) =>
                                                    setData(
                                                        'company_subtitle',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {errors.company_subtitle && (
                                                <p className="text-sm text-destructive">
                                                    {errors.company_subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logo">
                                                Logo Utama
                                            </Label>
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) =>
                                                    setData(
                                                        'logo',
                                                        event.target
                                                            .files?.[0] ?? null,
                                                    )
                                                }
                                            />
                                            {errors.logo && (
                                                <p className="text-sm text-destructive">
                                                    {errors.logo}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logo_white">
                                                Logo Putih
                                            </Label>
                                            <Input
                                                id="logo_white"
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) =>
                                                    setData(
                                                        'logo_white',
                                                        event.target
                                                            .files?.[0] ?? null,
                                                    )
                                                }
                                            />
                                            {errors.logo_white && (
                                                <p className="text-sm text-destructive">
                                                    {errors.logo_white}
                                                </p>
                                            )}
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
                                            <div
                                                key={key}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor={key}>
                                                    {label}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id={key}
                                                        type="color"
                                                        value={
                                                            data[
                                                                key as keyof typeof data
                                                            ] as string
                                                        }
                                                        onChange={(event) =>
                                                            setData(
                                                                key as keyof typeof data,
                                                                event.target
                                                                    .value as never,
                                                            )
                                                        }
                                                        className="h-10 w-14 p-1"
                                                    />
                                                    <Input
                                                        value={
                                                            data[
                                                                key as keyof typeof data
                                                            ] as string
                                                        }
                                                        onChange={(event) =>
                                                            setData(
                                                                key as keyof typeof data,
                                                                event.target
                                                                    .value as never,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                {errors[
                                                    key as keyof typeof errors
                                                ] && (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            errors[
                                                                key as keyof typeof errors
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <Card className="border-dashed">
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Preview Logo Utama
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent
                                                className="flex min-h-40 items-center justify-center rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        data.surface,
                                                }}
                                            >
                                                <img
                                                    src={branding.logo_path}
                                                    alt={branding.company_name}
                                                    className="max-h-28 object-contain"
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card className="border-dashed">
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Preview Logo Putih
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex min-h-40 items-center justify-center rounded-lg bg-[#8c0a16]">
                                                <img
                                                    src={
                                                        branding.logo_white_path
                                                    }
                                                    alt={`${branding.company_name} white`}
                                                    className="max-h-28 object-contain"
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card className="border-dashed">
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Preview Warna
                                                </CardTitle>
                                                <CardDescription>
                                                    Prioritas review warna
                                                    dashboard/admin:
                                                    <span className="font-medium text-foreground">
                                                        {' '}
                                                        primary
                                                    </span>{' '}
                                                    untuk aksi utama,
                                                    <span className="font-medium text-foreground">
                                                        {' '}
                                                        secondary
                                                    </span>{' '}
                                                    untuk pendamping, dan
                                                    lainnya sebagai aksen.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                                {[
                                                    data.primary,
                                                    data.secondary,
                                                    data.accent,
                                                    data.accent_soft,
                                                    data.surface,
                                                ].map((color) => (
                                                    <div
                                                        key={color}
                                                        className="space-y-2"
                                                    >
                                                        <div
                                                            className="h-20 rounded-md border"
                                                            style={{
                                                                backgroundColor:
                                                                    color,
                                                            }}
                                                        />
                                                        <p className="text-xs font-medium">
                                                            {color}
                                                        </p>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="flex justify-end">
                                        {canEdit ? (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                Simpan Branding Dashboard
                                            </Button>
                                        ) : null}
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
