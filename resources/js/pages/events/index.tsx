import { Head, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import { AddEventDialog } from '@/components/events/add-event-dialog';
import { EventsTable, type EventsPagination, type EventRow } from '@/components/events/events-table';
import { Button } from '@/components/ui/button';

export default function EventsIndex({
    events,
    pagination,
}: {
    events: EventRow[];
    pagination: EventsPagination;
}) {
    return (
        <>
            <Head title="Events" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-foreground text-3xl font-bold tracking-tight">
                            Events
                        </h1>
                        <p className="text-muted-foreground">
                            Create events and receive email reminders.
                        </p>
                    </div>

                    <AddEventDialog />
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card relative flex-1 overflow-hidden rounded-xl border">
                    <div className="p-6">
                        <EventsTable events={events} pagination={pagination} />
                    </div>
                </div>
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Events',
            href: EventController.index.url(),
        },
    ],
};

