import { Head, router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAdminLocale } from '@/contexts/admin-locale';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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

type Option = {
    label: string;
    value: string;
};

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

type ResourceFilterDefinition = {
    key: string;
    label: string;
    options: Option[];
    getValue: (row: ResourceTableRow) => string;
};

const packageTypeOptions: Option[] = [
    { label: 'Reguler', value: 'reguler' },
    { label: 'VIP', value: 'vip' },
    { label: 'Private', value: 'private' },
];

const partnerCategoryOptions: Option[] = [
    { label: 'Maskapai', value: 'maskapai' },
    { label: 'Hotel', value: 'hotel' },
    { label: 'Komunitas', value: 'komunitas' },
    { label: 'Bank', value: 'bank' },
];

const scheduleStatusOptions: Option[] = [
    { label: 'Open', value: 'open' },
    { label: 'Full', value: 'full' },
    { label: 'Closed', value: 'closed' },
];

const resourceFieldDefinitions: Record<string, FieldDefinition[]> = {
    product_categories: [
        { path: 'key', label: 'Key Kategori', type: 'text' },
        { path: 'name', label: 'Nama Kategori', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Kategori', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Kategori Aktif', type: 'checkbox' },
    ],
    products: [
        { path: 'code', label: 'Kode Produk', type: 'text' },
        { path: 'slug', label: 'Slug', type: 'text' },
        { path: 'product_type', label: 'Tipe Produk', type: 'select', optionsKey: 'product_category_options' },
        { path: 'name', label: 'Nama Produk', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Produk', type: 'localized-textarea' },
        { path: 'content.unit', label: 'Satuan / Unit', type: 'localized-text' },
        { path: 'is_active', label: 'Produk Aktif', type: 'checkbox' },
    ],
    packages: [
        { path: 'code', label: 'Kode Package', type: 'text' },
        { path: 'slug', label: 'Slug', type: 'text' },
        { path: 'package_type', label: 'Tipe Package', type: 'select', options: packageTypeOptions },
        { path: 'departure_city', label: 'Kota Keberangkatan', type: 'text' },
        { path: 'duration_days', label: 'Durasi (Hari)', type: 'number', min: 1, step: 1 },
        { path: 'price', label: 'Harga Package', type: 'number', min: 0, step: 1000 },
        { path: 'currency', label: 'Mata Uang', type: 'text' },
        { path: 'image_path', label: 'Foto Package', type: 'image', description: 'Upload foto utama package. Preview akan langsung berubah setelah file dipilih.' },
        { path: 'name', label: 'Nama Package', type: 'localized-text' },
        { path: 'summary', label: 'Ringkasan Package', type: 'localized-textarea' },
        { path: 'content.badge', label: 'Badge', type: 'localized-text' },
        { path: 'content.period', label: 'Periode', type: 'localized-text' },
        { path: 'content.airline', label: 'Maskapai', type: 'localized-text' },
        { path: 'content.hotel', label: 'Hotel', type: 'localized-text' },
        { path: 'content.highlight.title', label: 'Highlight Title', type: 'localized-text' },
        { path: 'content.highlight.desc', label: 'Highlight Description', type: 'localized-textarea' },
        { path: 'content.included', label: 'Termasuk', type: 'localized-list', description: 'Satu item per baris.' },
        { path: 'content.excluded', label: 'Tidak Termasuk', type: 'localized-list', description: 'Satu item per baris.' },
        { path: 'content.requirements', label: 'Persyaratan', type: 'localized-list', description: 'Satu item per baris.' },
        { path: 'content.payment', label: 'Pembayaran', type: 'localized-list', description: 'Satu item per baris.' },
        { path: 'content.policy', label: 'Kebijakan', type: 'localized-textarea' },
        { path: 'content.itinerary', label: 'Itinerary', type: 'itinerary', description: 'Format per baris: Title | Description' },
        { path: 'product_codes', label: 'Produk Dalam Package', type: 'product-selector', description: 'Pilih beberapa product untuk digabungkan ke package. Harga package tetap ditentukan terpisah.' },
        { path: 'is_featured', label: 'Tampilkan Sebagai Featured', type: 'checkbox' },
        { path: 'is_active', label: 'Package Aktif', type: 'checkbox' },
    ],
    schedules: [
        { path: 'travel_package_code', label: 'Pilih Package', type: 'select', optionsKey: 'package_options' },
        { path: 'departure_date', label: 'Tanggal Berangkat', type: 'date' },
        { path: 'return_date', label: 'Tanggal Pulang', type: 'date' },
        { path: 'departure_city', label: 'Kota Keberangkatan', type: 'text' },
        { path: 'seats_total', label: 'Total Seat', type: 'number', min: 0, step: 1 },
        { path: 'seats_available', label: 'Seat Tersedia', type: 'number', min: 0, step: 1 },
        { path: 'status', label: 'Status', type: 'select', options: scheduleStatusOptions },
        { path: 'notes', label: 'Catatan', type: 'textarea' },
        { path: 'is_active', label: 'Jadwal Aktif', type: 'checkbox' },
    ],
    services: [
        { path: 'title', label: 'Judul Layanan', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Layanan', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Layanan Aktif', type: 'checkbox' },
    ],
    faqs: [
        { path: 'question', label: 'Pertanyaan', type: 'localized-textarea' },
        { path: 'answer', label: 'Jawaban', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'FAQ Aktif', type: 'checkbox' },
    ],
    articles: [
        { path: 'slug', label: 'Slug', type: 'text' },
        { path: 'image_path', label: 'Path Gambar', type: 'text' },
        { path: 'published_at', label: 'Tanggal Publikasi', type: 'text' },
        { path: 'title', label: 'Judul Artikel', type: 'localized-text' },
        { path: 'excerpt', label: 'Ringkasan Artikel', type: 'localized-textarea' },
        { path: 'body', label: 'Isi Artikel', type: 'localized-textarea' },
        { path: 'is_featured', label: 'Artikel Featured', type: 'checkbox' },
        { path: 'is_active', label: 'Artikel Aktif', type: 'checkbox' },
    ],
    testimonials: [
        { path: 'name', label: 'Nama Jamaah', type: 'text' },
        { path: 'origin_city', label: 'Kota Asal', type: 'text' },
        { path: 'travel_package_code', label: 'Kode Package', type: 'text' },
        { path: 'quote', label: 'Testimoni', type: 'localized-textarea' },
        { path: 'rating', label: 'Rating', type: 'number', min: 1, step: 1 },
        { path: 'is_featured', label: 'Featured', type: 'checkbox' },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    gallery: [
        { path: 'category', label: 'Kategori', type: 'text' },
        { path: 'image_path', label: 'Path Gambar', type: 'text' },
        { path: 'title', label: 'Judul Galeri', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Galeri', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    team: [
        { path: 'name', label: 'Nama Tim', type: 'text' },
        { path: 'image_path', label: 'Path Foto', type: 'text' },
        { path: 'role', label: 'Jabatan', type: 'localized-text' },
        { path: 'bio', label: 'Bio', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    legal_documents: [
        { path: 'document_number', label: 'Nomor Dokumen', type: 'text' },
        { path: 'title', label: 'Judul Dokumen', type: 'localized-text' },
        { path: 'issued_by', label: 'Diterbitkan Oleh', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Dokumen', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    partners: [
        { path: 'name', label: 'Nama Mitra', type: 'text' },
        { path: 'category', label: 'Kategori', type: 'select', options: partnerCategoryOptions },
        { path: 'logo_path', label: 'Path Logo', type: 'text' },
        { path: 'description', label: 'Deskripsi Mitra', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
    career_openings: [
        { path: 'location', label: 'Lokasi', type: 'text' },
        { path: 'employment_type', label: 'Tipe Kerja', type: 'text' },
        { path: 'title', label: 'Judul Lowongan', type: 'localized-text' },
        { path: 'description', label: 'Deskripsi Lowongan', type: 'localized-textarea' },
        { path: 'requirements', label: 'Kualifikasi', type: 'localized-textarea' },
        { path: 'sort_order', label: 'Urutan', type: 'number', min: 0, step: 1 },
        { path: 'is_active', label: 'Aktif', type: 'checkbox' },
    ],
};

export default function ContentIndex({
    heading = 'Content Management',
    description = 'Kelola konten website.',
    breadcrumbHref = '/dashboard/website-management/content',
    resources,
}: {
    heading?: string;
    description?: string;
    breadcrumbHref?: string;
    pages: never[];
    resources: ResourceSection[];
}) {
    const defaultTab = resources[0]?.key ?? 'resource';

    return (
        <AppSidebarLayout breadcrumbs={[{ title: heading, href: breadcrumbHref }]}>
            <Head title={heading} />

            <div className="space-y-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{heading}</h1>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <Tabs defaultValue={defaultTab} className="w-full space-y-6">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-xl bg-muted/60 p-2">
                        {resources.map((resource) => (
                            <TabsTrigger key={resource.key} value={resource.key} className="min-w-[140px] rounded-lg text-xs sm:text-sm">
                                {resource.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {resources.map((resource) => (
                        <TabsContent key={resource.key} value={resource.key} className="space-y-6">
                            <ResourceSectionPanel resource={resource} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function ResourceSectionPanel({ resource }: { resource: ResourceSection }) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const createForm = useForm({
        payload: clonePayload(resource.template),
        image: null as File | null,
    });

    const createItem = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        createForm.post(`/dashboard/website-management/content/resources/${resource.key}`, {
            forceFormData: resource.key === 'packages',
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${resource.label} berhasil ditambahkan`);
                createForm.setData('payload', clonePayload(resource.template));
                createForm.setData('image', null);
                setIsCreateDialogOpen(false);
            },
        });
    };

    const rows = useMemo<ResourceTableRow[]>(() => {
        return resource.items.map((item, index) => ({
            id: item.id,
            number: index + 1,
            title: item.title,
            summary: summarizeResourceItem(resource.key, item.payload),
            status: Boolean(item.payload?.is_active ?? true),
            payload: item.payload,
            item,
        }));
    }, [resource.items, resource.key]);

    const filterDefinitions = useMemo<ResourceFilterDefinition[]>(() => buildResourceFilters(resource.key, rows, resource.meta ?? {}), [resource.key, resource.meta, rows]);
    const filteredRows = useMemo<ResourceTableRow[]>(() => {
        if (filterDefinitions.length === 0) {
            return rows;
        }

        return rows.filter((row) =>
            filterDefinitions.every((filter) => {
                const selectedValue = activeFilters[filter.key];

                if (!selectedValue || selectedValue === 'all') {
                    return true;
                }

                return filter.getValue(row) === selectedValue;
            }),
        );
    }, [activeFilters, filterDefinitions, rows]);

    const columns = useMemo<ColumnDef<ResourceTableRow>[]>(
        () => [
            {
                accessorKey: 'number',
                header: () => <div className="w-12 text-center">No</div>,
                cell: ({ row }) => <div className="text-center font-medium">{row.original.number}</div>,
                enableSorting: false,
            },
            {
                accessorKey: 'title',
                header: 'Judul',
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="font-medium text-foreground">{row.original.title}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">{row.original.summary}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'summary',
                header: 'Ringkasan',
                cell: ({ row }) => <div className="max-w-xl text-sm text-muted-foreground">{row.original.summary}</div>,
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            row.original.status ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                        {row.original.status ? 'Aktif' : 'Nonaktif'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-center">Aksi</div>,
                cell: ({ row }) => (
                    <div className="flex justify-center gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingItem(row.original.item)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => destroyResourceItem(resource.key, resource.label, row.original.item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [resource.key, resource.label],
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle>{resource.label}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                    </div>
                    <Button type="button" onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah {resource.label}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Item</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{filteredRows.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Item Aktif</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{filteredRows.filter((row) => row.status).length}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Item Nonaktif</p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">{filteredRows.filter((row) => !row.status).length}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {filterDefinitions.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {filterDefinitions.map((filter) => (
                                <div key={filter.key} className="space-y-2">
                                    <Label>{filter.label}</Label>
                                    <Select
                                        value={activeFilters[filter.key] ?? 'all'}
                                        onValueChange={(value) =>
                                            setActiveFilters((current) => ({
                                                ...current,
                                                [filter.key]: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Semua ${filter.label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            {filter.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {resource.key === 'schedules' ? (
                        <SchedulesTable rows={filteredRows} onEdit={(item) => setEditingItem(item)} onDelete={(item) => destroyResourceItem(resource.key, resource.label, item.id)} />
                    ) : (
                        <DataTable columns={columns} data={filteredRows} searchKey="title" searchPlaceholder={`Cari ${resource.label.toLowerCase()}...`} />
                    )}
                </CardContent>
            </Card>

            <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <SheetContent side="right" className="w-full overflow-y-auto border-l sm:max-w-3xl lg:max-w-5xl">
                    <SheetHeader className="border-b px-6 py-5">
                        <SheetTitle>Tambah {resource.label}</SheetTitle>
                        <SheetDescription>{resource.description}</SheetDescription>
                    </SheetHeader>
                    <div className="p-6">
                    <ResourceEditorForm
                        title={`Tambah ${resource.label}`}
                        submitLabel="Tambah Item"
                        resourceKey={resource.key}
                        resourceMeta={resource.meta ?? {}}
                        data={createForm.data.payload}
                        setData={(payload) => createForm.setData('payload', payload)}
                        image={createForm.data.image}
                        setImage={(image) => createForm.setData('image', image)}
                        errors={createForm.errors}
                        processing={createForm.processing}
                        onSubmit={createItem}
                    />
                    </div>
                </SheetContent>
            </Sheet>

            {editingItem ? (
                <EditResourceDialog
                    item={editingItem}
                    resourceKey={resource.key}
                    label={resource.label}
                    resourceMeta={resource.meta ?? {}}
                    onClose={() => setEditingItem(null)}
                />
            ) : null}
        </div>
    );
}

function EditResourceDialog({
    resourceKey,
    label,
    item,
    resourceMeta,
    onClose,
}: {
    resourceKey: string;
    label: string;
    item: ResourceItem;
    resourceMeta: Record<string, any>;
    onClose: () => void;
}) {
    const form = useForm({
        payload: clonePayload(item.payload),
        image: null as File | null,
        _method: 'PATCH',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(`/dashboard/website-management/content/resources/${resourceKey}/${item.id}`, {
            forceFormData: resourceKey === 'packages',
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${label} berhasil diperbarui`);
                form.setData('image', null);
                onClose();
            },
        });
    };

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full overflow-y-auto border-l sm:max-w-3xl lg:max-w-5xl">
                <SheetHeader className="border-b px-6 py-5">
                    <SheetTitle>{item.title}</SheetTitle>
                    <SheetDescription>ID: {item.id}</SheetDescription>
                </SheetHeader>
                <div className="p-6">
                <ResourceEditorForm
                    title={item.title}
                    submitLabel="Simpan Perubahan"
                    resourceKey={resourceKey}
                    resourceMeta={resourceMeta}
                    data={form.data.payload}
                    setData={(payload) => form.setData('payload', payload)}
                    image={form.data.image}
                    setImage={(image) => form.setData('image', image)}
                    errors={form.errors}
                    processing={form.processing}
                    onSubmit={submit}
                />
                </div>
            </SheetContent>
        </Sheet>
    );
}

function ResourceEditorForm({
    title,
    submitLabel,
    resourceKey,
    resourceMeta,
    data,
    setData,
    image,
    setImage,
    errors,
    processing,
    onSubmit,
}: {
    title: string;
    submitLabel: string;
    resourceKey: string;
    resourceMeta: Record<string, any>;
    data: Record<string, any>;
    setData: (payload: Record<string, any>) => void;
    image: File | null;
    setImage: (image: File | null) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const { locale } = useAdminLocale();
    const fields = resourceFieldDefinitions[resourceKey] ?? [];
    const selectedProductCategoryKey = resourceKey === 'products' ? stringValue(getNestedValue(data, 'product_type')) : '';

    const updateValue = (path: string, value: any) => {
        setData(updateNestedValue(data, path, value));
    };

    useEffect(() => {
        if (resourceKey !== 'products' || !selectedProductCategoryKey) {
            return;
        }

        const categoryOptions = Array.isArray(resourceMeta.product_category_options)
            ? (resourceMeta.product_category_options as ProductCategoryOption[])
            : [];
        const selectedCategory = categoryOptions.find((category) => category.key === selectedProductCategoryKey);

        if (!selectedCategory?.default_unit || typeof selectedCategory.default_unit !== 'object') {
            return;
        }

        const currentUnit = getNestedValue(data, 'content.unit');
        const currentUnitId = stringValue(currentUnit?.id);
        const currentUnitEn = stringValue(currentUnit?.en);

        if (currentUnitId || currentUnitEn) {
            return;
        }

        setData(
            updateNestedValue(
                updateNestedValue(data, 'content.unit.id', stringValue(selectedCategory.default_unit.id)),
                'content.unit.en',
                stringValue(selectedCategory.default_unit.en),
            ),
        );
    }, [data, resourceKey, resourceMeta.product_category_options, selectedProductCategoryKey, setData]);

    return (
        <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                    <FieldRenderer
                        key={field.path}
                        field={field}
                        data={data}
                        resourceMeta={resourceMeta}
                        locale={locale}
                        image={image}
                        setImage={setImage}
                        onChange={updateValue}
                    />
                ))}
            </div>

            {(errors.payload || errors.payload_json || errors.image) && <p className="text-sm text-destructive">{errors.payload ?? errors.payload_json ?? errors.image}</p>}

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

function FieldRenderer({
    field,
    data,
    resourceMeta,
    locale,
    image,
    setImage,
    onChange,
}: {
    field: FieldDefinition;
    data: Record<string, any>;
    resourceMeta: Record<string, any>;
    locale: 'id' | 'en';
    image: File | null;
    setImage: (image: File | null) => void;
    onChange: (path: string, value: any) => void;
}) {
    if (field.type === 'image') {
        return (
            <ImageUploadField
                label={field.label}
                description={field.description}
                value={stringValue(getNestedValue(data, field.path))}
                file={image}
                onChange={(nextImage) => setImage(nextImage)}
            />
        );
    }

    if (field.type === 'localized-text' || field.type === 'localized-textarea') {
        const Component = field.type === 'localized-text' ? Input : Textarea;
        const localeLabel = locale === 'id' ? 'Indonesia' : 'English';

        return (
            <div className="space-y-3 md:col-span-2">
                <div>
                    <Label>{field.label}</Label>
                    {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Sedang mengedit bahasa {localeLabel}.</p>
                </div>
                <div className="space-y-2">
                    <Label>{field.label} {locale === 'id' ? 'ID' : 'EN'}</Label>
                    <Component value={stringValue(getNestedValue(data, `${field.path}.${locale}`))} onChange={(event) => onChange(`${field.path}.${locale}`, event.target.value)} />
                </div>
            </div>
        );
    }

    if (field.type === 'localized-list') {
        const localeLabel = locale === 'id' ? 'Indonesia' : 'English';

        return (
            <div className="space-y-3 md:col-span-2">
                <div>
                    <Label>{field.label}</Label>
                    {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Sedang mengedit bahasa {localeLabel}.</p>
                </div>
                <div className="space-y-2">
                    <Label>{field.label} {locale === 'id' ? 'ID' : 'EN'}</Label>
                    <Textarea
                        className="min-h-32"
                        value={joinLines(getNestedValue(data, `${field.path}.${locale}`))}
                        onChange={(event) => onChange(`${field.path}.${locale}`, splitLines(event.target.value))}
                    />
                </div>
            </div>
        );
    }

    if (field.type === 'itinerary') {
        const localeLabel = locale === 'id' ? 'Indonesia' : 'English';
        const otherLocale = locale === 'id' ? 'en' : 'id';

        return (
            <div className="space-y-3 md:col-span-2">
                <div>
                    <Label>{field.label}</Label>
                    {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Sedang mengedit bahasa {localeLabel}.</p>
                </div>
                <div className="space-y-2">
                    <Label>{field.label} {locale === 'id' ? 'ID' : 'EN'}</Label>
                    <Textarea
                        className="min-h-40"
                        value={serializeItinerary(getNestedValue(data, field.path), locale)}
                        onChange={(event) =>
                            onChange(field.path, parseItinerary(event.target.value, serializeItinerary(getNestedValue(data, field.path), otherLocale), locale))
                        }
                    />
                </div>
            </div>
        );
    }

    if (field.type === 'code-list') {
        return (
            <div className="space-y-2 md:col-span-2">
                <Label>{field.label}</Label>
                {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                <Textarea className="min-h-32" value={joinLines(getNestedValue(data, field.path))} onChange={(event) => onChange(field.path, splitLines(event.target.value))} />
            </div>
        );
    }

    if (field.type === 'product-selector') {
        const productOptions = Array.isArray(resourceMeta.product_options) ? (resourceMeta.product_options as ProductOption[]) : [];
        const selectedCodes = Array.isArray(getNestedValue(data, field.path)) ? (getNestedValue(data, field.path) as string[]) : [];

        const syncSelectedProducts = (nextValue: string[]) => {
            onChange(field.path, nextValue);
            onChange('content.included', buildIncludedFromSelectedProducts(nextValue, productOptions));
        };

        const toggleProduct = (code: string, checked: boolean) => {
            const nextValue = checked ? [...selectedCodes.filter((item) => item !== code), code] : selectedCodes.filter((item) => item !== code);
            syncSelectedProducts(nextValue);
        };

        const moveProduct = (code: string, direction: 'up' | 'down') => {
            const currentIndex = selectedCodes.indexOf(code);

            if (currentIndex === -1) {
                return;
            }

            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

            if (targetIndex < 0 || targetIndex >= selectedCodes.length) {
                return;
            }

            const reordered = [...selectedCodes];
            const [movedItem] = reordered.splice(currentIndex, 1);
            reordered.splice(targetIndex, 0, movedItem);
            syncSelectedProducts(reordered);
        };

        return (
            <div className="space-y-3 md:col-span-2">
                <div>
                    <Label>{field.label}</Label>
                    {field.description && <p className="mt-1 text-xs text-muted-foreground">{field.description}</p>}
                </div>

                {selectedCodes.length > 0 ? (
                    <div className="space-y-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">Product yang akan menjadi include package</p>
                            <p className="text-xs text-muted-foreground">Urutan di sini akan ikut menjadi urutan daftar termasuk pada package.</p>
                        </div>

                        <div className="space-y-2">
                            {selectedCodes.map((code, index) => {
                                const product = productOptions.find((item) => item.code === code);

                                return (
                                    <div key={code} className="flex flex-col gap-3 rounded-lg border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-foreground">{code}</span>
                                                {product ? (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                        {product.product_type}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{product ? localizedValue(product.name) : 'Produk tidak ditemukan'}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => moveProduct(code, 'up')} disabled={index === 0}>
                                                <ArrowUp className="mr-1 h-4 w-4" />
                                                Naik
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => moveProduct(code, 'down')}
                                                disabled={index === selectedCodes.length - 1}
                                            >
                                                <ArrowDown className="mr-1 h-4 w-4" />
                                                Turun
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => toggleProduct(code, false)} className="text-destructive">
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada product yang dipilih untuk package ini.</p>
                )}

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {productOptions.map((product) => {
                        const isChecked = selectedCodes.includes(product.code);

                        return (
                            <label
                                key={product.code}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                                    isChecked ? 'border-primary bg-primary/5' : 'border-border bg-background'
                                }`}
                            >
                                <Checkbox checked={isChecked} onCheckedChange={(checked) => toggleProduct(product.code, checked === true)} />
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-foreground">{product.code}</span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                            {product.product_type}
                                        </span>
                                        {!product.is_active ? (
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Nonaktif</span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{localizedValue(product.name)}</p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className="space-y-2 md:col-span-2">
                <Label>{field.label}</Label>
                {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                <Textarea className="min-h-32" value={stringValue(getNestedValue(data, field.path))} onChange={(event) => onChange(field.path, event.target.value)} />
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <Checkbox checked={Boolean(getNestedValue(data, field.path))} onCheckedChange={(checked) => onChange(field.path, checked === true)} />
                <div>
                    <Label>{field.label}</Label>
                    {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                </div>
            </div>
        );
    }

    if (field.type === 'select') {
        const dynamicOptions =
            field.optionsKey === 'package_options'
                ? ((resourceMeta.package_options as PackageOption[] | undefined)?.map((option) => ({
                      value: option.code,
                      label: `${option.code} • ${localizedValue(option.name)} • ${option.departure_city} • ${option.duration_days} hari`,
                  })) ?? [])
                : field.optionsKey === 'product_category_options'
                  ? productCategoryOptions(resourceMeta.product_category_options)
                  : [];
        const selectOptions = field.options ?? dynamicOptions;
        const selectDescription =
            field.optionsKey === 'product_category_options'
                ? field.description ?? 'Saat kategori dipilih, satuan default product akan terisi otomatis.'
                : field.description;

        return (
            <div className="space-y-2">
                <Label>{field.label}</Label>
                {selectDescription && <p className="text-xs text-muted-foreground">{selectDescription}</p>}
                <Select value={stringValue(getNestedValue(data, field.path))} onValueChange={(value) => onChange(field.path, value)}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {selectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';

    return (
        <div className="space-y-2">
            <Label>{field.label}</Label>
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            <Input
                type={inputType}
                min={field.min}
                step={field.step}
                value={stringValue(getNestedValue(data, field.path))}
                onChange={(event) => onChange(field.path, field.type === 'number' ? parseNumber(event.target.value) : event.target.value)}
            />
        </div>
    );
}

function ImageUploadField({
    label,
    description,
    value,
    file,
    onChange,
}: {
    label: string;
    description?: string;
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
        <div className="space-y-3 md:col-span-2">
            <div>
                <Label>{label}</Label>
                {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
                    <img src={previewUrl ?? value ?? '/images/dummy.jpg'} alt={label} className="h-44 w-full object-cover" />
                </div>
                <div className="space-y-3">
                    <Input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
                    <div className="rounded-xl border border-dashed border-border bg-background px-3 py-3 text-xs text-muted-foreground">
                        {file ? (
                            <>
                                File terpilih: <span className="font-mono text-foreground">{file.name}</span>
                            </>
                        ) : (
                            <>
                                Gambar saat ini: <span className="font-mono">{value || '-'}</span>
                            </>
                        )}
                    </div>
                    {file ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>
                            Hapus Pilihan File
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function clonePayload<T>(payload: T): T {
    return JSON.parse(JSON.stringify(payload));
}

function getNestedValue(source: Record<string, any>, path: string): any {
    return path.split('.').reduce<any>((current, segment) => current?.[segment], source);
}

function updateNestedValue(source: Record<string, any>, path: string, value: any): Record<string, any> {
    const clone = clonePayload(source);
    const segments = path.split('.');
    let current: Record<string, any> = clone;

    segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
            current[segment] = value;

            return;
        }

        if (typeof current[segment] !== 'object' || current[segment] === null || Array.isArray(current[segment])) {
            current[segment] = {};
        }

        current = current[segment];
    });

    return clone;
}

function joinLines(value: unknown): string {
    return Array.isArray(value) ? value.join('\n') : '';
}

function splitLines(value: string): string[] {
    return value
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

function parseNumber(value: string): number {
    if (value.trim() === '') {
        return 0;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

function stringValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return '';
}

function serializeItinerary(value: unknown, locale: 'id' | 'en'): string {
    if (!Array.isArray(value)) {
        return '';
    }

    return value
        .map((item) => {
            const title = stringValue(item?.title?.[locale]);
            const description = stringValue(item?.desc?.[locale]);

            return `${title} | ${description}`.trim();
        })
        .filter((item) => item !== '|')
        .join('\n');
}

function parseItinerary(changedLocaleValue: string, otherLocaleValue: string, locale: 'id' | 'en'): Array<Record<string, any>> {
    const changedItems = changedLocaleValue.split('\n').map(parseItineraryLine);
    const otherItems = otherLocaleValue.split('\n').map(parseItineraryLine);
    const maxLength = Math.max(changedItems.length, otherItems.length);

    return Array.from({ length: maxLength }, (_, index) => {
        const changedItem = changedItems[index] ?? { title: '', desc: '' };
        const otherItem = otherItems[index] ?? { title: '', desc: '' };

        return {
            title: {
                id: locale === 'id' ? changedItem.title : otherItem.title,
                en: locale === 'en' ? changedItem.title : otherItem.title,
            },
            desc: {
                id: locale === 'id' ? changedItem.desc : otherItem.desc,
                en: locale === 'en' ? changedItem.desc : otherItem.desc,
            },
        };
    }).filter((item) => item.title.id || item.title.en || item.desc.id || item.desc.en);
}

function parseItineraryLine(line: string): { title: string; desc: string } {
    const [title, ...rest] = line.split('|');

    return {
        title: title?.trim() ?? '',
        desc: rest.join('|').trim(),
    };
}

interface ResourceTableRow {
    id: number;
    number: number;
    title: string;
    summary: string;
    status: boolean;
    payload: Record<string, any>;
    item: ResourceItem;
}

interface ProductOption {
    code: string;
    name: Record<string, unknown> | string;
    product_type: string;
    is_active: boolean;
}

interface ProductCategoryOption {
    key: string;
    name: Record<string, unknown> | string;
    description?: Record<string, unknown> | string | null;
    default_unit?: Record<string, unknown> | string | null;
    is_active: boolean;
}

interface PackageOption {
    code: string;
    name: Record<string, unknown> | string;
    departure_city: string;
    duration_days: number;
    is_active: boolean;
}

function SchedulesTable({
    rows,
    onEdit,
    onDelete,
}: {
    rows: ResourceTableRow[];
    onEdit: (item: ResourceItem) => void;
    onDelete: (item: ResourceItem) => void;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-14">No</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Kota</TableHead>
                        <TableHead>Berangkat</TableHead>
                        <TableHead>Pulang</TableHead>
                        <TableHead>Total Seat</TableHead>
                        <TableHead>Seat Tersedia</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length > 0 ? (
                        rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.number}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium text-foreground">{stringValue(row.payload.travel_package_code) || '-'}</div>
                                        <div className="text-xs text-muted-foreground">{row.title}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{stringValue(row.payload.departure_city) || '-'}</TableCell>
                                <TableCell>{formatDateLabel(row.payload.departure_date)}</TableCell>
                                <TableCell>{formatDateLabel(row.payload.return_date)}</TableCell>
                                <TableCell>{stringValue(row.payload.seats_total) || '0'}</TableCell>
                                <TableCell>{stringValue(row.payload.seats_available) || '0'}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            row.payload.status === 'open'
                                                ? 'bg-green-100 text-green-800'
                                                : row.payload.status === 'full'
                                                  ? 'bg-amber-100 text-amber-700'
                                                  : 'bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {stringValue(row.payload.status) || 'open'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(row.item)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(row.item)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                Belum ada jadwal keberangkatan.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function destroyResourceItem(resourceKey: string, label: string, itemId: number): void {
    router.delete(`/dashboard/website-management/content/resources/${resourceKey}/${itemId}`, {
        preserveScroll: true,
        onSuccess: () => toast.success(`${label} berhasil dihapus`),
    });
}

function summarizeResourceItem(resourceKey: string, payload: Record<string, any>): string {
    const summaryEntries: Record<string, string[]> = {
        product_categories: [stringValue(payload.key), localizedValue(payload.name)],
        products: [stringValue(payload.code), stringValue(payload.product_type), localizedValue(payload.name)],
        packages: [
            stringValue(payload.code),
            stringValue(payload.departure_city),
            stringValue(payload.duration_days) ? `${stringValue(payload.duration_days)} hari` : '',
            stringValue(payload.price) ? `Rp ${Number(payload.price).toLocaleString('id-ID')}` : '',
        ],
        schedules: [
            stringValue(payload.travel_package_code),
            stringValue(payload.departure_city),
            formatDateLabel(payload.departure_date),
            stringValue(payload.seats_available) ? `${stringValue(payload.seats_available)} seat` : '',
            stringValue(payload.status),
        ],
        services: [localizedValue(payload.title), stringValue(payload.sort_order)],
        faqs: [localizedValue(payload.question)],
        articles: [stringValue(payload.slug), stringValue(payload.published_at)],
        testimonials: [stringValue(payload.name), stringValue(payload.origin_city), stringValue(payload.rating) ? `${stringValue(payload.rating)} / 5` : ''],
        gallery: [stringValue(payload.category), localizedValue(payload.title)],
        team: [stringValue(payload.name), localizedValue(payload.role)],
        legal_documents: [stringValue(payload.document_number), localizedValue(payload.issued_by)],
        partners: [stringValue(payload.name), stringValue(payload.category)],
        career_openings: [localizedValue(payload.title), stringValue(payload.location), stringValue(payload.employment_type)],
    };

    const selectedSummary = summaryEntries[resourceKey] ?? [localizedValue(payload.title), stringValue(payload.slug), stringValue(payload.code)];

    return selectedSummary.filter(Boolean).join(' • ') || 'Belum ada ringkasan';
}

function localizedValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'object' && value !== null) {
        const localizedRecord = value as Record<string, unknown>;

        return stringValue(localizedRecord.id) || stringValue(localizedRecord.en);
    }

    return '';
}

function productCategoryOptions(options: unknown): Option[] {
    if (!Array.isArray(options)) {
        return [];
    }

    return options.map((option) => {
        const category = option as ProductCategoryOption;

        return {
            label: `${localizedValue(category.name)} (${category.key})`,
            value: category.key,
        };
    });
}

function buildResourceFilters(resourceKey: string, rows: ResourceTableRow[], resourceMeta: Record<string, any>): ResourceFilterDefinition[] {
    const uniqueOptions = (values: string[]): Option[] =>
        Array.from(new Set(values.filter(Boolean)))
            .sort((left, right) => left.localeCompare(right))
            .map((value) => ({ label: value, value }));

    const statusFilter: ResourceFilterDefinition = {
        key: 'status',
        label: 'Status',
        options: [
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
        ],
        getValue: (row) => (row.status ? 'active' : 'inactive'),
    };

    if (resourceKey === 'product_categories') {
        return [statusFilter];
    }

    if (resourceKey === 'products') {
        const categoryOptions = Array.isArray(resourceMeta.product_category_options)
            ? (resourceMeta.product_category_options as ProductCategoryOption[])
            : [];

        return [
            {
                key: 'product_type',
                label: 'Kategori',
                options:
                    categoryOptions.length > 0
                        ? categoryOptions.map((category) => ({
                              label: localizedValue(category.name),
                              value: category.key,
                          }))
                        : uniqueOptions(rows.map((row) => stringValue(row.payload.product_type))),
                getValue: (row) => stringValue(row.payload.product_type),
            },
            statusFilter,
        ];
    }

    if (resourceKey === 'packages') {
        return [
            {
                key: 'package_type',
                label: 'Tipe Package',
                options: uniqueOptions(rows.map((row) => stringValue(row.payload.package_type))),
                getValue: (row) => stringValue(row.payload.package_type),
            },
            {
                key: 'departure_city',
                label: 'Kota',
                options: uniqueOptions(rows.map((row) => stringValue(row.payload.departure_city))),
                getValue: (row) => stringValue(row.payload.departure_city),
            },
            {
                key: 'featured',
                label: 'Featured',
                options: [
                    { label: 'Featured', value: 'yes' },
                    { label: 'Biasa', value: 'no' },
                ],
                getValue: (row) => (Boolean(row.payload.is_featured) ? 'yes' : 'no'),
            },
            statusFilter,
        ];
    }

    if (resourceKey === 'schedules') {
        return [
            {
                key: 'travel_package_code',
                label: 'Package',
                options: uniqueOptions(rows.map((row) => stringValue(row.payload.travel_package_code))),
                getValue: (row) => stringValue(row.payload.travel_package_code),
            },
            {
                key: 'departure_city',
                label: 'Kota',
                options: uniqueOptions(rows.map((row) => stringValue(row.payload.departure_city))),
                getValue: (row) => stringValue(row.payload.departure_city),
            },
            {
                key: 'schedule_status',
                label: 'Status Jadwal',
                options: uniqueOptions(rows.map((row) => stringValue(row.payload.status))),
                getValue: (row) => stringValue(row.payload.status),
            },
            statusFilter,
        ];
    }

    return [];
}

function formatDateLabel(value: unknown): string {
    const rawValue = stringValue(value);

    if (!rawValue) {
        return '-';
    }

    const parsedDate = new Date(`${rawValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return rawValue;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate);
}

function buildIncludedFromSelectedProducts(selectedCodes: string[], productOptions: ProductOption[]): { id: string[]; en: string[] } {
    const selectedProducts = selectedCodes
        .map((code) => productOptions.find((item) => item.code === code))
        .filter((product): product is ProductOption => Boolean(product));

    return {
        id: selectedProducts.map((product) => localizedRecordValue(product.name, 'id')),
        en: selectedProducts.map((product) => localizedRecordValue(product.name, 'en')),
    };
}

function localizedRecordValue(value: Record<string, unknown> | string, locale: 'id' | 'en'): string {
    if (typeof value === 'string') {
        return value;
    }

    return stringValue(value[locale]) || stringValue(value.id) || stringValue(value.en);
}
