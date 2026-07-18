<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rto_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('rtos', function (Blueprint $table) {
            $table->foreignId('zone_id')->nullable()->constrained('rto_zones')->nullOnDelete()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('rtos', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
            $table->dropColumn('zone_id');
        });
        Schema::dropIfExists('rto_zones');
    }
};
