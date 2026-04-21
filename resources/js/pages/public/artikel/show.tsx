import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { formatDate, localize } from '@/lib/public-content';
import { Head, Link } from '@inertiajs/react';

type ArticleItem = {
    id: number;
    title: Record<string, string> | string;
    slug: string;
    excerpt: Record<string, string> | string;
    body?: Record<string, string> | string;
    image_path?: string | null;
    content_type: string;
    author_name?: string | null;
    tags: string[];
    published_at?: string | null;
    reading_time_minutes: number;
    is_featured: boolean;
    meta_title?: Record<string, string> | string | null;
    meta_description?: Record<string, string> | string | null;
    og_image_path?: string | null;
    views_count?: number;
};

const content = {
    id: {
        back: 'Kembali ke Artikel',
        related: 'Artikel Terkait',
        latest: 'Insight Berikutnya',
        minuteRead: 'menit baca',
        views: 'views',
    },
    en: {
        back: 'Back to Articles',
        related: 'Related Articles',
        latest: 'Next Insights',
        minuteRead: 'min read',
        views: 'views',
    },
};

function paragraphs(value: string): string[] {
    return value
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function containsHtml(value: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(value);
}

export default function ArticleShow({
    article,
    relatedArticles,
}: {
    article: ArticleItem;
    relatedArticles: ArticleItem[];
}) {
    const { locale } = usePublicLocale();
    const t = content[locale];
    const articleTitle = localize(
        article.meta_title || article.title,
        locale,
        localize(article.title, locale),
    );
    const articleDescription = localize(
        article.meta_description || article.excerpt,
        locale,
        localize(article.excerpt, locale),
    );
    const articleBody = localize(article.body, locale);

    return (
        <PublicLayout>
            <Head title={articleTitle}>
                <meta name="description" content={articleDescription} />
                {article.og_image_path ? (
                    <meta property="og:image" content={article.og_image_path} />
                ) : null}
            </Head>

            <MotionSection className="mx-auto w-full max-w-4xl px-4 pt-6 pb-10 sm:px-6">
                <Link
                    href="/artikel"
                    className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                >
                    {t.back}
                </Link>

                <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card/90 shadow-lg">
                    <div className="space-y-5 p-6 md:p-8">
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                            <span>{article.content_type}</span>
                            {article.is_featured ? <span>Featured</span> : null}
                        </div>
                        <h1 className="public-heading text-3xl font-semibold text-foreground md:text-5xl">
                            {localize(article.title, locale)}
                        </h1>
                        <p className="text-base leading-8 text-muted-foreground">
                            {localize(article.excerpt, locale)}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{article.author_name}</span>
                            <span>
                                {formatDate(article.published_at, locale)}
                            </span>
                            <span>
                                {article.reading_time_minutes} {t.minuteRead}
                            </span>
                            <span>
                                {article.views_count ?? 0} {t.views}
                            </span>
                        </div>
                    </div>
                    {article.image_path ? (
                        <div className="aspect-[16/9] bg-muted">
                            <img
                                src={article.image_path}
                                alt={localize(article.title, locale)}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : null}
                </div>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
                <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm md:p-8">
                    <div className="space-y-6 text-base leading-8 text-foreground/90">
                        {containsHtml(articleBody) ? (
                            <div
                                className="prose prose-lg prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: articleBody,
                                }}
                            />
                        ) : (
                            paragraphs(articleBody).map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))
                        )}
                    </div>

                    {article.tags.length > 0 ? (
                        <div className="mt-8 flex flex-wrap gap-2">
                            {article.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </MotionSection>

            {relatedArticles.length > 0 ? (
                <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                    <div className="mb-6">
                        <h2 className="public-heading text-2xl font-semibold text-foreground">
                            {t.related}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t.latest}
                        </p>
                    </div>
                    <MotionGroup className="grid gap-6 md:grid-cols-3">
                        {relatedArticles.map((relatedArticle) => (
                            <MotionCard
                                key={relatedArticle.id}
                                className="overflow-hidden rounded-[1.6rem] border border-border bg-card/90 shadow-sm"
                            >
                                <div className="aspect-[16/10] bg-muted">
                                    {relatedArticle.image_path ? (
                                        <img
                                            src={relatedArticle.image_path}
                                            alt={localize(
                                                relatedArticle.title,
                                                locale,
                                            )}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="space-y-3 p-5">
                                    <h3 className="public-heading text-lg font-semibold text-foreground">
                                        {localize(relatedArticle.title, locale)}
                                    </h3>
                                    <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                                        {localize(
                                            relatedArticle.excerpt,
                                            locale,
                                        )}
                                    </p>
                                    <Link
                                        href={`/artikel/${relatedArticle.slug}`}
                                        className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                                    >
                                        Baca
                                    </Link>
                                </div>
                            </MotionCard>
                        ))}
                    </MotionGroup>
                </MotionSection>
            ) : null}
        </PublicLayout>
    );
}
