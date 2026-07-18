<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ActivityLog::with('user')->latest();

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(fn($q) => $q
                ->where('description', 'like', $s)
                ->orWhere('action', 'like', $s)
                ->orWhere('module', 'like', $s)
                ->orWhereHas('user', fn($u) => $u->where('name', 'like', $s))
            );
        }

        $perPage = min((int) $request->get('per_page', 20), 100);

        return \App\Http\Resources\ActivityLogResource::collection($query->paginate($perPage));
    }
}
