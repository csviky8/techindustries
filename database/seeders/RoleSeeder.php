<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['slug' => 'admin'],  ['name' => 'Admin',  'description' => 'Full access']);
        Role::firstOrCreate(['slug' => 'dealer'], ['name' => 'Dealer', 'description' => 'Dealer access']);
        Role::firstOrCreate(['slug' => 'staff'],  ['name' => 'Staff',  'description' => 'Staff/Technician access']);
    }
}
