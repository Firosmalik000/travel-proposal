#!/bin/bash

# Script to sync storage from staging to production on Ploi
# Usage: bash scripts/sync-storage.sh [--dry-run]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
STAGING_PATH="/home/ploi/staging.superapp.xboss.id/storage/app/public"
PRODUCTION_PATH="/home/ploi/superapp.xboss.id/storage/app/public"

# Check if dry-run
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}DRY RUN MODE - No files will be copied${NC}"
fi

echo -e "${BLUE}=== Storage Sync from Staging to Production ===${NC}"
echo "Source: $STAGING_PATH"
echo "Destination: $PRODUCTION_PATH"
echo ""

# Check if source exists
if [ ! -d "$STAGING_PATH" ]; then
    echo -e "${RED}Error: Source path does not exist: $STAGING_PATH${NC}"
    exit 1
fi

# Create destination if not exists
if [ ! -d "$PRODUCTION_PATH" ]; then
    echo -e "${GREEN}Creating destination directory...${NC}"
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$PRODUCTION_PATH"
    fi
fi

# Sync using rsync
echo -e "${BLUE}Starting rsync...${NC}"
echo ""

RSYNC_OPTS="-avh --progress --stats"

if [ "$DRY_RUN" = true ]; then
    RSYNC_OPTS="$RSYNC_OPTS --dry-run"
fi

# Run rsync
rsync $RSYNC_OPTS "$STAGING_PATH/" "$PRODUCTION_PATH/"

RSYNC_EXIT_CODE=$?

echo ""
if [ $RSYNC_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Sync completed successfully!${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo ""
        echo -e "${YELLOW}This was a dry run. To actually sync files, run:${NC}"
        echo -e "${BLUE}bash scripts/sync-storage.sh${NC}"
    fi
else
    echo -e "${RED}✗ Sync failed with exit code: $RSYNC_EXIT_CODE${NC}"
    exit $RSYNC_EXIT_CODE
fi

exit 0
