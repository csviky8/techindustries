<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GpsDeviceDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'device_id', 'dealer_id',
        'fitted_date', 'end_date', 'technician_mobile',
        'sim_plan', 'sim_validity',
        'uin_number', 'panic_button_count',
        'temp_certificate_date', 'vahan_certificate_date',
        'temp_certificate_file', 'vahan_certificate_file',
        'rc_book_file', 'device_fitment_file', 'vehicle_image',
        'approval_notes', 'approved_by', 'approved_status',
        'remarks', 'status',
    ];

    protected function casts(): array
    {
        return [
            'status'       => 'boolean',
            'fitted_date'  => 'date',
            'end_date'     => 'date',
            'sim_validity' => 'date',
        ];
    }

    public function vehicle() { return $this->belongsTo(VehicleDetail::class, 'vehicle_id'); }
    public function device()  { return $this->belongsTo(DeviceDetail::class, 'device_id'); }
    public function dealer()  { return $this->belongsTo(User::class, 'dealer_id'); }
}
