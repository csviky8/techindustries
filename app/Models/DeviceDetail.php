<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeviceDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'imei', 'iccid_1', 'iccid_2', 'sim_1', 'sim_2',
        'serial_no', 'part_no', 'manufacturer', 'esim_provider',
        'device_model', 'uuid', 'new_vehicle', 'status',
    ];

    protected function casts(): array
    {
        return ['status' => 'boolean'];
    }
}
