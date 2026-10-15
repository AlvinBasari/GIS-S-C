<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'branch_id', 'phone', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
            'is_active' => 'boolean',
        ];
    }

    /**
     * Cabang tempat user bertugas (untuk branch_manager & branch_staff).
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Cek apakah user adalah Super Admin (HQ Pusat).
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    /**
     * Cek apakah user adalah Kepala Cabang (Branch Manager).
     */
    public function isBranchManager(): bool
    {
        return $this->role === 'branch_manager';
    }

    /**
     * Cek apakah user adalah Staff Cabang (Branch Staff).
     */
    public function isBranchStaff(): bool
    {
        return $this->role === 'branch_staff';
    }

    /**
     * Cek apakah user berhak mengelola staf cabang (Super Admin atau Kepala Cabang).
     */
    public function canManageStaff(): bool
    {
        return in_array($this->role, ['superadmin', 'branch_manager']);
    }

    /**
     * Cek apakah user adalah personil cabang (Kepala Cabang atau Staff).
     */
    public function isBranchUser(): bool
    {
        return in_array($this->role, ['branch_manager', 'branch_staff']);
    }
}
