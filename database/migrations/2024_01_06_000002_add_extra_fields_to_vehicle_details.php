<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->string('uuid', 100)->nullable()->unique()->after('uin_number');
            $table->date('fitment_date')->nullable()->after('uuid');
            $table->text('owner_address')->nullable()->after('owner_mobile');
        });
    }

    public function down(): void
    {
        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->dropColumn(['uuid', 'fitment_date', 'owner_address']);
        });
    }
};
