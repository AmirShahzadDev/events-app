import { Head, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/pages/events/data-table';
import { columns, EventRow } from '@/pages/events/columns';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export default function EventsIndex({
    events,
}: {
    events: {
        data: EventRow[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
}) {
    const previous = events.links.at(0)?.url ?? null;
    const next = events.links.at(-1)?.url ?? null;

    return (
        <>
            <Head title="Events" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Events"
                        description="Create events and receive email reminders."
                    />

                    <Button asChild>
                        <Link href={EventController.create.url()}>
                            New event
                        </Link>
                    </Button>
                </div>

                <DataTable columns={columns} data={events.data} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        {events.total === 0
                            ? 'No events'
                            : `Showing ${events.from}-${events.to} of ${events.total}`}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            disabled={!previous}
                            asChild={!!previous}
                        >
                            {previous ? (
                                <Link href={previous}>Previous</Link>
                            ) : (
                                <span>Previous</span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!next}
                            asChild={!!next}
                        >
                            {next ? <Link href={next}>Next</Link> : <span>Next</span>}
                        </Button>
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

