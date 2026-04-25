import { AdminLocaleSwitch } from '@/components/admin-locale-switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAdminLocale } from '@/contexts/admin-locale';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    FileText,
    Globe,
    Image as ImageIcon,
    Languages,
    Layers3,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LocalizedValue {
    id?: string;
    en?: string;
}

interface LandingPageItem {
    id: number;
    slug: string;
    title: LocalizedValue;
    excerpt?: LocalizedValue | null;
    content: Record<string, any>;
    is_active: boolean;
}

interface EditableField {
    path: string;
    label: string;
    multiline: boolean;
    value: string;
}

interface ExtraSectionField {
    path: string;
    label: string;
    multiline?: boolean;
}

const pageLabels: Record<string, string> = {
    home: 'Home',
    'tentang-kami': 'Tentang Kami',
    kontak: 'Kontak',
    galeri: 'Galeri',
    karier: 'Karier',
    'custom-umroh': 'Custom Umroh',
};

const landingTabOrder = [
    'home',
    'kontak',
    'tentang-kami',
    'custom-umroh',
] as const;

const hiddenLandingSlugs = new Set([
    'paket-umroh',
    'paket-detail',
    'terms-conditions',
    'privacy-policy',
    'refund-policy',
    'disclaimer',
    'galeri',
    'legalitas',
    'mitra',
    'karier',
]);

const landingSectionMap: Record<string, string[]> = {
    home: [
        'hero',
        'stats',
        'about',
        'packages',
        'services',
        'gallery',
        'contact',
    ],
    'tentang-kami': ['hero', 'profile', 'stats', 'values'],
    kontak: ['heading', 'description', 'map'],
    galeri: ['badge', 'description'],
    karier: ['badge', 'subtitle', 'cta'],
    'custom-umroh': ['badge', 'description', 'subtitle', 'cta'],
};

const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    about: 'Tentang Kami',
    packages: 'Paket Unggulan',
    services: 'Layanan Kami',
    gallery: 'Galeri Foto',
    contact: 'Kontak Kami',
    stats: 'Statistik Data',
    faq: 'Pertanyaan Umum',
    profile: 'Profil Perusahaan',
    values: 'Nilai & Budaya',
    team: 'Tim Kami',
    cards: 'Kartu Informasi',
    note: 'Catatan Penting',
    badge: 'Label Kecil (Badge)',
    heading: 'Judul Utama',
    map: 'Peta Lokasi',
    docs_title: 'Judul Dokumen',
    bank_title: 'Informasi Bank',
    bank_lines: 'Daftar Bank',
    disclaimer_title: 'Judul Sanggahan',
    disclaimer: 'Pernyataan Sanggahan',
    subtitle: 'Sub-judul',
    description: 'Deskripsi Lengkap',
    cta: 'Tombol Aksi (CTA)',
    ctas: 'Tombol Aksi',
    summary_title: 'Ringkasan Paket',
    included_title: 'Fasilitas Termasuk',
    excluded_title: 'Tidak Termasuk',
    itinerary_title: 'Rencana Perjalanan',
    facilities_title: 'Fasilitas Detail',
    requirements_title: 'Syarat & Ketentuan',
    payment_title: 'Skema Pembayaran',
    policy_title: 'Kebijakan Layanan',
    cta_block: 'Blok Tombol Aksi',
    interest: 'Minat Pelanggan',
};

