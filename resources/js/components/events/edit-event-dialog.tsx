import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import EventController from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export type EditableEvent = {
    id: number;
    title: string;
    description: string | null;
    starts_at: string;
};

function toDateTimeLocalValue(iso: string): string {
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function EditEventDialog({
    open,
    onOpenChange,
    event,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: EditableEvent | null;
}) {
    const defaults = useMemo(
        () => ({
            title: event?.title ?? '',
            starts_at: event?.starts_at ? toDateTimeLocalValue(event.starts_at) : '',
            description: event?.description ?? '',
        }),
        [event],
    );

    const form = useForm({
        title: defaults.title,
        starts_at: defaults.starts_at,
        description: defaults.description,
    });

    useEffect(() => {
        form.setData({
            title: defaults.title,
            starts_at: defaults.starts_at,
            description: defaults.description,
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaults.title, defaults.starts_at, defaults.description]);

    const handleOpen = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            form.reset();
            form.clearErrors();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Edit event</DialogTitle>
                    <DialogDescription>
                        Update event details. The reminder will be rescheduled.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="grid gap-4"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!event) return;
                        form.put(EventController.update.url(event.id), {
                            preserveScroll: true,
                            onSuccess: () => handleOpen(false),
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="edit_title">Title *</Label>
                        <Input
                            id="edit_title"
                            name="title"
                            required
                            maxLength={255}
                            placeholder="Team meetup"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            aria-invalid={Boolean(form.errors.title)}
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_starts_at">Date & time *</Label>
                        <Input
                            id="edit_starts_at"
                            name="starts_at"
                            type="datetime-local"
                            required
                            value={form.data.starts_at}
                            onChange={(e) => form.setData('starts_at', e.target.value)}
                            aria-invalid={Boolean(form.errors.starts_at)}
                        />
                        <InputError message={form.errors.starts_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_description">Description *</Label>
                        <Textarea
                            id="edit_description"
                            name="description"
                            required
                            placeholder="Optional details…"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            aria-invalid={Boolean(form.errors.description)}
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpen(false)}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing || !event}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

