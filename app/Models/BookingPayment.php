<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Database\Factories\BookingPaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookingPayment extends Model
{
    /** @use HasFactory<BookingPaymentFactory> */
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'cashflow_id',
        'financial_account_id',
        'attachment_path',
        'attachment_override_reason',
        'payment_date',
        'amount',
        'currency',
        'exchange_rate',
        'amount_idr',
        'payment_method',
        'reference_number',
        'notes',
        'status',
        'idempotency_key',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'integer',
            'exchange_rate' => 'decimal:8',
            'amount_idr' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        $ensureTripOpen = function (BookingPayment $payment): void {
            $bookingId = (int) ($payment->booking_id ?: $payment->getOriginal('booking_id'));
            if ($bookingId > 0) {
                Booking::query()->with('package')->find($bookingId)?->package?->ensureFinanciallyOpen();
            }
        };

        static::creating($ensureTripOpen);
        static::updating($ensureTripOpen);
        static::deleting($ensureTripOpen);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function cashflow(): BelongsTo
    {
        return $this->belongsTo(Cashflow::class);
    }

    public function financialAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class);
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'source');
    }
}
