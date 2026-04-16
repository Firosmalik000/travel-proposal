import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';
import { localize, usePublicData, usePublicPageContent } from '@/lib/public-content';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Award, CheckCircle, Heart, Shield, Star, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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
        { icon: Shield, title: 'Amanah & Terpercaya', desc: 'Kami beroperasi dengan izin resmi Kemenag dan menjunjung tinggi kepercayaan jamaah sebagai prioritas utama.' },
        { icon: Heart, title: 'Pelayanan dari Hati', desc: 'Setiap jamaah diperlakukan seperti keluarga — dengan perhatian penuh dari pendaftaran hingga kepulangan.' },
        { icon: Award, title: 'Kualitas Tanpa Kompromi', desc: 'Hotel terbaik, pembimbing berpengalaman, dan fasilitas lengkap untuk ibadah yang khusyuk dan nyaman.' },
        { icon: Star, title: 'Pengalaman 15+ Tahun', desc: 'Lebih dari satu dekade melayani jamaah dari seluruh Indonesia dengan rekam jejak yang terbukti.' },
    ],
    en: [
        { icon: Shield, title: 'Trustworthy & Reliable', desc: 'We operate with official Ministry of Religious Affairs license and uphold pilgrim trust as our top priority.' },
        { icon: Heart, title: 'Service from the Heart', desc: 'Every pilgrim is treated like family — with full attention from registration to return.' },
        { icon: Award, title: 'Uncompromising Quality', desc: 'Best hotels, experienced guides, and complete facilities for focused and comfortable worship.' },
        { icon: Star, title: '15+ Years of Experience', desc: 'Over a decade serving pilgrims from across Indonesia with a proven track record.' },
    ],
};

