import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Menu {
    id: number;
    name: string;
    menu_key: string;
    path: string;
    icon: string;
    children?: Array<Record<string, unknown>> | null;
    has_children?: boolean;
    order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    menus: Menu[];
    onEdit: (menu: Menu) => void;
    onDelete: (menu: Menu) => void;
    onReorder: (menuIds: number[]) => void;
}

export function MenusTable({ menus, onEdit, onDelete, onReorder }: Props) {
    const { can } = usePermission('menu_management');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const [orderedMenus, setOrderedMenus] = useState<Menu[]>(menus);
    const [draggedMenuId, setDraggedMenuId] = useState<number | null>(null);

    useEffect(() => {
        setOrderedMenus(menus);
    }, [menus]);

    function moveMenu(sourceId: number, targetId: number) {
        if (sourceId === targetId) {
            return;
        }

        const sourceIndex = orderedMenus.findIndex(
            (menu) => menu.id === sourceId,
        );
        const targetIndex = orderedMenus.findIndex(
            (menu) => menu.id === targetId,
        );

        if (sourceIndex === -1 || targetIndex === -1) {
            return;
        }

        const nextMenus = [...orderedMenus];
        const [sourceMenu] = nextMenus.splice(sourceIndex, 1);
        nextMenus.splice(targetIndex, 0, sourceMenu);

        setOrderedMenus(nextMenus);
        onReorder(nextMenus.map((menu) => menu.id));
    }

    return (
        <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <tr>
                        <th className="w-12 px-4 py-3 text-center">No</th>
                        <th className="w-12 px-4 py-3 text-center">Drag</th>
                        <th className="w-20 px-4 py-3 text-right">Aksi</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Path</th>
                        <th className="px-4 py-3">Icon</th>
                        <th className="px-4 py-3">Submenu</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {orderedMenus.map((menu, index) => (
                        <tr
                            key={menu.id}
                            draggable={canEdit}
                            onDragStart={() => setDraggedMenuId(menu.id)}
                            onDragOver={(event) => {
                                if (!canEdit) {
                                    return;
                                }

                                event.preventDefault();
                            }}
                            onDrop={() => {
                                if (!canEdit || draggedMenuId === null) {
                                    return;
                                }

                                moveMenu(draggedMenuId, menu.id);
                                setDraggedMenuId(null);
                            }}
                            onDragEnd={() => setDraggedMenuId(null)}
                            className="transition-colors hover:bg-muted/20"
                        >
                            <td className="px-4 py-3 text-center text-muted-foreground">
                                {index + 1}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                {canEdit || canDelete ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="ml-auto"
                                                aria-label={`Aksi ${menu.name}`}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {canEdit ? (
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(menu)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            ) : null}
                                            {canDelete ? (
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        onDelete(menu)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            ) : null}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : null}
                            </td>
                            <td className="px-4 py-3 font-medium">
                                {menu.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                                {menu.path}
                            </td>
                            <td className="px-4 py-3">{menu.icon}</td>
                            <td className="px-4 py-3">
                                {menu.has_children ? 'Yes' : 'No'}
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        menu.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {menu.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
