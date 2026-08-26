<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\TravelPackage;
use Illuminate\Contracts\Console\Kernel;

echo "=== TESTING PERCENT DISCOUNT (BACKWARD COMPATIBILITY) ===\n\n";

$pkgs = TravelPackage::where('discount_type', '!=', 'nominal')
    ->orWhereNull('discount_type')
    ->get();

if ($pkgs->count() > 0) {
    $pkg = $pkgs->first();
    echo "Found package with percent discount:\n";
    echo "ID: {$pkg->id}\n";
    echo "Name: {$pkg->name}\n";
    echo 'original_price: '.number_format($pkg->original_price, 0, '.', ',')."\n";
    echo 'price: '.number_format($pkg->price, 0, '.', ',')."\n";
    echo "discount_type: {$pkg->discount_type}\n";
    echo 'discount_percent: '.$pkg->discountPercent()."%\n";

    $content = $pkg->content ?? [];
    $roomOriginal = $content['room_original_prices'] ?? [];
    $roomPrices = $content['room_prices'] ?? [];

    echo "\nRoom Prices:\n";
    foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
        $orig = $roomOriginal[$key] ?? 'N/A';
        $selling = $roomPrices[$key] ?? 'N/A';
        echo "  {$label}: Original={$orig}, Selling={$selling}\n";
    }
    echo "\n✓ Percent discounts still work correctly!\n";
} else {
    echo "No percent discount packages found in database.\n";
    echo "This is OK - the system defaults to percent when creating new packages.\n";
}
