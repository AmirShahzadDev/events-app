import { Head, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
    return (
        <>
            <Head title={event.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title={event.title} description="Event details" />
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={event.status === 'Upcoming' ? 'default' : 'secondary'}
                        >
                            {event.status}
                        </Badge>
                        <Button variant="outline" asChild>
                            <Link href={EventController.index.url()}>Back</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                                {formatDateTime(event.starts_at)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={EventController.edit.url(event.id)}>
                                        Edit
                                    </Link>
                                </Button>
                                <Button variant="destructive" asChild>
                                    <Link
                                        href={EventController.destroy.url(event.id)}
                                        method="delete"
                                        as="button"
                                    >
                                        Delete
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {event.description ? (
                                <p className="whitespace-pre-wrap text-sm">
                                    {event.description}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No description.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="text-sm font-medium">
                                Reminder status
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {event.status === 'Upcoming'
                                ? 'An email reminder will be sent at the scheduled time.'
                                : 'This event has already passed.'}
                        </CardContent>
                    </Card>
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

