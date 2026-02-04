<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\UserAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    /**
     * Display a listing of menus.
     */
    public function index(): Response
    {
        $menus = Menu::orderBy('order')
            ->get()
            ->map(function ($menu) {
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'menu_key' => $menu->menu_key,
                    'path' => $menu->path,
                    'icon' => $menu->icon,
                    'children' => $menu->children, // JSON array
                    'has_children' => $menu->hasChildren(),
                    'order' => $menu->order,
                    'is_active' => $menu->is_active,
                    'created_at' => $menu->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Dashboard/Administrator/Menus/Index', [
            'menus' => $menus,
        ]);
    }

    /**
     * Store a newly created menu.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'menu_key' => 'required|string|max:255|unique:menus,menu_key',
                'path' => 'required|string',
                'icon' => 'nullable|string|max:255',
                'children' => 'nullable|array', // JSON children
                'order' => 'nullable|integer',
                'is_active' => 'boolean',
            ]);

            $menu = Menu::create($validated);

            DB::commit();
            return redirect()->back()->with('success', 'Menu berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Gagal menambahkan menu: ' . $e->getMessage(),
                'details' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'code' => $e->getCode(),
                ]
            ])->withInput();
        }
    }

    /**
     * Update the specified menu.
     */
    public function update(Request $request, Menu $menu)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'menu_key' => 'required|string|max:255|unique:menus,menu_key,' . $menu->id,
                'path' => 'required|string',
                'icon' => 'nullable|string|max:255',
                'children' => 'nullable|array', // JSON children
                'order' => 'nullable|integer',
                'is_active' => 'boolean',
            ]);

            $menu->update($validated);

            DB::commit();
            return redirect()->back()->with('success', 'Menu berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Gagal memperbarui menu: ' . $e->getMessage(),
                'details' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'code' => $e->getCode(),
                ]
            ])->withInput();
        }
    }

    /**
     * Remove the specified menu.
     */
    public function destroy(Request $request, Menu $menu)
    {
        DB::beginTransaction();
        try {
            $forceDelete = $request->input('force_delete', false);

            // Check if menu has children and force delete is not enabled
            if ($menu->hasChildren() && !$forceDelete) {
                return redirect()->back()->withErrors(['error' => 'Menu memiliki submenu. Hapus submenu terlebih dahulu atau hapus dari struktur JSON.']);
            }

            // If force delete is enabled, we just delete the menu (children are JSON, will be deleted automatically)
            $menu->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Menu berhasil dihapus' . ($forceDelete ? ' beserta semua submenu' : ''));
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Gagal menghapus menu: ' . $e->getMessage(),
                'details' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'code' => $e->getCode(),
                ]
            ]);
        }
    }

    /**
     * Get hierarchical menu structure for current user based on JSON access.
     */
    public function getUserMenus(Request $request)
    {
        $user = $request->user();
        \Log::info('🔍 Getting menus for user:', ['user_id' => $user->id, 'email' => $user->email]);

        // Get user's accessible menu keys (those with 'view' permission)
        $accessibleMenuKeys = UserAccess::getAccessibleMenus($user->id);
        \Log::info('🔑 Accessible menu keys:', ['keys' => $accessibleMenuKeys, 'count' => count($accessibleMenuKeys)]);

        if (empty($accessibleMenuKeys)) {
            \Log::warning('⚠️ No accessible menu keys found for user');
            return response()->json([]);
        }

        // Get all menus (all are parent level with JSON children)
        $menus = Menu::orderBy('order')
            ->get();
        \Log::info('📋 Total menus in database:', ['count' => $menus->count()]);

        // Filter and build accessible menu structure
        $hierarchicalMenus = $menus->map(function ($menu) use ($accessibleMenuKeys) {
            return $this->filterMenuByAccess($menu, $accessibleMenuKeys);
        })->filter()->values(); // Remove null values and reindex

        \Log::info('✅ Filtered menus to return:', ['count' => $hierarchicalMenus->count(), 'menus' => $hierarchicalMenus->toArray()]);

        return response()->json($hierarchicalMenus);
    }

    /**
     * Filter menu and its children based on user access.
     */
    private function filterMenuByAccess($menu, $accessibleMenuKeys)
    {
        $baseItem = [
            'id' => $menu->id,
            'name' => $menu->name,
            'menu_key' => $menu->menu_key,
            'path' => $menu->path,
            'icon' => $menu->icon,
            'children' => $menu->children,
        ];

        return $this->filterMenuItemByAccess($baseItem, $accessibleMenuKeys);
    }

    /**
     * Filter menu items recursively.
     * - Parent menus (those with children) don't require access.
     * - Only leaf menus require access.
     */
    private function filterMenuItemByAccess(array $item, array $accessibleMenuKeys): ?array
    {
        $hasChildren = !empty($item['children']);

        if ($hasChildren) {
            $children = collect($item['children'])
                ->map(function ($child) use ($accessibleMenuKeys) {
                    return $this->filterMenuItemByAccess($child, $accessibleMenuKeys);
                })
                ->filter()
                ->values()
                ->toArray();

            if (empty($children)) {
                return null;
            }

            $item['children'] = $children;
            return $item;
        }

        if (!in_array($item['menu_key'] ?? null, $accessibleMenuKeys)) {
            return null;
        }

        $item['children'] = null;
        return $item;
    }
}
