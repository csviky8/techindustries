<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'zone_id', 'rto_id', 'rto', 'department',
        'vehicle_reg_no', 'vehicle_reg_date', 'vehicle_type',
        'owner_name', 'owner_mobile', 'owner_address',
        'chassis_no', 'engine_no', 'odometer',
        'uin_number', 'uuid', 'fitment_date',
        'panic_button_count', 'status',
    ];

    protected function casts(): array
    {
        return ['status' => 'boolean', 'vehicle_reg_date' => 'date', 'fitment_date' => 'date'];
    }

    public function zone()     { return $this->belongsTo(RtoZone::class, 'zone_id'); }
    public function rtoModel() { return $this->belongsTo(Rto::class, 'rto_id'); }
    public function gps()      { return $this->hasOne(GpsDeviceDetail::class, 'vehicle_id'); }
}
