<?php

namespace Tests\Feature;

use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPackageDetailPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_open_package_detail_page(): void
    {
        $package = TravelPackage::factory()->create();

        $this->get('/paket-umroh/'.$package->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/detail/index')
                ->has('travelPackage')
            );
    }
}
