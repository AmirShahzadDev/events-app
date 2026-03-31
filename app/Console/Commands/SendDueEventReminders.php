<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Services\EventReminderScheduler;
use Carbon\CarbonImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:send-due-event-reminders')]
#[Description('Dispatch reminders for events that are due.')]
class SendDueEventReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(EventReminderScheduler $scheduler): int
    {
        $now = CarbonImmutable::now();

        Event::query()
            ->whereNull('reminder_sent_at')
            ->where('starts_at', '<=', $now)
            ->orderBy('starts_at')
            ->limit(500)
            ->each(function (Event $event) use ($scheduler): void {
                $scheduler->schedule($event);
            });

        return self::SUCCESS;
    }
}
