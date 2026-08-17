<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomUmrohRequest extends Model
{
    use HasAuditTrail;

    protected $fillable = [
        'request_code',
        'customer_id',
        'full_name',
        'phone',
        'email',
        'origin_city',
        'passenger_count',
        'group_type',
        'departure_month',
        'departure_date',
        'return_date',
        'budget',
        'focus',
        'room_preference',
        'notes',
        'status',
        'booking_id',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'passenger_count' => 'integer',
            'budget' => 'integer',
            'departure_date' => 'date',
            'return_date' => 'date',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}
