import {
    MotionCard,
    MotionGroup,
    MotionSection,
} from '@/components/public-motion';
import PublicLayout from '@/layouts/PublicLayout';
import { localize, usePublicPageContent } from '@/lib/public-content';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
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
            contactTitle: 'Kontak PIC',
            contactDescription:
                'Data ini dipakai admin untuk follow up. Setelah disetujui, request akan diproses jadi booking.',
            fullName: 'Nama PIC',
            whatsapp: 'Nomor WhatsApp',
            email: 'Email (opsional)',
            groupType: 'Jenis Rombongan',
            groupOptions: [
                'Keluarga',
                'Teman / Komunitas',
                'Corporate / Instansi',
            ],
            pilgrims: 'Jumlah Jamaah',
            city: 'Kota Keberangkatan',
            month: 'Perkiraan Bulan Berangkat',
            departureDate: 'Tanggal Berangkat (opsional)',
            returnDate: 'Tanggal Pulang (opsional)',
            budget: 'Budget per Jamaah',
            focus: 'Prioritas Utama',
            focusOptions: [
                'Harga terbaik',
                'Hotel lebih dekat',
                'Jadwal fleksibel',
                'Pendampingan ibadah',
            ],
            room: 'Preferensi Kamar',
            roomOptions: ['Double', 'Triple', 'Quad', 'Fleksibel'],
            notes: 'Catatan Tambahan',
            notesPlaceholder:
                'Contoh: ingin kamar triple, rombongan lansia, butuh city tour, atau ingin berangkat saat liburan sekolah.',
            previewTitle: 'Ringkasan request',
            cta: 'Kirim Request',
        },
        guide: {
            title: 'Agar proses custom lebih cepat',
            checklistTitle: 'Checklist request',
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
            contactTitle: 'Primary Contact',
            contactDescription:
                'We will use this to follow up. Once approved, the request will be processed into a booking.',
            fullName: 'Contact Name',
            whatsapp: 'WhatsApp Number',
            email: 'Email (optional)',
            groupType: 'Group Type',
            groupOptions: [
                'Family',
                'Friends / Community',
                'Corporate / Institution',
            ],
            pilgrims: 'Number of Pilgrims',
            city: 'Departure City',
            month: 'Estimated Departure Month',
            departureDate: 'Departure Date (optional)',
            returnDate: 'Return Date (optional)',
            budget: 'Budget per Pilgrim',
            focus: 'Main Priority',
            focusOptions: [
                'Best price',
                'Closer hotel',
                'Flexible schedule',
                'Better guidance',
            ],
            room: 'Room Preference',
            roomOptions: ['Double', 'Triple', 'Quad', 'Flexible'],
            notes: 'Additional Notes',
            notesPlaceholder:
                'Example: need triple rooms, elderly pilgrims, city tour, or school holiday departure.',
            previewTitle: 'Request summary',
            cta: 'Send Request',
        },
        guide: {
            title: 'To make the custom process faster',
            checklistTitle: 'Request checklist',
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

    const [fullName, setFullName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [groupType, setGroupType] = useState(t.planner.groupOptions[0]);
    const [pilgrims, setPilgrims] = useState<number | ''>('');
    const [city, setCity] = useState('');
    const [month, setMonth] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [budget, setBudget] = useState<number | ''>('');
    const [focus, setFocus] = useState(t.planner.focusOptions[0]);
    const [room, setRoom] = useState(t.planner.roomOptions[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const sanitizedWhatsapp = normalizePhone(whatsapp);
    const adminWhatsappRaw = String(seo?.contact?.whatsapp ?? '').trim();
    const adminWhatsapp = normalizePhone(adminWhatsappRaw);

    const isFullNameValid = fullName.trim() !== '';
    const isWhatsappValid = sanitizedWhatsapp !== '';
    const isPilgrimsValid = typeof pilgrims === 'number' && pilgrims > 0;
    const isCityValid = city.trim() !== '';
    const isMonthValid = month.trim() !== '';

    const missingFields: string[] = [];
    if (!isFullNameValid) {
        missingFields.push(t.planner.fullName);
    }
    if (!isWhatsappValid) {
        missingFields.push(t.planner.whatsapp);
    }
    if (!isPilgrimsValid) {
        missingFields.push(t.planner.pilgrims);
    }
    if (!isCityValid) {
        missingFields.push(t.planner.city);
    }
    if (!isMonthValid) {
        missingFields.push(t.planner.month);
    }

    const isFormValid =
        isFullNameValid &&
        isWhatsappValid &&
        isPilgrimsValid &&
        isCityValid &&
        isMonthValid;

    const shouldShowValidation = hasAttemptedSubmit && !submitSuccess;

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
                                {t.guide.checklistTitle}
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
                                if (isSubmitting) {
                                    return;
                                }

                                setHasAttemptedSubmit(true);
                                if (!isFormValid) {
                                    return;
                                }

                                setIsSubmitting(true);
                                setSubmitSuccess(false);
                                router.post(
                                    '/custom-umroh',
                                    {
                                        full_name: fullName.trim(),
                                        phone: sanitizedWhatsapp,
                                        email:
                                            email.trim() === ''
                                                ? null
                                                : email.trim(),
                                        origin_city: city.trim(),
                                        passenger_count: pilgrims,
                                        group_type: groupType,
                                        departure_month: month.trim(),
                                        departure_date:
                                            departureDate.trim() === ''
                                                ? null
                                                : departureDate.trim(),
                                        return_date:
                                            returnDate.trim() === ''
                                                ? null
                                                : returnDate.trim(),
                                        budget:
                                            typeof budget === 'number'
                                                ? budget
                                                : null,
                                        focus,
                                        room_preference: room,
                                        notes:
                                            notes.trim() === ''
                                                ? null
                                                : notes.trim(),
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setSubmitSuccess(true);
                                            setFullName('');
                                            setWhatsapp('');
                                            setEmail('');
                                            setPilgrims('');
                                            setCity('');
                                            setMonth('');
                                            setDepartureDate('');
                                            setReturnDate('');
                                            setBudget('');
                                            setNotes('');
                                            setHasAttemptedSubmit(false);
                                        },
                                        onFinish: () => setIsSubmitting(false),
                                    },
                                );
                            }}
                        >
                            <div className="md:col-span-2">
                                <div className="rounded-2xl border border-border bg-background/70 p-4">
                                    <p className="font-semibold text-foreground">
                                        {t.planner.contactTitle}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t.planner.contactDescription}
                                    </p>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <FormField label={t.planner.fullName}>
                                            <input
                                                className={`${fieldClassName} ${shouldShowValidation && !isFullNameValid ? 'border-destructive focus:border-destructive' : ''}`}
                                                placeholder={
                                                    locale === 'id'
                                                        ? 'Contoh: Ahmad Fauzi'
                                                        : 'Example: Ahmad Fauzi'
                                                }
                                                value={fullName}
                                                onChange={(event) =>
                                                    setFullName(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <FormField label={t.planner.whatsapp}>
                                            <input
                                                className={`${fieldClassName} ${shouldShowValidation && !isWhatsappValid ? 'border-destructive focus:border-destructive' : ''}`}
                                                inputMode="tel"
                                                placeholder={
                                                    locale === 'id'
                                                        ? 'Contoh: 081234567890'
                                                        : 'Example: 081234567890'
                                                }
                                                value={whatsapp}
                                                onChange={(event) =>
                                                    setWhatsapp(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>

                                        <div className="md:col-span-2">
                                            <FormField label={t.planner.email}>
                                                <input
                                                    className={fieldClassName}
                                                    type="email"
                                                    placeholder="opsional"
                                                    value={email}
                                                    onChange={(event) =>
                                                        setEmail(
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    className={`${fieldClassName} ${shouldShowValidation && !isPilgrimsValid ? 'border-destructive focus:border-destructive' : ''}`}
                                    type="number"
                                    min={1}
                                    step={1}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Contoh: 12 orang'
                                            : 'Example: 12 people'
                                    }
                                    value={
                                        pilgrims === '' ? '' : String(pilgrims)
                                    }
                                    onChange={(event) =>
                                        setPilgrims(
                                            event.target.value === ''
                                                ? ''
                                                : Math.max(
                                                      1,
                                                      Number.parseInt(
                                                          event.target.value,
                                                          10,
                                                      ) || 1,
                                                  ),
                                        )
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.city}>
                                <input
                                    list="custom-umroh-departure-cities"
                                    className={`${fieldClassName} ${shouldShowValidation && !isCityValid ? 'border-destructive focus:border-destructive' : ''}`}
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
                                    className={`${fieldClassName} ${shouldShowValidation && !isMonthValid ? 'border-destructive focus:border-destructive' : ''}`}
                                    type="month"
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

                            <FormField label={t.planner.departureDate}>
                                <input
                                    className={fieldClassName}
                                    type="date"
                                    value={departureDate}
                                    onChange={(event) =>
                                        setDepartureDate(event.target.value)
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.returnDate}>
                                <input
                                    className={fieldClassName}
                                    type="date"
                                    value={returnDate}
                                    min={departureDate || undefined}
                                    onChange={(event) =>
                                        setReturnDate(event.target.value)
                                    }
                                />
                            </FormField>

                            <FormField label={t.planner.budget}>
                                <input
                                    className={fieldClassName}
                                    type="number"
                                    min={0}
                                    step={100000}
                                    placeholder={
                                        locale === 'id'
                                            ? 'Contoh: 35.000.000'
                                            : 'Example: 35,000,000'
                                    }
                                    value={budget === '' ? '' : String(budget)}
                                    onChange={(event) =>
                                        setBudget(
                                            event.target.value === ''
                                                ? ''
                                                : Math.max(
                                                      0,
                                                      Number.parseInt(
                                                          event.target.value,
                                                          10,
                                                      ) || 0,
                                                  ),
                                        )
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

                            <FormField label={t.planner.room}>
                                <select
                                    className={fieldClassName}
                                    value={room}
                                    onChange={(event) =>
                                        setRoom(event.target.value)
                                    }
                                >
                                    {t.planner.roomOptions.map((option) => (
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
                                        {t.planner.previewTitle}
                                    </p>
                                    <pre className="mt-3 font-sans text-sm whitespace-pre-wrap text-muted-foreground">
                                        {buildCustomInquiryMessage(locale, {
                                            fullName,
                                            whatsapp: sanitizedWhatsapp,
                                            email,
                                            groupType,
                                            pilgrims,
                                            city,
                                            month,
                                            departureDate,
                                            returnDate,
                                            budget,
                                            focus,
                                            room,
                                            notes,
                                        })}
                                    </pre>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                {submitSuccess ? (
                                    <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                        {locale === 'id'
                                            ? 'Request custom umroh berhasil dikirim. Tim admin akan follow up.'
                                            : 'Your custom umrah request has been submitted. Our admin team will follow up.'}
                                    </div>
                                ) : null}
                                <button
                                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? locale === 'id'
                                            ? 'Mengirim...'
                                            : 'Submitting...'
                                        : t.planner.cta}
                                </button>
                                {shouldShowValidation &&
                                !isFormValid &&
                                missingFields.length > 0 ? (
                                    <p className="mt-2 text-center text-xs text-muted-foreground">
                                        {locale === 'id'
                                            ? `Lengkapi dulu: ${missingFields.join(', ')}.`
                                            : `Please complete: ${missingFields.join(', ')}.`}
                                    </p>
                                ) : null}
                                {adminWhatsapp ? (
                                    <a
                                        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/30"
                                        href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(
                                            buildCustomInquiryMessage(locale, {
                                                fullName,
                                                whatsapp: sanitizedWhatsapp,
                                                email,
                                                groupType,
                                                pilgrims,
                                                city,
                                                month,
                                                departureDate,
                                                returnDate,
                                                budget,
                                                focus,
                                                room,
                                                notes,
                                            }),
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {locale === 'id'
                                            ? 'Konsultasi WhatsApp (opsional)'
                                            : 'WhatsApp consultation (optional)'}
                                    </a>
                                ) : null}
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

function normalizePhone(phone: string): string {
    const cleanedPhone = phone.replace(/[^\d]/g, '');

    if (!cleanedPhone) {
        return '';
    }

    if (cleanedPhone.startsWith('0')) {
        return `62${cleanedPhone.slice(1)}`;
    }

    return cleanedPhone;
}

function buildCustomInquiryMessage(
    locale: 'id' | 'en',
    payload: {
        fullName: string;
        whatsapp: string;
        email: string;
        groupType: string;
        pilgrims: number | '';
        city: string;
        month: string;
        departureDate: string;
        returnDate: string;
        budget: number | '';
        focus: string;
        room: string;
        notes: string;
    },
): string {
    const formattedBudget =
        typeof payload.budget === 'number' && Number.isFinite(payload.budget)
            ? new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(
                  payload.budget,
              )
            : '-';

    if (locale === 'en') {
        return [
            'Hello, I want to request a custom Umrah package.',
            '',
            `Contact name: ${payload.fullName || '-'}`,
            `WhatsApp: ${payload.whatsapp || '-'}`,
            `Email: ${payload.email || '-'}`,
            `Group type: ${payload.groupType}`,
            `Pilgrims: ${payload.pilgrims || '-'}`,
            `Departure city: ${payload.city || '-'}`,
            `Estimated month: ${payload.month || '-'}`,
            `Departure date: ${payload.departureDate || '-'}`,
            `Return date: ${payload.returnDate || '-'}`,
            `Budget per pilgrim: ${formattedBudget}`,
            `Main priority: ${payload.focus || '-'}`,
            `Room preference: ${payload.room || '-'}`,
            `Additional notes: ${payload.notes || '-'}`,
        ].join('\n');
    }

    return [
        'Halo, saya ingin request paket custom umroh.',
        '',
        `Nama PIC: ${payload.fullName || '-'}`,
        `WhatsApp: ${payload.whatsapp || '-'}`,
        `Email: ${payload.email || '-'}`,
        `Jenis rombongan: ${payload.groupType}`,
        `Jumlah jamaah: ${payload.pilgrims || '-'}`,
        `Kota keberangkatan: ${payload.city || '-'}`,
        `Perkiraan bulan berangkat: ${payload.month || '-'}`,
        `Tanggal berangkat: ${payload.departureDate || '-'}`,
        `Tanggal pulang: ${payload.returnDate || '-'}`,
        `Budget per jamaah: ${formattedBudget}`,
        `Prioritas utama: ${payload.focus || '-'}`,
        `Preferensi kamar: ${payload.room || '-'}`,
        `Catatan tambahan: ${payload.notes || '-'}`,
    ].join('\n');
}
