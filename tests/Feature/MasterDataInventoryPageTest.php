<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\InventoryItem;
use App\Models\InventoryStockMutation;
use App\Models\Menu;
use App\Models\TravelPackage;
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

    public function test_inventory_purchase_updates_stock_value_and_posts_one_idempotent_ledger(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.create']);

        $product = $this->createProduct('PRD-PURCHASE-001');
        $inventoryItem = InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 0,
            'is_active' => true,
        ]);
        $cashAccount = FinancialAccount::query()->where('system_key', 'operating_bank')->firstOrFail();
        $payload = [
            'quantity' => 5,
            'unit_cost_idr' => 2000,
            'financial_account_id' => $cashAccount->id,
            'transaction_date' => '2026-09-19',
            'notes' => 'Pembelian perlengkapan',
            'idempotency_key' => 'test-inventory-purchase-001',
        ];

        $this->actingAs($user)
            ->post(route('master-data.inventory.purchases.store', $inventoryItem), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->actingAs($user)
            ->post(route('master-data.inventory.purchases.store', $inventoryItem), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'quantity' => 5,
            'average_unit_cost_idr' => 2000,
        ]);
        $this->assertSame(1, InventoryStockMutation::query()->where('idempotency_key', $payload['idempotency_key'])->count());
        $transaction = FinancialTransaction::query()->where('idempotency_key', $payload['idempotency_key'])->firstOrFail();
        $this->assertSame('inventory_purchase', $transaction->transaction_type);
        $this->assertSame(10000, (int) $transaction->lines()->where('entry_type', 'debit')->sum('amount_idr'));
        $this->assertSame(10000, (int) $transaction->lines()->where('entry_type', 'credit')->sum('amount_idr'));
    }

    public function test_inventory_issue_reduces_on_hand_and_reservation_then_posts_actual_cost(): void
    {
        $user = User::factory()->create();
        $this->ensureMasterDataInventoryMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.inventory.view', 'menu.inventory.edit']);

        $product = $this->createProduct('PRD-ISSUE-001');
        $package = TravelPackage::factory()->create();
        $booking = Booking::factory()->create(['package_id' => $package->id, 'status' => 'registered']);
        $inventoryItem = InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 10,
            'reserved_quantity' => 3,
            'average_unit_cost_idr' => 2000,
            'is_active' => true,
        ]);
        InventoryStockMutation::query()->create([
            'inventory_item_id' => $inventoryItem->id,
            'product_id' => $product->id,
            'booking_id' => $booking->id,
            'change_type' => 'booking_reservation',
            'quantity_before' => 10,
            'quantity_change' => 0,
            'reserved_quantity_change' => 3,
            'quantity_after' => 10,
        ]);
        $payload = [
            'booking_id' => $booking->id,
            'quantity' => 2,
            'transaction_date' => '2026-09-19',
            'notes' => 'Serah-terima perlengkapan',
            'idempotency_key' => 'test-inventory-issue-001',
        ];

        $this->actingAs($user)
            ->post(route('master-data.inventory.issues.store', $inventoryItem), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->actingAs($user)
            ->post(route('master-data.inventory.issues.store', $inventoryItem), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventoryItem->id,
            'quantity' => 8,
            'reserved_quantity' => 1,
        ]);
        $this->assertSame(1, InventoryStockMutation::query()->where('idempotency_key', $payload['idempotency_key'])->count());
        $transaction = FinancialTransaction::query()->where('idempotency_key', $payload['idempotency_key'])->firstOrFail();
        $this->assertSame('inventory_issue', $transaction->transaction_type);
        $this->assertSame(4000, (int) $transaction->lines()->where('entry_type', 'debit')->sum('amount_idr'));
        $this->assertSame(4000, (int) $transaction->lines()->where('entry_type', 'credit')->sum('amount_idr'));
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
