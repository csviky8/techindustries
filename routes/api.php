<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\RtoController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public auth routes
    Route::post('login', [AuthController::class, 'login']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::get('menus', [MenuController::class, 'index']);
        // Projects — all authenticated users
        Route::apiResource('projects', ProjectController::class);

        // Admin-only routes
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('roles', RoleController::class);
            Route::apiResource('rtos', RtoController::class);
        });

        // Admin sees all staff, dealer sees only their own staff
        Route::get('installers', [UserController::class, 'installers']);
        Route::post('installers', [UserController::class, 'storeInstaller']);
        Route::put('installers/{user}', [UserController::class, 'updateInstaller']);
        Route::delete('installers/{user}', [UserController::class, 'destroyInstaller']);
        Route::get('dealers', [UserController::class, 'dealers']);
    });
});
