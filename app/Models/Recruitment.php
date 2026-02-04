<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recruitment extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    protected $table = 'recruitment';

    protected $fillable = [
        // Data Pribadi
        'nik_paspor',
        'nama_lengkap',
        'nama_panggilan',
        'email',
        'tempat_lahir',
        'tanggal_lahir',
        'kewarganegaraan',
        'status_pernikahan',
        'agama',
        'alamat',
        'foto_kandidat',
        'cv_file',
        'link_portofolio',
        'bersedia_luar_kota',
        'instagram',
        'tiktok',
        'facebook',
        'tgl_interview',
        'status_interview',
        'link_meet',
        'posisi_dilamar',
        'ekspektasi_gaji',
        'salary',

        // Data JSON
        'sekolah',
        'pengalaman_kerja',
        'skill',
        'bahasa',
        'sertifikat',
        'ai_tools',

        // Interview
        'interview_hrd_by',
        'interview_user_by',

        // HRD Approval
        'accepted_hrd_by',
        'accepted_hrd_at',
        'rejected_hrd_by',
        'rejected_hrd_at',
        'reason_reject_hrd',
        'review_hrd',

        // User Approval
        'accepted_user_by',
        'accepted_user_at',
        'rejected_user_by',
        'rejected_user_at',
        'reason_reject_user',
        'review_user',

        // Boss Approval
        'accepted_boss_by',
        'accepted_boss_at',
        'rejected_boss_by',
        'rejected_boss_at',

        // Offer Approval
        'accepted_offer_by',
        'accepted_offer_at',
        'rejected_offer_by',
        'rejected_offer_at',
        'reason_reject_offer',

        // Rejection reason (unified)
        'reason_reject',

        // Status
        'status',
        'is_blacklist',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'tgl_interview' => 'date',
        'bersedia_luar_kota' => 'boolean',
        'sekolah' => 'array',
        'pengalaman_kerja' => 'array',
        'skill' => 'array',
        'bahasa' => 'array',
        'sertifikat' => 'array',
        'ai_tools' => 'array',
        'accepted_hrd_at' => 'datetime',
        'rejected_hrd_at' => 'datetime',
        'accepted_user_at' => 'datetime',
        'rejected_user_at' => 'datetime',
        'accepted_boss_at' => 'datetime',
        'rejected_boss_at' => 'datetime',
        'accepted_offer_at' => 'datetime',
        'rejected_offer_at' => 'datetime',
        'is_blacklist' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $appends = ['foto_kandidat_url', 'cv_file_url'];

    // Relationships
    public function interviewHrdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interview_hrd_by');
    }

    public function interviewUserBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interview_user_by');
    }

    public function acceptedHrdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_hrd_by');
    }

    public function rejectedHrdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_hrd_by');
    }

    public function acceptedUserBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_user_by');
    }

    public function rejectedUserBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_user_by');
    }

    public function acceptedOfferBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_offer_by');
    }

    public function rejectedOfferBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_offer_by');
    }

    public function acceptedBossBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_boss_by');
    }

    public function rejectedBossBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_boss_by');
    }

    public function reviewHrd(): BelongsTo
    {
        return $this->belongsTo(ReviewKandidat::class, 'review_hrd');
    }

    public function reviewUser(): BelongsTo
    {
        return $this->belongsTo(ReviewKandidat::class, 'review_user');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ReviewKandidat::class, 'recruitment_id');
    }

    // Accessors for MinIO URLs
    public function getFotoKandidatUrlAttribute(): ?string
    {
        if (!$this->foto_kandidat) {
            return null;
        }

        try {
            return \Storage::disk('minio')->url($this->foto_kandidat);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL for foto_kandidat: {$this->foto_kandidat}");
            return null;
        }
    }

    public function getCvFileUrlAttribute(): ?string
    {
        if (!$this->cv_file) {
            return null;
        }

        try {
            return \Storage::disk('minio')->url($this->cv_file);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL for cv_file: {$this->cv_file}");
            return null;
        }
    }
}
