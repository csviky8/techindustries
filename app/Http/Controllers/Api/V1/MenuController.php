<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        $menus = Menu::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $menus]);
    }
}
