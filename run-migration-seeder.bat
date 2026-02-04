@echo off
echo ========================================
echo  Running Migration Fresh with Seeder
echo ========================================
echo.

echo [1/2] Dropping all tables and re-running migrations...
php artisan migrate:fresh

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Migration failed!
    echo Please check the error message above.
    pause
    exit /b 1
)

echo.
echo [2/2] Running all seeders...
php artisan db:seed

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeder failed!
    echo Please check the error message above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Database migrated and seeded
echo ========================================
echo.
echo Checking Finance menu...
php artisan tinker --execute="echo 'Finance Menu: '; print_r(\App\Models\Menu::where('menu_key', 'finance')->first()->toArray()); echo PHP_EOL . 'Cashflow Menu: '; print_r(\App\Models\Menu::where('menu_key', 'cashflow')->first()->toArray());"

echo.
echo Done!
pause
