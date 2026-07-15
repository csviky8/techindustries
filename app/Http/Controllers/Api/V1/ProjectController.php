<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Project::with('owner');

        if (!$request->user()->isAdmin()) {
            $query->where('owner_id', $request->user()->id);
        }

        return ProjectResource::collection($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:active,on_hold,completed,archived',
            'due_date' => 'nullable|date',
        ]);

        $project = $request->user()->projects()->create($data);

        return response()->json(['data' => new ProjectResource($project->load('owner'))], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorizeAccess($request, $project);

        return response()->json(['data' => new ProjectResource($project->load('owner'))]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorizeAccess($request, $project);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,on_hold,completed,archived',
            'due_date' => 'nullable|date',
        ]);

        $project->update($data);

        return response()->json(['data' => new ProjectResource($project->load('owner'))]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorizeAccess($request, $project);
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    private function authorizeAccess(Request $request, Project $project): void
    {
        if (!$request->user()->isAdmin() && $project->owner_id !== $request->user()->id) {
            abort(403, 'Forbidden.');
        }
    }
}
