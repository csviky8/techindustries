<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rtos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rtos');
    }
};
