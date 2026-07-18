<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rto extends Model
{
    protected $fillable = ['name', 'code', 'zone_id', 'is_active'];

    public function zone()
    {
        return $this->belongsTo(RtoZone::class, 'zone_id');
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
