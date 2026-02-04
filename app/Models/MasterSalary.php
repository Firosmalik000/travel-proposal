<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasterSalary extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'master_salaries';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'basic_salary',
        'allowances',
        'total_salary',
        'effective_date',
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
        'basic_salary' => 'decimal:2',
        'allowances' => 'decimal:2',
        'total_salary' => 'decimal:2',
        'effective_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user (karyawan) that owns the salary.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate and update total salary.
     */
    public function calculateTotalSalary(): void
    {
        $this->total_salary = $this->basic_salary + $this->allowances;
        $this->save();
    }
}
