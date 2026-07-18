<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\DeviceDetail;
use App\Models\GpsDeviceDetail;
use App\Models\Rto;
use App\Models\VehicleDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FitmentController extends Controller
{
    public function searchDevice(Request $request): JsonResponse
    {
        $imei = trim($request->query('imei', ''));
        if (strlen($imei) < 10) {
            return response()->json(['message' => 'Enter a valid IMEI.'], 422);
        }

        $device = DeviceDetail::where('imei', $imei)->first();
        if (!$device) {
            return response()->json(['message' => 'No result found. IMEI does not exist.'], 404);
        }

        if (!$device->status) {
            return response()->json(['message' => 'This device is already.', 'inactive' => true], 422);
        }

        $gps     = GpsDeviceDetail::with('vehicle.zone', 'vehicle.rtoModel')->where('device_id', $device->id)->first();
        $vehicle = $gps?->vehicle;

        return response()->json(['device' => $device, 'vehicle' => $vehicle]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'imei'             => 'required|string',
            'owner_name'       => 'required|string|max:150',
            'owner_mobile'     => 'required|string|max:20',
            'owner_address'    => 'required|string',
            'vehicle_reg_no'   => 'required|string|max:100',
            'vehicle_reg_date' => 'required|date',
            'department'       => 'required|in:Motor Vehicles Department,Mining Department',
            'zone_id'          => 'required|exists:rto_zones,id',
            'rto_id'           => 'required|exists:rtos,id',
            'vehicle_type'     => 'nullable|string|max:100',
            'chassis_no'       => 'nullable|string|max:100',
            'engine_no'        => 'nullable|string|max:100',
            'fitment_date'     => 'nullable|date',
        ]);

        $device = DeviceDetail::where('imei', $data['imei'])->where('status', true)->firstOrFail();
        $rto    = Rto::find($data['rto_id']);

        // 1. Save vehicle_details (lookup by vehicle_reg_no)
        $vehicle = VehicleDetail::updateOrCreate(
            ['vehicle_reg_no' => $data['vehicle_reg_no']],
            [
                'zone_id'          => $data['zone_id'],
                'rto_id'           => $data['rto_id'],
                'rto'              => $rto?->name,
                'department'       => $data['department'],
                'owner_name'       => $data['owner_name'],
                'owner_mobile'     => $data['owner_mobile'],
                'owner_address'    => $data['owner_address'],
                'vehicle_reg_date' => $data['vehicle_reg_date'],
                'vehicle_type'     => $data['vehicle_type'] ?? null,
                'chassis_no'       => $data['chassis_no'] ?? null,
                'engine_no'        => $data['engine_no'] ?? null,
                'fitment_date'     => $data['fitment_date'] ?? now()->toDateString(),
                'status'           => true,
            ]
        );

        // 2. Save gps_device_details (device + vehicle + logged-in dealer)
        GpsDeviceDetail::updateOrCreate(
            ['device_id' => $device->id, 'vehicle_id' => $vehicle->id],
            [
                'dealer_id'   => Auth::id(),
                'fitted_date' => $data['fitment_date'] ?? now()->toDateString(),
                'status'      => true,
            ]
        );

        // 3. Mark device as inactive (already used)
        $device->update(['status' => false]);

        ActivityLog::record(
            'Fitment', 'web-install',
            "Fitted device IMEI {$device->imei} to vehicle {$vehicle->vehicle_reg_no}",
            ['device_id' => $device->id, 'vehicle_id' => $vehicle->id, 'dealer_id' => Auth::id()]
        );

        return response()->json([
            'message' => 'Fitment saved successfully.',
            'vehicle' => $vehicle->load(['zone', 'rtoModel']),
        ], 201);
    }

    public function slip(int $vehicleId): JsonResponse
    {
        $vehicle = VehicleDetail::with(['zone', 'rtoModel', 'gps.device'])->findOrFail($vehicleId);
        return response()->json(['data' => $vehicle]);
    }
}
