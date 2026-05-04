import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Box,
    CalendarDays,
    ClipboardList,
    Eye,
    FileText,
    Filter,
    MapPin,
    Pencil,
    Plus,
    Search,
    Sparkles,
    SquarePen,
    Trash2,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// --- TYPES ---
interface ResourceItem {
    id: number;
    title: string;
    payload: Record<string, any>;
}
interface ResourceSection {
    key: string;
    label: string;
    description: string;
    template: Record<string, any>;
    meta?: Record<string, any>;
    items: ResourceItem[];
}
interface StaticPageSection {
    id: number | null;
    slug: string;
    label: string;
    description: string;
    title: string;
    excerpt: string;
    content: Record<string, any>;
    content_json: string;
    is_active: boolean;
}
type Option = { label: string; value: string };
type FieldDefinition = {
    path: string;
    label: string;
    type:
        | 'text'
        | 'date'
        | 'textarea'
        | 'number'
        | 'checkbox'
        | 'select'
        | 'localized-text'
        | 'localized-textarea'
        | 'localized-list'
        | 'code-list'
        | 'product-selector'
        | 'itinerary'
        | 'image';
    description?: string;
    options?: Option[];
    optionsKey?: string;
    min?: number;
    step?: number;
};
type ProductOption = {
    code: string;
    name: Record<string, unknown> | string;
    product_type: string;
    is_active: boolean;
};
type ResourceFilterDefinition = {
    key: string;
    label: string;
    options: Option[];
    getValue: (row: any) => string;
};

// --- CONSTANTS ---
const packageTypeOptions = [
    { label: 'REGULER', value: 'reguler' },
    { label: 'VIP PREMIUM', value: 'vip' },
    { label: 'PRIVATE', value: 'private' },
];
const scheduleStatusOptions = [
    { label: 'OPEN (TERSEDIA)', value: 'open' },
    { label: 'FULL (PENUH)', value: 'full' },
    { label: 'CLOSED (DITUTUP)', value: 'closed' },
];

