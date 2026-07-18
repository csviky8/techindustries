<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_details', function (Blueprint $table) {
            $table->id();
            $table->string('rto', 100)->nullable();
            $table->string('vehicle_reg_no', 100)->unique();
            $table->date('vehicle_reg_date')->nullable();
            $table->string('owner_name', 150)->nullable();
            $table->string('owner_mobile', 20)->nullable()->index();
            $table->string('vehicle_type', 100)->nullable();
            $table->string('chassis_no', 100)->nullable()->unique();
            $table->string('engine_no', 100)->nullable()->unique();
            $table->bigInteger('odometer')->nullable()->comment('Current vehicle odometer reading');
            $table->integer('panic_button_count')->default(0);
            $table->string('uin_number', 100)->nullable()->unique();
            $table->boolean('status')->default(true)->comment('1=Active, 0=Inactive')->index();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_details');
    }
};
