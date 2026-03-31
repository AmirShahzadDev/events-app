<?php

namespace App\Services;

use App\Jobs\SendEventReminderJob;
use App\Models\Event;

class EventReminderScheduler
{
    public function schedule(Event $event): void
    {
        SendEventReminderJob::dispatch(
            eventId: $event->id,
            scheduledStartsAt: $event->starts_at,
        )
            ->delay($event->starts_at);
    }
}
