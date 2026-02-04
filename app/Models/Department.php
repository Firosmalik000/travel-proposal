<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
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
        'is_active' => 'boolean',
    ];

    /**
     * Get all jabatan for this department.
     */
    public function jabatan(): HasMany
    {
        return $this->hasMany(Jabatan::class);
    }

    /**
     * Get all karyawan in this department.
     */
    public function karyawan(): HasMany
    {
        return $this->hasMany(MasterKaryawan::class);
    }
}
