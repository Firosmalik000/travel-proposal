import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Mail, MapPin, Shield, User } from 'lucide-react';

import AccountTab from './components/AccountTab';
import PersonalInfoTab from './components/PersonalInfoTab';

interface ProfileData {
    id: number;
    full_name: string | null;
    phone: string | null;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    address: string | null;
    photo_path: string | null;
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
    profile,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    profile?: ProfileData;
}) {
    const { auth } = usePage<SharedData>().props;
    const displayName = String(
        profile?.full_name || auth.user.full_name || auth.user.name || '',
    );
    const avatar =
        typeof auth.user.avatar === 'string' ? auth.user.avatar : undefined;
    const phoneBadge = profile?.phone
        ? String(profile.phone)
        : 'Kontak belum diisi';
    const genderBadge =
        profile?.gender === 'P'
            ? 'Perempuan'
            : profile?.gender === 'L'
              ? 'Laki-laki'
              : 'Belum disetel';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase())
        .join('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <Card className="relative overflow-hidden bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 -z-10">
                            <div className="absolute top-[-30%] left-[-10%] h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                            <div className="absolute top-[10%] right-[-10%] h-80 w-80 rounded-full bg-foreground/5 blur-3xl dark:bg-primary/10" />
                        </div>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 ring-1 ring-border/60">
                                        <AvatarImage
                                            src={avatar}
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
                                            Kelola identitas akun dan informasi
                                            kontak untuk operasional travel.
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        {phoneBadge}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        {genderBadge}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <User className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Nama
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {displayName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Email
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm backdrop-blur">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Alamat
                                        </p>
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {profile?.address || 'Belum diisi'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-2">
                            <TabsTrigger
                                value="personal"
                                className="flex items-center gap-2 rounded-xl"
                            >
                                <User className="h-4 w-4" />
                                <span>Informasi Pribadi</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="account"
                                className="flex items-center gap-2 rounded-xl"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Akun</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Informasi Pribadi</CardTitle>
                                    <CardDescription>
                                        Update nama, kontak, dan alamat yang
                                        dipakai dalam operasional.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PersonalInfoTab profile={profile} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="account" className="mt-6">
                            <Card className="bg-card/90 shadow-sm ring-1 ring-border/60 backdrop-blur">
                                <CardHeader>
                                    <CardTitle>Akun</CardTitle>
                                    <CardDescription>
                                        Update informasi akun seperti username,
                                        email, dan password
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
