<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlipGaji extends Model
{
    use HasFactory, HasAuditTrail, SoftDeletesWithActive;

    /**
     * The table associated with the model.
     */
    protected $table = 'slip_gaji';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'period_start',
        'period_end',
        'period_label',
        'pendapatan',
        'potongan',
        'total_pendapatan',
        'total_potongan',
        'gaji_bersih',
        'gaji_bersih_terbilang',
        'status',
        'is_active',
        'created_by',
        'updated_by',
        'approved_by',
        'approved_at',
        'sent_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'pendapatan' => 'array',
        'potongan' => 'array',
        'total_pendapatan' => 'decimal:2',
        'total_potongan' => 'decimal:2',
        'gaji_bersih' => 'decimal:2',
        'approved_at' => 'datetime',
        'sent_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user (karyawan) that owns the slip gaji.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the approver.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate all totals and update the model.
     */
    public function calculateTotals(): void
    {
        // Calculate total pendapatan from JSON array
        $totalPendapatan = 0;
        if (is_array($this->pendapatan)) {
            foreach ($this->pendapatan as $item) {
                $totalPendapatan += $item['amount'] ?? 0;
            }
        }
        $this->total_pendapatan = $totalPendapatan;

        // Calculate total potongan from JSON array
        $totalPotongan = 0;
        if (is_array($this->potongan)) {
            foreach ($this->potongan as $item) {
                $totalPotongan += $item['amount'] ?? 0;
            }
        }
        $this->total_potongan = $totalPotongan;

        // Calculate gaji bersih
        $this->gaji_bersih = $this->total_pendapatan - $this->total_potongan;

        // Convert to words
        $this->gaji_bersih_terbilang = $this->numberToWords($this->gaji_bersih);
    }

    /**
     * Convert number to Indonesian words (Rupiah).
     */
    public function numberToWords($number): string
    {
        $number = abs($number);
        $words = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

        if ($number < 12) {
            return $words[$number];
        } elseif ($number < 20) {
            return $words[$number - 10] . ' Belas';
        } elseif ($number < 100) {
            return $words[floor($number / 10)] . ' Puluh ' . $words[$number % 10];
        } elseif ($number < 200) {
            return 'Seratus ' . $this->numberToWords($number - 100);
        } elseif ($number < 1000) {
            return $words[floor($number / 100)] . ' Ratus ' . $this->numberToWords($number % 100);
        } elseif ($number < 2000) {
            return 'Seribu ' . $this->numberToWords($number - 1000);
        } elseif ($number < 1000000) {
            return $this->numberToWords(floor($number / 1000)) . ' Ribu ' . $this->numberToWords($number % 1000);
        } elseif ($number < 1000000000) {
            return $this->numberToWords(floor($number / 1000000)) . ' Juta ' . $this->numberToWords($number % 1000000);
        } elseif ($number < 1000000000000) {
            return $this->numberToWords(floor($number / 1000000000)) . ' Miliar ' . $this->numberToWords($number % 1000000000);
        } else {
            return $this->numberToWords(floor($number / 1000000000000)) . ' Triliun ' . $this->numberToWords($number % 1000000000000);
        }
    }

    /**
     * Scope untuk status draft.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope untuk status approved.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope untuk status sent.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }
}
