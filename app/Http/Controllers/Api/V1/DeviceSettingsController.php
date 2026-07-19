<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Imports\DeviceImport;
use App\Models\ActivityLog;
use App\Models\DeviceDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class DeviceSettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min($perPage, 50));
        $search = trim((string) $request->input('search', ''));

        $query = DeviceDetail::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('imei', 'like', "%{$search}%")
                    ->orWhere('serial_no', 'like', "%{$search}%")
                    ->orWhere('part_no', 'like', "%{$search}%")
                    ->orWhere('device_model', 'like', "%{$search}%")
                    ->orWhere('manufacturer', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage)->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'imei' => 'required|string|max:50|unique:device_details,imei',
            'device_model' => 'nullable|string|max:150',
            'part_no' => 'nullable|string|max:100',
            'serial_no' => 'nullable|string|max:100',
            'iccid_1' => 'nullable|string|max:50',
            'iccid_2' => 'nullable|string|max:50',
            'sim_1' => 'nullable|string|max:50',
            'sim_2' => 'nullable|string|max:50',
            'new_vehicle' => 'required|in:Yes,No',
            'status' => 'sometimes|boolean',
        ]);

        $device = DeviceDetail::create([
            'imei' => trim($data['imei']),
            'device_model' => trim($data['device_model'] ?? ''),
            'part_no' => trim($data['part_no'] ?? ''),
            'serial_no' => trim($data['serial_no'] ?? ''),
            'iccid_1' => trim($data['iccid_1'] ?? ''),
            'iccid_2' => trim($data['iccid_2'] ?? ''),
            'sim_1' => trim($data['sim_1'] ?? ''),
            'sim_2' => trim($data['sim_2'] ?? ''),
            'new_vehicle' => $data['new_vehicle'],
            'status' => $request->boolean('status', true),
        ]);

        ActivityLog::record(
            'Device Settings',
            'create',
            "Created device {$device->imei} manually",
            ['device_id' => $device->id, 'imei' => $device->imei]
        );

        return response()->json([
            'message' => 'Device saved successfully.',
            'device' => $device->fresh(),
        ], 201);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        set_time_limit(300);

        $import = new DeviceImport();
        Excel::import($import, $request->file('file'));

        ActivityLog::record(
            'Device Settings',
            'import',
            "Imported {$import->imported} devices via Excel ({$import->skipped} skipped)",
            ['imported' => $import->imported, 'skipped' => $import->skipped]
        );

        return response()->json([
            'message'  => "Import complete: {$import->imported} saved, {$import->skipped} skipped.",
            'imported' => $import->imported,
            'skipped'  => $import->skipped,
        ]);
    }

    public function template(): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\Response
    {
        $path = storage_path('app/templates/device_import_template.xlsx');

        if (!file_exists($path)) {
            // Generate a simple CSV template on the fly
            $csv = "MODEL,PART NO,SERIAL NO,IMEI NO,ICCID NO1,ICCID NO2,SIM1,SIM2,NEW VEHICLE YES/NO\n";
            $csv .= "GT06N,PT-001,SN-001,123456789012345,89914503012345678901,89914503012345678902,9876543210,9876543211,No\n";
            return response($csv, 200, [
                'Content-Type'        => 'text/csv',
                'Content-Disposition' => 'attachment; filename="device_import_template.csv"',
            ]);
        }

        return response()->download($path, 'device_import_template.xlsx');
    }
}
