<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('packages')
            ->select(['id', 'price', 'original_price', 'content'])
            ->orderBy('id')
            ->chunkById(100, function ($packages): void {
                foreach ($packages as $package) {
                    $content = json_decode((string) ($package->content ?? '{}'), true);
                    if (! is_array($content)) {
                        continue;
                    }

                    $doublePrice = data_get($content, 'room_prices.dbl');
                    if (! is_numeric($doublePrice) || (float) $doublePrice <= 0) {
                        DB::table('packages')
                            ->where('id', $package->id)
                            ->update([
                                'price' => 0,
                                'original_price' => null,
                            ]);

                        continue;
                    }

                    $doubleOriginalPrice = data_get($content, 'room_original_prices.dbl');
                    $originalPrice = is_numeric($doubleOriginalPrice)
                        && (float) $doubleOriginalPrice > (float) $doublePrice
                            ? (float) $doubleOriginalPrice
                            : null;

                    DB::table('packages')
                        ->where('id', $package->id)
                        ->update([
                            'price' => (float) $doublePrice,
                            'original_price' => $originalPrice,
                        ]);
                }
            });
    }

    public function down(): void
    {
        // The former single price cannot be reconstructed safely from current package data.
    }
};
