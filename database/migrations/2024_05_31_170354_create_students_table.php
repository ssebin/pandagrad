<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('siswamail');
            $table->string('supervisor');
            $table->string('status');
            $table->string('intake');
            $table->integer('semester');
            $table->string('program');
            $table->text('research');
            $table->string('task');
            $table->string('profile_pic');
            $table->integer('progress');
            $table->string('track_status');
            $table->decimal('cgpa', 3, 2);
            $table->string('matric_number');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('students');
    }
}
