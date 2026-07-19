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
use Illuminate\Support\Facades\Storage;

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

    public function fittedList(Request $request): JsonResponse
    {
        $q = GpsDeviceDetail::with(['vehicle.zone', 'vehicle.rtoModel', 'device'])
            ->whereHas('vehicle');

        if ($imei = $request->query('imei'))
            $q->whereHas('device', fn($d) => $d->where('imei', 'like', "%{$imei}%"));

        if ($manufacturer = $request->query('manufacturer'))
            $q->whereHas('device', fn($d) => $d->where('manufacturer', $manufacturer));

        if ($reg = $request->query('vehicle_reg_no'))
            $q->whereHas('vehicle', fn($v) => $v->where('vehicle_reg_no', 'like', "%{$reg}%"));

        if ($mobile = $request->query('owner_mobile'))
            $q->whereHas('vehicle', fn($v) => $v->where('owner_mobile', 'like', "%{$mobile}%"));

        if ($rto = $request->query('rto_id'))
            $q->whereHas('vehicle', fn($v) => $v->where('rto_id', $rto));

        if ($fitted = $request->query('fitted_date'))
            $q->whereDate('fitted_date', $fitted);

        if ($tempCert = $request->query('temp_cert'))
            $q->where($tempCert === 'yes' ? fn($x) => $x->whereNotNull('temp_certificate_file') : fn($x) => $x->whereNull('temp_certificate_file'));

        if ($rtoApproved = $request->query('rto_approved'))
            $q->where('approved_status', $rtoApproved);

        $data = $q->latest()->paginate(50);
        return response()->json($data);
    }

    public function uploadTempCert(Request $request, GpsDeviceDetail $gps): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120']);
        $path = $request->file('file')->store('temp-certs', 'public');
        $gps->update([
            'temp_certificate_file' => $path,
            'temp_certificate_date' => now()->toDateString(),
        ]);
        return response()->json(['message' => 'Temp certificate uploaded.', 'path' => $path]);
    }

    public function uploadDoc(Request $request, GpsDeviceDetail $gps): JsonResponse
    {
        $allowed = ['rc_book_file', 'device_fitment_file', 'vehicle_image', 'temp_certificate_file'];
        $request->validate([
            'field' => 'required|in:' . implode(',', $allowed),
            'file'  => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);
        $field = $request->input('field');
        $folder = match($field) {
            'vehicle_image'       => 'vehicle-images',
            'temp_certificate_file' => 'temp-certs',
            default               => 'fitment-docs',
        };
        $path = $request->file('file')->store($folder, 'public');
        $extra = $field === 'temp_certificate_file' ? ['temp_certificate_date' => now()->toDateString()] : [];
        $gps->update(array_merge([$field => $path], $extra));
        return response()->json(['message' => 'Uploaded.', 'gps' => $gps->fresh(['vehicle.zone', 'vehicle.rtoModel', 'device'])]);
    }

    public function updateFitment(Request $request, GpsDeviceDetail $gps): JsonResponse
    {
        $data = $request->validate([
            'vehicle_reg_no'   => 'required|string|max:100',
            'vehicle_reg_date' => 'required|date',
            'rto_id'           => 'required|exists:rtos,id',
            'vehicle_type'     => 'nullable|string|max:100',
            'owner_name'       => 'required|string|max:150',
            'owner_mobile'     => 'required|string|max:20',
            'owner_address'    => 'nullable|string',
            'rc_book_file'     => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'device_fitment_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'vehicle_image'    => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $rto = Rto::find($data['rto_id']);
        $vehicle = $gps->vehicle;
        $vehicle->update([
            'vehicle_reg_no'   => $data['vehicle_reg_no'],
            'vehicle_reg_date' => $data['vehicle_reg_date'],
            'rto_id'           => $data['rto_id'],
            'rto'              => $rto?->name,
            'vehicle_type'     => $data['vehicle_type'] ?? $vehicle->vehicle_type,
            'owner_name'       => $data['owner_name'],
            'owner_mobile'     => $data['owner_mobile'],
            'owner_address'    => $data['owner_address'] ?? $vehicle->owner_address,
        ]);

        $gpsUpdate = [];
        foreach (['rc_book_file', 'device_fitment_file', 'vehicle_image'] as $field) {
            if ($request->hasFile($field)) {
                $gpsUpdate[$field] = $request->file($field)->store($field === 'vehicle_image' ? 'vehicle-images' : 'fitment-docs', 'public');
            }
        }
        if ($gpsUpdate) $gps->update($gpsUpdate);

        return response()->json([
            'message' => 'Updated successfully.',
            'gps' => $gps->fresh(['vehicle.zone', 'vehicle.rtoModel', 'device']),
        ]);
    }

    public function rtoApprove(Request $request, GpsDeviceDetail $gps): JsonResponse
    {
        $data = $request->validate([
            'approved_status' => 'required|in:Pending,Approved,Rejected',
            'approval_notes'  => 'nullable|string|max:1000',
        ]);
        $gps->update([
            'approved_status' => $data['approved_status'],
            'approval_notes'  => $data['approval_notes'] ?? null,
            'approved_by'     => Auth::id(),
        ]);
        return response()->json(['message' => 'RTO approval status updated.', 'gps' => $gps->fresh()]);
    }
}
