import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        pageTitle: 'Detail Paket Umroh',
        meta: 'Detail paket umroh reguler 10 hari lengkap dengan itinerary, fasilitas, dan syarat.',
        badge: 'Seat Terbatas',
        title: 'Paket Umroh Reguler 10 Hari',
        period: 'April 2026',
        price: 'Mulai 34,9 jt / jamaah',
        info: {
            departure: 'Keberangkatan: 15 April 2026',
            detail: 'Dari: Surabaya • Durasi: 10 Hari',
            seat: 'Status seat: Tersisa 8',
        },
        ctas: {
            book: 'Booking & Konsultasi WhatsApp',
            brochure: 'Unduh Brosur',
        },
        highlight: {
            title: 'Hotel Strategis',
            desc: 'Estimasi jarak jelas',
        },
        summary: {
            title: 'Ringkasan Paket',
            items: [
                'Tiket PP + bagasi',
                'Visa umroh',
                'Hotel Makkah & Madinah',
                'Makan 3x sehari',
                'Transport bus AC',
                'Pembimbing + tour leader',
                'Manasik + perlengkapan sesuai paket',
            ],
        },
        included: {
            title: 'Yang Termasuk',
            items: ['Tiket PP, visa, hotel, konsumsi', 'Transport, manasik, pembimbing'],
        },
        excluded: {
            title: 'Yang Tidak Termasuk',
            items: ['Paspor (jika belum punya)', 'Vaksin/keperluan kesehatan', 'Pengeluaran pribadi & oleh-oleh', 'Upgrade kamar (jika memilih)'],
        },
        itinerary: {
            title: 'Itinerary Perjalanan',
            items: [
                { title: 'Hari 1', desc: 'Kumpul, briefing, dan keberangkatan.' },
                { title: 'Hari 2', desc: 'Tiba, check-in, orientasi area sekitar.' },
                { title: 'Hari 3-5', desc: 'Program ibadah dan ziarah sesuai bimbingan.' },
                { title: 'Hari 6', desc: 'Perjalanan ke kota berikutnya (jika program pindah).' },
                { title: 'Hari 7-9', desc: 'Program ibadah & kegiatan tambahan.' },
                { title: 'Hari 10', desc: 'Kepulangan ke tanah air.' },
            ],
        },
        hotels: {
            title: 'Hotel & Maskapai',
            items: [
                { title: 'Makkah', desc: 'Hotel setara bintang 4, estimasi jarak sesuai paket.' },
                { title: 'Madinah', desc: 'Hotel setara bintang 4, estimasi jarak sesuai paket.' },
                { title: 'Maskapai', desc: 'Maskapai internasional menyesuaikan jadwal.' },
            ],
        },
        facilities: {
            title: 'Fasilitas & Layanan',
            items: [
                'Makan & transport bus AC',
                'Pembimbing dan muthawif berpengalaman',
                'Manasik sebelum keberangkatan',
                'Perlengkapan standar sesuai paket',
            ],
        },
        experience: {
            badge: 'Experience',
            title: 'Layanan premium dengan suasana perjalanan yang tertata.',
            desc: 'Paket reguler menghadirkan keseimbangan antara kenyamanan hotel, bimbingan ibadah, dan jadwal yang realistis untuk jamaah.',
            tags: ['Pembimbing tetap', 'Handling profesional', 'Hotel strategis'],
        },
        requirements: {
            title: 'Syarat & Dokumen',
            items: [
                'Paspor (masa berlaku minimal 8 bulan)',
                'Foto 4x6 latar putih',
                'KTP & KK',
                'Buku nikah (bagi pasangan)',
                'Sertifikat vaksin (jika disyaratkan)',
            ],
        },
        payment: {
            title: 'Skema Pembayaran',
            lines: ['DP untuk booking seat: Rp X', 'Pelunasan: maksimal H-30 atau sesuai paket'],
        },
        policy: {
            title: 'Kebijakan Perubahan',
            text: 'Perubahan mengikuti ketentuan maskapai, hotel, dan vendor. Tim kami bantu proses sesuai prosedur yang berlaku.',
        },
        ctaBlock: {
            title: 'Siap berangkat umroh dengan tenang?',
            desc: 'Klik WhatsApp, kami kirim brosur + rincian fasilitas paket ini.',
            button: 'WhatsApp Sekarang',
        },
        interest: {
            title: 'Form Minat',
            placeholders: ['Nama lengkap', 'Kota domisili', 'Tanggal minat'],
            button: 'Kirim Minat',
        },
    },
    en: {
        pageTitle: 'Umrah Package Details',
        meta: 'Details for the regular 10-day umrah package including itinerary, facilities, and requirements.',
        badge: 'Limited Seats',
        title: 'Regular Umrah Package 10 Days',
        period: 'April 2026',
        price: 'From 34.9 M / pilgrim',
        info: {
            departure: 'Departure: 15 April 2026',
            detail: 'From: Surabaya • Duration: 10 Days',
            seat: 'Seat status: 8 left',
        },
        ctas: {
            book: 'Book & WhatsApp Consultation',
            brochure: 'Download Brochure',
        },
        highlight: {
            title: 'Strategic Hotel',
            desc: 'Clear distance estimate',
        },
        summary: {
            title: 'Package Summary',
            items: [
                'Return tickets + baggage',
                'Umrah visa',
                'Makkah & Madinah hotels',
                '3 meals per day',
                'AC bus transportation',
                'Guides + tour leader',
                'Manasik + standard kits',
            ],
        },
        included: {
            title: 'Included',
            items: ['Return tickets, visa, hotel, meals', 'Transport, manasik, guides'],
        },
        excluded: {
            title: 'Not Included',
            items: ['Passport (if not yet)', 'Vaccines/health requirements', 'Personal expenses & souvenirs', 'Room upgrade (if chosen)'],
        },
        itinerary: {
            title: 'Itinerary',
            items: [
                { title: 'Day 1', desc: 'Gathering, briefing, and departure.' },
                { title: 'Day 2', desc: 'Arrival, check-in, orientation around the area.' },
                { title: 'Day 3-5', desc: 'Worship and visits with guidance.' },
                { title: 'Day 6', desc: 'Travel to the next city (if applicable).' },
                { title: 'Day 7-9', desc: 'Worship program & additional activities.' },
                { title: 'Day 10', desc: 'Return home.' },
            ],
        },
        hotels: {
            title: 'Hotels & Airline',
            items: [
                { title: 'Makkah', desc: '4-star equivalent hotel, distance per package.' },
                { title: 'Madinah', desc: '4-star equivalent hotel, distance per package.' },
                { title: 'Airline', desc: 'International airline adjusted to schedule.' },
            ],
        },
        facilities: {
            title: 'Facilities & Services',
            items: [
                'Meals & AC bus transport',
                'Experienced guides and muthawif',
                'Pre-departure manasik',
                'Standard kits per package',
            ],
        },
        experience: {
            badge: 'Experience',
            title: 'Premium service with a structured journey.',
            desc: 'The regular package balances hotel comfort, worship guidance, and a realistic schedule.',
            tags: ['Dedicated guide', 'Professional handling', 'Strategic hotels'],
        },
        requirements: {
            title: 'Requirements & Documents',
            items: [
                'Passport (valid for at least 8 months)',
                '4x6 photo with white background',
                'ID card & family card',
                'Marriage book (for couples)',
                'Vaccine certificate (if required)',
            ],
        },
        payment: {
            title: 'Payment Terms',
            lines: ['Down payment for seat booking: Rp X', 'Final payment: max H-30 or per package'],
        },
        policy: {
            title: 'Change Policy',
            text: 'Changes follow airline, hotel, and vendor policies. We assist through the official procedure.',
        },
        ctaBlock: {
            title: 'Ready for a calm umrah journey?',
            desc: 'Tap WhatsApp, we will send the brochure and full facilities.',
            button: 'WhatsApp Now',
        },
        interest: {
            title: 'Interest Form',
            placeholders: ['Full name', 'City', 'Preferred date'],
            button: 'Submit Interest',
        },
    },
};

