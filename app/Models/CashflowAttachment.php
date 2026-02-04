<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashflowAttachment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cashflow_attachments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cashflow_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'is_image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_image' => 'boolean',
    ];

    /**
     * Get the cashflow that owns the attachment.
     */
    public function cashflow()
    {
        return $this->belongsTo(Cashflow::class);
    }

    /**
     * Get the full URL of the attachment.
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get human readable file size.
     */
    public function getHumanFileSizeAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes === null) return 'Unknown';

        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / pow(1024, $power), 2) . ' ' . $units[$power];
    }
}
