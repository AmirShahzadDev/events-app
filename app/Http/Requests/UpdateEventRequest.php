<?php

namespace App\Http\Requests;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:65535'],
            'starts_at' => [
                'required',
                'date',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    /** @var Event $event */
                    $event = $this->route('event');
                    $incoming = Carbon::parse($value);

                    if ($incoming->isFuture()) {
                        return;
                    }

                    if ($event instanceof Event && abs($event->starts_at->getTimestamp() - $incoming->getTimestamp()) < 2) {
                        return;
                    }

                    $fail('The date & time must be in the future.');
                },
            ],
        ];
    }
}
