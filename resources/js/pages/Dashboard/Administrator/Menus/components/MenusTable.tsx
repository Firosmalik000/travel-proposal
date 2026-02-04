import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pencil, Trash2 } from 'lucide-react';

export interface Menu {
    id: number;
    name: string;
    menu_key: string;
    path: string;
    icon: string;
    children?: any[] | null;
    has_children?: boolean;
    order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    menus: Menu[];
    onEdit: (menu: Menu) => void;
    onDelete: (menu: Menu) => void;
}

export function MenusTable({ menus, onEdit, onDelete }: Props) {
    const columns: ColumnDef<Menu>[] = [
        {
            id: 'number',
            header: () => <div className="w-12 text-center">No</div>,
            cell: ({ row }) => (
                <div className="text-center font-medium">{row.index + 1}</div>
            ),
            enableSorting: false,
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => {
                const menu = row.original;
                return (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(menu)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(menu)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('name')}</div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'path',
            header: 'Path',
            cell: ({ row }) => (
                <div className="font-mono text-xs">{row.getValue('path')}</div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'icon',
            header: 'Icon',
            enableSorting: true,
        },
        {
            accessorKey: 'has_children',
            header: 'Has Children',
            cell: ({ row }) => {
                const hasChildren = row.getValue('has_children');
                return hasChildren ? 'Yes' : 'No';
            },
            enableSorting: true,
        },
        {
            accessorKey: 'order',
            header: 'Order',
            enableSorting: true,
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active');
                return (
                    <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
            enableSorting: true,
        },
    ];

    return <DataTable columns={columns} data={menus} searchKey="name" searchPlaceholder="Cari menu..." />;
}
