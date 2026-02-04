import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { UserAccess, UserAccessTable } from './components/UserAccessTable';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Menu {
    id: number | null;
    name: string;
    menu_key: string;
    path: string;
    level: number; // 0 = parent, 1 = child, 2 = grandchild
}

interface Props {
    userAccesses: UserAccess[];
    users: User[];
    menus: Menu[];
}

export default function UserAccessIndex({ userAccesses, users, menus }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccess, setEditingAccess] = useState<UserAccess | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [accessToDelete, setAccessToDelete] = useState<UserAccess | null>(null);

    // Initialize form data with JSON access structure
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm<{
        user_id: string;
        access: Record<string, string[]>;
    }>({
        user_id: '',
        access: {},
    });

    const openCreateDialog = () => {
        reset();
        setEditingAccess(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (access: UserAccess) => {
        setEditingAccess(access);
        setData({
            user_id: access.user_id.toString(),
            access: access.access || {},
        });
        setIsDialogOpen(true);
    };

    const handlePermissionChange = (menuKey: string, permission: string, checked: boolean) => {
        const currentAccess = { ...data.access };

        if (!currentAccess[menuKey]) {
            currentAccess[menuKey] = [];
        }

        if (checked) {
            // Add permission if not exists
            if (!currentAccess[menuKey].includes(permission)) {
                currentAccess[menuKey] = [...currentAccess[menuKey], permission];
            }
        } else {
            // Remove permission
            currentAccess[menuKey] = currentAccess[menuKey].filter(p => p !== permission);

            // Remove menu_key if no permissions left
            if (currentAccess[menuKey].length === 0) {
                delete currentAccess[menuKey];
            }
        }

        setData('access', currentAccess);
    };

    const handleSelectAllPermissions = (menuKey: string, checked: boolean) => {
        const allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];
        const currentAccess = { ...data.access };

        if (checked) {
            currentAccess[menuKey] = allPermissions;
        } else {
            delete currentAccess[menuKey];
        }

        setData('access', currentAccess);
    };

    const handleSelectAllMenus = (checked: boolean) => {
        const allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];
        const currentAccess: Record<string, string[]> = {};

        if (checked) {
            // Give all permissions to all menus
            menus.forEach((menu) => {
                if (menu.menu_key) {
                    currentAccess[menu.menu_key] = allPermissions;
                }
            });
        }
        // If unchecked, currentAccess remains empty object (removes all)

        setData('access', currentAccess);
    };

    const isAllMenusSelected = () => {
        if (!data.access || Object.keys(data.access).length === 0) return false;

        // Check if all menus have all permissions
        const menuKeysWithAccess = Object.keys(data.access);
        const allMenuKeys = menus.map(m => m.menu_key).filter(Boolean);

        return menuKeysWithAccess.length === allMenuKeys.length;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that user is selected
        if (!data.user_id) {
            alert('Silakan pilih pengguna terlebih dahulu');
            return;
        }

        // Validate that at least one permission is selected
        if (Object.keys(data.access).length === 0) {
            alert('Silakan pilih minimal satu menu dan permission');
            return;
        }

        console.log('Submitting data:', data);

        if (editingAccess) {
            put(`/dashboard/administrator/user-access/${editingAccess.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error updating:', errors);
                    alert('Gagal menyimpan: ' + JSON.stringify(errors));
                },
            });
        } else {
            post('/dashboard/administrator/user-access', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Error creating:', errors);
                    alert('Gagal menyimpan: ' + JSON.stringify(errors));
                },
            });
        }
    };

    const handleDelete = () => {
        if (accessToDelete) {
            destroy(`/dashboard/administrator/user-access/${accessToDelete.id}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setAccessToDelete(null);
                },
            });
        }
    };

    const openDeleteDialog = (access: UserAccess) => {
        setAccessToDelete(access);
        setIsDeleteDialogOpen(true);
    };


    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Administrator', href: '/dashboard/administrator' },
                { label: 'User Access', href: '/dashboard/administrator/user-access' },
            ]}
        >
            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Access Management</h1>
                        <p className="text-muted-foreground">
                            Kelola hak akses pengguna terhadap menu (JSON Structure)
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Akses
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar User Access</CardTitle>
                        <CardDescription>Semua hak akses pengguna dalam sistem (Format JSON)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserAccessTable
                            userAccesses={userAccesses}
                            menus={menus}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                        />
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAccess ? 'Edit User Access' : 'Tambah User Access'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingAccess
                                        ? 'Ubah hak akses yang sudah ada'
                                        : 'Tambahkan hak akses baru untuk pengguna'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="user_id">Pengguna</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                        disabled={!!editingAccess}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-destructive">{errors.user_id}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Menu Permissions (Nested Structure)</Label>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="select-all-menus"
                                                checked={isAllMenusSelected()}
                                                onCheckedChange={(checked) => handleSelectAllMenus(checked as boolean)}
                                            />
                                            <Label htmlFor="select-all-menus" className="cursor-pointer text-sm font-semibold text-primary">
                                                Select All Menus
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
                                        {menus.map((menu) => (
                                            <div key={menu.menu_key} className={`space-y-2 border-b pb-3 last:border-b-0 ${menu.level > 0 ? 'ml-' + (menu.level * 4) : ''}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className={`${menu.level === 0 ? 'font-bold' : menu.level === 1 ? 'font-medium' : 'font-normal'} text-sm`}>
                                                        {menu.name}
                                                    </span>
                                                    <Checkbox
                                                        checked={!!data.access[menu.menu_key]}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectAllPermissions(menu.menu_key, checked as boolean)
                                                        }
                                                    />
                                                </div>
                                                {data.access[menu.menu_key] && (
                                                    <div className="grid grid-cols-4 gap-2 pl-4">
                                                        {['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'].map((permission) => (
                                                            <div key={permission} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`${menu.menu_key}-${permission}`}
                                                                    checked={data.access[menu.menu_key]?.includes(permission) || false}
                                                                    onCheckedChange={(checked) =>
                                                                        handlePermissionChange(menu.menu_key, permission, checked as boolean)
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`${menu.menu_key}-${permission}`}
                                                                    className="cursor-pointer text-xs capitalize"
                                                                >
                                                                    {permission}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus semua hak akses untuk{' '}
                                <strong>{accessToDelete?.user_name}</strong>? Tindakan ini tidak
                                dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing}
                            >
                                {processing ? 'Menghapus...' : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
