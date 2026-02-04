<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'full_name',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get all user accesses for this user.
     */
    public function userAccesses(): HasMany
    {
        return $this->hasMany(UserAccess::class);
    }

    /**
     * Get user's accessible menus.
     */
    public function accessibleMenus()
    {
        return $this->hasMany(UserAccess::class)
            ->where('can_view', true)
            ->with(['menu' => function ($query) {
                $query->active()->orderBy('order');
            }]);
    }

    /**
     * Get user's kendaraan (vehicles).
     */
    public function kendaraan(): HasMany
    {
        return $this->hasMany(KendaraanKaryawan::class);
    }

    /**
     * Get user's pengalaman karyawan (work experience).
     */
    public function pengalamanKaryawan(): HasMany
    {
        return $this->hasMany(PengalamanKaryawan::class);
    }

    /**
     * Get user's arsip data karyawan.
     */
    public function arsipDataKaryawan(): HasOne
    {
        return $this->hasOne(ArsipDataKaryawan::class);
    }

    /**
     * Get user's karyawan data.
     */
    public function karyawan(): HasOne
    {
        return $this->hasOne(MasterKaryawan::class);
    }

    /**
     * Get avatar attribute from karyawan photo.
     */
    public function getAvatarAttribute(): ?string
    {
        // Load karyawan relation if not loaded
        if (!$this->relationLoaded('karyawan')) {
            $this->load('karyawan');
        }

        // Return foto path with /storage/ prefix if exists
        if ($this->karyawan && $this->karyawan->foto) {
            return '/storage/' . $this->karyawan->foto;
        }

        return null;
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['avatar'];
}
