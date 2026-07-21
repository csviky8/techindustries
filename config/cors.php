<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'fitment-file'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        ['http://localhost:5173', 'http://localhost:3000', 'https://aura-industrial.vercel.app'],
        array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')))
    )))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
