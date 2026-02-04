@echo off
cls
echo ========================================
echo  Seeding Finance Menu to Database
echo ========================================
echo.

echo [Step 1] Checking if in correct directory...
if not exist "artisan" (
    echo ERROR: artisan file not found!
    echo Please run this script from project root.
    pause
    exit /b 1
)
echo OK - In correct directory
echo.

echo [Step 2] Running MenuSeeder...
echo.
php artisan db:seed --class=MenuSeeder

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: MenuSeeder failed!
    echo.
    echo Common solutions:
    echo 1. Make sure MySQL is running in Laragon
    echo 2. Check database exists in phpMyAdmin
    echo 3. Verify .env database credentials
    echo 4. Try: php artisan config:clear
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Seeder completed successfully!
echo ========================================
echo.

echo [Step 3] Verifying Finance menu...
echo.
php artisan tinker --execute="$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if($finance) { echo 'SUCCESS: Finance menu found - ' . $finance->name . PHP_EOL; } else { echo 'ERROR: Finance menu NOT found in database!' . PHP_EOL; } $cashflow = \App\Models\Menu::where('menu_key', 'cashflow')->first(); if($cashflow) { echo 'SUCCESS: Cashflow menu found - ' . $cashflow->name . PHP_EOL; } else { echo 'ERROR: Cashflow menu NOT found in database!' . PHP_EOL; }"

echo.
echo [Step 4] All menus in database:
echo.
php artisan tinker --execute="echo 'Total menus: ' . \App\Models\Menu::count() . PHP_EOL . PHP_EOL; \App\Models\Menu::orderBy('order')->get(['id', 'name', 'menu_key'])->each(function($m) { echo $m->id . '. ' . $m->name . ' (' . $m->menu_key . ')' . PHP_EOL; });"

echo.
echo ========================================
echo  DONE!
echo ========================================
echo.
echo You can now:
echo 1. Login to your application
echo 2. Look for Finance menu in sidebar
echo 3. Click Finance ^> Cashflow
echo.
pause
