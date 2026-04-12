<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * @var array<int, string>
     */
    private array $allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];

    public function run(): void
    {
        $menus = Menu::query()->orderBy('order')->get();
        $adminAccess = [];

        foreach ($menus as $menu) {
            foreach ($this->extractAllMenuKeys($menu) as $menuKey) {
                $adminAccess[$menuKey] = $this->allPermissions;
            }
        }

        $this->syncAccess('admin@asfartour.co.id', $adminAccess);

        $websiteManagementPermissions = [
            'dashboard' => ['view'],
            'website_management' => ['view'],
            'landing_page' => ['view', 'create', 'edit'],
            'content_management' => ['view', 'create', 'edit'],
            'product_management' => ['view'],
            'product' => ['view', 'create', 'edit'],
            'package' => ['view', 'create', 'edit'],
            'seo_settings' => ['view', 'edit'],
            'branding' => ['view', 'edit'],
        ];

        $contentEditorPermissions = [
            'dashboard' => ['view'],
            'website_management' => ['view'],
            'landing_page' => ['view', 'edit'],
            'content_management' => ['view', 'create', 'edit'],
            'product_management' => ['view'],
            'product' => ['view'],
            'package' => ['view'],
        ];

        $this->syncAccess('operasional@asfartour.co.id', $websiteManagementPermissions);
        $this->syncAccess('marketing@asfartour.co.id', $contentEditorPermissions);
        $this->syncAccess('cs@asfartour.co.id', $contentEditorPermissions);
    }

    private function extractAllMenuKeys(Menu $menu): array
    {
        $keys = [$menu->menu_key];

        foreach ($menu->children ?? [] as $child) {
            if (isset($child['menu_key'])) {
                $keys[] = $child['menu_key'];
            }

            foreach ($child['children'] ?? [] as $grandChild) {
                if (isset($grandChild['menu_key'])) {
                    $keys[] = $grandChild['menu_key'];
                }
            }
        }

        return array_values(array_unique(array_filter($keys)));
    }

    private function syncAccess(string $email, array $access): void
    {
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            return;
        }

        UserAccess::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['access' => $access],
        );
    }
}
