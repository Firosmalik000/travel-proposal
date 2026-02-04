# PowerShell Script to Seed Finance Menu
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Seeding Finance Menu to Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "artisan")) {
    Write-Host "ERROR: artisan file not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[Step 1] Checking database connection..." -ForegroundColor Yellow
$checkDb = php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'OK'; } catch (Exception `$e) { echo 'FAILED: ' . `$e->getMessage(); }"
if ($checkDb -notmatch "OK") {
    Write-Host "ERROR: Database connection failed!" -ForegroundColor Red
    Write-Host $checkDb -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. MySQL service is running in Laragon" -ForegroundColor White
    Write-Host "2. Database exists in phpMyAdmin" -ForegroundColor White
    Write-Host "3. .env file has correct database credentials" -ForegroundColor White
    pause
    exit 1
}
Write-Host "✓ Database connection OK" -ForegroundColor Green
Write-Host ""

Write-Host "[Step 2] Running MenuSeeder..." -ForegroundColor Yellow
$seederOutput = php artisan db:seed --class=MenuSeeder 2>&1
$seederExitCode = $LASTEXITCODE

if ($seederExitCode -eq 0) {
    Write-Host "✓ MenuSeeder completed successfully!" -ForegroundColor Green
    Write-Host $seederOutput -ForegroundColor Gray
} else {
    Write-Host "ERROR: MenuSeeder failed!" -ForegroundColor Red
    Write-Host $seederOutput -ForegroundColor Red
    pause
    exit 1
}
Write-Host ""

Write-Host "[Step 3] Verifying Finance menu in database..." -ForegroundColor Yellow
$checkFinance = php artisan tinker --execute="`$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if (`$finance) { echo 'FOUND: ' . `$finance->name; } else { echo 'NOT_FOUND'; }"

if ($checkFinance -match "FOUND") {
    Write-Host "✓ Finance menu found in database!" -ForegroundColor Green
    Write-Host $checkFinance -ForegroundColor Gray
} else {
    Write-Host "WARNING: Finance menu not found in database!" -ForegroundColor Red
    Write-Host "The seeder ran but Finance menu was not created." -ForegroundColor Red
}
Write-Host ""

Write-Host "[Step 4] Verifying Cashflow submenu..." -ForegroundColor Yellow
$checkCashflow = php artisan tinker --execute="`$cashflow = \App\Models\Menu::where('menu_key', 'cashflow')->first(); if (`$cashflow) { echo 'FOUND: ' . `$cashflow->name; } else { echo 'NOT_FOUND'; }"

if ($checkCashflow -match "FOUND") {
    Write-Host "✓ Cashflow submenu found in database!" -ForegroundColor Green
    Write-Host $checkCashflow -ForegroundColor Gray
} else {
    Write-Host "WARNING: Cashflow submenu not found in database!" -ForegroundColor Red
}
Write-Host ""

Write-Host "[Step 5] Listing all menus in database..." -ForegroundColor Yellow
php artisan tinker --execute="echo 'Total menus: ' . \App\Models\Menu::count() . PHP_EOL; \App\Models\Menu::orderBy('order')->get(['name', 'menu_key', 'path'])->each(function(`$m) { echo '- ' . `$m->name . ' (' . `$m->menu_key . ')' . PHP_EOL; });"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DONE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Login to your application" -ForegroundColor White
Write-Host "2. Check if Finance menu appears in sidebar" -ForegroundColor White
Write-Host "3. Click Finance > Cashflow to access the page" -ForegroundColor White
Write-Host ""
pause
