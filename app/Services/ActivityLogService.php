<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ActivityLogService
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function log(array $payload): ActivityLog
    {
        return ActivityLog::query()->create([
            'user_id' => $payload['user_id'] ?? null,
            'event_type' => (string) ($payload['event_type'] ?? 'activity'),
            'module' => $payload['module'] ?? null,
            'menu_key' => $payload['menu_key'] ?? null,
            'subject_type' => $payload['subject_type'] ?? null,
            'subject_id' => $payload['subject_id'] ?? null,
            'method' => $payload['method'] ?? null,
            'route_name' => $payload['route_name'] ?? null,
            'url' => $payload['url'] ?? null,
            'description' => $payload['description'] ?? null,
            'properties' => $payload['properties'] ?? null,
            'ip_address' => $payload['ip_address'] ?? null,
            'user_agent' => $payload['user_agent'] ?? null,
            'logged_at' => $payload['logged_at'] ?? Carbon::now(),
        ]);
    }

    public function logFromRequest(
        Request $request,
        string $eventType,
        string $description,
        ?string $module = null,
        ?string $menuKey = null,
        ?User $user = null,
        ?array $properties = null,
    ): ActivityLog {
        return $this->log([
            'user_id' => $user?->id ?? $request->user()?->id,
            'event_type' => $eventType,
            'module' => $module,
            'menu_key' => $menuKey,
            'method' => $request->method(),
            'route_name' => $request->route()?->getName(),
            'url' => $request->path(),
            'description' => $description,
            'properties' => $properties,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'logged_at' => Carbon::now(),
        ]);
    }
}
