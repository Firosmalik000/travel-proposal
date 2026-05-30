<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Services\ActivityLogService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class LogAdminActivityMiddleware
{
    public function __construct(private readonly ActivityLogService $activityLogService) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->user()) {
            return $response;
        }

        if (! $this->shouldLogRequest($request, $response->getStatusCode())) {
            return $response;
        }

        $menuContext = $this->resolveMenuContext($request);
        $module = $menuContext['module_key'];
        $menuKey = $menuContext['submenu_key'];
        $eventType = $this->resolveEventType($request);
        $description = $this->buildDescription($request, $eventType, $module);

        $this->activityLogService->logFromRequest(
            request: $request,
            eventType: $eventType,
            description: $description,
            module: $module,
            menuKey: $menuKey,
            properties: $this->buildProperties($request, $response->getStatusCode(), $menuContext),
        );

        return $response;
    }

    private function shouldLogRequest(Request $request, int $statusCode): bool
    {
        if ($statusCode >= 400) {
            return false;
        }

        $path = '/'.$request->path();
        $isAdminPath = str_starts_with($path, '/admin') || str_starts_with($path, '/dashboard');

        if (! $isAdminPath) {
            return false;
        }

        if ($request->is('admin/activity/logs') || $request->is('dashboard/activity/logs')) {
            return false;
        }

        $eventType = $this->resolveEventType($request);

        return in_array($eventType, ['create', 'update', 'delete', 'export', 'import'], true);
    }

    /**
     * @return array{
     *   module_key: string,
     *   submenu_key: string|null,
     *   module_name: string,
     *   submenu_name: string|null
     * }
     */
    private function resolveMenuContext(Request $request): array
    {
        $path = '/'.$request->path();
        $normalizedPath = str_starts_with($path, '/admin')
            ? '/dashboard'.substr($path, strlen('/admin'))
            : $path;

        $fallback = [
            'module_key' => 'dashboard',
            'submenu_key' => null,
            'module_name' => 'Dashboard',
            'submenu_name' => null,
        ];

        $bestMatch = null;
        $bestLen = -1;
        $menus = Menu::query()->get(['menu_key', 'name', 'path', 'children']);
        foreach ($menus as $menu) {
            $menuPath = (string) $menu->path;
            if ($menuPath !== '' && ($menuPath === $normalizedPath || str_starts_with($normalizedPath, rtrim($menuPath, '/').'/'))) {
                if (strlen($menuPath) > $bestLen) {
                    $bestLen = strlen($menuPath);
                    $bestMatch = [
                        'module_key' => (string) $menu->menu_key,
                        'submenu_key' => null,
                        'module_name' => (string) $menu->name,
                        'submenu_name' => null,
                    ];
                }
            }

            foreach ((array) ($menu->children ?? []) as $child) {
                $childPath = (string) ($child['path'] ?? '');
                if ($childPath !== '' && ($childPath === $normalizedPath || str_starts_with($normalizedPath, rtrim($childPath, '/').'/'))) {
                    if (strlen($childPath) > $bestLen) {
                        $bestLen = strlen($childPath);
                        $bestMatch = [
                            'module_key' => (string) $menu->menu_key,
                            'submenu_key' => (string) ($child['menu_key'] ?? $menu->menu_key),
                            'module_name' => (string) $menu->name,
                            'submenu_name' => (string) ($child['name'] ?? null),
                        ];
                    }
                }

                foreach ((array) ($child['children'] ?? []) as $grandChild) {
                    $grandChildPath = (string) ($grandChild['path'] ?? '');
                    if ($grandChildPath !== '' && ($grandChildPath === $normalizedPath || str_starts_with($normalizedPath, rtrim($grandChildPath, '/').'/'))) {
                        if (strlen($grandChildPath) > $bestLen) {
                            $bestLen = strlen($grandChildPath);
                            $bestMatch = [
                                'module_key' => (string) $menu->menu_key,
                                'submenu_key' => (string) ($grandChild['menu_key'] ?? ($child['menu_key'] ?? $menu->menu_key)),
                                'module_name' => (string) $menu->name,
                                'submenu_name' => (string) ($grandChild['name'] ?? ($child['name'] ?? null)),
                            ];
                        }
                    }
                }
            }
        }

        return $bestMatch ?? $fallback;
    }

    private function resolveEventType(Request $request): string
    {
        $routeName = (string) ($request->route()?->getName() ?? '');
        $path = '/'.$request->path();

        if (
            str_contains($routeName, '.export')
            || str_contains($routeName, '.pdf')
            || str_contains($path, '/export')
            || str_contains($path, '.pdf')
        ) {
            return 'export';
        }

        if (str_contains($routeName, '.import') || str_contains($path, '/import')) {
            return 'import';
        }

        return match ($request->method()) {
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'activity',
        };
    }

    private function buildDescription(Request $request, string $eventType, string $module): string
    {
        $routeName = (string) ($request->route()?->getName() ?? '');
        $verb = match ($eventType) {
            'create' => 'membuat data',
            'update' => 'memperbarui data',
            'delete' => 'menghapus data',
            'export' => 'melakukan export data',
            'import' => 'melakukan import data',
            default => 'melakukan aktivitas',
        };

        return sprintf(
            '%s pada module %s%s',
            ucfirst($verb),
            str_replace('-', ' ', $module),
            $routeName !== '' ? ' (route: '.$routeName.')' : '',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function buildProperties(Request $request, int $statusCode, array $menuContext): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', '_token', 'two_factor_code', 'two_factor_recovery_code'];
        $payload = collect($request->except($sensitiveKeys))
            ->map(fn (mixed $value): mixed => $this->sanitizePayloadValue($value))
            ->all();

        return [
            'status_code' => $statusCode,
            'method' => $request->method(),
            'route_name' => $request->route()?->getName(),
            'path' => $request->path(),
            'query' => $request->query(),
            'payload' => $payload,
            'module_name' => $menuContext['module_name'] ?? null,
            'submenu_name' => $menuContext['submenu_name'] ?? null,
            'module_key' => $menuContext['module_key'] ?? null,
            'submenu_key' => $menuContext['submenu_key'] ?? null,
        ];
    }

    private function sanitizePayloadValue(mixed $value): mixed
    {
        if ($value instanceof UploadedFile) {
            return [
                'original_name' => $value->getClientOriginalName(),
                'mime_type' => $value->getClientMimeType(),
                'size' => $value->getSize(),
            ];
        }

        if (is_array($value)) {
            return collect($value)
                ->take(20)
                ->map(fn (mixed $item): mixed => $this->sanitizePayloadValue($item))
                ->all();
        }

        if (is_string($value) && strlen($value) > 500) {
            return substr($value, 0, 500).'...';
        }

        if (is_object($value)) {
            return (string) get_debug_type($value);
        }

        return $value;
    }
}
