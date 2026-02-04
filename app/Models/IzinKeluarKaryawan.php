<?php

namespace App\Models;

use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IzinKeluarKaryawan extends Model
{
    use SoftDeletesWithActive;

    protected $table = 'izin_keluar_karyawan';

    protected $fillable = [
        'user_id',
        'tanggal',
        'jam_keluar',
        'jam_kembali',
        'keterangan',
        'status',
        'is_active',
        'created_by',
        'updated_by',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jam_keluar' => 'datetime:H:i',
        'jam_kembali' => 'datetime:H:i',
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the user that owns the izin keluar.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
