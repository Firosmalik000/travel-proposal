import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Save, Shield } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

type MenuItem = {
    menu_key: string;
    name: string;
    path: string;
};

type RoleItem = {
    id: number;
    name: string;
    users_count: number;
    access: Record<string, string[]>;
};

type Props = {
    roles: RoleItem[];
    menus: MenuItem[];
    actions: string[];
};

export default function RoleManagementIndex({ roles, menus, actions }: Props) {
    const { can } = usePermission('role_management');
    const [selectedRoleId, setSelectedRoleId] = useState<number>(
        roles[0]?.id ?? 0,
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const selectedRole = useMemo(
        () => roles.find((r) => r.id === selectedRoleId) ?? null,
        [roles, selectedRoleId],
    );

    const createRoleForm = useForm<{ name: string }>({ name: '' });

    const permissionsForm = useForm<{ access: Record<string, string[]> }>({
        access: selectedRole?.access ?? {},
    });

    // Keep form data synced when changing role
    const selectRole = (value: string) => {
        const roleId = Number(value);
        setSelectedRoleId(roleId);
        const nextRole = roles.find((r) => r.id === roleId);
        permissionsForm.setData('access', nextRole?.access ?? {});
        permissionsForm.clearErrors();
    };

    const togglePermission = (
        menuKey: string,
        action: string,
        checked: boolean,
    ) => {
        const current = { ...permissionsForm.data.access };
        current[menuKey] ??= [];

        if (checked) {
            if (!current[menuKey].includes(action)) {
                current[menuKey] = [...current[menuKey], action];
            }
        } else {
            current[menuKey] = current[menuKey].filter((p) => p !== action);
            if (current[menuKey].length === 0) {
                delete current[menuKey];
            }
        }

        permissionsForm.setData('access', current);
    };

    const isAllAccessSelected = useMemo(() => {
        if (menus.length === 0) {
            return false;
        }

        return menus.every((menu) => {
            const current = permissionsForm.data.access[menu.menu_key] ?? [];
            return actions.every((action) => current.includes(action));
        });
    }, [actions, menus, permissionsForm.data.access]);

    const toggleAllAccess = (checked: boolean) => {
        if (!can('edit')) {
            return;
        }

        if (!checked) {
            permissionsForm.setData('access', {});
            return;
        }

        const next: Record<string, string[]> = {};
        menus.forEach((menu) => {
            next[menu.menu_key] = [...actions];
        });
        permissionsForm.setData('access', next);
    };

    const savePermissions = () => {
        if (!can('edit')) {
            return;
        }

        if (!selectedRoleId) {
            return;
        }

        router.put(
            `/admin/administrator/roles/${selectedRoleId}/permissions`,
            permissionsForm.data,
            { preserveScroll: true },
        );
    };

    const submitCreateRole = (e: FormEvent) => {
        e.preventDefault();
        if (!can('create')) {
            return;
        }

        createRoleForm.post('/admin/administrator/roles', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createRoleForm.reset('name');
            },
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Administrator', href: '/admin/administrator' },
                {
                    title: 'Role Management',
                    href: '/admin/administrator/roles',
                },
            ]}
        >
            <Head title="Role Management" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Role Management
                            </CardTitle>
                            <CardDescription>
                                Atur akses menu per role. Setelah itu, assign
                                role ke user di halaman User Management.
                            </CardDescription>
                        </div>

                        {can('create') && (
                            <Button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Role
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
                            Tips: minimal centang{' '}
                            <span className="font-medium">view</span> untuk menu
                            yang ingin muncul di sidebar. Aksi lain seperti{' '}
                            <span className="font-medium">
                                create/edit/delete
                            </span>{' '}
                            dipakai untuk izin operasi di halaman tersebut.
                        </div>
                        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
                            <div className="space-y-3">
                                <Label>Pilih role</Label>
                                <Select
                                    value={String(selectedRoleId)}
                                    onValueChange={selectRole}
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
                                                {role.name} ({role.users_count})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                                    Permission yang dicentang menghasilkan akses
                                    di sidebar dan endpoint.
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Menu Permissions</Label>
                                    <div className="flex items-center gap-3">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                                            <Checkbox
                                                checked={isAllAccessSelected}
                                                disabled={!can('edit')}
                                                onCheckedChange={(checked) =>
                                                    toggleAllAccess(
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                            <span>All Access</span>
                                        </label>

                                        {can('edit') && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={savePermissions}
                                                disabled={
                                                    permissionsForm.processing ||
                                                    !selectedRole
                                                }
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {permissionsForm.processing
                                                    ? 'Menyimpan...'
                                                    : 'Simpan'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {!can('edit') && (
                                    <div className="text-xs text-muted-foreground">
                                        Kamu hanya punya akses view. Minta admin
                                        berikan permission edit untuk mengubah
                                        akses role.
                                    </div>
                                )}

                                <div className="space-y-3 rounded-lg border p-4">
                                    {menus.map((menu) => {
                                        const current =
                                            permissionsForm.data.access[
                                                menu.menu_key
                                            ] ?? [];

                                        return (
                                            <div
                                                key={menu.menu_key}
                                                className="rounded-lg border bg-muted/20 p-3"
                                            >
                                                <div className="mb-3 flex flex-col gap-1">
                                                    <div className="font-medium">
                                                        {menu.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {menu.menu_key} -{' '}
                                                        {menu.path}
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 md:grid-cols-4">
                                                    {actions.map((action) => (
                                                        <label
                                                            key={`${menu.menu_key}:${action}`}
                                                            className="flex cursor-pointer items-center gap-2 text-sm"
                                                        >
                                                            <Checkbox
                                                                checked={current.includes(
                                                                    action,
                                                                )}
                                                                disabled={
                                                                    !can('edit')
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    togglePermission(
                                                                        menu.menu_key,
                                                                        action,
                                                                        checked as boolean,
                                                                    )
                                                                }
                                                            />
                                                            <span>
                                                                {action}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Role</DialogTitle>
                        <DialogDescription>
                            Buat role baru, lalu atur permissions-nya.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreateRole} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role-name">Nama role</Label>
                            <Input
                                id="role-name"
                                value={createRoleForm.data.name}
                                onChange={(e) =>
                                    createRoleForm.setData(
                                        'name',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: ContentEditor"
                                required
                            />
                            <InputError message={createRoleForm.errors.name} />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createRoleForm.processing}
                            >
                                {createRoleForm.processing
                                    ? 'Membuat...'
                                    : 'Buat'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
