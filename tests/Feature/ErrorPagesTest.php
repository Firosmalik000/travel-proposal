<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_route_renders_inertia_404_page(): void
    {
        $this->get('/__missing-route__')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('errors/show')
                ->where('status', 404)
            );
    }

    public function test_forbidden_renders_inertia_403_page(): void
    {
        Route::middleware('web')->get('/__test-error__/forbidden', fn () => abort(403));

        $this->get('/__test-error__/forbidden')
            ->assertForbidden()
            ->assertInertia(fn (Assert $page) => $page
                ->component('errors/show')
                ->where('status', 403)
            );
    }

    public function test_server_error_renders_inertia_500_page_when_debug_is_disabled(): void
    {
        config(['app.debug' => false]);

        Route::middleware('web')->get('/__test-error__/boom', fn () => throw new \RuntimeException('boom'));

        $this->get('/__test-error__/boom')
            ->assertStatus(500)
            ->assertInertia(fn (Assert $page) => $page
                ->component('errors/show')
                ->where('status', 500)
            );
    }
}
