import { Head, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import EventForm from '@/pages/events/_form';

export default function EventsCreate() {
    return (
        <>
            <Head title="Create event" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Create event"
                        description="Set a future date & time to receive a reminder."
                    />
                    <Button variant="outline" asChild>
                        <Link href={EventController.index.url()}>Back</Link>
                    </Button>
                </div>

                <div className="max-w-2xl">
                    <EventForm variant="create" />
                </div>
            </div>
        </>
    );
}

EventsCreate.layout = {
    breadcrumbs: [
        { title: 'Events', href: EventController.index.url() },
        { title: 'Create', href: EventController.create.url() },
    ],
};

