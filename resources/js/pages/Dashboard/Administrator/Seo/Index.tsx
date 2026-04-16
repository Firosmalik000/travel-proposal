import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLocaleSwitch } from '@/components/admin-locale-switch';
import { useAdminLocale } from '@/contexts/admin-locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Globe, Languages, MapPin, Phone, Share2, Settings, Image, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    settings: Record<string, any>;
}

type SocialAccount = { platform: string; label: string; url: string };

const PLATFORMS = [
    { value: 'instagram',  label: 'Instagram',  emoji: '📸' },
    { value: 'facebook',   label: 'Facebook',   emoji: '📘' },
    { value: 'youtube',    label: 'YouTube',    emoji: '▶️' },
    { value: 'tiktok',     label: 'TikTok',     emoji: '🎵' },
    { value: 'twitter',    label: 'X / Twitter', emoji: '🐦' },
    { value: 'whatsapp',   label: 'WhatsApp',   emoji: '💬' },
    { value: 'telegram',   label: 'Telegram',   emoji: '✈️' },
    { value: 'linkedin',   label: 'LinkedIn',   emoji: '💼' },
    { value: 'threads',    label: 'Threads',    emoji: '🧵' },
    { value: 'pinterest',  label: 'Pinterest',  emoji: '📌' },
    { value: 'custom',     label: 'Custom',     emoji: '🔗' },
];

