<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

Route::get('/fitment-file', function (Request $request) {
    $path = (string) $request->query('path', '');

    abort_if(!$path || !Storage::disk('public')->exists($path), 404);

    return Storage::disk('public')->response($path);
});

Route::get('/{any}', fn() => view('app'))->where('any', '.*');
