<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserAccessController extends Controller
{
    public function index(): Response
    {
        $userAccesses = UserAccess::query()
            ->with('user')
            ->get()
            ->map(fn (UserAccess $access): array => [
                'id' => $access->id,
                'user_id' => $access->user_id,
                'user_name' => $access->user->name,
                'user_email' => $access->user->email,
                'access' => $access->access ?? [],
            ]);

        $users = User::query()->select('id', 'name', 'email')->get();
        $menus = Menu::query()->orderBy('order')->get();
        $flattenedMenus = [];

        foreach ($menus as $menu) {
            $flattenedMenus[] = [
                'id' => $menu->id,
                'name' => $menu->name,
                'menu_key' => $menu->menu_key,
                'path' => $menu->path,
                'level' => 0,
            ];

            foreach ($menu->children ?? [] as $child) {
                $flattenedMenus[] = [
                    'id' => null,
                    'name' => '  -> '.($child['name'] ?? ''),
                    'menu_key' => $child['menu_key'] ?? '',
                    'path' => $child['path'] ?? '',
                    'level' => 1,
                ];

                foreach ($child['children'] ?? [] as $grandChild) {
                    $flattenedMenus[] = [
                        'id' => null,
                        'name' => '    -> '.($grandChild['name'] ?? ''),
                        'menu_key' => $grandChild['menu_key'] ?? '',
                        'path' => $grandChild['path'] ?? '',
                        'level' => 2,
                    ];
                }
            }
        }

        return Inertia::render('Dashboard/Administrator/UserAccess/Index', [
            'userAccesses' => $userAccesses,
            'users' => $users,
            'menus' => $flattenedMenus,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'access' => 'required|array',
        ]);

        UserAccess::query()->updateOrCreate(
            ['user_id' => $validated['user_id']],
            ['access' => $this->normalizeAccess($validated['access'])],
        );

        return redirect()->back()->with('success', 'Hak akses berhasil disimpan');
    }

    public function update(Request $request, UserAccess $userAccess): RedirectResponse|JsonResponse
    {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'access' => 'required|array',
            ]);

            $userAccess->update([
                'access' => $this->normalizeAccess($validated['access']),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Hak akses berhasil diperbarui');
        } catch (\Throwable $throwable) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => $throwable->getMessage(),
            ], 500);
        }
    }

    public function destroy(UserAccess $userAccess): RedirectResponse
    {
        $userAccess->delete();

        return redirect()->back()->with('success', 'Hak akses berhasil dihapus');
    }

    public function checkPermission(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_key' => 'required|string',
            'permission' => 'required|in:view,create,edit,delete,import,export,approve,reject',
        ]);

        return response()->json([
            'has_permission' => UserAccess::hasPermission(
                $request->user()->id,
                $validated['menu_key'],
                $validated['permission'],
            ),
        ]);
    }

    public function getUserMenuAccess(Request $request, string $menuKey): JsonResponse
    {
        return response()->json([
            'permissions' => UserAccess::getMenuPermissions($request->user()->id, $menuKey),
        ]);
    }

    public function grantMenuPermission(Request $request): RedirectResponse
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
            $validated['permissions'],
        );

        return redirect()->back()->with('success', 'Permission untuk menu berhasil diperbarui');
    }

    public function revokeMenuPermission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'menu_key' => 'required|string',
        ]);

        UserAccess::revokePermission($validated['user_id'], $validated['menu_key']);

        return redirect()->back()->with('success', 'Permission untuk menu berhasil dihapus');
    }

    private function normalizeAccess(array $access): array
    {
        $normalized = [];

        foreach ($access as $menuKey => $permissions) {
            if (! is_array($permissions)) {
                continue;
            }

            $normalized[$menuKey] = array_values(array_unique($permissions));
        }

        return $normalized;
    }
}
