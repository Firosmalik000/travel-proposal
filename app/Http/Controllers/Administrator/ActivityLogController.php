<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search')->value());
        $module = (string) $request->string('module')->value();
        $userId = $request->integer('user_id');
        $dateFrom = (string) $request->string('date_from')->value();
        $dateTo = (string) $request->string('date_to')->value();
        $menus = Menu::query()->get(['menu_key', 'name', 'path', 'children']);

        $logs = ActivityLog::query()
            ->with('user:id,name,email')
            ->where('event_type', '!=', 'login')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner
                        ->where('description', 'like', '%'.$search.'%')
                        ->orWhere('event_type', 'like', '%'.$search.'%')
                        ->orWhere('module', 'like', '%'.$search.'%')
                        ->orWhere('menu_key', 'like', '%'.$search.'%')
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery
                                ->where('name', 'like', '%'.$search.'%')
                                ->orWhere('email', 'like', '%'.$search.'%');
                        });
                });
            })
            ->when($module !== '' && $module !== 'all', function ($query) use ($module): void {
                $query->where('module', $module);
            })
            ->when($userId > 0, function ($query) use ($userId): void {
                $query->where('user_id', $userId);
            })
            ->when($dateFrom !== '', function ($query) use ($dateFrom): void {
                $query->whereDate('logged_at', '>=', $dateFrom);
            })
            ->when($dateTo !== '', function ($query) use ($dateTo): void {
                $query->whereDate('logged_at', '<=', $dateTo);
            })
            ->latest('logged_at')
            ->paginate(15)
            ->withQueryString()
            ->through(function (ActivityLog $log) use ($menus): array {
                $resolved = $this->resolveMenuAndSubmenu(
                    url: (string) ($log->url ?? ''),
                    menus: $menus->all(),
                    fallbackModule: (string) ($log->properties['module_name'] ?? $log->module ?? '-'),
                    fallbackSubmenu: (string) ($log->properties['submenu_name'] ?? $log->menu_key ?? '-'),
                );

                return [
                    'id' => $log->id,
                    'actor_name' => (string) ($log->user?->name ?? 'System'),
                    'event_type' => $log->event_type,
                    'module' => (string) ($log->module ?? '-'),
                    'menu_key' => (string) ($log->menu_key ?? '-'),
                    'module_label' => $this->humanize($resolved['module']),
                    'submenu_label' => $this->humanize($resolved['submenu']),
                    'description' => (string) ($log->description ?? '-'),
                    'ip_address' => (string) ($log->ip_address ?? '-'),
                    'user_agent' => (string) ($log->user_agent ?? '-'),
                    'logged_at' => $log->logged_at?->toDateTimeString(),
                    'route_name' => (string) ($log->route_name ?? '-'),
                    'method' => (string) ($log->method ?? '-'),
                    'properties' => $log->properties ?? [],
                ];
            });

        $moduleOptions = ActivityLog::query()
            ->select('module')
            ->distinct()
            ->whereNotNull('module')
            ->where('module', '<>', '')
            ->orderBy('module')
            ->pluck('module')
            ->map(fn (string $item): array => [
                'value' => $item,
                'label' => str_replace(['-', '_'], ' ', ucfirst($item)),
            ])
            ->values()
            ->all();

        $users = User::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
            ])
            ->values()
            ->all();

        return Inertia::render('Dashboard/Activity/Logs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'module' => $module !== '' ? $module : 'all',
                'user_id' => $userId > 0 ? $userId : null,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'moduleOptions' => $moduleOptions,
            'users' => $users,
        ]);
    }

    private function humanize(string $value): string
    {
        if ($value === '' || $value === '-') {
            return '-';
        }

        return str_replace(['-', '_'], ' ', ucfirst($value));
    }

    /**
     * @param  array<int, Menu>  $menus
     * @return array{module: string, submenu: string}
     */
    private function resolveMenuAndSubmenu(string $url, array $menus, string $fallbackModule, string $fallbackSubmenu): array
    {
        $normalized = '/'.ltrim($url, '/');
        $normalized = str_starts_with($normalized, '/admin')
            ? '/dashboard'.substr($normalized, strlen('/admin'))
            : $normalized;

        $best = null;
        $bestLen = -1;

        foreach ($menus as $menu) {
            $menuPath = (string) $menu->path;
            if ($menuPath !== '' && ($menuPath === $normalized || str_starts_with($normalized, rtrim($menuPath, '/').'/'))) {
                if (strlen($menuPath) > $bestLen) {
                    $bestLen = strlen($menuPath);
                    $best = ['module' => (string) $menu->name, 'submenu' => (string) $menu->name];
                }
            }

            foreach ((array) ($menu->children ?? []) as $child) {
                $childPath = (string) ($child['path'] ?? '');
                if ($childPath !== '' && ($childPath === $normalized || str_starts_with($normalized, rtrim($childPath, '/').'/'))) {
                    if (strlen($childPath) > $bestLen) {
                        $bestLen = strlen($childPath);
                        $best = [
                            'module' => (string) $menu->name,
                            'submenu' => (string) ($child['name'] ?? $menu->name),
                        ];
                    }
                }

                foreach ((array) ($child['children'] ?? []) as $grandChild) {
                    $grandPath = (string) ($grandChild['path'] ?? '');
                    if ($grandPath !== '' && ($grandPath === $normalized || str_starts_with($normalized, rtrim($grandPath, '/').'/'))) {
                        if (strlen($grandPath) > $bestLen) {
                            $bestLen = strlen($grandPath);
                            $best = [
                                'module' => (string) $menu->name,
                                'submenu' => (string) ($grandChild['name'] ?? ($child['name'] ?? $menu->name)),
                            ];
                        }
                    }
                }
            }
        }

        return $best ?? ['module' => $fallbackModule, 'submenu' => $fallbackSubmenu];
    }
}
