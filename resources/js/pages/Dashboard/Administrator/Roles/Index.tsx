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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { ChevronDown, Plus, Save, Shield } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';

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
    const [menuSelectSearch, setMenuSelectSearch] = useState('');
    const [selectedMenuKey, setSelectedMenuKey] = useState<string>('all');
    const [isMenuFilterOpen, setIsMenuFilterOpen] = useState(false);
    const [menuOpenStates, setMenuOpenStates] = useState<
        Record<string, boolean>
    >({});
    const menuSearchInputRef = useRef<HTMLInputElement | null>(null);

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
        setMenuOpenStates({});
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

    const filteredMenus = useMemo(() => {
        return selectedMenuKey === 'all'
            ? menus
            : menus.filter((menu) => menu.menu_key === selectedMenuKey);
    }, [menus, selectedMenuKey]);

    const selectableMenus = useMemo(() => {
        const keyword = menuSelectSearch.trim().toLowerCase();
        if (keyword === '') {
            return menus;
        }

        return menus.filter((menu) => {
            const haystack =
                `${menu.name} ${menu.menu_key} ${menu.path}`.toLowerCase();
            return haystack.includes(keyword);
        });
    }, [menuSelectSearch, menus]);

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

            <div className="space-y-6 p-4 md:p-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                        <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                            Tips: minimal centang{' '}
                            <span className="font-medium">view</span> untuk menu
                            yang ingin muncul di sidebar. Aksi lain seperti{' '}
                            <span className="font-medium">
                                create/edit/delete
                            </span>{' '}
                            dipakai untuk izin operasi di halaman tersebut.
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-3 rounded-xl border bg-card p-4">
                                <div className="grid gap-3 lg:grid-cols-[320px_320px] lg:items-end">
                                    <div className="space-y-2">
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
                                                        {role.name} (
                                                        {role.users_count})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Filter menu</Label>
                                        <Select
                                            open={isMenuFilterOpen}
                                            onOpenChange={(open) => {
                                                setIsMenuFilterOpen(open);
                                                if (open) {
                                                    setTimeout(() => {
                                                        menuSearchInputRef.current?.focus();
                                                    }, 0);
                                                }
                                            }}
                                            value={selectedMenuKey}
                                            onValueChange={(value) => {
                                                setSelectedMenuKey(value);
                                                setIsMenuFilterOpen(false);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua menu" />
                                            </SelectTrigger>
                                            <SelectContent
                                                onCloseAutoFocus={(event) =>
                                                    event.preventDefault()
                                                }
                                            >
                                                <div
                                                    className="p-2"
                                                    onPointerDown={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Input
                                                        ref={menuSearchInputRef}
                                                        value={menuSelectSearch}
                                                        onChange={(event) =>
                                                            setMenuSelectSearch(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDownCapture={(
                                                            event,
                                                        ) => {
                                                            event.stopPropagation();
                                                        }}
                                                        placeholder="Cari menu..."
                                                        className="h-8"
                                                    />
                                                </div>
                                                <SelectItem value="all">
                                                    Semua menu
                                                </SelectItem>
                                                {selectableMenus.map((menu) => (
                                                    <SelectItem
                                                        key={menu.menu_key}
                                                        value={menu.menu_key}
                                                    >
                                                        {menu.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-xs text-muted-foreground">
                                        {filteredMenus.length} dari{' '}
                                        {menus.length} menu tampil
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
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
                            </div>

                            {!can('edit') && (
                                <div className="text-xs text-muted-foreground">
                                    Kamu hanya punya akses view. Minta admin
                                    berikan permission edit untuk mengubah akses
                                    role.
                                </div>
                            )}

                            <div className="space-y-3 rounded-xl border bg-card p-4">
                                {filteredMenus.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        Tidak ada menu yang cocok dengan
                                        pencarian.
                                    </div>
                                ) : null}

                                {filteredMenus.map((menu) => {
                                    const current =
                                        permissionsForm.data.access[
                                            menu.menu_key
                                        ] ?? [];
                                    const selectedCount = current.length;
                                    const isOpen =
                                        menuOpenStates[menu.menu_key] ?? false;

                                    return (
                                        <Collapsible
                                            key={menu.menu_key}
                                            open={isOpen}
                                            onOpenChange={(open) =>
                                                setMenuOpenStates((prev) => ({
                                                    ...prev,
                                                    [menu.menu_key]: open,
                                                }))
                                            }
                                            className="rounded-xl border bg-muted/20"
                                        >
                                            <CollapsibleTrigger className="w-full p-4 text-left">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="leading-none font-medium">
                                                            {menu.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="font-mono">
                                                                {menu.menu_key}
                                                            </span>{' '}
                                                            - {menu.path}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                                            {selectedCount}/
                                                            {actions.length}{' '}
                                                            access
                                                        </span>
                                                        <ChevronDown
                                                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                                                                isOpen
                                                                    ? 'rotate-180'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="px-4 pb-4">
                                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                                    {actions.map((action) => (
                                                        <label
                                                            key={`${menu.menu_key}:${action}`}
                                                            className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm"
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
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
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
