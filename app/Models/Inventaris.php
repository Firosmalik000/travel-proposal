<?php

namespace App\Models;

use App\Traits\SoftDeletesWithActive;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventaris extends Model
{
    use SoftDeletesWithActive;

    protected $table = 'inventaris';

    protected $fillable = [
        'nama_barang',
        'kode_barang',
        'kategori',
        'merek_model',
        'jumlah',
        'satuan',
        'kondisi',
        'lokasi',
        'penanggung_jawab',
        'penanggung_jawab_id',
        'tanggal_beli',
        'harga',
        'keterangan',
        'qr_code_path',
        'foto_barang',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tanggal_beli' => 'date',
        'jumlah' => 'integer',
        'harga' => 'decimal:2',
        'is_active' => 'boolean',
        'foto_barang' => 'array',
    ];

    /**
     * Attributes to append to the model's array form.
     */
    protected $appends = ['foto_barang_urls'];

    /**
     * Get MinIO URLs for foto_barang
     */
    public function getFotoBarangUrlsAttribute(): ?array
    {
        if (!$this->foto_barang || !is_array($this->foto_barang)) {
            return null;
        }

        // Filter out empty paths and generate URLs
        $paths = array_filter($this->foto_barang, fn($path) => !empty($path) && is_string($path));

        if (empty($paths)) {
            return null;
        }

        return array_map(function ($path) {
            try {
                return \Storage::disk(config('filesystems.default'))->url($path);
            } catch (\Exception $e) {
                \Log::warning("Failed to generate MinIO URL for path: {$path}", ['error' => $e->getMessage()]);
                return null;
            }
        }, $paths);
    }

    /**
     * Get the penanggung jawab (person in charge) for this inventaris
     */
    public function penanggungJawab(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penanggung_jawab_id');
    }
}
