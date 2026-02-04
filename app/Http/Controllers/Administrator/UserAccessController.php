<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;  

class UserAccessController extends Controller
{
    /**
     * Display a listing of user accesses.
     */
    public function index(): Response
    {
        // Get all users with their access data
        $userAccesses = UserAccess::with('user')
            ->get()
            ->map(function ($access) {
                // Transform access from object format to array format for frontend
                // From: { menu_key: { view: true, create: true } }
                // To: { menu_key: ['view', 'create'] }
                $transformedAccess = [];
                if ($access->access) {
                    foreach ($access->access as $menuKey => $permissions) {
                        $transformedAccess[$menuKey] = array_keys(array_filter($permissions, fn($value) => $value === true));
                    }
                }

                return [
                    'id' => $access->id,
                    'user_id' => $access->user_id,
                    'user_name' => $access->user->name,
                    'user_email' => $access->user->email,
                    'access' => $transformedAccess, // JSON array with menu_key => [permissions]
                ];
            });

        $users = User::select('id', 'name', 'email')->get();

        // Get all menus with flattened structure for selection
        $menus = Menu::orderBy('order')->get();
        $flattenedMenus = [];

        foreach ($menus as $menu) {
            // Add parent menu
            $flattenedMenus[] = [
                'id' => $menu->id,
                'name' => $menu->name,
                'menu_key' => $menu->menu_key,
                'path' => $menu->path,
                'level' => 0,
            ];

            // Add children (level 1)
            if (!empty($menu->children)) {
                foreach ($menu->children as $child) {
                    $flattenedMenus[] = [
                        'id' => null,
                        'name' => '  ↳ ' . ($child['name'] ?? ''),
                        'menu_key' => $child['menu_key'] ?? '',
                        'path' => $child['path'] ?? '',
                        'level' => 1,
                    ];

                    // Add grandchildren (level 2)
                    if (!empty($child['children'])) {
                        foreach ($child['children'] as $grandChild) {
                            $flattenedMenus[] = [
                                'id' => null,
                                'name' => '    ↳ ' . ($grandChild['name'] ?? ''),
                                'menu_key' => $grandChild['menu_key'] ?? '',
                                'path' => $grandChild['path'] ?? '',
                                'level' => 2,
                            ];
                        }
                    }
                }
            }
        }

        return Inertia::render('Dashboard/Administrator/UserAccess/Index', [
            'userAccesses' => $userAccesses,
            'users' => $users,
            'menus' => $flattenedMenus, // Send flattened menu list with indentation
        ]);
    }

    /**
     * Store or update user access (entire JSON access object).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'access' => 'required|array', // JSON object: { menu_key: [permissions] }
        ]);

        // Transform access from array format to object format
        // From: { menu_key: ['view', 'create'] }
        // To: { menu_key: { view: true, create: true } }
        $transformedAccess = [];
        foreach ($validated['access'] as $menuKey => $permissions) {
            $transformedAccess[$menuKey] = [];
            foreach ($permissions as $permission) {
                $transformedAccess[$menuKey][$permission] = true;
            }
        }

        // Update or create user access record
        UserAccess::updateOrCreate(
            ['user_id' => $validated['user_id']],
            ['access' => $transformedAccess]
        );

        return redirect()->back()->with('success', 'Hak akses berhasil disimpan');
    }

    /**
     * Update the specified user access.
     */
    public function update(Request $request, UserAccess $userAccess)
    {
        DB::beginTransaction();
        try {
        $validated = $request->validate([
            'access' => 'required|array',
        ]);

        // Transform access from array format to object format
        // From: { menu_key: ['view', 'create'] }
        // To: { menu_key: { view: true, create: true } }
        $transformedAccess = [];
        foreach ($validated['access'] as $menuKey => $permissions) {
            $transformedAccess[$menuKey] = [];
            foreach ($permissions as $permission) {
                $transformedAccess[$menuKey][$permission] = true;
            }
        }

        $userAccess->update(['access' => $transformedAccess]);

        DB::commit();

        return redirect()->back()->with('success', 'Hak akses berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }

    }

    /**
     * Remove the specified user access.
     */
    public function destroy(UserAccess $userAccess)
    {
        $userAccess->delete();

        return redirect()->back()->with('success', 'Hak akses berhasil dihapus');
    }

    /**
     * Check if user has permission for a specific menu and action.
     */
    public function checkPermission(Request $request)
    {
        $validated = $request->validate([
            'menu_key' => 'required|string',
            'permission' => 'required|in:view,create,edit,delete,import,export,approve,reject',
        ]);

        $hasPermission = UserAccess::hasPermission(
            $request->user()->id,
            $validated['menu_key'],
            $validated['permission']
        );

        return response()->json(['has_permission' => $hasPermission]);
    }

    /**
     * Get user's access for a specific menu.
     */
    public function getUserMenuAccess(Request $request, string $menuKey)
    {
        $permissions = UserAccess::getMenuPermissions(
            $request->user()->id,
            $menuKey
        );

        return response()->json(['permissions' => $permissions]);
    }

    /**
     * Grant or update permissions for a specific menu.
     */
    public function grantMenuPermission(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'menu_key' => 'required|string',
            'permissions' => 'required|array',
            'permissions.*' => 'in:view,create,edit,delete,import,export,approve,reject',
        ]);

        UserAccess::grantPermission(
            $validated['user_id'],
            $validated['menu_key'],
            $validated['permissions']
        );

        return redirect()->back()->with('success', 'Permission untuk menu berhasil diperbarui');
    }

    /**
     * Revoke all permissions for a specific menu.
     */
    public function revokeMenuPermission(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'menu_key' => 'required|string',
        ]);

        UserAccess::revokePermission(
            $validated['user_id'],
            $validated['menu_key']
        );

        return redirect()->back()->with('success', 'Permission untuk menu berhasil dihapus');
    }
}
