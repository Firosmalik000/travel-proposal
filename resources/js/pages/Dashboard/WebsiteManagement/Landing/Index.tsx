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

interface LandingPageItem {
    id: number;
    slug: string;
    title: string;
    excerpt?: string | null;
    content: Record<string, any>;
    is_active: boolean;
}

interface PackageOption {
    id: number;
    name: string;
    package_type?: string | null;
    duration_days?: number | null;
    departure_city?: string | null;
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
    home_landing: 'Website Utama (/)',
    home_landing_mockup: 'Landing Public (/landing)',
};

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
    home_landing: [
        'hero',
        'timeline',
        'problem',
        'services',
        'gallery',
        'packages',
        'testimonials',
        'articles',
        'faq',
        'contact',
    ],
    home_landing_mockup: [
        'hero',
        'services',
        'packages',
        'testimonials',
        'faq',
        'contact',
        'footer',
    ],
};

const sectionLabels: Record<string, string> = {
    hero: 'Hero + Statistik',
    timeline: 'Timeline Website',
    packages: 'Paket',
    testimonials: 'Testimoni',
    faq: 'FAQ',
    contact: 'Chat Admin',
    footer: 'Footer Landing',
    services: 'Keunggulan',
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
    { value: '', label: 'Tanpa ikon', preview: '○' },
    { value: 'hotel', label: 'Hotel', preview: '🏨' },
    { value: 'plane', label: 'Pesawat', preview: '✈️' },
    { value: 'images', label: 'Dokumentasi', preview: '🖼️' },
    { value: 'shield-check', label: 'Legal & Amanah', preview: '🛡️' },
    { value: 'users', label: 'Jamaah / Tim', preview: '👥' },
    { value: 'heart-handshake', label: 'Pendampingan', preview: '🤝' },
    { value: 'check-circle-2', label: 'Checklist', preview: '✅' },
    { value: 'credit-card', label: 'Pembayaran', preview: '💳' },
    { value: 'landmark', label: 'Kemenag / Legalitas', preview: '🏛️' },
    { value: 'calendar-days', label: 'Jadwal', preview: '📅' },
    { value: 'map-pin', label: 'Lokasi', preview: '📍' },
    { value: 'briefcase', label: 'Layanan', preview: '💼' },
    { value: 'building-2', label: 'Fasilitas', preview: '🏢' },
    { value: 'circle-dollar-sign', label: 'Biaya', preview: '💰' },
    { value: 'clipboard-list', label: 'List Dokumen', preview: '📝' },
    { value: 'file-check-2', label: 'Verifikasi', preview: '🧾' },
    { value: 'globe', label: 'Perjalanan', preview: '🌍' },
    { value: 'headset', label: 'Support', preview: '🎧' },
    { value: 'id-card', label: 'Identitas', preview: '🪪' },
    { value: 'luggage', label: 'Perlengkapan', preview: '🧳' },
    { value: 'message-circle', label: 'Konsultasi', preview: '💬' },
    { value: 'notebook-pen', label: 'Catatan Ibadah', preview: '📝' },
    { value: 'star', label: 'Unggulan', preview: '⭐' },
    { value: 'ticket', label: 'Tiket', preview: '🎫' },
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
                    {option.preview} {option.label}
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
                    <button type="button" className="mb-4 w-full text-left">
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
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function GroupCard({
    title,
    desc,
    children,
}: {
    title: string;
    desc?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-muted/10 p-4">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {desc ? (
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            ) : null}
            <div className="mt-3 space-y-4">{children}</div>
        </div>
    );
}

function buildDefaultLandingServiceItems(): Array<{
    image_path: string;
    title: string;
    icon: string;
    description: string;
}> {
    return [
        {
            image_path: '/images/dummy.jpg',
            title: 'Mutawif Berpengalaman',
            icon: 'heart-handshake',
            description:
                'Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.',
        },
        {
            image_path: '/images/dummy.jpg',
            title: 'Penerbangan Direct',
            icon: 'plane',
            description:
                'Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.',
        },
        {
            image_path: '/images/dummy.jpg',
            title: 'Free Dokumentasi',
            icon: 'images',
            description:
                'Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.',
        },
        {
            image_path: '/images/dummy.jpg',
            title: 'Legal & Amanah',
            icon: 'shield-check',
            description:
                'Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.',
        },
    ];
}

