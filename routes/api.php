<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DeviceSettingsController;
use App\Http\Controllers\Api\V1\FitmentController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\RtoController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public auth routes
    Route::post('login', [AuthController::class, 'login']);
    Route::get('settings/devices/template', [DeviceSettingsController::class, 'template']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::get('menus', [MenuController::class, 'index']);
        Route::get('settings/devices', [DeviceSettingsController::class, 'index']);
        Route::post('settings/devices', [DeviceSettingsController::class, 'store']);
        // Projects — all authenticated users
        Route::apiResource('projects', ProjectController::class);

        // Fitment (all authenticated)
        Route::get('fitment/search', [FitmentController::class, 'searchDevice']);
        Route::post('fitment', [FitmentController::class, 'store']);
        Route::get('fitment/slip/{vehicle}', [FitmentController::class, 'slip']);
        Route::get('fitment/fitted-list', [FitmentController::class, 'fittedList']);
        Route::post('fitment/{gps}/temp-cert', [FitmentController::class, 'uploadTempCert']);
        Route::post('fitment/{gps}/rto-approve', [FitmentController::class, 'rtoApprove']);
        Route::post('fitment/{gps}/upload-doc', [FitmentController::class, 'uploadDoc']);
        Route::post('fitment/{gps}/update', [FitmentController::class, 'updateFitment']);
        Route::get('rtos/zones', [RtoController::class, 'zones']);

        // Admin-only routes
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('roles', RoleController::class);
            Route::apiResource('rtos', RtoController::class);
            Route::get('activity-logs', [ActivityLogController::class, 'index']);
            Route::post('settings/devices/import', [DeviceSettingsController::class, 'import']);
        });

        // Admin sees all staff, dealer sees only their own staff
        Route::get('installers', [UserController::class, 'installers']);
        Route::post('installers', [UserController::class, 'storeInstaller']);
        Route::put('installers/{user}', [UserController::class, 'updateInstaller']);
        Route::delete('installers/{user}', [UserController::class, 'destroyInstaller']);
        Route::get('dealers', [UserController::class, 'dealers']);
    });
});
