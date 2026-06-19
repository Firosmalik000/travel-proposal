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
import {
    Check,
    ChevronDown,
    Eye,
    FileText,
    Images,
    MapPin,
    MessageCircle,
    Plus,
    Sparkles,
    Trash2,
} from 'lucide-react';
import {
    useState,
    type ElementType,
    type FormEvent,
    type ReactNode,
} from 'react';

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

const iconOptions = [
    { value: 'plane', label: 'Pesawat' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'food', label: 'Makanan' },
    { value: 'users', label: 'Jamaah / Tim' },
    { value: 'pin', label: 'Lokasi' },
    { value: 'clock', label: 'Jam' },
    { value: 'cal', label: 'Kalender' },
    { value: 'user', label: 'Mutawif' },
    { value: 'doc', label: 'Dokumen' },
    { value: 'bottle', label: 'Zam-zam' },
    { value: 'cam', label: 'Dokumentasi' },
    { value: 'bolt', label: 'Fast Response' },
    { value: 'headset', label: 'Support' },
    { value: 'wa', label: 'WhatsApp' },
] as const;

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback);
}

function cloneContent<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function multilineLines(value: unknown, expectedCount: number): string[] {
    const lines = text(value)
        .split(/\r?\n/)
        .map((line) => line.trim());

    while (lines.length < expectedCount) {
        lines.push('');
    }

    return lines.slice(0, expectedCount);
}

function updateHeroTitleLine(
    currentTitle: unknown,
    index: number,
    nextValue: string,
    expectedCount = 2,
): string {
    const lines = multilineLines(currentTitle, expectedCount);
    lines[index] = nextValue;

    return lines
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .join('\n');
}

function splitTextareaLines(value: unknown): string[] {
    return text(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '');
}

function defaultPromoPricingCards(): Array<Record<string, string>> {
    return [
        { label: 'QUAD', price: 'Rp 33.500.000', note: '/Pax' },
        { label: 'TRIPLE', price: 'Rp 35.000.000', note: '/Pax' },
        { label: 'DOUBLE', price: 'Rp 36.500.000', note: '/Pax' },
    ];
}

function defaultPromoDetailItems(): Array<Record<string, string>> {
    return [
        {
            icon: 'plane',
            title: 'Maskapai',
            description: 'Lion Air / Saudia\nDirect Flight',
        },
        {
            icon: 'hotel',
            title: 'Hotel Makkah',
            description: 'Maysan Al Maqom\nBintang 4',
        },
        {
            icon: 'hotel',
            title: 'Hotel Madinah',
            description: 'Arkan Al Manar\nBintang 3',
        },
        {
            icon: 'cal',
            title: 'Durasi',
            description: '9 Hari\n7 Malam',
        },
        {
            icon: 'food',
            title: 'Makan',
            description: 'Makan 3x\nSehari',
        },
        {
            icon: 'user',
            title: 'Mutawif',
            description: 'Tour Leader & Mutawif\nBerpengalaman',
        },
        {
            icon: 'doc',
            title: 'Visa',
            description: 'Visa Umroh\nResmi',
        },
        {
            icon: 'bottle',
            title: 'Zam-zam',
            description: 'Air Zam-zam\n5 Liter',
        },
        {
            icon: 'cam',
            title: 'Dokumentasi',
            description: 'Dokumentasi\nProfesional',
        },
    ];
}

function defaultPromoReasonItems(): Array<Record<string, string>> {
    return [
        {
            icon: 'users',
            title: 'Pembimbing Berpengalaman',
            description:
                'Tim mutawif ramah & profesional mendampingi setiap langkah ibadah Anda di Tanah Suci.',
        },
        {
            icon: 'hotel',
            title: 'Hotel Nyaman & Strategis',
            description:
                'Maysan Al Maqom (550m dari Haram) & Arkan Al Manar (200m dari Nabawi).',
        },
        {
            icon: 'plane',
            title: 'Direct Flight',
            description:
                'Penerbangan langsung tanpa transit - lebih nyaman dan efisien waktu untuk jamaah.',
        },
        {
            icon: 'cam',
            title: 'Dokumentasi Profesional',
            description:
                'Setiap momen ibadah diabadikan secara profesional sebagai kenangan seumur hidup.',
        },
        {
            icon: 'pin',
            title: 'Izin Resmi Kemenag RI',
            description:
                'Travel resmi berizin PPIU dari Kementerian Agama RI. Aman, legal, dan terpercaya.',
        },
        {
            icon: 'headset',
            title: 'Support 24/7',
            description:
                'Tim kami siap membantu sebelum, selama, dan setelah perjalanan ibadah Anda.',
        },
    ];
}

function normalizeItems(
    items: unknown,
    defaults: Array<Record<string, string>>,
): Array<Record<string, string>> {
    if (Array.isArray(items)) {
        return items.map((item, index) => ({
            ...defaults[index],
            ...(typeof item === 'object' && item !== null
                ? (item as Record<string, string>)
                : {}),
        }));
    }

    return defaults;
}