function Section({ icon: Icon, title, desc, children }: { icon: React.ElementType; title: string; desc: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3 border-b border-border pb-4">
                <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
            {children}
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export default function SeoIndex({ settings }: Props) {
    const { locale } = useAdminLocale();
    const isId = locale === 'id';
    const initialAccounts: SocialAccount[] = Array.isArray(settings.social?.accounts)
        ? settings.social.accounts
        : PLATFORMS.slice(0, 5).map(p => ({ platform: p.value, label: p.label, url: '' }));

    const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);

    const { data, setData, post, processing } = useForm({
        // General
        site_name_id: settings.general?.siteName?.id ?? '',
        site_name_en: settings.general?.siteName?.en ?? '',
        tagline_id: settings.general?.tagline?.id ?? '',
        tagline_en: settings.general?.tagline?.en ?? '',
        default_description_id: settings.general?.defaultDescription?.id ?? '',
        default_description_en: settings.general?.defaultDescription?.en ?? '',
        keywords: settings.general?.keywords ?? '',
        // Contact
        phone: settings.contact?.phone ?? '',
        whatsapp: settings.contact?.whatsapp ?? '',
        email: settings.contact?.email ?? '',
        address_id: settings.contact?.address?.full?.id ?? '',
        address_en: settings.contact?.address?.full?.en ?? '',
        map_link: settings.contact?.address?.mapLink ?? '',
        weekday_hours_id: settings.contact?.operatingHours?.weekday?.id ?? '',
        weekday_hours_en: settings.contact?.operatingHours?.weekday?.en ?? '',
        weekend_hours_id: settings.contact?.operatingHours?.weekend?.id ?? '',
        weekend_hours_en: settings.contact?.operatingHours?.weekend?.en ?? '',
        // Social media
        social_accounts: [] as SocialAccount[],
        og_title_id: settings.social?.ogTitle?.id ?? '',
        og_title_en: settings.social?.ogTitle?.en ?? '',
        og_description_id: settings.social?.ogDescription?.id ?? '',
        og_description_en: settings.social?.ogDescription?.en ?? '',
        // Advanced
        robots_default: settings.advanced?.robotsDefault ?? 'index, follow',
        canonical_base: settings.advanced?.canonicalBase ?? '',
        google_verification: settings.advanced?.googleVerification ?? '',
        bing_verification: settings.advanced?.bingVerification ?? '',
        google_analytics_id: settings.advanced?.googleAnalyticsId ?? '',
        // Files
        logo: null as File | null,
        og_image: null as File | null,
        _method: 'PATCH',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const payload = new FormData();
        // append semua field biasa
        Object.entries(data).forEach(([k, v]) => {
            if (v instanceof File) payload.append(k, v);
            else if (v !== null && v !== undefined && !Array.isArray(v)) payload.append(k, String(v));
        });
        // append social_accounts sebagai JSON string
        payload.append('social_accounts', JSON.stringify(accounts));

        router.post('/dashboard/website-management/seo', payload, {
            preserveScroll: true,
            onSuccess: () => toast.success('SEO settings berhasil disimpan.'),
            onError: (errors) => toast.error('Gagal menyimpan: ' + Object.values(errors).join(', ')),
        });
    }

    return (
        <AppSidebarLayout breadcrumbs={[{ label: 'SEO & Site Settings', href: '/dashboard/website-management/seo' }]}>
            <Head title="SEO & Site Settings" />

            <form onSubmit={submit} className="space-y-5 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">SEO & Site Settings</h1>
                        <p className="text-sm text-muted-foreground">Metadata, kontak, sosial media, dan pengaturan teknis website.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                            <Languages className="h-4 w-4 text-muted-foreground" />
                            <AdminLocaleSwitch />
                        </div>
                        <Button type="submit" disabled={processing} className="shrink-0">
                            {processing ? 'Menyimpan...' : 'Simpan Semua'}
                        </Button>
                    </div>
                </div>

                {/* 1. Informasi Umum */}
                <Section icon={Globe} title="Informasi Umum" desc="Nama website, tagline, dan deskripsi default untuk mesin pencari.">
                    <Row>
                        <Field label="Nama Website">
                            <Input value={isId ? data.site_name_id : data.site_name_en} onChange={e => setData(isId ? 'site_name_id' : 'site_name_en', e.target.value)} placeholder="Asfar Tour" />
                        </Field>
                        <Field label="Tagline">
                            <Input value={isId ? data.tagline_id : data.tagline_en} onChange={e => setData(isId ? 'tagline_id' : 'tagline_en', e.target.value)} placeholder={isId ? 'Travel Umroh Terpercaya' : 'Trusted Umrah Travel'} />
                        </Field>
                    </Row>
                    <Field label="Deskripsi Default" hint="Tampil di Google jika halaman tidak punya meta description.">
                        <Textarea rows={3} value={isId ? data.default_description_id : data.default_description_en} onChange={e => setData(isId ? 'default_description_id' : 'default_description_en', e.target.value)} />
                    </Field>
                    <Field label="Keywords" hint="Pisahkan dengan koma. Contoh: umroh, travel umroh, paket umroh 2026">
                        <Textarea rows={2} value={data.keywords} onChange={e => setData('keywords', e.target.value)} />
                    </Field>
                </Section>

                {/* 2. Kontak & Lokasi */}
                <Section icon={Phone} title="Kontak & Lokasi" desc="Nomor telepon, WhatsApp, email, alamat, dan jam operasional.">
                    <Row>
                        <Field label="Nomor Telepon" hint="Format: +62 812-xxxx-xxxx">
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+62 812-3456-7890" />
                        </Field>
                        <Field label="WhatsApp" hint="Nomor yang dipakai untuk tombol WA di website.">
                            <Input value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} placeholder="+62 812-3456-7890" />
                        </Field>
                    </Row>
                    <Field label="Email">
                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="info@asfartour.co.id" />
                    </Field>
                    <Field label="Alamat">
                        <Textarea rows={2} value={isId ? data.address_id : data.address_en} onChange={e => setData(isId ? 'address_id' : 'address_en', e.target.value)} placeholder={isId ? 'Jl. Contoh No. 1, Jakarta' : '1 Example St, Jakarta'} />
                    </Field>
                    <Field label="Link Google Maps" hint="Paste URL embed atau link Google Maps.">
                        <Input value={data.map_link} onChange={e => setData('map_link', e.target.value)} placeholder="https://maps.google.com/..." />
                    </Field>
                    <Row>
                        <Field label="Jam Kerja Weekday">
                            <Input value={isId ? data.weekday_hours_id : data.weekday_hours_en} onChange={e => setData(isId ? 'weekday_hours_id' : 'weekday_hours_en', e.target.value)} placeholder={isId ? 'Senin–Jumat, 08.00–17.00' : 'Mon–Fri, 08.00–17.00'} />
                        </Field>
                        <Field label="Jam Kerja Weekend">
                            <Input value={isId ? data.weekend_hours_id : data.weekend_hours_en} onChange={e => setData(isId ? 'weekend_hours_id' : 'weekend_hours_en', e.target.value)} placeholder={isId ? 'Sabtu, 08.00–13.00' : 'Sat, 08.00–13.00'} />
                        </Field>
                    </Row>
                </Section>

                {/* 3. Sosial Media */}
                <Section icon={Share2} title="Sosial Media" desc="Kelola akun sosial media — bisa tambah, hapus, dan pilih platform.">
                    <div className="space-y-2">
                        {accounts.map((acc, i) => {
                            const platform = PLATFORMS.find(p => p.value === acc.platform);
                            return (
                                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-3">
                                    {/* Platform select */}
                                    <Select
                                        value={acc.platform}
                                        onValueChange={v => setAccounts(accounts.map((a, idx) => idx === i ? { ...a, platform: v, label: PLATFORMS.find(p => p.value === v)?.label ?? v } : a))}
                                    >
                                        <SelectTrigger className="w-44 shrink-0">
                                            <SelectValue>
                                                <span>{platform?.emoji} {platform?.label ?? acc.platform}</span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PLATFORMS.map(p => (
                                                <SelectItem key={p.value} value={p.value}>
                                                    {p.emoji} {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Custom label (only for custom) */}
                                    {acc.platform === 'custom' && (
                                        <Input
                                            className="w-32 shrink-0"
                                            placeholder="Nama platform"
                                            value={acc.label}
                                            onChange={e => setAccounts(accounts.map((a, idx) => idx === i ? { ...a, label: e.target.value } : a))}
                                        />
                                    )}
                                    {/* URL */}
                                    <Input
                                        className="flex-1"
                                        placeholder={`https://${acc.platform}.com/...`}
                                        value={acc.url}
                                        onChange={e => setAccounts(accounts.map((a, idx) => idx === i ? { ...a, url: e.target.value } : a))}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 text-destructive hover:text-destructive"
                                        onClick={() => setAccounts(accounts.filter((_, idx) => idx !== i))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setAccounts([...accounts, { platform: 'instagram', label: 'Instagram', url: '' }])}
                    >
                        <Plus className="h-3.5 w-3.5" /> Tambah Akun Sosmed
                    </Button>

                    <div className="mt-2 border-t border-border pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open Graph (Preview saat di-share)</p>
                        <Row>
                            <Field label="OG Title">
                                <Input value={isId ? data.og_title_id : data.og_title_en} onChange={e => setData(isId ? 'og_title_id' : 'og_title_en', e.target.value)} placeholder={isId ? 'Asfar Tour — Travel Umroh Terpercaya' : 'Asfar Tour — Trusted Umrah Travel'} />
                            </Field>
                            <Field label="OG Description">
                                <Textarea rows={2} value={isId ? data.og_description_id : data.og_description_en} onChange={e => setData(isId ? 'og_description_id' : 'og_description_en', e.target.value)} />
                            </Field>
                        </Row>
                        <Field label="OG Image" hint="Gambar preview saat link dibagikan di WhatsApp, Facebook, dll. Ukuran ideal: 1200×630px.">
                            <div className="flex items-center gap-3">
                                {settings.social?.ogImage?.url && (
                                    <img src={settings.social.ogImage.url} className="h-16 w-28 rounded-lg object-cover border border-border" />
                                )}
                                <Input type="file" accept="image/*" onChange={e => setData('og_image', e.target.files?.[0] ?? null)} />
                            </div>
                        </Field>
                    </div>
                </Section>

                {/* 4. Gambar & Logo */}
                <Section icon={Image} title="Logo & Gambar" desc="Logo utama website untuk SEO dan branding.">
                    <Field label="Logo SEO" hint="Dipakai untuk structured data Google. Format PNG/WebP transparan.">
                        <div className="flex items-center gap-3">
                            {settings.contact?.logo?.url && (
                                <img src={settings.contact.logo.url} className="h-12 rounded border border-border bg-muted p-1" />
                            )}
                            <Input type="file" accept="image/*" onChange={e => setData('logo', e.target.files?.[0] ?? null)} />
                        </div>
                    </Field>
                </Section>

                {/* 5. Teknis */}
                <Section icon={Settings} title="Pengaturan Teknis" desc="Robots, canonical, verifikasi mesin pencari, dan analytics.">
                    <Row>
                        <Field label="Robots Default" hint="Contoh: index, follow">
                            <Input value={data.robots_default} onChange={e => setData('robots_default', e.target.value)} />
                        </Field>
                        <Field label="Canonical Base URL" hint="Contoh: https://asfartour.co.id">
                            <Input value={data.canonical_base} onChange={e => setData('canonical_base', e.target.value)} placeholder="https://asfartour.co.id" />
                        </Field>
                    </Row>
                    <Row>
                        <Field label="Google Search Console Verification">
                            <Input value={data.google_verification} onChange={e => setData('google_verification', e.target.value)} placeholder="google-site-verification=..." />
                        </Field>
                        <Field label="Bing Webmaster Verification">
                            <Input value={data.bing_verification} onChange={e => setData('bing_verification', e.target.value)} />
                        </Field>
                    </Row>
                    <Field label="Google Analytics ID" hint="Contoh: G-XXXXXXXXXX atau UA-XXXXXXXX-X">
                        <Input value={data.google_analytics_id} onChange={e => setData('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" className="max-w-xs" />
                    </Field>
                </Section>

                <div className="flex justify-end pb-4">
                    <Button type="submit" disabled={processing} size="lg">
                        {processing ? 'Menyimpan...' : 'Simpan Semua Settings'}
                    </Button>
                </div>
            </form>
        </AppSidebarLayout>
    );
}
