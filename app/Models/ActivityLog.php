<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'module', 'action', 'description', 'meta', 'ip'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $module, string $action, string $description, array $meta = []): void
    {
        $user = auth('sanctum')->user();
        static::create([
            'user_id'     => $user?->id,
            'module'      => $module,
            'action'      => $action,
            'description' => $description,
            'meta'        => $meta ?: null,
            'ip'          => request()->ip(),
        ]);
    }
}
