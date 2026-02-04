import { usePage } from '@inertiajs/react';

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'import' | 'export' | 'approve' | 'reject';

interface PageProps {
    auth: {
        user: any;
        permissions: Record<string, Permission[]> | null;
    };
}

/**
 * Hook to check user permissions for specific menu and action
 *
 * @example
 * const { hasPermission, can } = usePermission('master_jabatan');
 *
 * if (can('create')) {
 *   // Show create button
 * }
 *
 * // Or use hasPermission directly
 * if (hasPermission('master_jabatan', 'edit')) {
 *   // Show edit button
 * }
 */
export function usePermission(menuKey?: string) {
    const { auth } = usePage<PageProps>().props;

    /**
     * Check if user has specific permission for a menu
     *
     * @param menuKeyParam - Menu key to check permission for
     * @param permission - Permission to check (view, create, edit, delete, import, export, approve, reject)
     * @returns boolean - true if user has permission
     */
    const hasPermission = (menuKeyParam: string, permission: Permission): boolean => {
        // If no permissions data, deny access
        if (!auth.permissions) {
            return false;
        }

        // Check if menu key exists in user permissions
        if (!auth.permissions[menuKeyParam]) {
            return false;
        }

        // Check if permission exists in the menu's permission array
        return auth.permissions[menuKeyParam].includes(permission);
    };

    /**
     * Check if user has specific permission for the current menu (set via menuKey parameter)
     *
     * @param permission - Permission to check
     * @returns boolean - true if user has permission
     */
    const can = (permission: Permission): boolean => {
        if (!menuKey) {
            console.warn('usePermission: menuKey not provided. Use hasPermission() instead or provide menuKey to usePermission()');
            return false;
        }

        return hasPermission(menuKey, permission);
    };

    /**
     * Check if user has any of the specified permissions
     *
     * @param permissions - Array of permissions to check
     * @returns boolean - true if user has at least one permission
     */
    const canAny = (permissions: Permission[]): boolean => {
        if (!menuKey) {
            console.warn('usePermission: menuKey not provided');
            return false;
        }

        return permissions.some(permission => hasPermission(menuKey, permission));
    };

    /**
     * Check if user has all of the specified permissions
     *
     * @param permissions - Array of permissions to check
     * @returns boolean - true if user has all permissions
     */
    const canAll = (permissions: Permission[]): boolean => {
        if (!menuKey) {
            console.warn('usePermission: menuKey not provided');
            return false;
        }

        return permissions.every(permission => hasPermission(menuKey, permission));
    };

    /**
     * Get all permissions for a specific menu
     *
     * @param menuKeyParam - Menu key to get permissions for
     * @returns Permission[] - Array of permissions
     */
    const getPermissions = (menuKeyParam?: string): Permission[] => {
        const key = menuKeyParam || menuKey;

        if (!key) {
            console.warn('usePermission: menuKey not provided');
            return [];
        }

        if (!auth.permissions || !auth.permissions[key]) {
            return [];
        }

        return auth.permissions[key];
    };

    return {
        hasPermission,
        can,
        canAny,
        canAll,
        getPermissions,
        permissions: auth.permissions,
    };
}
