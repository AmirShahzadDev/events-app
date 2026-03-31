import { Head, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import EventForm from '@/pages/events/_form';

export default function EventsEdit({
    event,
}: {
    event: {
        id: number;
        title: string;
        description: string | null;
        starts_at: string;
    };
}) {
    return (
        <>
            <Head title="Edit event" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Edit event" description="Update event details." />
                    <Button variant="outline" asChild>
                        <Link href={EventController.show.url(event.id)}>Back</Link>
                    </Button>
                </div>

                <div className="max-w-2xl">
                    <EventForm variant="edit" event={event} />
                </div>
            </div>
        </>
    );
}

EventsEdit.layout = {
    breadcrumbs: [
        { title: 'Events', href: EventController.index.url() },
        { title: 'Edit', href: '' },
    ],
};

