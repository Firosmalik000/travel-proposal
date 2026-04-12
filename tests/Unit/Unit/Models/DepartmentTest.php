<?php

namespace Tests\Unit\Models;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_content_casts_payloads_to_array(): void
    {
        $content = PageContent::query()->create([
            'slug' => 'home',
            'title' => 'Home',
            'excerpt' => 'Landing page',
            'content' => [
                'hero' => ['title' => 'Jelajahi Tanah Suci'],
            ],
            'is_active' => true,
        ]);

        $this->assertIsArray($content->content);
        $this->assertSame('Jelajahi Tanah Suci', $content->content['hero']['title']);
    }

    public function test_page_content_stores_active_state(): void
    {
        $content = PageContent::query()->create([
            'slug' => 'kontak',
            'title' => 'Kontak',
            'is_active' => true,
        ]);

        $this->assertTrue($content->is_active);
    }
}
