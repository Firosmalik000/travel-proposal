import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Legalitas & Perizinan',
        meta: 'Informasi legalitas dan perizinan resmi Amanah Haramain Travel.',
        subtitle: 'Informasi resmi yang memperkuat kepercayaan jamaah.',
        cards: [
            { title: 'Identitas Perusahaan', desc: ['PT Amanah Haramain Travel', 'Jl. Amanah No. 12, Jakarta Pusat'] },
            { title: 'Nomor Izin Umroh', desc: ['KMA 123/2024 (contoh)', 'Kementerian Agama RI'] },
            { title: 'NPWP & NIB', desc: ['NPWP: 01.234.567.8-901.000', 'NIB: 1234567890123'] },
        ],
        docsTitle: 'Dokumen Legalitas',
        docs: ['Foto izin umroh (watermark)', 'Foto NIB & NPWP', 'Foto kantor & plang usaha'],
        bankTitle: 'Rekening Resmi',
        bankLines: ['Nama rekening: PT Amanah Haramain Travel', 'Bank: BSI / Mandiri Syariah (contoh)', 'No rekening: 1234 5678 90'],
        disclaimerTitle: 'Disclaimer Anti Penipuan',
        disclaimer:
            'Kami hanya melayani transaksi melalui rekening resmi perusahaan dan kontak resmi. Waspada terhadap pihak yang mengatasnamakan Amanah Haramain di luar nomor yang tertera di website.',
    },
    en: {
        title: 'Licenses & Legalities',
        meta: 'Official license and legality information for Amanah Haramain Travel.',
        subtitle: 'Verified information that builds pilgrim trust.',
        cards: [
            { title: 'Company Identity', desc: ['PT Amanah Haramain Travel', 'Jl. Amanah No. 12, Central Jakarta'] },
            { title: 'Umrah License Number', desc: ['KMA 123/2024 (sample)', 'Ministry of Religious Affairs'] },
            { title: 'Tax ID & NIB', desc: ['Tax ID: 01.234.567.8-901.000', 'NIB: 1234567890123'] },
        ],
        docsTitle: 'Legal Documents',
        docs: ['Umrah license photo (watermark)', 'NIB & tax ID photo', 'Office and signage photo'],
        bankTitle: 'Official Bank Account',
        bankLines: ['Account name: PT Amanah Haramain Travel', 'Bank: BSI / Mandiri Syariah (sample)', 'Account number: 1234 5678 90'],
        disclaimerTitle: 'Anti-Fraud Disclaimer',
        disclaimer:
            'We only accept transactions through the official company account and contacts. Beware of parties claiming to represent Amanah Haramain outside the numbers listed on this website.',
    },
};

export default function Legalitas() {
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
                        Legal
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12">
                <div className="grid gap-6 md:grid-cols-3">
                    {t.cards.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm"
                        >
                            <h3 className="public-heading text-lg font-semibold text-foreground">{item.title}</h3>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {item.desc.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.docsTitle}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {t.docs.map((item) => (
                        <div
                            key={item}
                            className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-center text-sm font-semibold text-muted-foreground"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.bankTitle}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    {t.bankLines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.disclaimerTitle}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-accent/30 p-5 text-sm text-foreground">
                    {t.disclaimer}
                </div>
            </section>
        </PublicLayout>
    );
}
