<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('Admin', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable();
        });
        Schema::table('lecturers', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable();
        });
        Schema::table('students', function (Blueprint $table) {
            $table->timestamp('last_active_at')->nullable();
        });
    }
    
    public function down()
    {
        Schema::table('Admin', function (Blueprint $table) {
            $table->dropColumn('last_active_at');
        });
        Schema::table('lecturers', function (Blueprint $table) {
            $table->dropColumn('last_active_at');
        });
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('last_active_at');
        });
    }
};
