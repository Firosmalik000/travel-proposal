import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AdminLocaleSwitch } from '@/components/admin-locale-switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminLocale } from '@/contexts/admin-locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Layers3, Languages, PencilLine, Plus, Trash2 } from 'lucide-react';
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

interface DefaultFaqItem {
    question?: LocalizedValue;
    answer?: LocalizedValue;
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
    'paket-umroh': 'Paket Umroh',
    kontak: 'Kontak',
    legalitas: 'Legalitas',
    galeri: 'Galeri',
    mitra: 'Mitra',
    karier: 'Karier',
    'custom-umroh': 'Custom Umroh',
    'paket-detail': 'Detail Paket',
};

const sectionLabels: Record<string, string> = {
    hero: 'Hero',
    about: 'Tentang',
    packages: 'Paket',
    services: 'Layanan',
    gallery: 'Galeri',
    contact: 'Kontak',
    stats: 'Statistik',
    faq: 'FAQ',
    profile: 'Profil',
    values: 'Nilai',
    team: 'Tim',
    cards: 'Kartu',
    note: 'Catatan',
    badge: 'Badge',
    heading: 'Heading',
    map: 'Peta',
    docs_title: 'Judul Dokumen',
    bank_title: 'Judul Bank',
    bank_lines: 'Baris Bank',
    disclaimer_title: 'Judul Disclaimer',
    disclaimer: 'Disclaimer',
    subtitle: 'Subtitle',
    description: 'Deskripsi',
    cta: 'CTA',
    ctas: 'CTA',
    summary_title: 'Ringkasan',
    included_title: 'Termasuk',
    excluded_title: 'Tidak Termasuk',
    itinerary_title: 'Itinerary',
    facilities_title: 'Fasilitas',
    requirements_title: 'Persyaratan',
    payment_title: 'Pembayaran',
    policy_title: 'Kebijakan',
    cta_block: 'Blok CTA',
    interest: 'Minat',
};

