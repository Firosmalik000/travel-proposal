<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAccess extends Model
{
    use HasAuditTrail;
    use HasFactory;

    protected $fillable = [
        'user_id',
        'access',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'access' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function hasPermission(int $userId, string $menuKey, string $permission): bool
    {
        if (static::isSuperAdmin($userId)) {
            return true;
        }

        $userAccess = static::query()->where('user_id', $userId)->first();

        if (! $userAccess || ! is_array($userAccess->access[$menuKey] ?? null)) {
            return false;
        }

        return in_array($permission, $userAccess->access[$menuKey], true);
    }

    public static function getAccessibleMenus(int $userId): array
    {
        if (static::isSuperAdmin($userId)) {
            return Menu::query()
                ->orderBy('order')
                ->get()
                ->flatMap(fn (Menu $menu): array => $menu->getAllMenuKeys())
                ->values()
                ->unique()
                ->all();
        }

        $userAccess = static::query()->where('user_id', $userId)->first();

        if (! $userAccess || ! is_array($userAccess->access)) {
            return [];
        }

        return collect($userAccess->access)
            ->filter(fn (mixed $permissions): bool => is_array($permissions) && in_array('view', $permissions, true))
            ->keys()
            ->values()
            ->all();
    }

    public static function getMenuPermissions(int $userId, string $menuKey): array
    {
        if (static::isSuperAdmin($userId)) {
            return ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];
        }

        $userAccess = static::query()->where('user_id', $userId)->first();

        if (! $userAccess || ! isset($userAccess->access[$menuKey]) || ! is_array($userAccess->access[$menuKey])) {
            return [];
        }

        return $userAccess->access[$menuKey];
    }

    public static function grantPermission(int $userId, string $menuKey, array $permissions): void
    {
        $userAccess = static::query()->firstOrNew(['user_id' => $userId]);
        $currentAccess = $userAccess->access ?? [];
        $currentAccess[$menuKey] = array_values(array_unique($permissions));

        $userAccess->access = $currentAccess;
        $userAccess->save();
    }

    public static function revokePermission(int $userId, string $menuKey): void
    {
        $userAccess = static::query()->where('user_id', $userId)->first();

        if (! $userAccess) {
            return;
        }

        $currentAccess = $userAccess->access ?? [];
        unset($currentAccess[$menuKey]);

        $userAccess->access = $currentAccess;
        $userAccess->save();
    }

    public static function getAllAccessForUser(int $userId): array
    {
        if (static::isSuperAdmin($userId)) {
            $allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];

            return Menu::query()
                ->orderBy('order')
                ->get()
                ->flatMap(fn (Menu $menu): array => $menu->getAllMenuKeys())
                ->values()
                ->unique()
                ->mapWithKeys(fn (string $menuKey): array => [$menuKey => $allPermissions])
                ->all();
        }

        $userAccess = static::query()->where('user_id', $userId)->first();

        return is_array($userAccess?->access) ? $userAccess->access : [];
    }

    private static function isSuperAdmin(int $userId): bool
    {
        return User::query()->whereKey($userId)->first()?->isSuperAdmin() ?? false;
    }
}
