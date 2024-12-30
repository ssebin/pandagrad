<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
            $table->string('supervisor')->nullable()->change();
            $table->string('status')->nullable()->change();
            $table->string('intake')->nullable()->change();
            $table->string('semester')->nullable()->change();
            $table->string('program')->nullable()->change();
            $table->string('research')->nullable()->change();
            $table->string('task')->nullable()->change();
            $table->string('profile_pic')->nullable()->change();
            $table->string('progress')->nullable()->change();
            $table->string('track_status')->nullable()->change();
            $table->string('cgpa')->nullable()->change();
            $table->string('matric_number')->nullable()->change();
            $table->string('remarks')->nullable()->change();
            $table->integer('supervisor_id')->nullable()->change();
            $table->boolean('has_study_plan')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->string('nationality')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            //
        });
    }
};