export default function LandingIndex({ pages, defaultFaqs = [] }: { pages: LandingPageItem[]; defaultFaqs?: DefaultFaqItem[] }) {
    const defaultTab = pages[0]?.slug ?? 'home';

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Landing Page', href: '/dashboard/website-management/landing' }]}>
            <Head title="Landing Page" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                            <PencilLine className="h-3.5 w-3.5" />
                            Landing Editor
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">Kelola copy landing dengan lebih sederhana</h1>
                            <p className="text-sm text-muted-foreground">
                                Pilih halaman, lalu pilih mode bahasa input. Saat `ID` aktif, kamu hanya mengedit konten Indonesia. Saat `EN` aktif, kamu hanya
                                mengedit konten Inggris.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Mode Input Bahasa</p>
                            <AdminLocaleSwitch />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-muted/60 p-2">
                        {pages.map((page) => (
                            <TabsTrigger key={page.slug} value={page.slug} className="rounded-xl px-4 py-2 text-sm">
                                {pageLabels[page.slug] ?? humanizeSegment(page.slug)}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {pages.map((page) => (
                        <TabsContent key={page.slug} value={page.slug} className="space-y-6">
                            <LandingPageEditor page={page} defaultFaqs={defaultFaqs} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function LandingPageEditor({ page, defaultFaqs }: { page: LandingPageItem; defaultFaqs: DefaultFaqItem[] }) {
    const { locale } = useAdminLocale();
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

    const localeLabel = locale === 'id' ? 'Indonesia' : 'English';
    const contentSections = getOrderedContentSections(page.slug, data.content ?? {});

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/dashboard/website-management/content/${page.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success(`Konten ${pageLabels[page.slug] ?? page.slug} berhasil diperbarui`),
        });
    };

    return (
        <form className="space-y-6" onSubmit={submit}>
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Layers3 className="h-4 w-4 text-primary" />
                            Ringkasan Halaman
                        </CardTitle>
                        <CardDescription>Fokus edit hanya untuk halaman yang sedang dipilih.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SummaryItem label="Halaman" value={pageLabels[page.slug] ?? page.slug} />
                        <SummaryItem label="Slug" value={page.slug} mono />
                        <SummaryItem label="Mode Bahasa" value={localeLabel} />
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                            <Checkbox checked={Boolean(data.is_active)} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                            <div>
                                <p className="text-sm font-medium text-foreground">Halaman aktif</p>
                                <p className="text-xs text-muted-foreground">Nonaktifkan jika halaman tidak ingin dipakai di public.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Utama</CardTitle>
                            <CardDescription>Bagian ini hanya menampilkan input untuk bahasa {localeLabel}.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Field
                                label={locale === 'id' ? 'Judul Halaman' : 'Page Title'}
                                value={locale === 'id' ? data.title_id : data.title_en}
                                onChange={(value) => setData(locale === 'id' ? 'title_id' : 'title_en', value)}
                            />
                            <Field
                                label={locale === 'id' ? 'Ringkasan Halaman' : 'Page Excerpt'}
                                value={locale === 'id' ? data.excerpt_id : data.excerpt_en}
                                onChange={(value) => setData(locale === 'id' ? 'excerpt_id' : 'excerpt_en', value)}
                                multiline
                            />
                        </CardContent>
                    </Card>

                    {contentSections.map(([sectionKey, sectionValue]) => {
                        if (page.slug === 'home' && sectionKey === 'gallery') {
                            return (
                                <Card key={sectionKey}>
                                    <CardHeader>
                                        <CardTitle>{sectionLabels[sectionKey] ?? humanizeSegment(sectionKey)}</CardTitle>
                                        <CardDescription>Atur judul, deskripsi, dan foto galeri landing untuk bahasa {localeLabel}.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <GallerySectionEditor
                                            content={data.content}
                                            locale={locale}
                                            media={data.media}
                                            setContent={(content) => setData('content', content)}
                                            setMedia={(media) => setData('media', media)}
                                        />
                                    </CardContent>
                                </Card>
                            );
                        }

                        if (page.slug === 'home' && sectionKey === 'stats') {
                            return (
                                <Card key={sectionKey}>
                                    <CardHeader>
                                        <CardTitle>{sectionLabels[sectionKey] ?? humanizeSegment(sectionKey)}</CardTitle>
                                        <CardDescription>Tambah, ubah, atau hapus statistik yang tampil di homepage.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <StatsSectionEditor content={data.content} locale={locale} setContent={(content) => setData('content', content)} />
                                    </CardContent>
                                </Card>
                            );
                        }

                        if (page.slug === 'home' && sectionKey === 'faq') {
                            return (
                                <Card key={sectionKey}>
                                    <CardHeader>
                                        <CardTitle>FAQ Homepage</CardTitle>
                                        <CardDescription>Kalau FAQ custom diisi di sini, homepage pakai data ini. Kalau kosong, homepage akan fallback ke FAQ default.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <FaqSectionEditor
                                            content={data.content}
                                            locale={locale}
                                            defaultFaqs={defaultFaqs}
                                            setContent={(content) => setData('content', content)}
                                        />
                                    </CardContent>
                                </Card>
                            );
                        }

                        const fields = collectEditableFields(sectionValue, sectionKey, locale);

                        if (fields.length === 0) {
                            return null;
                        }

                        return (
                            <Card key={sectionKey}>
                                <CardHeader>
                                    <CardTitle>{sectionLabels[sectionKey] ?? humanizeSegment(sectionKey)}</CardTitle>
                                    <CardDescription>
                                        Edit konten section {sectionLabels[sectionKey] ?? humanizeSegment(sectionKey)} untuk bahasa {localeLabel}.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    {[...fields, ...buildExtraSectionFields(page.slug, sectionKey, data.content, locale)].map((field) =>
                                        isImageField(field.path) ? (
                                            <ImageField
                                                key={field.path}
                                                label={field.label}
                                                value={field.value}
                                                file={data.media[field.path] ?? null}
                                                onChange={(file) => setData('media', { ...data.media, [field.path]: file })}
                                            />
                                        ) : (
                                            <Field
                                                key={field.path}
                                                label={field.label}
                                                value={field.value}
                                                onChange={(value) => setData('content', updateNestedValue(data.content, field.path, value))}
                                                multiline={field.multiline}
                                            />
                                        ),
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="min-w-40">
                            Simpan Landing Page
                        </Button>
                    </div>
                </div>
            </div>
        </form>
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
        nextContent.stats = stats.filter((_: unknown, itemIndex: number) => itemIndex !== index);
        setContent(nextContent);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-foreground">Daftar Statistik</p>
                    <p className="text-xs text-muted-foreground">Mode bahasa aktif hanya mengubah label statistik untuk bahasa yang dipilih.</p>
                </div>
                <Button type="button" variant="outline" onClick={addStat}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Statistik
                </Button>
            </div>

            <div className="space-y-4">
                {stats.map((_: unknown, index: number) => (
                    <div key={`stat_${index}`} className="grid gap-4 rounded-2xl border border-border p-4 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                        <Field
                            label={`Value ${index + 1}`}
                            value={String(getNestedValue(content, `stats.${index}.value`) ?? '')}
                            onChange={(value) => setContent(updateNestedValue(content, `stats.${index}.value`, value))}
                        />
                        <Field
                            label={`Label ${index + 1}`}
                            value={String(getNestedValue(content, `stats.${index}.label.${locale}`) ?? '')}
                            onChange={(value) => setContent(updateNestedValue(content, `stats.${index}.label.${locale}`, value))}
                        />
                        <div className="flex items-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeStat(index)} className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FaqSectionEditor({
    content,
    locale,
    defaultFaqs,
    setContent,
}: {
    content: Record<string, any>;
    locale: 'id' | 'en';
    defaultFaqs: DefaultFaqItem[];
    setContent: (content: Record<string, any>) => void;
}) {
    const faqItems = Array.isArray(content?.faq?.items) ? content.faq.items : [];

    const addFaq = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.faq = {
            ...(nextContent.faq ?? {}),
            title: nextContent.faq?.title ?? { id: '', en: '' },
            description: nextContent.faq?.description ?? { id: '', en: '' },
            items: [
                ...faqItems,
                {
                    question: { id: '', en: '' },
                    answer: { id: '', en: '' },
                },
            ],
        };
        setContent(nextContent);
    };

    const removeFaq = (index: number) => {
        const nextContent = structuredClone(content ?? {});
        nextContent.faq = {
            ...(nextContent.faq ?? {}),
            items: faqItems.filter((_: unknown, itemIndex: number) => itemIndex !== index),
        };
        setContent(nextContent);
    };

    const applyDefaultFaqs = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.faq = {
            ...(nextContent.faq ?? {}),
            title: nextContent.faq?.title ?? {
                id: 'Pertanyaan yang sering ditanyakan',
                en: 'Frequently asked questions',
            },
            description: nextContent.faq?.description ?? {
                id: 'Jawaban ringkas untuk pertanyaan paling sering dari calon jamaah.',
                en: 'Quick answers to the most common questions from prospective pilgrims.',
            },
            items: defaultFaqs.map((item) => ({
                question: {
                    id: item.question?.id ?? '',
                    en: item.question?.en ?? '',
                },
                answer: {
                    id: item.answer?.id ?? '',
                    en: item.answer?.en ?? '',
                },
            })),
        };
        setContent(nextContent);
    };

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <Field
                    label="Judul FAQ"
                    value={String(getNestedValue(content, `faq.title.${locale}`) ?? '')}
                    onChange={(value) => setContent(updateNestedValue(content, `faq.title.${locale}`, value))}
                />
                <Field
                    label="Deskripsi FAQ"
                    value={String(getNestedValue(content, `faq.description.${locale}`) ?? '')}
                    onChange={(value) => setContent(updateNestedValue(content, `faq.description.${locale}`, value))}
                    multiline
                />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-foreground">Item FAQ Custom</p>
                    <p className="text-xs text-muted-foreground">Kosongkan semua item kalau ingin homepage memakai FAQ default dari data utama.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {defaultFaqs.length > 0 ? (
                        <Button type="button" variant="secondary" onClick={applyDefaultFaqs}>
                            Pakai FAQ Default
                        </Button>
                    ) : null}
                    <Button type="button" variant="outline" onClick={addFaq}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah FAQ
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {faqItems.map((_: unknown, index: number) => (
                    <div key={`faq_${index}`} className="space-y-4 rounded-2xl border border-border p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">FAQ {index + 1}</p>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(index)} className="text-destructive hover:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            <Field
                                label="Pertanyaan"
                                value={String(getNestedValue(content, `faq.items.${index}.question.${locale}`) ?? '')}
                                onChange={(value) => setContent(updateNestedValue(content, `faq.items.${index}.question.${locale}`, value))}
                            />
                            <Field
                                label="Jawaban"
                                value={String(getNestedValue(content, `faq.items.${index}.answer.${locale}`) ?? '')}
                                onChange={(value) => setContent(updateNestedValue(content, `faq.items.${index}.answer.${locale}`, value))}
                                multiline
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getOrderedContentSections(pageSlug: string, content: Record<string, any>): Array<[string, unknown]> {
    if (pageSlug !== 'home') {
        return Object.entries(content ?? {});
    }

    const preferredOrder = ['hero', 'stats', 'about', 'packages', 'services', 'gallery', 'faq', 'contact'];
    const orderedKeys = [...preferredOrder, ...Object.keys(content ?? {}).filter((key) => !preferredOrder.includes(key))];

    return orderedKeys.map((key) => [key, content?.[key] ?? {}]);
}

function SummaryItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="space-y-1 rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
            <p className={mono ? 'font-mono text-sm text-foreground' : 'text-sm font-medium text-foreground'}>{value}</p>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {multiline ? <Textarea className="min-h-28" value={value} onChange={(event) => onChange(event.target.value)} /> : <Input value={value} onChange={(event) => onChange(event.target.value)} />}
        </div>
    );
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
        <div className="space-y-3 md:col-span-2">
            <Label>{label}</Label>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
                    <img src={previewUrl ?? value ?? '/images/dummy.jpg'} alt={label} className="h-40 w-full object-cover" />
                </div>
                <div className="space-y-2">
                    <Input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
                    <p className="text-xs text-muted-foreground">Upload gambar baru untuk field ini. Preview akan langsung berubah setelah file dipilih.</p>
                    <div className="rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                        {file ? (
                            <>
                                File terpilih: <span className="font-mono">{file.name}</span>
                            </>
                        ) : (
                            <>
                                Path saat ini: <span className="font-mono">{value || '-'}</span>
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
    const galleryImages = Array.isArray(content?.gallery?.images) ? content.gallery.images : [];

    const addGalleryImage = () => {
        setContent(
            updateNestedValue(
                content,
                'gallery.images',
                [
                    ...galleryImages,
                    {
                        src: '',
                        alt: { id: '', en: '' },
                    },
                ],
            ),
        );
    };

    const removeGalleryImage = (index: number) => {
        const nextImages = galleryImages.filter((_: unknown, itemIndex: number) => itemIndex !== index);
        const nextContent = structuredClone(content ?? {});
        if (!nextContent.gallery) {
            nextContent.gallery = {};
        }
        nextContent.gallery.images = nextImages;
        setContent(nextContent);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                {baseFields.map((field) => (
                    <Field
                        key={field.path}
                        label={field.label}
                        value={field.value}
                        onChange={(value) => setContent(updateNestedValue(content, field.path, value))}
                        multiline={field.multiline}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Foto Galeri Landing</h3>
                    <p className="text-xs text-muted-foreground">Tambahkan foto manual untuk section galeri di homepage.</p>
                </div>
                <Button type="button" variant="outline" onClick={addGalleryImage}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Foto
                </Button>
            </div>

            <div className="space-y-4">
                {galleryImages.map((_: unknown, index: number) => {
                    const imagePath = `gallery.images.${index}.src`;
                    const altPath = `gallery.images.${index}.alt.${locale}`;

                    return (
                        <div key={imagePath} className="rounded-2xl border border-border p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Foto {index + 1}</p>
                                    <p className="text-xs text-muted-foreground">Upload gambar dan isi alt text untuk bahasa {locale === 'id' ? 'Indonesia' : 'English'}.</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGalleryImage(index)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                <ImageField
                                    label={`Foto Galeri ${index + 1}`}
                                    value={String(getNestedValue(content, imagePath) ?? '')}
                                    file={media[imagePath] ?? null}
                                    onChange={(file) => setMedia({ ...media, [imagePath]: file })}
                                />
                                <Field
                                    label={`Alt Foto ${index + 1}`}
                                    value={String(getNestedValue(content, altPath) ?? '')}
                                    onChange={(value) => setContent(updateNestedValue(content, altPath, value))}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function collectEditableFields(value: unknown, path: string, locale: 'id' | 'en'): EditableField[] {
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
        return value.flatMap((item, index) => collectEditableFields(item, `${path}.${index}`, locale));
    }

    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).flatMap(([key, nestedValue]) => collectEditableFields(nestedValue, `${path}.${key}`, locale));
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

function buildExtraSectionFields(pageSlug: string, sectionKey: string, content: Record<string, any>, locale: 'id' | 'en'): EditableField[] {
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
        .filter((field) => (locale === 'id' ? !field.path.endsWith('.en') : !field.path.endsWith('.id')))
        .map((field) => ({
            path: field.path,
            label: field.label,
            multiline: Boolean(field.multiline),
            value: String(getNestedValue(content, field.path) ?? ''),
        }));
}

function isLocalizedRecord(value: unknown): value is Record<'id' | 'en', unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const record = value as Record<string, unknown>;

    return 'id' in record && 'en' in record && Object.keys(record).every((key) => key === 'id' || key === 'en');
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
    return path.includes('description') || path.includes('excerpt') || path.includes('subtitle') || path.includes('note') || path.includes('placeholder') || path.includes('policy') || value.length > 80;
}

function isImageField(path: string): boolean {
    return path.endsWith('.image') || path.endsWith('.image_primary') || path.endsWith('.image_secondary') || path.endsWith('.src');
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

function updateNestedValue(source: Record<string, any>, path: string, value: unknown): Record<string, any> {
    if (path === 'gallery.images' && Array.isArray(value)) {
        return {
            ...structuredClone(source ?? {}),
            gallery: {
                ...(structuredClone(source?.gallery ?? {}) as Record<string, any>),
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
        const nextIsNumber = nextSegment !== undefined && !Number.isNaN(Number(nextSegment));
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
