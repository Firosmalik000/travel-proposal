import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    localize,
    usePublicData,
    usePublicPageContent,
} from '@/lib/public-content';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import { Award, CheckCircle, Heart, Shield, Star, Users } from 'lucide-react';

const viewport = { once: false, amount: 0.3 };

const staggerParent: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const slideUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
};

const fallback = {
    id: {
        pageTitle: 'Tentang Kami',
        meta: 'Profil travel, visi misi, dan tim inti.',
        hero: {
            title: 'Tentang Kami',
            desc: 'Mengenal visi, misi, dan tim di balik layanan umroh terpercaya.',
        },
        profile: {
            title: 'Profil & Nilai Perusahaan',
            desc: 'Travel umroh yang fokus pada pelayanan tertata dan nyaman.',
        },
        team: {
            title: 'Tim Inti Kami',
            desc: 'Figur-figur yang mendampingi pelayanan jamaah.',
        },
    },
    en: {
        pageTitle: 'About Us',
        meta: 'Travel profile, vision, mission, and core team.',
        hero: {
            title: 'About Us',
            desc: 'Get to know our vision, mission, and team.',
        },
        profile: {
            title: 'Company Profile & Values',
            desc: 'Umrah travel focused on structured and comfortable service.',
        },
        team: {
            title: 'Our Core Team',
            desc: 'The people behind pilgrim service.',
        },
    },
};

const defaultValues = {
    id: [
        {
            icon: Shield,
            title: 'Amanah & Terpercaya',
            desc: 'Kami beroperasi dengan izin resmi Kemenag dan menjunjung tinggi kepercayaan jamaah sebagai prioritas utama.',
        },
        {
            icon: Heart,
            title: 'Pelayanan dari Hati',
            desc: 'Setiap jamaah diperlakukan seperti keluarga — dengan perhatian penuh dari pendaftaran hingga kepulangan.',
        },
        {
            icon: Award,
            title: 'Kualitas Tanpa Kompromi',
            desc: 'Hotel terbaik, pembimbing berpengalaman, dan fasilitas lengkap untuk ibadah yang khusyuk dan nyaman.',
        },
        {
            icon: Star,
            title: 'Pengalaman 15+ Tahun',
            desc: 'Lebih dari satu dekade melayani jamaah dari seluruh Indonesia dengan rekam jejak yang terbukti.',
        },
    ],
    en: [
        {
            icon: Shield,
            title: 'Trustworthy & Reliable',
            desc: 'We operate with official Ministry of Religious Affairs license and uphold pilgrim trust as our top priority.',
        },
        {
            icon: Heart,
            title: 'Service from the Heart',
            desc: 'Every pilgrim is treated like family — with full attention from registration to return.',
        },
        {
            icon: Award,
            title: 'Uncompromising Quality',
            desc: 'Best hotels, experienced guides, and complete facilities for focused and comfortable worship.',
        },
        {
            icon: Star,
            title: '15+ Years of Experience',
            desc: 'Over a decade serving pilgrims from across Indonesia with a proven track record.',
        },
    ],
};

