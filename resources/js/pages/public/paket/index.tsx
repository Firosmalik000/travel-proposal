import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Paket Umroh 2026',
        description: 'Pilih paket umroh sesuai bulan, kota keberangkatan, durasi, dan preferensi hotel.',
        filters: {
            month: 'Bulan Keberangkatan',
            city: 'Kota Keberangkatan',
            duration: 'Durasi',
            budget: 'Budget',
            hotel: 'Tipe Hotel',
            airline: 'Maskapai',
            budgetPlaceholder: 'Contoh: 30 - 45 jt',
            months: ['Maret 2026', 'April 2026', 'Mei 2026'],
            cities: ['Jakarta', 'Surabaya', 'Makassar'],
            durations: ['9 Hari', '10 Hari', '12 Hari'],
            hotels: ['Hemat', 'Reguler', 'Premium'],
            airlines: ['Garuda Indonesia', 'Saudia', 'Menyesuaikan jadwal'],
        },
        cards: {
            detail: 'Detail Paket',
            ask: 'Tanya Seat',
        },
        note: 'Harga dapat berbeda sesuai tipe kamar (quad, triple, double).',
        packages: [
            {
                title: 'Umroh Hemat 9 Hari',
                price: 'Start 29,9 jt',
                date: '10 Maret 2026',
                city: 'Jakarta',
                hotel: 'Setara bintang 3',
                notes: 'Itinerary jelas | Manasik terjadwal',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umroh Reguler 10 Hari',
                price: 'Start 34,9 jt',
                date: '15 April 2026',
                city: 'Surabaya',
                hotel: 'Setara bintang 4',
                notes: 'Pembimbing berpengalaman',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umroh Premium 12 Hari',
                price: 'Start 44,9 jt',
                date: '05 Mei 2026',
                city: 'Jakarta',
                hotel: 'Hotel dekat',
                notes: 'Fasilitas lengkap | Seat lebih banyak',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umroh Plus City Tour',
                price: 'Start 39,9 jt',
                date: '20 Mei 2026',
                city: 'Jakarta',
                hotel: 'Setara bintang 4',
                notes: 'City tour singkat | Kuliner khas',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umroh Family 10 Hari',
                price: 'Start 36,9 jt',
                date: '02 Juni 2026',
                city: 'Surabaya',
                hotel: 'Hotel strategis',
                notes: 'Pendampingan keluarga | Seat terbatas',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umroh Premium 12 Hari',
                price: 'Start 44,9 jt',
                date: '15 Juni 2026',
                city: 'Jakarta',
                hotel: 'Hotel dekat Masjid',
                notes: 'Fasilitas lengkap | Lounge bandara',
                image: '/images/dummy.jpg',
            },
        ],
    },
    en: {
        title: 'Umrah Packages 2026',
        description: 'Choose packages by departure month, city, duration, and hotel preference.',
        filters: {
            month: 'Departure Month',
            city: 'Departure City',
            duration: 'Duration',
            budget: 'Budget',
            hotel: 'Hotel Type',
            airline: 'Airline',
            budgetPlaceholder: 'Example: 30 - 45 M',
            months: ['March 2026', 'April 2026', 'May 2026'],
            cities: ['Jakarta', 'Surabaya', 'Makassar'],
            durations: ['9 Days', '10 Days', '12 Days'],
            hotels: ['Economy', 'Regular', 'Premium'],
            airlines: ['Garuda Indonesia', 'Saudia', 'Adjust to schedule'],
        },
        cards: {
            detail: 'Package Details',
            ask: 'Check Availability',
        },
        note: 'Prices may vary depending on room type (quad, triple, double).',
        packages: [
            {
                title: 'Economy Umrah 9 Days',
                price: 'From 29.9 M',
                date: '10 March 2026',
                city: 'Jakarta',
                hotel: '3-star equivalent',
                notes: 'Clear itinerary | Scheduled manasik',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Regular Umrah 10 Days',
                price: 'From 34.9 M',
                date: '15 April 2026',
                city: 'Surabaya',
                hotel: '4-star equivalent',
                notes: 'Experienced mentors',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Premium Umrah 12 Days',
                price: 'From 44.9 M',
                date: '05 May 2026',
                city: 'Jakarta',
                hotel: 'Close to the mosque',
                notes: 'Full facilities | More seats',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Umrah + City Tour',
                price: 'From 39.9 M',
                date: '20 May 2026',
                city: 'Jakarta',
                hotel: '4-star equivalent',
                notes: 'Short city tour | Local cuisine',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Family Umrah 10 Days',
                price: 'From 36.9 M',
                date: '02 June 2026',
                city: 'Surabaya',
                hotel: 'Strategic hotel',
                notes: 'Family assistance | Limited seats',
                image: '/images/dummy.jpg',
            },
            {
                title: 'Premium Umrah 12 Days',
                price: 'From 44.9 M',
                date: '15 June 2026',
                city: 'Jakarta',
                hotel: 'Near the mosque',
                notes: 'Full facilities | Airport lounge',
                image: '/images/dummy.jpg',
            },
        ],
    },
};

export default function Paket() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.description} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-8 pt-6">
                <div className="rounded-[32px] border border-border bg-card/90 px-5 py-7 shadow-lg sm:rounded-[36px] sm:px-6 sm:py-8">
                    <h1 className="public-heading text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {t.description}
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-14">
                <div className="grid gap-4 rounded-3xl border border-border bg-card/90 p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.month}
                        <select className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                            {t.filters.months.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.city}
                        <select className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                            {t.filters.cities.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.duration}
                        <select className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                            {t.filters.durations.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.budget}
                        <input className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder={t.filters.budgetPlaceholder} />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.hotel}
                        <select className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                            {t.filters.hotels.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t.filters.airline}
                        <select className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                            {t.filters.airlines.map((item) => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {t.packages.map((item) => (
                        <div
                            key={item.title + item.date}
                            className="group overflow-hidden rounded-2xl border border-border bg-card/95 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div
                                className="parallax-frame relative h-40 overflow-hidden bg-muted/40 sm:h-44"
                                data-parallax
                                data-speed="0.26"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                                <span className="absolute bottom-3 left-3 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
                                    {item.city}
                                </span>
                            </div>
                            <div className="p-5 sm:p-6">
                                <h3 className="public-heading text-lg font-semibold text-foreground">{item.title}</h3>
                                <p className="mt-2 text-2xl font-semibold text-primary">{item.price}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {item.date} • {item.city}
                                </p>
                                <p className="text-sm text-muted-foreground">{item.hotel}</p>
                                <p className="text-sm text-muted-foreground">{item.notes}</p>
                                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                    <Link
                                        href="/paket-umroh/detail"
                                        className="inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted sm:w-auto"
                                    >
                                        {t.cards.detail}
                                    </Link>
                                    <a
                                        href="https://wa.me/6281234567890"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground sm:w-auto"
                                    >
                                        {t.cards.ask}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                    {t.note}
                </p>
            </section>

            <a
                href="https://wa.me/6281234567890"
                className="fixed bottom-6 right-6 z-50 inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg md:hidden"
            >
                WhatsApp
            </a>
        </PublicLayout>
    );
}
