@echo off
echo ========================================
echo  Running MenuSeeder Only
echo ========================================
echo.

echo Truncating menus table and running MenuSeeder...
php artisan db:seed --class=MenuSeeder

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeder failed!
    echo Please check the error message above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! MenuSeeder completed
echo ========================================
echo.
echo Checking Finance menu...
php artisan tinker --execute="$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if($finance) { echo 'Finance Menu Found: ' . $finance->name . PHP_EOL; } else { echo 'Finance Menu NOT FOUND!' . PHP_EOL; }"

echo.
echo Done!
pause
