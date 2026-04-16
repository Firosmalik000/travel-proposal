import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Camera, DollarSign, FileText, Info, Layers, Tag } from 'lucide-react';
import { toast } from 'sonner';
import packages from '@/routes/packages';
import { ProductSelector } from './ProductSelector';
import type { Package, PackageFormData, ProductOption } from './types';

type Props = {
    pkg: Package | null;
    productOptions: ProductOption[];
    locale: 'id' | 'en';
    onSuccess: () => void;
};

function buildFormData(pkg: Package | null): PackageFormData {
    return {
        code: pkg?.code ?? '',
        slug: pkg?.slug ?? '',
        'name.id': pkg?.name?.id ?? '',
        'name.en': pkg?.name?.en ?? '',
        package_type: pkg?.package_type ?? 'reguler',
        departure_city: pkg?.departure_city ?? '',
        duration_days: pkg?.duration_days ?? 10,
        price: pkg?.price ?? 0,
        original_price: pkg?.original_price ?? '',
        discount_label: pkg?.discount_label ?? '',
        discount_ends_at: pkg?.discount_ends_at ? pkg.discount_ends_at.slice(0, 16) : '',
        currency: pkg?.currency ?? 'IDR',
        image: null,
        'summary.id': pkg?.summary?.id ?? '',
        'summary.en': pkg?.summary?.en ?? '',
        content: pkg?.content ?? {},
        product_ids: pkg?.product_ids ?? [],
        is_featured: pkg?.is_featured ?? false,
        is_active: pkg?.is_active ?? true,
    };
}

function contentField(content: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let val: unknown = content;
    for (const p of parts) val = (val as Record<string, unknown>)?.[p];
    if (typeof val === 'object' && val !== null) return (val as Record<string, string>)?.id ?? '';
    return typeof val === 'string' ? val : '';
}

function setContentField(content: Record<string, unknown>, path: string, locale: 'id' | 'en', value: string): Record<string, unknown> {
    const result = { ...content };
    const parts = path.split('.');
    let cur: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...(cur[parts[i]] as Record<string, unknown> ?? {}) };
        cur = cur[parts[i]] as Record<string, unknown>;
    }
    const last = parts[parts.length - 1];
    const existing = cur[last];
    cur[last] = typeof existing === 'object' && existing !== null
        ? { ...(existing as Record<string, string>), [locale]: value }
        : { id: locale === 'id' ? value : '', en: locale === 'en' ? value : '' };
    return result;
}

/** Normalise string | string[] → newline-joined string for textarea */
function toLines(val: unknown): string {
    if (Array.isArray(val)) return val.join('\n');
    if (typeof val === 'string') return val;
    return '';
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
                {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
            </div>
        </div>
    );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
    return <div className="space-y-3">{children}</div>;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}

