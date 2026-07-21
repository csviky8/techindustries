<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

if (!function_exists('fitmentCorsHeaders')) {
    function fitmentCorsHeaders(Request $request): array
    {
        $origin = $request->headers->get('Origin');
        $allowed = array_values(array_unique(array_filter(array_merge(
            ['http://localhost:5173', 'http://localhost:3000', 'https://aura-industrial.vercel.app'],
            array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')))
        ))));

        if (!$origin || !in_array($origin, $allowed, true)) {
            return [];
        }

        return [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length, Content-Type',
            'Vary' => 'Origin',
        ];
    }
}

Route::get('/fitment-file', function (Request $request) {
    $path = (string) $request->query('path', '');

    abort_if(!$path || !Storage::disk('public')->exists($path), 404);

    $response = Storage::disk('public')->response($path);

    foreach (fitmentCorsHeaders($request) as $header => $value) {
        $response->headers->set($header, $value);
    }

    return $response;
});

Route::get('/{any}', fn() => view('app'))->where('any', '.*');
