<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return RoleResource::collection(Role::with('permissions')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:roles|alpha_dash',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create($data);

        if (!empty($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        return response()->json(['data' => new RoleResource($role->load('permissions'))], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update($data);

        if (isset($data['permissions'])) {
            $role->permissions()->sync($data['permissions']);
        }

        return response()->json(['data' => new RoleResource($role->load('permissions'))]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
