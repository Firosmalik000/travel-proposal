import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const itinerary = [
    { title: 'Hari 1', desc: 'Kumpul, briefing, dan keberangkatan.' },
    { title: 'Hari 2', desc: 'Tiba, check-in, orientasi area sekitar.' },
    { title: 'Hari 3-5', desc: 'Program ibadah dan ziarah sesuai bimbingan.' },
    { title: 'Hari 6', desc: 'Perjalanan ke kota berikutnya (jika program pindah).' },
    { title: 'Hari 7-9', desc: 'Program ibadah & kegiatan tambahan.' },
    { title: 'Hari 10', desc: 'Kepulangan ke tanah air.' },
];

export default function PaketDetail() {
    return (
        <PublicLayout>
            <Head title="Detail Paket Umroh">
                <meta name="description" content="Detail paket umroh reguler 10 hari lengkap dengan itinerary, fasilitas, dan syarat." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-6">
                <div className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/85 p-8 shadow-[0_30px_70px_rgba(31, 47, 77,0.16)] lg:p-12">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[rgba(43, 69, 112,0.16)] blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[rgba(200,164,96,0.2)] blur-3xl" />
                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-[rgba(200,164,96,0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                                Seat Terbatas
                            </span>
                            <h1 className="public-heading mt-5 text-[clamp(2rem,4vw,3.4rem)] font-semibold text-[var(--emerald-900)]">
                                Paket Umroh Reguler 10 Hari
                                <span className="block text-[clamp(1.6rem,3.2vw,2.4rem)] text-[var(--emerald-700)]">
                                    April 2026
                                </span>
                            </h1>
                            <p className="mt-3 text-2xl font-semibold text-[var(--emerald-800)]">Mulai 34,9 jt / jamaah</p>
                            <div className="mt-3 grid gap-2 text-sm text-[var(--ink-700)]">
                                <p>Keberangkatan: 15 April 2026</p>
                                <p>Dari: Surabaya • Durasi: 10 Hari</p>
                                <p>Status seat: Tersisa 8</p>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href="https://wa.me/6281234567890"
                                    className="inline-flex items-center rounded-full bg-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(31, 47, 77,0.25)]"
                                >
                                    Booking & Konsultasi WhatsApp
                                </a>
                                <button className="rounded-full border border-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-[var(--emerald-900)]">
                                    Unduh Brosur
                                </button>
                            </div>
                        </div>
                        <div className="relative space-y-5">
                            <div className="relative flex items-center justify-center">
                                <div className="parallax-frame h-72 w-72 overflow-hidden rounded-full border-[10px] border-white/80 shadow-[0_24px_60px_rgba(31, 47, 77,0.18)]" data-parallax data-speed="0.36">
                                    <img
                                        src="https://source.unsplash.com/Cg4NDIa4iN0/1200x1200"
                                        alt="Suasana Tanah Suci"
                                        className="parallax-img h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute -bottom-4 right-0 rounded-3xl bg-white/90 px-4 py-3 text-xs text-[var(--ink-700)] shadow-[0_16px_36px_rgba(31, 47, 77,0.18)]">
                                    <p className="font-semibold text-[var(--emerald-900)]">Hotel Strategis</p>
                                    <p>Estimasi jarak jelas</p>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_18px_40px_rgba(31, 47, 77,0.12)]">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-700)]">
                                    Ringkasan Paket
                                </p>
                                <ul className="mt-3 space-y-2">
                                    <li>✔ Tiket PP + bagasi</li>
                                    <li>✔ Visa umroh</li>
                                    <li>✔ Hotel Makkah & Madinah</li>
                                    <li>✔ Makan 3x sehari</li>
                                    <li>✔ Transport bus AC</li>
                                    <li>✔ Pembimbing + tour leader</li>
                                    <li>✔ Manasik + perlengkapan sesuai paket</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                        <h2 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Yang Termasuk</h2>
                        <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
                            <li>✅ Tiket PP, visa, hotel, konsumsi</li>
                            <li>✅ Transport, manasik, pembimbing</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                        <h2 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">Yang Tidak Termasuk</h2>
                        <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
                            <li>❌ Paspor (jika belum punya)</li>
                            <li>❌ Vaksin/keperluan kesehatan</li>
                            <li>❌ Pengeluaran pribadi & oleh-oleh</li>
                            <li>❌ Upgrade kamar (jika memilih)</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Itinerary Perjalanan</h2>
                <div className="mt-4 space-y-3">
                    {itinerary.map((item) => (
                        <details
                            key={item.title}
                            className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]"
                        >
                            <summary className="cursor-pointer text-sm font-semibold text-[var(--emerald-900)]">
                                {item.title}
                            </summary>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">{item.desc}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Hotel & Maskapai</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: 'Makkah',
                            desc: 'Hotel setara bintang 4, estimasi jarak sesuai paket.',
                            image: 'https://source.unsplash.com/thb9M2F4QTs/1200x900',
                        },
                        {
                            title: 'Madinah',
                            desc: 'Hotel setara bintang 4, estimasi jarak sesuai paket.',
                            image: 'https://source.unsplash.com/KtzvN3OJ4Gg/1200x900',
                        },
                        {
                            title: 'Maskapai',
                            desc: 'Maskapai internasional menyesuaikan jadwal.',
                            image: 'https://source.unsplash.com/EIVfsewIHP0/1200x900',
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="group overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_14px_30px_rgba(31, 47, 77,0.12)] transition hover:-translate-y-1 hover:border-[rgba(31,47,77,0.15)] hover:shadow-[0_20px_40px_rgba(31, 47, 77,0.18)]"
                        >
                            <div className="parallax-frame relative h-40 overflow-hidden bg-slate-100" data-parallax data-speed="0.3">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                                <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--emerald-900)] backdrop-blur">
                                    {item.title}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">{item.title}</h3>
                                <p className="mt-2 text-sm text-[var(--ink-700)]">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Fasilitas & Layanan</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {[
                        'Makan & transport bus AC',
                        'Pembimbing dan muthawif berpengalaman',
                        'Manasik sebelum keberangkatan',
                        'Perlengkapan standar sesuai paket',
                    ].map((item, idx) => (
                        <div
                            key={item}
                            className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(43, 69, 112,0.12)] text-sm font-semibold text-[var(--emerald-900)]">
                                F{idx + 1}
                            </div>
                            <p className="text-sm text-[var(--ink-700)]">{item}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#0f1a2b] py-14">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="space-y-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(200,164,96,0.9)]">
                            Experience
                        </span>
                        <h2 className="public-heading text-3xl font-semibold text-white sm:text-4xl">
                            Layanan premium dengan suasana perjalanan yang tertata.
                        </h2>
                        <p className="text-sm text-white/70">
                            Paket reguler menghadirkan keseimbangan antara kenyamanan hotel, bimbingan ibadah, dan jadwal yang
                            realistis untuk jamaah.
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
                            <span className="rounded-full border border-white/20 px-4 py-2">Pembimbing tetap</span>
                            <span className="rounded-full border border-white/20 px-4 py-2">Handling profesional</span>
                            <span className="rounded-full border border-white/20 px-4 py-2">Hotel strategis</span>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            { title: 'Hotel Makkah', image: 'https://source.unsplash.com/thb9M2F4QTs/900x900' },
                            { title: 'Hotel Madinah', image: 'https://source.unsplash.com/KtzvN3OJ4Gg/900x900' },
                            { title: 'Maskapai', image: 'https://source.unsplash.com/EIVfsewIHP0/900x900' },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="group relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-white/5 parallax-frame transition hover:-translate-y-1 hover:border-white/20"
                                data-parallax
                                data-speed="0.32"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                                <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Syarat & Dokumen</h2>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]">
                    <ul className="space-y-2">
                        <li>Paspor (masa berlaku minimal 8 bulan)</li>
                        <li>Foto 4x6 latar putih</li>
                        <li>KTP & KK</li>
                        <li>Buku nikah (bagi pasangan)</li>
                        <li>Sertifikat vaksin (jika disyaratkan)</li>
                    </ul>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Skema Pembayaran</h2>
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]">
                    <p>DP untuk booking seat: Rp X</p>
                    <p>Pelunasan: maksimal H-30 atau sesuai paket</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Kebijakan Perubahan</h2>
                <div className="rounded-2xl border border-[rgba(200,164,96,0.4)] bg-[rgba(200,164,96,0.18)] p-5 text-sm text-[var(--emerald-900)]">
                    Perubahan mengikuti ketentuan maskapai, hotel, dan vendor. Tim kami bantu proses sesuai prosedur yang berlaku.
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12">
                <div className="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 px-6 py-8 shadow-[0_20px_40px_rgba(31, 47, 77,0.12)] md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">
                            Siap berangkat umroh dengan tenang?
                        </h2>
                        <p className="mt-2 text-[var(--ink-700)]">
                            Klik WhatsApp, kami kirim brosur + rincian fasilitas paket ini.
                        </p>
                    </div>
                    <a
                        href="https://wa.me/6281234567890"
                        className="rounded-full bg-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-white"
                    >
                        WhatsApp Sekarang
                    </a>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <h2 className="public-heading text-2xl font-semibold text-[var(--emerald-900)]">Form Minat</h2>
                <form className="mt-4 grid gap-4 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_12px_30px_rgba(31, 47, 77,0.12)] md:grid-cols-3">
                    <input className="rounded-xl border border-[rgba(31, 47, 77,0.2)] px-3 py-2 text-sm" placeholder="Nama lengkap" />
                    <input className="rounded-xl border border-[rgba(31, 47, 77,0.2)] px-3 py-2 text-sm" placeholder="Kota domisili" />
                    <input className="rounded-xl border border-[rgba(31, 47, 77,0.2)] px-3 py-2 text-sm" placeholder="Tanggal minat" />
                    <div className="md:col-span-3">
                        <button className="rounded-full bg-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-white" type="submit">
                            Kirim Minat
                        </button>
                    </div>
                </form>
            </section>
        </PublicLayout>
    );
}

