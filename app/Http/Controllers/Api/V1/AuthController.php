<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $login = $request->input('login');

        $user = User::where('email', $login)
            ->orWhere('phone', $login)
            ->orWhere('username', $login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_approved && !$user->isAdmin()) {
            throw ValidationException::withMessages([
                'login' => ['Your account is not approved yet.'],
            ]);
        }

        $token = $user->createToken('spa-token', [$user->role?->slug ?? 'user'])->plainTextToken;

        return response()->json([
            'data'  => new UserResource($user->load('role', 'dealer')),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()->load('role', 'dealer')),
        ]);
    }
}
