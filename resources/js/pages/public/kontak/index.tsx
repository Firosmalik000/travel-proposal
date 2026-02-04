import { Head } from '@inertiajs/react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Kontak() {
    return (
        <PublicLayout>
            <Head title="Kontak">
                <meta name="description" content="Kontak resmi Amanah Haramain Travel, kantor, dan WhatsApp." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 px-6 py-8 shadow-[0_18px_40px_rgba(31, 47, 77,0.12)]">
                    <span className="inline-flex w-fit items-center rounded-full bg-[rgba(43, 69, 112,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-800)]">
                        Kontak Resmi
                    </span>
                    <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">Kontak Amanah Haramain</h1>
                    <p className="max-w-2xl text-[var(--ink-700)]">
                        Kami siap membantu dari konsultasi paket sampai kebutuhan dokumen. Hubungi kami lewat kanal resmi berikut.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Alamat Kantor</h3>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">Jl. Amanah No. 12, Jakarta Pusat</p>
                            <p className="text-sm text-[var(--ink-700)]">Senin - Sabtu, 08.00 - 20.00 WIB</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                                <span className="rounded-full bg-[rgba(43, 69, 112,0.12)] px-3 py-2">Kantor Resmi</span>
                                <span className="rounded-full bg-[rgba(43, 69, 112,0.12)] px-3 py-2">Jam Layanan</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Kontak Resmi</h3>
                            <div className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
                                <p>WhatsApp: 0812-3456-7890</p>
                                <p>Telepon: (021) 555-1234</p>
                                <p>Email: info@amanahharamain.com</p>
                            </div>
                            <a
                                href="https://wa.me/6281234567890"
                                className="mt-4 inline-flex items-center rounded-full bg-[var(--emerald-700)] px-5 py-3 text-xs font-semibold text-white"
                            >
                                Konsultasi WhatsApp
                            </a>
                        </div>

                        <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Sosial Media</h3>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">Ikuti update promo dan info keberangkatan terbaru.</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <a
                                    className="group flex items-center gap-3 rounded-xl border border-[rgba(31, 47, 77,0.12)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--emerald-900)] transition hover:-translate-y-0.5 hover:border-[rgba(43, 69, 112,0.35)] hover:bg-white"
                                    href="https://instagram.com/amanahharamain"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(43, 69, 112,0.12)] text-[var(--emerald-900)]">
                                        <Instagram className="h-4 w-4" />
                                    </span>
                                    Instagram
                                </a>
                                <a
                                    className="group flex items-center gap-3 rounded-xl border border-[rgba(31, 47, 77,0.12)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--emerald-900)] transition hover:-translate-y-0.5 hover:border-[rgba(43, 69, 112,0.35)] hover:bg-white"
                                    href="https://facebook.com/amanahharamain"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(43, 69, 112,0.12)] text-[var(--emerald-900)]">
                                        <Facebook className="h-4 w-4" />
                                    </span>
                                    Facebook
                                </a>
                                <a
                                    className="group flex items-center gap-3 rounded-xl border border-[rgba(31, 47, 77,0.12)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--emerald-900)] transition hover:-translate-y-0.5 hover:border-[rgba(43, 69, 112,0.35)] hover:bg-white"
                                    href="https://youtube.com/@amanahharamain"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(43, 69, 112,0.12)] text-[var(--emerald-900)]">
                                        <Youtube className="h-4 w-4" />
                                    </span>
                                    YouTube
                                </a>
                                <a
                                    className="group flex items-center gap-3 rounded-xl border border-[rgba(31, 47, 77,0.12)] bg-white/80 px-3 py-2 text-sm font-semibold text-[var(--emerald-900)] transition hover:-translate-y-0.5 hover:border-[rgba(43, 69, 112,0.35)] hover:bg-white"
                                    href="https://x.com/amanahharamain"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(43, 69, 112,0.12)] text-[var(--emerald-900)]">
                                        <Twitter className="h-4 w-4" />
                                    </span>
                                    X (Twitter)
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Lokasi Kantor</h3>
                            <span className="rounded-full bg-[rgba(200,164,96,0.3)] px-3 py-1 text-xs font-semibold text-[var(--emerald-900)]">
                                Maps
                            </span>
                        </div>
                        <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-[rgba(31, 47, 77,0.35)] bg-[rgba(43, 69, 112,0.08)] text-center text-sm font-semibold text-[var(--emerald-900)]">
                            Maps belum ditambahkan
                        </div>
                        <p className="mt-3 text-xs text-[var(--ink-700)]">
                            Lokasi akan ditampilkan setelah data koordinat ditentukan.
                        </p>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
