<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->string('otp');
            $table->timestamp('expires_at');
            $table->timestamps();

            // Index for faster queries
            $table->index(['phone_number', 'otp']);
        });

        // Add verified column to users if not exists
        if (!Schema::hasColumn('users', 'phone_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('phone_verified_at')->nullable()->after('status');
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('verification_codes');
        
        if (Schema::hasColumn('users', 'phone_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('phone_verified_at');
            });
        }
    }
};
