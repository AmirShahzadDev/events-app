<?php

namespace App\Notifications;

use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public int $eventId,
        public string $title,
        public CarbonImmutable $startsAt,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $eventUrl = route('events.show', $this->eventId);

        $startsAtDisplay = $this->startsAt
            ->timezone(config('app.timezone'))
            ->format('M j, Y \a\t g:i A');

        return (new MailMessage)
            ->subject('Event reminder: '.$this->title)
            ->line('Your event is starting now.')
            ->line('Title: '.$this->title)
            ->line('Starts at: '.$startsAtDisplay)
            ->action('View event', $eventUrl);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'event_id' => $this->eventId,
            'title' => $this->title,
            'starts_at' => $this->startsAt->toIso8601String(),
        ];
    }
}
