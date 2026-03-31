import { Form, Link } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function toDateTimeLocalValue(iso: string): string {
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function EventForm({
    variant,
    event,
}: {
    variant: 'create' | 'edit';
    event?: {
        id: number;
        title: string;
        description: string | null;
        starts_at: string;
    };
}) {
    const form =
        variant === 'create'
            ? EventController.store.form()
            : EventController.update.form(event!.id);

    const defaults = {
        title: event?.title ?? '',
        description: event?.description ?? '',
        starts_at: event?.starts_at ? toDateTimeLocalValue(event.starts_at) : '',
    };

    return (
        <Form
            {...form}
            className="space-y-6"
            options={{ preserveScroll: true }}
        >
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            maxLength={255}
                            defaultValue={defaults.title}
                            placeholder="Team meetup"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="starts_at">Date & time</Label>
                        <Input
                            id="starts_at"
                            name="starts_at"
                            type="datetime-local"
                            required
                            defaultValue={defaults.starts_at}
                        />
                        <InputError message={errors.starts_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={defaults.description}
                            placeholder="Optional details…"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {variant === 'create' ? 'Create event' : 'Save changes'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={EventController.index.url()}>Cancel</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

