<?php

use App\Jobs\SendEventReminderJob;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

test('guests are redirected to login when visiting an event deep link', function () {
    $event = Event::factory()->create();

    $this->get(route('events.show', $event))
        ->assertRedirect(route('login'));
});

test('users cannot view events owned by others', function () {
    $event = Event::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user);

    $this->get(route('events.show', $event))->assertForbidden();
});

test('events index is paginated and sorted by starts_at ascending', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $first = Event::factory()->for($user)->create(['title' => 'First', 'starts_at' => now()->addDays(2)]);
    $second = Event::factory()->for($user)->create(['title' => 'Second', 'starts_at' => now()->addDays(1)]);

    $response = $this->get(route('events.index'));

    $response->assertOk();
    $response->assertSeeInOrder(['Second', 'First']);
});

test('users can create an event and a reminder job is queued', function () {
    Queue::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $startsAt = now()->addHour();

    $this->post(route('events.store'), [
        'title' => 'My event',
        'description' => 'Details',
        'starts_at' => $startsAt->toDateTimeString(),
    ])->assertRedirect();

    $event = Event::query()->whereBelongsTo($user)->firstOrFail();

    expect($event->title)->toBe('My event');

    Queue::assertPushed(SendEventReminderJob::class, function (SendEventReminderJob $job) use ($event) {
        return $job->eventId === $event->id;
    });
});

test('event start time must be in the future', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('events.store'), [
        'title' => 'Past event',
        'starts_at' => now()->subMinute()->toDateTimeString(),
    ])->assertSessionHasErrors(['starts_at']);

    $this->assertDatabaseMissing('events', ['title' => 'Past event']);
});

test('description is optional when creating an event', function () {
    Queue::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $startsAt = now()->addHour();

    $this->post(route('events.store'), [
        'title' => 'No description',
        'starts_at' => $startsAt->toDateTimeString(),
    ])->assertRedirect();

    $event = Event::query()->whereBelongsTo($user)->where('title', 'No description')->firstOrFail();

    expect($event->description)->toBeNull();
});

test('users can update title on a passed event without changing start time', function () {
    $user = User::factory()->create();
    $event = Event::factory()->for($user)->create([
        'starts_at' => now()->subDay(),
    ]);

    $this->actingAs($user);

    $this->put(route('events.update', $event), [
        'title' => 'Updated title',
        'description' => 'Added later',
        'starts_at' => $event->starts_at->toDateTimeString(),
    ])->assertRedirect();

    expect($event->fresh()->title)->toBe('Updated title');
    expect($event->fresh()->description)->toBe('Added later');
});
