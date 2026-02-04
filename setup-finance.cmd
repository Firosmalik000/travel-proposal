@echo off
color 0A
title Finance Menu Setup - Super Apps XBoss
cls

echo.
echo ========================================================================
echo                     FINANCE MENU SETUP WIZARD
echo ========================================================================
echo.
echo This script will:
echo   1. Check your environment
echo   2. Run database seeder
echo   3. Verify Finance menu is created
echo   4. Test database connection
echo.
echo ========================================================================
echo.

pause

cls
echo.
echo ========================================================================
echo STEP 1/5: Checking Environment
echo ========================================================================
echo.

echo Checking if in correct directory...
if not exist "artisan" (
    color 0C
    echo [ERROR] artisan file not found!
    echo.
    echo Please run this script from: C:\laragon\www\super-apps-xboss
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)
echo [OK] Found artisan file
echo.

echo Checking if Composer is installed...
composer --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo [WARNING] Composer not found in PATH
    echo This might cause issues later
    echo.
) else (
    echo [OK] Composer is installed
)
echo.

echo Checking if PHP is installed...
php --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] PHP not found!
    echo Please make sure Laragon is installed and PHP is in PATH
    echo.
    pause
    exit /b 1
)
echo [OK] PHP is installed
php --version | findstr "PHP"
echo.

pause

cls
echo.
echo ========================================================================
echo STEP 2/5: Testing Database Connection
echo ========================================================================
echo.

echo Testing connection to MySQL database...
echo.
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'SUCCESS: Connected to database: ' . env('DB_DATABASE') . PHP_EOL; } catch (Exception $e) { echo 'ERROR: ' . $e->getMessage() . PHP_EOL; exit(1); }"

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Database connection failed!
    echo.
    echo Please check:
    echo   1. Laragon is running (click Start All)
    echo   2. MySQL service is green in Laragon
    echo   3. Database exists in phpMyAdmin
    echo   4. .env file has correct DB credentials
    echo.
    echo Press any key to open Laragon...
    pause
    start "" "C:\laragon\laragon.exe"
    exit /b 1
)

echo.
pause

cls
echo.
echo ========================================================================
echo STEP 3/5: Running Database Seeder
echo ========================================================================
echo.

echo This will insert all menus including Finance to database...
echo NOTE: This will TRUNCATE the menus table first!
echo.
echo Press Ctrl+C to cancel or
pause

echo.
echo Running MenuSeeder...
echo.
php artisan db:seed --class=MenuSeeder

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Seeder failed!
    echo.
    echo Try these solutions:
    echo   1. php artisan config:clear
    echo   2. composer dump-autoload
    echo   3. Check error message above
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] MenuSeeder completed!
echo.
pause

cls
echo.
echo ========================================================================
echo STEP 4/5: Verifying Finance Menu
echo ========================================================================
echo.

echo Checking if Finance menu exists in database...
echo.
php artisan tinker --execute="$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if($finance) { echo '[SUCCESS] Finance menu found!' . PHP_EOL; echo 'Name: ' . $finance->name . PHP_EOL; echo 'Path: ' . $finance->path . PHP_EOL; echo 'Icon: ' . $finance->icon . PHP_EOL; echo 'Order: ' . $finance->order . PHP_EOL; } else { echo '[ERROR] Finance menu NOT found in database!' . PHP_EOL; exit(1); }"

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Finance menu was not created!
    echo Check the error above for details.
    echo.
    pause
    exit /b 1
)

echo.
echo Checking if Cashflow submenu exists...
echo.
php artisan tinker --execute="$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if($finance && $finance->children) { $children = json_decode($finance->children, true); $cashflow = collect($children)->firstWhere('menu_key', 'cashflow'); if($cashflow) { echo '[SUCCESS] Cashflow submenu found!' . PHP_EOL; echo 'Name: ' . $cashflow['name'] . PHP_EOL; echo 'Path: ' . $cashflow['path'] . PHP_EOL; } else { echo '[ERROR] Cashflow submenu NOT found!' . PHP_EOL; } } else { echo '[ERROR] No children in Finance menu!' . PHP_EOL; }"

echo.
pause

cls
echo.
echo ========================================================================
echo STEP 5/5: Summary
echo ========================================================================
echo.

echo All menus in database:
echo.
php artisan tinker --execute="echo 'Total menus: ' . \App\Models\Menu::count() . PHP_EOL . PHP_EOL; \App\Models\Menu::orderBy('order')->get()->each(function($m) { echo str_pad($m->order, 2, '0', STR_PAD_LEFT) . '. ' . $m->name . ' (' . $m->menu_key . ')'; if($m->children) { $count = count(json_decode($m->children, true)); echo ' - ' . $count . ' submenu(s)'; } echo PHP_EOL; });"

echo.
echo ========================================================================
echo.
color 0A
echo [SUCCESS] Finance Menu Setup Complete!
echo.
echo ========================================================================
echo.
echo Next Steps:
echo   1. Login to your application
echo   2. Look for "Finance" menu in sidebar
echo   3. Click Finance to expand
echo   4. Click "Cashflow" submenu
echo   5. You should see: /dashboard/finance/cashflow
echo.
echo Files Created:
echo   - Controller: app/Http/Controllers/Finance/CashflowController.php
echo   - Model: app/Models/Cashflow.php
echo   - Views: resources/js/pages/Dashboard/Finance/Cashflow/
echo   - Routes: Added to routes/web.php
echo.
echo Features:
echo   - Add/Edit/Delete cashflow transactions
echo   - Debit (Masuk) / Credit (Keluar)
echo   - Payment methods: QRIS, Transfer, Cash, Card
echo   - Sortable DataTable with search and pagination
echo.
echo ========================================================================
echo.
echo Press any key to exit...
pause >nul
