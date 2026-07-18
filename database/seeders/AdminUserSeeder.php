<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole  = Role::where('slug', 'admin')->first();
        $dealerRole = Role::where('slug', 'dealer')->first();
        $staffRole  = Role::where('slug', 'staff')->first();

        // ── Admin ──────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@safetek.com'],
            [
                'name'        => 'Admin',
                'username'    => 'admin',
                'phone'       => '9000000000',
                'password'    => bcrypt('Admin@1234'),
                'role_id'     => $adminRole?->id,
                'is_approved' => true,
            ]
        );

        // ── Dealer ─────────────────────────────────────────────
        $dealer = User::firstOrCreate(
            ['email' => 'prabhu@safetek.com'],
            [
                'name'        => 'Prabhu',
                'username'    => 'prabhu',
                'phone'       => '9800000001',
                'dealer_name' => 'Univer Saltele Services(NAMAKALSOUTH)',
                'state'       => 'Tamil Nadu',
                'district'    => 'Namakkal',
                'password'    => bcrypt('Dealer@1234'),
                'role_id'     => $dealerRole?->id,
                'is_approved' => true,
            ]
        );

        // ── Staff / Technicians under dealer ───────────────────
        $staffList = [
            ['name' => 'kisupathi',    'phone' => '9176808838', 'email' => 'uts1@gmail.com',                'username' => '9176808838', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'PRAVEEN KUMAR','phone' => '9489187118', 'email' => 'suntech@24gmail.com',           'username' => '9489187118', 'state' => 'Tamil Nadu', 'district' => 'Dharmapuri'],
            ['name' => 'raja puc',     'phone' => '9443407837', 'email' => 'prajanetc@gmail.com',           'username' => '9443407837', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'RAJESKANNA',   'phone' => '9159414859', 'email' => 'rajeshmaha999.rs@gmail.com',    'username' => '9159414859', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'roshan',       'phone' => '9842632419', 'email' => 'roshanhema15@gmail.com',        'username' => '9842632419', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'SAKTHI',       'phone' => '8667690789', 'email' => 'svsp.sakthi@gmail.com',         'username' => '8667690789', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'saravanan',    'phone' => '9486056688', 'email' => 'saravanananitha1981@gmail.com', 'username' => '9486056688', 'state' => 'Tamil Nadu', 'district' => 'Namakkal'],
            ['name' => 'TAMIL MANI',   'phone' => '8608369669', 'email' => 'tamilmani@gmail.com',           'username' => '8608369669', 'state' => 'Tamil Nadu', 'district' => 'Dharmapuri'],
        ];

        foreach ($staffList as $staff) {
            User::firstOrCreate(
                ['phone' => $staff['phone']],
                [
                    'name'        => $staff['name'],
                    'email'       => $staff['email'],
                    'username'    => $staff['username'],
                    'password'    => bcrypt('Staff@1234'),
                    'role_id'     => $staffRole?->id,
                    'dealer_id'   => $dealer->id,
                    'dealer_name' => 'Univer Saltele Services(NAMAKALSOUTH)',
                    'state'       => $staff['state'],
                    'district'    => $staff['district'],
                    'is_approved' => true,
                ]
            );
        }
    }
}
