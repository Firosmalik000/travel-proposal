<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAccess extends Model
{
    use HasFactory, HasAuditTrail;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'access',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'access' => 'array', // Cast JSON to array
    ];

    /**
     * Get the user that owns the access.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has specific permission for a menu.
     *
     * @param int $userId
     * @param string $menuKey (e.g., 'master_karyawan', 'master_jabatan')
     * @param string $permission (e.g., 'view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject')
     * @return bool
     */
    public static function hasPermission(int $userId, string $menuKey, string $permission): bool
    {
        $userAccess = static::where('user_id', $userId)->first();

        if (!$userAccess || !$userAccess->access) {
            return false;
        }

        // Check if menu key exists in access array
        if (!isset($userAccess->access[$menuKey])) {
            return false;
        }

        // Check if permission exists and is true in the menu's permission object
        return $userAccess->access[$menuKey][$permission] ?? false;
    }

    /**
     * Get all accessible menu keys for a user.
     *
     * @param int $userId
     * @return array
     */
    public static function getAccessibleMenus(int $userId): array
    {
        $userAccess = static::where('user_id', $userId)->first();
        \Log::info('🔐 UserAccess::getAccessibleMenus', [
            'user_id' => $userId,
            'found' => $userAccess ? 'yes' : 'no',
            'access_data' => $userAccess ? $userAccess->access : null
        ]);

        if (!$userAccess || !$userAccess->access) {
            \Log::warning('⚠️ No user access found or access is null');
            return [];
        }

        // Return only menus that have 'view' permission
        $accessibleMenus = [];
        foreach ($userAccess->access as $menuKey => $permissions) {
            if (in_array('view', $permissions)) {
                $accessibleMenus[] = $menuKey;
            }
        }

        \Log::info('✅ Accessible menus extracted:', ['menus' => $accessibleMenus]);
        return $accessibleMenus;
    }

    /**
     * Get user's permissions for a specific menu.
     *
     * @param int $userId
     * @param string $menuKey
     * @return array
     */
    public static function getMenuPermissions(int $userId, string $menuKey): array
    {
        $userAccess = static::where('user_id', $userId)->first();

        if (!$userAccess || !$userAccess->access || !isset($userAccess->access[$menuKey])) {
            return [];
        }

        return $userAccess->access[$menuKey];
    }

    /**
     * Grant or update permissions for a user.
     *
     * @param int $userId
     * @param string $menuKey
     * @param array $permissions
     * @return void
     */
    public static function grantPermission(int $userId, string $menuKey, array $permissions): void
    {
        $userAccess = static::firstOrNew(['user_id' => $userId]);

        $currentAccess = $userAccess->access ?? [];
        $currentAccess[$menuKey] = $permissions;

        $userAccess->access = $currentAccess;
        $userAccess->save();
    }

    /**
     * Revoke all permissions for a menu.
     *
     * @param int $userId
     * @param string $menuKey
     * @return void
     */
    public static function revokePermission(int $userId, string $menuKey): void
    {
        $userAccess = static::where('user_id', $userId)->first();

        if (!$userAccess) {
            return;
        }

        $currentAccess = $userAccess->access ?? [];
        unset($currentAccess[$menuKey]);

        $userAccess->access = $currentAccess;
        $userAccess->save();
    }

    /**
     * Get all access data for a user (formatted for display).
     *
     * @param int $userId
     * @return array
     */
    public static function getAllAccessForUser(int $userId): array
    {
        $userAccess = static::where('user_id', $userId)->first();

        if (!$userAccess || !$userAccess->access) {
            return [];
        }

        return $userAccess->access;
    }
}
