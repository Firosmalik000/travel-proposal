import { Button } from '@/components/ui/button'; 
import { Checkbox } from '@/components/ui/checkbox'; 
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Textarea } from '@/components/ui/textarea'; 
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    Eye,
    FileText,
    Globe,
    Image as ImageIcon,
    Layers3,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LandingPageItem {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    content: Record<string, any>;
    is_active: boolean;
}

interface EditableField { 
    path: string; 
    label: string; 
    multiline: boolean; 
    value: string; 
} 

type BackgroundType = 'default' | 'color' | 'image';

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
        'timeline',
        'problem',
        'packages',
        'services',
        'gallery',
        'testimonials',
        'articles',
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
    timeline: 'Timeline & Value',
    problem: 'Penting Diketahui',
    about: 'Tentang Kami',
    packages: 'Paket Unggulan',
    services: 'Layanan Kami',
    gallery: 'Galeri Foto',
    testimonials: 'Testimoni',
    articles: 'News / Artikel',
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

const iconOptions = [
    { value: '', label: 'Tanpa ikon' },
    { value: 'users', label: 'Users' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'check-circle-2', label: 'Check Circle' },
    { value: 'plane', label: 'Plane' },
    { value: 'landmark', label: 'Landmark' },
    { value: 'calendar-days', label: 'Calendar' },
    { value: 'shield-check', label: 'Shield Check' },
    { value: 'heart-handshake', label: 'Handshake' },
    { value: 'map-pin', label: 'Map Pin' },
] as const;

function IconSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

