<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_details', function (Blueprint $table) {
            $table->id();
            $table->string('imei', 50)->unique();
            $table->string('iccid_1', 50)->nullable();
            $table->string('iccid_2', 50)->nullable();
            $table->string('sim_1', 50)->nullable();
            $table->string('sim_2', 50)->nullable();
            $table->string('serial_no', 100)->nullable();
            $table->string('manufacturer', 150)->nullable();
            $table->string('esim_provider', 150)->nullable();
            $table->string('device_model', 150)->nullable();
            $table->string('uuid', 100)->nullable();
            $table->enum('new_vehicle', ['Yes', 'No'])->default('No');
            $table->boolean('status')->default(true)->comment('1=Active, 0=Inactive');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_details');
    }
};
