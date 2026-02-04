<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeminjamanBarang extends Model
{
    protected $table = 'peminjaman_barang';

    protected $fillable = [
        'inventaris_id',
        'jumlah_pinjam',
        'tanggal_pinjam',
        'tanggal_kembali_rencana',
        'tanggal_kembali_aktual',
        'keperluan',
        'keterangan',
        'foto_pinjam',
        'foto_kembali',
        'is_approved',
        'approved_by',
        'approved_at',
        'is_rejected',
        'rejected_by',
        'rejected_at',
        'reason_reject',
        'status',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'is_rejected' => 'boolean',
        'is_active' => 'boolean',
        'tanggal_pinjam' => 'date',
        'tanggal_kembali_rencana' => 'date',
        'tanggal_kembali_aktual' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'foto_pinjam' => 'array',
        'foto_kembali' => 'array',
    ];

    protected $appends = ['foto_pinjam_urls', 'foto_kembali_urls'];

    /**
     * Get the inventaris that is being borrowed
     */
    public function inventaris(): BelongsTo
    {
        return $this->belongsTo(Inventaris::class);
    }

    /**
     * Get the user who created this peminjaman
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who updated this peminjaman
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the user who approved this peminjaman
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected this peminjaman
     */
    public function rejecter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    // Accessors for MinIO URLs
    public function getFotoPinjamUrlsAttribute(): ?array
    {
        if (!$this->foto_pinjam || !is_array($this->foto_pinjam)) {
            return null;
        }

        $urls = array_map(function ($path) {
            try {
                return \Storage::disk(config('filesystems.default'))->url($path);
            } catch (\Exception $e) {
                \Log::warning("Failed to generate MinIO URL for foto_pinjam: {$path}");
                return null;
            }
        }, $this->foto_pinjam);

        return array_filter($urls);
    }

    public function getFotoKembaliUrlsAttribute(): ?array
    {
        if (!$this->foto_kembali || !is_array($this->foto_kembali)) {
            return null;
        }

        $urls = array_map(function ($path) {
            try {
                return \Storage::disk(config('filesystems.default'))->url($path);
            } catch (\Exception $e) {
                \Log::warning("Failed to generate MinIO URL for foto_kembali: {$path}");
                return null;
            }
        }, $this->foto_kembali);

        return array_filter($urls);
    }
}
