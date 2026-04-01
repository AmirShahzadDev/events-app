# Events App (Laravel 13 + Inertia React)

Event reminder application (Laravel Developer Assignment).

**PHP:** **Laravel 13** requires **PHP 8.3 or higher** (this app is developed with PHP 8.4).

**Database:** This project uses **PostgreSQL** in development/production. Set `DB_CONNECTION=pgsql` and the `DB_*` variables in `.env` (see `.env.example`). SQLite in `.env.example` is only a default fallback for quick local runs.

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

## Commands to run

Run **both** for reminders (locally; in production use a **daemon** for the worker + **cron** for the scheduler):

```bash
# 1) Queue worker — processes jobs (delayed reminder, notification mail, etc.)
php artisan queue:work

# 2) Scheduler — pick one:
#    • Development: long-running worker (runs `schedule:run` every minute automatically)
php artisan schedule:work

#    • One-off manual run (or use this in production cron every minute instead of schedule:work)
php artisan schedule:run
```

## Tests

Run the PHP test suite (Pest):

```bash
php artisan test --compact
```

Run a single file or filter:

```bash
php artisan test --compact tests/Feature/EventsTest.php
php artisan test --compact --filter=guests
```

TypeScript check (optional):

```bash
npm run types:check
```

**Development tip:** use **two terminals** — `php artisan queue:work` and `php artisan schedule:work` — so you do not need to type `schedule:run` repeatedly. In production, use **cron** with `schedule:run` (not `schedule:work`).

## Queues (email reminders)

This app queues reminder delivery. Reminders are sent to the **event owner's email** (the authenticated user who created the event).

The assignment mentions email/SMS; this implementation covers **email reminders** (SMS is not implemented).

### Commands you need (scheduler + queue)

These do **different** jobs — use **both** in production:

| What | Command | Purpose |
|------|---------|--------|
| **Queue worker** | `php artisan queue:work` | **Runs** queued jobs (`SendEventReminderJob`, mail notification, etc.). Without this, jobs stay in the queue. |
| **Scheduler (one shot)** | `php artisan schedule:run` | Runs scheduled tasks **once**. Use in **cron** every minute in production. |
| **Scheduler (dev)** | `php artisan schedule:work` | Keeps running and triggers the scheduler **every minute** — good for **local testing** instead of cron. |

- **Local testing:** one terminal `php artisan queue:work`, another `php artisan schedule:work` (or run `schedule:run` manually each minute). **Production:** cron + `queue:work` only.
- **Production:** keep a **supervised** queue worker running 24/7, and add cron **every minute** for `schedule:run` (see below).

## Scheduler (due reminders)

- **`php artisan schedule:run`** — run this every minute (via cron in production). Laravel checks what is due and runs registered tasks.
- **`php artisan schedule:work`** — for **development only**: runs continuously and invokes the scheduler each minute (same idea as cron + `schedule:run`, without setting up cron).
- **`app:send-due-event-reminders`** — registered to run **every minute** (`bootstrap/app.php`). It finds events that are **due** (`starts_at <= now`), **not yet sent** (`reminder_sent_at` is null), and **re-schedules** them via `EventReminderScheduler` (safety net if the queue worker was down or a job was missed).
- **Normal path** — on create/update, a **delayed** `SendEventReminderJob` is queued for `starts_at`; the **queue worker** runs it at that time. The scheduler command is **extra insurance**, not the only mechanism.

In production, add a cron entry (scheduler only — still run `queue:work` separately):

```bash
* * * * * cd /path/to/events-app && php artisan schedule:run >> /dev/null 2>&1
```

## Frontend

- Inertia v3 + React pages live in `resources/js/pages`.
- UI uses shadcn-style components.