const resourceFieldDefinitions: Record<string, FieldDefinition[]> = {
    faqs: [
        { path: 'question', label: 'Pertanyaan FAQ', type: 'localized-text' },
        { path: 'answer', label: 'Jawaban FAQ', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan Tampil', type: 'number' },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    legal_documents: [
        { path: 'title', label: 'Judul Dokumen', type: 'localized-text' },
        { path: 'document_number', label: 'Nomor Dokumen', type: 'text' },
        {
            path: 'issued_by',
            label: 'Diterbitkan Oleh',
            type: 'localized-text',
        },
        { path: 'description', label: 'Deskripsi', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan Tampil', type: 'number' },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    product_categories: [
        { path: 'key', label: 'Key Kategori', type: 'text' },
        { path: 'name', label: 'Nama Kategori', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi', type: 'localized-textarea' },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    products: [
        { path: 'code', label: 'Kode Produk', type: 'text' },
        {
            path: 'product_type',
            label: 'Tipe Produk',
            type: 'select',
            optionsKey: 'product_category_options',
        },
        { path: 'name', label: 'Nama Produk', type: 'localized-text' },
        {
            path: 'description',
            label: 'Deskripsi Detail',
            type: 'localized-textarea',
        },
        { path: 'content.unit', label: 'Satuan', type: 'localized-text' },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    packages: [
        { path: 'code', label: 'Kode Paket', type: 'text' },
        {
            path: 'package_type',
            label: 'Tipe Layanan',
            type: 'select',
            options: packageTypeOptions,
        },
        { path: 'departure_city', label: 'Kota Keberangkatan', type: 'text' },
        { path: 'duration_days', label: 'Durasi (Hari)', type: 'number' },
        { path: 'price', label: 'Harga (Rp)', type: 'number' },
        { path: 'image_path', label: 'Galeri Foto', type: 'image' },
        { path: 'name', label: 'Nama Paket', type: 'localized-text' },
        {
            path: 'content.itinerary',
            label: 'Rencana Perjalanan',
            type: 'itinerary',
        },
        {
            path: 'content.included',
            label: 'Inclusions',
            type: 'localized-list',
        },
        {
            path: 'content.excluded',
            label: 'Exclusions',
            type: 'localized-list',
        },
        {
            path: 'product_codes',
            label: 'Komponen Produk',
            type: 'product-selector',
        },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    schedules: [
        {
            path: 'travel_package_code',
            label: 'Pilih Paket',
            type: 'select',
            optionsKey: 'package_options',
        },
        { path: 'departure_date', label: 'Tanggal Berangkat', type: 'date' },
        { path: 'departure_city', label: 'Kota Keberangkatan', type: 'text' },
        { path: 'seats_total', label: 'Total Kursi', type: 'number' },
        { path: 'seats_available', label: 'Kursi Tersedia', type: 'number' },
        {
            path: 'status',
            label: 'Status Keberangkatan',
            type: 'select',
            options: scheduleStatusOptions,
        },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
};

// --- CORE COMPONENTS ---

export default function ContentIndex({
    heading = 'Management',
    pages = [],
    menuKey = 'content_management',
    resources,
}: {
    heading?: string;
    pages?: StaticPageSection[];
    menuKey?: string;
    resources: ResourceSection[];
}) {
    const { can } = usePermission(menuKey);
    const isPolicyHelp = heading === 'Policy & Help';
    const defaultTab =
        pages.length > 0 ? 'pages' : (resources[0]?.key ?? 'resource');
    return (
        <AppSidebarLayout breadcrumbs={[{ title: heading, href: '#' }]}>
            <Head title={heading} />

            {/* DEBUG BANNER: Jika anda melihat ini, file Index.tsx sudah terupdate */}
            <div className="hidden">
                Sistem Terupdate: {new Date().toLocaleTimeString()} â€¢ Cek
                Filter Di Bawah
            </div>

            <div className="space-y-6 p-4 md:p-6">
                {isPolicyHelp ? (
                    <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Website Management
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {heading}
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                Kelola halaman policy, bantuan, FAQ, dan legal
                                documents dari satu modul yang lebih rapi dan
                                konsisten.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
                                {heading}
                            </h1>
                            <p className="max-w-3xl text-sm text-muted-foreground">
                                Manajemen resource portal dalam satu workspace
                                admin.
                            </p>
                        </div>
                    </div>
                )}

                <Tabs defaultValue={defaultTab} className="space-y-6">
                    <div className="overflow-x-auto">
                        <TabsList
                            className={cn(
                                'inline-flex h-auto gap-2',
                                isPolicyHelp
                                    ? 'rounded-xl border bg-card p-1 shadow-sm'
                                    : 'rounded-2xl border bg-white p-2 shadow-sm',
                            )}
                        >
                            {pages.length > 0 ? (
                                <TabsTrigger
                                    value="pages"
                                    className="gap-2 px-4 py-2 text-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    Static Pages
                                </TabsTrigger>
                            ) : null}
                            {resources.map((r: any) => (
                                <TabsTrigger
                                    key={r.key}
                                    value={r.key}
                                    className="px-4 py-2 text-sm"
                                >
                                    {r.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {pages.length > 0 ? (
                        <TabsContent
                            value="pages"
                            className="mt-0 focus-visible:outline-none"
                        >
                            <StaticPagesPanel pages={pages} menuKey={menuKey} />
                        </TabsContent>
                    ) : null}

                    {resources.map((r: any) => (
                        <TabsContent
                            key={r.key}
                            value={r.key}
                            className="mt-0 focus-visible:outline-none"
                        >
                            <ResourceSectionPanel
                                resource={r}
                                menuKey={menuKey}
                                compact={isPolicyHelp}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function ResourceSectionPanel({
    resource,
    menuKey,
    compact = false,
}: {
    resource: ResourceSection;
    menuKey: string;
    compact?: boolean;
}) {
    const { can } = usePermission(menuKey);
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const showActions = canEdit || canDelete;
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
        {},
    );
    const [search, setSearch] = useState('');

    const form = useForm<{ payload: Record<string, any>; images: File[] }>({
        payload: clonePayload(resource.template),
        images: [],
    });
    const setCreateFormData = form.setData as (
        key: 'payload' | 'images',
        value: any,
    ) => void;

    const rows = useMemo(
        () =>
            resource.items.map((item, index) => ({
                id: item.id,
                number: index + 1,
                title: item.title,
                summary: summarizeResourceItem(resource.key, item.payload),
                status: Boolean(item.payload?.is_active ?? true),
                payload: item.payload,
                item,
            })),
        [resource.items, resource.key],
    );

    const stableMeta = useMemo(() => resource.meta ?? {}, [resource.meta]);
    const filterDefinitions = useMemo(
        () => buildResourceFilters(resource.key, stableMeta, rows),
        [resource.key, stableMeta, rows],
    );

    const filteredRows = useMemo(() => {
        return rows.filter((row) =>
            filterDefinitions.every((f) => {
                const val = activeFilters[f.key];
                return !val || val === 'all' || f.getValue(row) === val;
            }),
        );
    }, [rows, activeFilters, filterDefinitions]);

    const searchedRows = useMemo(() => {
        if (!compact || search.trim() === '') {
            return filteredRows;
        }

        const needle = search.toLowerCase();

        return filteredRows.filter((row) =>
            `${row.title} ${row.summary}`.toLowerCase().includes(needle),
        );
    }, [compact, filteredRows, search]);

    const openCreateDialog = () => {
        if (!canCreate) {
            return;
        }

        setCreateFormData('payload', clonePayload(resource.template));
        setCreateFormData('images', []);
        setIsCreateDialogOpen(true);
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();

        if (!canCreate) {
            return;
        }

        form.post(
            `/admin/website-management/content/resources/${resource.key}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateDialogOpen(false);
                    toast.success('Data Terdaftar');
                },
            },
        );
    };

    return (
        <div
            className={cn(
                'animate-in duration-500 slide-in-from-bottom-4',
                compact ? 'space-y-6' : 'space-y-10',
            )}
        >
            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    label={compact ? 'Total Data' : 'Database'}
                    value={rows.length}
                    icon={ClipboardList}
                    color="primary"
                    compact={compact}
                />
                <SummaryCard
                    label={compact ? 'Active' : 'Online'}
                    value={rows.filter((r) => r.status).length}
                    color="green"
                    icon={Eye}
                    compact={compact}
                />
                <SummaryCard
                    label={compact ? 'Inactive' : 'Arsip'}
                    value={rows.filter((r) => !r.status).length}
                    color="slate"
                    icon={Box}
                    compact={compact}
                />
            </div>

            <Card
                className={cn(
                    'overflow-hidden border bg-white',
                    compact
                        ? 'rounded-2xl shadow-sm'
                        : 'rounded-[3rem] border-border/40 shadow-2xl',
                )}
            >
                <CardHeader
                    className={cn(
                        'border-b',
                        compact
                            ? 'bg-transparent p-4 sm:p-6'
                            : 'flex flex-col items-start justify-between gap-8 border-border/40 bg-muted/5 p-12 sm:flex-row sm:items-center',
                    )}
                >
                    {compact ? (
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                                    {resource.label}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    {resource.description}
                                </CardDescription>
                            </div>
                            <Button
                                onClick={openCreateDialog}
                                className="shrink-0"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {`Tambah ${resource.label}`}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center sm:text-left">
                                <CardTitle className="mb-2 text-[12px] leading-none font-black tracking-[0.5em] text-primary/30 uppercase">
                                    Resource View
                                </CardTitle>
                                <h2 className="text-4xl leading-none font-black tracking-tighter text-[#2d1810]">
                                    {resource.label}
                                </h2>
                            </div>
                            {canCreate ? (
                                <Button
                                    onClick={openCreateDialog}
                                    className="h-16 rounded-[1.5rem] border-b-8 border-primary-foreground/20 px-12 text-sm font-black tracking-[0.3em] uppercase shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 active:border-b-0"
                                >
                                    <Plus className="mr-4 h-6 w-6 stroke-[4px]" />{' '}
                                    Add New
                                </Button>
                            ) : null}
                        </>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {compact ? (
                        <div className="grid gap-4 border-b border-border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                            <div className="space-y-3">
                                <div>
                                    <Label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Cari {resource.label}
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            className="h-11 rounded-xl pr-4 pl-9"
                                            placeholder={`Cari ${resource.label.toLowerCase()}...`}
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="rounded-full bg-muted px-3 py-1">
                                        Total data: {rows.length}
                                    </span>
                                    {search.trim() !== '' ? (
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                            Filter aktif: "{search}"
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-muted px-3 py-1">
                                            Belum ada filter aktif
                                        </span>
                                    )}
                                </div>
                            </div>
                            {filterDefinitions.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {filterDefinitions.map((f) => (
                                        <div key={f.key} className="space-y-2">
                                            <Label className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                {f.label}
                                            </Label>
                                            <Select
                                                value={
                                                    activeFilters[f.key] ??
                                                    'all'
                                                }
                                                onValueChange={(v) =>
                                                    setActiveFilters((p) => ({
                                                        ...p,
                                                        [f.key]: v,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {f.options.map((o) => (
                                                        <SelectItem
                                                            key={o.value}
                                                            value={o.value}
                                                        >
                                                            {o.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        filterDefinitions.length > 0 && (
                            <div
                                className={cn(
                                    'flex flex-wrap items-end',
                                    'mx-8 mt-10 gap-10 rounded-[2.5rem] border-4 border-primary/30 bg-[#1a1c2c] p-10 shadow-2xl',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex items-center gap-4',
                                        'h-16 border-r-2 border-primary/20 pr-8 text-primary',
                                    )}
                                >
                                    <Filter className="h-8 w-8 stroke-[3px]" />
                                    <div className="space-y-1">
                                        <span className="block text-[14px] leading-none font-black tracking-[0.2em] text-white uppercase">
                                            Filter
                                        </span>
                                        <span className="block text-[9px] font-bold tracking-widest text-primary/60 uppercase">
                                            Sesuaikan data yang ingin dilihat
                                        </span>
                                    </div>
                                </div>

                                {filterDefinitions.map((f) => (
                                    <div
                                        key={f.key}
                                        className="min-w-[280px] space-y-3"
                                    >
                                        <Label className="ml-2 block text-[11px] font-black tracking-[0.3em] text-primary/80 uppercase">
                                            {f.label}
                                        </Label>
                                        <Select
                                            value={
                                                activeFilters[f.key] ?? 'all'
                                            }
                                            onValueChange={(v) =>
                                                setActiveFilters((p) => ({
                                                    ...p,
                                                    [f.key]: v,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/20 bg-white text-[12px] font-black tracking-wider text-[#2d1810] uppercase shadow-xl transition-all hover:border-primary/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="min-w-[280px] rounded-2xl border-border/40 shadow-2xl">
                                                {f.options.map((o) => (
                                                    <SelectItem
                                                        key={o.value}
                                                        value={o.value}
                                                        className="cursor-pointer py-4 text-[11px] font-black tracking-wider uppercase focus:bg-primary focus:text-white"
                                                    >
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    <div className={compact ? 'p-0' : 'p-12'}>
                        {compact ? (
                            <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-none">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground">
                                    <span>
                                        Daftar {resource.label.toLowerCase()}:{' '}
                                        {searchedRows.length}
                                    </span>
                                    <span className="text-xs">
                                        Pilih data untuk edit atau hapus.
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border text-sm">
                                        <thead className="bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Data
                                                </th>
                                                <th className="px-4 py-3">
                                                    Ringkasan
                                                </th>
                                                <th className="px-4 py-3">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {searchedRows.length > 0 ? (
                                                searchedRows.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-4">
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-foreground">
                                                                    {row.title}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {resource.key.toUpperCase()}
                                                                    -{row.id}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-muted-foreground">
                                                            {row.summary}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                                                                    row.status
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : 'bg-slate-100 text-slate-700',
                                                                )}
                                                            >
                                                                {row.status
                                                                    ? 'Active'
                                                                    : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex justify-end">
                                                                <Select
                                                                    value=""
                                                                    onValueChange={(
                                                                        value,
                                                                    ) => {
                                                                        if (
                                                                            value ===
                                                                            'edit'
                                                                        ) {
                                                                            setEditingItem(
                                                                                row.item,
                                                                            );
                                                                            return;
                                                                        }

                                                                        if (
                                                                            value ===
                                                                            'delete'
                                                                        ) {
                                                                            destroyResourceItem(
                                                                                resource.key,
                                                                                resource.label,
                                                                                row.id,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-9 w-[172px]">
                                                                        <div className="flex items-center gap-2">
                                                                            <SquarePen className="h-4 w-4" />
                                                                            <SelectValue placeholder="Pilih action" />
                                                                        </div>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="edit">
                                                                            Edit
                                                                            data
                                                                        </SelectItem>
                                                                        <SelectItem value="delete">
                                                                            Hapus
                                                                            data
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-16 text-center text-muted-foreground"
                                                    >
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="rounded-full bg-muted p-3">
                                                                <ClipboardList className="h-6 w-6" />
                                                            </div>
                                                            <p>
                                                                {search.trim() !==
                                                                ''
                                                                    ? `${resource.label} tidak ditemukan.`
                                                                    : `Belum ada ${resource.label.toLowerCase()}.`}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={useMemo(
                                    () =>
                                        getColumns(
                                            resource,
                                            setEditingItem,
                                            (id: number) =>
                                                destroyResourceItem(
                                                    resource.key,
                                                    resource.label,
                                                    id,
                                                ),
                                            compact,
                                        ),
                                    [resource, compact],
                                )}
                                data={filteredRows}
                                searchKey="title"
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Sheet
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            >
                <SheetContent
                    side="right"
                    className={cn(
                        'flex w-full flex-col p-0 transition-all duration-500',
                        compact
                            ? 'overflow-y-auto border-l-0 bg-background shadow-none sm:max-w-xl'
                            : 'border-l border-border/40 sm:max-w-xl lg:max-w-2xl xl:max-w-5xl',
                    )}
                >
                    {compact ? (
                        <div className="flex min-h-full flex-col bg-background">
                            <div className="border-b border-border px-6 py-6">
                                <SheetHeader className="p-0 pr-10">
                                    <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                        {`Tambah ${resource.label}`}
                                    </SheetTitle>
                                    <SheetDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        Isi data sesuai bahasa aktif dari switch
                                        di halaman ini.
                                    </SheetDescription>
                                </SheetHeader>
                            </div>
                            <div className="flex-1 px-6 py-6">
                                <ResourceEditorForm
                                    submitLabel={`Simpan ${resource.label}`}
                                    resourceKey={resource.key}
                                    resourceMeta={stableMeta}
                                    data={form.data.payload}
                                    setData={form.setData as any}
                                    images={form.data.images}
                                    setImages={(imgs: any) =>
                                        (form.setData as any)('images', imgs)
                                    }
                                    processing={form.processing}
                                    onSubmit={handleCreate}
                                    compact={compact}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="no-scrollbar flex-1 overflow-y-auto p-14">
                            <ResourceEditorForm
                                submitLabel={
                                    compact
                                        ? `Simpan ${resource.label}`
                                        : 'Daftarkan Sekarang'
                                }
                                resourceKey={resource.key}
                                resourceMeta={stableMeta}
                                data={form.data.payload}
                                setData={form.setData as any}
                                images={form.data.images}
                                setImages={(imgs: any) =>
                                    (form.setData as any)('images', imgs)
                                }
                                processing={form.processing}
                                onSubmit={handleCreate}
                                compact={compact}
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {editingItem && (
                <EditResourceDialog
                    item={editingItem}
                    resourceKey={resource.key}
                    label={resource.label}
                    resourceMeta={stableMeta}
                    compact={compact}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    );
}

function StaticPagesPanel({
    pages,
    menuKey,
}: {
    pages: StaticPageSection[];
    menuKey: string;
}) {
    const { can } = usePermission(menuKey);
    const canEdit = can('edit');
    const [editingPage, setEditingPage] = useState<StaticPageSection | null>(
        null,
    );
    const [search, setSearch] = useState('');
    const rows = useMemo(
        () =>
            pages.map((page, index) => ({
                id: page.id,
                number: index + 1,
                slug: page.slug,
                label: page.label,
                description: page.description,
                title: localizedValue(page.title),
                excerpt: localizedValue(page.excerpt),
                status: page.is_active,
                item: page,
            })),
        [pages],
    );

    const filteredRows = useMemo(
        () =>
            rows.filter((row) =>
                `${row.label} ${row.slug} ${row.description} ${row.title} ${row.excerpt}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            ),
        [rows, search],
    );

    const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(() => {
        const cols: ColumnDef<(typeof rows)[number]>[] = [
            {
                accessorKey: 'label',
                header: () => (
                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Page
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="space-y-1 py-4">
                        <p className="font-medium text-foreground">
                            {row.original.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.slug}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'title',
                header: () => (
                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Content
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="max-w-xl space-y-1">
                        <p className="text-sm text-foreground">
                            {row.original.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.excerpt}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: () => (
                    <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Status
                    </div>
                ),
                cell: ({ row }) => (
                    <span
                        className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            row.original.status
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-700',
                        )}
                    >
                        {row.original.status ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
        ];

        if (canEdit) {
            cols.push({
                id: 'actions',
                header: () => (
                    <div className="text-right text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Action
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Select
                            value=""
                            onValueChange={(value) => {
                                if (value === 'edit') {
                                    setEditingPage(row.original.item);
                                }
                            }}
                        >
                            <SelectTrigger className="h-9 w-[172px]">
                                <div className="flex items-center gap-2">
                                    <SquarePen className="h-4 w-4" />
                                    <SelectValue placeholder="Pilih action" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="edit">
                                    Edit halaman
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ),
            });
        }

        return cols;
    }, [canEdit]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Total Page
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {rows.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Active
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {rows.filter((row) => row.status).length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Inactive
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {rows.filter((row) => !row.status).length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="space-y-3">
                    <div>
                        <Label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Cari Halaman
                        </Label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-11 rounded-xl pr-4 pl-9"
                                placeholder="Cari judul, slug, atau ringkasan..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-3 py-1">
                            Total data: {rows.length}
                        </span>
                        {search.trim() !== '' ? (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                Filter aktif: "{search}"
                            </span>
                        ) : (
                            <span className="rounded-full bg-muted px-3 py-1">
                                Belum ada filter aktif
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground">
                    <span>Daftar page: {filteredRows.length}</span>
                    <span className="text-xs">
                        Pilih halaman untuk edit kontennya.
                    </span>
                </div>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredRows}
                        searchKey="label"
                    />
                </CardContent>
            </div>

            {editingPage && (
                <StaticPageEditorDialog
                    page={editingPage}
                    onClose={() => setEditingPage(null)}
                />
            )}
        </div>
    );
}

function StaticPageEditorDialog({
    page,
    onClose,
}: {
    page: StaticPageSection;
    onClose: () => void;
}) {
    const [bodyMode, setBodyMode] = useState<'visual' | 'html'>('visual');
    const form = useForm({
        title: stringValue(page.title),
        excerpt: stringValue(page.excerpt),
        body: stringValue(page.content?.body),
        is_active: page.is_active,
    });

    const [bodyDraft, setBodyDraft] = useState(() =>
        stringValue(page.content?.body),
    );

    useEffect(() => {
        const nextBody = stringValue(page.content?.body);
        setBodyDraft(nextBody);
        form.setData('body', nextBody);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!page.id) {
            toast.error('Static page belum siap disimpan.');

            return;
        }

        router.patch(
            `/admin/website-management/content/${page.id}`,
            {
                title: form.data.title,
                excerpt: form.data.excerpt,
                content_json: JSON.stringify({
                    ...page.content,
                    body: form.data.body,
                }),
                is_active: form.data.is_active,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Static page updated');
                    onClose();
                },
            },
        );
    };

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-2xl"
            >
                <SheetHeader>
                    <SheetTitle>Edit Halaman</SheetTitle>
                    <SheetDescription>
                        Konten halaman mengikuti bahasa yang sedang aktif di
                        switch.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={submit} className="mt-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="rounded-2xl border border-border bg-muted/20 p-4">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Page
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                                {page.label}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {page.slug}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-foreground">
                                Konten Halaman
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Kelola judul, ringkasan, dan isi halaman di
                                sini.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <Label className="mb-1.5 block">
                                    Judul Halaman
                                </Label>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData('title', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">
                                    Ringkasan
                                </Label>
                                <Textarea
                                    rows={3}
                                    value={form.data.excerpt}
                                    onChange={(e) =>
                                        form.setData('excerpt', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">
                                    Isi Halaman
                                </Label>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2">
                                        <p className="text-xs text-muted-foreground">
                                            Mode rich text menyimpan HTML.
                                            Pindah ke mode HTML kalau ingin edit
                                            markup langsung.
                                        </p>
                                        <div className="inline-flex rounded-lg border border-border bg-background p-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    bodyMode === 'visual'
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                onClick={() =>
                                                    setBodyMode('visual')
                                                }
                                            >
                                                Rich Text
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={
                                                    bodyMode === 'html'
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                onClick={() =>
                                                    setBodyMode('html')
                                                }
                                            >
                                                HTML
                                            </Button>
                                        </div>
                                    </div>
                                    {bodyMode === 'visual' ? (
                                        <RichTextEditor
                                            value={bodyDraft}
                                            onChange={(value) => {
                                                setBodyDraft(value);
                                                form.setData('body', value);
                                            }}
                                            placeholder="Tulis isi halaman dengan paragraf, daftar, link, dan penekanan teks."
                                        />
                                    ) : (
                                        <Textarea
                                            rows={14}
                                            className="min-h-72 font-mono text-xs leading-6"
                                            value={bodyDraft}
                                            onChange={(e) => {
                                                setBodyDraft(e.target.value);
                                                form.setData(
                                                    'body',
                                                    e.target.value,
                                                );
                                            }}
                                            placeholder="<p>Tulis HTML halaman di sini...</p>"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                <Checkbox
                                    checked={form.data.is_active}
                                    onCheckedChange={(value) =>
                                        form.setData(
                                            'is_active',
                                            value === true,
                                        )
                                    }
                                />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Halaman aktif
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Halaman aktif akan tampil di website
                                        publik.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button disabled={form.processing}>
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

function EditResourceDialog({
    item,
    resourceKey,
    label,
    resourceMeta,
    compact = false,
    onClose,
}: any) {
    const form = useForm({
        payload: clonePayload(item.payload),
        images: [] as File[],
        _method: 'PATCH',
    });
    const handleUpdate = (e: FormEvent) => {
        e.preventDefault();
        form.post(
            `/admin/website-management/content/resources/${resourceKey}/${item.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    toast.success('Update Success');
                },
            },
        );
    };

    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    'flex w-full flex-col p-0 transition-all duration-500',
                    compact
                        ? 'overflow-y-auto border-l-0 bg-background shadow-none sm:max-w-xl'
                        : 'border-l border-border/40 sm:max-w-xl lg:max-w-2xl xl:max-w-5xl',
                )}
            >
                {compact ? (
                    <div className="flex min-h-full flex-col bg-background">
                        <div className="border-b border-border px-6 py-6">
                            <SheetHeader className="p-0 pr-10">
                                <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                    {`Edit ${label}`}
                                </SheetTitle>
                                <SheetDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    Perbarui data sesuai bahasa aktif dari
                                    switch di halaman ini.
                                </SheetDescription>
                            </SheetHeader>
                        </div>
                        <div className="flex-1 px-6 py-6">
                            <ResourceEditorForm
                                submitLabel={`Update ${label}`}
                                resourceKey={resourceKey}
                                resourceMeta={resourceMeta}
                                data={form.data.payload}
                                setData={form.setData as any}
                                images={form.data.images}
                                setImages={(imgs: any) =>
                                    (form.setData as any)('images', imgs)
                                }
                                processing={form.processing}
                                onSubmit={handleUpdate}
                                compact={compact}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="border-b bg-primary/5 p-14">
                            <SheetTitle className="text-5xl font-black tracking-tighter text-[#2d1810]">
                                {item.title}
                            </SheetTitle>
                            <SheetDescription className="text-xs font-black tracking-[0.4em] text-primary uppercase">
                                Konfigurasi Modifikasi
                            </SheetDescription>
                        </SheetHeader>
                        <div className="no-scrollbar flex-1 overflow-y-auto p-14">
                            <ResourceEditorForm
                                submitLabel="Save Modifications"
                                resourceKey={resourceKey}
                                resourceMeta={resourceMeta}
                                data={form.data.payload}
                                setData={form.setData as any}
                                images={form.data.images}
                                setImages={(imgs: any) =>
                                    (form.setData as any)('images', imgs)
                                }
                                processing={form.processing}
                                onSubmit={handleUpdate}
                                compact={compact}
                            />
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function ResourceEditorForm({
    submitLabel,
    resourceKey,
    resourceMeta,
    data,
    setData,
    images,
    setImages,
    processing,
    onSubmit,
    compact = false,
}: any) {
    const locale = 'id' as const;
    const fields = useMemo(
        () => resourceFieldDefinitions[resourceKey] ?? [],
        [resourceKey],
    );
    const onChange = useCallback(
        (path: string, val: any) => {
            setData((prev: any) => ({
                ...prev,
                payload: updateNestedValue(prev.payload, path, val),
            }));
        },
        [setData],
    );

    return compact ? (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Ringkasan Form
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                        {submitLabel}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Isi data dengan format Bahasa Indonesia.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-4">
                    <p className="text-sm font-semibold text-foreground">
                        Konten
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Lengkapi data sesuai kebutuhan.
                    </p>
                </div>
                <div className="grid gap-4">
                    {fields.map((f) => (
                        <MemoizedFieldRenderer
                            key={f.path}
                            field={f}
                            value={getNestedValue(data, f.path)}
                            resourceMeta={resourceMeta}
                            locale={locale}
                            images={images}
                            setImages={setImages}
                            onChange={onChange}
                            compact={compact}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
                <Button disabled={processing}>
                    {processing ? 'Menyimpan...' : submitLabel}
                </Button>
            </div>
        </form>
    ) : (
        <form onSubmit={onSubmit} className="space-y-20 pb-32">
            <div className="grid gap-x-14 gap-y-14 md:grid-cols-2">
                {fields.map((f) => (
                    <MemoizedFieldRenderer
                        key={f.path}
                        field={f}
                        value={getNestedValue(data, f.path)}
                        resourceMeta={resourceMeta}
                        locale={locale}
                        images={images}
                        setImages={setImages}
                        onChange={onChange}
                        compact={compact}
                    />
                ))}
            </div>
            <div className="sticky bottom-0 z-20 -mx-14 border-t-2 border-border/40 bg-white/95 px-14 pt-12 pb-8 backdrop-blur-2xl">
                <Button
                    disabled={processing}
                    className="h-20 w-full rounded-[2rem] border-b-8 border-primary-foreground/20 bg-primary text-base font-black tracking-[0.5em] text-white uppercase shadow-2xl active:scale-95 active:border-b-0"
                >
                    {processing ? 'Menyimpan...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}

const MemoizedFieldRenderer = memo(
    FieldRenderer,
    (p, n) =>
        p.value === n.value &&
        p.locale === n.locale &&
        p.resourceMeta === n.resourceMeta &&
        p.images === n.images &&
        p.compact === n.compact,
);

function FieldRenderer({
    field,
    value,
    resourceMeta,
    locale,
    images,
    setImages,
    onChange,
    compact = false,
}: any) {
    const labelClasses = compact
        ? 'mb-2 block text-sm font-medium text-foreground'
        : 'text-[13px] font-black uppercase tracking-[0.3em] text-[#2d1810] mb-5 block ml-2';
    const inputClasses = compact
        ? 'h-10 rounded-lg border border-border bg-background px-3 text-sm transition-all focus:bg-white focus:ring-primary/20'
        : 'h-16 rounded-[1.5rem] border-2 border-border/60 text-sm bg-muted/10 focus:bg-white focus:ring-primary/20 transition-all font-bold px-6';

    if (field.type === 'image') {
        if (compact) {
            return (
                <div className="space-y-3">
                    <Label className={labelClasses}>{field.label}</Label>
                    {value ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-muted">
                            <img
                                src={value}
                                className="h-40 w-full object-cover"
                            />
                        </div>
                    ) : null}
                    <Input
                        type="file"
                        multiple
                        onChange={(e) =>
                            setImages([
                                ...images,
                                ...Array.from(e.target.files || []),
                            ])
                        }
                    />
                </div>
            );
        }

        return (
            <div className="mb-8 space-y-8 border-b-2 border-dashed border-border/40 pb-20 md:col-span-2">
                <Label className={labelClasses}>{field.label}</Label>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                    {value && (
                        <div className="group relative aspect-video overflow-hidden rounded-[2.5rem] border-4 border-white bg-muted shadow-2xl">
                            <img
                                src={value}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="text-[10px] font-black tracking-widest text-white uppercase">
                                    Current Image
                                </span>
                            </div>
                        </div>
                    )}
                    {images.map((f: File, i: number) => (
                        <div
                            key={i}
                            className="group relative aspect-video animate-in overflow-hidden rounded-[2.5rem] border-4 border-primary shadow-2xl duration-500 zoom-in-50"
                        >
                            <img
                                src={URL.createObjectURL(f)}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setImages(
                                        images.filter(
                                            (_: any, idx: number) => idx !== i,
                                        ),
                                    )
                                }
                                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive text-white shadow-2xl transition-all hover:scale-110 active:scale-90"
                            >
                                <X className="h-6 w-6 stroke-[3px]" />
                            </button>
                            <div className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-[8px] font-black tracking-widest text-white uppercase shadow-lg">
                                NEW {i + 1}
                            </div>
                        </div>
                    ))}
                    <label className="group flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-4 border-dashed border-border/60 bg-muted/5 transition-all hover:border-primary/40 hover:bg-primary/5">
                        <Plus className="h-12 w-12 stroke-[3px] text-muted-foreground/30 transition-all group-hover:scale-110 group-hover:text-primary" />
                        <p className="mt-4 text-[10px] font-black tracking-widest text-muted-foreground/40 uppercase group-hover:text-primary">
                            Add Gallery Photo
                        </p>
                        <Input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                setImages([
                                    ...images,
                                    ...Array.from(e.target.files || []),
                                ])
                            }
                        />
                    </label>
                </div>
                <div className="flex items-center gap-5 rounded-[2rem] border-2 border-primary/10 bg-primary/5 p-6 text-primary/70">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <p className="text-xs font-black tracking-widest uppercase">
                        Multi-photo upload enabled. You can select multiple
                        files at once.
                    </p>
                </div>
            </div>
        );
    }

    if (
        field.type === 'localized-text' ||
        field.type === 'localized-textarea'
    ) {
        const Comp = field.type === 'localized-text' ? Input : Textarea;
        return (
            <div className={cn('space-y-2', compact ? '' : 'md:col-span-2')}>
                <Label className={labelClasses}>{field.label}</Label>
                <Comp
                    className={cn(
                        inputClasses,
                        field.type === 'localized-textarea' &&
                            (compact
                                ? 'min-h-28 py-3 leading-relaxed'
                                : 'min-h-56 py-8 leading-relaxed'),
                    )}
                    value={stringValue(value)}
                    onChange={(e) => onChange(field.path, e.target.value)}
                />
            </div>
        );
    }

    if (field.type === 'localized-list') {
        return (
            <div className={cn('space-y-2', compact ? '' : 'md:col-span-2')}>
                <Label className={labelClasses}>{field.label}</Label>
                <Textarea
                    className={cn(
                        inputClasses,
                        compact
                            ? 'min-h-28 py-3 leading-relaxed'
                            : 'min-h-56 py-8 leading-relaxed',
                    )}
                    value={joinLines(value)}
                    onChange={(e) =>
                        onChange(field.path, splitLines(e.target.value))
                    }
                    placeholder="Masukkan satu item per baris..."
                />
            </div>
        );
    }

    if (field.type === 'itinerary') {
        if (compact) {
            return (
                <div className="space-y-2">
                    <Label className={labelClasses}>{field.label}</Label>
                    <Textarea
                        className="min-h-44 rounded-lg border border-border bg-background px-3 py-3 font-mono text-xs leading-loose transition-all focus:bg-white focus:ring-primary/20"
                        value={serializeItinerary(value)}
                        onChange={(e) =>
                            onChange(field.path, parseItinerary(e.target.value))
                        }
                    />
                </div>
            );
        }

        return (
            <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between px-2">
                    <Label className={labelClasses}>{field.label}</Label>
                    <span className="text-[10px] font-black tracking-widest text-primary/40">
                        FORMAT: JUDUL | DESKRIPSI
                    </span>
                </div>
                <Textarea
                    className="min-h-[400px] rounded-[1.5rem] border-2 border-border/60 bg-muted/10 px-6 py-10 font-mono text-xs leading-loose font-bold shadow-inner transition-all focus:bg-white focus:ring-primary/20"
                    value={serializeItinerary(value)}
                    onChange={(e) =>
                        onChange(field.path, parseItinerary(e.target.value))
                    }
                />
            </div>
        );
    }

    if (field.type === 'product-selector') {
        const opts = (resourceMeta.product_options as ProductOption[]) || [];
        const sel = (value as string[]) || [];
        const toggle = (c: string) =>
            onChange(
                field.path,
                sel.includes(c) ? sel.filter((i) => i !== c) : [...sel, c],
            );
        return (
            <div className="space-y-10 border-t-8 border-muted pt-16 md:col-span-2">
                <div className="flex items-center justify-between px-2">
                    <Label className={labelClasses + ' mb-0'}>
                        {field.label}
                    </Label>
                    <span className="rounded-[1.25rem] bg-primary px-8 py-3 text-[11px] font-black tracking-widest text-white uppercase shadow-2xl shadow-primary/40">
                        {sel.length} SELECTED
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                    {opts.map((p) => {
                        const isS = sel.includes(p.code);
                        return (
                            <div
                                key={p.code}
                                onClick={() => toggle(p.code)}
                                className={cn(
                                    'group relative cursor-pointer overflow-hidden rounded-[3rem] border-2 p-10 transition-all duration-700',
                                    isS
                                        ? 'z-10 scale-105 border-primary bg-primary/5 shadow-2xl'
                                        : 'border-border/40 bg-muted/10 hover:border-primary/40 hover:bg-white',
                                )}
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-700',
                                            isS
                                                ? 'rotate-180 border-primary bg-primary shadow-2xl'
                                                : 'border-border/60 shadow-inner',
                                        )}
                                    >
                                        <Plus
                                            className={cn(
                                                'h-6 w-6 text-white transition-transform duration-500',
                                                isS && 'rotate-45',
                                            )}
                                        />
                                    </div>
                                    <span className="text-[11px] font-black tracking-[0.2em] text-primary/30 uppercase">
                                        {p.product_type}
                                    </span>
                                </div>
                                <p className="text-xl font-black tracking-tighter text-[#2d1810]">
                                    {p.code}
                                </p>
                                <p className="mt-3 truncate text-[10px] font-black tracking-tighter text-muted-foreground uppercase italic">
                                    {localizedValue(p.name)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (field.type === 'checkbox') {
        if (compact) {
            return (
                <div
                    className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-3"
                    onClick={() => onChange(field.path, !value)}
                >
                    <Checkbox
                        checked={Boolean(value)}
                        className="h-4 w-4"
                        onCheckedChange={(v) =>
                            onChange(field.path, v === true)
                        }
                    />
                    <Label className="text-sm font-medium text-foreground">
                        {field.label}
                    </Label>
                </div>
            );
        }

        return (
            <div
                className="group relative flex h-32 cursor-pointer items-center gap-10 overflow-hidden rounded-[3.5rem] border-4 border-border/40 bg-muted/5 p-12 shadow-2xl transition-all hover:border-primary/40 hover:bg-white"
                onClick={() => onChange(field.path, !value)}
            >
                <div
                    className={cn(
                        'absolute inset-0 translate-x-[-100%] bg-primary/5 transition-transform duration-1000',
                        value && 'translate-x-0',
                    )}
                />
                <Checkbox
                    checked={Boolean(value)}
                    className="relative z-10 h-12 w-12 rounded-2xl border-4 border-primary/20 shadow-2xl transition-all group-hover:scale-110"
                    onCheckedChange={(v) => onChange(field.path, v === true)}
                />
                <Label className="pointer-events-none relative z-10 text-xl font-black tracking-[0.4em] text-[#2d1810] uppercase">
                    {field.label}
                </Label>
            </div>
        );
    }

    if (field.type === 'select') {
        const opts =
            field.optionsKey === 'product_category_options'
                ? productCategoryOptions(resourceMeta.product_category_options)
                : field.optionsKey === 'package_options'
                  ? (resourceMeta.package_options || []).map((o: any) => ({
                        value: o.code,
                        label: o.code,
                    }))
                  : (field.options ?? []);
        return (
            <div className={compact ? 'space-y-2' : 'space-y-5'}>
                <Label className={labelClasses}>{field.label}</Label>
                <Select
                    value={stringValue(value)}
                    onValueChange={(v) => onChange(field.path, v)}
                >
                    <SelectTrigger
                        className={
                            compact
                                ? inputClasses
                                : inputClasses +
                                  ' border-4 border-primary/5 tracking-[0.2em] uppercase shadow-2xl'
                        }
                    >
                        <SelectValue
                            placeholder={
                                compact ? 'Pilih data' : 'CHOOSE RESOURCE...'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent
                        className={
                            compact
                                ? 'rounded-lg border-border/40 shadow-lg'
                                : 'rounded-[2rem] border-8 border-border/40 p-4 shadow-2xl'
                        }
                    >
                        {opts.map((o: any) => (
                            <SelectItem
                                key={o.value}
                                value={o.value}
                                className={
                                    compact
                                        ? 'text-sm'
                                        : 'rounded-2xl py-6 text-[12px] font-black tracking-[0.3em] uppercase transition-all focus:bg-primary focus:text-white'
                                }
                            >
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className={compact ? 'space-y-2' : 'space-y-5'}>
            <Label className={labelClasses}>{field.label}</Label>
            <Input
                type={
                    field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : 'text'
                }
                className={
                    compact
                        ? inputClasses
                        : inputClasses + ' border-4 border-primary/5 shadow-2xl'
                }
                value={stringValue(value)}
                onChange={(e) =>
                    onChange(
                        field.path,
                        field.type === 'number'
                            ? parseNumber(e.target.value)
                            : e.target.value,
                    )
                }
            />
        </div>
    );
}

// --- UTILS ---
function getNestedValue(o: any, p: string) {
    return p.split('.').reduce((c, s) => c?.[s], o);
}
function updateNestedValue(o: any, p: string, v: any) {
    const keys = p.split('.');
    const res = { ...o };
    let c = res;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        c[k] = { ...c[k] };
        c = c[k];
    }
    c[keys[keys.length - 1]] = v;
    return res;
}
function clonePayload(p: any) {
    return JSON.parse(JSON.stringify(p));
}
function stringValue(v: any) {
    return v != null ? String(v) : '';
}
function parseNumber(v: string) {
    const p = parseFloat(v);
    return isFinite(p) ? p : 0;
}
function joinLines(v: any) {
    return Array.isArray(v) ? v.join('\n') : '';
}
function splitLines(v: string) {
    return v
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
}
function serializeItinerary(v: any): string {
    return Array.isArray(v)
        ? v
              .map((i) => `${stringValue(i?.title)} | ${stringValue(i?.desc)}`)
              .join('\n')
        : '';
}
function parseItinerary(curr: string): any[] {
    const lines = curr.split('\n').filter(Boolean);
    return lines.map((line, i) => {
        const [t, ...r] = line.split('|');
        return {
            title: t?.trim() ?? '',
            desc: r.join('|').trim(),
        };
    });
}

function getColumns(
    resource: ResourceSection,
    setEdit: any,
    setDelete: any,
    compact = false,
): ColumnDef<any>[] {
    const cols: ColumnDef<any>[] = [
        {
            accessorKey: 'number',
            header: () => (
                <div className="w-8 text-center text-[11px] font-black uppercase">
                    NO
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-[11px] font-black text-muted-foreground/30">
                    {row.original.number}
                </span>
            ),
        },
        {
            accessorKey: 'title',
            header: () => (
                <div className="text-[11px] font-black tracking-widest uppercase">
                    Informasi Utama
                </div>
            ),
            cell: ({ row }) => (
                <div className="space-y-3 py-4">
                    <p className="text-2xl leading-none font-black tracking-tighter text-[#2d1810] uppercase">
                        {row.original.title}
                    </p>
                    <p className="text-[11px] font-black tracking-[0.4em] text-primary/50 uppercase">
                        {row.original.summary}
                    </p>
                </div>
            ),
        },
    ];

    if (resource.key === 'packages') {
        cols.push(
            {
                accessorKey: 'city',
                header: () => (
                    <div className="text-[11px] font-black tracking-widest uppercase">
                        Origin
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-lg shadow-primary/5">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[12px] font-black tracking-widest text-[#2d1810] uppercase">
                            {row.original.payload.departure_city || '-'}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'price',
                header: () => (
                    <div className="text-[11px] font-black tracking-widest uppercase">
                        Pricing
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 text-lg font-black text-primary">
                            <Wallet className="h-5 w-5 stroke-[3px]" />
                            Rp{' '}
                            {Number(
                                row.original.payload.price || 0,
                            ).toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">
                            <CalendarDays className="h-4 w-4" />
                            {row.original.payload.duration_days} DAYS
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'type',
                header: () => (
                    <div className="text-center text-[11px] font-black tracking-widest uppercase">
                        Service
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <div className="rounded-2xl border-b-4 border-black/40 bg-[#2d1810] px-6 py-2 text-[10px] font-black tracking-[0.3em] text-white uppercase shadow-2xl">
                            {row.original.payload.package_type}
                        </div>
                    </div>
                ),
            },
        );
    }

    if (resource.key === 'schedules') {
        cols.push(
            {
                accessorKey: 'sch_city',
                header: () => (
                    <div className="text-[11px] font-black tracking-widest uppercase">
                        Hub
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary/40" />
                        <span className="text-[12px] font-black tracking-widest text-[#2d1810] uppercase">
                            {row.original.payload.departure_city || '-'}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'seats',
                header: () => (
                    <div className="text-center text-[11px] font-black tracking-widest uppercase">
                        Availability
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary/30" />
                            <span
                                className={cn(
                                    'text-lg font-black tracking-tighter',
                                    Number(
                                        row.original.payload.seats_available,
                                    ) < 5
                                        ? 'text-destructive'
                                        : 'text-green-600',
                                )}
                            >
                                {row.original.payload.seats_available} /{' '}
                                {row.original.payload.seats_total}
                            </span>
                        </div>
                        <div className="h-2.5 w-32 overflow-hidden rounded-full border-2 border-border/40 bg-muted shadow-inner">
                            <div
                                className={cn(
                                    'h-full transition-all duration-1000',
                                    Number(
                                        row.original.payload.seats_available,
                                    ) < 5
                                        ? 'bg-destructive shadow-[0_0_15px_rgba(255,0,0,0.5)]'
                                        : 'bg-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]',
                                )}
                                style={{
                                    width: `${(Number(row.original.payload.seats_available) / (Number(row.original.payload.seats_total) || 1)) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'date',
                header: () => (
                    <div className="text-right text-[11px] font-black tracking-widest uppercase">
                        Schedule
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="text-right">
                        <span className="rounded-2xl border-b-4 border-primary-foreground/20 bg-primary px-5 py-2.5 text-[12px] font-black tracking-tighter text-white shadow-xl shadow-primary/20">
                            {formatDateLabel(
                                row.original.payload.departure_date,
                            )}
                        </span>
                    </div>
                ),
            },
        );
    }

    if (resource.key === 'products') {
        cols.push({
            accessorKey: 'category',
            header: () => (
                <div className="text-[11px] font-black tracking-widest uppercase">
                    Type
                </div>
            ),
            cell: ({ row }) => {
                const cat = (
                    resource.meta?.product_category_options || []
                ).find((c: any) => c.key === row.original.payload.product_type);
                return (
                    <div className="rounded-2xl border-b-4 border-primary-foreground/20 bg-primary px-6 py-3 text-[11px] font-black tracking-[0.3em] text-white uppercase shadow-2xl">
                        {cat ? localizedValue(cat.name) : '-'}
                    </div>
                );
            },
        });
    }

    cols.push(
        {
            accessorKey: 'status',
            header: () => (
                <div className="text-center text-[11px] font-black tracking-widest text-primary/40 uppercase">
                    Status
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <div
                        className={cn(
                            'rounded-full border-4 px-6 py-2 text-[10px] font-black tracking-[0.4em] shadow-2xl',
                            row.original.status
                                ? 'border-green-300 bg-green-500 text-white'
                                : 'border-slate-500 bg-slate-700 text-white',
                        )}
                    >
                        {row.original.status ? 'LIVE' : 'DRAFT'}
                    </div>
                </div>
            ),
        },
        {
            id: 'actions',
            header: () =>
                compact ? (
                    <div className="text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Actions
                    </div>
                ) : null,
            cell: ({ row }) =>
                compact ? (
                    <div className="flex justify-end">
                        <Select
                            value=""
                            onValueChange={(value) => {
                                if (value === 'edit') {
                                    setEdit(row.original.item);
                                    return;
                                }

                                if (value === 'delete') {
                                    setDelete(row.original.id);
                                }
                            }}
                        >
                            <SelectTrigger className="h-9 w-[172px]">
                                <div className="flex items-center gap-2">
                                    <Pencil className="h-4 w-4" />
                                    <SelectValue placeholder="Pilih action" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="edit">Edit data</SelectItem>
                                <SelectItem value="delete">
                                    Hapus data
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div className="flex justify-end gap-6">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-16 w-16 rounded-[1.5rem] border-4 border-border/60 bg-white shadow-2xl transition-all hover:scale-110 hover:border-primary hover:text-primary active:scale-90"
                            onClick={() => setEdit(row.original.item)}
                        >
                            <Pencil className="h-7 w-7 stroke-[3px]" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-16 w-16 rounded-[1.5rem] border-4 border-border/60 bg-white shadow-2xl transition-all hover:scale-110 hover:border-destructive hover:text-destructive active:scale-90"
                            onClick={() => setDelete(row.original.id)}
                        >
                            <Trash2 className="h-7 w-7 stroke-[3px]" />
                        </Button>
                    </div>
                ),
        },
    );
    return cols;
}

function buildResourceFilters(
    k: string,
    m: any,
    rows: any[],
): ResourceFilterDefinition[] {
    const f: ResourceFilterDefinition[] = [
        {
            key: 'status',
            label: 'STATUS DATA',
            options: [
                { label: 'SEMUA STATUS', value: 'all' },
                { label: 'LIVE (AKTIF)', value: 'active' },
                { label: 'DRAFT (ARSIP)', value: 'inactive' },
            ],
            getValue: (r) => (r.status ? 'active' : 'inactive'),
        },
    ];
    if (k === 'products' && m.product_category_options)
        f.unshift({
            key: 'product_type',
            label: 'TIPE PRODUK',
            options: [
                { label: 'SEMUA KATEGORI', value: 'all' },
                ...productCategoryOptions(m.product_category_options),
            ],
            getValue: (r) => r.payload.product_type,
        });
    if (k === 'packages' || k === 'schedules') {
        const cities = Array.from(
            new Set(rows.map((r) => r.payload.departure_city).filter(Boolean)),
        );
        f.unshift({
            key: 'city',
            label: 'KOTA KEBERANGKATAN',
            options: [
                { label: 'SEMUA KOTA', value: 'all' },
                ...cities.map((c) => ({
                    label: String(c).toUpperCase(),
                    value: String(c),
                })),
            ],
            getValue: (r) => r.payload.departure_city,
        });
        if (k === 'packages')
            f.unshift({
                key: 'package_type',
                label: 'TIPE PAKET',
                options: [
                    { label: 'SEMUA TIPE', value: 'all' },
                    ...packageTypeOptions,
                ],
                getValue: (r) => r.payload.package_type,
            });
    }
    return f;
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    color = 'primary',
    compact = false,
}: any) {
    const c =
        color === 'green'
            ? 'bg-green-500 text-white shadow-green-500/40'
            : color === 'slate'
              ? 'bg-[#2d1810] text-white shadow-black/40'
              : 'bg-primary text-white shadow-primary/40';
    const bg =
        color === 'green'
            ? 'bg-white border-green-500/20'
            : color === 'slate'
              ? 'bg-white border-[#2d1810]/20'
              : 'bg-white border-primary/20';

    if (compact) {
        return (
            <Card className={cn('rounded-xl border bg-card shadow-sm', bg)}>
                <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {label}
                        </p>
                        <p className="text-3xl font-semibold tracking-tight text-[#2d1810]">
                            {value}
                        </p>
                    </div>
                    {Icon ? (
                        <div className={cn('rounded-lg p-2 text-white', c)}>
                            <Icon className="h-5 w-5" />
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'group overflow-hidden rounded-[4rem] border-4 border-b-[20px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all hover:translate-y-[-15px] active:scale-95',
                bg,
            )}
        >
            <CardContent className="relative flex items-center justify-between overflow-hidden p-12">
                <div className="absolute top-0 right-0 transform p-4 opacity-5 transition-opacity duration-1000 group-hover:scale-150 group-hover:opacity-20">
                    <Icon className="h-48 w-48 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                    <p className="text-[13px] font-black tracking-[0.5em] text-muted-foreground/30 uppercase">
                        {label}
                    </p>
                    <p className="origin-left text-8xl leading-none font-black tracking-tighter text-[#2d1810] transition-transform group-hover:scale-110">
                        {value}
                    </p>
                </div>
                {Icon && (
                    <div
                        className={cn(
                            'relative z-10 rounded-[3rem] border-8 border-white p-8 shadow-2xl transition-all duration-1000 group-hover:rotate-[360deg]',
                            c,
                        )}
                    >
                        <Icon className="h-10 w-10 stroke-[4px]" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function destroyResourceItem(k: string, l: string, id: number) {
    router.delete(`/admin/website-management/content/resources/${k}/${id}`, {
        preserveScroll: true,
        onSuccess: () => toast.success(`Resource ${l} Eliminated`),
    });
}

function summarizeResourceItem(k: string, p: any) {
    return k === 'products'
        ? `CODE: ${p.code}`
        : k === 'packages'
          ? `HUB: ${p.departure_city} â€¢ ${p.code}`
          : k === 'faqs'
            ? `URUTAN: ${p.sort_order ?? 0}`
            : k === 'legal_documents'
              ? `NO: ${p.document_number || '-'}`
              : p.key || p.code || localizedValue(p.title) || '-';
}
function localizedValue(v: any) {
    return typeof v === 'string' ? v : v?.id || v?.en || stringValue(v);
}
function productCategoryOptions(o: any) {
    return Array.isArray(o)
        ? o.map((c: any) => ({
              label: `${localizedValue(c.name)}`.toUpperCase(),
              value: c.key,
          }))
        : [];
}
function formatDateLabel(v: any): string {
    const rv = stringValue(v);
    if (!rv) return '-';
    try {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(rv));
    } catch {
        return rv;
    }
}
