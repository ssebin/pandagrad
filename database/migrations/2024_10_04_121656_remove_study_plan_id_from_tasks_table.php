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
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['study_plan_id']);
            $table->dropColumn('study_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('study_plan_id');
            $table->foreign('study_plan_id')->references('id')->on('study_plans')->onDelete('cascade');
        });
    }
};