export default function PaketDetail() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.pageTitle}>
                <meta name="description" content={t.meta} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 pt-6 sm:pb-12">
                <div className="relative overflow-hidden rounded-[32px] border border-border bg-card/90 p-6 shadow-lg sm:p-8 lg:rounded-[40px] lg:p-12">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-accent/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                                {t.badge}
                            </span>
                            <h1 className="public-heading mt-5 text-[clamp(2rem,4vw,3.4rem)] font-semibold text-foreground">
                                {t.title}
                                <span className="block text-[clamp(1.6rem,3.2vw,2.4rem)] text-primary">
                                    {t.period}
                                </span>
                            </h1>
                            <p className="mt-3 text-2xl font-semibold text-primary">{t.price}</p>
                            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                <p>{t.info.departure}</p>
                                <p>{t.info.detail}</p>
                                <p>{t.info.seat}</p>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href="https://wa.me/6281234567890"
                                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg sm:w-auto"
                                >
                                    {t.ctas.book}
                                </a>
                                <button className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted sm:w-auto">
                                    {t.ctas.brochure}
                                </button>
                            </div>
                        </div>
                        <div className="relative space-y-5">
                            <div className="relative flex items-center justify-center">
                                <div className="parallax-frame h-56 w-56 overflow-hidden rounded-full border-[10px] border-border shadow-lg sm:h-64 sm:w-64 lg:h-72 lg:w-72" data-parallax data-speed="0.36">
                                    <img
                                        src="/images/dummy.jpg"
                                        alt="Suasana Tanah Suci"
                                        className="parallax-img h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-3 rounded-3xl bg-card/90 px-4 py-3 text-xs text-muted-foreground shadow-lg sm:absolute sm:-bottom-4 sm:right-0 sm:mt-0">
                                    <p className="font-semibold text-foreground">{t.highlight.title}</p>
                                    <p>{t.highlight.desc}</p>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    {t.summary.title}
                                </p>
                                <ul className="mt-3 space-y-2">
                                    {t.summary.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                        <h2 className="public-heading text-lg font-semibold text-foreground">{t.included.title}</h2>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {t.included.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-sm">
                        <h2 className="public-heading text-lg font-semibold text-foreground">{t.excluded.title}</h2>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            {t.excluded.items.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.itinerary.title}</h2>
                <div className="mt-4 space-y-3">
                    {t.itinerary.items.map((item) => (
                        <details
                            key={item.title}
                            className="rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm"
                        >
                            <summary className="cursor-pointer text-sm font-semibold text-foreground">
                                {item.title}
                            </summary>
                            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.hotels.title}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {t.hotels.items.map((item) => (
                        <div
                            key={item.title}
                            className="group overflow-hidden rounded-2xl border border-border bg-card/95 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="parallax-frame relative h-40 overflow-hidden bg-muted/40" data-parallax data-speed="0.3">
                                <img
                                    src="/images/dummy.jpg"
                                    alt={item.title}
                                    className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                                <span className="absolute bottom-3 left-3 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                                    {item.title}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="public-heading text-lg font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.facilities.title}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {t.facilities.items.map((item, idx) => (
                        <div
                            key={item}
                            className="flex items-start gap-4 rounded-2xl border border-border bg-card/90 px-5 py-4 shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                                F{idx + 1}
                            </div>
                            <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-foreground py-10 text-background sm:py-14">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="space-y-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-background/70">
                            {t.experience.badge}
                        </span>
                        <h2 className="public-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
                            {t.experience.title}
                        </h2>
                        <p className="text-sm text-background/70">
                            {t.experience.desc}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-background/70">
                            {t.experience.tags.map((item) => (
                                <span key={item} className="rounded-full border border-background/20 px-4 py-2">{item}</span>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: 'Hotel Makkah', image: '/images/dummy.jpg' },
                            { title: 'Hotel Madinah', image: '/images/dummy.jpg' },
                            { title: 'Maskapai', image: '/images/dummy.jpg' },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="group relative h-32 overflow-hidden rounded-2xl border border-background/10 bg-background/10 parallax-frame transition hover:-translate-y-1 hover:border-background/20 sm:h-36 md:h-40"
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
                                <span className="absolute bottom-3 left-3 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.requirements.title}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    <ul className="space-y-2">
                        {t.requirements.items.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.payment.title}</h2>
                <div className="mt-4 rounded-2xl border border-border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
                    {t.payment.lines.map((line) => (
                        <p key={line}>{line}</p>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.policy.title}</h2>
                <div className="rounded-2xl border border-border bg-accent/30 p-5 text-sm text-foreground">
                    {t.policy.text}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 sm:pb-12">
                <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card/80 px-6 py-8 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h2 className="public-heading text-2xl font-semibold text-foreground">
                            {t.ctaBlock.title}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {t.ctaBlock.desc}
                        </p>
                    </div>
                    <a
                        href="https://wa.me/6281234567890"
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:w-auto"
                    >
                        {t.ctaBlock.button}
                    </a>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <h2 className="public-heading text-xl font-semibold text-foreground sm:text-2xl">{t.interest.title}</h2>
                <form className="mt-4 grid gap-3 rounded-2xl border border-border bg-card/90 p-5 shadow-sm sm:gap-4 sm:p-6 md:grid-cols-3">
                    <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder={t.interest.placeholders[0]} />
                    <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder={t.interest.placeholders[1]} />
                    <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder={t.interest.placeholders[2]} />
                    <div className="md:col-span-3">
                        <button className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:w-auto" type="submit">
                            {t.interest.button}
                        </button>
                    </div>
                </form>
            </section>
        </PublicLayout>
    );
}
