import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'FAQ Umroh',
        meta: 'Pertanyaan yang sering ditanyakan seputar paket umroh.',
        subtitle: 'Jawaban ringkas untuk pertanyaan paling sering.',
        faqs: [
            {
                q: 'Biaya sudah termasuk apa saja?',
                a: 'Termasuk tiket PP, visa, hotel, konsumsi, transport, manasik, dan pembimbing.',
            },
            {
                q: 'Syarat dokumen apa saja?',
                a: 'Paspor, KTP, KK, foto 4x6, dan dokumen tambahan jika dibutuhkan.',
            },
            {
                q: 'Kapan manasik dilakukan?',
                a: 'Manasik dilakukan sebelum keberangkatan, jadwal diinformasikan oleh admin.',
            },
            {
                q: 'Kebijakan refund atau reschedule?',
                a: 'Menyesuaikan ketentuan maskapai, hotel, dan vendor terkait.',
            },
            {
                q: 'Apakah ada pendamping lansia?',
                a: 'Ya, tersedia pendampingan lansia sesuai kebutuhan jamaah.',
            },
            {
                q: 'Berapa jarak hotel ke masjid?',
                a: 'Estimasi jarak diinformasikan pada detail paket.',
            },
        ],
    },
    en: {
        title: 'Umrah FAQ',
        meta: 'Frequently asked questions about umrah packages.',
        subtitle: 'Quick answers to the most common questions.',
        faqs: [
            {
                q: 'What is included in the price?',
                a: 'Round-trip tickets, visa, hotel, meals, transport, manasik, and guides.',
            },
            {
                q: 'Which documents are required?',
                a: 'Passport, ID card, family card, 4x6 photo, and any additional requirements if needed.',
            },
            {
                q: 'When is the manasik held?',
                a: 'Manasik is held before departure and will be informed by our admin.',
            },
            {
                q: 'Refund or reschedule policy?',
                a: 'Follows airline, hotel, and vendor terms.',
            },
            {
                q: 'Is there assistance for elderly pilgrims?',
                a: 'Yes, elderly assistance is available based on needs.',
            },
            {
                q: 'How far is the hotel from the mosque?',
                a: 'Distance estimate is shared in the package details.',
            },
        ],
    },
};

export default function Faq() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.meta} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 pt-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        FAQ
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {t.subtitle}
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="space-y-3">
                    {t.faqs.map((item) => (
                        <details
                            key={item.q}
                            className="rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm"
                        >
                            <summary className="cursor-pointer text-sm font-semibold text-foreground">
                                {item.q}
                            </summary>
                            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
