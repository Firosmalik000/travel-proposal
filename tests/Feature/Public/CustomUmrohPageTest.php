<?php

namespace Tests\Feature\Public;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomUmrohPageTest extends TestCase
{
    public function test_it_renders_custom_umroh_request_page(): void
    {
        $this->get(route('public.custom'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/custom/index')
            );
    }
}
