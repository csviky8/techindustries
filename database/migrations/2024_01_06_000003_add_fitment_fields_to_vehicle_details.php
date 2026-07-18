<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->foreignId('device_id')->nullable()->constrained('device_details')->nullOnDelete()->after('id');
            $table->foreignId('zone_id')->nullable()->constrained('rto_zones')->nullOnDelete()->after('rto');
            $table->foreignId('rto_id')->nullable()->constrained('rtos')->nullOnDelete()->after('zone_id');
            $table->enum('department', ['Motor Vehicles Department', 'Mining Department'])->nullable()->after('rto_id');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->dropForeign(['device_id']);
            $table->dropForeign(['zone_id']);
            $table->dropForeign(['rto_id']);
            $table->dropColumn(['device_id', 'zone_id', 'rto_id', 'department']);
        });
    }
};
