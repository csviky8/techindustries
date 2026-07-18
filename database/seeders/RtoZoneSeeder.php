<?php

namespace Database\Seeders;

use App\Models\Rto;
use App\Models\RtoZone;
use Illuminate\Database\Seeder;

class RtoZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            'Chennai North Zone' => [
                'TN02', 'TN03', 'TN05', 'TN13', 'TN18', 'TN18Y', 'TN20', 'TN20X', 'TN85',
            ],
            'Chennai South Zone' => [
                'TN01', 'TN04', 'TN06', 'TN07', 'TN09', 'TN10', 'TN11', 'TN12', 'TN14',
                'TN19', 'TN19Y', 'TN19Z', 'TN21', 'TN22', 'TN87',
            ],
            'Coimbatore Zone' => [
                'TN37', 'TN37Z', 'TN38', 'TN39', 'TN39Z', 'TN40', 'TN41', 'TN41W',
                'TN42', 'TN42Y', 'TN43', 'TN43Z', 'TN66', 'TN78', 'TN78Z', 'TN99',
            ],
            'Erode Zone' => [
                'TN33', 'TN34', 'TN34M', 'TN36', 'TN36W', 'TN36Z', 'TN56', 'TN86',
            ],
            'Madurai Zone' => [
                'TN57', 'TN57S', 'TN57Y', 'TN57B', 'TN58', 'TN58Y', 'TN58Z',
                'TN59', 'TN59V', 'TN59Z', 'TN60', 'TN60Z', 'TN64', 'TN94', 'TN94Z',
            ],
            'Salem Zone' => [
                'TN28', 'TN28Z', 'TN29', 'TN29W', 'TN29Z', 'TN30', 'TN30W', 'TN52', 'TN54', 'TN70',
                'TN77', 'TN77Z', 'TN88', 'TN88Z', 'TN90', 'TN93',
            ],
            'Thanjavur Zone' => [
                'TN49', 'TN49Y', 'TN50', 'TN50Y', 'TN50Z', 'TN51', 'TN68',
                'TN82', 'TN82Z',
            ],
            'Tiruchirappalli Zone' => [
                'TN45', 'TN45Z', 'TN46', 'TN47', 'TN47X', 'TN47Y', 'TN47Z',
                'TN48', 'TN48X', 'TN48Y', 'TN48Z', 'TN55', 'TN55X', 'TN55Y', 'TN55Z',
                'TN61', 'TN81', 'TN81Z',
            ],
            'Tirunelveli Zone' => [
                'TN69', 'TN72', 'TN72V', 'TN74', 'TN75', 'TN76', 'TN76V', 'TN76B',
                'TN79', 'TN92', 'TN96',
            ],
            'Vellore Zone' => [
                'TN23', 'TN23T', 'TN24', 'TN25', 'TN73', 'TN73Z', 'TN83', 'TN83Y',
                'TN83Z', 'TN97', 'TN97Z',
            ],
            'Viluppuram Zone' => [
                'TN15', 'TN15Z', 'TN16', 'TN16Z', 'TN31', 'TN31Y', 'TN31Z',
                'TN32', 'TN91', 'TN91Z',
            ],
            'Virudhunagar Zone' => [
                'TN63', 'TN63Z', 'TN65', 'TN65Z', 'TN67', 'TN67W', 'TN84', 'TN84U',
                'TN95',
            ],
        ];

        foreach ($zones as $zoneName => $rtoCodes) {
            $zone = RtoZone::firstOrCreate(['name' => $zoneName], ['name' => $zoneName, 'is_active' => true]);
            Rto::whereIn('code', $rtoCodes)->update(['zone_id' => $zone->id]);
        }
    }
}
