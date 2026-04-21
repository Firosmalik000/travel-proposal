import { AdminLocaleSwitch } from '@/components/admin-locale-switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { useAdminLocale } from '@/contexts/admin-locale';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type Option = {
    value: string;
    label: string;
};

type ArticleFormPayload = {
    id?: number;
    title_id: string;
    title_en: string;
    slug: string;
    excerpt_id: string;
    excerpt_en: string;
    body_id: string;
    body_en: string;
    image_path?: string | null;
    content_type: string;
    status: string;
    author_name: string;
    tags: string;
    meta_title_id: string;
    meta_title_en: string;
    meta_description_id: string;
    meta_description_en: string;
    og_image_path?: string | null;
    published_at: string;
    is_featured: boolean;
};

type ArticleFormData = {
    title_id: string;
    title_en: string;
    slug: string;
    excerpt_id: string;
    excerpt_en: string;
    body_id: string;
    body_en: string;
    author_name: string;
    content_type: string;
    status: string;
    tags: string;
    meta_title_id: string;
    meta_title_en: string;
    meta_description_id: string;
    meta_description_en: string;
    published_at: string;
    is_featured: boolean;
    cover_image: File | null;
    og_image: File | null;
};

type LocalizedInputKey =
    | 'title_id'
    | 'title_en'
    | 'excerpt_id'
    | 'excerpt_en'
    | 'body_id'
    | 'body_en'
    | 'meta_title_id'
    | 'meta_title_en'
    | 'meta_description_id'
    | 'meta_description_en';

const bodyTemplates = {
    intro: {
        id: 'Paragraf pembuka yang menjelaskan konteks utama artikel dan manfaatnya untuk pembaca.',
        en: 'Opening paragraph that explains the main context of the article and why it matters to readers.',
    },
    checklist: {
        id: '- Poin penting pertama\n- Poin penting kedua\n- Poin penting ketiga',
        en: '- First key point\n- Second key point\n- Third key point',
    },
    cta: {
        id: 'Butuh bantuan lebih lanjut? Hubungi tim kami untuk konsultasi dan pendampingan pendaftaran.',
        en: 'Need more help? Contact our team for guidance and registration assistance.',
    },
};

const contentTypeLabels: Record<string, string> = {
    travel_update: 'Travel Update',
    company_news: 'Company News',
    umrah_education: 'Umrah Education',
    general_news: 'General News',
};

const statusDescriptions: Record<string, string> = {
    draft: 'Draft aman untuk menulis. Artikel belum tampil di public.',
    scheduled: 'Artikel akan tayang otomatis mengikuti tanggal publish.',
    published: 'Artikel langsung tampil jika tanggal publish sudah lewat.',
    archived: 'Artikel disimpan dan disembunyikan dari public.',
};

function estimateReadingTime(value: string): number {
    const words = value.trim().split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 180));
}

