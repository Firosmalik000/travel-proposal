<?php

namespace Tests\Feature\Administrator;

use App\Models\PageContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BrandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_view_branding_settings_with_default_assets(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('branding.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Branding/Index')
                ->where('branding.company_name', config('branding.company_name'))
                ->where('branding.logo_path', config('branding.logo_path'))
                ->where('branding.palette.primary', config('branding.palette.primary'))
            );
    }

    public function test_branding_update_persists_palette_and_custom_logos(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('branding.update'), [
                'company_name' => 'Asfar Tour Nusantara',
                'company_subtitle' => 'Hajj, Umrah, and Travel',
                'primary' => '#c80012',
                'secondary' => '#8c0a16',
                'accent' => '#ff9200',
                'accent_soft' => '#ffc578',
                'surface' => '#f6e7c6',
                'logo' => UploadedFile::fake()->image('logo.png'),
                'logo_white' => UploadedFile::fake()->image('logo-white.png'),
            ])
            ->assertRedirect();

        $settings = PageContent::query()->where('slug', 'branding-settings')->first();

        $this->assertNotNull($settings);
        $this->assertSame('Asfar Tour Nusantara', $settings->content['company_name']);
        $this->assertSame('#ff9200', $settings->content['palette']['accent']);

        Storage::disk('public')->assertExists($settings->content['logo_path']);
        Storage::disk('public')->assertExists($settings->content['logo_white_path']);
    }
}
