@echo off
echo ========================================
echo Migrate Multiple Attachments Feature
echo ========================================
echo.

echo Step 1: Remove old attachment column (if exists)...
php artisan migrate --path=database/migrations/2025_01_25_000003_remove_old_attachment_column.php
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to remove old column!
    echo Try running manually:
    echo   ALTER TABLE cashflows DROP COLUMN attachment;
    pause
    exit /b 1
)
echo [SUCCESS] Old column removed!
echo.

echo Step 2: Create cashflow_attachments table...
php artisan migrate --path=database/migrations/2025_01_25_000002_create_cashflow_attachments_table.php
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create attachments table!
    pause
    exit /b 1
)
echo [SUCCESS] Attachments table created!
echo.

echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Test the multiple upload feature
echo.
pause