function Section({
    icon: Icon,
    title,
    desc,
    children,
    collapsible = false,
    open,
    onOpenChange,
    sectionId,
    actions,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    children: React.ReactNode;
    collapsible?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    sectionId?: string;
    actions?: React.ReactNode;
}) {
    const header = (
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {collapsible ? (
                    <ChevronDown
                        className={`mt-1 h-4 w-4 text-muted-foreground transition ${open ? 'rotate-180' : ''}`}
                    />
                ) : null}
            </div>
        </div>
    );

    if (!collapsible) {
        return (
            <div
                id={sectionId}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
                <div className="mb-4">{header}</div>
                <div className="space-y-4">{children}</div>
            </div>
        );
    }

    return (
        <Collapsible
            open={Boolean(open)}
            onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}
        >
            <div
                id={sectionId}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="mb-4 w-full text-left"
                    >
                        {header}
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="space-y-4">{children}</div>
                </CollapsibleContent>
            </div>
        </Collapsible>
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
                            <div className="rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                Bahasa: Indonesia
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
    const { data, setData, post, processing } = useForm({
        title: page.title ?? '',
        excerpt: page.excerpt ?? '',
        content: stripLocaleData(page.content ?? {}),
        media: {} as Record<string, File | null>,
        is_active: page.is_active,
        _method: 'PATCH',
    });

    const contentSections = getOrderedContentSections(
        page.slug,
        data.content ?? {},
    );
    const isHomePage = page.slug === 'home';
    const previewUrl = isHomePage ? '/' : `/${page.slug}`;
    const [activeSection, setActiveSection] = useState<string>(
        contentSections[0]?.[0] ?? 'hero',
    );
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(
        () =>
            Object.fromEntries(
                contentSections.map(([sectionKey]) => [
                    sectionKey,
                    ['hero', 'timeline', 'problem'].includes(sectionKey),
                ]),
            ),
    );

    useEffect(() => {
        setOpenSections(
            Object.fromEntries(
                contentSections.map(([sectionKey]) => [
                    sectionKey,
                    ['hero', 'timeline', 'problem'].includes(sectionKey),
                ]),
            ),
        );
        setActiveSection(contentSections[0]?.[0] ?? 'hero');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);

    const scrollToSection = (sectionKey: string) => {
        const elementId = `landing_${page.slug}_${sectionKey}`;
        const element =
            typeof document !== 'undefined'
                ? document.getElementById(elementId)
                : null;

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        setActiveSection(sectionKey);
        setOpenSections((current) => ({ ...current, [sectionKey]: true }));
    };

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
            <div className="sticky top-3 z-30 rounded-2xl border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                            {pageLabels[page.slug] ?? humanizeSegment(page.slug)}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                            Editor konten halaman
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </a>
                        {isHomePage ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setOpenSections(
                                            Object.fromEntries(
                                                contentSections.map(
                                                    ([sectionKey]) => [
                                                        sectionKey,
                                                        false,
                                                    ],
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    Tutup Semua
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setOpenSections(
                                            Object.fromEntries(
                                                contentSections.map(
                                                    ([sectionKey]) => [
                                                        sectionKey,
                                                        true,
                                                    ],
                                                ),
                                            ),
                                        )
                                    }
                                >
                                    Buka Semua
                                </Button>
                            </>
                        ) : null}
                        <Button type="submit" disabled={processing} size="sm">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </div>

                {isHomePage ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {contentSections.map(([sectionKey]) => {
                            const label =
                                sectionLabels[sectionKey] ??
                                humanizeSegment(sectionKey);

                            const isActive = activeSection === sectionKey;

                            return (
                                <button
                                    key={sectionKey}
                                    type="button"
                                    onClick={() => scrollToSection(sectionKey)}
                                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                        isActive
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/45'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </div>
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
                desc="Judul dan ringkasan halaman untuk website."
            >
                <Row>
                    <Field label="Judul Halaman">
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Beranda Utama"
                        />
                    </Field>
                    <Field label="Ringkasan (Excerpt)">
                        <Textarea
                            rows={2}
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            placeholder="Deskripsi singkat halaman ini..."
                        />
                    </Field>
                </Row>
            </Section>

            {/* 3. Section Konten Dinamis */}
            <div
                className={
                    isHomePage
                        ? 'grid gap-5 lg:grid-cols-[16rem_1fr] lg:items-start'
                        : 'space-y-5'
                }
            >
                {isHomePage ? (
                    <div className="hidden lg:block">
                        <div className="sticky top-28 rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <p className="text-xs font-bold tracking-[0.24em] text-muted-foreground uppercase">
                                Navigasi Section
                            </p>
                            <div className="mt-3 space-y-1">
                                {contentSections.map(([sectionKey]) => {
                                    const label =
                                        sectionLabels[sectionKey] ??
                                        humanizeSegment(sectionKey);
                                    const isActive =
                                        activeSection === sectionKey;

                                    return (
                                        <button
                                            key={sectionKey}
                                            type="button"
                                            onClick={() =>
                                                scrollToSection(sectionKey)
                                            }
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-foreground hover:bg-muted/40'
                                            }`}
                                        >
                                            <span className="truncate">
                                                {label}
                                            </span>
                                            <span className="text-xs opacity-75">
                                                {openSections[sectionKey]
                                                    ? 'Buka'
                                                    : 'Tutup'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className={isHomePage ? 'space-y-5' : ''}>
                    {contentSections.map(([sectionKey, sectionValue]) => {
                const label =
                    sectionLabels[sectionKey] ?? humanizeSegment(sectionKey);
                const desc = `Kelola konten ${label.toLowerCase()} untuk website.`;
                const sectionId = `landing_${page.slug}_${sectionKey}`;
                const isSectionOpen = openSections[sectionKey] ?? true;

                if (page.slug === 'tentang-kami' && sectionKey === 'stats') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                            sectionId={sectionId}
                        >
                            <StatsSectionEditor
                                content={data.content}
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
                            sectionId={sectionId}
                        >
                            <ValuesSectionEditor
                                content={data.content}
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
                            sectionId={sectionId}
                            collapsible
                            open={isSectionOpen}
                            onOpenChange={(nextOpen) =>
                                setOpenSections((current) => ({
                                    ...current,
                                    [sectionKey]: nextOpen,
                                }))
                            }
                        >
                            <div className="space-y-5">
                                <Row>
                                    {collectEditableFields(
                                        {
                                            label:
                                                data.content?.services?.label ??
                                                '',
                                            title:
                                                data.content?.services?.title ??
                                                '',
                                            description:
                                                data.content?.services
                                                    ?.description ?? '',
                                        },
                                        'services',
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
                            sectionId={sectionId}
                            collapsible
                            open={isSectionOpen}
                            onOpenChange={(nextOpen) =>
                                setOpenSections((current) => ({
                                    ...current,
                                    [sectionKey]: nextOpen,
                                }))
                            }
                        >
                            <GallerySectionEditor
                                content={data.content}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                            />
                        </Section>
                    );
                }

                if (page.slug === 'home' && sectionKey === 'timeline') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                            sectionId={sectionId}
                            collapsible
                            open={isSectionOpen}
                            onOpenChange={(nextOpen) =>
                                setOpenSections((current) => ({
                                    ...current,
                                    [sectionKey]: nextOpen,
                                }))
                            }
                        >
                            <SectionBackgroundEditor
                                sectionKey={sectionKey}
                                content={data.content}
                                media={data.media}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                                setMedia={(media) => setData('media', media)}
                            />
                            <TimelineSectionEditor
                                content={data.content}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                            />
                        </Section>
                    );
                }

                if (page.slug === 'home' && sectionKey === 'problem') {
                    return (
                        <Section
                            key={sectionKey}
                            icon={Layers3}
                            title={label}
                            desc={desc}
                            sectionId={sectionId}
                            collapsible
                            open={isSectionOpen}
                            onOpenChange={(nextOpen) =>
                                setOpenSections((current) => ({
                                    ...current,
                                    [sectionKey]: nextOpen,
                                }))
                            }
                        >
                            <SectionBackgroundEditor
                                sectionKey={sectionKey}
                                content={data.content}
                                media={data.media}
                                setContent={(content) =>
                                    setData('content', content)
                                }
                                setMedia={(media) => setData('media', media)}
                            />
                            <ProblemSectionEditor
                                content={data.content}
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
                );

                const visibleFields = 
                    page.slug === 'home' && sectionKey === 'contact' 
                        ? fields.filter( 
                              (field) => 
                                  field.path !== 'contact.office_hours_label' && 
                                  field.path !== 
                                      'contact.office_hours_lines', 
                          ) 
                        : fields; 
                if (visibleFields.length === 0) { 
                    return null; 
                } 

                const showOfficeHoursNotice =
                    page.slug === 'home' && sectionKey === 'contact';
 
                return ( 
                    <Section 
                        key={sectionKey} 
                        icon={FileText} 
                        title={label} 
                        desc={desc} 
                        sectionId={sectionId}
                        collapsible={isHomePage}
                        open={isHomePage ? isSectionOpen : undefined}
                        onOpenChange={
                            isHomePage
                                ? (nextOpen) =>
                                      setOpenSections((current) => ({
                                          ...current,
                                          [sectionKey]: nextOpen,
                                      }))
                                : undefined
                        }
                    > 
                        {showOfficeHoursNotice ? (
                            <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Jam operasional (office hours) sekarang diatur di{' '}
                                <span className="font-medium text-foreground">
                                    Website Management -&gt; SEO
                                </span>
                                .
                            </div>
                        ) : null}
                        <Row> 
                            {[ 
                                ...visibleFields, 
                                ...buildExtraSectionFields( 
                                    page.slug, 
                                    sectionKey,
                                    data.content,
                                ),
                            ].map((field) => {
                                if (isBackgroundTypeField(field.path)) {
                                    return (
                                        <div
                                            key={field.path}
                                            className="sm:col-span-2"
                                        >
                                            <Field label={field.label}>
                                                <Select
                                                    value={
                                                        (field.value as BackgroundType) ??
                                                        'default'
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'content',
                                                            updateNestedValue(
                                                                data.content,
                                                                field.path,
                                                                value,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Default" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="default">
                                                            Default (pakai desain sekarang)
                                                        </SelectItem>
                                                        <SelectItem value="color">
                                                            Warna
                                                        </SelectItem>
                                                        <SelectItem value="image">
                                                            Foto
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        </div>
                                    );
                                }

                                if (isBackgroundColorField(field.path)) {
                                    const section = field.path.split('.')[0];
                                    const backgroundType = String(
                                        getNestedValue(
                                            data.content,
                                            `${section}.background.type`,
                                        ) ?? 'default',
                                    );

                                    if (backgroundType !== 'color') {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={field.path}
                                            className="sm:col-span-2"
                                        >
                                            <Field label={field.label}>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="color"
                                                        value={
                                                            field.value ||
                                                            '#ffffff'
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'content',
                                                                updateNestedValue(
                                                                    data.content,
                                                                    field.path,
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="h-10 w-14 p-1"
                                                    />
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            setData(
                                                                'content',
                                                                updateNestedValue(
                                                                    data.content,
                                                                    field.path,
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="#fff7ef"
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                    );
                                }

                                if (isImageField(field.path)) {
                                    const section = field.path.split('.')[0];
                                    const backgroundType = String(
                                        getNestedValue(
                                            data.content,
                                            `${section}.background.type`,
                                        ) ?? 'default',
                                    );

                                    if (
                                        field.path.endsWith('.background.image') &&
                                        backgroundType !== 'image'
                                    ) {
                                        return null;
                                    }

                                    return (
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
                                    );
                                }

                                return (
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
                                );
                            })}
                        </Row> 
                    </Section> 
                ); 
            })}
                </div>
            </div>

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
    setContent,
}: {
    content: Record<string, any>;
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
                { icon: '', title: '', description: '' },
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
                            <Field label="Ikon">
                                <IconSelect
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `services.items.${index}.icon`,
                                        ) ?? '',
                                    )}
                                    onChange={(value) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `services.items.${index}.icon`,
                                                value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Judul">
                                <Input
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `services.items.${index}.title`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `services.items.${index}.title`,
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
                                            `services.items.${index}.description`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `services.items.${index}.description`,
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
    setContent,
}: {
    content: Record<string, any>;
    setContent: (content: Record<string, any>) => void;
}) {
    const values = Array.isArray(content?.values) ? content.values : [];

    const addValue = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.values = [
            ...values,
            { title: '', description: '' },
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
                                            `values.${index}.title`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `values.${index}.title`,
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
                                            `values.${index}.description`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `values.${index}.description`,
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
    setContent,
}: {
    content: Record<string, any>;
    setContent: (content: Record<string, any>) => void;
}) {
    const stats = Array.isArray(content?.stats) ? content.stats : [];

    const addStat = () => {
        const nextContent = structuredClone(content ?? {});
        nextContent.stats = [
            ...stats,
            {
                value: '',
                label: '',
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
                                            `stats.${index}.label`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `stats.${index}.label`,
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
    setContent,
}: {
    content: Record<string, any>;
    setContent: (content: Record<string, any>) => void;
}) {
    const baseFields = collectEditableFields(
        {
            title: content?.gallery?.title ?? '',
            description: content?.gallery?.description ?? '',
        },
        'gallery',
    );

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

            <div className="rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                Foto galeri di homepage sekarang terpusat dari menu{' '}
                <span className="font-semibold text-foreground">Gallery</span>{' '}
                (3 foto pertama), jadi tidak perlu input foto di sini.
            </div>
        </div>
    );
}

function collectEditableFields(
    value: unknown,
    path: string,
): EditableField[] {
    if (value === null || value === undefined) {
        return [];
    }

    if (isLocalizedRecord(value)) {
        const localizedValue = String(value.id ?? '');

        return [
            {
                path,
                label: humanizePath(path),
                multiline: shouldUseTextarea(path, localizedValue),
                value: localizedValue,
            },
        ];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item, index) =>
            collectEditableFields(item, `${path}.${index}`),
        );
    }

    if (typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).flatMap(
            ([key, nestedValue]) =>
                collectEditableFields(nestedValue, `${path}.${key}`),
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
): EditableField[] { 
    if (pageSlug === 'home') {
        const typeValue = String(
            getNestedValue(content, `${sectionKey}.background.type`) ??
                'default',
        );
        const colorValue = String(
            getNestedValue(content, `${sectionKey}.background.color`) ?? '',
        );
        const imageValue = String(
            getNestedValue(content, `${sectionKey}.background.image`) ?? '',
        );

        return [
            {
                path: `${sectionKey}.background.type`,
                label: 'Background',
                multiline: false,
                value: typeValue,
            },
            {
                path: `${sectionKey}.background.color`,
                label: 'Background Color',
                multiline: false,
                value: colorValue,
            },
            {
                path: `${sectionKey}.background.image`,
                label: 'Background Image',
                multiline: false,
                value: imageValue,
            },
        ];
    }

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
 
    return []; 
} 

function SectionBackgroundEditor({
    sectionKey,
    content,
    media,
    setContent,
    setMedia,
}: {
    sectionKey: string;
    content: Record<string, any>;
    media: Record<string, File | null>;
    setContent: (content: Record<string, any>) => void;
    setMedia: (media: Record<string, File | null>) => void;
}) {
    const typePath = `${sectionKey}.background.type`;
    const colorPath = `${sectionKey}.background.color`;
    const imagePath = `${sectionKey}.background.image`;
    const backgroundType = String(getNestedValue(content, typePath) ?? 'default');

    return (
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Background
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Mode">
                    <Select
                        value={(backgroundType as BackgroundType) ?? 'default'}
                        onValueChange={(value) =>
                            setContent(updateNestedValue(content, typePath, value))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Default" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">
                                Default (pakai desain sekarang)
                            </SelectItem>
                            <SelectItem value="color">Warna</SelectItem>
                            <SelectItem value="image">Foto</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                {backgroundType === 'color' ? (
                    <Field label="Warna">
                        <div className="flex items-center gap-3">
                            <Input
                                type="color"
                                value={String(
                                    getNestedValue(content, colorPath) ??
                                        '#ffffff',
                                )}
                                onChange={(e) =>
                                    setContent(
                                        updateNestedValue(
                                            content,
                                            colorPath,
                                            e.target.value,
                                        ),
                                    )
                                }
                                className="h-10 w-14 p-1"
                            />
                            <Input
                                value={String(getNestedValue(content, colorPath) ?? '')}
                                onChange={(e) =>
                                    setContent(
                                        updateNestedValue(
                                            content,
                                            colorPath,
                                            e.target.value,
                                        ),
                                    )
                                }
                                placeholder="#fff7ef"
                            />
                        </div>
                    </Field>
                ) : null}

                {backgroundType === 'image' ? (
                    <div className="sm:col-span-2">
                        <Field label="Foto Background">
                            <ImageField
                                label="Background Image"
                                value={String(getNestedValue(content, imagePath) ?? '')}
                                file={media[imagePath] ?? null}
                                onChange={(file) =>
                                    setMedia({
                                        ...media,
                                        [imagePath]: file,
                                    })
                                }
                            />
                        </Field>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function TimelineSectionEditor({
    content,
    setContent,
}: {
    content: Record<string, any>;
    setContent: (content: Record<string, any>) => void;
}) {
    const baseFields = collectEditableFields(
        {
            label: content?.timeline?.label ?? '',
            heading: content?.timeline?.heading ?? '',
        },
        'timeline',
    );
    const steps = Array.isArray(content?.timeline?.steps)
        ? content.timeline.steps
        : [];
    const valueCards = Array.isArray(content?.timeline?.value_cards)
        ? content.timeline.value_cards
        : [];

    const addStep = () => {
        setContent(
            updateNestedValue(content, 'timeline.steps', [
                ...steps,
                { icon: '', caption: '', title: '', description: '' },
            ]),
        );
    };

    const removeStep = (index: number) => {
        setContent(
            updateNestedValue(
                content,
                'timeline.steps',
                steps.filter((_: unknown, i: number) => i !== index),
            ),
        );
    };

    const addValueCard = () => {
        setContent(
            updateNestedValue(content, 'timeline.value_cards', [
                ...valueCards,
                { icon: '', title: '', description: '' },
            ]),
        );
    };

    const removeValueCard = (index: number) => {
        setContent(
            updateNestedValue(
                content,
                'timeline.value_cards',
                valueCards.filter((_: unknown, i: number) => i !== index),
            ),
        );
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

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">Step Timeline</p>
                        <p className="text-xs text-muted-foreground">
                            Judul, caption, dan deskripsi tiap langkah.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addStep}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Step
                    </Button>
                </div>
                <div className="space-y-2">
                    {steps.map((_: unknown, index: number) => (
                        <div
                            key={`timeline_step_${index}`}
                            className="space-y-3 rounded-xl border border-border bg-muted/10 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold">
                                    Step {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStep(index)}
                                    className="h-8 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Row>
                                <Field label="Ikon">
                                    <IconSelect
                                        value={String(
                                            getNestedValue(
                                                content,
                                                `timeline.steps.${index}.icon`,
                                            ) ?? '',
                                        )}
                                        onChange={(value) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.steps.${index}.icon`,
                                                    value,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Caption (kecil)">
                                    <Input
                                        value={String(
                                            getNestedValue(
                                                content,
                                                `timeline.steps.${index}.caption`,
                                            ) ?? '',
                                        )}
                                        onChange={(e) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.steps.${index}.caption`,
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Judul">
                                    <Input
                                        value={String(
                                            getNestedValue(
                                                content,
                                                `timeline.steps.${index}.title`,
                                            ) ?? '',
                                        )}
                                        onChange={(e) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.steps.${index}.title`,
                                                    e.target.value,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                            </Row>
                            <Field label="Deskripsi">
                                <Textarea
                                    rows={2}
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `timeline.steps.${index}.description`,
                                        ) ?? '',
                                    )}
                                    onChange={(e) =>
                                        setContent(
                                            updateNestedValue(
                                                content,
                                                `timeline.steps.${index}.description`,
                                                e.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">Value Cards</p>
                        <p className="text-xs text-muted-foreground">
                            4 kartu nilai di bawah timeline.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addValueCard}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Card
                    </Button>
                </div>
                <div className="space-y-2">
                    {valueCards.map((_: unknown, index: number) => (
                        <div
                            key={`timeline_value_${index}`}
                            className="space-y-3 rounded-xl border border-border bg-muted/10 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold">
                                    Card {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeValueCard(index)}
                                    className="h-8 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Row>
                                <Field label="Ikon">
                                    <IconSelect
                                        value={String(
                                            getNestedValue(
                                                content,
                                                `timeline.value_cards.${index}.icon`,
                                            ) ?? '',
                                        )}
                                        onChange={(value) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.value_cards.${index}.icon`,
                                                    value,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Judul">
                                    <Input
                                        value={String(
                                            getNestedValue(
                                                content,
                                                `timeline.value_cards.${index}.title`,
                                            ) ?? '',
                                        )}
                                        onChange={(e) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.value_cards.${index}.title`,
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
                                                `timeline.value_cards.${index}.description`,
                                            ) ?? '',
                                        )}
                                        onChange={(e) =>
                                            setContent(
                                                updateNestedValue(
                                                    content,
                                                    `timeline.value_cards.${index}.description`,
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
        </div>
    );
}

function ProblemSectionEditor({
    content,
    setContent,
}: {
    content: Record<string, any>;
    setContent: (content: Record<string, any>) => void;
}) {
    const baseFields = collectEditableFields(
        {
            label: content?.problem?.label ?? '',
            heading: content?.problem?.heading ?? '',
            quote: content?.problem?.quote ?? '',
        },
        'problem',
    );
    const badges = Array.isArray(content?.problem?.badges)
        ? content.problem.badges
        : [];

    const addBadge = () => {
        setContent(
            updateNestedValue(content, 'problem.badges', [...badges, '']),
        );
    };

    const removeBadge = (index: number) => {
        setContent(
            updateNestedValue(
                content,
                'problem.badges',
                badges.filter((_: unknown, i: number) => i !== index),
            ),
        );
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

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold">Badge Masalah</p>
                        <p className="text-xs text-muted-foreground">
                            Chip merah di section “Penting Diketahui”.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBadge}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Badge
                    </Button>
                </div>
                <div className="space-y-2">
                    {badges.map((_: unknown, index: number) => (
                        <div
                            key={`problem_badge_${index}`}
                            className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-3"
                        >
                            <Input
                                value={String(
                                    getNestedValue(
                                        content,
                                        `problem.badges.${index}`,
                                    ) ?? '',
                                )}
                                onChange={(e) =>
                                    setContent(
                                        updateNestedValue(
                                            content,
                                            `problem.badges.${index}`,
                                            e.target.value,
                                        ),
                                    )
                                }
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBadge(index)}
                                className="h-8 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
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

function stripLocaleData(value: unknown): any {
    if (value === null || value === undefined) {
        return value;
    }

    if (isLocalizedRecord(value)) {
        return String(value.id ?? '');
    }

    if (Array.isArray(value)) {
        return value.map((item) => stripLocaleData(item));
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [
                k,
                stripLocaleData(v),
            ]),
        );
    }

    return value;
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
        path.endsWith('.background.image') ||
        path.endsWith('.src') 
    ); 
} 

function isBackgroundTypeField(path: string): boolean {
    return path.endsWith('.background.type');
}

function isBackgroundColorField(path: string): boolean {
    return path.endsWith('.background.color');
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
