<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role_id', 'created_at'], 'users_role_created_at_idx');
            $table->index(['dealer_id', 'created_at'], 'users_dealer_created_at_idx');
            $table->index(['is_approved', 'created_at'], 'users_status_created_at_idx');
        });

        Schema::table('device_details', function (Blueprint $table) {
            $table->index(['serial_no'], 'device_details_serial_no_idx');
            $table->index(['device_model'], 'device_details_device_model_idx');
            $table->index(['manufacturer'], 'device_details_manufacturer_idx');
            $table->index(['status', 'created_at'], 'device_details_status_created_at_idx');
        });

        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->index(['rto_id', 'created_at'], 'vehicle_details_rto_created_at_idx');
            $table->index(['zone_id', 'created_at'], 'vehicle_details_zone_created_at_idx');
            $table->index(['status', 'created_at'], 'vehicle_details_status_created_at_idx');
        });

        Schema::table('gps_device_details', function (Blueprint $table) {
            $table->index(['dealer_id', 'created_at'], 'gps_device_details_dealer_created_at_idx');
            $table->index(['approved_status', 'created_at'], 'gps_device_details_approved_created_at_idx');
            $table->index(['fitted_date'], 'gps_device_details_fitted_date_idx');
            $table->index(['status', 'created_at'], 'gps_device_details_status_created_at_idx');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['module', 'created_at'], 'activity_logs_module_created_at_idx');
            $table->index(['action', 'created_at'], 'activity_logs_action_created_at_idx');
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->index(['parent_id', 'is_active', 'order'], 'menus_parent_active_order_idx');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropIndex('menus_parent_active_order_idx');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('activity_logs_module_created_at_idx');
            $table->dropIndex('activity_logs_action_created_at_idx');
        });

        Schema::table('gps_device_details', function (Blueprint $table) {
            $table->dropIndex('gps_device_details_dealer_created_at_idx');
            $table->dropIndex('gps_device_details_approved_created_at_idx');
            $table->dropIndex('gps_device_details_fitted_date_idx');
            $table->dropIndex('gps_device_details_status_created_at_idx');
        });

        Schema::table('vehicle_details', function (Blueprint $table) {
            $table->dropIndex('vehicle_details_rto_created_at_idx');
            $table->dropIndex('vehicle_details_zone_created_at_idx');
            $table->dropIndex('vehicle_details_status_created_at_idx');
        });

        Schema::table('device_details', function (Blueprint $table) {
            $table->dropIndex('device_details_serial_no_idx');
            $table->dropIndex('device_details_device_model_idx');
            $table->dropIndex('device_details_manufacturer_idx');
            $table->dropIndex('device_details_status_created_at_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_created_at_idx');
            $table->dropIndex('users_dealer_created_at_idx');
            $table->dropIndex('users_status_created_at_idx');
        });
    }
};
