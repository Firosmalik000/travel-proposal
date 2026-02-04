@echo off
echo ========================================
echo  Running Migration
echo ========================================
echo.

echo Running migrations...
php artisan migrate

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Migration failed!
    echo Please check the error message above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Migration completed
echo ========================================
echo.
pause
