<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = User::with('role', 'dealer');

        if ($user->isDealer()) {
            $query->where('dealer_id', $user->id);
        } elseif ($user->isStaff()) {
            $query->where('id', $user->id);
        }

        if ($request->filled('role')) {
            $query->whereHas('role', fn($q) => $q->where('slug', $request->role));
        }

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(fn($q) => $q
                ->where('name', 'like', $s)
                ->orWhere('email', 'like', $s)
                ->orWhere('username', 'like', $s)
                ->orWhere('phone', 'like', $s)
                ->orWhere('state', 'like', $s)
                ->orWhere('district', 'like', $s)
                ->orWhere('dealer_name', 'like', $s)
            );
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return UserResource::collection($query->latest()->paginate($perPage));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'nullable|email|unique:users',
            'username'    => 'nullable|string|unique:users',
            'phone'       => 'nullable|string|unique:users',
            'password'    => 'required|string|min:8',
            'role_id'     => 'required|exists:roles,id',
            'dealer_id'   => 'nullable|exists:users,id',
            'state'       => 'nullable|string',
            'district'    => 'nullable|string',
            'address'     => 'nullable|string',
            'dealer_name' => 'nullable|string',
            'is_approved' => 'boolean',
        ]);

        $user = User::create($data);
        ActivityLog::record('Users', 'create', "Created user: {$user->name}", ['id' => $user->id]);
        return response()->json(['data' => new UserResource($user->load('role', 'dealer'))], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:users,email,' . $user->id,
            'username'    => 'sometimes|string|unique:users,username,' . $user->id,
            'phone'       => 'sometimes|string|unique:users,phone,' . $user->id,
            'role_id'     => 'sometimes|exists:roles,id',
            'dealer_id'   => 'nullable|exists:users,id',
            'state'       => 'nullable|string',
            'district'    => 'nullable|string',
            'address'     => 'nullable|string',
            'dealer_name' => 'nullable|string',
            'is_approved' => 'boolean',
            'password'    => 'sometimes|string|min:8',
        ]);

        $user->update($data);
        ActivityLog::record('Users', 'update', "Updated user: {$user->name}", ['id' => $user->id]);
        return response()->json(['data' => new UserResource($user->load('role', 'dealer'))]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        ActivityLog::record('Users', 'delete', "Deleted user: {$user->name}", ['id' => $user->id]);
        return response()->json(['message' => 'User deleted.']);
    }

    public function dealers(Request $request): AnonymousResourceCollection
    {
        $dealers = User::with('role')
            ->whereHas('role', fn($q) => $q->where('slug', 'dealer'))
            ->orderBy('name')
            ->get();

        return UserResource::collection($dealers);
    }

    // ── Installer-scoped methods (admin + dealer) ──

    private function installerQuery(Request $request)
    {
        $auth = $request->user();
        $query = User::with('role')->whereHas('role', fn($q) => $q->where('slug', 'staff'));

        if ($auth->isDealer()) {
            $query->where('dealer_id', $auth->id);
        }

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(fn($q) => $q
                ->where('name', 'like', $s)
                ->orWhere('phone', 'like', $s)
                ->orWhere('email', 'like', $s)
                ->orWhere('state', 'like', $s)
                ->orWhere('district', 'like', $s)
            );
        }

        if ($request->filled('status')) {
            $query->where('is_approved', $request->status === 'active');
        }

        return $query;
    }

    public function installers(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->get('per_page', 15), 100);
        return UserResource::collection($this->installerQuery($request)->latest()->paginate($perPage));
    }

    public function storeInstaller(Request $request): JsonResponse
    {
        $auth = $request->user();

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'required|string|unique:users',
            'email'       => 'nullable|email|unique:users',
            'state'       => 'nullable|string',
            'district'    => 'nullable|string',
            'address'     => 'nullable|string',
            'is_approved' => 'boolean',
            'password'    => 'required|string|min:8',
        ]);

        $staffRole = \App\Models\Role::where('slug', 'staff')->firstOrFail();
        $data['role_id']     = $staffRole->id;
        $data['dealer_id']   = $auth->isDealer() ? $auth->id : ($request->dealer_id ?? null);
        $data['dealer_name'] = $auth->isDealer() ? ($auth->dealer_name ?? $auth->name) : $request->dealer_name;

        $user = User::create($data);
        ActivityLog::record('Installers', 'create', "Created installer: {$user->name}", ['id' => $user->id]);
        return response()->json(['data' => new UserResource($user->load('role'))], 201);
    }

    public function updateInstaller(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();

        if ($auth->isDealer() && $user->dealer_id !== $auth->id) {
            abort(403);
        }

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'phone'       => 'sometimes|string|unique:users,phone,' . $user->id,
            'email'       => 'nullable|email|unique:users,email,' . $user->id,
            'state'       => 'nullable|string',
            'district'    => 'nullable|string',
            'address'     => 'nullable|string',
            'is_approved' => 'boolean',
            'password'    => 'sometimes|string|min:8',
        ]);

        $user->update($data);
        ActivityLog::record('Installers', 'update', "Updated installer: {$user->name}", ['id' => $user->id]);
        return response()->json(['data' => new UserResource($user->load('role'))]);
    }

    public function destroyInstaller(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();

        if ($auth->isDealer() && $user->dealer_id !== $auth->id) {
            abort(403);
        }

        $user->delete();
        ActivityLog::record('Installers', 'delete', "Deleted installer: {$user->name}", ['id' => $user->id]);
        return response()->json(['message' => 'Installer deleted.']);
    }
}
