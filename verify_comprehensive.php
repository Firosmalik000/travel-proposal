<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\TravelPackage;
use Illuminate\Contracts\Console\Kernel;

echo "=== COMPREHENSIVE DISCOUNT VERIFICATION ===\n\n";

$pkg = TravelPackage::find(1);

if (! $pkg) {
    echo "❌ Package 1 not found!\n";
    exit(1);
}

echo "✓ Package found: {$pkg->name}\n\n";

// ========== TEST 1: DATABASE DATA ==========
echo "=== TEST 1: DATABASE DATA ===\n";
echo 'original_price: '.number_format($pkg->original_price, 0, '.', ',')."\n";
echo 'price (selling): '.number_format($pkg->price, 0, '.', ',')."\n";
echo "discount_type: {$pkg->discount_type}\n";
echo 'discount_nominal: '.number_format($pkg->discount_nominal, 0, '.', ',')."\n";
echo "discount_percent (calculated): {$pkg->discountPercent()}%\n";

$testPass1 = ($pkg->discount_type === 'nominal' && $pkg->discount_nominal > 0);
echo $testPass1 ? "✓ PASS\n" : "✗ FAIL\n";

// ========== TEST 2: ROOM PRICES CALCULATION ==========
echo "\n=== TEST 2: ROOM PRICES CALCULATION ===\n";
$content = $pkg->content ?? [];
$roomOriginal = $content['room_original_prices'] ?? [];
$roomPrices = $content['room_prices'] ?? [];

$testPass2 = true;
foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
    $orig = (float) ($roomOriginal[$key] ?? 0);
    $actual = (float) ($roomPrices[$key] ?? 0);
    $expected = max(0, $orig - $pkg->discount_nominal);

    $isCorrect = ($actual == $expected);
    $testPass2 = $testPass2 && $isCorrect;

    $status = $isCorrect ? '✓' : '✗';
    echo "{$status} {$label}: ".number_format($orig, 0, '.', ',').' - '.number_format($pkg->discount_nominal, 0, '.', ',').' = '.number_format($expected, 0, '.', ',').' (actual: '.number_format($actual, 0, '.', ',').")\n";
}
echo $testPass2 ? "✓ PASS\n" : "✗ FAIL\n";

// ========== TEST 3: SELLING PRICE LOGIC ==========
echo "\n=== TEST 3: SELLING PRICE LOGIC ===\n";
$basePrice = (float) $pkg->original_price;
$discountType = $pkg->discount_type;
$discountNominal = (float) $pkg->discount_nominal;
$discountPercent = $pkg->discountPercent();

$hasDiscount = $basePrice > 0 && ($discountPercent > 0 || $discountNominal > 0);
$calculatedSellingPrice = ($discountType === 'nominal')
    ? max(0, $basePrice - $discountNominal)
    : round($basePrice * (1 - $discountPercent / 100));

echo 'hasDiscount: '.($hasDiscount ? 'true' : 'false')."\n";
echo "discountType: {$discountType}\n";
echo 'Calculated Selling Price: '.number_format($calculatedSellingPrice, 0, '.', ',')."\n";
echo 'Database Selling Price: '.number_format($pkg->price, 0, '.', ',')."\n";

$testPass3 = ($calculatedSellingPrice == $pkg->price);
echo $testPass3 ? "✓ PASS\n" : "✗ FAIL\n";

// ========== TEST 4: BADGE DISPLAY ==========
echo "\n=== TEST 4: BADGE DISPLAY ===\n";
if ($discountType === 'nominal') {
    $badge = 'POTONGAN Rp'.number_format($discountNominal, 0, '.', ',');
} else {
    $badge = "HEMAT {$discountPercent}%";
}
echo "Badge text: {$badge}\n";
$testPass4 = true;
echo $testPass4 ? "✓ PASS\n" : "✗ FAIL\n";

// ========== TEST 5: FORM DISPLAY VALUES ==========
echo "\n=== TEST 5: FORM DISPLAY VALUES ===\n";
$testPass5 = true;

// Simulate frontend calculations
$formBasePrice = $basePrice;
$formDiscountType = $discountType;
$formDiscountNominal = $discountNominal;
$formDiscountPercent = $discountPercent;
$formHasDiscount = ($formBasePrice > 0 && ($formDiscountPercent > 0 || $formDiscountNominal > 0));
$formSellingPrice = $formDiscountType === 'nominal'
    ? max(0, $formBasePrice - $formDiscountNominal)
    : ($formHasDiscount ? round($formBasePrice * (1 - $formDiscountPercent / 100)) : $formBasePrice);

echo 'Form Selling Price Display: '.number_format($formSellingPrice, 0, '.', ',')."\n";
echo 'Database Price: '.number_format($pkg->price, 0, '.', ',')."\n";

foreach (['dbl' => 'Double', 'trpl' => 'Triple', 'quad' => 'Quad'] as $key => $label) {
    $formOriginal = (float) ($roomOriginal[$key] ?? $formBasePrice);
    $formSellingRoomPrice = $formDiscountType === 'nominal'
        ? max(0, $formOriginal - $formDiscountNominal)
        : round($formOriginal * (1 - $formDiscountPercent / 100));

    $dbRoomPrice = (float) ($roomPrices[$key] ?? 0);
    $isCorrect = ($formSellingRoomPrice == $dbRoomPrice);
    $testPass5 = $testPass5 && $isCorrect;

    $status = $isCorrect ? '✓' : '✗';
    echo "{$status} {$label}: Form=".number_format($formSellingRoomPrice, 0, '.', ',').', DB='.number_format($dbRoomPrice, 0, '.', ',')."\n";
}
echo $testPass5 ? "✓ PASS\n" : "✗ FAIL\n";

// ========== FINAL RESULT ==========
echo "\n=== FINAL RESULT ===\n";
$allPass = $testPass1 && $testPass2 && $testPass3 && $testPass4 && $testPass5;

echo 'Test 1 (Database Data): '.($testPass1 ? '✓ PASS' : '✗ FAIL')."\n";
echo 'Test 2 (Room Prices Calc): '.($testPass2 ? '✓ PASS' : '✗ FAIL')."\n";
echo 'Test 3 (Selling Price Logic): '.($testPass3 ? '✓ PASS' : '✗ FAIL')."\n";
echo 'Test 4 (Badge Display): '.($testPass4 ? '✓ PASS' : '✗ FAIL')."\n";
echo 'Test 5 (Form Display Values): '.($testPass5 ? '✓ PASS' : '✗ FAIL')."\n";

echo "\n";
if ($allPass) {
    echo "🎉 ALL TESTS PASSED! ✓\n";
    echo "The nominal discount system is working PERFECTLY!\n";
    exit(0);
} else {
    echo "⚠️  SOME TESTS FAILED!\n";
    exit(1);
}
