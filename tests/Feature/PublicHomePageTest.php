<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicHomePageTest extends TestCase
{
    public function test_home_page_renders_welcome_component(): void
    {
        $this->withoutMiddleware(HandleInertiaRequests::class);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }
}
