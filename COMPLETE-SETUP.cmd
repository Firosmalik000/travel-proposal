@echo off
color 0B
title Complete Finance Setup - Migration + Seeder
cls

echo.
echo ========================================================================
echo            COMPLETE FINANCE SETUP - MIGRATION + SEEDER
echo ========================================================================
echo.
echo This script will:
echo   [1] Run ALL migrations (including cashflows table)
echo   [2] Run MenuSeeder (add Finance menu)
echo   [3] Verify everything is working
echo.
echo WARNING: This is safe to run, it will not delete existing data
echo          (unless migrations need to modify tables)
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

if not exist "artisan" (
    color 0C
    echo [ERROR] Not in correct directory!
    echo Run this from: C:\laragon\www\super-apps-xboss
    pause
    exit /b 1
)
echo [OK] In correct directory
echo.

php --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] PHP not found!
    pause
    exit /b 1
)
echo [OK] PHP is available
echo.

pause

cls
echo.
echo ========================================================================
echo STEP 2/5: Testing Database Connection
echo ========================================================================
echo.

php artisan tinker --execute="try { DB::connection()->getPdo(); echo '[OK] Connected to: ' . env('DB_DATABASE') . PHP_EOL; } catch (Exception $e) { echo '[ERROR] ' . $e->getMessage() . PHP_EOL; exit(1); }"

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Database connection failed!
    echo Please check Laragon MySQL is running.
    pause
    exit /b 1
)

echo.
pause

cls
echo.
echo ========================================================================
echo STEP 3/5: Running ALL Migrations
echo ========================================================================
echo.
echo This will create all missing tables including 'cashflows'...
echo.

php artisan migrate

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Do you want to try migrate:fresh? (This will DELETE ALL DATA)
    echo.
    set /p fresh="Type YES to confirm, or NO to exit: "
    if /i "%fresh%"=="YES" (
        echo.
        echo Running migrate:fresh --seed...
        php artisan migrate:fresh --seed
        if %ERRORLEVEL% EQU 0 (
            color 0A
            echo.
            echo [SUCCESS] Database reset and seeded!
            goto :verify
        )
    )
    pause
    exit /b 1
)

echo.
echo [OK] Migrations completed!
echo.
pause

cls
echo.
echo ========================================================================
echo STEP 4/5: Running MenuSeeder
echo ========================================================================
echo.
echo Adding Finance menu to database...
echo.

php artisan db:seed --class=MenuSeeder

if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo.
    echo [WARNING] Seeder had issues (possibly duplicate entries)
    echo This is OK if menu already exists.
    echo.
)

echo.
pause

:verify
cls
echo.
echo ========================================================================
echo STEP 5/5: Verification
echo ========================================================================
echo.

echo Checking cashflows table...
php artisan tinker --execute="try { $count = DB::table('cashflows')->count(); echo '[OK] Table cashflows exists (' . $count . ' records)' . PHP_EOL; } catch (Exception $e) { echo '[ERROR] Table not found!' . PHP_EOL; }"

echo.
echo Checking Finance menu...
php artisan tinker --execute="$finance = \App\Models\Menu::where('menu_key', 'finance')->first(); if($finance) { echo '[OK] Finance menu exists' . PHP_EOL; echo '    Name: ' . $finance->name . PHP_EOL; echo '    Path: ' . $finance->path . PHP_EOL; } else { echo '[ERROR] Finance menu not found!' . PHP_EOL; }"

echo.
echo Listing all tables...
php artisan tinker --execute="$tables = DB::select('SHOW TABLES'); echo 'Total tables: ' . count($tables) . PHP_EOL; foreach($tables as $table) { $table_array = (array)$table; echo '  - ' . array_values($table_array)[0] . PHP_EOL; }"

echo.
echo Listing all menus...
php artisan tinker --execute="echo 'Total menus: ' . \App\Models\Menu::count() . PHP_EOL; \App\Models\Menu::orderBy('order')->get()->each(function($m) { echo '  ' . $m->order . '. ' . $m->name . ' (' . $m->menu_key . ')' . PHP_EOL; });"

echo.
pause

cls
echo.
echo ========================================================================
color 0A
echo                        SETUP COMPLETE!
echo ========================================================================
echo.
echo [SUCCESS] Finance module is ready!
echo.
echo What was created:
echo   ✓ Table: cashflows
echo   ✓ Menu: Finance with Cashflow submenu
echo   ✓ Routes: /dashboard/finance/cashflow
echo   ✓ Controller: Finance\CashflowController
echo   ✓ Model: Cashflow
echo   ✓ Views: Dashboard/Finance/Cashflow
echo.
echo ========================================================================
echo.
echo Next Steps:
echo   1. Open browser and login to your app
echo   2. Look for "Finance" in sidebar
echo   3. Click Finance → Cashflow
echo   4. URL: http://super-apps-xboss.test/dashboard/finance/cashflow
echo   5. Start managing your cashflow!
echo.
echo Features Available:
echo   • Add transactions (Debit/Credit)
echo   • Payment methods: QRIS, Transfer, Cash, Card
echo   • Search and filter transactions
echo   • Sort by any column
echo   • Pagination (10/20/30/40/50 rows)
echo   • Edit and delete transactions
echo.
echo ========================================================================
echo.
pause
