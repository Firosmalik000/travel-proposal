<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\TravelPackage;
use Illuminate\Contracts\Console\Kernel;

echo "=== VERIFYING PACKAGE DISCOUNT DATA ===\n\n";

$pkg = TravelPackage::find(1);

if (! $pkg) {
    echo "Package 1 not found!\n";
    exit(1);
}

echo "Package: {$pkg->name}\n";
echo "original_price: {$pkg->original_price}\n";
echo "price (selling): {$pkg->price}\n";
echo "discount_type: {$pkg->discount_type}\n";
echo "discount_nominal: {$pkg->discount_nominal}\n";
echo "discount_percent (calculated): {$pkg->discountPercent()}\n\n";

$content = $pkg->content ?? [];
$roomOriginal = $content['room_original_prices'] ?? [];
$roomPrices = $content['room_prices'] ?? [];

echo "=== ROOM PRICES ===\n";
echo "Original Prices:\n";
foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
    $orig = $roomOriginal[$key] ?? 'N/A';
    echo "  {$label}: {$orig}\n";
}

echo "\nSelling Prices:\n";
foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
    $selling = $roomPrices[$key] ?? 'N/A';
    echo "  {$label}: {$selling}\n";
}

echo "\n=== VERIFICATION ===\n";
if ($pkg->discount_type === 'nominal' && $pkg->discount_nominal > 0) {
    echo "Discount Type: NOMINAL (Rp{$pkg->discount_nominal})\n";
    echo "Expected room_prices calculation: original_price - discount_nominal\n\n";

    foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
        $orig = $roomOriginal[$key] ?? 0;
        $expected = max(0, $orig - $pkg->discount_nominal);
        $actual = $roomPrices[$key] ?? 0;
        $status = ($actual == $expected) ? '✓ PASS' : '✗ FAIL';
        echo "{$label}: {$orig} - {$pkg->discount_nominal} = {$expected} (actual: {$actual}) {$status}\n";
    }
} elseif ($pkg->discount_type === 'percent' && $pkg->discount_percent() > 0) {
    echo "Discount Type: PERCENT ({$pkg->discount_percent()}%)\n";
    echo "Expected room_prices calculation: original_price × (1 - percent/100)\n\n";

    $discountPercent = $pkg->discount_percent();
    foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
        $orig = $roomOriginal[$key] ?? 0;
        $expected = round($orig * (1 - $discountPercent / 100));
        $actual = $roomPrices[$key] ?? 0;
        $status = ($actual == $expected) ? '✓ PASS' : '✗ FAIL';
        echo "{$label}: {$orig} × (1 - {$discountPercent}%) = {$expected} (actual: {$actual}) {$status}\n";
    }
} else {
    echo "No discount applied\n";
}

echo "\n=== END VERIFICATION ===\n";
