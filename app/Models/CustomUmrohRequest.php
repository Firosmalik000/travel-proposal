<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomUmrohRequest extends Model
{
    protected $fillable = [
        'request_code',
        'full_name',
        'phone',
        'email',
        'origin_city',
        'passenger_count',
        'group_type',
        'departure_month',
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
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
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
