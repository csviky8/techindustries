<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role?->slug;

        $adminOnlySlugs = ['admin.users', 'admin.roles', 'admin.permissions', 'administration'];
        $dealerAdminSlugs = ['accounts', 'accounts.installer', 'accounts.dealer-jurisdiction'];

        $menus = Menu::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->filter(function ($menu) use ($role, $adminOnlySlugs, $dealerAdminSlugs) {
                if (in_array($menu->slug, $adminOnlySlugs) && $role !== 'admin') return false;
                if (in_array($menu->slug, $dealerAdminSlugs) && !in_array($role, ['admin', 'dealer'])) return false;
                return true;
            })
            ->map(function ($menu) use ($role, $adminOnlySlugs, $dealerAdminSlugs) {
                $menu->children = $menu->children->filter(function ($child) use ($role, $adminOnlySlugs, $dealerAdminSlugs) {
                    if (in_array($child->slug, $adminOnlySlugs) && $role !== 'admin') return false;
                    if (in_array($child->slug, $dealerAdminSlugs) && !in_array($role, ['admin', 'dealer'])) return false;
                    return true;
                })->values();
                return $menu;
            })
            ->values();

        return response()->json(['data' => $menus]);
    }
}
