<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tamu extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;
    protected $table = 'tamu';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'nik_passpor',
        'no_telp',
        'durasi_tinggal',
        'alamat',
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
     * Get all karyawan in this department.
     */
    public function karyawan(): HasMany
    {
        return $this->hasMany(MasterKaryawan::class);
    }
}
