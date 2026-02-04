#!/bin/bash

# ============================================
# Ploi Deployment Script
# ============================================
# This script should be added to Ploi Deploy Script
# Site Settings → Deployments → Deploy Script

set -e

echo "======================================"
echo "Starting Deployment Process"
echo "======================================"
echo ""

# Change to project directory
cd /home/ploi/superapp.xboss.id

# 1. Git Pull
echo "[1/8] Pulling latest code from Git..."
git pull origin main
echo "✓ Code updated"
echo ""

# 2. Install Composer Dependencies
echo "[2/8] Installing Composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
echo "✓ Composer dependencies installed"
echo ""

# 3. Install NPM Dependencies & Build
echo "[3/8] Installing NPM dependencies and building assets..."
npm ci
npm run build
echo "✓ Assets built"
echo ""

# 4. Run Database Migrations
echo "[4/8] Running database migrations..."
php artisan migrate --force
echo "✓ Migrations completed"
echo ""

# 5. Clear & Cache Config
echo "[5/8] Clearing and caching configuration..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✓ Cache cleared and rebuilt"
echo ""

# 6. Fix Storage Link (CRITICAL - Prevents photo loss)
echo "[6/8] Fixing storage symbolic link..."

# Define expected paths
CURRENT_LINK=$(readlink -f public/storage 2>/dev/null || echo "NOT_EXISTS")
EXPECTED_PATH="/home/ploi/superapp.xboss.id/storage/app/public"

echo "Current link: $CURRENT_LINK"
echo "Expected path: $EXPECTED_PATH"

# Check if link is incorrect or doesn't exist
if [ "$CURRENT_LINK" != "$EXPECTED_PATH" ]; then
    echo "⚠ Storage link is incorrect or missing. Fixing..."

    # Remove existing link if it exists
    if [ -L public/storage ] || [ -e public/storage ]; then
        echo "Removing old storage link..."
        rm -rf public/storage
    fi

    # Create correct symbolic link
    echo "Creating new storage link..."
    php artisan storage:link --force

    # Verify the fix
    NEW_LINK=$(readlink -f public/storage)
    if [ "$NEW_LINK" = "$EXPECTED_PATH" ]; then
        echo "✓ Storage link fixed successfully"
        echo "New link: $NEW_LINK"
    else
        echo "✗ ERROR: Failed to fix storage link!"
        echo "Please check manually"
        exit 1
    fi
else
    echo "✓ Storage link is correct"
fi

echo ""

# 7. Sync Photos from Staging (One-time or periodic sync)
echo "[7/8] Checking for photos to sync from staging..."

STAGING_STORAGE="/home/ploi/staging.superapp.xboss.id/storage/app/public"
PRODUCTION_STORAGE="/home/ploi/superapp.xboss.id/storage/app/public"

# Only sync if staging exists and has files
if [ -d "$STAGING_STORAGE" ]; then
    # Count files in staging
    STAGING_COUNT=$(find "$STAGING_STORAGE" -type f 2>/dev/null | wc -l)

    if [ $STAGING_COUNT -gt 0 ]; then
        echo "Found $STAGING_COUNT files in staging storage"
        echo "Syncing files from staging to production..."

        # Use rsync to sync only new/changed files
        rsync -a --ignore-existing "$STAGING_STORAGE/" "$PRODUCTION_STORAGE/"

        RSYNC_EXIT=$?
        if [ $RSYNC_EXIT -eq 0 ]; then
            echo "✓ Photos synced from staging"
        else
            echo "⚠ Warning: rsync exited with code $RSYNC_EXIT (might be OK)"
        fi
    else
        echo "No files in staging to sync"
    fi
else
    echo "Staging storage not found (this is OK for production-only)"
fi

echo ""

# 8. Set Permissions
echo "[8/8] Setting correct permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/app/public
chown -R ploi:ploi storage bootstrap/cache
echo "✓ Permissions set"
echo ""

# Final verification
echo "======================================"
echo "Deployment Verification"
echo "======================================"

# Verify storage link
FINAL_LINK=$(readlink -f public/storage)
echo "✓ Storage link: $FINAL_LINK"

# Count total photos
PHOTO_COUNT=$(find storage/app/public -type f 2>/dev/null | wc -l)
echo "✓ Total files in storage: $PHOTO_COUNT"

# Check disk space
DISK_USAGE=$(df -h /home/ploi | tail -1 | awk '{print $5}')
echo "✓ Disk usage: $DISK_USAGE"

echo ""
echo "======================================"
echo "✓ Deployment Completed Successfully!"
echo "======================================"
echo ""

# Restart PHP-FPM (optional, uncomment if needed)
# sudo service php8.3-fpm reload

exit 0
