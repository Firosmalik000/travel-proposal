<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Http\Controllers\Administrator\PackageController;
use App\Models\TravelPackage;
use Illuminate\Contracts\Console\Kernel;

echo "=== TESTING PACKAGE SERIALIZATION ===\n\n";

$pkg = TravelPackage::find(1);

// Test serialization (what gets sent to frontend)
$controller = new PackageController;
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('serializePackage');
$method->setAccessible(true);
$serialized = $method->invoke($controller, $pkg);

echo "Serialized data sent to frontend:\n";
echo "- original_price: {$serialized['original_price']}\n";
echo "- price: {$serialized['price']}\n";
echo "- discount_type: {$serialized['discount_type']}\n";
echo "- discount_nominal: {$serialized['discount_nominal']}\n";
echo "- discount_percent: {$serialized['discount_percent']}\n";
echo "- discount_label: {$serialized['discount_label']}\n";
echo "- discount_ends_at: {$serialized['discount_ends_at']}\n";

echo "\n=== ROOM PRICES IN SERIALIZED DATA ===\n";
$roomPrices = $serialized['content']['room_prices'] ?? [];
$roomOriginal = $serialized['content']['room_original_prices'] ?? [];

foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
    $orig = $roomOriginal[$key] ?? 'N/A';
    $selling = $roomPrices[$key] ?? 'N/A';
    echo "{$label}: Original={$orig}, Selling={$selling}\n";
}

echo "\n=== FORM DISPLAY CALCULATIONS (SIMULATED) ===\n";

// Simulate what frontend will calculate for display
$basePrice = (float) $serialized['original_price'];
$discountType = $serialized['discount_type'] ?? 'percent';
$discountNominal = (float) ($serialized['discount_nominal'] ?? 0);
$discountPercent = (int) $serialized['discount_percent'];

echo "Input values:\n";
echo "- basePrice: {$basePrice}\n";
echo "- discountType: {$discountType}\n";
echo "- discountNominal: {$discountNominal}\n";
echo "- discountPercent: {$discountPercent}\n\n";

if ($discountType === 'nominal') {
    $sellingPrice = max(0, $basePrice - $discountNominal);
    echo "Selling Price (nominal): {$sellingPrice}\n";
    echo "Calculation: {$basePrice} - {$discountNominal} = {$sellingPrice}\n";
} else {
    $sellingPrice = round($basePrice * (1 - $discountPercent / 100));
    echo "Selling Price (percent): {$sellingPrice}\n";
    echo "Calculation: {$basePrice} × (1 - {$discountPercent}%) = {$sellingPrice}\n";
}

echo "\n=== VERIFY DISPLAY VALUES MATCH DATABASE ===\n";
if ($sellingPrice == $serialized['price']) {
    echo "✓ PASS: Display selling price matches database price\n";
} else {
    echo "✗ FAIL: Display selling price ({$sellingPrice}) != database price ({$serialized['price']})\n";
}

echo "\n=== END SERIALIZATION TEST ===\n";
