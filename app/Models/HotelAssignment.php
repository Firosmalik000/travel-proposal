<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class HotelAssignment extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'package_id',
        'departure_schedule_id',
        'hotel_id',
        'status',
        'notes',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class, 'departure_schedule_id');
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(HotelAssignmentRoom::class, 'hotel_assignment_id');
    }
}
