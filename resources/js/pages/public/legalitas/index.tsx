import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    localize,
    usePublicData,
    usePublicPageContent,
} from '@/lib/public-content';
import { Head } from '@inertiajs/react';

export default function Legalitas() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const page = usePublicPageContent('legalitas');
    const legalDocuments = Array.isArray(publicData.legal_documents)
        ? publicData.legal_documents
        : [];
    const bankLines = Array.isArray(page?.content?.bank_lines)
        ? page.content.bank_lines
        : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, 'Legalitas')}>
                <meta
                    name="description"
                    content={localize(
                        page?.excerpt,
                        locale,
                        'Informasi legalitas travel',
                    )}
                />
            </Head>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                        {localize(page?.content?.hero?.badge, locale, 'Legal')}
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(
                            page?.content?.hero?.title,
                            locale,
                            'Legalitas & Perizinan',
                        )}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {localize(page?.content?.hero?.description, locale, '')}
                    </p>
                </div>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                <MotionGroup className="grid gap-6 md:grid-cols-2">
                    {legalDocuments.map((item: Record<string, unknown>) => (
                        <MotionCard
                            key={`${item.document_number}`}
                            className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm"
                        >
                            <h3 className="public-heading text-lg font-semibold text-foreground">
                                {localize(item.title, locale)}
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>{String(item.document_number || '-')}</li>
                                <li>{localize(item.issued_by, locale)}</li>
                                <li>{localize(item.description, locale)}</li>
                            </ul>
                        </MotionCard>
                    ))}
                </MotionGroup>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">
                    {localize(
                        page?.content?.docs_title,
                        locale,
                        'Dokumen Legalitas',
                    )}
                </h2>
                <MotionGroup className="mt-6 grid gap-4 md:grid-cols-3">
                    {legalDocuments.map((item: Record<string, unknown>) => (
                        <MotionCard
                            key={`doc_${item.document_number}`}
                            className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm font-semibold text-muted-foreground"
                        >
                            {localize(item.title, locale)}
                        </MotionCard>
                    ))}
                </MotionGroup>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">
                    {localize(
                        page?.content?.bank_title,
                        locale,
                        'Rekening Resmi',
                    )}
                </h2>
                <MotionCard className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    {bankLines.map((line: unknown, index: number) => (
                        <p key={index}>{localize(line, locale)}</p>
                    ))}
                </MotionCard>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">
                    {localize(
                        page?.content?.disclaimer_title,
                        locale,
                        'Disclaimer',
                    )}
                </h2>
                <MotionCard className="mt-4 rounded-2xl border border-border bg-accent/30 p-5 text-sm text-foreground">
                    {localize(page?.content?.disclaimer, locale)}
                </MotionCard>
            </MotionSection>
        </PublicLayout>
    );
}
