<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasAuditTrail;
    use HasFactory;

    protected $fillable = [
        'item_code',
        'item_name',
        'category',
        'unit',
        'product_id',
        'quantity',
        'reserved_quantity',
        'average_unit_cost_idr',
        'notes',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'reserved_quantity' => 'integer',
            'average_unit_cost_idr' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(TravelProduct::class, 'product_id');
    }

    public function stockMutations(): HasMany
    {
        return $this->hasMany(InventoryStockMutation::class);
    }

    public function availableQuantity(): int
    {
        return max(0, $this->quantity - $this->reserved_quantity);
    }
}
