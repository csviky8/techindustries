<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::with('role')->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create($data);

        return response()->json(['data' => new UserResource($user->load('role'))], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role_id' => 'sometimes|exists:roles,id',
            'password' => 'sometimes|string|min:8',
        ]);

        $user->update($data);

        return response()->json(['data' => new UserResource($user->load('role'))]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
