# Events App (Laravel 13 + Inertia React)

Event reminder application (Laravel Developer Assignment).

## Setup

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate
```

## Development

```bash
npm run dev
php artisan serve
```

## Queues (email reminders)

This app queues reminder delivery. Reminders are sent to the **event owner's email** (the authenticated user who created the event).

The assignment mentions email/SMS; this implementation covers **email reminders** (SMS is not implemented).

Start a worker:

```bash
php artisan queue:work
```

## Scheduler (due reminders)

- **`php artisan schedule:run`** — run this every minute (via cron in production). Laravel checks what is due and runs registered tasks.
- **`app:send-due-event-reminders`** — registered to run **every minute** (`bootstrap/app.php`). It finds events that are **due** (`starts_at <= now`), **not yet sent** (`reminder_sent_at` is null), and **re-schedules** them via `EventReminderScheduler` (safety net if the queue worker was down or a job was missed).
- **Normal path** — on create/update, a **delayed** `SendEventReminderJob` is queued for `starts_at`; the **queue worker** runs it at that time. The scheduler command is **extra insurance**, not the only mechanism.

In production, add a cron entry:

```bash
* * * * * cd /path/to/events-app && php artisan schedule:run >> /dev/null 2>&1
```

## Frontend

- Inertia v3 + React pages live in `resources/js/pages`.
- UI uses shadcn-style components.