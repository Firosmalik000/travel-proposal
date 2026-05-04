import PublicLayout from '@/layouts/PublicLayout';
import { localize, usePublicPageContent } from '@/lib/public-content';
import { Head, Link } from '@inertiajs/react';

type Props = {
    slug: string;
};

export default function PolicyPage({ slug }: Props) {
    const locale: 'id' | 'en' = 'id';
    const page = usePublicPageContent(slug);

    const title = localize(page?.title, locale, 'Kebijakan');
    const excerpt = localize(page?.excerpt, locale);
    const bodyHtml = localize(page?.content?.body, locale);
    const pdfUrl = `/${slug}.pdf`;
    const pdfDownloadUrl = `/${slug}.pdf?download=1`;
    const showReadPdfButton = slug !== 'terms-conditions';

    return (
        <PublicLayout>
            <Head title={title}>
                {excerpt ? <meta name="description" content={excerpt} /> : null}
            </Head>

            <main className="bg-background">
                <section className="relative overflow-hidden bg-foreground py-16 sm:py-24">
                    <div className="pointer-events-none absolute inset-0 opacity-80">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(230,156,50,0.22)_0%,transparent_52%),radial-gradient(circle_at_86%_22%,rgba(189,49,34,0.18)_0%,transparent_60%),linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.84)_100%)]" />
                    </div>
                    <div className="relative container mx-auto px-4 sm:px-6">
                        <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
                            {title}
                        </h1>
                        {excerpt ? (
                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                                {excerpt}
                            </p>
                        ) : null}
                    </div>
                </section>

                <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
                    {!page ? (
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {locale === 'id'
                                    ? 'Konten belum tersedia atau sedang dinonaktifkan.'
                                    : 'This content is not available or has been disabled.'}
                            </p>
                            <Link
                                href="/"
                                className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition hover:bg-foreground/90"
                            >
                                {locale === 'id'
                                    ? 'Kembali ke Beranda'
                                    : 'Back to Home'}
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    {locale === 'id'
                                        ? 'Unduh / Baca Online'
                                        : 'Download / Read Online'}
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    {showReadPdfButton ? (
                                        <a
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted"
                                        >
                                            {locale === 'id'
                                                ? 'Baca PDF'
                                                : 'Read PDF'}
                                        </a>
                                    ) : null}
                                    <a
                                        href={pdfDownloadUrl}
                                        className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background transition hover:bg-foreground/90"
                                    >
                                        {locale === 'id'
                                            ? 'Download PDF'
                                            : 'Download PDF'}
                                    </a>
                                </div>
                            </div>

                            <div className="my-6 h-px bg-border" />
                            {bodyHtml ? (
                                <div
                                    className="text-sm leading-relaxed text-muted-foreground sm:text-base [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
                                    dangerouslySetInnerHTML={{
                                        __html: bodyHtml,
                                    }}
                                />
                            ) : (
                                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {locale === 'id'
                                        ? 'Konten belum diisi.'
                                        : 'Content has not been filled in yet.'}
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </PublicLayout>
    );
}
