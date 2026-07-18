<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RtoZone extends Model
{
    protected $fillable = ['name', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function rtos()
    {
        return $this->hasMany(Rto::class, 'zone_id');
    }
}
