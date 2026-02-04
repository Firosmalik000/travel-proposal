import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Car, IdCard, Mail, MapPin, Shield, User } from 'lucide-react';

import PersonalInfoTab from './components/PersonalInfoTab';
import EmployeeInfoTab from './components/EmployeeInfoTab';
import VehiclesTab from './components/VehiclesTab';
import AccountTab from './components/AccountTab';

interface Department {
    id: number;
    name: string;
}

interface Jabatan {
    id: number;
    name: string;
}

interface Karyawan {
    id: number;
    nik: string;
    nama_lengkap: string;
    nama_panggilan: string;
    gender: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    alamat: string;
    agama: string;
    status_pernikahan: string;
    email: string;
    no_telp: string;
    foto?: string;
    department?: Department;
    jabatan?: Jabatan;
    tanggal_mulai_bekerja: string;
    status_karyawan: string;
}

interface Kendaraan {
    id: number;
    user_id: number;
    plat: string;
    merk: string;
    warna: string;
    cc: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    karyawan,
    kendaraan = [],
}: {
    mustVerifyEmail: boolean;
    status?: string;
    karyawan?: Karyawan;
    kendaraan?: Kendaraan[];
}) {
    const { auth } = usePage<SharedData>().props;
    const displayName = karyawan?.nama_lengkap || auth.user.name;
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Card className="relative overflow-hidden bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 -z-10">
                            <div className="absolute left-[-10%] top-[-30%] h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                            <div className="absolute right-[-10%] top-[10%] h-80 w-80 rounded-full bg-foreground/5 blur-3xl dark:bg-primary/10" />
                        </div>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 ring-1 ring-border/60">
                                        <AvatarImage
                                            src={(karyawan as any)?.foto_url || undefined}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {initials || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Profile
                                        </CardTitle>
                                        <CardDescription>
                                            Kelola informasi pribadi, pekerjaan, dan kendaraan Anda.
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                                    <Badge variant="secondary" className="rounded-full">
                                        {karyawan?.department?.name || '—'}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-full">
                                        {karyawan?.jabatan?.name || '—'}
                                    </Badge>
                                    <Badge className="rounded-full">
                                        {karyawan?.status_karyawan || 'Aktif'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <IdCard className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            NIK
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {karyawan?.nik || '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {karyawan?.email || auth.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Lokasi
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {karyawan?.alamat || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-2 sm:grid-cols-4">
                            <TabsTrigger value="personal" className="flex items-center gap-2 rounded-xl">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Informasi Pribadi</span>
                                <span className="sm:hidden">Pribadi</span>
                            </TabsTrigger>
                            <TabsTrigger value="employee" className="flex items-center gap-2 rounded-xl">
                                <Briefcase className="h-4 w-4" />
                                <span className="hidden sm:inline">Info Pekerjaan</span>
                                <span className="sm:hidden">Pekerjaan</span>
                            </TabsTrigger>
                            <TabsTrigger value="vehicles" className="flex items-center gap-2 rounded-xl">
                                <Car className="h-4 w-4" />
                                <span className="hidden sm:inline">Kendaraan</span>
                                <span className="sm:hidden">Kendaraan</span>
                            </TabsTrigger>
                            <TabsTrigger value="account" className="flex items-center gap-2 rounded-xl">
                                <Shield className="h-4 w-4" />
                                <span className="hidden sm:inline">Akun</span>
                                <span className="sm:hidden">Akun</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Informasi Pribadi</CardTitle>
                                    <CardDescription>
                                        Update informasi pribadi Anda seperti nama, alamat, dan kontak
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PersonalInfoTab karyawan={karyawan} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="employee" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Informasi Pekerjaan</CardTitle>
                                    <CardDescription>
                                        Informasi terkait pekerjaan Anda di perusahaan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EmployeeInfoTab karyawan={karyawan} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vehicles" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Kendaraan</CardTitle>
                                    <CardDescription>
                                        Kelola data kendaraan yang terdaftar untuk parkir di perusahaan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <VehiclesTab kendaraan={kendaraan} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="account" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Akun</CardTitle>
                                    <CardDescription>
                                        Update informasi akun seperti username, email, dan password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AccountTab
                                        user={auth.user}
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
