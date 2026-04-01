import { router } from '@inertiajs/react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Search,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import { EditEventDialog } from '@/components/events/edit-event-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export type EventRow = {
    id: number;
    title: string;
    description?: string | null;
    starts_at: string;
    status: 'Upcoming' | 'Passed';
};

export type EventsPagination = {
    total?: number;
    page?: number;
    rows?: number;
    sortField?: string | null;
    sortOrder?: number | null;
    search?: string;
};

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function EventsTable({
    events,
    pagination,
}: {
    events: EventRow[];
    pagination: EventsPagination;
}) {
    const [sorting, setSorting] = useState<SortingState>(
        pagination.sortField
            ? [{ id: pagination.sortField, desc: pagination.sortOrder === -1 }]
            : [],
    );
    const [globalFilter, setGlobalFilter] = useState(pagination.search ?? '');
    const debounceRef = useRef<number | null>(null);
    const rowsPerPage = pagination.rows ?? 10;
    const currentPage = pagination.page ?? 1;
    const [editOpen, setEditOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);

    const columns: ColumnDef<EventRow>[] = useMemo(
        () => [
            {
                id: 'row_number',
                header: '#',
                cell: ({ row }: { row: Row<EventRow> }) =>
                    (currentPage - 1) * rowsPerPage + row.index + 1,
            },
            {
                id: 'title',
                accessorKey: 'title',
                header: () => (
                    <Button
                        variant="ghost"
                        className="-ml-3 justify-start px-2"
                        onClick={() => {
                            const isAsc =
                                pagination.sortField === 'title'
                                    ? pagination.sortOrder !== -1
                                    : false;
                            router.get(
                                EventController.index.url(),
                                {
                                    page: 1,
                                    rows: pagination.rows ?? 10,
                                    sortField: 'title',
                                    sortOrder: isAsc ? -1 : 1,
                                    search: globalFilter ?? '',
                                },
                                { preserveState: true, preserveScroll: true },
                            );
                        }}
                    >
                        Title{' '}
                        {pagination.sortField === 'title' ? (
                            pagination.sortOrder === -1 ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                                <ChevronUp className="ml-2 h-4 w-4" />
                            )
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => (
                    <a
                        href={EventController.show.url(row.original.id)}
                        className="font-medium underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-current dark:decoration-neutral-600"
                    >
                        {row.original.title}
                    </a>
                ),
            },
            {
                id: 'starts_at',
                accessorKey: 'starts_at',
                header: () => (
                    <Button
                        variant="ghost"
                        className="-ml-3 justify-start px-2"
                        onClick={() => {
                            const isAsc =
                                pagination.sortField === 'starts_at'
                                    ? pagination.sortOrder !== -1
                                    : true;
                            router.get(
                                EventController.index.url(),
                                {
                                    page: 1,
                                    rows: pagination.rows ?? 10,
                                    sortField: 'starts_at',
                                    sortOrder: isAsc ? -1 : 1,
                                    search: globalFilter ?? '',
                                },
                                { preserveState: true, preserveScroll: true },
                            );
                        }}
                    >
                        Date & time{' '}
                        {pagination.sortField === 'starts_at' ? (
                            pagination.sortOrder === -1 ? (
                                <ChevronDown className="ml-2 h-4 w-4" />
                            ) : (
                                <ChevronUp className="ml-2 h-4 w-4" />
                            )
                        ) : (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="whitespace-nowrap">
                        {formatDateTime(row.original.starts_at)}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.status === 'Upcoming'
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {row.original.status}
                    </Badge>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <a href={EventController.show.url(row.original.id)}>
                                    View
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedEvent(row.original);
                                    setEditOpen(true);
                                }}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    setDeleteTarget(row.original);
                                    setDeleteOpen(true);
                                }}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [
            currentPage,
            globalFilter,
            rowsPerPage,
            pagination.rows,
            pagination.sortField,
            pagination.sortOrder,
        ],
    );

    const table = useReactTable({
        data: events,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
    });

    const total = pagination.total ?? events.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    return (
        <div className="space-y-4">
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete event?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete{' '}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.title ?? 'this event'}
                            </span>
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => {
                                if (!deleteTarget) return;
                                router.delete(
                                    EventController.destroy.url(deleteTarget.id),
                                    {
                                        preserveScroll: true,
                                        onFinish: () => {
                                            setDeleteOpen(false);
                                            setDeleteTarget(null);
                                        },
                                    },
                                );
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <EditEventDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                event={
                    selectedEvent
                        ? {
                              id: selectedEvent.id,
                              title: selectedEvent.title,
                              description: selectedEvent.description ?? null,
                              starts_at: selectedEvent.starts_at,
                          }
                        : null
                }
            />
            <div className="flex items-center justify-between gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search events..."
                        value={globalFilter ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setGlobalFilter(val);
                            if (debounceRef.current) {
                                window.clearTimeout(debounceRef.current);
                            }
                            debounceRef.current = window.setTimeout(() => {
                                router.get(
                                    EventController.index.url(),
                                    {
                                        page: 1,
                                        rows: pagination.rows ?? 10,
                                        sortField: pagination.sortField ?? undefined,
                                        sortOrder: pagination.sortOrder ?? undefined,
                                        search: val,
                                    },
                                    { preserveState: true, preserveScroll: true },
                                );
                            }, 350);
                        }}
                        className="pr-8 pl-9"
                    />
                </div>
            </div>

            <div className="overflow-auto rounded-md border">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <TableHead
                                        key={header.id}
                                        className={[
                                            'text-left',
                                            index === 0 ? 'w-[64px] pl-6' : '',
                                            header.id === 'title' ? 'w-[420px]' : '',
                                            header.id === 'starts_at'
                                                ? 'w-[220px] whitespace-nowrap'
                                                : '',
                                            header.id === 'status' ? 'w-[120px]' : '',
                                            header.id === 'actions'
                                                ? 'w-[96px] pr-6 text-right'
                                                : '',
                                        ].join(' ')}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            key={cell.id}
                                            className={[
                                                'text-left',
                                                index === 0 ? 'pl-6' : '',
                                                cell.column.id === 'title'
                                                    ? 'w-[420px] max-w-[420px] truncate'
                                                    : '',
                                                cell.column.id === 'starts_at'
                                                    ? 'whitespace-nowrap'
                                                    : '',
                                                cell.column.id === 'actions'
                                                    ? 'pr-6 text-right'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No events found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-2">
                <div className="text-muted-foreground text-sm">
                    Showing {events.length} of {total} event{total !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-muted-foreground mr-2 text-sm">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.get(
                                EventController.index.url(),
                                {
                                    page: Math.max(1, currentPage - 1),
                                    rows: pagination.rows ?? 10,
                                    sortField: pagination.sortField ?? undefined,
                                    sortOrder: pagination.sortOrder ?? undefined,
                                    search: globalFilter ?? '',
                                },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        disabled={currentPage <= 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.get(
                                EventController.index.url(),
                                {
                                    page: currentPage + 1,
                                    rows: pagination.rows ?? 10,
                                    sortField: pagination.sortField ?? undefined,
                                    sortOrder: pagination.sortOrder ?? undefined,
                                    search: globalFilter ?? '',
                                },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

