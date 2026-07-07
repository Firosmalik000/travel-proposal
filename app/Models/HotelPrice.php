<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HotelPrice extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'hotel_id',
        'broker_key',
        'broker_name',
        'room_type_id',
        'period_start',
        'period_end',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'price' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(HotelRoomType::class, 'room_type_id');
    }
}
