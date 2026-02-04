@echo off
color 0E
title Fix Cashflow Table - Migration Required
cls

echo.
echo ========================================================================
echo                   FIX CASHFLOW TABLE ERROR
echo ========================================================================
echo.
echo ERROR DETECTED: Table 'cashflows' doesn't exist
echo.
echo SOLUTION: We need to run the migration to create the table
echo.
echo ========================================================================
echo.

pause

cls
echo.
echo ========================================================================
echo STEP 1/4: Checking Migration File
echo ========================================================================
echo.

if exist "database\migrations\2025_01_22_000006_create_cashflows_table.php" (
    echo [OK] Migration file found!
    echo Location: database\migrations\2025_01_22_000006_create_cashflows_table.php
) else (
    color 0C
    echo [ERROR] Migration file not found!
    echo Expected: database\migrations\2025_01_22_000006_create_cashflows_table.php
    echo.
    pause
    exit /b 1
)

echo.
pause

cls
echo.
echo ========================================================================
echo STEP 2/4: Running Migration
echo ========================================================================
echo.
echo This will create the 'cashflows' table in your database...
echo.

php artisan migrate --path=database/migrations/2025_01_22_000006_create_cashflows_table.php

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Common solutions:
    echo 1. Check if MySQL is running in Laragon
    echo 2. Verify database exists
    echo 3. Check .env database credentials
    echo.
    echo Or try running ALL migrations:
    echo    php artisan migrate
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Migration completed!
echo.
pause

cls
echo.
echo ========================================================================
echo STEP 3/4: Verifying Table Exists
echo ========================================================================
echo.

echo Checking if 'cashflows' table exists...
echo.
php artisan tinker --execute="try { DB::table('cashflows')->count(); echo '[SUCCESS] Table cashflows exists!' . PHP_EOL; } catch (Exception $e) { echo '[ERROR] Table still not found: ' . $e->getMessage() . PHP_EOL; exit(1); }"

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Table was not created!
    pause
    exit /b 1
)

echo.
pause

cls
echo.
echo ========================================================================
echo STEP 4/4: Testing Cashflow Page
echo ========================================================================
echo.

echo The cashflows table is now created!
echo.
echo Table structure:
echo   - id
echo   - date
echo   - type (debit/credit)
echo   - amount
echo   - description
echo   - method (QRIS/Transfer/Cash/Card)
echo   - created_at
echo   - updated_at
echo.
echo You can now access the page at:
echo   http://super-apps-xboss.test/dashboard/finance/cashflow
echo.
echo ========================================================================
echo.
color 0A
echo [SUCCESS] Cashflow table created!
echo.
echo Next steps:
echo   1. Refresh your browser
echo   2. Access: /dashboard/finance/cashflow
echo   3. Start adding cashflow transactions!
echo.
echo ========================================================================
echo.
pause
