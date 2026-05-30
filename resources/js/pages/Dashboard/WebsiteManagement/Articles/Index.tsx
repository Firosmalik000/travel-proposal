import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import {
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
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

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(publishedAt));
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
            window.open(`/artikel/${article.slug}`, '_blank', 'noopener');

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

            <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                            Articles & News
                        </h1>
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
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    {[
                        ['Total Artikel', stats.total],
                        ['Published', stats.published],
                        ['Scheduled', stats.scheduled],
                        ['Featured Aktif', stats.featured],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm"
                        >
                            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {label}
                            </div>
                            <div className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
                                {value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:grid-cols-4">
                    <div className="md:col-span-2">
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                setContentType('');
                                setFeatured('');
                                router.get(
                                    '/admin/website-management/articles',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="mr-2"
                        >
                            Reset
                        </Button>
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
                        </SheetHeader>
                        {drawerUrl ? (
                            <iframe
                                title={drawerTitle}
                                src={drawerUrl}
                                className="h-[calc(100vh-88px)] w-full bg-white"
                            />
                        ) : null}
                    </SheetContent>
                </Sheet>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
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
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    aria-label={`Aksi ${article.title}`}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {canEdit ? (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleArticleAction(
                                                                'edit',
                                                                article,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                ) : null}
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleArticleAction(
                                                            'preview',
                                                            article,
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Preview
                                                </DropdownMenuItem>
                                                {canDelete ? (
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleArticleAction(
                                                                'delete',
                                                                article,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                ) : null}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/35 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="w-16 px-4 py-3 text-center">
                                        No
                                    </th>
                                    <th className="w-20 px-4 py-3 text-right">
                                        Aksi
                                    </th>
                                    <th className="px-4 py-3">Artikel</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Published</th>
                                    <th className="px-4 py-3">Stat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {articles.data.map((article, index) => (
                                    <tr
                                        key={article.id}
                                        className="align-top transition-colors hover:bg-muted/20"
                                    >
                                        <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            aria-label={`Aksi ${article.title}`}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {canEdit ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleArticleAction(
                                                                        'edit',
                                                                        article,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleArticleAction(
                                                                    'preview',
                                                                    article,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        {canDelete ? (
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    handleArticleAction(
                                                                        'delete',
                                                                        article,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
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
                                                <div className="min-w-0 space-y-1">
                                                    <div className="line-clamp-2 font-medium text-foreground">
                                                        {article.title}
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
                                            <div className="font-medium text-foreground">
                                                {article.views_count} views
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {articles.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
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
