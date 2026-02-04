<?php

namespace App\Models;

use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArsipDataKaryawan extends Model
{
    use SoftDeletesWithActive;

    protected $table = 'arsip_data_karyawan';

    protected $fillable = [
        'user_id',
        'data',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the arsip data karyawan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