export default function Tentang() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const page = usePublicPageContent('tentang-kami');
    const t = fallback[locale];
    const mainRef = useRef<HTMLDivElement>(null);
    const teamMembers = Array.isArray(publicData.team) ? publicData.team : [];
    const values = Array.isArray(page?.content?.values) && page.content.values.length > 0
        ? page.content.values
        : defaultValues[locale];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero stagger
            gsap.from('.about-hero-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'back.out(1.7)', delay: 0.2 });
            gsap.from('.about-hero-title', { opacity: 0, y: 50, duration: 0.9, ease: 'power4.out', delay: 0.4 });
            gsap.from('.about-hero-desc', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', delay: 0.65 });
            gsap.from('.about-hero-cta', { opacity: 0, y: 20, stagger: 0.15, duration: 0.6, ease: 'power3.out', delay: 0.8 });
            gsap.from('.about-hero-stat', { opacity: 0, y: 30, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.9 });

            // Profile section
            gsap.from('.profile-text', {
                scrollTrigger: { trigger: '.profile-section', start: 'top 80%' },
                opacity: 0, x: -60, duration: 0.9, ease: 'power3.out',
            });
            gsap.from('.profile-img', {
                scrollTrigger: { trigger: '.profile-section', start: 'top 80%' },
                opacity: 0, x: 60, duration: 0.9, ease: 'power3.out',
            });

            // Values cards stagger
            gsap.from('.value-card', {
                scrollTrigger: { trigger: '.values-section', start: 'top 85%', toggleActions: 'play none none none' },
                opacity: 0, y: 50, stagger: 0.12, duration: 0.7, ease: 'power3.out',
                immediateRender: false,
            });

            // Team cards stagger
            gsap.from('.team-card', {
                scrollTrigger: { trigger: '.team-section', start: 'top 85%', toggleActions: 'play none none none' },
                opacity: 0, scale: 0.9, stagger: 0.1, duration: 0.6, ease: 'back.out(1.2)',
                immediateRender: false,
            });
        }, mainRef);
        return () => ctx.revert();
    }, []);

    const heroTitle = localize(page?.content?.hero?.title, locale, t.hero.title);
    const heroDesc = localize(page?.content?.hero?.description, locale, t.hero.desc);
    const profileTitle = localize(page?.content?.profile?.title, locale, t.profile.title);
    const profileDesc = localize(page?.content?.profile?.description, locale, t.profile.desc);
    const teamTitle = localize(page?.content?.team?.title, locale, t.team.title);
    const teamDesc = localize(page?.content?.team?.description, locale, t.team.desc);

    const stats = Array.isArray(page?.content?.stats) && page.content.stats.length > 0
        ? page.content.stats.map((s: Record<string, any>) => ({
            value: String(s.value ?? ''),
            label: localize(s.label, locale),
        }))
        : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, t.pageTitle)}>
                <meta name="description" content={localize(page?.excerpt, locale, t.meta)} />
            </Head>

            <main ref={mainRef} className="bg-background">
                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-foreground py-24 sm:py-28 md:py-36">
                    {/* decorative blobs */}
                    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-primary via-accent to-transparent" />

                    <div className="relative container mx-auto px-4 sm:px-6">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="about-hero-badge mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-sm font-medium text-white">
                                    {locale === 'id' ? 'Kenali Kami Lebih Dekat' : 'Get to Know Us'}
                                </span>
                            </div>
                            <h1 className="about-hero-title font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                                {heroTitle}
                            </h1>
                            <p className="about-hero-desc mx-auto mt-5 max-w-xl text-base text-white/65 sm:text-lg leading-relaxed">
                                {heroDesc}
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link href="/paket-umroh" className="about-hero-cta inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Lihat Paket Umroh' : 'View Packages'}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                                <Link href="/kontak" className="about-hero-cta inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Hubungi Kami' : 'Contact Us'}
                                </Link>
                            </div>
                        </div>

                        {/* Stats bar */}
                        {stats.length > 0 && (
                        <div className="mt-16 grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm md:grid-cols-4">
                            {stats.map((s) => (
                                <div key={s.label} className="about-hero-stat px-6 py-5 text-center">
                                    <p className="font-heading text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                                    <p className="mt-1 text-xs text-white/55 sm:text-sm">{s.label}</p>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </section>

                {/* ── Profile ── */}
                <section className="profile-section container mx-auto grid items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 md:gap-16 lg:grid-cols-2">
                    <div className="profile-text">
                        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            {locale === 'id' ? 'Profil Kami' : 'Our Profile'}
                        </span>
                        <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl leading-tight">
                            {profileTitle}
                        </h2>
                        <p className="mt-5 text-base text-muted-foreground leading-relaxed">{profileDesc}</p>
                        <div className="mt-6 space-y-3">
                            {[
                                locale === 'id' ? 'Izin resmi Kementerian Agama RI' : 'Official Ministry of Religious Affairs license',
                                locale === 'id' ? 'Lebih dari 20.000 jamaah telah berangkat' : 'More than 20,000 pilgrims have departed',
                                locale === 'id' ? 'Pembimbing bersertifikat & berpengalaman' : 'Certified & experienced worship guides',
                                locale === 'id' ? 'Layanan 24/7 selama perjalanan ibadah' : '24/7 service throughout the worship journey',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                                    <span className="text-sm text-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="profile-img relative h-72 sm:h-80 md:h-96">
                        <img
                            src={page?.content?.profile?.image_primary || '/images/dummy.jpg'}
                            alt={profileTitle}
                            className="h-full w-full rounded-3xl object-cover shadow-2xl sm:w-3/4"
                        />
                        <img
                            src={page?.content?.profile?.image_secondary || '/images/dummy.jpg'}
                            alt={teamTitle}
                            className="absolute -bottom-6 right-0 w-2/3 rounded-2xl border-4 border-background shadow-2xl sm:w-1/2 sm:border-8"
                        />
                        <div className="absolute -top-4 right-4 sm:right-8 flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 shadow-lg shadow-primary/30">
                            <Users className="h-4 w-4 text-white" />
                            <span className="text-xs font-bold text-white">
                                {locale === 'id' ? 'Berpengalaman Sejak 2009' : 'Experienced Since 2009'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="values-section bg-secondary/30 py-20 sm:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-14 text-center">
                            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                {locale === 'id' ? 'Nilai Kami' : 'Our Values'}
                            </span>
                            <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
                                {locale === 'id' ? 'Apa yang Kami Pegang Teguh' : 'What We Stand For'}
                            </h2>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {values.map((value: any, index: number) => {
                                const defaultIcons = [Shield, Heart, Award, Star];
                                const Icon = value.icon ?? defaultIcons[index % defaultIcons.length];
                                const title = value.icon ? value.title : localize(value.title, locale, value.title);
                                const desc = value.icon ? value.desc : localize(value.description, locale, value.description ?? '');
                                return (
                                    <div key={index} className="value-card group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30">
                                        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/5 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-150" />
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Team ── */}
                {teamMembers.length > 0 && (
                    <section className="team-section py-20 sm:py-24">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="mb-14 text-center">
                                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                    {locale === 'id' ? 'Tim Kami' : 'Our Team'}
                                </span>
                                <h2 className="font-heading mt-5 text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">{teamTitle}</h2>
                                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">{teamDesc}</p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {teamMembers.map((member: Record<string, unknown>) => (
                                    <div key={String(member.name)} className="team-card group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="relative h-56 overflow-hidden sm:h-64">
                                            <img
                                                src={String(member.image_path || '/images/dummy.jpg')}
                                                alt={String(member.name)}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-heading text-xl font-bold text-foreground">{String(member.name)}</h3>
                                            <p className="mt-1 text-sm font-medium text-primary">{localize(member.role, locale)}</p>
                                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{localize(member.bio, locale)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CTA ── */}
                <section className="container mx-auto px-4 pb-20 sm:px-6 sm:pb-24">
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-foreground via-foreground to-primary px-8 py-14 text-center text-background shadow-2xl sm:px-12 sm:py-16">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
                        <div className="relative">
                            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-background/60">
                                {locale === 'id' ? 'Mulai Perjalanan Anda' : 'Start Your Journey'}
                            </span>
                            <h2 className="font-heading mt-5 text-3xl font-extrabold sm:text-4xl md:text-5xl">
                                {locale === 'id' ? 'Siap Berangkat Umroh Bersama Kami?' : 'Ready to Go on Umrah With Us?'}
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-base text-background/65">
                                {locale === 'id'
                                    ? 'Konsultasikan kebutuhan ibadah Anda dengan tim kami. Gratis, tanpa komitmen.'
                                    : 'Consult your worship needs with our team. Free, no commitment.'}
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link href="/paket-umroh" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Lihat Paket Umroh' : 'View Packages'}
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                                <Link href="/kontak" className="inline-flex items-center gap-2 rounded-full border-2 border-background/30 px-7 py-3.5 text-sm font-bold text-background/85 transition-all hover:border-background/60 hover:bg-background/10 hover:scale-105 active:scale-95">
                                    {locale === 'id' ? 'Hubungi Kami' : 'Contact Us'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