export function PackageForm({ pkg, productOptions, locale, onSuccess }: Props) {
    const isEdit = pkg !== null;
    const imageRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(pkg?.image_path ?? null);
    const form = useForm<PackageFormData>(buildFormData(pkg));

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const url = isEdit ? packages.update(pkg.id).url : packages.store().url;
        const hasFile = form.data.image instanceof File;

        if (!hasFile) {
            form.post(url, {
                forceFormData: false,
                onSuccess: () => { toast.success(isEdit ? 'Package diperbarui.' : 'Package ditambahkan.'); onSuccess(); },
                onError: (errors) => toast.error('Error: ' + Object.entries(errors).map(([k,v]) => `${k}: ${v}`).join(' | ')),
            });
            return;
        }

        // Build FormData manually with bracket notation for nested fields
        const fd = new FormData();
        fd.append('_method', 'POST');
        fd.append('code', form.data.code);
        fd.append('slug', form.data.slug);
        fd.append('name[id]', form.data['name.id']);
        fd.append('name[en]', form.data['name.en']);
        fd.append('package_type', form.data.package_type);
        fd.append('departure_city', form.data.departure_city);
        fd.append('duration_days', String(form.data.duration_days));
        fd.append('price', String(form.data.price));
        fd.append('original_price', String(form.data.original_price ?? ''));
        fd.append('discount_label', form.data.discount_label ?? '');
        fd.append('discount_ends_at', form.data.discount_ends_at ?? '');
        fd.append('currency', form.data.currency);
        fd.append('summary[id]', form.data['summary.id']);
        fd.append('summary[en]', form.data['summary.en']);
        fd.append('content', JSON.stringify(form.data.content));
        fd.append('is_featured', form.data.is_featured ? '1' : '0');
        fd.append('is_active', form.data.is_active ? '1' : '0');
        (form.data.product_ids ?? []).forEach((id: number) => fd.append('product_ids[]', String(id)));
        if (form.data.image instanceof File) fd.append('image', form.data.image);

        router.post(url, fd, {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Package diperbarui.' : 'Package ditambahkan.'); onSuccess(); },
            onError: (errors) => toast.error('Error: ' + Object.entries(errors).map(([k,v]) => `${k}: ${v}`).join(' | ')),
        });
    }

    const discountPct = form.data.original_price !== '' && Number(form.data.original_price) > Number(form.data.price)
        ? Math.round((1 - Number(form.data.price) / Number(form.data.original_price)) * 100)
        : null;

    const err = form.errors;

    return (
        <form onSubmit={submit}>
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info" className="gap-1.5 text-xs"><Info className="h-3.5 w-3.5" />Info</TabsTrigger>
                    <TabsTrigger value="harga" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Harga</TabsTrigger>
                    <TabsTrigger value="konten" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Konten</TabsTrigger>
                    <TabsTrigger value="produk" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Produk</TabsTrigger>
                </TabsList>

                {/* ── Tab Info ── */}
                <TabsContent value="info" className="mt-4">
                    <SectionHeader icon={Info} title="Informasi Dasar" desc="Identitas dan detail utama package." />
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Kode *" error={err.code}>
                                <Input value={form.data.code} onChange={(e) => form.setData('code', e.target.value)} placeholder="ASF-REG-10" className="font-mono" />
                            </Field>
                            <Field label="Slug *" error={err.slug} hint="URL-friendly, huruf kecil & tanda hubung">
                                <Input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} placeholder="umroh-reguler-10-hari" />
                            </Field>
                        </div>
                        <Field label="Nama Package (Indonesia) *" error={err['name.id']}>
                            <Input value={form.data['name.id']} onChange={(e) => form.setData('name.id', e.target.value)} placeholder="Umroh Reguler 10 Hari" />
                        </Field>
                        <Field label="Nama Package (English)">
                            <Input value={form.data['name.en']} onChange={(e) => form.setData('name.en', e.target.value)} placeholder="Regular Umrah 10 Days" />
                        </Field>
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Tipe *">
                                <Select value={form.data.package_type} onValueChange={(v) => form.setData('package_type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reguler">🔵 Reguler</SelectItem>
                                        <SelectItem value="hemat">🟢 Hemat</SelectItem>
                                        <SelectItem value="vip">🟡 VIP</SelectItem>
                                        <SelectItem value="premium">🟠 Premium</SelectItem>
                                        <SelectItem value="private">🟣 Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Kota Keberangkatan *" error={err.departure_city}>
                                <Input value={form.data.departure_city} onChange={(e) => form.setData('departure_city', e.target.value)} placeholder="Jakarta" />
                            </Field>
                            <Field label="Durasi (Hari) *">
                                <Input type="number" min={1} value={form.data.duration_days} onChange={(e) => form.setData('duration_days', +e.target.value)} />
                            </Field>
                        </div>

                        {/* Image upload */}
                        <div>
                            <Label className="mb-1.5 block text-xs font-medium">Foto Package</Label>
                            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <div className="flex items-center gap-3">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} className="h-20 w-28 rounded-lg object-cover shadow-sm" />
                                        <button type="button" onClick={() => imageRef.current?.click()} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                                            <Camera className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => imageRef.current?.click()} className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                                        <Camera className="h-5 w-5" />
                                        <span className="text-xs">Upload</span>
                                    </button>
                                )}
                                {previewUrl && (
                                    <Button type="button" size="sm" variant="outline" onClick={() => imageRef.current?.click()}>
                                        Ganti Foto
                                    </Button>
                                )}
                            </div>
                            {err.image && <p className="mt-1 text-xs text-destructive">{err.image}</p>}
                        </div>

                        <Field label="Ringkasan (Indonesia)">
                            <Textarea rows={2} value={form.data['summary.id']} onChange={(e) => form.setData('summary.id', e.target.value)} placeholder="Deskripsi singkat paket..." />
                        </Field>
                        <Field label="Ringkasan (English)">
                            <Textarea rows={2} value={form.data['summary.en']} onChange={(e) => form.setData('summary.en', e.target.value)} />
                        </Field>

                        <div className="flex gap-6 rounded-xl border bg-muted/20 px-4 py-3">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                                <Checkbox checked={form.data.is_featured} onCheckedChange={(v) => form.setData('is_featured', !!v)} />
                                <span>⭐ Tampilkan sebagai Featured</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                                <Checkbox checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', !!v)} />
                                <span>✓ Package Aktif</span>
                            </label>
                        </div>
                    </FieldGroup>
                </TabsContent>

                {/* ── Tab Harga ── */}
                <TabsContent value="harga" className="mt-4">
                    <SectionHeader icon={Tag} title="Harga & Promosi" desc="Atur harga jual, diskon, dan periode promo." />
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Harga Jual (IDR) *" error={err.price}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                    <Input type="number" min={0} step={100000} value={form.data.price} onChange={(e) => form.setData('price', +e.target.value)} className="pl-8" />
                                </div>
                            </Field>
                            <Field label="Harga Asli / Coret" hint="Kosongkan jika tidak ada diskon" error={err.original_price}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                    <Input type="number" min={0} step={100000} value={form.data.original_price} onChange={(e) => form.setData('original_price', e.target.value ? +e.target.value : '')} className="pl-8" placeholder="0" />
                                </div>
                            </Field>
                        </div>

                        {discountPct !== null && (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                                <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                                    -{discountPct}%
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Diskon aktif!</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        Hemat Rp {(Number(form.data.original_price) - Number(form.data.price)).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <Field label="Label Diskon" hint='Kosongkan untuk otomatis tampil "HEMAT X%"'>
                            <Input value={form.data.discount_label} onChange={(e) => form.setData('discount_label', e.target.value)} placeholder="Contoh: EARLY BIRD, FLASH SALE" />
                        </Field>
                        <Field label="Promo Berakhir">
                            <Input type="datetime-local" value={form.data.discount_ends_at} onChange={(e) => form.setData('discount_ends_at', e.target.value)} />
                        </Field>
                        <Field label="Mata Uang">
                            <Input value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)} maxLength={3} className="w-24 font-mono uppercase" />
                        </Field>
                    </FieldGroup>
                </TabsContent>

                {/* ── Tab Konten ── */}
                <TabsContent value="konten" className="mt-4">
                    <SectionHeader icon={FileText} title="Konten Package" desc="Detail maskapai, hotel, fasilitas, dan kebijakan." />
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ key: 'airline', label: '✈ Maskapai' }, { key: 'hotel', label: '🏨 Hotel' }].map(({ key, label }) => (
                                <Field key={key} label={label}>
                                    <Input value={contentField(form.data.content, key)} onChange={(e) => form.setData('content', setContentField(form.data.content, key, 'id', e.target.value))} />
                                </Field>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ key: 'badge', label: '🏷 Badge' }, { key: 'period', label: '📅 Periode' }].map(({ key, label }) => (
                                <Field key={key} label={label}>
                                    <Input value={contentField(form.data.content, key)} onChange={(e) => form.setData('content', setContentField(form.data.content, key, 'id', e.target.value))} />
                                </Field>
                            ))}
                        </div>
                        <Field label="✅ Termasuk dalam Paket" hint="Satu item per baris">
                            <Textarea rows={5} value={toLines((form.data.content?.included as Record<string, unknown>)?.id)} onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                const existing = (form.data.content?.included as Record<string, unknown>) ?? {};
                                form.setData('content', { ...form.data.content, included: { ...existing, id: lines } });
                            }} placeholder="Tiket pesawat PP&#10;Visa umroh&#10;Akomodasi hotel bintang 4" />
                        </Field>
                        <Field label="❌ Tidak Termasuk" hint="Satu item per baris">
                            <Textarea rows={3} value={toLines((form.data.content?.excluded as Record<string, unknown>)?.id)} onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                const existing = (form.data.content?.excluded as Record<string, unknown>) ?? {};
                                form.setData('content', { ...form.data.content, excluded: { ...existing, id: lines } });
                            }} placeholder="Pengeluaran pribadi&#10;Oleh-oleh" />
                        </Field>
                        <Field label="📋 Kebijakan">
                            <Textarea rows={3} value={contentField(form.data.content, 'policy')} onChange={(e) => form.setData('content', setContentField(form.data.content, 'policy', 'id', e.target.value))} placeholder="Kebijakan pembatalan, perubahan jadwal, dll." />
                        </Field>
                    </FieldGroup>
                </TabsContent>

                {/* ── Tab Produk ── */}
                <TabsContent value="produk" className="mt-4">
                    <SectionHeader icon={Layers} title="Produk dalam Package" desc="Pilih komponen layanan yang termasuk dalam paket ini." />
                    <ProductSelector
                        options={productOptions}
                        selected={form.data.product_ids}
                        locale={locale}
                        onChange={(ids) => form.setData('product_ids', ids)}
                    />
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                    {form.isDirty ? '● Ada perubahan yang belum disimpan' : ''}
                </p>
                <Button type="submit" disabled={form.processing} className="min-w-32">
                    {form.processing ? (
                        <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Menyimpan...</span>
                    ) : isEdit ? 'Simpan Perubahan' : 'Tambah Package'}
                </Button>
            </div>
        </form>
    );
}
