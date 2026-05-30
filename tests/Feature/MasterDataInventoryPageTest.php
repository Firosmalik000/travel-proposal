<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\Menu;
use App\Models\TravelProduct;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MasterDataInventoryPageTest extends TestCase
{
    use RefreshDatabase;

    private function ensureMasterDataInventoryMenuExists(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'master_data'],
            [
                'name' => 'Master Data',
                'path' => '/dashboard/master-data',
                'icon' => 'Database',
                'children' => [
                    [
                        'name' => 'Inventory',
                        'menu_key' => 'inventory',
                        'path' => '/dashboard/master-data/inventory',
                        'icon' => 'Archive',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 1,
                'is_active' => true,
            ]
        );
    }

    public function test_inventory_page_is_forbidden_without_view_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataInventoryMenuExists();

        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->get('/admin/master-data/inventory')
            ->assertForbidden();
    }

    public function test_inventory_page_can_be_opened_with_view_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureMasterDataInventoryMenuExists();

        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.inventory.view');

        $this->actingAs($user)
            ->get('/admin/master-data/inventory')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/MasterData/Inventory/Index')
            );
    }

    public function test_inventory_item_can_be_created_with_create_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.create']);

        $product = $this->createProduct();
        $this->actingAs($user)
            ->post('/admin/master-data/inventory', [
                'product_id' => $product->id,
                'quantity' => 10,
                'notes' => 'Stok awal',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('inventory_items', [
            'product_id' => $product->id,
            'quantity' => 10,
        ]);
    }

    public function test_inventory_item_store_is_forbidden_without_create_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.inventory.view');

        $this->actingAs($user)
            ->post('/admin/master-data/inventory', [
                'product_id' => $this->createProduct('PRD-TEST-002')->id,
                'quantity' => 3,
                'is_active' => true,
            ])
            ->assertForbidden();
    }

    public function test_inventory_item_store_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.create']);

        $this->actingAs($user)
            ->from('/admin/master-data/inventory')
            ->post('/admin/master-data/inventory', [
                'product_id' => '',
                'quantity' => -1,
            ])
            ->assertRedirect('/admin/master-data/inventory')
            ->assertSessionHasErrors(['product_id', 'quantity']);
    }

    public function test_inventory_item_can_be_updated_with_edit_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.edit']);

        $product = $this->createProduct('PRD-TEST-003');
        $inventoryItem = InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 3,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->put('/admin/master-data/inventory/'.$inventoryItem->id, [
                'product_id' => $product->id,
                'stock_adjustment' => 2,
                'notes' => 'Update stok',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_inventory_item_can_be_deleted_with_delete_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.delete']);

        $inventoryItem = InventoryItem::query()->create([
            'item_code' => 'PRD-TEST-004',
            'item_name' => 'Produk Test',
            'category' => 'layanan',
            'unit' => 'pcs',
            'product_id' => $this->createProduct('PRD-TEST-004')->id,
            'quantity' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->delete('/admin/master-data/inventory/'.$inventoryItem->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('inventory_items', [
            'id' => $inventoryItem->id,
        ]);
    }

    private function createProduct(string $code = 'PRD-TEST-001'): TravelProduct
    {
        return TravelProduct::query()->create([
            'code' => $code,
            'slug' => strtolower($code),
            'name' => 'Produk Test',
            'product_type' => 'layanan',
            'description' => 'Desc',
            'content' => ['unit' => 'pcs', 'price' => 10000],
            'is_active' => true,
        ]);
    }
}
