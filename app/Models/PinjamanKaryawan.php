<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PinjamanKaryawan extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    protected $table = 'pinjaman_karyawan';

    protected $fillable = [
        'user_id',
        'nominal',
        'nama_bank',
        'nomor_rekening',
        'file_scorelife',
        'id_privy',
        'status',
        'is_approve',
        'approved_by',
        'approved_at',
        'is_rejected',
        'rejected_by',
        'rejected_at',
        'reason_reject',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'is_approve' => 'boolean',
        'is_rejected' => 'boolean',
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    protected $appends = ['file_scorelife_url'];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessor for MinIO URL
    public function getFileScorelifeUrlAttribute(): ?string
    {
        if (!$this->file_scorelife) {
            return null;
        }

        try {
            return \Storage::disk(config('filesystems.default'))->url($this->file_scorelife);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL for file_scorelife: {$this->file_scorelife}");
            return null;
        }
    }
}
