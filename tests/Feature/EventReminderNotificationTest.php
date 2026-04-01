<?php

use App\Models\User;
use App\Notifications\EventReminderNotification;
use Carbon\CarbonImmutable;

test('event reminder email body shows starts at in twelve hour clock', function () {
    config(['app.timezone' => 'UTC']);

    $notification = new EventReminderNotification(
        eventId: 1,
        title: 'Test',
        startsAt: CarbonImmutable::parse('2026-04-01 15:13:00', 'UTC'),
    );

    $mail = $notification->toMail(User::factory()->make());

    expect((string) $mail->render())->toContain('3:13 PM');
});
