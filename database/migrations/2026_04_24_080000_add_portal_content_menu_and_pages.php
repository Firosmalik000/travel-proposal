<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('menus')) {
            $menu = DB::table('menus')
                ->where('menu_key', 'website_management')
                ->first();

            if ($menu) {
                $children = json_decode($menu->children ?? '[]', true);
                if (! is_array($children)) {
                    $children = [];
                }

                $hasPortalContentMenu = collect($children)->contains(
                    fn (array $child): bool => ($child['menu_key'] ?? null) === 'portal_content'
                );

                if (! $hasPortalContentMenu) {
                    $children[] = [
                        'name' => 'Policy & Help',
                        'menu_key' => 'portal_content',
                        'path' => '/dashboard/website-management/portal-content',
                        'icon' => 'Folder',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ];
                }

                $children = collect($children)
                    ->map(function (array $child): array {
                        if (($child['menu_key'] ?? null) === 'portal_content') {
                            $child['name'] = 'Policy & Help';
                        }

                        if (($child['menu_key'] ?? null) === 'content_management') {
                            $child['order'] = 4;
                        }

                        if (($child['menu_key'] ?? null) === 'seo_settings') {
                            $child['order'] = 5;
                        }

                        if (($child['menu_key'] ?? null) === 'branding') {
                            $child['order'] = 6;
                        }

                        return $child;
                    })
                    ->sortBy(fn (array $child): int => (int) ($child['order'] ?? 999))
                    ->values()
                    ->all();

                DB::table('menus')
                    ->where('menu_key', 'website_management')
                    ->update([
                        'children' => json_encode($children, JSON_THROW_ON_ERROR),
                        'updated_at' => now(),
                    ]);
            }
        }

        if (! Schema::hasTable('page_contents')) {
            return;
        }

        $pages = [
            'terms-conditions' => [
                'title' => 'Syarat & Ketentuan',
                'excerpt' => 'Aturan penggunaan layanan dan portal.',
                'content' => [
                    'body' => 'Tuliskan syarat dan ketentuan layanan di sini.',
                ],
            ],
            'privacy-policy' => [
                'title' => 'Kebijakan Privasi',
                'excerpt' => 'Penjelasan penggunaan dan perlindungan data pengguna.',
                'content' => [
                    'body' => 'Tuliskan kebijakan privasi di sini.',
                ],
            ],
            'refund-policy' => [
                'title' => 'Kebijakan Refund',
                'excerpt' => 'Aturan refund, reschedule, dan pembatalan.',
                'content' => [
                    'body' => 'Tuliskan kebijakan refund dan pembatalan di sini.',
                ],
            ],
            'disclaimer' => [
                'title' => 'Disclaimer',
                'excerpt' => 'Pernyataan batas tanggung jawab layanan.',
                'content' => [
                    'body' => 'Tuliskan disclaimer resmi di sini.',
                ],
            ],
        ];

        foreach ($pages as $slug => $page) {
            $exists = DB::table('page_contents')
                ->where('slug', $slug)
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('page_contents')->insert([
                'slug' => $slug,
                'category' => 'page',
                'title' => $page['title'],
                'excerpt' => $page['excerpt'],
                'content' => json_encode($page['content'], JSON_THROW_ON_ERROR),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('menus')) {
            $menu = DB::table('menus')
                ->where('menu_key', 'website_management')
                ->first();

            if ($menu) {
                $children = json_decode($menu->children ?? '[]', true);
                if (! is_array($children)) {
                    $children = [];
                }

                $children = collect($children)
                    ->reject(fn (array $child): bool => ($child['menu_key'] ?? null) === 'portal_content')
                    ->map(function (array $child): array {
                        if (($child['menu_key'] ?? null) === 'content_management') {
                            $child['order'] = 3;
                        }

                        if (($child['menu_key'] ?? null) === 'seo_settings') {
                            $child['order'] = 4;
                        }

                        if (($child['menu_key'] ?? null) === 'branding') {
                            $child['order'] = 5;
                        }

                        return $child;
                    })
                    ->values()
                    ->all();

                DB::table('menus')
                    ->where('menu_key', 'website_management')
                    ->update([
                        'children' => json_encode($children, JSON_THROW_ON_ERROR),
                        'updated_at' => now(),
                    ]);
            }
        }

        if (! Schema::hasTable('page_contents')) {
            return;
        }

        DB::table('page_contents')
            ->whereIn('slug', [
                'terms-conditions',
                'privacy-policy',
                'refund-policy',
                'disclaimer',
            ])
            ->delete();
    }
};
