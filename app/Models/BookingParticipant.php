<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingParticipant extends Model
{
    use HasAuditTrail, HasFactory;

    protected $fillable = [
        'booking_id',
        'full_name',
        'gender',
        'birth_place',
        'birth_date',
        'marital_status',
        'address',
        'needs_wheelchair',
        'shirt_size',
        'passport_ready',
        'passport_issue_date',
        'passport_expiry_date',
        'passport_type',
        'passport_validity_years',
        'passport_scan_path',
        'family_card_scan_path',
        'marriage_book_scan_path',
        'birth_certificate_scan_path',
        'photo_path',
        'meningitis_vaccine_scan_path',
        'has_medical_history',
        'medical_history_notes',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'has_performed_umrah',
        'referral_source',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'needs_wheelchair' => 'boolean',
            'passport_ready' => 'boolean',
            'passport_issue_date' => 'date',
            'passport_expiry_date' => 'date',
            'passport_validity_years' => 'integer',
            'has_medical_history' => 'boolean',
            'has_performed_umrah' => 'boolean',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
