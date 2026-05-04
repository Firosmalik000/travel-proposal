import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import {
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
import PublicLayout from '@/layouts/PublicLayout';
import { formatDate, localize } from '@/lib/public-content';
import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

type ArticleItem = {
    id: number;
    title: Record<string, string> | string;
    slug: string;
    excerpt: Record<string, string> | string;
    image_path?: string | null;
    content_type: string;
    author_name?: string | null;
    tags: string[];
    published_at?: string | null;
    reading_time_minutes: number;
    is_featured: boolean;
};

type PaginatedArticles = {
    data: ArticleItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type FilterOption = {
    value: string;
    label: string;
};

const content = {
    id: {
        title: 'Artikel & News Update',
        meta: 'Insight, berita, dan travel update terbaru dari layanan umrah dan industri perjalanan.',
        subtitle:
            'Satu tempat untuk company news, travel update, tips umrah, dan insight terbaru.',
        searchPlaceholder: 'Cari artikel atau keyword',
        noData: 'Belum ada artikel yang cocok dengan filter ini.',
        readMore: 'Baca Selengkapnya',
        featured: 'Featured Story',
        minuteRead: 'menit baca',
    },
    en: {
        title: 'Articles & News Updates',
        meta: 'Insights, news, and the latest travel updates from the company and broader travel industry.',
        subtitle:
            'One place for company news, travel updates, umrah tips, and fresh editorial insights.',
        searchPlaceholder: 'Search article or keyword',
        noData: 'No articles match the selected filters.',
        readMore: 'Read Article',
        featured: 'Featured Story',
        minuteRead: 'min read',
    },
};

export default function ArtikelIndex({
    featuredArticle,
    articles,
    filters,
    contentTypeOptions,
}: {
    featuredArticle: ArticleItem | null;
    articles: PaginatedArticles;
    filters: {
        search: string;
        content_type: string;
    };
    contentTypeOptions: FilterOption[];
}) {
    const locale: 'id' | 'en' = 'id';
    const t = content[locale];
    const [search, setSearch] = useState(filters.search);
    const [contentType, setContentType] = useState(filters.content_type);

    const submitFilters = () => {
        router.get(
            '/artikel',
            {
                search,
                content_type: contentType,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.meta} />
            </Head>

            <MotionSection className="relative isolate mx-auto w-full max-w-6xl overflow-hidden px-4 pt-6 pb-8 sm:px-6">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentZellige className="absolute top-[-30%] right-[-14%] h-[18rem] w-[18rem] rotate-[12deg] text-primary/15 sm:h-[22rem] sm:w-[22rem]" />
                    <IslamicOrnamentOttomanAccent className="absolute bottom-[-38%] left-[-16%] h-[20rem] w-[20rem] -rotate-[10deg] text-accent/15 sm:h-[26rem] sm:w-[26rem]" />
                </div>
                <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-lg">
                    <div className="max-w-3xl space-y-4">
                        <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                            Editorial Hub
                        </span>
                        <h1 className="public-heading text-3xl font-semibold text-foreground md:text-5xl">
                            {t.title}
                        </h1>
                        <p className="text-base text-muted-foreground md:text-lg">
                            {t.subtitle}
                        </p>
                    </div>
                </div>
            </MotionSection>

            <MotionSection className="relative isolate mx-auto w-full max-w-6xl overflow-hidden px-4 pb-8 sm:px-6">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <IslamicOrnamentOttomanAccent className="absolute top-[-42%] left-[12%] h-[18rem] w-[18rem] rotate-[14deg] text-primary/12 sm:h-[22rem] sm:w-[22rem]" />
                </div>
                <div className="grid gap-4 rounded-3xl border border-border bg-card/90 p-4 shadow-sm md:grid-cols-[1.5fr_220px_auto]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="h-12 w-full rounded-2xl border border-input bg-background pr-4 pl-10 text-sm text-foreground outline-none"
                        />
                    </div>
                    <select
                        value={contentType}
                        onChange={(event) => setContentType(event.target.value)}
                        className="h-12 rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none"
                    >
                        {contentTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={submitFilters}
                        className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
                    >
                        Filter
                    </button>
                </div>
            </MotionSection>

            {featuredArticle ? (
                <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
                    <Link
                        href={`/artikel/${featuredArticle.slug}`}
                        className="grid overflow-hidden rounded-[2rem] border border-border bg-card/90 shadow-lg md:grid-cols-[1.2fr_1fr]"
                    >
                        <div className="p-6 md:p-8">
                            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                                {t.featured}
                            </span>
                            <h2 className="public-heading mt-4 text-2xl font-semibold text-foreground md:text-4xl">
                                {localize(featuredArticle.title, locale)}
                            </h2>
                            <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground md:text-base">
                                {localize(featuredArticle.excerpt, locale)}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
                                <span>{featuredArticle.author_name}</span>
                                <span>
                                    {formatDate(
                                        featuredArticle.published_at,
                                        locale,
                                    )}
                                </span>
                                <span>
                                    {featuredArticle.reading_time_minutes}{' '}
                                    {t.minuteRead}
                                </span>
                            </div>
                        </div>
                        <div className="min-h-[260px] bg-muted">
                            {featuredArticle.image_path ? (
                                <img
                                    src={featuredArticle.image_path}
                                    alt={localize(
                                        featuredArticle.title,
                                        locale,
                                    )}
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                        </div>
                    </Link>
                </MotionSection>
            ) : null}

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                {articles.data.length > 0 ? (
                    <MotionGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {articles.data.map((article) => (
                            <MotionCard
                                key={article.id}
                                className="overflow-hidden rounded-[1.6rem] border border-border bg-card/90 shadow-sm"
                            >
                                <div className="aspect-[16/10] bg-muted">
                                    {article.image_path ? (
                                        <img
                                            src={article.image_path}
                                            alt={localize(
                                                article.title,
                                                locale,
                                            )}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="space-y-4 p-5">
                                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                        <span>{article.content_type}</span>
                                        {article.is_featured ? (
                                            <span>Featured</span>
                                        ) : null}
                                    </div>
                                    <div>
                                        <h3 className="public-heading text-xl font-semibold text-foreground">
                                            {localize(article.title, locale)}
                                        </h3>
                                        <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                                            {localize(article.excerpt, locale)}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                        <span>{article.author_name}</span>
                                        <span>
                                            {formatDate(
                                                article.published_at,
                                                locale,
                                            )}
                                        </span>
                                        <span>
                                            {article.reading_time_minutes}{' '}
                                            {t.minuteRead}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/artikel/${article.slug}`}
                                        className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                                    >
                                        {t.readMore}
                                    </Link>
                                </div>
                            </MotionCard>
                        ))}
                    </MotionGroup>
                ) : (
                    <div className="rounded-3xl border border-dashed border-border bg-card/80 px-6 py-16 text-center text-muted-foreground">
                        {t.noData}
                    </div>
                )}

                {articles.links.length > 3 ? (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        {articles.links.map((link, index) =>
                            link.url ? (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    onClick={() => router.visit(link.url!)}
                                    className={`rounded-full px-4 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground'}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled
                                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </div>
                ) : null}
            </MotionSection>
        </PublicLayout>
    );
}
