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
