<?php

namespace App\Imports;

use App\Models\DeviceDetail;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DeviceImport extends DefaultValueBinder implements
    ToCollection,
    WithHeadingRow,
    WithCustomValueBinder
{
    public int $imported = 0;
    public int $skipped  = 0;

    // Force ALL cells to be read as strings — prevents IMEI float truncation
    public function bindValue(Cell $cell, mixed $value): bool
    {
        if (is_numeric($value) && strlen(rtrim(number_format((float)$value, 0, '.', ''), '.')) >= 10) {
            $cell->setValueExplicit(rtrim(number_format((float)$value, 0, '.', ''), '.'), DataType::TYPE_STRING);
            return true;
        }
        return parent::bindValue($cell, $value);
    }

    private function normalize(array $row): array
    {
        $map = [];
        foreach ($row as $key => $value) {
            $clean = strtolower(trim(preg_replace('/[^a-z0-9]+/', '_', (string) $key)));
            $clean = trim($clean, '_');
            $map[$clean] = $value;
        }
        return $map;
    }

    private function findImei(array $r): string
    {
        foreach (['imei_no', 'imei', 'imei_number', 'device_imei', 'imeinumber', 'imeino'] as $key) {
            if (!empty($r[$key])) {
                return trim((string) $r[$key]);
            }
        }
        return '';
    }

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) return;

        $firstRow = $this->normalize($rows->first()->toArray());
        Log::info('DeviceImport columns: ' . implode(', ', array_keys($firstRow)));
        Log::info('DeviceImport first row: ' . json_encode($firstRow));
        Log::info('DeviceImport total rows in chunk: ' . $rows->count());

        $records = [];
        $now     = now();

        foreach ($rows as $row) {
            $r    = $this->normalize($row->toArray());
            $imei = $this->findImei($r);

            if (empty($imei)) {
                $this->skipped++;
                Log::warning('DeviceImport skipped row (no IMEI): ' . json_encode($r));
                continue;
            }

            $newVehicle = strtolower(trim((string) ($r['new_vehicle_yes_no'] ?? $r['new_vehicle'] ?? 'no')));
            $newVehicle = in_array($newVehicle, ['yes', '1', 'true', 'y']) ? 'Yes' : 'No';

            $records[$imei] = [
                'imei'         => $imei,
                'device_model' => trim((string) ($r['model'] ?? $r['device_model'] ?? '')),
                'part_no'      => trim((string) ($r['part_no'] ?? $r['partno'] ?? '')),
                'serial_no'    => trim((string) ($r['serial_no'] ?? '')),
                'iccid_1'      => trim((string) ($r['iccid_no1'] ?? $r['iccid_1'] ?? $r['iccid1'] ?? '')),
                'iccid_2'      => trim((string) ($r['iccid_no2'] ?? $r['iccid_2'] ?? $r['iccid2'] ?? '')),
                'sim_1'        => trim((string) ($r['sim1'] ?? $r['sim_1'] ?? $r['sim_no1'] ?? '')),
                'sim_2'        => trim((string) ($r['sim2'] ?? $r['sim_2'] ?? $r['sim_no2'] ?? '')),
                'new_vehicle'  => $newVehicle,
                'status'       => true,
                'created_at'   => $now,
                'updated_at'   => $now,
            ];
        }

        if (!empty($records)) {
            $batch = array_values($records);
            DeviceDetail::upsert(
                $batch,
                ['imei'],
                ['device_model', 'part_no', 'serial_no', 'iccid_1', 'iccid_2', 'sim_1', 'sim_2', 'new_vehicle', 'updated_at']
            );
            $this->imported += count($batch);
            Log::info("DeviceImport: chunk done — imported {$this->imported}, skipped {$this->skipped}");
        }
    }
}
