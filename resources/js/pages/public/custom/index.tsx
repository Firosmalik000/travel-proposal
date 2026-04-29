import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import PublicLayout from '@/layouts/PublicLayout';
import {
    localize,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';

const indonesianDepartureCities = [
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Semarang',
    'Yogyakarta',
    'Solo',
    'Malang',
    'Denpasar',
    'Medan',
    'Palembang',
    'Padang',
    'Pekanbaru',
    'Batam',
    'Balikpapan',
    'Banjarmasin',
    'Pontianak',
    'Samarinda',
    'Makassar',
    'Manado',
    'Ambon',
    'Jayapura',
    'Mataram',
    'Kupang',
    'Banda Aceh',
    'Lampung',
] as const;

const content = {
    id: {
        title: 'Custom Umroh',
        description:
            'Ceritakan kebutuhan rombongan Anda, lalu kami bantu siapkan penawaran yang paling cocok.',
        planner: {
            title: 'Isi kebutuhan singkat Anda',
            description:
                'Form ini membantu kami memahami kebutuhan dasar sebelum tim admin menghubungi Anda.',
            groupType: 'Jenis Rombongan',
            groupOptions: [
                'Keluarga',
                'Teman / Komunitas',
                'Corporate / Instansi',
            ],
            pilgrims: 'Jumlah Jamaah',
            city: 'Kota Keberangkatan',
            month: 'Perkiraan Bulan Berangkat',
            budget: 'Budget per Jamaah',
            focus: 'Prioritas Utama',
            focusOptions: [
                'Harga terbaik',
                'Hotel lebih dekat',
                'Jadwal fleksibel',
                'Pendampingan ibadah',
            ],
            notes: 'Catatan Tambahan',
            notesPlaceholder:
                'Contoh: ingin kamar triple, rombongan lansia, butuh city tour, atau ingin berangkat saat liburan sekolah.',
            cta: 'Kirim Brief ke WhatsApp',
        },
        guide: {
            title: 'Agar proses custom lebih cepat',
            items: [
                'Tentukan jumlah jamaah yang paling mendekati.',
                'Pilih bulan keberangkatan perkiraan terlebih dahulu.',
                'Tuliskan kebutuhan khusus seperti lansia, anak, atau preferensi kamar.',
            ],
        },
        steps: [
            {
                title: 'Ceritakan kebutuhan rombongan',
                description:
                    'Jumlah jamaah, kota keberangkatan, dan target waktu berangkat.',
            },
            {
                title: 'Tim kami susun opsi terbaik',
                description:
                    'Kami cocokkan maskapai, hotel, dan ritme perjalanan sesuai kebutuhan Anda.',
            },
            {
                title: 'Anda review lalu finalisasi',
                description:
                    'Setelah cocok, admin bantu lanjut ke penawaran, seat, dan dokumen.',
            },
        ],
    },
    en: {
        title: 'Custom Umrah',
        description:
            'Tell us what your group needs, and we will prepare the most suitable proposal.',
        planner: {
            title: 'Fill in your brief requirements',
            description:
                'This form helps us understand the essentials before our team contacts you.',
            groupType: 'Group Type',
            groupOptions: [
                'Family',
                'Friends / Community',
                'Corporate / Institution',
            ],
            pilgrims: 'Number of Pilgrims',
            city: 'Departure City',
            month: 'Estimated Departure Month',
            budget: 'Budget per Pilgrim',
            focus: 'Main Priority',
            focusOptions: [
                'Best price',
                'Closer hotel',
                'Flexible schedule',
                'Better guidance',
            ],
            notes: 'Additional Notes',
            notesPlaceholder:
                'Example: need triple rooms, elderly pilgrims, city tour, or school holiday departure.',
            cta: 'Send Brief via WhatsApp',
        },
        guide: {
            title: 'To make the custom process faster',
            items: [
                'Set the closest estimate for the number of pilgrims.',
                'Choose the approximate departure month first.',
                'Write any special needs such as elderly pilgrims, children, or room preferences.',
            ],
        },
        steps: [
            {
                title: 'Tell us what your group needs',
                description:
                    'Number of pilgrims, departure city, and target month.',
            },
            {
                title: 'We prepare the best options',
                description:
                    'We match flights, hotels, and travel rhythm to your needs.',
            },
            {
                title: 'You review and finalize',
                description:
                    'Once suitable, our admin helps with the offer, seat, and documents.',
            },
        ],
    },
};

export default function Custom() {
    const locale: 'id' | 'en' = 'id';
    const page = usePublicPageContent('custom-umroh');
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const t = content[locale];

    const [groupType, setGroupType] = useState(t.planner.groupOptions[0]);
    const [pilgrims, setPilgrims] = useState('');
    const [city, setCity] = useState('');
    const [month, setMonth] = useState('');
    const [budget, setBudget] = useState('');
    const [focus, setFocus] = useState(t.planner.focusOptions[0]);
    const [notes, setNotes] = useState('');

    const whatsappLink = whatsappLinkFromSeo(
        seo,
        buildCustomInquiryMessage(locale, {
            groupType,
            pilgrims,
            city,
            month,
            budget,
            focus,
            notes,
        }),
    );

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, t.title)}>
                <meta
                    name="description"
                    content={localize(page?.excerpt, locale, t.description)}
                />
            </Head>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:px-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                        {localize(page?.content?.badge, locale, 'Custom')}
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {localize(page?.title, locale, t.title)}
                    </h1>
                    <p className="mt-2 max-w-3xl text-muted-foreground">
                        {localize(
                            page?.content?.description,
                            locale,
                            t.description,
                        )}
                    </p>
                </div>
            </MotionSection>

            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <MotionCard className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            {localize(page?.content?.subtitle, locale, '')}
                        </p>
                        <h2 className="public-heading mt-3 text-xl font-semibold text-foreground">
                            {t.guide.title}
                        </h2>
                        <MotionGroup className="mt-5 space-y-4">
                            {t.steps.map((step, index) => (
                                <MotionCard
                                    key={step.title}
                                    className="rounded-2xl border border-border bg-background/70 p-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            0{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </MotionCard>
                            ))}
                        </MotionGroup>

                        <MotionCard className="mt-6 rounded-2xl border border-border bg-background/70 p-5">
                            <h3 className="font-semibold text-foreground">
                                {t.guide.title}
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                {t.guide.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </MotionCard>
                    </MotionCard>

                    <MotionCard className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm">
                        <h2 className="public-heading text-xl font-semibold text-foreground">
                            {t.planner.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t.planner.description}
                        </p>

                        <form
                            className="mt-6 grid gap-4 md:grid-cols-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                if (!whatsappLink) {
                                    return;
                                }
                                window.open(
                                    whatsappLink,
                                    '_blank',
                                    'noopener,noreferrer',
                                );
                            }}
                        >
                            <FormField label={t.planner.groupType}>
                                <select
                                    className={fieldClassName}
                                    value={groupType}
                                    onChange={(event) =>
                                        setGroupType(event.target.value)
                                    }
                                >
                                    {t.planner.groupOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label={t.planner.pilgrims}>
                                <input
                                    className={fieldClassName}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Contoh: 12 orang'
                                            : 'Example: 12 people'
                                    }
                                    value={pilgrims}
                                    onChange={(event) =>
                                        setPilgrims(event.target.value)
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.city}>
                                <input
                                    list="custom-umroh-departure-cities"
                                    className={fieldClassName}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Pilih atau cari kota keberangkatan'
                                            : 'Choose or search a departure city'
                                    }
                                    value={city}
                                    onChange={(event) =>
                                        setCity(event.target.value)
                                    }
                                />
                                <datalist id="custom-umroh-departure-cities">
                                    {indonesianDepartureCities.map(
                                        (departureCity) => (
                                            <option
                                                key={departureCity}
                                                value={departureCity}
                                            />
                                        ),
                                    )}
                                </datalist>
                            </FormField>

                            <FormField label={t.planner.month}>
                                <input
                                    className={fieldClassName}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Contoh: Desember 2026'
                                            : 'Example: December 2026'
                                    }
                                    value={month}
                                    onChange={(event) =>
                                        setMonth(event.target.value)
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.budget}>
                                <input
                                    className={fieldClassName}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Contoh: 35.000.000'
                                            : 'Example: 35,000,000'
                                    }
                                    value={budget}
                                    onChange={(event) =>
                                        setBudget(event.target.value)
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.focus}>
                                <select
                                    className={fieldClassName}
                                    value={focus}
                                    onChange={(event) =>
                                        setFocus(event.target.value)
                                    }
                                >
                                    {t.planner.focusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <div className="md:col-span-2">
                                <FormField label={t.planner.notes}>
                                    <textarea
                                        className={`${fieldClassName} min-h-32 resize-none`}
                                        placeholder={t.planner.notesPlaceholder}
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(event.target.value)
                                        }
                                    />
                                </FormField>
                            </div>

                            <div className="md:col-span-2">
                                <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                                    <p className="font-semibold text-foreground">
                                        {locale === 'id'
                                            ? 'Preview brief yang akan dikirim'
                                            : 'Brief preview to be sent'}
                                    </p>
                                    <pre className="mt-3 font-sans text-sm whitespace-pre-wrap text-muted-foreground">
                                        {buildCustomInquiryMessage(locale, {
                                            groupType,
                                            pilgrims,
                                            city,
                                            month,
                                            budget,
                                            focus,
                                            notes,
                                        })}
                                    </pre>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                                    disabled={!whatsappLink}
                                >
                                    {localize(
                                        page?.content?.cta,
                                        locale,
                                        t.planner.cta,
                                    )}
                                </button>
                            </div>
                        </form>
                    </MotionCard>
                </div>
            </MotionSection>
        </PublicLayout>
    );
}

