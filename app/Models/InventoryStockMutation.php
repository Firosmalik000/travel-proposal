<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStockMutation extends Model
{
    use HasAuditTrail;
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'product_id',
        'booking_id',
        'change_type',
        'quantity_before',
        'quantity_change',
        'quantity_after',
        'notes',
        'meta',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity_before' => 'integer',
            'quantity_change' => 'integer',
            'quantity_after' => 'integer',
            'meta' => 'array',
        ];
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(TravelProduct::class, 'product_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
