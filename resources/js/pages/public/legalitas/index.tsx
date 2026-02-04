import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Legalitas() {
    return (
        <PublicLayout>
            <Head title="Legalitas & Perizinan">
                <meta name="description" content="Informasi legalitas dan perizinan resmi Amanah Haramain Travel." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Legalitas & Perizinan
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">Informasi resmi yang memperkuat kepercayaan jamaah.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        { title: 'Identitas Perusahaan', desc: ['PT Amanah Haramain Travel', 'Jl. Amanah No. 12, Jakarta Pusat'] },
                        { title: 'Nomor Izin Umroh', desc: ['KMA 123/2024 (contoh)', 'Kementerian Agama RI'] },
                        { title: 'NPWP & NIB', desc: ['NPWP: 01.234.567.8-901.000', 'NIB: 1234567890123'] },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]"
                        >
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">{item.title}</h3>
                            <ul className="mt-2 space-y-1 text-sm text-[var(--ink-700)]">
                                {item.desc.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Dokumen Legalitas</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {['Foto izin umroh (watermark)', 'Foto NIB & NPWP', 'Foto kantor & plang usaha'].map((item) => (
                        <div
                            key={item}
                            className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-[rgba(31, 47, 77,0.4)] bg-[rgba(43, 69, 112,0.12)] text-center text-sm font-semibold text-[var(--emerald-900)]"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Rekening Resmi</h2>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]">
                    <p>Nama rekening: PT Amanah Haramain Travel</p>
                    <p>Bank: BSI / Mandiri Syariah (contoh)</p>
                    <p>No rekening: 1234 5678 90</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Disclaimer Anti Penipuan</h2>
                <div className="mt-4 rounded-2xl border border-[rgba(200,164,96,0.4)] bg-[rgba(200,164,96,0.18)] p-5 text-sm text-[var(--emerald-900)]">
                    Kami hanya melayani transaksi melalui rekening resmi perusahaan dan kontak resmi. Waspada terhadap pihak
                    yang mengatasnamakan Amanah Haramain di luar nomor yang tertera di website.
                </div>
            </section>
        </PublicLayout>
    );
}

