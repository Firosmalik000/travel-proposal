<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MasterDataCurrencyPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_master_currency_module_has_been_removed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/master-data/currencies')
            ->assertNotFound();

        $menuContainsCurrency = Menu::query()
            ->get()
            ->contains(fn (Menu $menu): bool => collect($menu->getAllMenuKeys())->contains('master_currency'));

        $this->assertFalse($menuContainsCurrency);
        $this->assertFalse(Schema::hasTable('currencies'));
    }
}
