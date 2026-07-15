<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = collect([
            ['name' => 'View Projects', 'slug' => 'projects.view'],
            ['name' => 'Create Projects', 'slug' => 'projects.create'],
            ['name' => 'Edit Projects', 'slug' => 'projects.edit'],
            ['name' => 'Delete Projects', 'slug' => 'projects.delete'],
            ['name' => 'Manage Users', 'slug' => 'users.manage'],
            ['name' => 'Manage Roles', 'slug' => 'roles.manage'],
        ])->map(fn($p) => Permission::firstOrCreate(['slug' => $p['slug']], $p));

        $allIds = $permissions->pluck('id')->toArray();
        $projectIds = $permissions->whereIn('slug', ['projects.view', 'projects.create', 'projects.edit', 'projects.delete'])->pluck('id')->toArray();
        $viewIds = $permissions->where('slug', 'projects.view')->pluck('id')->toArray();

        $admin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'description' => 'Full access']);
        $admin->permissions()->sync($allIds);

        $manager = Role::firstOrCreate(['slug' => 'manager'], ['name' => 'Manager', 'description' => 'Manage projects']);
        $manager->permissions()->sync($projectIds);

        $user = Role::firstOrCreate(['slug' => 'user'], ['name' => 'User', 'description' => 'View projects']);
        $user->permissions()->sync($viewIds);
    }
}
