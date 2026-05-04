import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import {
    Globe,
    Image,
    Phone,
    Plus,
    Settings,
    Share2,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    settings: Record<string, any>;
}

type SocialAccount = { platform: string; label: string; url: string };
type HoursMode = 'hours' | '24h' | 'closed';
type WeekendDays = 'sat' | 'sat_sun';

type SeoFormData = {
    site_name: string;
    site_name_id: string;
    site_name_en: string;
    tagline: string;
    tagline_id: string;
    tagline_en: string;
    default_description: string;
    default_description_id: string;
    default_description_en: string;
    keywords: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    address_id: string;
    address_en: string;
    map_link: string;
    weekday_hours: string;
    weekend_hours: string;
    social_accounts: SocialAccount[];
    og_title: string;
    og_title_id: string;
    og_title_en: string;
    og_description: string;
    og_description_id: string;
    og_description_en: string;
    robots_default: string;
    canonical_base: string;
    google_verification: string;
    bing_verification: string;
    google_analytics_id: string;
    logo: File | null;
    og_image: File | null;
    _method: 'PATCH';
};

const PLATFORMS = [
    { value: 'instagram', label: 'Instagram', emoji: '📸' },
    { value: 'facebook', label: 'Facebook', emoji: '📘' },
    { value: 'youtube', label: 'YouTube', emoji: '▶️' },
    { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { value: 'twitter', label: 'X / Twitter', emoji: '🐦' },
    { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
    { value: 'telegram', label: 'Telegram', emoji: '✈️' },
    { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
    { value: 'threads', label: 'Threads', emoji: '🧵' },
    { value: 'pinterest', label: 'Pinterest', emoji: '📌' },
    { value: 'custom', label: 'Custom', emoji: '🔗' },
];

function Section({
    icon: Icon,
    title,
    desc,
    children,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
    children: React.ReactNode;
}) {
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

function timeForInput(value: string): string {
    const trimmed = String(value ?? '').trim();
    const match = trimmed.match(/(\d{1,2})[.:](\d{2})/);

    if (match) {
        const hour = match[1]?.padStart(2, '0') ?? '00';
        const minute = match[2]?.padStart(2, '0') ?? '00';

        return `${hour}:${minute}`;
    }

    return '';
}

function timeForLabel(value: string): string {
    const trimmed = String(value ?? '').trim();
    const match = trimmed.match(/(\d{1,2}):(\d{2})/);

    if (!match) {
        return '';
    }

    const hour = match[1]?.padStart(2, '0') ?? '00';
    const minute = match[2]?.padStart(2, '0') ?? '00';

    return `${hour}.${minute}`;
}

function parseHours(value: string): {
    mode: HoursMode;
    start: string;
    end: string;
} {
    const normalized = String(value ?? '').toLowerCase();

    if (normalized.includes('24')) {
        return { mode: '24h', start: '', end: '' };
    }

    if (normalized.includes('libur') || normalized.includes('tutup')) {
        return { mode: 'closed', start: '', end: '' };
    }

    const match = normalized.match(
        /(\d{1,2})[.:](\d{2})\s*[–-]\s*(\d{1,2})[.:](\d{2})/,
    );

    if (!match) {
        return { mode: 'hours', start: '08:00', end: '17:00' };
    }

    const start = `${(match[1] ?? '08').padStart(2, '0')}:${(match[2] ?? '00').padStart(2, '0')}`;
    const end = `${(match[3] ?? '17').padStart(2, '0')}:${(match[4] ?? '00').padStart(2, '0')}`;

    return { mode: 'hours', start, end };
}

function buildHoursLabel(
    dayLabel: string,
    mode: HoursMode,
    start: string,
    end: string,
): string {
    if (mode === '24h') {
        return `${dayLabel}, 24 Jam`;
    }

    if (mode === 'closed') {
        return `${dayLabel}, Libur`;
    }

    const startLabel = timeForLabel(start) || timeForLabel(timeForInput(start));
    const endLabel = timeForLabel(end) || timeForLabel(timeForInput(end));

    if (!startLabel || !endLabel) {
        return `${dayLabel}, `;
    }

    return `${dayLabel}, ${startLabel}–${endLabel}`;
}

export default function SeoIndex({ settings }: Props) {
    const { can } = usePermission('seo_settings');
    const canEdit = can('edit');
    const localized = (value: any): { id: string; en: string } => {
        if (typeof value === 'string') {
            return { id: value, en: value };
        }

        if (value && typeof value === 'object') {
            return {
                id: String(value.id ?? ''),
                en: String(value.en ?? ''),
            };
        }

        return { id: '', en: '' };
    };

    const siteName = localized(settings.general?.siteName);
    const tagline = localized(settings.general?.tagline);
    const defaultDescription = localized(settings.general?.defaultDescription);
    const addressFull = localized(settings.contact?.address?.full);
    const ogTitle = localized(settings.social?.ogTitle);
    const ogDescription = localized(settings.social?.ogDescription);

    const initialAccounts: SocialAccount[] = Array.isArray(
        settings.social?.accounts,
    )
        ? settings.social.accounts
        : PLATFORMS.slice(0, 5).map((p) => ({
              platform: p.value,
              label: p.label,
              url: '',
          }));

    const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
    const isId = true;

    const { data, setData, post, processing, errors, transform } =
        useForm<SeoFormData>({
            // General
            site_name: siteName.id,
            site_name_id: siteName.id,
            site_name_en: siteName.en || siteName.id,
            tagline: tagline.id,
            tagline_id: tagline.id,
            tagline_en: tagline.en || tagline.id,
            default_description: defaultDescription.id,
            default_description_id: defaultDescription.id,
            default_description_en:
                defaultDescription.en || defaultDescription.id,
            keywords: settings.general?.keywords ?? '',
            // Contact
            phone: settings.contact?.phone ?? '',
            whatsapp: settings.contact?.whatsapp ?? '',
            email: settings.contact?.email ?? '',
            address: addressFull.id,
            address_id: addressFull.id,
            address_en: addressFull.en || addressFull.id,
            map_link: settings.contact?.address?.mapLink ?? '',
            weekday_hours: settings.contact?.operatingHours?.weekday ?? '',
            weekend_hours: settings.contact?.operatingHours?.weekend ?? '',
            // Social media
            social_accounts: [] as SocialAccount[],
            og_title: ogTitle.id,
            og_title_id: ogTitle.id,
            og_title_en: ogTitle.en || ogTitle.id,
            og_description: ogDescription.id,
            og_description_id: ogDescription.id,
            og_description_en: ogDescription.en || ogDescription.id,
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

    const weekdayParsed = parseHours(data.weekday_hours);
    const weekendParsed = parseHours(data.weekend_hours);
    const initialWeekendDays: WeekendDays = String(
        data.weekend_hours ?? '',
    ).includes('Sabtu–Minggu')
        ? 'sat_sun'
        : 'sat';

    const [weekdayMode, setWeekdayMode] = useState<HoursMode>(
        weekdayParsed.mode,
    );
    const [weekdayStart, setWeekdayStart] = useState<string>(
        weekdayParsed.start,
    );
    const [weekdayEnd, setWeekdayEnd] = useState<string>(weekdayParsed.end);

    const [weekendDays, setWeekendDays] =
        useState<WeekendDays>(initialWeekendDays);
    const [weekendMode, setWeekendMode] = useState<HoursMode>(
        weekendParsed.mode,
    );
    const [weekendStart, setWeekendStart] = useState<string>(
        weekendParsed.start,
    );
    const [weekendEnd, setWeekendEnd] = useState<string>(weekendParsed.end);

    useEffect(() => {
        setData(
            'weekday_hours',
            buildHoursLabel(
                'Senin–Jumat',
                weekdayMode,
                weekdayStart,
                weekdayEnd,
            ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekdayMode, weekdayStart, weekdayEnd]);

    useEffect(() => {
        const dayLabel = weekendDays === 'sat_sun' ? 'Sabtu–Minggu' : 'Sabtu';

        setData(
            'weekend_hours',
            buildHoursLabel(dayLabel, weekendMode, weekendStart, weekendEnd),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekendDays, weekendMode, weekendStart, weekendEnd]);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (!canEdit) {
            return;
        }

        transform((currentData) => ({
            ...currentData,
            social_accounts: accounts,
            address: currentData.address_id || currentData.address,
            site_name: currentData.site_name_id || currentData.site_name,
            tagline: currentData.tagline_id || currentData.tagline,
            default_description:
                currentData.default_description_id ||
                currentData.default_description,
            weekday_hours: currentData.weekday_hours,
            weekend_hours: currentData.weekend_hours,
            og_title: currentData.og_title_id || currentData.og_title,
            og_description:
                currentData.og_description_id || currentData.og_description,
        }));

        post('/admin/website-management/seo', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('SEO settings berhasil disimpan.'),
            onError: (errors) =>
                toast.error(
                    'Gagal menyimpan: ' + Object.values(errors).join(', '),
                ),
        });
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'SEO & Site Settings',
                    href: '/admin/website-management/seo',
                },
            ]}
        >
            <Head title="SEO & Site Settings" />

            <form onSubmit={submit} className="space-y-5 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">
                            Pengaturan SEO & Website
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Metadata, kontak, sosial media, dan pengaturan
                            teknis website.
                        </p>
                    </div>
                    {canEdit ? (
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="shrink-0"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Semua'}
                            </Button>
                        </div>
                    ) : null}
                </div>

                {Object.keys(errors).length > 0 ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {Object.values(errors).join(', ')}
                    </div>
                ) : null}

                <fieldset disabled={!canEdit} className="space-y-5">
                    {/* 1. Informasi Umum */}
                    <Section
                        icon={Globe}
                        title="Informasi Umum"
                        desc="Nama website, tagline, dan deskripsi default untuk mesin pencari."
                    >
                        <Row>
                            <Field label="Nama Website">
                                <Input
                                    value={data.site_name}
                                    onChange={(e) =>
                                        setData('site_name', e.target.value)
                                    }
                                    placeholder="Asfar Tour"
                                />
                            </Field>
                            <Field label="Tagline">
                                <Input
                                    value={data.tagline}
                                    onChange={(e) =>
                                        setData('tagline', e.target.value)
                                    }
                                    placeholder="Travel Umroh Terpercaya"
                                />
                            </Field>
                        </Row>
                        <Field
                            label="Deskripsi Default"
                            hint="Tampil di Google jika halaman tidak punya meta description."
                        >
                            <Textarea
                                rows={3}
                                value={data.default_description}
                                onChange={(e) =>
                                    setData(
                                        'default_description',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label="Keywords"
                            hint="Pisahkan dengan koma. Contoh: umroh, travel umroh, paket umroh 2026"
                        >
                            <Textarea
                                rows={2}
                                value={data.keywords}
                                onChange={(e) =>
                                    setData('keywords', e.target.value)
                                }
                            />
                        </Field>
                    </Section>

                    {/* 2. Kontak & Lokasi */}
                    <Section
                        icon={Phone}
                        title="Kontak & Lokasi"
                        desc="Nomor telepon, WhatsApp, email, alamat, dan jam operasional."
                    >
                        <Row>
                            <Field
                                label="Nomor Telepon"
                                hint="Format: +62 812-xxxx-xxxx"
                            >
                                <Input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="+62 812-3456-7890"
                                />
                            </Field>
                            <Field
                                label="WhatsApp"
                                hint="Nomor yang dipakai untuk tombol WA di website."
                            >
                                <Input
                                    value={data.whatsapp}
                                    onChange={(e) =>
                                        setData('whatsapp', e.target.value)
                                    }
                                    placeholder="+62 812-3456-7890"
                                />
                            </Field>
                        </Row>
                        <Field label="Email">
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="info@asfartour.co.id"
                            />
                        </Field>
                        <Field label="Alamat">
                            <Textarea
                                rows={2}
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                placeholder="Jl. Contoh No. 1, Jakarta"
                            />
                        </Field>
                        <Field
                            label="Link Google Maps"
                            hint="Paste URL embed atau link Google Maps."
                        >
                            <Input
                                value={data.map_link}
                                onChange={(e) =>
                                    setData('map_link', e.target.value)
                                }
                                placeholder="https://maps.google.com/..."
                            />
                        </Field>
                        <Row>
                            <Field
                                label="Jam Operasional (Weekday)"
                                hint="Pilih mode + jam mulai/selesai. Kamu juga bisa edit hasil akhirnya manual."
                            >
                                <div className="space-y-3">
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <div className="sm:col-span-1">
                                            <Select
                                                value={weekdayMode}
                                                onValueChange={(value) =>
                                                    setWeekdayMode(
                                                        value as HoursMode,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hours">
                                                        Jam tertentu
                                                    </SelectItem>
                                                    <SelectItem value="24h">
                                                        24 Jam
                                                    </SelectItem>
                                                    <SelectItem value="closed">
                                                        Libur
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Input
                                            type="time"
                                            step={60}
                                            value={weekdayStart}
                                            disabled={weekdayMode !== 'hours'}
                                            onChange={(e) =>
                                                setWeekdayStart(e.target.value)
                                            }
                                        />
                                        <Input
                                            type="time"
                                            step={60}
                                            value={weekdayEnd}
                                            disabled={weekdayMode !== 'hours'}
                                            onChange={(e) =>
                                                setWeekdayEnd(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setWeekdayMode('hours');
                                                setWeekdayStart('08:00');
                                                setWeekdayEnd('17:00');
                                            }}
                                        >
                                            08:00–17:00
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setWeekdayMode('hours');
                                                setWeekdayStart('10:00');
                                                setWeekdayEnd('18:00');
                                            }}
                                        >
                                            10:00–18:00
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setWeekdayMode('24h')
                                            }
                                        >
                                            24 Jam
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setWeekdayMode('closed')
                                            }
                                        >
                                            Libur
                                        </Button>
                                    </div>

                                    <Input
                                        value={data.weekday_hours}
                                        onChange={(e) =>
                                            setData(
                                                'weekday_hours',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Senin–Jumat, 08.00–17.00"
                                    />
                                </div>
                            </Field>
                            <Field
                                label="Jam Operasional (Weekend)"
                                hint="Pilih hari (Sabtu / Sabtu–Minggu) + mode + jam mulai/selesai."
                            >
                                <div className="space-y-3">
                                    <div className="grid gap-2 sm:grid-cols-4">
                                        <div className="sm:col-span-2">
                                            <Select
                                                value={weekendDays}
                                                onValueChange={(value) =>
                                                    setWeekendDays(
                                                        value as WeekendDays,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Hari" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sat">
                                                        Sabtu
                                                    </SelectItem>
                                                    <SelectItem value="sat_sun">
                                                        Sabtu–Minggu
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Select
                                                value={weekendMode}
                                                onValueChange={(value) =>
                                                    setWeekendMode(
                                                        value as HoursMode,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hours">
                                                        Jam tertentu
                                                    </SelectItem>
                                                    <SelectItem value="24h">
                                                        24 Jam
                                                    </SelectItem>
                                                    <SelectItem value="closed">
                                                        Libur
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Input
                                            type="time"
                                            step={60}
                                            value={weekendStart}
                                            disabled={weekendMode !== 'hours'}
                                            onChange={(e) =>
                                                setWeekendStart(e.target.value)
                                            }
                                        />
                                        <Input
                                            type="time"
                                            step={60}
                                            value={weekendEnd}
                                            disabled={weekendMode !== 'hours'}
                                            onChange={(e) =>
                                                setWeekendEnd(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setWeekendMode('hours');
                                                setWeekendStart('08:00');
                                                setWeekendEnd('13:00');
                                            }}
                                        >
                                            08:00–13:00
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setWeekendMode('closed')
                                            }
                                        >
                                            Libur
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setWeekendMode('24h')
                                            }
                                        >
                                            24 Jam
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setWeekendMode(weekdayMode);
                                                setWeekendStart(weekdayStart);
                                                setWeekendEnd(weekdayEnd);
                                            }}
                                        >
                                            Samakan weekday
                                        </Button>
                                    </div>

                                    <Input
                                        value={data.weekend_hours}
                                        onChange={(e) =>
                                            setData(
                                                'weekend_hours',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Sabtu–Minggu, 08.00–13.00"
                                    />
                                </div>
                            </Field>
                        </Row>
                    </Section>

                    {/* 3. Sosial Media */}
                    <Section
                        icon={Share2}
                        title="Sosial Media"
                        desc="Kelola akun sosial media — bisa tambah, hapus, dan pilih platform."
                    >
                        <div className="space-y-2">
                            {accounts.map((acc, i) => {
                                const platform = PLATFORMS.find(
                                    (p) => p.value === acc.platform,
                                );
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-3"
                                    >
                                        {/* Platform select */}
                                        <Select
                                            value={acc.platform}
                                            onValueChange={(v) =>
                                                setAccounts(
                                                    accounts.map((a, idx) =>
                                                        idx === i
                                                            ? {
                                                                  ...a,
                                                                  platform: v,
                                                                  label:
                                                                      PLATFORMS.find(
                                                                          (p) =>
                                                                              p.value ===
                                                                              v,
                                                                      )
                                                                          ?.label ??
                                                                      v,
                                                              }
                                                            : a,
                                                    ),
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-44 shrink-0">
                                                <SelectValue>
                                                    <span>
                                                        {platform?.emoji}{' '}
                                                        {platform?.label ??
                                                            acc.platform}
                                                    </span>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PLATFORMS.map((p) => (
                                                    <SelectItem
                                                        key={p.value}
                                                        value={p.value}
                                                    >
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
                                                onChange={(e) =>
                                                    setAccounts(
                                                        accounts.map(
                                                            (a, idx) =>
                                                                idx === i
                                                                    ? {
                                                                          ...a,
                                                                          label: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : a,
                                                        ),
                                                    )
                                                }
                                            />
                                        )}
                                        {/* URL */}
                                        <Input
                                            className="flex-1"
                                            placeholder={`https://${acc.platform}.com/...`}
                                            value={acc.url}
                                            onChange={(e) =>
                                                setAccounts(
                                                    accounts.map((a, idx) =>
                                                        idx === i
                                                            ? {
                                                                  ...a,
                                                                  url: e.target
                                                                      .value,
                                                              }
                                                            : a,
                                                    ),
                                                )
                                            }
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="shrink-0 text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setAccounts(
                                                    accounts.filter(
                                                        (_, idx) => idx !== i,
                                                    ),
                                                )
                                            }
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
                            onClick={() =>
                                setAccounts([
                                    ...accounts,
                                    {
                                        platform: 'instagram',
                                        label: 'Instagram',
                                        url: '',
                                    },
                                ])
                            }
                        >
                            <Plus className="h-3.5 w-3.5" /> Tambah Akun Sosmed
                        </Button>

                        <div className="mt-2 border-t border-border pt-4">
                            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Open Graph (Preview saat di-share)
                            </p>
                            <Row>
                                <Field label="OG Title">
                                    <Input
                                        value={
                                            isId
                                                ? data.og_title_id
                                                : data.og_title_en
                                        }
                                        onChange={(e) =>
                                            setData(
                                                isId
                                                    ? 'og_title_id'
                                                    : 'og_title_en',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={
                                            isId
                                                ? 'Asfar Tour — Travel Umroh Terpercaya'
                                                : 'Asfar Tour — Trusted Umrah Travel'
                                        }
                                    />
                                </Field>
                                <Field label="OG Description">
                                    <Textarea
                                        rows={2}
                                        value={
                                            isId
                                                ? data.og_description_id
                                                : data.og_description_en
                                        }
                                        onChange={(e) =>
                                            setData(
                                                isId
                                                    ? 'og_description_id'
                                                    : 'og_description_en',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </Row>
                            <Field
                                label="OG Image"
                                hint="Gambar preview saat link dibagikan di WhatsApp, Facebook, dll. Ukuran ideal: 1200×630px."
                            >
                                <div className="flex items-center gap-3">
                                    {settings.social?.ogImage?.url && (
                                        <img
                                            src={settings.social.ogImage.url}
                                            className="h-16 w-28 rounded-lg border border-border object-cover"
                                        />
                                    )}
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                'og_image',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>
                            </Field>
                        </div>
                    </Section>

                    {/* 4. Gambar & Logo */}
                    <Section
                        icon={Image}
                        title="Logo & Gambar"
                        desc="Pusat logo untuk public website, favicon browser, dan kebutuhan SEO."
                    >
                        <Field
                            label="Logo Public & SEO"
                            hint="Dipakai untuk navbar, footer, tab browser, dan structured data. Kalau kosong, sistem pakai logo default branding."
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={settings.contact?.logo?.url}
                                    className="h-12 rounded border border-border bg-muted p-1"
                                />
                                {settings.contact?.logo?.is_fallback ? (
                                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
                                        Default branding
                                    </span>
                                ) : null}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            'logo',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </div>
                        </Field>
                    </Section>

                    {/* 5. Teknis */}
                    <Section
                        icon={Settings}
                        title="Pengaturan Teknis"
                        desc="Robots, canonical, verifikasi mesin pencari, dan analytics."
                    >
                        <Row>
                            <Field
                                label="Robots Default"
                                hint="Contoh: index, follow"
                            >
                                <Input
                                    value={data.robots_default}
                                    onChange={(e) =>
                                        setData(
                                            'robots_default',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Canonical Base URL"
                                hint="Contoh: https://asfartour.co.id"
                            >
                                <Input
                                    value={data.canonical_base}
                                    onChange={(e) =>
                                        setData(
                                            'canonical_base',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://asfartour.co.id"
                                />
                            </Field>
                        </Row>
                        <Row>
                            <Field label="Google Search Console Verification">
                                <Input
                                    value={data.google_verification}
                                    onChange={(e) =>
                                        setData(
                                            'google_verification',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="google-site-verification=..."
                                />
                            </Field>
                            <Field label="Bing Webmaster Verification">
                                <Input
                                    value={data.bing_verification}
                                    onChange={(e) =>
                                        setData(
                                            'bing_verification',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </Row>
                        <Field
                            label="Google Analytics ID"
                            hint="Contoh: G-XXXXXXXXXX atau UA-XXXXXXXX-X"
                        >
                            <Input
                                value={data.google_analytics_id}
                                onChange={(e) =>
                                    setData(
                                        'google_analytics_id',
                                        e.target.value,
                                    )
                                }
                                placeholder="G-XXXXXXXXXX"
                                className="max-w-xs"
                            />
                        </Field>
                    </Section>

                    <div className="flex justify-end pb-4">
                        {canEdit ? (
                            <Button
                                type="submit"
                                disabled={processing}
                                size="lg"
                            >
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Semua Settings'}
                            </Button>
                        ) : null}
                    </div>
                </fieldset>
            </form>
        </AppSidebarLayout>
    );
}
