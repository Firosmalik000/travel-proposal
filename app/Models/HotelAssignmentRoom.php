<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HotelAssignmentRoom extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'hotel_assignment_id',
        'room_type_id',
        'room_count',
        'room_capacity',
    ];

    protected function casts(): array
    {
        return [
            'room_count' => 'integer',
            'room_capacity' => 'integer',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(HotelAssignment::class, 'hotel_assignment_id');
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(HotelRoomType::class, 'room_type_id');
    }
}
