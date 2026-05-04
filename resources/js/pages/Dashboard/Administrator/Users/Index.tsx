import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    SheetDescription,
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
    KeyRound,
    LogIn,
    Mail,
    Save,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Role = { id: number; name: string };
type UserRow = {
    id: number;
    name: string;
    email: string;
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
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserRow | null>(null);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [userToChangePassword, setUserToChangePassword] =
        useState<UserRow | null>(null);
    const [roleByUser, setRoleByUser] = useState<Record<number, string>>(
        Object.fromEntries(
            users.map((u) => [
                u.id,
                u.role ?? roles.find((r) => r.name === 'NoAccess')?.name ?? '',
            ]),
        ),
    );

    const inviteForm = useForm<{ email: string }>({ email: '' });

    const editForm = useForm<{ name: string; role_id: number | null }>({
        name: '',
        role_id: null,
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

    const saveUserRole = (userId: number) => {
        const selectedRoleName = roleByUser[userId];
        const selectedRoleId =
            roles.find((r) => r.name === selectedRoleName)?.id ?? null;

        if (!selectedRoleId) {
            return;
        }

        setEditingUserId(userId);
        router.put(
            `/admin/administrator/users/${userId}/role`,
            {
                role_id: selectedRoleId,
            },
            {
                preserveScroll: true,
                onFinish: () => setEditingUserId(null),
            },
        );
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
        const selectedRoleName =
            roleByUser[user.id] ??
            roles.find((r) => r.name === 'NoAccess')?.name ??
            '';
        const selectedRoleId =
            roles.find((r) => r.name === selectedRoleName)?.id ?? null;

        editForm.setData({
            name: user.name,
            role_id: selectedRoleId,
        });
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
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const openChangePassword = (user: UserRow) => {
        if (!canEdit || user.is_super_admin) {
            return;
        }

        setUserToChangePassword(user);
        passwordForm.setData({
            password: '',
            password_confirmation: '',
        });
        passwordForm.clearErrors();
        setIsPasswordOpen(true);
    };

    const submitChangePassword = (e: FormEvent) => {
        e.preventDefault();
        if (!userToChangePassword) {
            return;
        }

        passwordForm.put(
            `/admin/administrator/users/${userToChangePassword.id}/password`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsPasswordOpen(false);
                    passwordForm.reset();
                },
            },
        );
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

            <div className="space-y-6 p-6">
                {can('create') && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Undang User
                            </CardTitle>
                            <CardDescription>
                                Alur singkat: (1) Buat/atur role di Role
                                Management (2) Undang user via email (3) Assign
                                role ke user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                                User yang baru menerima undangan akan otomatis
                                punya role{' '}
                                <span className="font-medium">NoAccess</span>{' '}
                                (belum bisa akses menu apa pun) sampai kamu
                                assign role yang sesuai.
                            </div>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Daftar User
                        </CardTitle>
                        <CardDescription>
                            Assign role ke user. Hak akses diatur dari menu Role
                            Management.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    {canEdit ? (
                                        <TableHead className="w-[140px]">
                                            Aksi
                                        </TableHead>
                                    ) : null}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={
                                                    roleByUser[user.id] ?? ''
                                                }
                                                disabled={!can('edit')}
                                                onValueChange={(value) =>
                                                    setRoleByUser((prev) => ({
                                                        ...prev,
                                                        [user.id]: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className="w-[220px]">
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem
                                                            key={role.id}
                                                            value={role.name}
                                                        >
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        {canEdit ? (
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {!user.is_super_admin ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                impersonate(
                                                                    user,
                                                                )
                                                            }
                                                            className="flex-1"
                                                        >
                                                            <LogIn className="mr-2 h-4 w-4" />
                                                            Impersonate
                                                        </Button>
                                                    ) : null}
                                                    {!user.is_super_admin ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openChangePassword(
                                                                    user,
                                                                )
                                                            }
                                                            className="flex-1"
                                                        >
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            Password
                                                        </Button>
                                                    ) : null}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEdit(user)
                                                        }
                                                        className="flex-1"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            saveUserRole(
                                                                user.id,
                                                            )
                                                        }
                                                        disabled={
                                                            editingUserId ===
                                                            user.id
                                                        }
                                                        className="flex-1"
                                                    >
                                                        <Save className="mr-2 h-4 w-4" />
                                                        {editingUserId ===
                                                        user.id
                                                            ? '...'
                                                            : 'Simpan'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        ) : null}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Edit User</SheetTitle>
                        <SheetDescription>
                            Ubah nama dan role. Hak akses mengikuti role.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submitEdit} className="space-y-4 px-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) =>
                                    editForm.setData('name', e.target.value)
                                }
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Select
                                value={
                                    editForm.data.role_id
                                        ? String(editForm.data.role_id)
                                        : ''
                                }
                                onValueChange={(value) =>
                                    editForm.setData('role_id', Number(value))
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
                            <InputError message={editForm.errors.role_id} />
                        </div>

                        <SheetFooter className="px-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Ubah Password</SheetTitle>
                        <SheetDescription>
                            Buat password baru untuk user. Hanya super admin
                            yang bisa melakukan aksi ini.
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        onSubmit={submitChangePassword}
                        className="space-y-4 px-4"
                    >
                        <div className="grid gap-2">
                            <Label>Password baru</Label>
                            <Input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'password',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={passwordForm.errors.password}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Konfirmasi password</Label>
                            <Input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={
                                    passwordForm.errors.password_confirmation
                                }
                            />
                        </div>

                        <SheetFooter className="px-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={passwordForm.processing}
                            >
                                {passwordForm.processing
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
