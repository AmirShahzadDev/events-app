<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;

class EventService
{
    public function __construct(public EventReminderScheduler $scheduler) {}

    /**
     * @param  array{page?:mixed,rows?:mixed,sortField?:mixed,sortOrder?:mixed,search?:mixed}  $params
     * @return array{events:array<int, array{id:int,title:string,description:string|null,starts_at:string,reminder_sent_at:string|null,status:'Upcoming'|'Passed'}>, pagination:array{total:int,page:int,rows:int,sortField:string|null,sortOrder:int|null,search:string}}
     */
    public function listForIndex(User $user, array $params): array
    {
        $page = max(1, (int) ($params['page'] ?? 1));
        $rowsParam = (string) ($params['rows'] ?? '10');
        $rows = max(1, min(100, (int) $rowsParam));
        $sortField = (string) ($params['sortField'] ?? '');
        $sortOrder = (int) ($params['sortOrder'] ?? 1);
        $search = trim((string) ($params['search'] ?? ''));

        $paginator = Event::query()
            ->ownedBy($user)
            ->select(Event::indexSelectColumns())
            ->search($search)
            ->applySorting($sortField !== '' ? $sortField : null, $sortOrder)
            ->paginate($rows, ['*'], 'page', $page)
            ->withQueryString();

        /** @var array<int, Event> $items */
        $items = $paginator->items();

        return [
            'events' => collect($items)->map(fn (Event $event): array => $event->toIndexRow())->all(),
            'pagination' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'rows' => $paginator->perPage(),
                'sortField' => $sortField !== '' ? $sortField : null,
                'sortOrder' => $sortField !== '' ? $sortOrder : null,
                'search' => $search,
            ],
        ];
    }

    /**
     * @param  array{title:string,description:string,starts_at:mixed}  $data
     */
    public function create(User $user, array $data): Event
    {
        $event = new Event($data);
        $event->user()->associate($user);

        return $this->saveAndSchedule($event);
    }

    /**
     * @param  array{title:string,description:string,starts_at:mixed}  $data
     */
    public function update(Event $event, array $data): Event
    {
        $event->fill($data);

        return $this->saveAndSchedule($event);
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }

    private function saveAndSchedule(Event $event): Event
    {
        $event->reminder_sent_at = null;
        $event->save();

        $this->scheduler->schedule($event);

        return $event;
    }
}
