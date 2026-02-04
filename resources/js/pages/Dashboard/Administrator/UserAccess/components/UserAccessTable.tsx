import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';

export interface UserAccess {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    access: Record<string, string[]>;
}

interface Menu {
    id: number | null;
    name: string;
    menu_key: string;
    path: string;
    level: number;
}

interface Props {
    userAccesses: UserAccess[];
    menus: Menu[];
    onEdit: (access: UserAccess) => void;
    onDelete: (access: UserAccess) => void;
}

export function UserAccessTable({ userAccesses, menus, onEdit, onDelete }: Props) {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [globalFilter, setGlobalFilter] = useState('');

    const getMenuNameByKey = (menuKey: string): string => {
        const menu = menus.find(m => m.menu_key === menuKey);
        return menu?.name || menuKey;
    };

    const countTotalMenus = (access: Record<string, string[]>): number => {
        return Object.keys(access || {}).length;
    };

    const columns: ColumnDef<UserAccess>[] = [
        {
            id: 'expander',
            header: () => <div className="w-12"></div>,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={row.getToggleExpandedHandler()}
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            ),
            enableSorting: false,
        },
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
            cell: ({ row }) => (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'user_name',
            header: 'User',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.user_email}
                    </p>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'total_menus',
            header: 'Total Menus',
            cell: ({ row }) => (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {countTotalMenus(row.original.access)} menu(s)
                </span>
            ),
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: userAccesses,
        columns,
        state: {
            expanded,
            globalFilter,
        },
        onExpandedChange: setExpanded,
        onGlobalFilterChange: setGlobalFilter,
        getExpandedRowModel: getExpandedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Cari user..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <TableRow data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="bg-muted/50">
                                                <div className="p-4">
                                                    <h4 className="mb-3 font-semibold">Menu Permissions:</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(row.original.access || {}).map(([menuKey, permissions]) => (
                                                            <div key={menuKey} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                                                <span className="font-medium">{getMenuNameByKey(menuKey)}</span>
                                                                <div className="flex gap-3">
                                                                    {['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'].map((perm) => (
                                                                        <div key={perm} className="flex items-center gap-1">
                                                                            <span className={`text-xs ${permissions.includes(perm) ? 'font-medium text-green-600' : 'text-gray-400'}`}>
                                                                                {perm}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} row(s) total.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
