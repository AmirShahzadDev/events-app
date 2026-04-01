<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use App\Services\EventService;
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
    public function index(Request $request, EventService $service): Response
    {
        $data = $service->listForIndex(
            $request->user(),
            $request->only(['page', 'rows', 'sortField', 'sortOrder', 'search']),
        );

        return Inertia::render('events/index', [
            'events' => $data['events'],
            'pagination' => $data['pagination'],
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
    public function store(StoreEventRequest $request, EventService $service): RedirectResponse
    {
        $service->create($request->user(), $request->validated());

        return back()->with('success', 'Event created successfully.');
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
    public function update(UpdateEventRequest $request, Event $event, EventService $service): RedirectResponse
    {
        $service->update($event, $request->validated());

        return back()->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event, EventService $service): RedirectResponse
    {
        $service->delete($event);

        return to_route('events.index')->with('success', 'Event deleted successfully.');
    }
}
