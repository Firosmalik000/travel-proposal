<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Database\Factories\BookingPaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookingPayment extends Model
{
    /** @use HasFactory<BookingPaymentFactory> */
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference_number',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'integer',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
