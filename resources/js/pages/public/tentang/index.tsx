import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import React from 'react';

// --- DATA UNTUK HALAMAN TENTANG KAMI ---

const teamMembers = [
    {
        name: 'Direktur Operasional',
        role: '15+ tahun pengalaman handling jamaah.',
        image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Pembimbing Ibadah',
        role: 'Ustadz bersertifikat dengan bimbingan yang lembut dan mendalam.',
        image: 'https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    },
    {
        name: 'Customer Care',
        role: 'Admin responsif dan siap membantu semua proses administrasi Anda.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    },
];

const companyValues = [
    {
        title: 'Visi Kami',
        description: 'Menjadi perusahaan travel umroh terpercaya di Indonesia yang dikenal karena pelayanannya yang menenangkan, amanah, dan profesional.',
    },
    {
        title: 'Misi Kami',
        description: 'Memberikan bimbingan ibadah yang sesuai sunnah, menyediakan fasilitas yang transparan dan berkualitas, serta melakukan pendampingan total dari awal hingga akhir.',
    },
];

// --- React Component ---

export default function Tentang() {
    return (
        <PublicLayout>
            <Head title="Tentang Kami">
                <meta name="description" content="Profil Amanah Haramain Travel, visi misi, tim inti, dan jejak pelayanan jamaah." />
            </Head>

            <main className="bg-white">
                {/* Hero Section */}
                <section className="bg-slate-800 text-white py-20 md:py-32">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-heading text-4xl md:text-6xl font-bold">Tentang Amanah Haramain</h1>
                        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                            Mengenal lebih dekat visi, misi, dan tim di balik layanan umroh terpercaya pilihan Anda.
                        </p>
                    </div>
                </section>

                {/* Main Content Section */}
                <section className="container mx-auto px-4 py-24 grid lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="font-heading text-3xl font-bold text-slate-800">Profil & Nilai Perusahaan</h2>
                        <p className="mt-4 text-slate-600 leading-relaxed">
                            Berdiri sejak tahun 2015, Amanah Haramain Travel fokus pada penyelenggaraan perjalanan umroh yang tertib, nyaman, dan sesuai tuntunan. Dari konsultasi awal sampai kepulangan, setiap jamaah dibimbing oleh tim berpengalaman dengan sistem pelayanan yang rapi, transparan, dan mudah dipahami.
                        </p>
                        <div className="mt-10 space-y-8">
                            {companyValues.map(value => (
                                <div key={value.title}>
                                    <h3 className="font-heading text-2xl font-semibold text-slate-800">{value.title}</h3>
                                    <p className="mt-2 text-slate-600 leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1 pt-12">
                             <img src="https://images.unsplash.com/photo-1555980134-3a7b6a15d658?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Team discussing" className="w-full h-auto object-cover rounded-2xl shadow-lg"/>
                        </div>
                        <div className="col-span-1">
                             <img src="https://images.unsplash.com/photo-1562991283-a55f53b692a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Madinah city view" className="w-full h-auto object-cover rounded-2xl shadow-lg"/>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="bg-gray-50 py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-4xl font-bold text-slate-800">Tim Inti Kami</h2>
                            <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">Figur-figur profesional dan amanah yang menjadi tulang punggung pelayanan kami.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {teamMembers.map(member => (
                                <div key={member.name} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4 shadow-md"/>
                                    <h3 className="font-heading text-xl font-bold text-slate-800">{member.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </main>
        </PublicLayout>
    );
}