function FormField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block text-sm font-semibold text-foreground">
            <span className="mb-2 block">{label}</span>
            {children}
        </label>
    );
}

const fieldClassName =
    'w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary';

function buildCustomInquiryMessage(
    locale: 'id' | 'en',
    payload: {
        groupType: string;
        pilgrims: string;
        city: string;
        month: string;
        budget: string;
        focus: string;
        notes: string;
    },
): string {
    if (locale === 'en') {
        return [
            'Hello, I want to request a custom Umrah package.',
            '',
            `Group type: ${payload.groupType}`,
            `Pilgrims: ${payload.pilgrims || '-'}`,
            `Departure city: ${payload.city || '-'}`,
            `Estimated month: ${payload.month || '-'}`,
            `Budget per pilgrim: ${payload.budget || '-'}`,
            `Main priority: ${payload.focus || '-'}`,
            `Additional notes: ${payload.notes || '-'}`,
        ].join('\n');
    }

    return [
        'Halo, saya ingin request paket custom umroh.',
        '',
        `Jenis rombongan: ${payload.groupType}`,
        `Jumlah jamaah: ${payload.pilgrims || '-'}`,
        `Kota keberangkatan: ${payload.city || '-'}`,
        `Perkiraan bulan berangkat: ${payload.month || '-'}`,
        `Budget per jamaah: ${payload.budget || '-'}`,
        `Prioritas utama: ${payload.focus || '-'}`,
        `Catatan tambahan: ${payload.notes || '-'}`,
    ].join('\n');
}
