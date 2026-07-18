<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RtoResource;
use App\Models\ActivityLog;
use App\Models\Rto;
use App\Models\RtoZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RtoController extends Controller
{
    public function zones(): JsonResponse
    {
        $zones = RtoZone::with(['rtos' => fn($q) => $q->orderBy('code')])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($z) => [
                'id'   => $z->id,
                'name' => $z->name,
                'rtos' => $z->rtos->map(fn($r) => [
                    'id'        => $r->id,
                    'name'      => $r->name,
                    'code'      => $r->code,
                    'is_active' => $r->is_active,
                ]),
            ]);

        return response()->json(['data' => $zones]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Rto::query();

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(fn($q) => $q->where('name', 'like', $s)->orWhere('code', 'like', $s));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // If requesting all (for dropdowns), skip pagination
        if ($request->boolean('all')) {
            return RtoResource::collection($query->orderBy('code')->get());
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return RtoResource::collection($query->orderBy('code')->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'code'      => 'required|string|max:20|unique:rtos',
            'is_active' => 'boolean',
        ]);

        $rto = Rto::create($data);
        ActivityLog::record('RTOs', 'create', "Created RTO: {$rto->name} ({$rto->code})", ['id' => $rto->id]);
        return response()->json(['data' => new RtoResource($rto)], 201);
    }

    public function update(Request $request, Rto $rto): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'code'      => 'sometimes|string|max:20|unique:rtos,code,' . $rto->id,
            'is_active' => 'boolean',
        ]);

        $rto->update($data);
        ActivityLog::record('RTOs', 'update', "Updated RTO: {$rto->name} ({$rto->code})", ['id' => $rto->id]);
        return response()->json(['data' => new RtoResource($rto)]);
    }

    public function destroy(Rto $rto): JsonResponse
    {
        $rto->delete();
        ActivityLog::record('RTOs', 'delete', "Deleted RTO: {$rto->name} ({$rto->code})", ['id' => $rto->id]);
        return response()->json(['message' => 'RTO deleted.']);
    }
}
