<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Models\UserAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMenuPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The permission to check (view, create, edit, delete, import, export, approve, reject)
     */
    public function handle(Request $request, Closure $next, string $permission = 'view'): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Get current path
        $currentPath = '/'.$request->path();
        $candidatePaths = $this->candidatePaths($currentPath);

        // Find menu by path - check both exact path and nested paths
        $menu = Menu::query()->whereIn('path', $candidatePaths)->first();

        if (! $menu) {
            // If exact path not found, try to find by checking all menus and their children
            $allMenus = Menu::all();
            foreach ($allMenus as $menuItem) {
                // Check if path matches
                if (in_array($menuItem->path, $candidatePaths, true)) {
                    $menu = $menuItem;
                    break;
                }

                // Check children (level 1)
                if (! empty($menuItem->children)) {
                    foreach ($menuItem->children as $child) {
                        if (isset($child['path']) && in_array($child['path'], $candidatePaths, true)) {
                            // Found in children, use child's menu_key
                            $menu = (object) [
                                'menu_key' => $child['menu_key'] ?? null,
                                'path' => $child['path'],
                            ];
                            break 2;
                        }

                        // Check grandchildren (level 2)
                        if (! empty($child['children'])) {
                            foreach ($child['children'] as $grandChild) {
                                if (isset($grandChild['path']) && in_array($grandChild['path'], $candidatePaths, true)) {
                                    $menu = (object) [
                                        'menu_key' => $grandChild['menu_key'] ?? null,
                                        'path' => $grandChild['path'],
                                    ];
                                    break 3;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (! $menu || ! isset($menu->menu_key)) {
            // Menu not found in database, allow access (might be a dynamic route or public route)
            return $next($request);
        }

        // Check if user has the required permission using new JSON structure
        $menuKey = $this->normalizeMenuKey((string) $menu->menu_key);
        $hasPermission = UserAccess::hasPermission($user->id, $menuKey, $permission);

        if (! $hasPermission) {
            // Return JSON response for API requests, redirect for web requests
            if ($request->expectsJson()) {
                abort(403, 'Anda tidak memiliki permission "'.$permission.'" untuk mengakses resource ini.');
            }

            abort(403, 'Anda tidak memiliki akses untuk '.$this->getPermissionLabel($permission).' pada halaman ini.');
        }

        return $next($request);
    }

    /**
     * Get permission label in Indonesian
     */
    private function getPermissionLabel(string $permission): string
    {
        $labels = [
            'view' => 'melihat',
            'create' => 'membuat data',
            'edit' => 'mengubah data',
            'delete' => 'menghapus data',
            'import' => 'import data',
            'export' => 'export data',
            'approve' => 'menyetujui',
            'reject' => 'menolak',
        ];

        return $labels[$permission] ?? $permission;
    }

    /**
     * @return array<int, string>
     */
    private function candidatePaths(string $currentPath): array
    {
        $paths = [$currentPath];

        if ($currentPath === '/dashboard/website-management/landing') {
            $paths[] = '/dashboard/website-management/content';
        }

        if ($currentPath === '/dashboard/website-management/content') {
            $paths[] = '/dashboard/website-management/landing';
        }

        if ($currentPath === '/dashboard/website-management/schedules') {
            $paths[] = '/dashboard/product-management/packages';
        }

        if ($currentPath === '/dashboard/product-management/products') {
            $paths[] = '/dashboard/website-management/products';
        }

        if ($currentPath === '/dashboard/product-management/categories') {
            $paths[] = '/dashboard/product-management/products';
        }

        if ($currentPath === '/dashboard/product-management/packages') {
            $paths[] = '/dashboard/website-management/packages';
        }

        return $paths;
    }

    private function normalizeMenuKey(string $menuKey): string
    {
        return match ($menuKey) {
            'content_management' => 'landing_page',
            'schedule_management' => 'package',
            'product_category' => 'product',
            default => $menuKey,
        };
    }
}
