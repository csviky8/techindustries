<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            ['name' => 'Dashboard',         'slug' => 'dashboard',          'route' => '/dashboard',            'icon' => 'dashboard',  'order' => 1, 'children' => []],
            ['name' => 'Accounts',          'slug' => 'accounts',           'route' => null,                    'icon' => 'accounts',   'order' => 2, 'children' => [
                ['name' => 'Installer',                 'slug' => 'accounts.installer',             'route' => '/accounts/installer',           'icon' => null, 'order' => 1],
                ['name' => 'Dealer Jurisdiction View',  'slug' => 'accounts.dealer-jurisdiction',   'route' => '/accounts/dealer-jurisdiction',  'icon' => null, 'order' => 2],
            ]],
            ['name' => 'Authorization',     'slug' => 'authorization',      'route' => null,                    'icon' => 'authorization', 'order' => 3, 'children' => [
                ['name' => 'Deployed Device',   'slug' => 'authorization.deployed-device',  'route' => '/authorization/deployed-device',    'icon' => null, 'order' => 1],
                ['name' => 'Owner Change',      'slug' => 'authorization.owner-change',     'route' => '/authorization/owner-change',        'icon' => null, 'order' => 2],
                ['name' => 'Approved Device',   'slug' => 'authorization.approved-device',  'route' => '/authorization/approved-device',     'icon' => null, 'order' => 3],
            ]],
            ['name' => 'Mining Devices',    'slug' => 'mining-devices',     'route' => '/mining-devices',       'icon' => 'mining',     'order' => 4, 'children' => []],
            ['name' => 'Inventory Request', 'slug' => 'inventory-request',  'route' => null,                    'icon' => 'inventory',  'order' => 5, 'children' => [
                ['name' => 'Requested',     'slug' => 'inventory-request.requested',    'route' => '/inventory-request/requested',   'icon' => null, 'order' => 1],
                ['name' => 'Delivered',     'slug' => 'inventory-request.delivered',    'route' => '/inventory-request/delivered',   'icon' => null, 'order' => 2],
            ]],
            ['name' => 'Reports',           'slug' => 'reports',            'route' => '/reports',              'icon' => 'reports',    'order' => 6, 'children' => []],
            ['name' => 'Add on Plan',       'slug' => 'add-on-plan',        'route' => null,                    'icon' => 'plan',       'order' => 7, 'children' => [
                ['name' => 'Add On Year Plan', 'slug' => 'add-on-plan.year', 'route' => '/add-on-plan/year',   'icon' => null, 'order' => 1],
            ]],
            ['name' => 'User Manual',       'slug' => 'user-manual',        'route' => '/user-manual',          'icon' => 'manual',     'order' => 8, 'children' => []],
            ['name' => 'Administration',    'slug' => 'administration',     'route' => null,                    'icon' => 'admin',      'order' => 9, 'children' => [
                ['name' => 'Users',         'slug' => 'admin.users',        'route' => '/users',                'icon' => null, 'order' => 1],
                ['name' => 'Roles',         'slug' => 'admin.roles',        'route' => '/roles',                'icon' => null, 'order' => 2],
                ['name' => 'Permissions',   'slug' => 'admin.permissions',  'route' => '/permissions',          'icon' => null, 'order' => 3],
            ]],
            ['name' => 'Master Settings',   'slug' => 'master-settings',    'route' => '/master-settings',      'icon' => 'settings',   'order' => 10, 'children' => []],
            ['name' => 'Activity Log',      'slug' => 'activity-log',       'route' => '/activity-log',         'icon' => 'activity',   'order' => 11, 'children' => []],
            ['name' => 'Fitment',           'slug' => 'fitment',            'route' => null,                    'icon' => 'fitment',    'order' => 12, 'children' => [
                ['name' => 'Web Install',    'slug' => 'fitment.web-install', 'route' => '/fitment/web-install',  'icon' => null, 'order' => 1],
                ['name' => 'Fitted List',    'slug' => 'fitment.fitted-list', 'route' => '/fitment/fitted-list',  'icon' => null, 'order' => 2],
            ]],
        ];

        foreach ($menus as $item) {
            $children = $item['children'];
            unset($item['children']);

            $parent = Menu::firstOrCreate(['slug' => $item['slug']], $item);

            foreach ($children as $child) {
                Menu::firstOrCreate(['slug' => $child['slug']], array_merge($child, ['parent_id' => $parent->id]));
            }
        }
    }
}
