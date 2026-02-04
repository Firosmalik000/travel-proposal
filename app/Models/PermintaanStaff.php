<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PermintaanStaff extends Model
{
    protected $table = 'permintaan_staff';

    protected $fillable = [
        'department_id',
        'kepala_department_id',
        'posisi',
        'status_staff',
        'kualifikasi',
        'pengalaman',
        'skill_teknis',
        'soft_skill',
        'bahasa',
        'target_tgl_posting',
        'target_on_boarding',
        'deadline_hiring',
        'url_iklan_glints',
        'catatan',
        'status',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'reject_reason',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'target_tgl_posting' => 'date',
        'target_on_boarding' => 'date',
        'deadline_hiring' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the department that owns the permintaan staff.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the kepala department (master karyawan).
     */
    public function kepalaDepartment(): BelongsTo
    {
        return $this->belongsTo(MasterKaryawan::class, 'kepala_department_id');
    }

    /**
     * Get the user who created this record.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the user who approved this record.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected this record.
     */
    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}
