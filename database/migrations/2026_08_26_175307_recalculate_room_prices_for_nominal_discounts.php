<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $packages = DB::table('packages')
            ->where('discount_type', 'nominal')
            ->where('discount_nominal', '>', 0)
            ->whereNotNull('original_price')
            ->get();

        foreach ($packages as $pkg) {
            $content = json_decode($pkg->content ?? '{}', true) ?? [];
            $originalPrice = (float) $pkg->original_price;
            $nominalDiscount = (float) $pkg->discount_nominal;

            $roomOriginalPrices = $content['room_original_prices'] ?? [];
            $roomPrices = [];

            foreach (['dbl', 'trpl', 'quad'] as $roomType) {
                $originalRoomPrice = (float) ($roomOriginalPrices[$roomType] ?? $originalPrice);
                $roomPrices[$roomType] = max(0, $originalRoomPrice - $nominalDiscount);
            }

            $content['room_prices'] = $roomPrices;

            DB::table('packages')
                ->where('id', $pkg->id)
                ->update([
                    'content' => json_encode($content),
                ]);
        }
    }

    public function down(): void {}
};
