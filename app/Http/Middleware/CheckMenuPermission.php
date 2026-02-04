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

        if (!$user) {
            return redirect()->route('login');
        }

        // Get current path
        $currentPath = $request->path();

        // Find menu by path - check both exact path and nested paths
        $menu = Menu::where('path', '/' . $currentPath)->first();

        if (!$menu) {
            // If exact path not found, try to find by checking all menus and their children
            $allMenus = Menu::all();
            foreach ($allMenus as $menuItem) {
                // Check if path matches
                if ($menuItem->path === '/' . $currentPath) {
                    $menu = $menuItem;
                    break;
                }

                // Check children (level 1)
                if (!empty($menuItem->children)) {
                    foreach ($menuItem->children as $child) {
                        if (isset($child['path']) && $child['path'] === '/' . $currentPath) {
                            // Found in children, use child's menu_key
                            $menu = (object)[
                                'menu_key' => $child['menu_key'] ?? null,
                                'path' => $child['path'],
                            ];
                            break 2;
                        }

                        // Check grandchildren (level 2)
                        if (!empty($child['children'])) {
                            foreach ($child['children'] as $grandChild) {
                                if (isset($grandChild['path']) && $grandChild['path'] === '/' . $currentPath) {
                                    $menu = (object)[
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

        if (!$menu || !isset($menu->menu_key)) {
            // Menu not found in database, allow access (might be a dynamic route or public route)
            return $next($request);
        }

        // Check if user has the required permission using new JSON structure
        $hasPermission = UserAccess::hasPermission($user->id, $menu->menu_key, $permission);

        if (!$hasPermission) {
            // Return JSON response for API requests, redirect for web requests
            if ($request->expectsJson()) {
                abort(403, 'Anda tidak memiliki permission "' . $permission . '" untuk mengakses resource ini.');
            }

            abort(403, 'Anda tidak memiliki akses untuk ' . $this->getPermissionLabel($permission) . ' pada halaman ini.');
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
}