function Section({
    icon: Icon,
    title,
    desc,
    children,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
            {children}
            {hint && (
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export default function LandingIndex({
    pages,
}: {
    pages: LandingPageItem[];
}) {
    const visiblePages = pages
        .filter(
            (page) =>
                !hiddenLandingSlugs.has(page.slug) &&
                landingTabOrder.includes(
                    page.slug as (typeof landingTabOrder)[number],
                ),
        )
        .sort(
            (leftPage, rightPage) =>
                landingTabOrder.indexOf(
                    leftPage.slug as (typeof landingTabOrder)[number],
                ) -
                landingTabOrder.indexOf(
                    rightPage.slug as (typeof landingTabOrder)[number],
                ),
        );
    const defaultTab = visiblePages[0]?.slug ?? 'home';

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Website Management', href: '#' },
                {
                    label: 'Landing Page Editor',
                    href: '/admin/website-management/landing',
                },
            ]}
        >
            <Head title="Landing Page Editor" />

            <div className="p-4 md:p-6">
                <Tabs defaultValue={defaultTab} className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                Landing Page Editor
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Kelola konten visual dan naratif halaman utama
                                website Anda.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
                                <Languages className="h-4 w-4 text-muted-foreground" />
                                <AdminLocaleSwitch />
                            </div>
                            <TabsList className="h-auto gap-1 rounded-xl border border-border bg-background p-1 shadow-sm">
                                {visiblePages.map((page) => (
                                    <TabsTrigger
                                        key={page.slug}
                                        value={page.slug}
                                        className="h-8 rounded-lg px-3 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        {pageLabels[page.slug] ??
                                            humanizeSegment(page.slug)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    {visiblePages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-5 py-6 text-sm text-muted-foreground">
                            Belum ada halaman landing yang siap diedit. Silakan
                            refresh halaman ini atau jalankan seeder konten
                            default.
                        </div>
                    ) : null}

                    {visiblePages.map((page) => (
                        <TabsContent
                            key={page.slug}
                            value={page.slug}
                            className="mt-0 outline-none"
                        >
                            <LandingPageEditor page={page} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function LandingPageEditor({
    page,
}: {
    page: LandingPageItem;
}) {
    const { locale } = useAdminLocale();
    const isId = locale === 'id';
    const localeLabel = isId ? 'Indonesia' : 'English';

    const { data, setData, post, processing } = useForm({
        title_id: page.title?.id ?? '',
        title_en: page.title?.en ?? '',
        excerpt_id: page.excerpt?.id ?? '',
        excerpt_en: page.excerpt?.en ?? '',
        content: page.content ?? {},
        media: {} as Record<string, File | null>,
        is_active: page.is_active,
        _method: 'PATCH',
    });

    const contentSections = getOrderedContentSections(
        page.slug,
        data.content ?? {},
    );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post(`/admin/website-management/content/${page.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                toast.success(
                    `Konten ${pageLabels[page.slug] ?? page.slug} berhasil diperbarui`,
                ),
        });
    };

    return (
        <form className="space-y-5" onSubmit={submit}>
            {/* 1. Status Halaman */}
            <Section
                icon={Settings}
                title="Status & Ringkasan"
                desc="Atur visibilitas halaman di website publik."
            >
                <Row>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <Checkbox
                            id={`active_${page.slug}`}
                            checked={Boolean(data.is_active)}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label
                            htmlFor={`active_${page.slug}`}
                            className="cursor-pointer space-y-0.5"
                        >
                            <p className="text-sm font-bold">Halaman Aktif</p>
                            <p className="text-[0.65rem] text-muted-foreground">
                                Tampil di website publik
                            </p>
                        </Label>
                    </div>
                    <div className="flex flex-col justify-center gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                            Slug Halaman
                        </p>
                        <p className="font-mono text-xs font-bold text-primary">
                            {page.slug}
                        </p>
                    </div>
                </Row>
            </Section>

            {/* 2. Informasi Utama */}
            <Section
                icon={Globe}
                title="Informasi Utama"
                desc={`Judul dan ringkasan halaman untuk bahasa ${localeLabel}.`}
            >
                <Row>
                    <Field label="Judul Halaman">
                        <Input
                            value={isId ? data.title_id : data.title_en}
                            onChange={(e) =>
                                setData(
                                    isId ? 'title_id' : 'title_en',
                                    e.target.value,
                                )
                            }
                            placeholder="Contoh: Beranda Utama"
                        />
                    </Field>
                    <Field label="Ringkasan (Excerpt)">
                        <Textarea
                            rows={2}
                            value={isId ? data.excerpt_id : data.excerpt_en}
                            onChange={(e) =>
                                setData(
                                    isId ? 'excerpt_id' : 'excerpt_en',
                                    e.target.value,
                                )
                            }
                            placeholder="Deskripsi singkat halaman ini..."
                        />
                    </Field>
                </Row>
            </Section>

            {/* 3. Section Konten Dinamis */}
            {contentSections.map(([sectionKey, sectionValue]) => {
                const label =
                    sectionLabels[sectionKey] ?? humanizeSegment(sectionKey);
                const desc = `Kelola konten ${label.toLowerCase()} untuk bahasa ${localeLabel}.`;

                if (page.slug === 'tentang-kami' && sectionKey === 'stats') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                        >
                            <StatsSectionEditor
                                content={data.content}
                                locale={locale}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                            />
                        </Section>
                    );
                }

                if (page.slug === 'tentang-kami' && sectionKey === 'values') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                        >
                            <ValuesSectionEditor
                                content={data.content}
                                locale={locale}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                            />
                        </Section>
                    );
                }

                if (page.slug === 'home' && sectionKey === 'services') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                        >
                            <div className="space-y-5">
                                <Row>
                                    {collectEditableFields(
                                        {
                                            label:
                                                data.content?.services?.label ??
                                                {},
                                            title:
                                                data.content?.services?.title ??
                                                {},
                                            description:
                                                data.content?.services
                                                    ?.description ?? {},
                                        },
                                        'services',
                                        locale,
                                    ).map((field) => (
                                        <Field
                                            key={field.path}
                                            label={field.label}
                                        >
                                            {field.multiline ? (
                                                <Textarea
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        setData(
                                                            'content',
                                                            updateNestedValue(
                                                                data.content,
                                                                field.path,
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        setData(
                                                            'content',
                                                            updateNestedValue(
                                                                data.content,
                                                                field.path,
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            )}
                                        </Field>
                                    ))}
                                </Row>
                                <ServiceItemsEditor
                                    content={data.content}
                                    locale={locale}
                                    setContent={(content) =>
                                        setData('content', content)
                                    }
                                />
                            </div>
                        </Section>
                    );
                }

                if (page.slug === 'home' && sectionKey === 'gallery') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={ImageIcon}
                            title={label}
                            desc={desc}
                        >
                            <GallerySectionEditor
                                content={data.content}
                                locale={locale}
                                media={data.media}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                                setMedia={(media) => setData('media', media)}
                            />
                        </Section>
                    );
                }

                if (page.slug === 'home' && sectionKey === 'stats') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                        >
                            <StatsSectionEditor
                                content={data.content}
                                locale={locale}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                            />
                        </Section>
                    );
                }

                const fields = collectEditableFields(
                    sectionValue,
                    sectionKey,
                    locale,
                );
                if (fields.length === 0) {
                    return null;
                }

                return (
                    <Section
                        key={sectionKey}
                        icon={FileText}
                        title={label}
                        desc={desc}
                    >
                        <Row>
                            {[
                                ...fields,
                                ...buildExtraSectionFields(
                                    page.slug,
                                    sectionKey,
                                    data.content,
                                    locale,
                                ),
                            ].map((field) =>
                                isImageField(field.path) ? (
                                    <div
                                        key={field.path}
                                        className="sm:col-span-2"
                                    >
                                        <Field label={field.label}>
                                            <ImageField
                                                label={field.label}
                                                value={field.value}
                                                file={
                                                    data.media[field.path] ??
                                                    null
                                                }
                                                onChange={(file) =>
                                                    setData('media', {
                                                        ...data.media,
                                                        [field.path]: file,
                                                    })
                                                }
                                            />
                                        </Field>
                                    </div>
                                ) : (
                                    <Field key={field.path} label={field.label}>
                                        {field.multiline ? (
                                            <Textarea
                                                value={field.value}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        updateNestedValue(
                                                            data.content,
                                                            field.path,
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        ) : (
                                            <Input
                                                value={field.value}
                                                onChange={(e) =>
                                                    setData(
                                                        'content',
                                                        updateNestedValue(
                                                            data.content,
                                                            field.path,
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>
                                ),
                            )}
                        </Row>
                    </Section>
                );
            })}

            <div className="flex justify-end pb-8 pt-4">
                <Button type="submit" disabled={processing} size="lg">
                    {processing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
            </div>
        </form>
    );
}

function ServiceItemsEditor({
    content,
    locale,
    setContent,
}: {
    content: Record<string, any>;
    locale: 'id' | 'en';
    setContent: (content: Record<string, any>) => void;
}) {
    const items = Array.isArray(content?.services?.items)
        ? content.services.items
        : [];

    const addItem = () => {
        const next = structuredClone(content ?? {});
        next.services = {
            ...(next.services ?? {}),
            items: [
                ...items,
                { title: { id: '', en: '' }, description: { id: '', en: '' } },
            ],
        };
        setContent(next);
    };

    const removeItem = (index: number) => {
        const next = structuredClone(content ?? {});
        next.services.items = items.filter(
            (_: unknown, i: number) => i !== index,
        );
        setContent(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Item Layanan Custom</p>
                    <p className="text-xs text-muted-foreground">
                        Kosongkan semua untuk memakai data dari Content
                        Management.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Item
                </Button>
            </div>
            <div className="space-y-3">
                {items.map((_: unknown, index: number) => (
                    <div
                        key={`svc_${index}`}
                        className="rounded-xl border border-border bg-muted/10 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Layanan {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="h-7 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Hapus
                            </Button>
                        </div>
                        <Row>
                            <Field label="Judul">
                                <Input
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `services.items.${index}.title.${locale}`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `services.items.${index}.title.${locale}`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Deskripsi">
                                <Textarea
                                    rows={2}
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `services.items.${index}.description.${locale}`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `services.items.${index}.description.${locale}`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </Row>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                        Pakai data default, atau tambah item custom di sini.
                    </p>
                )}
            </div>
        </div>
    );
}

function ValuesSectionEditor({
    content,
    locale,
    setContent,
}: {
    content: Record<string, any>;
    locale: 'id' | 'en';
    setContent: (content: Record<string, any>) => void;
}) {
    const values = Array.isArray(content?.values) ? content.values : [];

    const addValue = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.values = [
            ...values,
            { title: { id: '', en: '' }, description: { id: '', en: '' } },
        ];
        setContent(nextContent);
    };

    const removeValue = (index: number) => {
        const nextContent = structuredClone(content ?? {});
        nextContent.values = values.filter(
            (_: unknown, i: number) => i !== index,
        );
        setContent(nextContent);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Daftar Nilai</p>
                    <p className="text-xs text-muted-foreground">
                        Kosongkan semua untuk memakai nilai default.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addValue}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Nilai
                </Button>
            </div>
            <div className="space-y-3">
                {values.map((_: unknown, index: number) => (
                    <div
                        key={`value_${index}`}
                        className="rounded-xl border border-border bg-muted/10 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Nilai {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeValue(index)}
                                className="h-7 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Hapus
                            </Button>
                        </div>
                        <Row>
                            <Field label="Judul">
                                <Input
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `values.${index}.title.${locale}`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `values.${index}.title.${locale}`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Deskripsi">
                                <Textarea
                                    rows={2}
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `values.${index}.description.${locale}`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `values.${index}.description.${locale}`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </Row>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatsSectionEditor({
    content,
    locale,
    setContent,
}: {
    content: Record<string, any>;
    locale: 'id' | 'en';
    setContent: (content: Record<string, any>) => void;
}) {
    const stats = Array.isArray(content?.stats) ? content.stats : [];

    const addStat = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.stats = [
            ...stats,
            {
                value: '',
                label: { id: '', en: '' },
            },
        ];
        setContent(nextContent);
    };

    const removeStat = (index: number) => {
        const nextContent = structuredClone(content ?? {});
        nextContent.stats = stats.filter(
            (_: unknown, itemIndex: number) => itemIndex !== index,
        );
        setContent(nextContent);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold">Daftar Statistik</p>
                    <p className="text-xs text-muted-foreground">
                        Ubah angka dan label statistik.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStat}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Data
                </Button>
            </div>

            <div className="space-y-2">
                {stats.map((_: unknown, index: number) => (
                    <div
                        key={`stat_${index}`}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-3"
                    >
                        <div className="grid flex-1 gap-4 sm:grid-cols-2">
                            <Field label={`Angka ${index + 1}`}>
                                <Input
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `stats.${index}.value`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `stats.${index}.value`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field label={`Label ${index + 1}`}>
                                <Input
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `stats.${index}.label.${locale}`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `stats.${index}.label.${locale}`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStat(index)}
                            className="h-8 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getOrderedContentSections(
    pageSlug: string,
    content: Record<string, any>,
): Array<[string, unknown]> {
    const allowedSections = landingSectionMap[pageSlug];

    if (!allowedSections) {
        return Object.entries(content ?? {});
    }

    return allowedSections.map((key) => [key, content?.[key] ?? {}]);
}

function ImageField({
    label,
    value,
    file,
    onChange,
}: {
    label: string;
    value: string;
    file: File | null;
    onChange: (file: File | null) => void;
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className="space-y-3">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30 shadow-inner">
                    <img
                        src={previewUrl ?? value ?? '/images/dummy.jpg'}
                        alt={label}
                        className="h-28 w-full object-cover"
                    />
                </div>
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            onChange(event.target.files?.[0] ?? null)
                        }
                    />
                    <div className="rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-[0.65rem] text-muted-foreground">
                        {file ? (
                            <>
                                File:{' '}
                                <span className="font-mono text-primary">
                                    {file.name}
                                </span>
                            </>
                        ) : (
                            <>
                                Path:{' '}
                                <span className="font-mono">{value || '-'}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function GallerySectionEditor({
    content,
    locale,
    media,
    setContent,
    setMedia,
}: {
    content: Record<string, any>;
    locale: 'id' | 'en';
    media: Record<string, File | null>;
    setContent: (content: Record<string, any>) => void;
    setMedia: (media: Record<string, File | null>) => void;
}) {
    const baseFields = collectEditableFields(
        {
            title: content?.gallery?.title ?? {},
            description: content?.gallery?.description ?? {},
        },
        'gallery',
        locale,
    );
    const galleryImages = Array.isArray(content?.gallery?.images)
        ? content.gallery.images
        : [];

    const addGalleryImage = () => {
        setContent(
            updateNestedValue(content, 'gallery.images', [
                ...galleryImages,
                {
                    src: '',
                    alt: { id: '', en: '' },
                },
            ]),
        );
    };

    const removeGalleryImage = (index: number) => {
        const nextImages = galleryImages.filter(
            (_: unknown, itemIndex: number) => itemIndex !== index,
        );
        const nextContent = structuredClone(content ?? {});
        if (!nextContent.gallery) {
            nextContent.gallery = {};
        }
        nextContent.gallery.images = nextImages;
        setContent(nextContent);
    };

    return (
        <div className="space-y-6">
            <Row>
                {baseFields.map((field) => (
                    <Field key={field.path} label={field.label}>
                        {field.multiline ? (
                            <Textarea
                                value={field.value}
                                onChange={(e) =>
                                    setContent(
                                        updateNestedValue(
                                            content,
                                            field.path,
                                            e.target.value,
                                        ),
                                    )
                                }
                            />
                        ) : (
                            <Input
                                value={field.value}
                                onChange={(e) =>
                                    setContent(
                                        updateNestedValue(
                                            content,
                                            field.path,
                                            e.target.value,
                                        ),
                                    )
                                }
                            />
                        )}
                    </Field>
                ))}
            </Row>

            <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                    <p className="text-sm font-semibold">Foto Galeri</p>
                    <p className="text-xs text-muted-foreground">
                        Tambahkan foto manual untuk beranda.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGalleryImage}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Foto
                </Button>
            </div>

            <div className="space-y-4">
                {galleryImages.map((_: unknown, index: number) => {
                    const imagePath = `gallery.images.${index}.src`;
                    const altPath = `gallery.images.${index}.alt.${locale}`;

                    return (
                        <div
                            key={imagePath}
                            className="rounded-xl border border-border bg-muted/10 p-4"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Foto {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGalleryImage(index)}
                                    className="h-7 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Hapus
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <ImageField
                                    label={`Foto Galeri ${index + 1}`}
                                    value={String(
                                        getNestedValue(content, imagePath) ??
                                            '',
                                    )}
                                    file={media[imagePath] ?? null}
                                    onChange={(file) =>
                                        setMedia({
                                            ...media,
                                            [imagePath]: file,
                                        })
                                    }
                                />
                                <Field label={`Alt Text (Penjelasan Foto)`}>
                                    <Input
                                        value={String(
                                            getNestedValue(content, altPath) ??
                                                '',
                                        )}
                                        onChange={(e) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    altPath,
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function collectEditableFields(
    value: unknown,
    path: string,
    locale: 'id' | 'en',
): EditableField[] {
    if (value === null || value === undefined) {
        return [];
    }

    if (isLocalizedRecord(value)) {
        const localizedValue = String(value[locale] ?? '');

        return [
            {
                path: `${path}.${locale}`,
                label: humanizePath(path),
                multiline: shouldUseTextarea(path, localizedValue),
                value: localizedValue,
            },
        ];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item, index) =>
            collectEditableFields(item, `${path}.${index}`, locale),
        );
    }

    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).flatMap(
            ([key, nestedValue]) =>
                collectEditableFields(nestedValue, `${path}.${key}`, locale),
        );
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const stringified = String(value);

        return [
            {
                path,
                label: humanizePath(path),
                multiline: shouldUseTextarea(path, stringified),
                value: stringified,
            },
        ];
    }

    return [];
}

function buildExtraSectionFields(
    pageSlug: string,
    sectionKey: string,
    content: Record<string, any>,
    locale: 'id' | 'en',
): EditableField[] {
    if (pageSlug === 'tentang-kami' && sectionKey === 'profile') {
        return [
            {
                path: 'profile.image_primary',
                label: 'Foto Utama',
                multiline: false,
                value: String(
                    getNestedValue(content, 'profile.image_primary') ?? '',
                ),
            },
            {
                path: 'profile.image_secondary',
                label: 'Foto Kedua',
                multiline: false,
                value: String(
                    getNestedValue(content, 'profile.image_secondary') ?? '',
                ),
            },
        ];
    }

    if (pageSlug !== 'home' || sectionKey !== 'gallery') {
        return [];
    }

    const extraFields: ExtraSectionField[] = [
        { path: 'gallery.images.0.src', label: 'Foto Galeri 1' },
        { path: 'gallery.images.0.alt.id', label: 'Alt Foto 1 ID' },
        { path: 'gallery.images.0.alt.en', label: 'Alt Foto 1 EN' },
        { path: 'gallery.images.1.src', label: 'Foto Galeri 2' },
        { path: 'gallery.images.1.alt.id', label: 'Alt Foto 2 ID' },
        { path: 'gallery.images.1.alt.en', label: 'Alt Foto 2 EN' },
        { path: 'gallery.images.2.src', label: 'Foto Galeri 3' },
        { path: 'gallery.images.2.alt.id', label: 'Alt Foto 3 ID' },
        { path: 'gallery.images.2.alt.en', label: 'Alt Foto 3 EN' },
        { path: 'gallery.images.3.src', label: 'Foto Galeri 4' },
        { path: 'gallery.images.3.alt.id', label: 'Alt Foto 4 ID' },
        { path: 'gallery.images.3.alt.en', label: 'Alt Foto 4 EN' },
    ];

    return extraFields
        .filter((field) =>
            locale === 'id'
                ? !field.path.endsWith('.en')
                : !field.path.endsWith('.id'),
        )
        .map((field) => ({
            path: field.path,
            label: field.label,
            multiline: Boolean(field.multiline),
            value: String(getNestedValue(content, field.path) ?? ''),
        }));
}

function isLocalizedRecord(
    value: unknown,
): value is Record<'id' | 'en', unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const record = value as Record<string, unknown>;

    return (
        'id' in record &&
        'en' in record &&
        Object.keys(record).every((key) => key === 'id' || key === 'en')
    );
}

function getNestedValue(source: Record<string, any>, path: string): unknown {
    return path.split('.').reduce<unknown>((carry, segment) => {
        if (carry === null || carry === undefined) {
            return undefined;
        }

        if (Array.isArray(carry)) {
            return carry[Number(segment)];
        }

        if (typeof carry === 'object') {
            return (carry as Record<string, unknown>)[segment];
        }

        return undefined;
    }, source);
}

function shouldUseTextarea(path: string, value: string): boolean {
    return (
        path.includes('description') ||
        path.includes('excerpt') ||
        path.includes('subtitle') ||
        path.includes('note') ||
        path.includes('placeholder') ||
        path.includes('policy') ||
        value.length > 80
    );
}

function isImageField(path: string): boolean {
    return (
        path.endsWith('.image') ||
        path.endsWith('.image_primary') ||
        path.endsWith('.image_secondary') ||
        path.endsWith('.src')
    );
}

function humanizePath(path: string): string {
    const segments = path.split('.');

    return segments
        .map((segment) => {
            if (!Number.isNaN(Number(segment))) {
                return `${Number(segment) + 1}`;
            }

            return humanizeSegment(segment);
        })
        .join(' ');
}

function humanizeSegment(segment: string): string {
    return segment
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function updateNestedValue(
    source: Record<string, any>,
    path: string,
    value: unknown,
): Record<string, any> {
    if (path === 'gallery.images' && Array.isArray(value)) {
        return {
            ...structuredClone(source ?? {}),
            gallery: {
                ...(structuredClone(source?.gallery ?? {}) as Record<
                    string,
                    any
                >),
                images: value,
            },
        };
    }

    const result = structuredClone(source ?? {});
    const segments = path.split('.');
    let current: any = result;

    segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        const nextSegment = segments[index + 1];
        const nextIsNumber =
            nextSegment !== undefined && !Number.isNaN(Number(nextSegment));
        const numericIndex = Number(segment);

        if (Array.isArray(current)) {
            if (isLast) {
                current[numericIndex] = value;
                return;
            }

            if (current[numericIndex] === undefined) {
                current[numericIndex] = nextIsNumber ? [] : {};
            }

            current = current[numericIndex];
            return;
        }

        if (isLast) {
            current[segment] = value;
            return;
        }

        if (current[segment] === undefined) {
            current[segment] = nextIsNumber ? [] : {};
        }

        current = current[segment];
    });

    return result;
}
