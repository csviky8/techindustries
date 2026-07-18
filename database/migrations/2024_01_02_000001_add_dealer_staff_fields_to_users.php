<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique();
            $table->string('phone')->nullable()->unique();
            $table->string('state')->nullable();
            $table->string('district')->nullable();
            $table->string('dealer_name')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->foreignId('dealer_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['dealer_id']);
            $table->dropColumn(['username', 'phone', 'state', 'district', 'dealer_name', 'is_approved', 'dealer_id']);
        });
    }
};
