<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/** @property Carbon $starts_at */
#[Fillable(['title', 'description', 'starts_at', 'reminder_sent_at'])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    /**
     * @return array<int, string>
     */
    public static function indexSelectColumns(): array
    {
        return ['id', 'user_id', 'title', 'description', 'starts_at', 'reminder_sent_at', 'created_at'];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereBelongsTo($user);
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        $search = trim($search);

        if ($search === '') {
            return $query;
        }

        $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where(function (Builder $q) use ($like): void {
            $q->where('title', 'like', $like)
                ->orWhere('description', 'like', $like);
        });
    }

    public function scopeApplySorting(Builder $query, ?string $sortField, int $sortOrder): Builder
    {
        $allowedSorts = ['title', 'starts_at', 'created_at'];
        $sortField = $sortField !== null ? (string) $sortField : '';

        if ($sortField !== '' && in_array($sortField, $allowedSorts, true)) {
            return $query->orderBy($sortField, $sortOrder === -1 ? 'desc' : 'asc');
        }

        return $query->orderBy('starts_at');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('starts_at');
    }

    /**
     * @return array{id:int,title:string,description:string|null,starts_at:string,reminder_sent_at:string|null,status:'Upcoming'|'Passed'}
     */
    public function toIndexRow(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'starts_at' => $this->starts_at->toIso8601String(),
            'reminder_sent_at' => $this->reminder_sent_at?->toIso8601String(),
            'status' => $this->isPassed() ? 'Passed' : 'Upcoming',
        ];
    }

    public function isPassed(): bool
    {
        return $this->starts_at->isPast();
    }
}
