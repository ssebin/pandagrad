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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('study_plan_id'); // Foreign key to study_plans
            $table->string('name'); // Task name
            $table->timestamps();

            // Define foreign key constraint
            $table->foreign('study_plan_id')
                ->references('id')->on('study_plans')
                ->onDelete('cascade'); // Delete tasks if study plan is deleted
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tasks');
    }
};
