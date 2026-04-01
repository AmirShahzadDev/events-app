import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import Heading from '@/components/heading';
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, Pencil, Trash2 } from 'lucide-react';

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export default function EventsShow({
    event,
}: {
    event: {
        id: number;
        title: string;
        description: string | null;
        starts_at: string;
        status: 'Upcoming' | 'Passed';
    };
}) {
    const isUpcoming = event.status === 'Upcoming';
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <Head title={event.title} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <EditEventDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    event={{
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        starts_at: event.starts_at,
                    }}
                />
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-1">
                        <Heading title={event.title} description="Event details" />
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <CalendarClock className="h-4 w-4" />
                            <span className="whitespace-nowrap">
                                {formatDateTime(event.starts_at)}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                                {event.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={EventController.index.url()}>Back</Link>
                        </Button>
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil />
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete event?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete{' '}
                                        <span className="font-medium text-foreground">
                                            {event.title}
                                        </span>
                                        .
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                        asChild
                                    >
                                        <Link
                                            href={EventController.destroy.url(event.id)}
                                            method="delete"
                                            as="button"
                                        >
                                            Delete
                                        </Link>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card relative flex-1 overflow-hidden rounded-xl border">
                    <div className="grid gap-4 p-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="text-sm font-medium">
                                    Description
                                </div>
                            </CardHeader>
                            <CardContent>
                                {event.description ? (
                                    <p className="whitespace-pre-wrap text-sm leading-6">
                                        {event.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No description.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="text-sm font-medium">
                                    Status
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">
                                        Reminder
                                    </div>
                                    <div className="mt-1">
                                        {isUpcoming
                                            ? 'An email reminder will be sent at the scheduled time.'
                                            : 'This event has already passed.'}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-muted-foreground">
                                        When
                                    </div>
                                    <div className="mt-1 whitespace-nowrap">
                                        {formatDateTime(event.starts_at)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

EventsShow.layout = {
    breadcrumbs: [
        { title: 'Events', href: EventController.index.url() },
        { title: 'Details', href: '' },
    ],
};

