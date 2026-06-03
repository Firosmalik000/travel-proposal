<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPdfControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_render_policy_pdf_from_portal_content(): void
    {
        PageContent::query()->updateOrCreate(['slug' => 'terms-conditions'], [
            'slug' => 'terms-conditions',
            'category' => 'page',
            'title' => ['id' => 'Syarat & Ketentuan', 'en' => 'Terms & Conditions'],
            'excerpt' => ['id' => 'Aturan layanan.', 'en' => 'Service rules.'],
            'content' => [
                'body' => [
                    'id' => '<p>Isi terms.</p>',
                    'en' => '<p>Terms body.</p>',
                ],
            ],
            'is_active' => true,
        ]);

        $this->get(route('public.terms.pdf'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_it_can_render_package_sk_pdf_for_active_package(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-SK-12',
            'slug' => 'umroh-sk-12-hari',
            'name' => ['id' => 'Umroh SK 12 Hari', 'en' => 'Umrah SK 12 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 12,
            'price' => 32000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
            'content' => [
                'included' => [
                    'id' => ['Tiket pesawat', 'Hotel'],
                    'en' => ['Flight ticket', 'Hotel'],
                ],
                'excluded' => [
                    'id' => ['Paspor'],
                    'en' => ['Passport'],
                ],
                'policy' => [
                    'id' => 'Kebijakan paket.',
                    'en' => 'Package policy.',
                ],
            ],
            'is_active' => true,
        ]);

        $this->get(route('public.paket.sk.pdf', $package))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }
}
