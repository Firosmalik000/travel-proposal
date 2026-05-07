import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

type Option = {
    value: string;
    label: string;
};

type ArticleRow = {
    id: number;
    title: string;
    slug: string;
    image_path?: string | null;
    content_type: string;
    status: string;
    author_name?: string | null;
    tags: string[];
    reading_time_minutes: number;
    views_count: number;
    published_at?: string | null;
    is_featured: boolean;
    is_active: boolean;
};

type PaginatedArticles = {
    data: ArticleRow[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
};

const badgeTone: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    scheduled: 'bg-amber-100 text-amber-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-rose-100 text-rose-700',
};

const contentTypeLabels: Record<string, string> = {
    travel_update: 'Travel Update',
    company_news: 'Company News',
    umrah_education: 'Umrah Education',
    general_news: 'General News',
};

const formatPublishedAt = (publishedAt?: string | null): string => {
    if (!publishedAt) {
        return '-';
    }

    return new Date(publishedAt).toLocaleString('id-ID');
};

export default function ArticleIndex({
    articles,
    filters,
    contentTypeOptions,
    statusOptions,
    stats,
}: {
    articles: PaginatedArticles;
    filters: {
        search: string;
        status: string;
        content_type: string;
        featured: string;
    };
    contentTypeOptions: Option[];
    statusOptions: Option[];
    stats: {
        total: number;
        published: number;
        scheduled: number;
        featured: number;
    };
}) {
    const { can } = usePermission('articles_management');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [contentType, setContentType] = useState(filters.content_type);
    const [featured, setFeatured] = useState(filters.featured);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerUrl, setDrawerUrl] = useState<string | null>(null);
    const [drawerTitle, setDrawerTitle] = useState<string>('');

    const openDrawer = (url: string, title: string) => {
        setDrawerUrl(url);
        setDrawerTitle(title);
        setDrawerOpen(true);
    };

    const submitFilters = () => {
        router.get(
            '/admin/website-management/articles',
            {
                search,
                status,
                content_type: contentType,
                featured,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data?.type !== 'articles:drawer:close') {
                return;
            }

            setDrawerOpen(false);
            setDrawerUrl(null);
            router.reload({
                preserveScroll: true,
                preserveState: true,
            } as unknown as Parameters<typeof router.reload>[0]);
        };

        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, []);

    const destroyArticle = (articleId: number) => {
        if (!canDelete) {
            return;
        }

        if (!window.confirm('Hapus artikel ini?')) {
            return;
        }

        router.delete(`/admin/website-management/articles/${articleId}`, {
            preserveScroll: true,
        });
    };

    const handleArticleAction = (action: string, article: ArticleRow) => {
        if (action === 'edit') {
            if (!canEdit) {
                return;
            }

            openDrawer(
                `/admin/website-management/articles/${article.id}/edit`,
                'Edit Artikel',
            );

            return;
        }

        if (action === 'preview') {
            window.open(
                `/admin/website-management/articles/${article.id}/preview`,
                '_blank',
                'noopener',
            );

            return;
        }

        if (action === 'delete') {
            destroyArticle(article.id);
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Articles & News',
                    href: '/admin/website-management/articles',
                },
            ]}
        >
            <Head title="Articles & News" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Articles & News
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Kelola blog, company news, travel update, dan
                            artikel edukasi umrah dari satu modul editorial.
                        </p>
                    </div>
                    {canCreate ? (
                        <Button asChild>
                            <button
                                type="button"
                                onClick={() =>
                                    openDrawer(
                                        '/admin/website-management/articles/create',
                                        'Artikel Baru',
                                    )
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Artikel Baru
                            </button>
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        ['Total Artikel', stats.total],
                        ['Published', stats.published],
                        ['Scheduled', stats.scheduled],
                        ['Featured Aktif', stats.featured],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {label}
                            </div>
                            <div className="mt-2 text-3xl font-semibold text-foreground">
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Cari Artikel
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Judul, slug, atau author"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={submitFilters}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Status
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="">Semua</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Tipe Konten
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={contentType}
                            onChange={(event) =>
                                setContentType(event.target.value)
                            }
                        >
                            <option value="">Semua</option>
                            {contentTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Featured
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={featured}
                            onChange={(event) =>
                                setFeatured(event.target.value)
                            }
                        >
                            <option value="">Semua</option>
                            <option value="yes">Featured</option>
                            <option value="no">Non Featured</option>
                        </select>
                    </div>
                    <div className="flex items-end md:col-span-4">
                        <Button type="button" onClick={submitFilters}>
                            Terapkan Filter
                        </Button>
                    </div>
                </div>

                <Sheet
                    open={drawerOpen}
                    onOpenChange={(nextOpen) => {
                        setDrawerOpen(nextOpen);

                        if (!nextOpen) {
                            setDrawerUrl(null);
                            router.reload({
                                preserveScroll: true,
                                preserveState: true,
                            } as unknown as Parameters<
                                typeof router.reload
                            >[0]);
                        }
                    }}
                >
                    <SheetContent
                        side="right"
                        className="w-full p-0 sm:max-w-[75vw]"
                    >
                        <SheetHeader className="border-b border-border p-4">
                            <SheetTitle>{drawerTitle}</SheetTitle>
                            <SheetDescription>
                                Buat atau edit artikel tanpa pindah halaman.
                            </SheetDescription>
                        </SheetHeader>
                        {drawerUrl ? (
                            <iframe
                                title={drawerTitle}
                                src={drawerUrl}
                                className="h-[calc(100vh-88px)] w-full bg-background"
                            />
                        ) : null}
                    </SheetContent>
                </Sheet>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
                        Total artikel: {articles.total}
                    </div>
                    <div className="divide-y divide-border md:hidden">
                        {articles.data.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                Belum ada artikel yang cocok dengan filter ini.
                            </div>
                        ) : (
                            articles.data.map((article) => (
                                <div
                                    key={article.id}
                                    className="space-y-4 px-4 py-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                                            {article.image_path ? (
                                                <img
                                                    src={article.image_path}
                                                    alt={article.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="line-clamp-2 font-medium text-foreground">
                                                {article.title}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">
                                                /artikel/{article.slug}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {article.author_name ||
                                                    'Tanpa author'}
                                            </div>
                                        </div>
                                    </div>

                                    {article.tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {article.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-xl bg-muted/40 p-3">
                                            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Tipe
                                            </div>
                                            <div className="mt-1 text-foreground">
                                                {contentTypeLabels[
                                                    article.content_type
                                                ] ?? article.content_type}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-muted/40 p-3">
                                            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Status
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTone[article.status] ?? 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {article.status}
                                                </span>
                                                {article.is_featured ? (
                                                    <span className="text-xs font-medium text-primary">
                                                        Featured
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-muted/40 p-3">
                                            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Published
                                            </div>
                                            <div className="mt-1 text-foreground">
                                                {formatPublishedAt(
                                                    article.published_at,
                                                )}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-muted/40 p-3">
                                            <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Stat
                                            </div>
                                            <div className="mt-1 text-foreground">
                                                {article.views_count} views
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {article.reading_time_minutes}{' '}
                                                menit baca
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                            Action
                                        </label>
                                        <Select
                                            value=""
                                            onValueChange={(value) =>
                                                handleArticleAction(
                                                    value,
                                                    article,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="edit">
                                                    Edit artikel
                                                </SelectItem>
                                                <SelectItem value="preview">
                                                    Preview artikel
                                                </SelectItem>
                                                <SelectItem value="delete">
                                                    Hapus artikel
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Artikel</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Published</th>
                                    <th className="px-4 py-3">Stat</th>
                                    <th className="px-4 py-3 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {articles.data.map((article) => (
                                    <tr key={article.id}>
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                                                    {article.image_path ? (
                                                        <img
                                                            src={
                                                                article.image_path
                                                            }
                                                            alt={article.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-foreground">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        /artikel/{article.slug}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {article.author_name ||
                                                            'Tanpa author'}
                                                    </div>
                                                    {article.tags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {article.tags.map(
                                                                (tag) => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {contentTypeLabels[
                                                article.content_type
                                            ] ?? article.content_type}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTone[article.status] ?? 'bg-slate-100 text-slate-700'}`}
                                            >
                                                {article.status}
                                            </span>
                                            {article.is_featured ? (
                                                <div className="mt-2 text-xs font-medium text-primary">
                                                    Featured
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {formatPublishedAt(
                                                article.published_at,
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            <div>
                                                {article.views_count} views
                                            </div>
                                            <div>
                                                {article.reading_time_minutes}{' '}
                                                menit baca
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end">
                                                <Select
                                                    value=""
                                                    onValueChange={(value) =>
                                                        handleArticleAction(
                                                            value,
                                                            article,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-9 w-[172px]">
                                                        <div className="flex items-center gap-2">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <SelectValue placeholder="Pilih action" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {canEdit ? (
                                                            <SelectItem value="edit">
                                                                Edit artikel
                                                            </SelectItem>
                                                        ) : null}
                                                        <SelectItem value="preview">
                                                            Preview artikel
                                                        </SelectItem>
                                                        {canDelete ? (
                                                            <SelectItem value="delete">
                                                                Hapus artikel
                                                            </SelectItem>
                                                        ) : null}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {articles.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada artikel yang cocok dengan
                                            filter ini.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {articles.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {articles.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => router.visit(link.url!)}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