export function normalizeLandingPromoContent(
    content: Record<string, any>,
): Record<string, any> {
    const next = cloneContent(content ?? {});
    const legacyStats = Array.isArray(next.stats) ? next.stats : [];
    const legacyServices = Array.isArray(next.services?.items)
        ? next.services.items
        : [];

    next.hero = {
        promo_pill: text(
            next.hero?.promo_pill,
            'PROGRAM TERBATAS - SEATS TERBATAS',
        ),
        badge: text(next.hero?.badge, next.hero?.label || 'PAKET UMROH'),
        title: text(next.hero?.title, 'SPECIAL 9 HARI\nAgustus'),
        duration_value: text(next.hero?.duration_value, '9'),
        duration_suffix: text(next.hero?.duration_suffix, 'HARI'),
        subtitle: text(next.hero?.subtitle, 'Berangkat Agustus 2026'),
        subtitle_badge: text(next.hero?.subtitle_badge, '9 Hari Program'),
        description: text(
            next.hero?.description,
            'Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.',
        ),
        checklist_items: Array.isArray(next.hero?.checklist_items)
            ? next.hero.checklist_items
            : [
                  'Izin Resmi Kemenag RI',
                  '10+ Tahun Pengalaman',
                  'FREE Konsultasi Jabodetabek',
              ],
        cta_label: text(next.hero?.cta_label, 'Konsultasi Gratis'),
        secondary_cta_label: text(
            next.hero?.secondary_cta_label,
            'Lihat Paket',
        ),
        secondary_cta_href: text(next.hero?.secondary_cta_href, '/paket-umroh'),
        pricing_cards: normalizeItems(
            next.hero?.pricing_cards,
            defaultPromoPricingCards(),
        ),
        feature_cards: normalizeItems(next.hero?.feature_cards, [
            {
                icon: 'plane',
                title: 'Direct Flight',
                description: 'Lion Air / Saudia',
            },
            {
                icon: 'hotel',
                title: 'Hotel Makkah',
                description: 'Maysan Al Maqom',
            },
            {
                icon: 'hotel',
                title: 'Hotel Madinah',
                description: 'Arkan Al Manar',
            },
            {
                icon: 'food',
                title: 'Konsumsi',
                description: 'Makan 3x Sehari',
            },
        ]),
        free_badge_title: text(next.hero?.free_badge_title, 'FREE'),
        free_badge_label: text(next.hero?.free_badge_label, 'KONSULTASI'),
        free_badge_note: text(next.hero?.free_badge_note, 'SE-JABODETABEK'),
    };

    next.package_details = {
        title: text(next.package_details?.title, 'PAKET KAMI'),
        heading: text(
            next.package_details?.heading,
            'Pilih Paket Umroh Terbaik',
        ),
        heading2: text(
            next.package_details?.heading2,
            'Untuk Perjalanan Ibadah Anda',
        ),
        description: text(
            next.package_details?.description,
            'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
        ),
        items: normalizeItems(
            next.package_details?.items,
            defaultPromoDetailItems(),
        ),
    };

    next.packages = {
        ...next.packages,
        title: text(next.packages?.title, 'PAKET KAMI'),
        heading: text(next.packages?.heading, 'Pilih Paket Umroh Terbaik'),
        heading2: text(next.packages?.heading2, 'Untuk Perjalanan Ibadah Anda'),
        description: text(
            next.packages?.description,
            'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
        ),
        more_packages_label: text(
            next.packages?.more_packages_label,
            'Lihat Semua Paket',
        ),
        detail_label: text(next.packages?.detail_label, 'Tanya Paket Ini'),
        price_unit_label: text(next.packages?.price_unit_label, '/pax'),
        duration_suffix: text(next.packages?.duration_suffix, 'Hari'),
        fallback_name: text(next.packages?.fallback_name, 'Paket Umrah'),
        fallback_airline: text(
            next.packages?.fallback_airline,
            'Maskapai menyesuaikan',
        ),
        fallback_hotel: text(
            next.packages?.fallback_hotel,
            'Hotel sesuai paket',
        ),
        disclaimer: text(
            next.packages?.disclaimer,
            '* Harga dapat berubah sewaktu-waktu. Syarat & ketentuan berlaku.',
        ),
        selected_package_ids: Array.isArray(next.packages?.selected_package_ids)
            ? next.packages.selected_package_ids
                  .map((value: unknown) => Number(value))
                  .filter((value: number) => Number.isFinite(value))
                  .slice(0, 3)
            : [],
    };

    next.included = {
        section_badge: text(next.included?.section_badge, 'DETAIL PAKET'),
        section_heading_prefix: text(
            next.included?.section_heading_prefix,
            'Yang',
        ),
        section_heading_highlight: text(
            next.included?.section_heading_highlight,
            'Termasuk',
        ),
        section_heading_suffix: text(
            next.included?.section_heading_suffix,
            'dalam Paket',
        ),
        section_heading: text(
            next.included?.section_heading,
            'Yang Termasuk\ndalam Paket',
        ),
        title: text(next.included?.title, 'TERMASUK DALAM PAKET'),
        status_label: text(next.included?.status_label, 'INCLUDED'),
        image_url: text(
            next.included?.image_url,
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
        ),
        items: Array.isArray(next.included?.items)
            ? next.included.items
            : [
                  'Tiket Pesawat PP Direct Flight',
                  'Air Zam-zam 5 Liter',
                  'Hotel Sesuai Paket',
                  'TL & Mutawif',
                  'Visa Umroh Resmi',
                  'Handling',
                  'Makan 3x Sehari',
                  'Dokumentasi',
              ],
    };

    next.excluded = {
        title: text(next.excluded?.title, 'TIDAK TERMASUK DALAM PAKET'),
        status_label: text(next.excluded?.status_label, 'EXCLUDED'),
        image_url: text(
            next.excluded?.image_url,
            'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=85',
        ),
        items: Array.isArray(next.excluded?.items)
            ? next.excluded.items
            : ['Paspor', 'Vaksin', 'Pengeluaran Pribadi', 'Kelebihan Bagasi'],
    };

    next.reasons = {
        title: text(next.reasons?.title, 'KENAPA PILIH KAMI'),
        heading: text(
            next.reasons?.heading,
            'Lebih dari Sekadar Perjalanan,\nIni Pengalaman Berharga',
        ),
        items: normalizeItems(
            next.reasons?.items ?? legacyServices,
            defaultPromoReasonItems(),
        ),
        stats: normalizeItems(next.reasons?.stats ?? legacyStats, [
            {
                value: '10+',
                label: 'Tahun Pengalaman',
                note: 'Sejak 2015',
            },
            {
                value: '2.500+',
                label: 'Jamaah Telah Berangkat',
                note: 'Dari seluruh Indonesia',
            },
            {
                value: '98%',
                label: 'Kepuasan Jamaah',
                note: 'Rating rata-rata 4.9',
            },
        ]),
    };

    next.gallery = {
        ...next.gallery,
        title: text(next.gallery?.title, 'DOKUMENTASI JAMAAH'),
        heading: text(
            next.gallery?.heading,
            'Momen Berharga\nBersama Asfar Tour',
        ),
        description: text(
            next.gallery?.description,
            'Setiap momen ibadah diabadikan secara profesional - kenangan yang akan selalu diingat.',
        ),
        cta_label: text(next.gallery?.cta_label, 'Lihat Semua Dokumentasi'),
    };

    next.testimonials = {
        ...next.testimonials,
        title: text(next.testimonials?.title, 'TESTIMONI JAMAAH'),
        heading_prefix: text(next.testimonials?.heading_prefix, 'Apa Kata'),
        heading_highlight: text(next.testimonials?.heading_highlight, 'Mereka'),
        heading_suffix: text(next.testimonials?.heading_suffix, '?'),
        heading: text(next.testimonials?.heading, 'Apa Kata Mereka?'),
        description: text(
            next.testimonials?.description,
            'Ribuan jamaah telah mempercayakan perjalanan ibadahnya bersama Asfar Tour.',
        ),
        more_label: text(
            next.testimonials?.more_label,
            'Lihat Semua Testimoni',
        ),
    };

    next.faq = {
        ...next.faq,
        title: text(next.faq?.title, 'PERTANYAAN YANG SERING DIAJUKAN'),
        heading_prefix: text(next.faq?.heading_prefix, 'Pertanyaan yang'),
        heading_highlight: text(
            next.faq?.heading_highlight,
            'Sering Ditanyakan',
        ),
        heading_suffix: text(next.faq?.heading_suffix, ''),
        description: text(
            next.faq?.description,
            'Temukan jawaban untuk pertanyaan yang paling sering ditanyakan calon jamaah.',
        ),
    };

    next.location = {
        title: text(next.location?.title, 'Kunjungi Kantor Kami'),
        heading_prefix: text(next.location?.heading_prefix, 'Kunjungi'),
        heading_highlight: text(
            next.location?.heading_highlight,
            'Kantor Kami',
        ),
        heading_suffix: text(next.location?.heading_suffix, ''),
        description: text(
            next.location?.description,
            'Kami siap melayani konsultasi umroh secara langsung maupun online.',
        ),
        office_hours_title: text(
            next.location?.office_hours_title,
            'Jam Operasional',
        ),
        address_label: text(next.location?.address_label, 'Alamat'),
        address_empty_label: text(
            next.location?.address_empty_label,
            'Alamat belum diatur',
        ),
        contact_label: text(next.location?.contact_label, 'Kontak'),
        visit_points: Array.isArray(next.location?.visit_points)
            ? next.location.visit_points
            : [
                  'Kantor Dapat Dikunjungi',
                  'Konsultasi Langsung',
                  'Tim Siap Membantu',
                  'Lokasi Mudah Diakses',
              ],
        whatsapp_label: text(
            next.location?.whatsapp_label,
            'Konsultasi via WhatsApp',
        ),
        maps_label: text(next.location?.maps_label, 'Buka Google Maps'),
        maps_cta_label: text(
            next.location?.maps_cta_label,
            'Lihat Lokasi di Google Maps',
        ),
    };

    next.cta = {
        badge: text(next.cta?.badge, 'JANGAN TUNDA NIAT BAIK ANDA'),
        title: text(next.cta?.title, 'Jangan Tunda Niat\nBaik Anda'),
        description: text(
            next.cta?.description,
            'Konsultasikan perjalanan ibadah Anda sekarang bersama tim Asfar Tour. Gratis, tanpa syarat, tanpa tekanan.',
        ),
        button_label: text(next.cta?.button_label, 'Konsultasi via WhatsApp'),
        badges: Array.isArray(next.cta?.badges)
            ? next.cta.badges
            : ['Resmi Kemenag', 'Fast Response', 'Amanah', 'Support 24 Jam'],
    };

    next.stats = next.reasons.stats;
    next.services = {
        ...(next.services ?? {}),
        items: next.reasons.items,
    };

    return next;
}

