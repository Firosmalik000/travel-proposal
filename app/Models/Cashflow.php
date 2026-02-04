<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cashflow extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cashflows';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'date',
        'type',
        'amount',
        'running_balance',
        'description',
        'reference_id',
        'reference_type',
        'method',
        'category',
        'type_cashflow',
        'attachment',
        'status',
        'rejection_reason',
        'approved_by',
        'approved_at',
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
        'date' => 'date',
        'amount' => 'decimal:2',
        'running_balance' => 'decimal:2',
        'attachment' => 'array',
        'approved_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Attributes to append to the model's array form.
     */
    protected $appends = ['attachment_urls'];

    /**
     * Get MinIO URLs for attachments
     */
    public function getAttachmentUrlsAttribute(): ?array
    {
        if (!$this->attachment || !is_array($this->attachment)) {
            return null;
        }

        $urls = array_map(function ($path) {
            try {
                return \Storage::disk(config('filesystems.default'))->url($path);
            } catch (\Exception $e) {
                \Log::warning("Failed to generate MinIO URL for attachment: {$path}");
                return null;
            }
        }, $this->attachment);

        return array_filter($urls);
    }

    /**
     * Scope a query to only include debit transactions.
     */
    public function scopeDebit($query)
    {
        return $query->where('type', 'debit');
    }

    /**
     * Scope a query to only include credit transactions.
     */
    public function scopeCredit($query)
    {
        return $query->where('type', 'credit');
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by method.
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    /**
     * Scope a query to filter by period.
     */
    public function scopeByPeriod($query, $period)
    {
        $now = now();

        switch ($period) {
            case 'daily':
                return $query->whereDate('date', $now->toDateString());
            case 'weekly':
                return $query->whereBetween('date', [
                    $now->startOfWeek()->toDateString(),
                    $now->endOfWeek()->toDateString()
                ]);
            case 'monthly':
                return $query->whereMonth('date', $now->month)
                            ->whereYear('date', $now->year);
            case 'yearly':
                return $query->whereYear('date', $now->year);
            default:
                return $query;
        }
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include approved transactions.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Relationship: User who approved this cashflow
     */
    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    /**
     * Relationship: User who created this cashflow
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Relationship: User who last updated this cashflow
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }
}
