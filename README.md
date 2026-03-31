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

This app queues reminder delivery. Start a worker:

```bash
php artisan queue:work
```

## Scheduler (due reminders)

The scheduler runs `app:send-due-event-reminders` every minute. In production, add a cron entry:

```bash
* * * * * cd /path/to/events-app && php artisan schedule:run >> /dev/null 2>&1
```

## Frontend

- Inertia v3 + React pages live in `resources/js/pages`.
- UI uses shadcn-style components.