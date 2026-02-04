@echo off
color 0B
title Run All Migrations
cls

echo.
echo ========================================================================
echo                   RUN ALL MIGRATIONS
echo ========================================================================
echo.
echo This will run ALL pending migrations including cashflows table
echo.
echo ========================================================================
echo.

pause

cls
echo.
echo Running all migrations...
echo.

php artisan migrate

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Try these solutions:
    echo   1. Make sure Laragon MySQL is running
    echo   2. Check database exists in phpMyAdmin
    echo   3. Verify .env database settings
    echo   4. Try: php artisan migrate:fresh --seed (WARNING: Deletes all data)
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================================
color 0A
echo [SUCCESS] All migrations completed!
echo.
echo Verifying cashflows table...
echo.

php artisan tinker --execute="try { $count = DB::table('cashflows')->count(); echo '[OK] Table cashflows exists with ' . $count . ' records' . PHP_EOL; } catch (Exception $e) { echo '[ERROR] ' . $e->getMessage() . PHP_EOL; }"

echo.
echo ========================================================================
echo.
echo You can now access:
echo   http://super-apps-xboss.test/dashboard/finance/cashflow
echo.
echo ========================================================================
echo.
pause