export default function Tentang() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const page = usePublicPageContent('tentang-kami');
    const t = fallback[locale];
    const teamMembers = Array.isArray(publicData.team) ? publicData.team : [];

    const heroTitle = localize(
        page?.content?.hero?.title,
        locale,
        t.hero.title,
    );
    const heroDesc = localize(
        page?.content?.hero?.description,
        locale,
        t.hero.desc,
    );
    const profileTitle = localize(
        page?.content?.profile?.title,
        locale,
        t.profile.title,
    );
    const profileDesc = localize(
        page?.content?.profile?.description,
        locale,
        t.profile.desc,
    );
    const teamTitle = localize(
        page?.content?.team?.title,
        locale,
        t.team.title,
    );
    const teamDesc = localize(
        page?.content?.team?.description,
        locale,
        t.team.desc,
    );
    const values =
        Array.isArray(page?.content?.values) && page.content.values.length > 0
            ? page.content.values.map((item: Record<string, any>) => ({
                  title: localize(item.title, locale, ''),
                  description: localize(item.description, locale, ''),
              }))
            : defaultValues[locale];

    const stats =
        Array.isArray(page?.content?.stats) && page.content.stats.length > 0
            ? page.content.stats.map((s: Record<string, any>) => ({
                  value: String(s.value ?? ''),
                  label: localize(s.label, locale),
              }))
            : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, t.pageTitle)}>
                <meta
                    name="description"
                    content={localize(page?.excerpt, locale, t.meta)}
                />
            </Head>

            <main className="bg-background">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-foreground py-24 sm:py-28 md:py-36">
                    {/* decorative blobs */}
                    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-primary via-accent to-transparent" />

                    <motion.div
                        className="relative container mx-auto px-4 sm:px-6"
                        initial="initial"
                        animate="animate"
                        variants={{
                            animate: {
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.2,
                                },
                            },
                        }}
                    >
                        <div className="mx-auto max-w-3xl text-center">
                            <motion.div
                                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
                                variants={{
                                    initial: { y: -20, opacity: 0 },
                                    animate: { y: 0, opacity: 1 },
                                }}
                                transition={{ duration: 0.6, ease: 'backOut' }}
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                                <span className="text-sm font-medium text-white">
                                    {locale === 'id'
                                        ? 'Kenali Kami Lebih Dekat'
                                        : 'Get to Know Us'}
                                </span>
                            </motion.div>
                            <motion.h1
                                className="font-heading text-4xl leading-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl"
                                variants={slideUp}
                                transition={{
                                    duration: 0.9,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                            >
                                {heroTitle}
                            </motion.h1>
                            <motion.p
                                className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
                                variants={slideUp}
                                transition={{
                                    duration: 0.7,
                                    ease: [0.25, 1, 0.5, 1],
                                }}
                            >
                                {heroDesc}
                            </motion.p>
                            <motion.div
                                className="mt-8 flex flex-wrap justify-center gap-3"
                                initial="initial"
                                animate="animate"
                                variants={{
                                    animate: {
                                        transition: { staggerChildren: 0.1 },
                                    },
                                }}
                            >
                                <motion.div variants={slideUp}>
                                    <Link
                                        href="/paket-umroh"
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                    >
                                        {locale === 'id'
                                            ? 'Lihat Paket Umroh'
                                            : 'View Packages'}
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                                <motion.div variants={slideUp}>
                                    <Link
                                        href="/kontak"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                                    >
                                        {locale === 'id'
                                            ? 'Hubungi Kami'
                                            : 'Contact Us'}
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Stats bar */}
                        {stats.length > 0 && (
                            <motion.div
                                className="mt-16 grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm md:grid-cols-4"
                                initial="initial"
                                animate="animate"
                                variants={{
                                    animate: {
                                        transition: {
                                            staggerChildren: 0.1,
                                            delayChildren: 0.8,
                                        },
                                    },
                                }}
                            >
                                {stats.map((s) => (
                                    <motion.div
                                        key={s.label}
                                        className="px-6 py-5 text-center"
                                        variants={slideUp}
                                    >
                                        <p className="font-heading text-2xl font-bold text-white sm:text-3xl">
                                            {s.value}
                                        </p>
                                        <p className="mt-1 text-xs text-white/55 sm:text-sm">
                                            {s.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </section>

                {/* ── Profile ── */}
                <section className="profile-section container mx-auto grid items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
                    <motion.div
                        className="profile-text"
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={viewport}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    >
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                            {locale === 'id' ? 'Profil Kami' : 'Our Profile'}
                        </span>
                        <h2 className="font-heading mt-5 text-3xl leading-tight font-extrabold text-foreground sm:text-4xl md:text-5xl">
                            {profileTitle}
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                            {profileDesc}
                        </p>
                        <div className="mt-6 space-y-3">
                            {[
                                locale === 'id'
                                    ? 'Izin resmi Kementerian Agama RI'
                                    : 'Official Ministry of Religious Affairs license',
                                locale === 'id'
                                    ? 'Lebih dari 20.000 jamaah telah berangkat'
                                    : 'More than 20,000 pilgrims have departed',
                                locale === 'id'
                                    ? 'Pembimbing bersertifikat & berpengalaman'
                                    : 'Certified & experienced worship guides',
                                locale === 'id'
                                    ? 'Layanan 24/7 selama perjalanan ibadah'
                                    : '24/7 service throughout the worship journey',
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-sm text-foreground">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <div className="profile-img relative h-72 sm:h-80 md:h-96">
                        <motion.img
                            src={
                                page?.content?.profile?.image_primary ||
                                '/images/dummy.jpg'
                            }
                            alt={profileTitle}
                            className="h-full w-full rounded-3xl object-cover shadow-2xl sm:w-3/4"
                            initial={{ opacity: 0, x: 60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={viewport}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                        <motion.img
                            src={
                                page?.content?.profile?.image_secondary ||
                                '/images/dummy.jpg'
                            }
                            alt={teamTitle}
                            className="absolute right-0 -bottom-6 w-2/3 rounded-2xl border-4 border-background shadow-2xl sm:w-1/2 sm:border-8"
                            initial={{ opacity: 0, scale: 0.8, y: 40 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={viewport}
                            transition={{
                                duration: 0.8,
                                ease: 'backOut',
                                delay: 0.2,
                            }}
                        />
                        <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 shadow-lg shadow-primary/30 sm:right-8">
                            <Users className="h-4 w-4 text-white" />
                            <span className="text-xs font-bold text-white">
                                {locale === 'id'
                                    ? 'Berpengalaman Sejak 2009'
                                    : 'Experienced Since 2009'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="values-section bg-secondary/30 py-20 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-14 text-center">
                            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                                {locale === 'id' ? 'Nilai Kami' : 'Our Values'}
                            </span>
                            <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                                {locale === 'id'
                                    ? 'Apa yang Kami Pegang Teguh'
                                    : 'What We Stand For'}
                            </h2>
                        </div>
                        <motion.div
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                            initial="initial"
                            whileInView="animate"
                            viewport={viewport}
                            variants={staggerParent}
                        >
                            {values.map((value: any, index: number) => {
                                const defaultIcons = [
                                    Shield,
                                    Heart,
                                    Award,
                                    Star,
                                ];
                                const Icon =
                                    value.icon ??
                                    defaultIcons[index % defaultIcons.length];
                                const title = value.icon
                                    ? value.title
                                    : localize(
                                          value.title,
                                          locale,
                                          value.title,
                                      );
                                const desc = value.icon
                                    ? value.desc
                                    : localize(
                                          value.description,
                                          locale,
                                          value.description ?? '',
                                      );
                                return (
                                    <motion.div
                                        key={index}
                                        className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                                        variants={slideUp}
                                        transition={{
                                            duration: 0.7,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 transition-all duration-300 group-hover:scale-150 group-hover:bg-primary/10" />
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-heading text-lg font-bold text-foreground">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {desc}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ── Team ── */}
                {teamMembers.length > 0 && (
                    <section className="team-section py-20 sm:py-24">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="mb-14 text-center">
                                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase">
                                    {locale === 'id' ? 'Tim Kami' : 'Our Team'}
                                </span>
                                <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                                    {teamTitle}
                                </h2>
                                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                                    {teamDesc}
                                </p>
                            </div>
                            <motion.div
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                                initial="initial"
                                whileInView="animate"
                                viewport={viewport}
                                variants={staggerParent}
                            >
                                {teamMembers.map(
                                    (member: Record<string, unknown>) => (
                                        <motion.div
                                            key={String(member.name)}
                                            className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: 'backOut',
                                            }}
                                        >
                                            <div className="relative h-56 overflow-hidden sm:h-64">
                                                <img
                                                    src={String(
                                                        member.image_path ||
                                                            '/images/dummy.jpg',
                                                    )}
                                                    alt={String(member.name)}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-heading text-xl font-bold text-foreground">
                                                    {String(member.name)}
                                                </h3>
                                                <p className="mt-1 text-sm font-medium text-primary">
                                                    {localize(
                                                        member.role,
                                                        locale,
                                                    )}
                                                </p>
                                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                                    {localize(
                                                        member.bio,
                                                        locale,
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ),
                                )}
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* ── CTA ── */}
                <section className="container mx-auto px-4 pb-20 sm:px-6 sm:pb-24">
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-foreground via-foreground to-primary px-8 py-14 text-center text-background shadow-2xl sm:px-12 sm:py-16">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                        <div className="relative">
                            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-background/60 uppercase">
                                {locale === 'id'
                                    ? 'Mulai Perjalanan Anda'
                                    : 'Start Your Journey'}
                            </span>
                            <h2 className="font-heading mt-5 text-3xl font-extrabold sm:text-4xl md:text-5xl">
                                {locale === 'id'
                                    ? 'Siap Berangkat Umroh Bersama Kami?'
                                    : 'Ready to Go on Umrah With Us?'}
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-base text-background/65">
                                {locale === 'id'
                                    ? 'Konsultasikan kebutuhan ibadah Anda dengan tim kami. Gratis, tanpa komitmen.'
                                    : 'Consult your worship needs with our team. Free, no commitment.'}
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/paket-umroh"
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                >
                                    {locale === 'id'
                                        ? 'Lihat Paket Umroh'
                                        : 'View Packages'}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/kontak"
                                    className="inline-flex items-center gap-2 rounded-full border-2 border-background/30 px-7 py-3.5 text-sm font-bold text-background/85 transition-all hover:scale-105 hover:border-background/60 hover:bg-background/10 active:scale-95"
                                >
                                    {locale === 'id'
                                        ? 'Hubungi Kami'
                                        : 'Contact Us'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
