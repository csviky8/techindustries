<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gps_device_details', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('vehicle_id')->constrained('vehicle_details')->cascadeOnDelete();
            $table->foreignId('device_id')->constrained('device_details')->cascadeOnDelete();
            $table->unsignedBigInteger('dealer_id')->comment('users.id (Dealer Role)');
            $table->foreign('dealer_id')->references('id')->on('users')->restrictOnDelete();

            // Certificate Details
            $table->date('temp_certificate_date')->nullable();
            $table->date('vahan_certificate_date')->nullable();

            // Images / Documents
            $table->string('temp_certificate_file')->nullable();
            $table->string('vahan_certificate_file')->nullable();
            $table->string('rc_book_file')->nullable();
            $table->string('device_fitment_file')->nullable();
            $table->string('vehicle_image')->nullable();

            // SIM Details
            $table->string('sim_plan', 150)->nullable();
            $table->date('sim_validity')->nullable();

            // Installation Details
            $table->date('fitted_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('technician_mobile', 20)->nullable();

            // Device Details
            $table->string('uin_number', 100)->nullable();
            $table->integer('panic_button_count')->default(0);

            // Approval
            $table->text('approval_notes')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable()->comment('users.id');
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->enum('approved_status', ['Pending', 'Approved', 'Rejected'])->default('Pending');

            // General
            $table->text('remarks')->nullable();
            $table->boolean('status')->default(true)->comment('1=Active, 0=Inactive')->index();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gps_device_details');
    }
};
