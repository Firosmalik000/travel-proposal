<?php

namespace App\Models;

use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasterKaryawan extends Model
{
    use HasFactory, SoftDeletesWithActive;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'master_karyawan';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'nik',
        'nama_lengkap',
        'nama_panggilan',
        'gender',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'agama',
        'status_pernikahan',
        'email',
        'no_telp',
        'foto',
        'department_id',
        'jabatan_id',
        'tanggal_mulai_bekerja',
        'status_karyawan',
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
        'tanggal_lahir' => 'date',
        'tanggal_mulai_bekerja' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Attributes to append to the model's array form.
     */
    protected $appends = ['foto_url'];

    /**
     * Get MinIO URL for foto
     */
    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto) {
            return null;
        }

        try {
            return \Storage::disk(config('filesystems.default'))->url($this->foto);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL for foto: {$this->foto}", ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get the user that owns the karyawan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the department that owns the karyawan.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the jabatan that owns the karyawan.
     */
    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to filter by jabatan.
     */
    public function scopeByJabatan($query, $jabatanId)
    {
        return $query->where('jabatan_id', $jabatanId);
    }

    /**
     * Scope a query to filter by status karyawan.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status_karyawan', $status);
    }
}
