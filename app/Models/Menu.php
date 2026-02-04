<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'menu_key',
        'path',
        'icon',
        'children',
        'order',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'children' => 'array', // Cast JSON to array
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get all user accesses for this menu.
     */
    public function userAccesses(): HasMany
    {
        return $this->hasMany(UserAccess::class);
    }

    /**
     * Get all menu keys recursively (including nested children).
     */
    public function getAllMenuKeys(): array
    {
        $keys = [$this->menu_key];

        if (!empty($this->children)) {
            foreach ($this->children as $child) {
                $keys[] = $child['menu_key'] ?? null;

                // Level 2 children
                if (!empty($child['children'])) {
                    foreach ($child['children'] as $grandChild) {
                        $keys[] = $grandChild['menu_key'] ?? null;
                    }
                }
            }
        }

        return array_filter($keys);
    }

    /**
     * Check if menu has children.
     */
    public function hasChildren(): bool
    {
        return !empty($this->children);
    }

    /**
     * Get all navigable paths (deepest level paths only).
     */
    public static function getNavigablePaths(): array
    {
        $menus = static::orderBy('order')->get();
        $paths = [];

        foreach ($menus as $menu) {
            $paths = array_merge($paths, $menu->extractNavigablePaths());
        }

        return $paths;
    }

    /**
     * Extract navigable paths from menu structure.
     */
    public function extractNavigablePaths(): array
    {
        $paths = [];

        // If no children, this menu is navigable
        if (empty($this->children)) {
            $paths[] = [
                'menu_key' => $this->menu_key,
                'path' => $this->path,
                'name' => $this->name,
            ];
        } else {
            // Check children
            foreach ($this->children as $child) {
                // If child has no children (level 2), it's navigable
                if (empty($child['children'])) {
                    $paths[] = [
                        'menu_key' => $child['menu_key'] ?? null,
                        'path' => $child['path'] ?? null,
                        'name' => $child['name'] ?? null,
                    ];
                } else {
                    // Check grandchildren (level 2)
                    foreach ($child['children'] as $grandChild) {
                        $paths[] = [
                            'menu_key' => $grandChild['menu_key'] ?? null,
                            'path' => $grandChild['path'] ?? null,
                            'name' => $grandChild['name'] ?? null,
                        ];
                    }
                }
            }
        }

        return array_filter($paths);
    }
}
