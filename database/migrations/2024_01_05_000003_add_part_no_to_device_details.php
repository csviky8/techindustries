<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('device_details', function (Blueprint $table) {
            $table->string('part_no', 100)->nullable()->after('serial_no');
        });
    }

    public function down(): void
    {
        Schema::table('device_details', function (Blueprint $table) {
            $table->dropColumn('part_no');
        });
    }
};
