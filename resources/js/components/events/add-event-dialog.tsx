import { useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function AddEventDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        title: '',
        starts_at: '',
        description: '',
    });

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.reset();
            form.clearErrors();
            form.setData({
                title: '',
                starts_at: '',
                description: '',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>New event</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Create event</DialogTitle>
                    <DialogDescription>
                        Set a future date & time to receive an email reminder.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="grid gap-4"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(EventController.store.url(), {
                            preserveScroll: true,
                            onSuccess: () => handleOpenChange(false),
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
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
                        <Label htmlFor="starts_at">Date & time *</Label>
                        <Input
                            id="starts_at"
                            name="starts_at"
                            type="datetime-local"
                            required
                            value={form.data.starts_at}
                            onChange={(e) =>
                                form.setData('starts_at', e.target.value)
                            }
                            aria-invalid={Boolean(form.errors.starts_at)}
                        />
                        <InputError message={form.errors.starts_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
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
                            onClick={() => handleOpenChange(false)}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create event
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

