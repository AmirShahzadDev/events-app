import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatEventDateTime } from '@/lib/format-event-datetime';

export type EventRow = {
    id: number;
    title: string;
    starts_at: string;
    status: 'Upcoming' | 'Passed';
};

export const columns: ColumnDef<EventRow>[] = [
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
            <Link
                href={EventController.show.url(row.original.id)}
                className="font-medium underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-current dark:decoration-neutral-600"
            >
                {row.original.title}
            </Link>
        ),
    },
    {
        accessorKey: 'starts_at',
        header: 'Date & time',
        cell: ({ row }) => (
            <span className="whitespace-nowrap">
                {formatEventDateTime(row.original.starts_at)}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.status === 'Upcoming' ? 'default' : 'secondary'}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        id: 'actions',
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
                        <Link href={EventController.show.url(row.original.id)}>
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={EventController.edit.url(row.original.id)}>
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link
                            href={EventController.destroy.url(row.original.id)}
                            method="delete"
                            as="button"
                            className="w-full text-left text-destructive"
                        >
                            Delete
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

