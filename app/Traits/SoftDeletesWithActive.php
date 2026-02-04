<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait SoftDeletesWithActive
{
    /**
     * Boot the soft deletes with active trait for a model.
     */
    public static function bootSoftDeletesWithActive()
    {
        // Add global scope to filter only active records
        static::addGlobalScope('active', function (Builder $builder) {
            $builder->where('is_active', 1);
        });
    }

    /**
     * Override delete method to set is_active = 0 instead of hard delete.
     *
     * @return bool|null
     */
    public function delete()
    {
        if ($this->fireModelEvent('deleting') === false) {
            return false;
        }

        // Update is_active to 0 instead of deleting
        $this->is_active = 0;
        $result = $this->save();

        $this->fireModelEvent('deleted', false);

        return $result;
    }

    /**
     * Restore a soft-deleted model.
     *
     * @return bool|null
     */
    public function restore()
    {
        if ($this->fireModelEvent('restoring') === false) {
            return false;
        }

        $this->is_active = 1;
        $result = $this->save();

        $this->fireModelEvent('restored', false);

        return $result;
    }

    /**
     * Force delete the model (hard delete).
     *
     * @return bool|null
     */
    public function forceDelete()
    {
        return parent::delete();
    }

    /**
     * Scope to only get active records.
     * This is useful when you want to explicitly query active records
     * even when the global scope is removed.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * Scope to include inactive records.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeWithInactive(Builder $query)
    {
        return $query->withoutGlobalScope('active');
    }

    /**
     * Scope to only get inactive records.
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeOnlyInactive(Builder $query)
    {
        return $query->withoutGlobalScope('active')->where('is_active', 0);
    }

    /**
     * Determine if the model instance is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->is_active == 1;
    }

    /**
     * Determine if the model instance is inactive (soft deleted).
     *
     * @return bool
     */
    public function isInactive(): bool
    {
        return $this->is_active == 0;
    }
}
