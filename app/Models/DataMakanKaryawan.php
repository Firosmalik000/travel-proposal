<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataMakanKaryawan extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'data_makan_karyawan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'tanggal',
        'jumlah',
        'total',
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
        'tanggal' => 'date',
        'jumlah' => 'integer',
        'total' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user (karyawan) that this record belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
