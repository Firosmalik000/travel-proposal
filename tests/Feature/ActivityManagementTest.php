<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_activity_management_page(): void
    {
        $user = User::factory()->create();
        collect(range(1, 12))->each(function (int $index): void {
            Activity::query()->create(['code' => sprintf('ACT-%02d', $index),                 'name' => ['id' => "Activity {$index}", 'en' => "Activity {$index}"],                 'description' => ['id' => "Deskripsi {$index}", 'en' => "Description {$index}"],                 'sort_order' => $index,                 'is_active' => $index <= 6]);
        });
        $this->actingAs($user)->get(route('activities.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('Dashboard/ProductManagement/Activities/Index')->has('activities.data', 10)->has('activities.links')->where('activities.total', 12)->where('activities.data.0.code', 'ACT-01')->where('filters.search', '')->where('stats.total', 12)->where('stats.active', 6)->where('stats.inactive', 6));
    }

    public function test_it_can_filter_activity_management_page(): void
    {
        $user = User::factory()->create();
        Activity::query()->create(['code' => 'ACT-UMRAH',             'name' => ['id' => 'Umrah', 'en' => 'Umrah'],             'description' => ['id' => 'Aktivitas utama.', 'en' => 'Main activity.'],             'sort_order' => 1,             'is_active' => true]);
        Activity::query()->create(['code' => 'ACT-ZIARAH',             'name' => ['id' => 'Ziarah', 'en' => 'Ziyarah'],             'description' => ['id' => 'Kunjungan lokasi.', 'en' => 'Visit activity.'],             'sort_order' => 2,             'is_active' => true]);
        $this->actingAs($user)->get(route('activities.index', ['search' => 'Umrah']))->assertOk()->assertInertia(fn (Assert $page) => $page->where('filters.search', 'Umrah')->where('activities.total', 1)->has('activities.data', 1)->where('activities.data.0.code', 'ACT-UMRAH'));
    }

    public function test_it_can_store_update_and_delete_activity(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('activities.store'), ['name' => ['id' => 'Snorkeling', 'en' => 'Snorkeling'],                 'description' => ['id' => 'Aktivitas laut hari kedua.', 'en' => 'Sea activity on day two.'],                 'sort_order' => 2,                 'is_active' => true])->assertRedirect();
        $activity = Activity::query()->where('code', 'ACT-SNORKELING')->first();
        $this->assertNotNull($activity);
        $this->actingAs($user)->put(route('activities.update', $activity), ['name' => ['id' => 'Snorkeling Premium', 'en' => 'Premium Snorkeling'],                 'description' => ['id' => 'Aktivitas laut premium.', 'en' => 'Premium sea activity.'],                 'sort_order' => 3,                 'is_active' => false])->assertRedirect();
        $this->assertEquals('Snorkeling Premium', $activity->fresh()->name['id']);
        $this->assertEquals('ACT-SNORKELING-PREMIUM', $activity->fresh()->code);
        $this->assertFalse($activity->fresh()->is_active);
        $this->actingAs($user)->delete(route('activities.destroy', $activity))->assertRedirect();
        $this->assertDatabaseMissing('activities', ['id' => $activity->id]);
    }

    public function test_it_generates_unique_activity_code_automatically(): void
    {
        $user = User::factory()->create();
        Activity::query()->create(['code' => 'ACT-BRIEFING-KEBERANGKATAN',             'name' => ['id' => 'Briefing Keberangkatan', 'en' => 'Departure Briefing'],             'description' => ['id' => 'Activity lama.', 'en' => 'Existing activity.'],             'sort_order' => 1,             'is_active' => true]);
        $this->actingAs($user)->post(route('activities.store'), ['name' => ['id' => 'Briefing Keberangkatan', 'en' => 'Departure Briefing'],                 'description' => ['id' => 'Activity baru.', 'en' => 'New activity.'],                 'sort_order' => 2,                 'is_active' => true])->assertRedirect();
        $this->assertDatabaseHas('activities', ['code' => 'ACT-BRIEFING-KEBERANGKATAN-2']);
    }

    public function test_it_uses_indonesian_value_when_english_activity_fields_are_empty(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('activities.store'), ['name' => ['id' => 'Handling Bandara', 'en' => ''],                 'description' => ['id' => 'Pendampingan proses keberangkatan.', 'en' => ''],                 'sort_order' => 1,                 'is_active' => true])->assertRedirect();
        $activity = Activity::query()->where('code', 'ACT-HANDLING-BANDARA')->first();
        $this->assertNotNull($activity);
        $this->assertSame('Handling Bandara', $activity->name['en']);
        $this->assertSame('Pendampingan proses keberangkatan.', $activity->description['en']);
    }
}
