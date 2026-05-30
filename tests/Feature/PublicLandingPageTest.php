<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicLandingPageTest extends TestCase
{
    public function test_landing_page_renders_public_landing_component(): void
    {
        $this->withoutMiddleware(HandleInertiaRequests::class);

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('html'));
    }
}
