<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RtoResource;
use App\Models\Rto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RtoController extends Controller
{
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

        return response()->json(['data' => new RtoResource($rto)]);
    }

    public function destroy(Rto $rto): JsonResponse
    {
        $rto->delete();

        return response()->json(['message' => 'RTO deleted.']);
    }
}
