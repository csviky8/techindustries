<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();

        User::firstOrCreate(
            ['email' => 'admin@safetek.test'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'role_id' => $adminRole?->id,
            ]
        );
    }
}