export default function LandingIndex({
    pages,
    editorType = 'landing',
    packageOptions = [],
}: {
    pages: LandingPageItem[];
    editorType?: 'landing' | 'website';
    packageOptions?: PackageOption[];
}) {
    const targetSlug =
        editorType === 'landing' ? 'home_landing_mockup' : 'home_landing';
    const visiblePages = pages
        .filter(
            (page) =>
                !hiddenLandingSlugs.has(page.slug) && page.slug === targetSlug,
        )
        .sort((leftPage, rightPage) => leftPage.id - rightPage.id);
    const defaultTab = visiblePages[0]?.slug ?? 'home';
    const isLandingEditor = editorType === 'landing';
    const editorLabel = isLandingEditor
        ? 'Landing Page Editor'
        : 'Website Page Editor';
    const editorPath = isLandingEditor
        ? '/admin/website-management/landing'
        : '/admin/website-management/website';

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Website Management', href: '#' },
                {
                    label: 'Landing Page Editor',
                    href: editorPath,
                },
            ]}
        >
            <Head title={editorLabel} />

            <div className="p-4 md:p-6">
                <Tabs defaultValue={defaultTab} className="space-y-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-xl font-bold">{editorLabel}</h1>
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
                            <LandingPageEditor
                                page={page}
                                packageOptions={packageOptions}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function LandingPageEditor({
    page,
    packageOptions,
}: {
    page: LandingPageItem;
    packageOptions: PackageOption[];
}) {
    const initialContent = normalizeLandingContentForEditor(
        page.slug,
        stripLocaleData(page.content ?? {}),
    );

    const { data, setData, post, processing } = useForm({
        title: page.title ?? '',
        excerpt: page.excerpt ?? '',
        content: initialContent,
        media: {} as Record<string, File | null>,
        is_active: page.is_active,
        _method: 'PATCH',
    });

    const contentSections = getOrderedContentSections(
        page.slug,
        data.content ?? {},
    );
    const previewUrl =
        page.slug === 'home_landing'
            ? '/'
            : page.slug === 'home_landing_mockup'
              ? '/landing'
              : `/${page.slug}`;
    const isHomePage =
        page.slug === 'home_landing' || page.slug === 'home_landing_mockup';
    const isLandingPage = page.slug === 'home_landing_mockup';
    const isLandingMockupEditor = page.slug === 'home_landing_mockup';
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
        const nextContent = normalizeLandingContentForEditor(
            page.slug,
            stripLocaleData(page.content ?? {}),
        );
        const normalizedContent =
            isLandingMockupEditor &&
            String(nextContent?.hero?.background?.type ?? '') === 'image'
                ? updateNestedValue(
                      nextContent,
                      'hero.background.type',
                      'default',
                  )
                : nextContent;
        setOpenSections(
            Object.fromEntries(
                contentSections.map(([sectionKey]) => [
                    sectionKey,
                    ['hero', 'timeline', 'problem'].includes(sectionKey),
                ]),
            ),
        );
        setActiveSection(contentSections[0]?.[0] ?? 'hero');
        setData((current) => ({
            ...current,
            content: normalizedContent,
            media: {},
        }));
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
        const hasMediaUpload = Object.values(data.media ?? {}).some(
            (file) => file instanceof File,
        );

        post(`/admin/website-management/content/${page.id}`, {
            forceFormData: hasMediaUpload,
            preserveScroll: true,
        });
    };

    if (isLandingMockupEditor) {
        return (
            <LandingMockupSectionedEditor
                page={page}
                packageOptions={packageOptions}
                data={data}
                processing={processing}
                previewUrl={previewUrl}
                onSubmit={submit}
                onSetData={(path, value) =>
                    setData((current) => ({
                        ...current,
                        content: updateNestedValue(
                            current.content,
                            path,
                            value,
                        ),
                    }))
                }
            />
        );
    }

    return (
        <form className="space-y-5" onSubmit={submit}>
            <div className="sticky top-3 z-30 rounded-2xl border border-border bg-background/90 p-3 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                            {pageLabels[page.slug] ??
                                humanizeSegment(page.slug)}
                        </span>
                        <span className="hidden sm:inline">-</span>
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
                            <Button type="button" variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                        </a>
                        {isLandingPage ? (
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

                {isLandingPage ? (
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
            {!isLandingMockupEditor ? (
                <>
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
                                        setData((current) => ({
                                            ...current,
                                            is_active: checked === true,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor={`active_${page.slug}`}
                                    className="cursor-pointer space-y-0.5"
                                >
                                    <p className="text-sm font-bold">
                                        Halaman Aktif
                                    </p>
                                    <p className="text-[0.65rem] text-muted-foreground">
                                        Tampil di website publik
                                    </p>
                                </Label>
                            </div>
                            <div className="flex flex-col justify-center gap-0.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                <p className="text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
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
                                    onChange={(e) =>
                                        setData((current) => ({
                                            ...current,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Contoh: Beranda Utama"
                                />
                            </Field>
                            <Field label="Ringkasan (Excerpt)">
                                <Textarea
                                    rows={2}
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData((current) => ({
                                            ...current,
                                            excerpt: e.target.value,
                                        }))
                                    }
                                    placeholder="Deskripsi singkat halaman ini..."
                                />
                            </Field>
                        </Row>
                    </Section>
                </>
            ) : null}

            {/* 3. Section Konten Dinamis */}
            <div
                className={
                    isHomePage
                        ? 'grid gap-5 lg:grid-cols-[16rem_1fr] lg:items-start'
                        : 'space-y-5'
                }
            >
                {isHomePage ? (
                    <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
                        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm">
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
                            sectionLabels[sectionKey] ??
                            humanizeSegment(sectionKey);
                        const desc = `Kelola konten ${label.toLowerCase()} untuk website.`;
                        const sectionId = `landing_${page.slug}_${sectionKey}`;
                        const isSectionOpen = openSections[sectionKey] ?? true;

                        if (sectionKey === 'stats') {
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
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                    />
                                </Section>
                            );
                        }

                        if (
                            page.slug === 'tentang-kami' &&
                            sectionKey === 'values'
                        ) {
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
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                    />
                                </Section>
                            );
                        }

                        if (isHomePage && sectionKey === 'services') {
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
                                                        data.content?.services
                                                            ?.label ?? '',
                                                    title:
                                                        data.content?.services
                                                            ?.title ?? '',
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
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        content:
                                                                            updateNestedValue(
                                                                                current.content,
                                                                                field.path,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <Input
                                                            value={field.value}
                                                            onChange={(e) =>
                                                                setData(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        content:
                                                                            updateNestedValue(
                                                                                current.content,
                                                                                field.path,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            ))}
                                        </Row>
                                        <ServiceItemsEditor
                                            content={data.content}
                                            media={data.media}
                                            setContent={(content) =>
                                                setData((current) => ({
                                                    ...current,
                                                    content,
                                                }))
                                            }
                                            setMedia={(media) =>
                                                setData((current) => ({
                                                    ...current,
                                                    media,
                                                }))
                                            }
                                        />
                                    </div>
                                </Section>
                            );
                        }

                        if (isHomePage && sectionKey === 'gallery') {
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
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                    />
                                </Section>
                            );
                        }

                        if (isHomePage && sectionKey === 'timeline') {
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
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                        setMedia={(media) =>
                                            setData((current) => ({
                                                ...current,
                                                media,
                                            }))
                                        }
                                    />
                                    <TimelineSectionEditor
                                        content={data.content}
                                        setContent={(content) =>
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                    />
                                </Section>
                            );
                        }

                        if (isHomePage && sectionKey === 'problem') {
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
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
                                        }
                                        setMedia={(media) =>
                                            setData((current) => ({
                                                ...current,
                                                media,
                                            }))
                                        }
                                    />
                                    <ProblemSectionEditor
                                        content={data.content}
                                        setContent={(content) =>
                                            setData((current) => ({
                                                ...current,
                                                content,
                                            }))
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
                            isHomePage && sectionKey === 'contact'
                                ? fields.filter(
                                      (field) =>
                                          field.path !==
                                              'contact.office_hours_label' &&
                                          field.path !==
                                              'contact.office_hours_lines',
                                  )
                                : fields;
                        const sectionFields = isLandingMockupEditor
                            ? visibleFields.filter((field) =>
                                  isLandingMockupFieldAllowed(field.path),
                              )
                            : visibleFields;
                        if (sectionFields.length === 0) {
                            return null;
                        }

                        const showOfficeHoursNotice =
                            isHomePage && sectionKey === 'contact';

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
                                        Jam operasional (office hours) sekarang
                                        diatur di{' '}
                                        <span className="font-medium text-foreground">
                                            Website Management -&gt; SEO
                                        </span>
                                        .
                                    </div>
                                ) : null}
                                <Row>
                                    {[
                                        ...sectionFields,
                                        ...(isLandingMockupEditor
                                            ? []
                                            : buildExtraSectionFields(
                                                  page.slug,
                                                  sectionKey,
                                                  data.content,
                                              )),
                                    ].map((field) => {
                                        if (isBackgroundTypeField(field.path)) {
                                            const isHeroBackgroundTypeField =
                                                field.path ===
                                                'hero.background.type';

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
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setData(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        content:
                                                                            updateNestedValue(
                                                                                current.content,
                                                                                field.path,
                                                                                value,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Default" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="default">
                                                                    Default
                                                                    (pakai
                                                                    desain
                                                                    sekarang)
                                                                </SelectItem>
                                                                <SelectItem value="color">
                                                                    Warna
                                                                </SelectItem>
                                                                {!(
                                                                    isLandingMockupEditor &&
                                                                    isHeroBackgroundTypeField
                                                                ) ? (
                                                                    <SelectItem value="image">
                                                                        Foto
                                                                    </SelectItem>
                                                                ) : null}
                                                            </SelectContent>
                                                        </Select>
                                                    </Field>
                                                </div>
                                            );
                                        }

                                        if (
                                            isBackgroundColorField(field.path)
                                        ) {
                                            const section =
                                                field.path.split('.')[0];
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
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            content:
                                                                                updateNestedValue(
                                                                                    current.content,
                                                                                    field.path,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        }),
                                                                    )
                                                                }
                                                                className="h-10 w-14 p-1"
                                                            />
                                                            <Input
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            content:
                                                                                updateNestedValue(
                                                                                    current.content,
                                                                                    field.path,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        }),
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
                                            if (
                                                isLandingMockupEditor &&
                                                (field.path === 'hero.image' ||
                                                    field.path ===
                                                        'hero.background.image')
                                            ) {
                                                return null;
                                            }

                                            const section =
                                                field.path.split('.')[0];
                                            const backgroundType = String(
                                                getNestedValue(
                                                    data.content,
                                                    `${section}.background.type`,
                                                ) ?? 'default',
                                            );

                                            if (
                                                field.path.endsWith(
                                                    '.background.image',
                                                ) &&
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
                                                                data.media[
                                                                    field.path
                                                                ] ?? null
                                                            }
                                                            onChange={(file) =>
                                                                setData(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        media: {
                                                                            ...current.media,
                                                                            [field.path]:
                                                                                file,
                                                                        },
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    </Field>
                                                </div>
                                            );
                                        }

                                        return (
                                            <Field
                                                key={field.path}
                                                label={field.label}
                                            >
                                                {field.multiline ? (
                                                    <Textarea
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            setData(
                                                                (current) => ({
                                                                    ...current,
                                                                    content:
                                                                        updateNestedValue(
                                                                            current.content,
                                                                            field.path,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }),
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <Input
                                                        value={field.value}
                                                        onChange={(e) =>
                                                            setData(
                                                                (current) => ({
                                                                    ...current,
                                                                    content:
                                                                        updateNestedValue(
                                                                            current.content,
                                                                            field.path,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }),
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

            <div className="flex justify-end pt-4 pb-8">
                <Button type="submit" disabled={processing} size="lg">
                    {processing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
            </div>
        </form>
    );
}

function ServiceItemsEditor({
    content,
    media,
    setContent,
    setMedia,
}: {
    content: Record<string, any>;
    media: Record<string, File | null>;
    setContent: (content: Record<string, any>) => void;
    setMedia: (media: Record<string, File | null>) => void;
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
                {
                    image_path: '/images/dummy.jpg',
                    title: '',
                    description: '',
                },
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
                            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
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
                            <Field label="Gambar">
                                <ImageField
                                    label={`Gambar layanan ${index + 1}`}
                                    value={String(
                                        getNestedValue(
                                            content,
                                            `services.items.${index}.image_path`,
                                        ) ?? '',
                                    )}
                                    file={
                                        media[
                                            `services.items.${index}.image_path`
                                        ] ?? null
                                    }
                                    onChange={(file) =>
                                        setMedia({
                                            ...media,
                                            [`services.items.${index}.image_path`]:
                                                file,
                                        })
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

function LandingMockupSectionedEditor({
    page,
    packageOptions,
    data,
    processing,
    previewUrl,
    onSubmit,
    onSetData,
}: {
    page: LandingPageItem;
    packageOptions: PackageOption[];
    data: {
        title: string;
        excerpt: string;
        content: Record<string, any>;
        media: Record<string, File | null>;
        is_active: boolean;
        _method: string;
    };
    processing: boolean;
    previewUrl: string;
    onSubmit: (event: React.FormEvent) => void;
    onSetData: (path: string, value: unknown) => void;
}) {
    const isFilled = (value: unknown): boolean =>
        String(value ?? '').trim().length > 0;
    const sectionNavigation = [
        { key: 'hero', label: 'Hero + Statistik' },
        { key: 'services', label: 'Keunggulan' },
        { key: 'packages', label: 'Paket' },
        { key: 'testimonials', label: 'Testimoni' },
        { key: 'faq', label: 'FAQ' },
        { key: 'cta', label: 'CTA' },
        { key: 'footer', label: 'Footer' },
    ] as const;
    const statItems = Array.isArray(data.content?.stats)
        ? data.content.stats
        : [];
    const serviceItems = Array.isArray(data.content?.services?.items)
        ? data.content.services.items
        : [];
    const selectedPackageIds = Array.isArray(
        data.content?.packages?.selected_package_ids,
    )
        ? data.content.packages.selected_package_ids
              .map((value: unknown) => Number(value))
              .filter((value: number) => Number.isFinite(value))
        : [];
    const heroTitleLines = String(data.content?.hero?.title ?? '')
        .split('\n')
        .map((line) => line.trim());

    const setHeroTitleLine = (lineIndex: number, value: string) => {
        const nextLines = [...heroTitleLines];
        while (nextLines.length < 4) {
            nextLines.push('');
        }
        nextLines[lineIndex] = value;
        onSetData(
            'hero.title',
            nextLines
                .map((line) => String(line ?? '').trim())
                .filter((line) => line !== '')
                .join('\n'),
        );
    };

    const addStatItem = () => {
        onSetData('stats', [
            ...statItems,
            {
                value: '',
                label: '',
            },
        ]);
    };

    const removeStatItem = (index: number) => {
        onSetData(
            'stats',
            statItems.filter(
                (_: unknown, itemIndex: number) => itemIndex !== index,
            ),
        );
    };

    const addServiceItem = () => {
        onSetData('services.items', [
            ...serviceItems,
            {
                title: '',
                icon: 'shield-check',
                description: '',
            },
        ]);
    };

    const removeServiceItem = (index: number) => {
        onSetData(
            'services.items',
            serviceItems.filter(
                (_: unknown, itemIndex: number) => itemIndex !== index,
            ),
        );
    };

    const restoreDefaultServiceItems = () => {
        onSetData('services.items', buildDefaultLandingServiceItems());
    };

    const togglePackageSelection = (packageId: number, checked: boolean) => {
        const alreadySelected = selectedPackageIds.includes(packageId);
        if (checked && alreadySelected) {
            return;
        }

        if (checked) {
            if (selectedPackageIds.length >= 3) {
                return;
            }

            onSetData('packages.selected_package_ids', [
                ...selectedPackageIds,
                packageId,
            ]);

            return;
        }

        onSetData(
            'packages.selected_package_ids',
            selectedPackageIds.filter((id: number) => id !== packageId),
        );
    };

    const sectionCompletion: Record<string, boolean> = {
        hero:
            isFilled(data.content?.hero?.label) &&
            isFilled(data.content?.hero?.title) &&
            isFilled(data.content?.hero?.description) &&
            isFilled(data.content?.hero?.cta_label),
        services:
            isFilled(data.content?.services?.title) &&
            serviceItems.filter((item: Record<string, any>) =>
                isFilled(item?.title),
            ).length >= 4,
        packages:
            isFilled(data.content?.packages?.title) &&
            isFilled(data.content?.packages?.heading),
        testimonials: isFilled(data.content?.testimonials?.heading),
        faq: isFilled(data.content?.faq?.title),
        cta:
            isFilled(data.content?.contact?.banner_title) &&
            isFilled(data.content?.contact?.whatsapp_label),
        footer:
            isFilled(data.content?.footer?.brand) &&
            isFilled(data.content?.footer?.copyright),
    };
    return (
        <form className="space-y-6 pb-10" onSubmit={onSubmit}>
            <div className="sticky top-3 z-30 rounded-2xl border border-border bg-background/95 p-4 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Landing Editor (/landing)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <Button type="button" variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview /landing
                            </Button>
                        </a>
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground"></div>

            <Section
                sectionId="landing-mockup-hero"
                icon={FileText}
                title="Hero + Statistik"
                desc="Mengubah judul utama, deskripsi, tombol hero, dan daftar statistik di area paling atas landing."
                actions={
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Wajib
                    </span>
                }
            >
                <GroupCard
                    title="Konten Hero"
                    desc="Isi mengikuti urutan tampilan paling atas landing."
                >
                    <Row>
                        <Field label="Label">
                            <Input
                                placeholder="Contoh: Hajj & Umrah Terpercaya"
                                value={String(data.content?.hero?.label ?? '')}
                                onChange={(e) =>
                                    onSetData('hero.label', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Judul Baris 1 (putih besar)"
                            hint="Bagian paling atas dari judul hero."
                        >
                            <Textarea
                                rows={2}
                                placeholder="Contoh: Perjalanan"
                                value={String(heroTitleLines[0] ?? '')}
                                onChange={(e) =>
                                    setHeroTitleLine(0, e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Judul Baris 2 (putih besar)"
                            hint="Lanjutan judul hero warna putih."
                        >
                            <Input
                                placeholder="Contoh: Menuju"
                                value={String(heroTitleLines[1] ?? '')}
                                onChange={(e) =>
                                    setHeroTitleLine(1, e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Judul Baris 3 (highlight kuning)"
                            hint="Bagian judul berwarna kuning/oranye."
                        >
                            <Input
                                placeholder="Contoh: Tanah Suci"
                                value={String(heroTitleLines[2] ?? '')}
                                onChange={(e) =>
                                    setHeroTitleLine(2, e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Judul Baris 4 (outline)"
                            hint="Bagian judul dengan efek outline."
                        >
                            <Input
                                placeholder="Contoh: Impian Anda"
                                value={String(heroTitleLines[3] ?? '')}
                                onChange={(e) =>
                                    setHeroTitleLine(3, e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Deskripsi">
                            <Textarea
                                rows={3}
                                placeholder="Deskripsi hero landing"
                                value={String(
                                    data.content?.hero?.description ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'hero.description',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Label Tombol Utama">
                            <Input
                                placeholder="Contoh: Konsultasi Gratis"
                                value={String(
                                    data.content?.hero?.cta_label ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData('hero.cta_label', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Label Tombol Kedua">
                            <Input
                                placeholder="Contoh: Lihat Paket ->"
                                value={String(
                                    data.content?.hero?.secondary_cta_label ??
                                        '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'hero.secondary_cta_label',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </Row>
                </GroupCard>
                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        Tambahkan statistik sesuai kebutuhan.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addStatItem}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Statistik
                    </Button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {statItems.map((_: unknown, index: number) => (
                        <div
                            key={index}
                            className="rounded-xl border border-border p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    Statistik {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-destructive hover:text-destructive"
                                    onClick={() => removeStatItem(index)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <Field label={`Nilai ${index + 1}`}>
                                <Input
                                    value={String(
                                        statItems[index]?.value ?? '',
                                    )}
                                    onChange={(e) =>
                                        onSetData(
                                            `stats.${index}.value`,
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label={`Label ${index + 1}`}>
                                <Input
                                    value={String(
                                        statItems[index]?.label ?? '',
                                    )}
                                    onChange={(e) =>
                                        onSetData(
                                            `stats.${index}.label`,
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                sectionId="landing-mockup-services"
                icon={Layers3}
                title="Keunggulan"
                desc="Mengubah judul keunggulan dan 4 kartu benefit yang tampil setelah area hero."
                actions={
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        4 Item
                    </span>
                }
            >
                <GroupCard
                    title="Heading Keunggulan"
                    desc="Isi berurutan: judul section, heading baris 1, kata merah, lalu heading baris 2."
                >
                    <Row>
                        <Field label="Judul">
                            <Textarea
                                rows={2}
                                placeholder="Contoh: Mengapa Asfar Tour"
                                value={String(
                                    data.content?.services?.title ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData('services.title', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Heading Baris 1"
                            hint="Contoh: Ibadah Lebih"
                        >
                            <Input
                                placeholder="Ibadah Lebih"
                                value={String(
                                    data.content?.services?.heading_top ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'services.heading_top',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label="Kata Merah Heading Keunggulan"
                            hint="Contoh: Bermakna"
                        >
                            <Input
                                placeholder="Bermakna"
                                value={String(
                                    data.content?.services?.heading_highlight ??
                                        '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'services.heading_highlight',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label="Heading Baris 2"
                            hint="Contoh: Bersama Kami"
                        >
                            <Input
                                placeholder="Bersama Kami"
                                value={String(
                                    data.content?.services?.heading_bottom ??
                                        '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'services.heading_bottom',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Deskripsi">
                            <Textarea
                                rows={3}
                                placeholder="Contoh: Kami tidak sekadar memberangkatkan..."
                                value={String(
                                    data.content?.services?.description ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'services.description',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </Row>
                </GroupCard>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        Item keunggulan bisa ditambah sesuai kebutuhan landing.
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={restoreDefaultServiceItems}
                        >
                            Gunakan Default
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addServiceItem}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Item
                        </Button>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {serviceItems.map((_: unknown, index: number) => (
                        <div
                            key={index}
                            className="rounded-xl border border-border p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    Item {index + 1}
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-destructive hover:text-destructive"
                                    onClick={() => removeServiceItem(index)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <Field label={`Judul Item ${index + 1}`}>
                                <Input
                                    value={String(
                                        serviceItems[index]?.title ?? '',
                                    )}
                                    onChange={(e) =>
                                        onSetData(
                                            `services.items.${index}.title`,
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label={`Icon Item ${index + 1}`}>
                                <IconSelect
                                    value={String(
                                        serviceItems[index]?.icon ?? '',
                                    )}
                                    onChange={(value) =>
                                        onSetData(
                                            `services.items.${index}.icon`,
                                            value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label={`Deskripsi Item ${index + 1}`}>
                                <Textarea
                                    rows={2}
                                    value={String(
                                        serviceItems[index]?.description ?? '',
                                    )}
                                    onChange={(e) =>
                                        onSetData(
                                            `services.items.${index}.description`,
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                sectionId="landing-mockup-packages"
                icon={FileText}
                title="Paket"
                desc="Atur judul section paket dan pilih maksimal 3 paket yang tampil di /landing."
                actions={
                    <a
                        href="/admin/product-management/packages"
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Kelola semua paket
                    </a>
                }
            >
                <GroupCard
                    title="Heading Section Paket"
                    desc="Ini teks yang tampil di atas kartu paket pada landing."
                >
                    <Row>
                        <Field label="Paket - Judul Kecil">
                            <Input
                                placeholder="Contoh: Pilihan Paket"
                                value={String(
                                    data.content?.packages?.title ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData('packages.title', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Paket - Judul Besar">
                            <Input
                                placeholder="Contoh: Paket Umrah Kami"
                                value={String(
                                    data.content?.packages?.heading ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'packages.heading',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Paket - Deskripsi">
                            <Textarea
                                rows={2}
                                placeholder="Contoh: Pilih paket yang sesuai dengan kebutuhan..."
                                value={String(
                                    data.content?.packages?.description ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'packages.description',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Label Tombol Lihat Paket Lainnya">
                            <Input
                                placeholder="Contoh: Lihat Paket Lainnya"
                                value={String(
                                    data.content?.packages
                                        ?.more_packages_label ?? '',
                                )}
                                onChange={(e) =>
                                    onSetData(
                                        'packages.more_packages_label',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </Row>
                </GroupCard>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                            Pilih Paket untuk Landing (Maksimal 3)
                        </p>
                        <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {selectedPackageIds.length}/3 dipilih
                        </span>
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Jika butuh lebih dari 3 paket, arahkan pengunjung ke
                        halaman{' '}
                        <span className="font-semibold text-foreground">
                            /paket-umroh
                        </span>
                        .
                    </p>
                    <div className="space-y-3">
                        {[0, 1, 2].map((slotIndex) => {
                            const slotValue = String(
                                selectedPackageIds[slotIndex] ?? '',
                            );
                            const selectedInOtherSlots = selectedPackageIds
                                .filter(
                                    (_: number, index: number) =>
                                        index !== slotIndex,
                                )
                                .map(String);

                            return (
                                <Field
                                    key={slotIndex}
                                    label={`Paket Pilihan ${slotIndex + 1}`}
                                >
                                    <Select
                                        value={slotValue}
                                        onValueChange={(value) => {
                                            const nextSlots = [
                                                selectedPackageIds[0] ?? null,
                                                selectedPackageIds[1] ?? null,
                                                selectedPackageIds[2] ?? null,
                                            ] as Array<number | null>;

                                            if (value === '__none__') {
                                                nextSlots[slotIndex] = null;
                                            } else {
                                                const nextId = Number(value);
                                                if (!Number.isFinite(nextId)) {
                                                    return;
                                                }

                                                for (
                                                    let index = 0;
                                                    index < nextSlots.length;
                                                    index += 1
                                                ) {
                                                    if (
                                                        index !== slotIndex &&
                                                        nextSlots[index] ===
                                                            nextId
                                                    ) {
                                                        nextSlots[index] = null;
                                                    }
                                                }

                                                nextSlots[slotIndex] = nextId;
                                            }

                                            onSetData(
                                                'packages.selected_package_ids',
                                                nextSlots.filter(
                                                    (item): item is number =>
                                                        typeof item ===
                                                        'number',
                                                ),
                                            );
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih paket" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                Tidak dipilih
                                            </SelectItem>
                                            {packageOptions.map((pkg) => {
                                                const optionValue = String(
                                                    pkg.id,
                                                );
                                                const isDisabled =
                                                    selectedInOtherSlots.includes(
                                                        optionValue,
                                                    ) &&
                                                    optionValue !== slotValue;

                                                return (
                                                    <SelectItem
                                                        key={pkg.id}
                                                        value={optionValue}
                                                        disabled={isDisabled}
                                                    >
                                                        {pkg.name} -{' '}
                                                        {pkg.package_type ??
                                                            'Reguler'}{' '}
                                                        -{' '}
                                                        {pkg.duration_days ??
                                                            '-'}{' '}
                                                        Hari -{' '}
                                                        {pkg.departure_city ??
                                                            '-'}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            );
                        })}
                        <p className="text-xs text-muted-foreground">
                            Pilih maksimal 3 paket dari dropdown di atas.
                        </p>
                    </div>
                </div>
            </Section>

            <Section
                sectionId="landing-mockup-testimonials"
                icon={FileText}
                title="Testimoni"
                desc="Mengubah heading section testimoni. Untuk isi testimoni, atur di menu Portal Content."
                actions={
                    <a
                        href="/admin/website-management/portal-content"
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Atur item di Portal Content
                    </a>
                }
            >
                <Row>
                    <Field label="Judul Testimoni">
                        <Input
                            value={String(
                                data.content?.testimonials?.heading ?? '',
                            )}
                            onChange={(e) =>
                                onSetData(
                                    'testimonials.heading',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                </Row>
            </Section>

            <Section
                sectionId="landing-mockup-faq"
                icon={FileText}
                title="FAQ"
                desc="Mengubah heading FAQ. Untuk daftar pertanyaan, atur di menu Portal Content."
                actions={
                    <a
                        href="/admin/website-management/portal-content"
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        Atur item di Portal Content
                    </a>
                }
            >
                <Row>
                    <Field label="Judul FAQ">
                        <Input
                            value={String(data.content?.faq?.title ?? '')}
                            onChange={(e) =>
                                onSetData('faq.title', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Deskripsi FAQ">
                        <Textarea
                            rows={2}
                            value={String(data.content?.faq?.description ?? '')}
                            onChange={(e) =>
                                onSetData('faq.description', e.target.value)
                            }
                        />
                    </Field>
                </Row>
            </Section>

            <Section
                sectionId="landing-mockup-cta"
                icon={FileText}
                title="CTA"
                desc="Mengubah area ajakan terakhir sebelum footer."
            >
                <Row>
                    <Field label="Kicker CTA">
                        <Input
                            value={String(
                                data.content?.contact?.banner_kicker ?? '',
                            )}
                            onChange={(e) =>
                                onSetData(
                                    'contact.banner_kicker',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Judul CTA">
                        <Textarea
                            rows={2}
                            value={String(
                                data.content?.contact?.banner_title ?? '',
                            )}
                            onChange={(e) =>
                                onSetData(
                                    'contact.banner_title',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Chat">
                        <Input
                            value={String(
                                data.content?.contact?.whatsapp_label ?? '',
                            )}
                            onChange={(e) =>
                                onSetData(
                                    'contact.whatsapp_label',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                </Row>
            </Section>

            <Section
                sectionId="landing-mockup-footer"
                icon={FileText}
                title="Footer"
                desc="Mengubah identitas footer paling bawah pada halaman /landing."
            >
                <Row>
                    <Field label="Brand Footer">
                        <Input
                            value={String(data.content?.footer?.brand ?? '')}
                            onChange={(e) =>
                                onSetData('footer.brand', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Subtitle Footer">
                        <Input
                            value={String(data.content?.footer?.subtitle ?? '')}
                            onChange={(e) =>
                                onSetData('footer.subtitle', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Copyright Footer">
                        <Input
                            value={String(
                                data.content?.footer?.copyright ?? '',
                            )}
                            onChange={(e) =>
                                onSetData('footer.copyright', e.target.value)
                            }
                        />
                    </Field>
                </Row>
            </Section>
        </form>
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
        nextContent.values = [...values, { title: '', description: '' }];
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
                            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
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

function normalizeLandingContentForEditor(
    pageSlug: string,
    content: Record<string, any>,
): Record<string, any> {
    if (!isLandingHomeSlug(pageSlug)) {
        return content;
    }

    const next = structuredClone(content ?? {});
    const hasConfiguredServiceItems = Array.isArray(next?.services?.items);
    const items = hasConfiguredServiceItems ? next.services.items : [];
    const totalItems = hasConfiguredServiceItems ? items.length : 4;

    if (!next.services) {
        next.services = {};
    }

    const headingTop = String(next.services.heading_top ?? '').trim();
    const headingHighlight = String(
        next.services.heading_highlight ?? '',
    ).trim();
    const headingBottom = String(next.services.heading_bottom ?? '').trim();
    const legacyHeading = String(next.services.heading ?? '').trim();
    const legacyHighlightWord = String(
        next.services.highlight_word ?? '',
    ).trim();

    if (!headingTop || !headingBottom || !headingHighlight) {
        const legacyLines = legacyHeading
            .split('\n')
            .map((line: string) => String(line ?? '').trim())
            .filter(Boolean);

        const resolvedHighlight =
            headingHighlight ||
            legacyHighlightWord ||
            (legacyLines.join(' ').includes('Bermakna') ? 'Bermakna' : '');

        const firstLine = legacyLines[0] ?? '';
        const secondLine = legacyLines[1] ?? '';

        const resolvedTop =
            headingTop ||
            (resolvedHighlight && firstLine.includes(resolvedHighlight)
                ? firstLine.replace(resolvedHighlight, '').trim()
                : firstLine);

        next.services.heading_top = resolvedTop || 'Ibadah Lebih';
        next.services.heading_highlight = resolvedHighlight || 'Bermakna';
        next.services.heading_bottom =
            headingBottom || secondLine || 'Bersama Kami';
    }

    const defaultServiceItems = buildDefaultLandingServiceItems();

    next.services.items = Array.from({ length: totalItems }, (_, index) => {
        const currentItem = items[index] ?? {};
        const defaults = defaultServiceItems[index];

        return {
            image_path: String(currentItem.image_path ?? '/images/dummy.jpg'),
            title: String(currentItem.title ?? defaults?.title ?? ''),
            icon: String(
                currentItem.icon ??
                    (index === 0
                        ? 'heart-handshake'
                        : index === 1
                          ? 'plane'
                          : index === 2
                            ? 'images'
                            : 'shield-check'),
            ),
            description: String(
                currentItem.description ?? defaults?.description ?? '',
            ),
        };
    });

    return next;
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
                                <span className="font-mono">
                                    {value || '-'}
                                </span>
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

function collectEditableFields(value: unknown, path: string): EditableField[] {
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
    if (isLandingHomeSlug(pageSlug)) {
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

    if (!isLandingHomeSlug(pageSlug) || sectionKey !== 'gallery') {
        return [];
    }

    return [];
}

function isLandingHomeSlug(pageSlug: string): boolean {
    return pageSlug === 'home_landing' || pageSlug === 'home_landing_mockup';
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
    const backgroundType = String(
        getNestedValue(content, typePath) ?? 'default',
    );

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
                            setContent(
                                updateNestedValue(content, typePath, value),
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
                                value={String(
                                    getNestedValue(content, colorPath) ?? '',
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
                                value={String(
                                    getNestedValue(content, imagePath) ?? '',
                                )}
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
                            Chip merah di section "Penting Diketahui".
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

function isLandingMockupFieldAllowed(path: string): boolean {
    const allowedPrefixes = [
        'hero.label',
        'hero.title',
        'hero.description',
        'hero.cta_label',
        'hero.secondary_cta_label',
        'hero.secondary_cta_href',
        'stats.',
        'services.label',
        'services.title',
        'services.description',
        'services.items.',
        'packages.heading',
        'packages.cta_label',
        'packages.detail_label',
        'packages.duration_suffix',
        'packages.discount_badge_label',
        'testimonials.heading',
        'testimonials.fallback_quote',
        'faq.title',
        'faq.description',
        'contact.banner_kicker',
        'contact.banner_title',
        'contact.whatsapp_label',
        'contact.secondary_label',
        'contact.secondary_href',
        'contact.address_label',
        'contact.contact_info_label',
        'contact.description',
        'footer.brand',
        'footer.subtitle',
        'footer.copyright',
        'packages.title',
        'packages.description',
        'testimonials.title',
        'testimonials.description',
        'testimonials.prev_label',
        'testimonials.next_label',
        'testimonials.featured_label',
    ];

    if (!allowedPrefixes.some((prefix) => path.startsWith(prefix))) {
        return false;
    }

    const blockedExactPaths = new Set([
        'hero.image',
        'hero.background.image',
        'hero.background.image_primary',
        'hero.background.image_secondary',
        'contact.banner_image',
        'contact.office_hours_label',
        'contact.office_hours_lines',
    ]);

    if (blockedExactPaths.has(path)) {
        return false;
    }

    if (path.startsWith('hero.background.') && path.endsWith('.image')) {
        return false;
    }

    if (path.includes('.background.')) {
        return false;
    }

    return true;
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
