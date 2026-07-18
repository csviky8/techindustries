<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['name', 'email', 'username', 'phone', 'password', 'role_id', 'dealer_id', 'state', 'district', 'address', 'dealer_name', 'is_approved'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function dealer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dealer_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(User::class, 'dealer_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function hasRole(string $slug): bool
    {
        return $this->role?->slug === $slug;
    }

    public function isAdmin(): bool   { return $this->hasRole('admin'); }
    public function isDealer(): bool  { return $this->hasRole('dealer'); }
    public function isStaff(): bool   { return $this->hasRole('staff'); }
}
