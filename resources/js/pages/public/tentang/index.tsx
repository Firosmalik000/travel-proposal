import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        pageTitle: 'Tentang Kami',
        meta: 'Profil Amanah Haramain Travel, visi misi, tim inti, dan jejak pelayanan jamaah.',
        hero: {
            title: 'Tentang Amanah Haramain',
            desc: 'Mengenal lebih dekat visi, misi, dan tim di balik layanan umroh terpercaya pilihan Anda.',
        },
        profile: {
            title: 'Profil & Nilai Perusahaan',
            desc: 'Berdiri sejak tahun 2015, Amanah Haramain Travel fokus pada penyelenggaraan perjalanan umroh yang tertib, nyaman, dan sesuai tuntunan. Dari konsultasi awal sampai kepulangan, setiap jamaah dibimbing oleh tim berpengalaman dengan sistem pelayanan yang rapi, transparan, dan mudah dipahami.',
            values: [
                {
                    title: 'Visi Kami',
                    description: 'Menjadi perusahaan travel umroh terpercaya di Indonesia yang dikenal karena pelayanannya yang menenangkan, amanah, dan profesional.',
                },
                {
                    title: 'Misi Kami',
                    description: 'Memberikan bimbingan ibadah yang sesuai sunnah, menyediakan fasilitas yang transparan dan berkualitas, serta melakukan pendampingan total dari awal hingga akhir.',
                },
            ],
        },
        team: {
            title: 'Tim Inti Kami',
            desc: 'Figur-figur profesional dan amanah yang menjadi tulang punggung pelayanan kami.',
            members: [
                {
                    name: 'Direktur Operasional',
                    role: '15+ tahun pengalaman handling jamaah.',
                    image: '/images/dummy.jpg',
                },
                {
                    name: 'Pembimbing Ibadah',
                    role: 'Ustadz bersertifikat dengan bimbingan yang lembut dan mendalam.',
                    image: '/images/dummy.jpg',
                },
                {
                    name: 'Customer Care',
                    role: 'Admin responsif dan siap membantu semua proses administrasi Anda.',
                    image: '/images/dummy.jpg',
                },
            ],
        },
        images: {
            altOne: 'Team discussing',
            altTwo: 'Madinah city view',
        },
    },
    en: {
        pageTitle: 'About Us',
        meta: 'Amanah Haramain Travel profile, vision, mission, core team, and service track record.',
        hero: {
            title: 'About Amanah Haramain',
            desc: 'Get to know our vision, mission, and the team behind a trusted umrah service.',
        },
        profile: {
            title: 'Company Profile & Values',
            desc: 'Established in 2015, Amanah Haramain Travel focuses on organized and comfortable umrah journeys. From the first consultation to return, every pilgrim is guided by an experienced team with transparent and structured service.',
            values: [
                {
                    title: 'Our Vision',
                    description: 'To be the most trusted umrah travel company in Indonesia, known for calm, honest, and professional service.',
                },
                {
                    title: 'Our Mission',
                    description: 'Provide worship guidance based on the sunnah, transparent facilities, and end-to-end assistance for every pilgrim.',
                },
            ],
        },
        team: {
            title: 'Our Core Team',
            desc: 'Professional and trustworthy people who support our service every day.',
            members: [
                {
                    name: 'Operations Director',
                    role: '15+ years of experience handling pilgrims.',
                    image: '/images/dummy.jpg',
                },
                {
                    name: 'Worship Guide',
                    role: 'Certified ustadz with warm and in-depth guidance.',
                    image: '/images/dummy.jpg',
                },
                {
                    name: 'Customer Care',
                    role: 'Responsive admin ready to help with all administration.',
                    image: '/images/dummy.jpg',
                },
            ],
        },
        images: {
            altOne: 'Team discussing',
            altTwo: 'Madinah city view',
        },
    },
};

export default function Tentang() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.pageTitle}>
                <meta name="description" content={t.meta} />
            </Head>

            <main className="bg-background">
                {/* Hero Section */}
                <section className="bg-slate-800 py-14 text-white sm:py-20 md:py-32">
                    <div className="container mx-auto px-4 text-center sm:px-6">
                        <h1 className="font-heading text-3xl font-bold sm:text-4xl md:text-6xl">{t.hero.title}</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                            {t.hero.desc}
                        </p>
                    </div>
                </section>

                {/* Main Content Section */}
                <section className="container mx-auto grid items-start gap-12 px-4 py-16 sm:px-6 sm:py-20 md:gap-16 md:py-24 lg:grid-cols-2">
                    <div>
                        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{t.profile.title}</h2>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                            {t.profile.desc}
                        </p>
                        <div className="mt-10 space-y-8">
                            {t.profile.values.map((value) => (
                                <div key={value.title}>
                                    <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">{value.title}</h3>
                                    <p className="mt-2 text-muted-foreground leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="col-span-1 sm:pt-12">
                            <img src="/images/dummy.jpg" alt={t.images.altOne} className="h-auto w-full rounded-2xl object-cover shadow-lg" />
                        </div>
                        <div className="col-span-1">
                            <img src="/images/dummy.jpg" alt={t.images.altTwo} className="h-auto w-full rounded-2xl object-cover shadow-lg" />
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="bg-muted/40 py-16 sm:py-20 md:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{t.team.title}</h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{t.team.desc}</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {t.team.members.map((member) => (
                                <div key={member.name} className="rounded-2xl bg-card p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-xl">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
                                    />
                                    <h3 className="font-heading text-xl font-bold text-foreground">{member.name}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