function paragraphBlocks(value: string): string[] {
    return value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function containsHtml(value: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(value);
}

function resolveFieldStatus(
    activeValue: string,
    alternateValue: string,
): {
    label: string;
    tone: string;
    helper: string;
} {
    if (activeValue.trim() !== '') {
        return {
            label: 'Terisi',
            tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            helper: 'Field bahasa aktif sudah diisi langsung.',
        };
    }

    if (alternateValue.trim() !== '') {
        return {
            label: 'Fallback',
            tone: 'border-amber-200 bg-amber-50 text-amber-700',
            helper: 'Jika dibiarkan kosong, sistem akan otomatis memakai isi dari bahasa pasangan.',
        };
    }

    return {
        label: 'Kosong',
        tone: 'border-slate-200 bg-slate-50 text-slate-600',
        helper: 'Belum ada isi di bahasa aktif maupun bahasa pasangan.',
    };
}

export default function ArticleForm({
    article,
    contentTypeOptions,
    statusOptions,
    mode,
}: {
    article: ArticleFormPayload;
    contentTypeOptions: Option[];
    statusOptions: Option[];
    mode: 'create' | 'edit';
}) {
    const { locale } = useAdminLocale();
    const [slugTouched, setSlugTouched] = useState(article.slug !== '');
    const form = useForm<ArticleFormData>({
        title_id: article.title_id,
        title_en: article.title_en,
        slug: article.slug,
        excerpt_id: article.excerpt_id,
        excerpt_en: article.excerpt_en,
        body_id: article.body_id,
        body_en: article.body_en,
        author_name: article.author_name,
        content_type: article.content_type,
        status: article.status,
        tags: article.tags,
        meta_title_id: article.meta_title_id,
        meta_title_en: article.meta_title_en,
        meta_description_id: article.meta_description_id,
        meta_description_en: article.meta_description_en,
        published_at: article.published_at,
        is_featured: article.is_featured,
        cover_image: null as File | null,
        og_image: null as File | null,
    });

    useEffect(() => {
        if (slugTouched) {
            return;
        }

        const source = form.data.title_id || form.data.title_en;
        const generatedSlug = source
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        form.setData('slug', generatedSlug);
    }, [form, form.data.title_en, form.data.title_id, slugTouched]);

    const localizedFields = useMemo<{
        title: LocalizedInputKey;
        excerpt: LocalizedInputKey;
        body: LocalizedInputKey;
        metaTitle: LocalizedInputKey;
        metaDescription: LocalizedInputKey;
    }>(
        () => ({
            title: locale === 'id' ? 'title_id' : 'title_en',
            excerpt: locale === 'id' ? 'excerpt_id' : 'excerpt_en',
            body: locale === 'id' ? 'body_id' : 'body_en',
            metaTitle: locale === 'id' ? 'meta_title_id' : 'meta_title_en',
            metaDescription:
                locale === 'id' ? 'meta_description_id' : 'meta_description_en',
        }),
        [locale],
    );

    const copy = useMemo(
        () => ({
            localeName: locale === 'id' ? 'Indonesia' : 'English',
            titleLabel: locale === 'id' ? 'Judul Indonesia' : 'Judul English',
            excerptLabel:
                locale === 'id' ? 'Excerpt Indonesia' : 'Excerpt English',
            bodyLabel: locale === 'id' ? 'Body Indonesia' : 'Body English',
            metaTitleLabel:
                locale === 'id' ? 'Meta Title Indonesia' : 'Meta Title English',
            metaDescriptionLabel:
                locale === 'id'
                    ? 'Meta Description Indonesia'
                    : 'Meta Description English',
        }),
        [locale],
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && article.id) {
            form.patch(`/admin/website-management/articles/${article.id}`, {
                forceFormData: true,
            });

            return;
        }

        form.post('/admin/website-management/articles', {
            forceFormData: true,
        });
    };

    const insertTemplate = (template: string) => {
        const field = localizedFields.body;
        const nextValue =
            form.data[field].trim() === ''
                ? template
                : `${form.data[field].replace(/\s+$/, '')}\n\n${template}`;

        form.setData(field, nextValue);
    };

    const syncExcerptToEnglish = () => {
        if (form.data.excerpt_en.trim() === '') {
            form.setData('excerpt_en', form.data.excerpt_id);
        }
    };

    const syncBodyToEnglish = () => {
        if (form.data.body_en.trim() === '') {
            form.setData('body_en', form.data.body_id);
        }
    };

    const previewTitle =
        form.data[localizedFields.title] ||
        (locale === 'id' ? form.data.title_en : form.data.title_id);
    const previewExcerpt =
        form.data[localizedFields.excerpt] ||
        (locale === 'id' ? form.data.excerpt_en : form.data.excerpt_id);
    const previewBody =
        form.data[localizedFields.body] ||
        (locale === 'id' ? form.data.body_en : form.data.body_id);
    const previewMetaTitle =
        form.data[localizedFields.metaTitle] || previewTitle;
    const previewMetaDescription =
        form.data[localizedFields.metaDescription] || previewExcerpt;
    const previewReadingTime = estimateReadingTime(previewBody);
    const previewParagraphs = paragraphBlocks(previewBody);
    const titleStatus = resolveFieldStatus(
        form.data[localizedFields.title],
        locale === 'id' ? form.data.title_en : form.data.title_id,
    );
    const excerptStatus = resolveFieldStatus(
        form.data[localizedFields.excerpt],
        locale === 'id' ? form.data.excerpt_en : form.data.excerpt_id,
    );
    const bodyStatus = resolveFieldStatus(
        form.data[localizedFields.body],
        locale === 'id' ? form.data.body_en : form.data.body_id,
    );
    const metaTitleStatus = resolveFieldStatus(
        form.data[localizedFields.metaTitle],
        locale === 'id' ? form.data.meta_title_en : form.data.meta_title_id,
    );
    const metaDescriptionStatus = resolveFieldStatus(
        form.data[localizedFields.metaDescription],
        locale === 'id'
            ? form.data.meta_description_en
            : form.data.meta_description_id,
    );

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Articles & News',
                    href: '/admin/website-management/articles',
                },
                {
                    title: mode === 'create' ? 'Artikel Baru' : 'Edit Artikel',
                    href:
                        mode === 'create'
                            ? '/admin/website-management/articles/create'
                            : `/admin/website-management/articles/${article.id}/edit`,
                },
            ]}
        >
            <Head title={mode === 'create' ? 'Artikel Baru' : 'Edit Artikel'} />

            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {mode === 'create'
                                ? 'Artikel Baru'
                                : 'Edit Artikel'}
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Siapkan article, news update, atau travel insight
                            lengkap dengan schedule publish dan SEO field.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <AdminLocaleSwitch />
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/website-management/articles">
                                Kembali
                            </Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? 'Menyimpan...'
                                : mode === 'create'
                                  ? 'Simpan Artikel'
                                  : 'Update Artikel'}
                        </Button>
                    </div>
                </div>

                {Object.keys(form.errors).length > 0 ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                        {Object.values(form.errors).join(', ')}
                    </div>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
                    <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-base font-semibold">
                                    Konten Artikel
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Sedang mengedit field bahasa{' '}
                                    {copy.localeName}.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>{copy.titleLabel}</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${titleStatus.tone}`}
                                    >
                                        {titleStatus.label}
                                    </span>
                                </div>
                                <Input
                                    value={form.data[localizedFields.title]}
                                    onChange={(event) =>
                                        form.setData(
                                            localizedFields.title,
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {titleStatus.helper}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    value={form.data.slug}
                                    onChange={(event) => {
                                        setSlugTouched(true);
                                        form.setData(
                                            'slug',
                                            event.target.value,
                                        );
                                    }}
                                    placeholder="auto dari judul jika kosong"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Slug akan dibuat otomatis dari judul sampai
                                    Anda mengubahnya manual.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>{copy.excerptLabel}</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${excerptStatus.tone}`}
                                    >
                                        {excerptStatus.label}
                                    </span>
                                </div>
                                <Textarea
                                    rows={4}
                                    value={form.data[localizedFields.excerpt]}
                                    onChange={(event) =>
                                        form.setData(
                                            localizedFields.excerpt,
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {excerptStatus.helper}
                                </p>
                                {locale === 'id' ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-auto px-0 text-xs text-muted-foreground"
                                        onClick={syncExcerptToEnglish}
                                    >
                                        Pakai sebagai draft EN jika EN masih
                                        kosong
                                    </Button>
                                ) : null}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Label>{copy.bodyLabel}</Label>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${bodyStatus.tone}`}
                                        >
                                            {bodyStatus.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                insertTemplate(
                                                    bodyTemplates.intro[locale],
                                                )
                                            }
                                        >
                                            Intro
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                insertTemplate(
                                                    bodyTemplates.checklist[
                                                        locale
                                                    ],
                                                )
                                            }
                                        >
                                            Checklist
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                insertTemplate(
                                                    bodyTemplates.cta[locale],
                                                )
                                            }
                                        >
                                            CTA
                                        </Button>
                                    </div>
                                </div>
                                {locale === 'id' ? (
                                    <RichTextEditor
                                        value={form.data.body_id}
                                        onChange={(value) =>
                                            form.setData('body_id', value)
                                        }
                                        placeholder="Tulis isi artikel Indonesia dengan format heading, list, link, dan penekanan teks."
                                    />
                                ) : (
                                    <Textarea
                                        rows={14}
                                        value={form.data.body_en}
                                        onChange={(event) =>
                                            form.setData(
                                                'body_en',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tulis body English di sini. Jika dibiarkan kosong, sistem akan memakai versi Indonesia saat disimpan."
                                    />
                                )}
                                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <span>{bodyStatus.helper}</span>
                                    {locale === 'id' ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-auto px-0 text-xs"
                                            onClick={syncBodyToEnglish}
                                        >
                                            Pakai sebagai draft EN jika EN masih
                                            kosong
                                        </Button>
                                    ) : null}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pisahkan paragraf dengan satu baris kosong
                                    agar preview lebih rapi. Body Indonesia
                                    sekarang mendukung rich text untuk tampilan
                                    artikel yang lebih rapi.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-border pt-6">
                            <h2 className="text-base font-semibold">SEO</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>{copy.metaTitleLabel}</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${metaTitleStatus.tone}`}
                                    >
                                        {metaTitleStatus.label}
                                    </span>
                                </div>
                                <Input
                                    value={form.data[localizedFields.metaTitle]}
                                    onChange={(event) =>
                                        form.setData(
                                            localizedFields.metaTitle,
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {metaTitleStatus.helper}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>{copy.metaDescriptionLabel}</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${metaDescriptionStatus.tone}`}
                                    >
                                        {metaDescriptionStatus.label}
                                    </span>
                                </div>
                                <Textarea
                                    rows={4}
                                    value={
                                        form.data[
                                            localizedFields.metaDescription
                                        ]
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            localizedFields.metaDescription,
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {metaDescriptionStatus.helper}
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <section className="space-y-4">
                            <h2 className="text-base font-semibold">
                                Publikasi
                            </h2>
                            <div className="space-y-2">
                                <Label>Tipe Konten</Label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.content_type}
                                    onChange={(event) =>
                                        form.setData(
                                            'content_type',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {contentTypeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    {statusDescriptions[form.data.status] ??
                                        'Atur mode publish sesuai kebutuhan editorial.'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Input
                                    value={form.data.author_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'author_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="otomatis ikut nama user jika dikosongkan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Published At</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.data.published_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'published_at',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input
                                    value={form.data.tags}
                                    onChange={(event) =>
                                        form.setData('tags', event.target.value)
                                    }
                                    placeholder="umrah, visa, makkah"
                                />
                            </div>
                            <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_featured}
                                    onChange={(event) =>
                                        form.setData(
                                            'is_featured',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Tampilkan sebagai featured article
                            </label>
                        </section>

                        <section className="space-y-4 border-t border-border pt-6">
                            <h2 className="text-base font-semibold">
                                Ringkasan Cepat
                            </h2>
                            <div className="grid gap-3 text-sm">
                                <div className="rounded-xl border border-border bg-background px-3 py-3">
                                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Public URL
                                    </div>
                                    <div className="mt-1 font-medium break-all text-foreground">
                                        /artikel/
                                        {form.data.slug || 'slug-artikel'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border bg-background px-3 py-3">
                                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Mode Publish
                                    </div>
                                    <div className="mt-1 font-medium text-foreground">
                                        {contentTypeLabels[
                                            form.data.content_type
                                        ] ?? form.data.content_type}{' '}
                                        / {form.data.status}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        {form.data.published_at
                                            ? `Tayang: ${form.data.published_at}`
                                            : 'Belum ada tanggal tayang'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border bg-background px-3 py-3">
                                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        SEO Preview
                                    </div>
                                    <div className="mt-1 line-clamp-2 font-medium text-foreground">
                                        {previewMetaTitle || 'Judul artikel'}
                                    </div>
                                    <div className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                                        {previewMetaDescription ||
                                            'Deskripsi singkat artikel akan muncul di sini.'}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border bg-background px-3 py-3">
                                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Estimasi Baca
                                    </div>
                                    <div className="mt-1 font-medium text-foreground">
                                        {previewReadingTime} menit
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-border pt-6">
                            <h2 className="text-base font-semibold">Media</h2>
                            <div className="space-y-2">
                                <Label>Cover Image</Label>
                                {article.image_path ? (
                                    <img
                                        src={article.image_path}
                                        alt="cover"
                                        className="h-40 w-full rounded-xl object-cover"
                                    />
                                ) : null}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        form.setData(
                                            'cover_image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>OG Image</Label>
                                {article.og_image_path ? (
                                    <img
                                        src={article.og_image_path}
                                        alt="og"
                                        className="h-32 w-full rounded-xl object-cover"
                                    />
                                ) : null}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        form.setData(
                                            'og_image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-border pt-6">
                            <div className="space-y-1">
                                <h2 className="text-base font-semibold">
                                    Live Preview
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Preview mengikuti bahasa aktif agar fokus
                                    penulisan tetap rapi.
                                </p>
                            </div>
                            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                                {article.image_path || form.data.cover_image ? (
                                    <div className="aspect-[16/8] bg-muted" />
                                ) : null}
                                <div className="space-y-5 p-5">
                                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                        <span>
                                            {contentTypeLabels[
                                                form.data.content_type
                                            ] ?? form.data.content_type}
                                        </span>
                                        <span>{copy.localeName}</span>
                                        {form.data.is_featured ? (
                                            <span>Featured</span>
                                        ) : null}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold text-foreground">
                                            {previewTitle || 'Judul artikel'}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                            {previewExcerpt ||
                                                'Excerpt artikel akan muncul di sini.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span>
                                            {form.data.author_name ||
                                                'Nama penulis'}
                                        </span>
                                        <span>
                                            {form.data.published_at ||
                                                'Tanggal publish'}
                                        </span>
                                        <span>
                                            {previewReadingTime} menit baca
                                        </span>
                                    </div>
                                    <div className="space-y-4 text-sm leading-7 text-foreground/90">
                                        {containsHtml(previewBody) ? (
                                            <div
                                                className="prose prose-sm prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: previewBody,
                                                }}
                                            />
                                        ) : previewParagraphs.length > 0 ? (
                                            previewParagraphs.map(
                                                (paragraph, index) => (
                                                    <p key={index}>
                                                        {paragraph}
                                                    </p>
                                                ),
                                            )
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Body artikel akan tampil di
                                                sini. Pisahkan paragraf dengan
                                                satu baris kosong.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </AppSidebarLayout>
    );
}

