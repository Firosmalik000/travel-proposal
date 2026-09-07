<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->json('price_snapshot')->nullable()->after('multiplier_per_pax');
            $table->char('price_snapshot_hash', 64)->nullable()->after('price_snapshot');
            $table->timestamp('price_snapshot_at')->nullable()->after('price_snapshot_hash');
        });

        DB::table('package_product')
            ->join('products', 'products.id', '=', 'package_product.product_id')
            ->whereNull('package_product.price_snapshot')
            ->select(['package_product.id as pivot_id', 'products.id as product_id', 'products.content'])
            ->orderBy('package_product.id')
            ->chunkById(100, function ($rows): void {
                foreach ($rows as $row) {
                    $content = json_decode((string) $row->content, true);
                    $content = is_array($content) ? $content : [];
                    $financialContent = collect($content)
                        ->only(['price', 'currency', 'currency_rate_snapshot', 'pricing'])
                        ->all();
                    $snapshot = [
                        'version' => 1,
                        'product_id' => (int) $row->product_id,
                        'content' => $financialContent,
                    ];

                    DB::table('package_product')->where('id', $row->pivot_id)->update([
                        'price_snapshot' => json_encode($snapshot, JSON_THROW_ON_ERROR),
                        'price_snapshot_hash' => hash('sha256', json_encode(
                            $this->sortRecursively($financialContent),
                            JSON_THROW_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION,
                        )),
                        'price_snapshot_at' => now(),
                    ]);
                }
            }, 'package_product.id', 'pivot_id');
    }

    public function down(): void
    {
        Schema::table('package_product', function (Blueprint $table): void {
            $table->dropColumn(['price_snapshot', 'price_snapshot_hash', 'price_snapshot_at']);
        });
    }

    private function sortRecursively(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        foreach ($value as $key => $item) {
            $value[$key] = $this->sortRecursively($item);
        }

        if (! array_is_list($value)) {
            ksort($value);
        }

        return $value;
    }
};
