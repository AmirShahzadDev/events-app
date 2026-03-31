<?php

namespace App\Jobs;

use App\Models\Event;
use App\Notifications\EventReminderNotification;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendEventReminderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $eventId,
        public CarbonImmutable $scheduledStartsAt,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $event = Event::query()
            ->with('user')
            ->find($this->eventId);

        if (! $event) {
            return;
        }

        if ($event->reminder_sent_at !== null) {
            return;
        }

        if (! $event->starts_at->equalTo($this->scheduledStartsAt)) {
            return;
        }

        if (now()->lt($event->starts_at)) {
            self::dispatch(
                eventId: $event->id,
                scheduledStartsAt: $event->starts_at->toImmutable(),
            )->delay($event->starts_at);

            return;
        }

        $event->user->notify(new EventReminderNotification(
            eventId: $event->id,
            title: $event->title,
            startsAt: $event->starts_at->toImmutable(),
        ));

        $event->forceFill(['reminder_sent_at' => now()])->save();
    }
}
