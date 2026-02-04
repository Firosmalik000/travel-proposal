import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Menu, MenusTable } from './components/MenusTable';
import { Separator } from '@/components/ui/separator';

interface Props {
    menus: Menu[];
}

const iconOptions = [
    'Home',
    'Settings',
    'Users',
    'User',
    'FolderTree',
    'Shield',
    'Briefcase',
    'Building',
    'LayoutGrid',
    'Folder',
    'BookOpen',
    'Share2'
];

interface SubMenuItem {
    name: string;
    menu_key: string;
    path: string;
    icon: string;
    children?: SubMenuItem[] | null;
}

export default function MenusIndex({ menus }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
    const [showSubmenuSection, setShowSubmenuSection] = useState(false);
    const [forceDelete, setForceDelete] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        menu_key: '',
        path: '',
        icon: 'Folder',
        children: [] as SubMenuItem[] | null,
        order: 0,
        is_active: true,
    });

    const openCreateDialog = () => {
        reset();
        setEditingMenu(null);
        setShowSubmenuSection(false);
        setIsDialogOpen(true);
    };

    const openEditDialog = (menu: Menu) => {
        setEditingMenu(menu);
        const hasChildren = menu.children && menu.children.length > 0;
        setData({
            name: menu.name,
            menu_key: menu.menu_key || '',
            path: menu.path,
            icon: menu.icon,
            children: hasChildren ? menu.children : [],
            order: menu.order,
            is_active: menu.is_active,
        });
        setShowSubmenuSection(hasChildren);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clean up children data before submit
        const cleanedChildren = data.children && data.children.length > 0
            ? data.children.map(child => ({
                ...child,
                children: child.children && child.children.length > 0 ? child.children : null
            }))
            : null;

        // Update the form data with cleaned children
        setData('children', cleanedChildren);

        // Use setTimeout to ensure state is updated before submit
        setTimeout(() => {
            if (editingMenu) {
                put(`/dashboard/administrator/menus/${editingMenu.id}`, {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        reset();
                    },
                    onError: (errors) => {
                        console.error('Error updating menu:', errors);
                        alert('Gagal menyimpan: ' + JSON.stringify(errors));
                    },
                });
            } else {
                post('/dashboard/administrator/menus', {
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        reset();
                    },
                    onError: (errors) => {
                        console.error('Error creating menu:', errors);
                        alert('Gagal menyimpan: ' + JSON.stringify(errors));
                    },
                });
            }
        }, 0);
    };

    const handleDelete = () => {
        if (menuToDelete) {
            console.log('Deleting menu:', menuToDelete, 'Force delete:', forceDelete);
            destroy(`/dashboard/administrator/menus/${menuToDelete.id}`, {
                data: {
                    force_delete: forceDelete,
                },
                onSuccess: () => {
                    console.log('Menu deleted successfully');
                    setIsDeleteDialogOpen(false);
                    setMenuToDelete(null);
                    setForceDelete(false);
                },
                onError: (errors) => {
                    console.error('Error deleting menu:', errors);
                    alert('Gagal menghapus menu: ' + JSON.stringify(errors));
                },
            });
        }
    };

    const openDeleteDialog = (menu: Menu) => {
        setMenuToDelete(menu);
        setForceDelete(false);
        setIsDeleteDialogOpen(true);
    };

    // Submenu Management Functions
    const addSubmenu = () => {
        const currentChildren = data.children || [];
        setData('children', [
            ...currentChildren,
            {
                name: '',
                menu_key: '',
                path: '',
                icon: 'Folder',
                children: null,
            },
        ]);
        setShowSubmenuSection(true);
    };

    const removeSubmenu = (index: number) => {
        const currentChildren = data.children || [];
        setData(
            'children',
            currentChildren.filter((_, i) => i !== index)
        );
    };

    const updateSubmenu = (index: number, field: keyof SubMenuItem, value: string) => {
        const currentChildren = data.children || [];
        const updated = [...currentChildren];
        updated[index] = { ...updated[index], [field]: value };
        setData('children', updated);
    };

    // Level 2 Submenu Functions
    const addLevel2Submenu = (parentIndex: number) => {
        const currentChildren = data.children || [];
        const updated = [...currentChildren];
        const currentLevel2 = updated[parentIndex].children || [];
        updated[parentIndex] = {
            ...updated[parentIndex],
            children: [
                ...currentLevel2,
                {
                    name: '',
                    menu_key: '',
                    path: '',
                    icon: 'Folder',
                },
            ],
        };
        setData('children', updated);
    };

    const removeLevel2Submenu = (parentIndex: number, childIndex: number) => {
        const currentChildren = data.children || [];
        const updated = [...currentChildren];
        const currentLevel2 = updated[parentIndex].children || [];
        updated[parentIndex] = {
            ...updated[parentIndex],
            children: currentLevel2.filter((_, i) => i !== childIndex),
        };
        setData('children', updated);
    };

    const updateLevel2Submenu = (
        parentIndex: number,
        childIndex: number,
        field: keyof SubMenuItem,
        value: string
    ) => {
        const currentChildren = data.children || [];
        const updated = [...currentChildren];
        const currentLevel2 = updated[parentIndex].children || [];
        const updatedLevel2 = [...currentLevel2];
        updatedLevel2[childIndex] = { ...updatedLevel2[childIndex], [field]: value };
        updated[parentIndex] = {
            ...updated[parentIndex],
            children: updatedLevel2,
        };
        setData('children', updated);
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Administrator', href: '/dashboard/administrator' },
                { label: 'Menu Management', href: '/dashboard/administrator/menus' },
            ]}
        >
            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                        <p className="text-muted-foreground">
                            Kelola menu sistem dan struktur navigasi
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Menu
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Menu</CardTitle>
                        <CardDescription>Semua menu dalam sistem</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MenusTable
                            menus={menus}
                            onEdit={openEditDialog}
                            onDelete={openDeleteDialog}
                        />
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMenu ? 'Edit Menu' : 'Tambah Menu'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingMenu
                                        ? 'Ubah informasi menu yang sudah ada'
                                        : 'Tambahkan menu baru ke sistem'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Menu</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Administrator"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="menu_key">Menu Key</Label>
                                    <Input
                                        id="menu_key"
                                        value={data.menu_key}
                                        onChange={(e) => setData('menu_key', e.target.value)}
                                        placeholder="administrator.menus"
                                        required
                                    />
                                    {errors.menu_key && (
                                        <p className="text-sm text-destructive">{errors.menu_key}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="path">Path URL</Label>
                                    <Input
                                        id="path"
                                        value={data.path}
                                        onChange={(e) => setData('path', e.target.value)}
                                        placeholder="/dashboard/administrator"
                                        required
                                    />
                                    {errors.path && (
                                        <p className="text-sm text-destructive">{errors.path}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {iconOptions.map((icon) => (
                                                <SelectItem key={icon} value={icon}>
                                                    {icon}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="order">Urutan</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Menu Aktif
                                    </Label>
                                </div>

                                <Separator className="my-4" />

                                {/* Submenu Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">Submenu (Level 1)</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Tambahkan submenu untuk menu ini (opsional)
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSubmenu}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Submenu
                                        </Button>
                                    </div>

                                    {/* Level 1 Submenus */}
                                    {data.children && data.children.length > 0 && (
                                        <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                                            {data.children.map((submenu, index) => (
                                                <div key={index} className="space-y-3 border rounded-lg p-4 bg-background">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-sm font-semibold">
                                                            Submenu {index + 1}
                                                        </Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSubmenu(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">Nama</Label>
                                                            <Input
                                                                value={submenu.name}
                                                                onChange={(e) =>
                                                                    updateSubmenu(index, 'name', e.target.value)
                                                                }
                                                                placeholder="Nama submenu"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">Menu Key</Label>
                                                            <Input
                                                                value={submenu.menu_key}
                                                                onChange={(e) =>
                                                                    updateSubmenu(index, 'menu_key', e.target.value)
                                                                }
                                                                placeholder="menu.key"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">Path</Label>
                                                            <Input
                                                                value={submenu.path}
                                                                onChange={(e) =>
                                                                    updateSubmenu(index, 'path', e.target.value)
                                                                }
                                                                placeholder="/path"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label className="text-xs">Icon</Label>
                                                            <Select
                                                                value={submenu.icon}
                                                                onValueChange={(value) =>
                                                                    updateSubmenu(index, 'icon', value)
                                                                }
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {iconOptions.map((icon) => (
                                                                        <SelectItem key={icon} value={icon}>
                                                                            {icon}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {/* Level 2 Submenus */}
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs text-muted-foreground">
                                                                Submenu Level 2 (Opsional)
                                                            </Label>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => addLevel2Submenu(index)}
                                                                className="h-7 text-xs"
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Level 2
                                                            </Button>
                                                        </div>

                                                        {submenu.children && submenu.children.length > 0 && (
                                                            <div className="space-y-2 pl-4 border-l-2">
                                                                {submenu.children.map((level2, level2Index) => (
                                                                    <div
                                                                        key={level2Index}
                                                                        className="space-y-2 border rounded p-3 bg-muted/50"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <Label className="text-xs font-semibold">
                                                                                Level 2 - {level2Index + 1}
                                                                            </Label>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    removeLevel2Submenu(index, level2Index)
                                                                                }
                                                                                className="h-6 w-6"
                                                                            >
                                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div className="grid gap-1">
                                                                                <Label className="text-xs">Nama</Label>
                                                                                <Input
                                                                                    value={level2.name}
                                                                                    onChange={(e) =>
                                                                                        updateLevel2Submenu(
                                                                                            index,
                                                                                            level2Index,
                                                                                            'name',
                                                                                            e.target.value
                                                                                        )
                                                                                    }
                                                                                    placeholder="Nama"
                                                                                    className="h-8 text-xs"
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-1">
                                                                                <Label className="text-xs">Menu Key</Label>
                                                                                <Input
                                                                                    value={level2.menu_key}
                                                                                    onChange={(e) =>
                                                                                        updateLevel2Submenu(
                                                                                            index,
                                                                                            level2Index,
                                                                                            'menu_key',
                                                                                            e.target.value
                                                                                        )
                                                                                    }
                                                                                    placeholder="key"
                                                                                    className="h-8 text-xs"
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-1">
                                                                                <Label className="text-xs">Path</Label>
                                                                                <Input
                                                                                    value={level2.path}
                                                                                    onChange={(e) =>
                                                                                        updateLevel2Submenu(
                                                                                            index,
                                                                                            level2Index,
                                                                                            'path',
                                                                                            e.target.value
                                                                                        )
                                                                                    }
                                                                                    placeholder="/path"
                                                                                    className="h-8 text-xs"
                                                                                />
                                                                            </div>
                                                                            <div className="grid gap-1">
                                                                                <Label className="text-xs">Icon</Label>
                                                                                <Select
                                                                                    value={level2.icon}
                                                                                    onValueChange={(value) =>
                                                                                        updateLevel2Submenu(
                                                                                            index,
                                                                                            level2Index,
                                                                                            'icon',
                                                                                            value
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger className="h-8 text-xs">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {iconOptions.map((icon) => (
                                                                                            <SelectItem
                                                                                                key={icon}
                                                                                                value={icon}
                                                                                            >
                                                                                                {icon}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                Apakah Anda yakin ingin menghapus menu "{menuToDelete?.name}"?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            {menuToDelete?.has_children && (
                                <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="text-amber-600 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-amber-800 mb-1">
                                                Menu ini memiliki submenu
                                            </h4>
                                            <p className="text-sm text-amber-700 mb-3">
                                                Menu ini memiliki submenu di dalamnya. Pilih salah satu opsi di bawah:
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-start space-x-3 p-3 bg-white rounded border border-amber-200">
                                                    <Checkbox
                                                        id="force-delete"
                                                        checked={forceDelete}
                                                        onCheckedChange={(checked) => setForceDelete(checked as boolean)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <Label
                                                            htmlFor="force-delete"
                                                            className="cursor-pointer font-medium text-sm text-gray-900"
                                                        >
                                                            Hapus menu beserta semua submenu
                                                        </Label>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Menu dan semua submenu di dalamnya akan dihapus secara permanen
                                                        </p>
                                                    </div>
                                                </div>

                                                {!forceDelete && (
                                                    <p className="text-xs text-amber-700 pl-3">
                                                        💡 <strong>Saran:</strong> Edit menu terlebih dahulu dan hapus submenu satu per satu jika Anda hanya ingin menghapus menu utama
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!menuToDelete?.has_children && (
                                <p className="text-sm text-gray-600">
                                    Menu ini tidak memiliki submenu. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            )}
                        </div>

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
                                disabled={processing || (menuToDelete?.has_children && !forceDelete)}
                            >
                                {processing ? 'Menghapus...' : forceDelete ? 'Hapus Semua' : 'Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