function SectionCard({
    sectionId,
    sectionLabel,
    title,
    description,
    icon: Icon,
    children,
    action,
    defaultOpen = true,
    summary,
}: {
    sectionId?: string;
    sectionLabel?: string;
    title: string;
    description: string;
    icon: ElementType;
    children: ReactNode;
    action?: ReactNode;
    defaultOpen?: boolean;
    summary?: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section
            id={sectionId}
            className="scroll-mt-28 rounded-3xl border border-[#ead9ce] bg-white p-5 shadow-[0_10px_30px_rgba(122,13,23,.06)]"
        >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#f4e8df] pb-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-[#fff4e7] p-2.5 text-[#7a0d17]">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        {sectionLabel ? (
                            <p className="mb-1 text-[10px] font-black tracking-[0.22em] text-[#c88b2d] uppercase">
                                {sectionLabel}
                            </p>
                        ) : null}
                        <h2 className="text-base font-semibold text-[#31140f]">
                            {title}
                        </h2>
                        <p className="text-xs leading-5 text-[#8a6d63]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {action}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-full"
                        onClick={() => setIsOpen((current) => !current)}
                    >
                        {isOpen ? 'Tutup' : 'Buka'}
                        <ChevronDown
                            className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </Button>
                </div>
            </div>
            {isOpen ? (
                <div className="space-y-5">{children}</div>
            ) : (
                <div className="rounded-2xl border border-dashed border-[#ead9ce] bg-[#fff8f2] px-4 py-4 text-sm text-[#6f5248]">
                    {summary ??
                        'Section ini sedang ditutup. Klik Buka untuk mengedit detailnya.'}
                </div>
            )}
        </section>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold tracking-[0.02em] text-[#5f3b33]">
                {label}
            </Label>
            {children}
            {hint ? <p className="text-[11px] text-[#9a776d]">{hint}</p> : null}
        </div>
    );
}

function Grid({ children }: { children: ReactNode }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {children}
        </div>
    );
}

function IconSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder="Pilih icon" />
            </SelectTrigger>
            <SelectContent>
                {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function ArrayToolbar({
    label,
    buttonLabel,
    onClick,
}: {
    label: string;
    buttonLabel: string;
    onClick: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#8a6d63]">{label}</p>
            <Button type="button" variant="outline" size="sm" onClick={onClick}>
                <Plus className="mr-2 h-4 w-4" />
                {buttonLabel}
            </Button>
        </div>
    );
}

function RepeaterCard({
    title,
    index,
    icon,
    item,
    onRemove,
    onChange,
}: {
    title: string;
    index: number;
    icon?: boolean;
    item: Record<string, string>;
    onRemove: () => void;
    onChange: (field: string, value: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-[#ead9ce] bg-[#fff8f2] p-4">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-[#8a6d63]">
                    {title} {index + 1}
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-3">
                {icon ? (
                    <Field label="Icon">
                        <IconSelect
                            value={text(item.icon, 'plane')}
                            onChange={(value) => onChange('icon', value)}
                        />
                    </Field>
                ) : null}
                {'label' in item ? (
                    <Field label="Label">
                        <Input
                            value={text(item.label)}
                            onChange={(event) =>
                                onChange('label', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'price' in item ? (
                    <Field label="Harga">
                        <Input
                            value={text(item.price)}
                            onChange={(event) =>
                                onChange('price', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'note' in item ? (
                    <Field label="Catatan Kecil">
                        <Input
                            value={text(item.note)}
                            onChange={(event) =>
                                onChange('note', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'title' in item ? (
                    <Field label="Judul">
                        <Input
                            value={text(item.title)}
                            onChange={(event) =>
                                onChange('title', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'description' in item ? (
                    <Field label="Deskripsi">
                        <Textarea
                            rows={3}
                            value={text(item.description)}
                            onChange={(event) =>
                                onChange('description', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'value' in item ? (
                    <Field label="Nilai">
                        <Input
                            value={text(item.value)}
                            onChange={(event) =>
                                onChange('value', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
                {'note' in item ? (
                    <Field label="Catatan Kecil">
                        <Input
                            value={text(item.note)}
                            onChange={(event) =>
                                onChange('note', event.target.value)
                            }
                        />
                    </Field>
                ) : null}
            </div>
        </div>
    );
}

function TextListEditor({
    title,
    description,
    values,
    emptyLabel,
    addLabel,
    placeholder,
    onChange,
}: {
    title: string;
    description: string;
    values: string[];
    emptyLabel: string;
    addLabel: string;
    placeholder: string;
    onChange: (values: string[]) => void;
}) {
    const editableValues = values.map((value) => text(value));

    return (
        <div className="rounded-2xl border border-[#ead9ce] bg-[#fff8f2] p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#31140f]">
                        {title}
                    </p>
                    <p className="text-xs leading-5 text-[#8a6d63]">
                        {description}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => onChange([...editableValues, ''])}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {addLabel}
                </Button>
            </div>

            {editableValues.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e4cfc4] bg-white px-4 py-5 text-center text-sm text-[#8a6d63]">
                    {emptyLabel}
                </div>
            ) : (
                <div className="space-y-3">
                    {editableValues.map((value, index) => (
                        <div
                            key={`trust-point-${index}`}
                            className="flex items-center gap-3 rounded-2xl border border-[#ead9ce] bg-white p-3"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0e4] text-xs font-black text-[#8c0a16]">
                                {index + 1}
                            </span>
                            <Input
                                value={value}
                                placeholder={placeholder}
                                onChange={(event) => {
                                    const nextValues = [...editableValues];
                                    nextValues[index] = event.target.value;
                                    onChange(nextValues);
                                }}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 text-destructive hover:text-destructive"
                                onClick={() =>
                                    onChange(
                                        editableValues.filter(
                                            (_item, itemIndex) =>
                                                itemIndex !== index,
                                        ),
                                    )
                                }
                                aria-label={`Hapus poin ${index + 1}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LandingPromoEditor({
    page,
    data,
    packageOptions,
    processing,
    previewUrl,
    onSubmit,
    onSetData,
}: {
    page: LandingPageItem;
    data: {
        title: string;
        excerpt: string;
        content: Record<string, any>;
        media: Record<string, File | null>;
        is_active: boolean;
        _method: string;
    };
    packageOptions: PackageOption[];
    processing: boolean;
    previewUrl: string;
    onSubmit: (event: FormEvent) => void;
    onSetData: (path: string, value: unknown) => void;
}) {
    const content = normalizeLandingPromoContent(data.content ?? {});
    const heroTitleLines = multilineLines(content.hero?.title, 2);
    const pricingCards = Array.isArray(content.hero?.pricing_cards)
        ? content.hero.pricing_cards
        : [];
    const featureCards = Array.isArray(content.hero?.feature_cards)
        ? content.hero.feature_cards
        : [];
    const heroChecklistItems = Array.isArray(content.hero?.checklist_items)
        ? content.hero.checklist_items.map((item: unknown) => text(item))
        : [];
    const reasonItems = Array.isArray(content.reasons?.items)
        ? content.reasons.items
        : [];
    const reasonStats = Array.isArray(content.reasons?.stats)
        ? content.reasons.stats
        : [];
    const visitPoints = Array.isArray(content.location?.visit_points)
        ? content.location.visit_points
        : [];
    const ctaBadges = Array.isArray(content.cta?.badges)
        ? content.cta.badges
        : [];
    const selectedPackageIds = Array.isArray(
        content.packages?.selected_package_ids,
    )
        ? content.packages.selected_package_ids
              .map((value: unknown) => Number(value))
              .filter((value: number) => Number.isFinite(value))
              .slice(0, 3)
        : [];
    const quickSections = [
        { id: 'landing-editor-hero', label: 'Hero' },
        { id: 'landing-editor-packages', label: 'Paket' },
        { id: 'landing-editor-includes', label: 'Include/Exclude' },
        { id: 'landing-editor-reasons', label: 'Keunggulan' },
        { id: 'landing-editor-gallery', label: 'Galeri' },
        { id: 'landing-editor-testimonials', label: 'Testimoni' },
        { id: 'landing-editor-faq', label: 'FAQ' },
        { id: 'landing-editor-location', label: 'Lokasi' },
        { id: 'landing-editor-cta', label: 'CTA' },
    ];
    const selectedPackageLabels = selectedPackageIds
        .map((selectedId: number) =>
            packageOptions.find((item) => item.id === selectedId),
        )
        .filter((item: PackageOption | undefined): item is PackageOption =>
            Boolean(item),
        )
        .map((item: PackageOption) => item.name);

    void page;

    return (
        <form className="space-y-6 pb-10" onSubmit={onSubmit}>
            <div className="sticky top-3 z-30 rounded-3xl border border-[#ead9ce] bg-[#fffaf6]/95 p-4 shadow-[0_12px_34px_rgba(122,13,23,.08)] backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-[#31140f]">
                            Landing Promo Editor (/landing)
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Editor ini khusus untuk mockup promo full-bleed
                            terbaru.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                            <Button type="button" variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview /landing
                            </Button>
                        </a>
                        <Button type="submit" size="sm" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>
                <div className="mt-4 border-t border-[#f4e8df] pt-4">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-[#9a776d] uppercase">
                        Navigasi Cepat Section Landing
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {quickSections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="rounded-full border border-[#ead9ce] bg-white px-3 py-2 text-[11px] font-semibold text-[#5f3b33] transition hover:border-[#c88b2d] hover:text-[#7a0d17]"
                            >
                                {section.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <SectionCard
                sectionId="landing-editor-hero"
                sectionLabel="Section 01"
                title="Hero Promo"
                description="Atur pill promo, judul utama, CTA, harga kamar, dan bar fasilitas hero."
                icon={Sparkles}
                defaultOpen
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.hero?.badge)} •{' '}
                            {heroTitleLines.join(' / ')}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            CTA utama: {text(content.hero?.cta_label)} | Harga:{' '}
                            {pricingCards.length} kartu | Benefit hero:{' '}
                            {featureCards.length} item
                        </p>
                    </div>
                }
            >
                <Grid>
                    <Field label="Badge Hero">
                        <Input
                            value={text(content.hero?.badge)}
                            onChange={(event) =>
                                onSetData('hero.badge', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Pill Promo Atas">
                        <Input
                            value={text(content.hero?.promo_pill)}
                            onChange={(event) =>
                                onSetData('hero.promo_pill', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Durasi - Angka">
                        <Input
                            value={text(content.hero?.duration_value)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.duration_value',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Durasi - Label">
                        <Input
                            value={text(content.hero?.duration_suffix)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.duration_suffix',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    {heroTitleLines.map((line, index) => (
                        <Field
                            key={index}
                            label={
                                index === 0
                                    ? 'Judul Hero Utama (Putih)'
                                    : 'Judul Hero Highlight (Emas)'
                            }
                        >
                            <Input
                                value={line}
                                onChange={(event) =>
                                    onSetData(
                                        'hero.title',
                                        updateHeroTitleLine(
                                            content.hero?.title,
                                            index,
                                            event.target.value,
                                            2,
                                        ),
                                    )
                                }
                            />
                        </Field>
                    ))}
                    <Field
                        label="Sub Judul Hero"
                        hint="Contoh mockup: Berangkat Agustus 2026"
                    >
                        <Textarea
                            rows={2}
                            value={text(content.hero?.subtitle)}
                            onChange={(event) =>
                                onSetData('hero.subtitle', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Badge Kecil Sub Judul">
                        <Input
                            value={text(content.hero?.subtitle_badge)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.subtitle_badge',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Deskripsi Hero"
                        hint="Paragraf penjelasan di bawah subtitle."
                    >
                        <Textarea
                            rows={4}
                            value={text(content.hero?.description)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.description',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Utama">
                        <Input
                            value={text(content.hero?.cta_label)}
                            onChange={(event) =>
                                onSetData('hero.cta_label', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Kedua">
                        <Input
                            value={text(content.hero?.secondary_cta_label)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.secondary_cta_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Link Tombol Kedua">
                        <Input
                            value={text(content.hero?.secondary_cta_href)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.secondary_cta_href',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Badge FREE - Judul">
                        <Input
                            value={text(content.hero?.free_badge_title)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.free_badge_title',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Badge FREE - Label">
                        <Input
                            value={text(content.hero?.free_badge_label)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.free_badge_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Badge FREE - Catatan Kecil">
                        <Input
                            value={text(content.hero?.free_badge_note)}
                            onChange={(event) =>
                                onSetData(
                                    'hero.free_badge_note',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </Grid>

                <TextListEditor
                    title="Poin Kepercayaan Hero"
                    description="Poin kecil di bawah tombol hero. Tambah, ubah, atau hapus sesuai kebutuhan landing."
                    values={heroChecklistItems}
                    emptyLabel="Belum ada poin kepercayaan. Klik Tambah Poin untuk mulai mengisi."
                    addLabel="Tambah Poin"
                    placeholder="Contoh: Izin Resmi Kemenag RI"
                    onChange={(values) =>
                        onSetData(
                            'hero.checklist_items',
                            values.map((value) => value.trim()),
                        )
                    }
                />

                <ArrayToolbar
                    label="Kartu harga promo di area hero."
                    buttonLabel="Tambah Kartu Harga"
                    onClick={() =>
                        onSetData('hero.pricing_cards', [
                            ...pricingCards,
                            { label: '', price: '', note: '/Pax' },
                        ])
                    }
                />
                <div className="grid gap-4 lg:grid-cols-3">
                    {pricingCards.map(
                        (item: Record<string, string>, index: number) => (
                            <RepeaterCard
                                key={index}
                                title="Kartu Harga"
                                index={index}
                                item={item}
                                onRemove={() =>
                                    onSetData(
                                        'hero.pricing_cards',
                                        pricingCards.filter(
                                            (_: unknown, itemIndex: number) =>
                                                itemIndex !== index,
                                        ),
                                    )
                                }
                                onChange={(field, value) =>
                                    onSetData(
                                        `hero.pricing_cards.${index}.${field}`,
                                        value,
                                    )
                                }
                            />
                        ),
                    )}
                </div>

                <ArrayToolbar
                    label="Benefit hero di bawah kartu harga."
                    buttonLabel="Tambah Benefit Hero"
                    onClick={() =>
                        onSetData('hero.feature_cards', [
                            ...featureCards,
                            { icon: 'plane', title: '', description: '' },
                        ])
                    }
                />
                <div className="grid gap-4 lg:grid-cols-2">
                    {featureCards.map(
                        (item: Record<string, string>, index: number) => (
                            <RepeaterCard
                                key={index}
                                title="Benefit Hero"
                                index={index}
                                icon
                                item={item}
                                onRemove={() =>
                                    onSetData(
                                        'hero.feature_cards',
                                        featureCards.filter(
                                            (_: unknown, itemIndex: number) =>
                                                itemIndex !== index,
                                        ),
                                    )
                                }
                                onChange={(field, value) =>
                                    onSetData(
                                        `hero.feature_cards.${index}.${field}`,
                                        value,
                                    )
                                }
                            />
                        ),
                    )}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-[#ead9ce] bg-[#fff8f2] p-4 text-xs text-[#8a6d63]">
                    <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7a0d17]" />
                        <p>
                            Urutan hero mengikuti mockup: navbar internal, badge
                            hero, judul besar, subtitle, checklist, 3 kartu
                            harga, badge FREE, lalu strip benefit merah di bawah
                            hero.
                        </p>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-packages"
                sectionLabel="Section 02"
                title="Paket Pilihan Landing"
                description="Atur heading section paket sesuai mockup dan pilih sampai 3 paket yang tampil di /landing."
                icon={FileText}
                defaultOpen
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.package_details?.heading)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            {selectedPackageLabels.length > 0
                                ? `Paket aktif: ${selectedPackageLabels.join(', ')}`
                                : 'Belum ada paket yang dipilih untuk landing.'}
                        </p>
                    </div>
                }
            >
                <Grid>
                    <Field label="Judul Kecil Section Paket">
                        <Input
                            value={text(content.package_details?.title)}
                            onChange={(event) =>
                                onSetData(
                                    'package_details.title',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Judul Besar Section Paket">
                        <Input
                            value={text(content.package_details?.heading)}
                            onChange={(event) =>
                                onSetData(
                                    'package_details.heading',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Judul Besar Berwarna"
                        hint="Bagian judul kedua yang tampil dengan warna oranye."
                    >
                        <Input
                            value={text(content.package_details?.heading2)}
                            onChange={(event) =>
                                onSetData(
                                    'package_details.heading2',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Deskripsi Section Paket"
                        hint="Teks kecil di bawah judul paket."
                    >
                        <Textarea
                            rows={3}
                            value={text(content.package_details?.description)}
                            onChange={(event) =>
                                onSetData(
                                    'package_details.description',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Paket Lainnya">
                        <Input
                            value={text(content.packages?.more_packages_label)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.more_packages_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Tiap Paket">
                        <Input
                            value={text(content.packages?.detail_label)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.detail_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Satuan Harga">
                        <Input
                            value={text(content.packages?.price_unit_label)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.price_unit_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Akhiran Durasi">
                        <Input
                            value={text(content.packages?.duration_suffix)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.duration_suffix',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Fallback Nama Paket">
                        <Input
                            value={text(content.packages?.fallback_name)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.fallback_name',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Fallback Maskapai">
                        <Input
                            value={text(content.packages?.fallback_airline)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.fallback_airline',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Fallback Hotel">
                        <Input
                            value={text(content.packages?.fallback_hotel)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.fallback_hotel',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Catatan Harga">
                        <Input
                            value={text(content.packages?.disclaimer)}
                            onChange={(event) =>
                                onSetData(
                                    'packages.disclaimer',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </Grid>

                <div className="mt-5 rounded-2xl border border-[#ead9ce] bg-[#fff8f2] p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-[#31140f]">
                                Paket yang Ditampilkan di Landing
                            </p>
                            <p className="text-xs text-[#8a6d63]">
                                Maksimal 3 paket. Jika hanya 1 paket, kartu akan
                                tampil di tengah. Jika 2 paket, slot ketiga akan
                                dibiarkan kosong.
                            </p>
                        </div>
                        <span className="rounded-full border border-[#ead9ce] bg-white px-3 py-1 text-xs font-semibold text-[#7a0d17]">
                            {selectedPackageIds.length}/3 dipilih
                        </span>
                    </div>
                    {selectedPackageLabels.length > 0 ? (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {selectedPackageLabels.map(
                                (label: string, index: number) => (
                                    <span
                                        key={`${label}-${index}`}
                                        className="rounded-full bg-[#7a0d17] px-3 py-1 text-[11px] font-semibold text-white"
                                    >
                                        Slot {index + 1}: {label}
                                    </span>
                                ),
                            )}
                        </div>
                    ) : (
                        <div className="mb-4 rounded-2xl border border-dashed border-[#ead9ce] bg-white px-4 py-3 text-xs text-[#8a6d63]">
                            Belum ada paket dipilih. Pilih 1 sampai 3 paket agar
                            kartu paket langsung tampil di halaman /landing.
                        </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-3">
                        {[0, 1, 2].map((slotIndex) => {
                            const slotValue = String(
                                selectedPackageIds[slotIndex] ?? '__none__',
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
                                    label={`Slot Paket ${slotIndex + 1}`}
                                    hint="Urutan ini akan dipakai saat tampil di landing."
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
                                            <SelectValue placeholder="Pilih paket untuk slot ini" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                Kosongkan slot ini
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
                                                        Hari
                                                        {pkg.departure_city
                                                            ? ` - ${pkg.departure_city}`
                                                            : ''}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            );
                        })}
                    </div>

                    <p className="mt-3 text-xs text-[#8a6d63]">
                        Jika ingin menambah atau mengubah data paketnya, atur di
                        menu Product Management &gt; Packages.
                    </p>
                </div>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-includes"
                sectionLabel="Section 03"
                title="Termasuk / Tidak Termasuk"
                description="Kontrol dua kartu fasilitas paket."
                icon={FileText}
            >
                <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border border-[#ead9ce] bg-[#fff8f2] p-4">
                        <h3 className="mb-4 text-sm font-semibold text-[#31140f]">
                            Fasilitas Termasuk
                        </h3>
                        <div className="space-y-3">
                            <Field label="Badge Kecil Section">
                                <Input
                                    value={text(
                                        content.included?.section_badge,
                                    )}
                                    onChange={(event) =>
                                        onSetData(
                                            'included.section_badge',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Judul Kiri">
                                    <Input
                                        value={text(
                                            content.included
                                                ?.section_heading_prefix,
                                        )}
                                        onChange={(event) =>
                                            onSetData(
                                                'included.section_heading_prefix',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Judul Tengah">
                                    <Input
                                        value={text(
                                            content.included
                                                ?.section_heading_highlight,
                                        )}
                                        onChange={(event) =>
                                            onSetData(
                                                'included.section_heading_highlight',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Judul Kanan">
                                    <Input
                                        value={text(
                                            content.included
                                                ?.section_heading_suffix,
                                        )}
                                        onChange={(event) =>
                                            onSetData(
                                                'included.section_heading_suffix',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <Field label="Judul">
                                <Input
                                    value={text(content.included?.title)}
                                    onChange={(event) =>
                                        onSetData(
                                            'included.title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Label Status Kartu">
                                <Input
                                    value={text(content.included?.status_label)}
                                    onChange={(event) =>
                                        onSetData(
                                            'included.status_label',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="URL Gambar Background">
                                <Input
                                    value={text(content.included?.image_url)}
                                    onChange={(event) =>
                                        onSetData(
                                            'included.image_url',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Daftar Item"
                                hint="Satu baris per item."
                            >
                                <Textarea
                                    rows={8}
                                    value={
                                        Array.isArray(content.included?.items)
                                            ? content.included.items.join('\n')
                                            : ''
                                    }
                                    onChange={(event) =>
                                        onSetData(
                                            'included.items',
                                            splitTextareaLines(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[#ead9ce] bg-[#fff8f2] p-4">
                        <h3 className="mb-4 text-sm font-semibold text-[#31140f]">
                            Fasilitas Tidak Termasuk
                        </h3>
                        <div className="space-y-3">
                            <Field label="Judul">
                                <Input
                                    value={text(content.excluded?.title)}
                                    onChange={(event) =>
                                        onSetData(
                                            'excluded.title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Label Status Kartu">
                                <Input
                                    value={text(content.excluded?.status_label)}
                                    onChange={(event) =>
                                        onSetData(
                                            'excluded.status_label',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="URL Gambar Background">
                                <Input
                                    value={text(content.excluded?.image_url)}
                                    onChange={(event) =>
                                        onSetData(
                                            'excluded.image_url',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Daftar Item"
                                hint="Satu baris per item."
                            >
                                <Textarea
                                    rows={8}
                                    value={
                                        Array.isArray(content.excluded?.items)
                                            ? content.excluded.items.join('\n')
                                            : ''
                                    }
                                    onChange={(event) =>
                                        onSetData(
                                            'excluded.items',
                                            splitTextareaLines(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-reasons"
                sectionLabel="Section 04"
                title="Kenapa Pilih Asfar Tour"
                description="Benefit horizontal dan statistik pendukung."
                icon={Sparkles}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.reasons?.heading)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Benefit: {reasonItems.length} item | Statistik:{' '}
                            {reasonStats.length} item
                        </p>
                    </div>
                }
            >
                <Grid>
                    <Field label="Badge Kecil Section">
                        <Input
                            value={text(content.reasons?.title)}
                            onChange={(event) =>
                                onSetData('reasons.title', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Judul Besar Section">
                        <Textarea
                            rows={3}
                            value={text(content.reasons?.heading)}
                            onChange={(event) =>
                                onSetData('reasons.heading', event.target.value)
                            }
                        />
                    </Field>
                </Grid>
                <ArrayToolbar
                    label="Benefit horizontal."
                    buttonLabel="Tambah Benefit"
                    onClick={() =>
                        onSetData('reasons.items', [
                            ...reasonItems,
                            { icon: 'pin', title: '', description: '' },
                        ])
                    }
                />
                <div className="grid gap-4 lg:grid-cols-3">
                    {reasonItems.map(
                        (item: Record<string, string>, index: number) => (
                            <RepeaterCard
                                key={index}
                                title="Benefit"
                                index={index}
                                icon
                                item={item}
                                onRemove={() =>
                                    onSetData(
                                        'reasons.items',
                                        reasonItems.filter(
                                            (_: unknown, itemIndex: number) =>
                                                itemIndex !== index,
                                        ),
                                    )
                                }
                                onChange={(field, value) =>
                                    onSetData(
                                        `reasons.items.${index}.${field}`,
                                        value,
                                    )
                                }
                            />
                        ),
                    )}
                </div>
                <ArrayToolbar
                    label="Statistik kecil di sisi kanan."
                    buttonLabel="Tambah Statistik"
                    onClick={() =>
                        onSetData('reasons.stats', [
                            ...reasonStats,
                            { value: '', label: '' },
                        ])
                    }
                />
                <div className="grid gap-4 md:grid-cols-3">
                    {reasonStats.map(
                        (item: Record<string, string>, index: number) => (
                            <RepeaterCard
                                key={index}
                                title="Statistik"
                                index={index}
                                item={item}
                                onRemove={() =>
                                    onSetData(
                                        'reasons.stats',
                                        reasonStats.filter(
                                            (_: unknown, itemIndex: number) =>
                                                itemIndex !== index,
                                        ),
                                    )
                                }
                                onChange={(field, value) =>
                                    onSetData(
                                        `reasons.stats.${index}.${field}`,
                                        value,
                                    )
                                }
                            />
                        ),
                    )}
                </div>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-gallery"
                sectionLabel="Section 05"
                title="Galeri Dokumentasi"
                description="Atur judul section galeri. Isi foto akan otomatis mengambil data gallery yang sudah aktif."
                icon={Images}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.gallery?.heading)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Tombol galeri: {text(content.gallery?.cta_label)}
                        </p>
                    </div>
                }
                action={
                    <a
                        href="/admin/website-management/content"
                        className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8]"
                    >
                        Kelola foto di Website Content
                    </a>
                }
            >
                <Grid>
                    <Field
                        label="Judul Kecil Galeri"
                        hint="Contoh mockup: DOKUMENTASI JAMAAH"
                    >
                        <Input
                            value={text(content.gallery?.title)}
                            onChange={(event) =>
                                onSetData('gallery.title', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Judul Besar Galeri">
                        <Textarea
                            rows={3}
                            value={text(content.gallery?.heading)}
                            onChange={(event) =>
                                onSetData('gallery.heading', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Deskripsi Galeri">
                        <Textarea
                            rows={3}
                            value={text(content.gallery?.description)}
                            onChange={(event) =>
                                onSetData(
                                    'gallery.description',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Galeri">
                        <Input
                            value={text(content.gallery?.cta_label)}
                            onChange={(event) =>
                                onSetData(
                                    'gallery.cta_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </Grid>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-testimonials"
                sectionLabel="Section 06"
                title="Testimoni Jamaah"
                description="Atur judul dan label link section testimoni. Isi kartu diambil dari data testimonial yang aktif."
                icon={MessageCircle}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {[
                                text(content.testimonials?.heading_prefix),
                                text(content.testimonials?.heading_highlight),
                                text(content.testimonials?.heading_suffix),
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Link semua testimoni:{' '}
                            {text(content.testimonials?.more_label)}
                        </p>
                    </div>
                }
                action={
                    <a
                        href="/admin/website-management/content"
                        className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8]"
                    >
                        Kelola testimonial di Website Content
                    </a>
                }
            >
                <Grid>
                    <Field
                        label="Judul Kecil Testimoni"
                        hint="Contoh mockup: TESTIMONI JAMAAH"
                    >
                        <Input
                            value={text(content.testimonials?.title)}
                            onChange={(event) =>
                                onSetData(
                                    'testimonials.title',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Judul Kiri">
                            <Input
                                value={text(
                                    content.testimonials?.heading_prefix,
                                )}
                                onChange={(event) =>
                                    onSetData(
                                        'testimonials.heading_prefix',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Judul Tengah">
                            <Input
                                value={text(
                                    content.testimonials?.heading_highlight,
                                )}
                                onChange={(event) =>
                                    onSetData(
                                        'testimonials.heading_highlight',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Judul Kanan">
                            <Input
                                value={text(
                                    content.testimonials?.heading_suffix,
                                )}
                                onChange={(event) =>
                                    onSetData(
                                        'testimonials.heading_suffix',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                    <Field label="Deskripsi Testimoni">
                        <Textarea
                            rows={3}
                            value={text(content.testimonials?.description)}
                            onChange={(event) =>
                                onSetData(
                                    'testimonials.description',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Link Semua Testimoni">
                        <Input
                            value={text(content.testimonials?.more_label)}
                            onChange={(event) =>
                                onSetData(
                                    'testimonials.more_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </Grid>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-faq"
                sectionLabel="Section 07"
                title="FAQ Landing"
                description="Atur judul section FAQ. Daftar pertanyaan mengambil data FAQ yang aktif."
                icon={FileText}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.faq?.title)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Deskripsi:{' '}
                            {text(content.faq?.description) || 'Belum diisi'}
                        </p>
                    </div>
                }
                action={
                    <a
                        href="/admin/website-management/portal-content"
                        className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8]"
                    >
                        Kelola FAQ di Portal Content
                    </a>
                }
            >
                <Field
                    label="Judul Kecil FAQ"
                    hint="Contoh mockup: PERTANYAAN YANG SERING DIAJUKAN"
                >
                    <Input
                        value={text(content.faq?.title)}
                        onChange={(event) =>
                            onSetData('faq.title', event.target.value)
                        }
                    />
                </Field>
                <Field label="Deskripsi FAQ">
                    <Textarea
                        rows={3}
                        value={text(content.faq?.description)}
                        onChange={(event) =>
                            onSetData('faq.description', event.target.value)
                        }
                    />
                </Field>
                <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Judul Kiri">
                        <Input
                            value={text(content.faq?.heading_prefix)}
                            onChange={(event) =>
                                onSetData(
                                    'faq.heading_prefix',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Judul Tengah">
                        <Input
                            value={text(content.faq?.heading_highlight)}
                            onChange={(event) =>
                                onSetData(
                                    'faq.heading_highlight',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Judul Kanan">
                        <Input
                            value={text(content.faq?.heading_suffix)}
                            onChange={(event) =>
                                onSetData(
                                    'faq.heading_suffix',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </div>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-location"
                sectionLabel="Section 08"
                title="Lokasi Kantor"
                description="Label lokasi dan tombol aksi. Alamat serta jam operasional mengikuti branding/SEO."
                icon={MapPin}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.location?.title)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Poin kunjungan: {visitPoints.length} item
                        </p>
                    </div>
                }
            >
                <Grid>
                    <Field label="Judul Section">
                        <Input
                            value={text(content.location?.title)}
                            onChange={(event) =>
                                onSetData('location.title', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Deskripsi Section Lokasi">
                        <Textarea
                            rows={3}
                            value={text(content.location?.description)}
                            onChange={(event) =>
                                onSetData(
                                    'location.description',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Judul Kiri">
                            <Input
                                value={text(content.location?.heading_prefix)}
                                onChange={(event) =>
                                    onSetData(
                                        'location.heading_prefix',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Judul Tengah">
                            <Input
                                value={text(
                                    content.location?.heading_highlight,
                                )}
                                onChange={(event) =>
                                    onSetData(
                                        'location.heading_highlight',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Judul Kanan">
                            <Input
                                value={text(content.location?.heading_suffix)}
                                onChange={(event) =>
                                    onSetData(
                                        'location.heading_suffix',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                    <Field label="Judul Jam Operasional">
                        <Input
                            value={text(content.location?.office_hours_title)}
                            onChange={(event) =>
                                onSetData(
                                    'location.office_hours_title',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Alamat">
                        <Input
                            value={text(content.location?.address_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.address_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Teks Jika Alamat Kosong">
                        <Input
                            value={text(content.location?.address_empty_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.address_empty_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Kontak">
                        <Input
                            value={text(content.location?.contact_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.contact_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol WhatsApp">
                        <Input
                            value={text(content.location?.whatsapp_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.whatsapp_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol Google Maps">
                        <Input
                            value={text(content.location?.maps_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.maps_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Label Tombol CTA Maps">
                        <Input
                            value={text(content.location?.maps_cta_label)}
                            onChange={(event) =>
                                onSetData(
                                    'location.maps_cta_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Poin Kunjungan" hint="Satu baris per poin.">
                        <Textarea
                            rows={6}
                            value={visitPoints.join('\n')}
                            onChange={(event) =>
                                onSetData(
                                    'location.visit_points',
                                    splitTextareaLines(event.target.value),
                                )
                            }
                        />
                    </Field>
                </Grid>
            </SectionCard>

            <SectionCard
                sectionId="landing-editor-cta"
                sectionLabel="Section 09"
                title="CTA Penutup"
                description="Ajakan terakhir di bagian bawah landing."
                icon={MessageCircle}
                defaultOpen={false}
                summary={
                    <div className="space-y-2">
                        <p className="font-semibold text-[#31140f]">
                            {text(content.cta?.title)}
                        </p>
                        <p className="text-xs text-[#8a6d63]">
                            Tombol: {text(content.cta?.button_label)} | Badge
                            kecil: {ctaBadges.length} item
                        </p>
                    </div>
                }
            >
                <Grid>
                    <Field label="Badge Kecil CTA">
                        <Input
                            value={text(content.cta?.badge)}
                            onChange={(event) =>
                                onSetData('cta.badge', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Judul CTA">
                        <Input
                            value={text(content.cta?.title)}
                            onChange={(event) =>
                                onSetData('cta.title', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Deskripsi CTA">
                        <Textarea
                            rows={3}
                            value={text(content.cta?.description)}
                            onChange={(event) =>
                                onSetData('cta.description', event.target.value)
                            }
                        />
                    </Field>
                    <Field label="Label Tombol CTA">
                        <Input
                            value={text(content.cta?.button_label)}
                            onChange={(event) =>
                                onSetData(
                                    'cta.button_label',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field label="Badge Kecil CTA" hint="Satu baris per badge.">
                        <Textarea
                            rows={5}
                            value={ctaBadges.join('\n')}
                            onChange={(event) =>
                                onSetData(
                                    'cta.badges',
                                    splitTextareaLines(event.target.value),
                                )
                            }
                        />
                    </Field>
                </Grid>
            </SectionCard>
        </form>
    );
}
