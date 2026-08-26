<?php

namespace App\Http\Requests\Agent;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPortalRecordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Agent') ?? false;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $statuses = match (true) {
            $this->routeIs('agent.leads.index') => ['pending', 'rejected', 'cancelled'],
            $this->routeIs('agent.bookings.index') => ['registered', 'completed', 'cancelled'],
            $this->routeIs('agent.commissions.*') => ['pending', 'approved', 'paid', 'cancelled'],
            default => [],
        };

        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', Rule::in($statuses)],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
