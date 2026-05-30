import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Edit,
    LogIn,
    Mail,
    MoreHorizontal,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Role = { id: number; name: string };
type UserRow = {
    id: number;
    name: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    address: string | null;
    avatar?: string | null;
    role: string | null;
    is_super_admin: boolean;
};

type Props = {
    users: UserRow[];
    roles: Role[];
};

export default function UserManagementIndex({ users, roles }: Props) {
    const { can } = usePermission('user_management');
    const canEdit = can('edit');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserRow | null>(null);

    const inviteForm = useForm<{ email: string }>({ email: '' });

    const editForm = useForm<{
        name: string;
        email: string;
        role_id: number | null;
        full_name: string;
        phone: string;
        gender: string;
        birth_place: string;
        birth_date: string;
        address: string;
    }>({
        name: '',
        email: '',
        role_id: null,
        full_name: '',
        phone: '',
        gender: '',
        birth_place: '',
        birth_date: '',
        address: '',
    });

    const passwordForm = useForm<{
        password: string;
        password_confirmation: string;
    }>({
        password: '',
        password_confirmation: '',
    });

    const submitInvite = (e: FormEvent) => {
        e.preventDefault();
        inviteForm.post('/admin/administrator/invitations', {
            preserveScroll: true,
            onSuccess: () => inviteForm.reset('email'),
        });
    };

    const impersonate = (user: UserRow) => {
        if (!canEdit || user.is_super_admin) {
            return;
        }

        router.post(
            `/admin/administrator/users/${user.id}/impersonate`,
            {},
            { preserveScroll: true },
        );
    };

    const openEdit = (user: UserRow) => {
        if (!canEdit) {
            return;
        }

        setUserToEdit(user);
        const selectedRoleId =
            roles.find((r) => r.name === user.role)?.id ??
            roles.find((r) => r.name === 'NoAccess')?.id ??
            null;

        editForm.setData({
            name: user.name,
            email: user.email,
            role_id: selectedRoleId,
            full_name: user.full_name ?? '',
            phone: user.phone ?? '',
            gender: user.gender ?? '',
            birth_place: user.birth_place ?? '',
            birth_date: user.birth_date ?? '',
            address: user.address ?? '',
        });
        passwordForm.setData({
            password: '',
            password_confirmation: '',
        });
        passwordForm.clearErrors();
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!userToEdit) {
            return;
        }

        editForm.put(`/admin/administrator/users/${userToEdit.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (
                    userToEdit.is_super_admin ||
                    passwordForm.data.password.trim() === ''
                ) {
                    setIsEditOpen(false);
                    return;
                }

                passwordForm.put(
                    `/admin/administrator/users/${userToEdit.id}/password`,
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            passwordForm.reset();
                            setIsEditOpen(false);
                        },
                    },
                );
            },
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Administrator',
                    href: '/admin/administrator',
                },
                {
                    title: 'User Management',
                    href: '/admin/administrator/users',
                },
            ]}
        >
            <Head title="User Management" />

            <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        User Management
                    </h1>
                </div>

                {can('create') && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Undang User
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitInvite}
                                className="grid gap-4 md:grid-cols-[1fr_auto]"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="invite-email">
                                        Email user
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            value={inviteForm.data.email}
                                            onChange={(e) =>
                                                inviteForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="user@example.com"
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                    <InputError
                                        message={inviteForm.errors.email}
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        type="submit"
                                        disabled={inviteForm.processing}
                                        className="w-full md:w-auto"
                                    >
                                        {inviteForm.processing
                                            ? 'Mengirim...'
                                            : 'Kirim Undangan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Daftar User
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    {canEdit ? (
                                        <TableHead className="w-20 text-right">
                                            Aksi
                                        </TableHead>
                                    ) : null}
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="w-14 text-center text-sm text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        {canEdit ? (
                                            <TableCell className="min-w-20">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="ml-auto"
                                                            aria-label={`Aksi ${user.name}`}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openEdit(user)
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit User & Role
                                                        </DropdownMenuItem>
                                                        {!user.is_super_admin ? (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    impersonate(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <LogIn className="h-4 w-4" />
                                                                Impersonate
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        ) : null}
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                                {user.role ?? 'NoAccess'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                <SheetContent className="w-full sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Edit User</SheetTitle>
                    </SheetHeader>

                    {userToEdit ? (
                        <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                            <Avatar className="h-11 w-11">
                                <AvatarImage
                                    src={userToEdit.avatar ?? undefined}
                                    alt={userToEdit.name}
                                />
                                <AvatarFallback>
                                    {(userToEdit.full_name || userToEdit.name)
                                        .split(' ')
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0]?.toUpperCase())
                                        .join('') || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {userToEdit.full_name || userToEdit.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {userToEdit.email}
                                </p>
                            </div>
                            <span className="ml-auto rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                                {userToEdit.role ?? 'NoAccess'}
                            </span>
                        </div>
                    ) : null}

                    <form
                        onSubmit={submitEdit}
                        className="mt-5 flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1">
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="mb-3 text-sm font-semibold text-foreground">
                                    Akun Utama
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">
                                            Nama Login
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            value={editForm.data.name}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={editForm.errors.name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={editForm.errors.email}
                                        />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={
                                                editForm.data.role_id
                                                    ? String(
                                                          editForm.data.role_id,
                                                      )
                                                    : ''
                                            }
                                            onValueChange={(value) =>
                                                editForm.setData(
                                                    'role_id',
                                                    Number(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem
                                                        key={role.id}
                                                        value={String(role.id)}
                                                    >
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={editForm.errors.role_id}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <p className="mb-3 text-sm font-semibold text-foreground">
                                    Data Profil Lengkap
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-full-name">
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            id="edit-full-name"
                                            value={editForm.data.full_name}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'full_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nama lengkap"
                                        />
                                        <InputError
                                            message={editForm.errors.full_name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-phone">
                                            No. Telepon
                                        </Label>
                                        <Input
                                            id="edit-phone"
                                            value={editForm.data.phone}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="08123456789"
                                        />
                                        <InputError
                                            message={editForm.errors.phone}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Jenis Kelamin</Label>
                                        <Select
                                            value={
                                                editForm.data.gender || 'none'
                                            }
                                            onValueChange={(value) =>
                                                editForm.setData(
                                                    'gender',
                                                    value === 'none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis kelamin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Belum disetel
                                                </SelectItem>
                                                <SelectItem value="L">
                                                    Laki-laki
                                                </SelectItem>
                                                <SelectItem value="P">
                                                    Perempuan
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={editForm.errors.gender}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-birth-place">
                                            Tempat Lahir
                                        </Label>
                                        <Input
                                            id="edit-birth-place"
                                            value={editForm.data.birth_place}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'birth_place',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tempat lahir"
                                        />
                                        <InputError
                                            message={
                                                editForm.errors.birth_place
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-birth-date">
                                            Tanggal Lahir
                                        </Label>
                                        <Input
                                            id="edit-birth-date"
                                            type="date"
                                            value={editForm.data.birth_date}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'birth_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={editForm.errors.birth_date}
                                        />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label htmlFor="edit-address">
                                            Alamat
                                        </Label>
                                        <Input
                                            id="edit-address"
                                            value={editForm.data.address}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Alamat lengkap"
                                        />
                                        <InputError
                                            message={editForm.errors.address}
                                        />
                                    </div>
                                </div>
                            </div>

                            {!userToEdit?.is_super_admin ? (
                                <div className="rounded-xl border bg-card p-4">
                                    <p className="mb-3 text-sm font-semibold text-foreground">
                                        Ubah Password (Opsional)
                                    </p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Password Baru</Label>
                                            <Input
                                                type="password"
                                                value={
                                                    passwordForm.data.password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Isi jika ingin ganti password"
                                            />
                                            <InputError
                                                message={
                                                    passwordForm.errors.password
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Konfirmasi Password</Label>
                                            <Input
                                                type="password"
                                                value={
                                                    passwordForm.data
                                                        .password_confirmation
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ulangi password baru"
                                            />
                                            <InputError
                                                message={
                                                    passwordForm.errors
                                                        .password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <SheetFooter className="mt-4 border-t bg-background px-0 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    editForm.processing ||
                                    passwordForm.processing
                                }
                            >
                                {editForm.processing || passwordForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
