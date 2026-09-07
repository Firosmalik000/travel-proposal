<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')
            ->select(['id', 'product_type', 'content'])
            ->orderBy('id')
            ->chunkById(100, function ($products): void {
                foreach ($products as $product) {
                    $content = json_decode((string) $product->content, true);
                    $content = is_array($content) ? $content : [];

                    if (is_string($content['unit'] ?? null) && trim($content['unit']) !== '') {
                        continue;
                    }

                    $content['unit'] = $this->defaultUnit((string) $product->product_type);

                    DB::table('products')
                        ->where('id', $product->id)
                        ->update(['content' => json_encode($content, JSON_THROW_ON_ERROR)]);
                }
            });
    }

    public function down(): void
    {
        // Existing and backfilled values cannot be distinguished safely.
    }

    private function defaultUnit(string $categoryKey): string
    {
        return match ($categoryKey) {
            'dokumen', 'perlengkapan' => 'per jamaah',
            'akomodasi', 'hotel' => 'per kamar',
            default => 'per paket',
        };
    }
};
