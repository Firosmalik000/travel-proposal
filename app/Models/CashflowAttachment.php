<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashflowAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashflow_id',
        'file_path',
        'file_name',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function cashflow(): BelongsTo
    {
        return $this->belongsTo(Cashflow::class);
    }
}
