<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Services\EventReminderScheduler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Event::class, 'event');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->input('page', 1));
        $rowsParam = $request->input('rows', '10');
        $rows = max(1, min(100, (int) $rowsParam));
        $sortField = (string) $request->input('sortField', '');
        $sortOrder = (int) $request->input('sortOrder', 1);
        $search = trim((string) $request->input('search', ''));

        $query = Event::query()
            ->whereBelongsTo($request->user())
            ->select(['id', 'user_id', 'title', 'description', 'starts_at', 'reminder_sent_at', 'created_at']);

        if ($search !== '') {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

            $query->where(function ($q) use ($like) {
                $q->where('title', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        $allowedSorts = ['title', 'starts_at', 'created_at'];
        if ($sortField !== '' && in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortOrder === -1 ? 'desc' : 'asc');
        } else {
            $query->orderBy('starts_at');
        }

        $paginator = $query->paginate($rows, ['*'], 'page', $page)->withQueryString();
        $events = collect($paginator->items());

        return Inertia::render('events/index', [
            'events' => $events->map(fn (Event $event): array => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'starts_at' => $event->starts_at->toIso8601String(),
                'reminder_sent_at' => $event->reminder_sent_at?->toIso8601String(),
                'status' => $event->isPassed() ? 'Passed' : 'Upcoming',
            ]),
            'pagination' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'rows' => $paginator->perPage(),
                'sortField' => $sortField !== '' ? $sortField : null,
                'sortOrder' => $sortField !== '' ? $sortOrder : null,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('events/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEventRequest $request, EventReminderScheduler $scheduler): RedirectResponse
    {
        $event = new Event($request->validated());
        $event->user()->associate($request->user());
        $event->reminder_sent_at = null;
        $event->save();

        $scheduler->schedule($event);

        return to_route('events.show', $event)->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): Response
    {
        return Inertia::render('events/show', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'starts_at' => $event->starts_at->toIso8601String(),
                'status' => $event->isPassed() ? 'Passed' : 'Upcoming',
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event): Response
    {
        return Inertia::render('events/edit', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'starts_at' => $event->starts_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event, EventReminderScheduler $scheduler): RedirectResponse
    {
        $event->fill($request->validated());
        $event->reminder_sent_at = null;
        $event->save();

        $scheduler->schedule($event);

        return to_route('events.show', $event)->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return to_route('events.index')->with('success', 'Event deleted successfully.');
    }
}
