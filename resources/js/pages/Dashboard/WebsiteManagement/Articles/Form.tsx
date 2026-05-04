import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Option = {
    value: string;
    label: string;
};

type ArticleFormPayload = {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    image_path?: string | null;
    content_type: string;
    status: string;
    author_name: string;
    tags: string;
    meta_title: string;
    meta_description: string;
    og_image_path?: string | null;
    published_at: string;
    is_featured: boolean;
};

type ArticleFormData = {
    _method?: string;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    author_name: string;
    content_type: string;
    status: string;
    tags: string;
    meta_title: string;
    meta_description: string;
    published_at: string;
    is_featured: boolean;
    cover_image: File | null;
    og_image: File | null;
};

const bodyTemplates = {
    intro: {
        id: 'Paragraf pembuka yang menjelaskan konteks utama artikel dan manfaatnya untuk pembaca.',
    },
    checklist: {
        id: '- Poin penting pertama\n- Poin penting kedua\n- Poin penting ketiga',
    },
    cta: {
        id: 'Butuh bantuan lebih lanjut? Hubungi tim kami untuk konsultasi dan pendampingan pendaftaran.',
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

function asString(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    return String(value);
}

function estimateReadingTime(value: unknown): number {
    const words = asString(value).trim().split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 180));
}

function paragraphBlocks(value: unknown): string[] {
    return asString(value)
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function containsHtml(value: unknown): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(asString(value));
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
    article: ArticleFormPayload | Record<string, unknown>;
    contentTypeOptions: Option[];
    statusOptions: Option[];
    mode: 'create' | 'edit';
}) {
    const payload = article as Record<string, unknown>;
    const [slugTouched, setSlugTouched] = useState(
        asString(payload.slug) !== '',
    );
    const form = useForm<ArticleFormData>({
        _method: undefined,
        title: asString(payload.title),
        slug: asString(payload.slug),
        excerpt: asString(payload.excerpt),
        body: asString(payload.body),
        author_name: asString(payload.author_name),
        content_type: asString(payload.content_type),
        status: asString(payload.status),
        tags: asString(payload.tags),
        meta_title: asString(payload.meta_title),
        meta_description: asString(payload.meta_description),
        published_at: asString(payload.published_at),
        is_featured: Boolean(payload.is_featured),
        cover_image: null as File | null,
        og_image: null as File | null,
    });
    const coverImagePath = asString(payload.image_path);
    const ogImagePath = asString(payload.og_image_path);

    useEffect(() => {
        const defaultContentType =
            contentTypeOptions[0]?.value || 'umrah_education';
        const defaultStatus = statusOptions[0]?.value || 'draft';

        form.transform((data) => ({
            ...data,
            content_type: data.content_type || defaultContentType,
            status: data.status || defaultStatus,
        }));

        return () => {
            form.transform((data) => data);
        };
    }, [contentTypeOptions, form, statusOptions]);

    useEffect(() => {
        if (slugTouched) {
            return;
        }

        const source = form.data.title;
        const generatedSlug = source
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        form.setData('slug', generatedSlug);
    }, [form, form.data.title, slugTouched]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const resolvedId = Number(payload.id || 0) || undefined;

        if (mode === 'edit' && resolvedId) {
            const url = `/admin/website-management/articles/${resolvedId}`;
            const hasUpload =
                form.data.cover_image !== null || form.data.og_image !== null;

            form.patch(url, {
                forceFormData: hasUpload,
                onStart: () => {
                    console.debug('[ArticleForm] submit start', {
                        url,
                        method: 'PATCH',
                        hasUpload,
                        content_type: form.data.content_type,
                        status: form.data.status,
                        title: form.data.title,
                    });
                },
                onError: (errors) => {
                    console.error('[ArticleForm] submit errors', errors);
                },
                onSuccess: () => {
                    console.debug('[ArticleForm] submit success');
                },
            });

            return;
        }

        form.post('/admin/website-management/articles', {
            forceFormData: true,
            onStart: () => {
                console.debug('[ArticleForm] submit start', {
                    url: '/admin/website-management/articles',
                    method: 'POST',
                    content_type: form.data.content_type,
                    status: form.data.status,
                    title: form.data.title,
                });
            },
            onError: (errors) => {
                console.error('[ArticleForm] submit errors', errors);
            },
            onSuccess: () => {
                console.debug('[ArticleForm] submit success');
            },
        });
    };

    const insertTemplate = (template: string) => {
        const field = 'body' as const;
        const nextValue =
            form.data[field].trim() === ''
                ? template
                : `${form.data[field].replace(/\s+$/, '')}\n\n${template}`;

        form.setData(field, nextValue);
    };

    const previewTitle = form.data.title;
    const previewExcerpt = form.data.excerpt;
    const previewBody = form.data.body;
    const previewMetaTitle = form.data.meta_title || previewTitle;
    const previewMetaDescription = form.data.meta_description || previewExcerpt;
    const previewReadingTime = estimateReadingTime(previewBody);
    const previewParagraphs = paragraphBlocks(previewBody);
    const titleStatus = resolveFieldStatus(form.data.title, '');
    const excerptStatus = resolveFieldStatus(form.data.excerpt, '');
    const bodyStatus = resolveFieldStatus(form.data.body, '');
    const metaTitleStatus = resolveFieldStatus(form.data.meta_title, '');
    const metaDescriptionStatus = resolveFieldStatus(
        form.data.meta_description,
        '',
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
                            : `/admin/website-management/articles/${payload.id}/edit`,
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
                                    Lengkapi konten artikel untuk ditampilkan di
                                    halaman public.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Judul Artikel</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${titleStatus.tone}`}
                                    >
                                        {titleStatus.label}
                                    </span>
                                </div>
                                <Input
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
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
                                    <Label>Ringkasan</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${excerptStatus.tone}`}
                                    >
                                        {excerptStatus.label}
                                    </span>
                                </div>
                                <Textarea
                                    rows={4}
                                    value={form.data.excerpt}
                                    onChange={(event) =>
                                        form.setData(
                                            'excerpt',
                                            event.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {excerptStatus.helper}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Label>Body</Label>
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
                                                    bodyTemplates.intro.id,
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
                                                    bodyTemplates.checklist.id,
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
                                                    bodyTemplates.cta.id,
                                                )
                                            }
                                        >
                                            CTA
                                        </Button>
                                    </div>
                                </div>
                                <RichTextEditor
                                    value={form.data.body}
                                    onChange={(value) =>
                                        form.setData('body', value)
                                    }
                                    placeholder="Tulis isi artikel dengan format heading, list, link, dan penekanan teks."
                                />
                                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <span>{bodyStatus.helper}</span>
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
                                    <Label>Meta Title</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${metaTitleStatus.tone}`}
                                    >
                                        {metaTitleStatus.label}
                                    </span>
                                </div>
                                <Input
                                    value={form.data.meta_title}
                                    onChange={(event) =>
                                        form.setData(
                                            'meta_title',
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
                                    <Label>Meta Description</Label>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${metaDescriptionStatus.tone}`}
                                    >
                                        {metaDescriptionStatus.label}
                                    </span>
                                </div>
                                <Textarea
                                    rows={4}
                                    value={form.data.meta_description}
                                    onChange={(event) =>
                                        form.setData(
                                            'meta_description',
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
                                {coverImagePath ? (
                                    <img
                                        src={coverImagePath}
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
                                {ogImagePath ? (
                                    <img
                                        src={ogImagePath}
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
                                    Preview artikel yang akan tampil di public.
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
                                        <span>Indonesia</span>
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
