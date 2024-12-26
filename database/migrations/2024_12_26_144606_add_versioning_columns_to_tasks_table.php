<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Add version_number column
            $table->integer('version_number')->default(1)->after('task_weight');

            // Add parent_task_id column for linking to the previous version
            $table->unsignedBigInteger('parent_task_id')->nullable()->after('version_number');
            $table->foreign('parent_task_id')->references('id')->on('tasks')->onDelete('set null');

            // Add updated_by column for tracking the admin who updated the task
            $table->unsignedBigInteger('updated_by')->nullable()->after('parent_task_id');
            $table->foreign('updated_by')->references('AdminID')->on('Admin')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Drop the foreign key constraints first
            $table->dropForeign(['parent_task_id']);
            $table->dropForeign(['updated_by']);

            // Drop the columns
            $table->dropColumn(['version_number', 'parent_task_id', 'updated_by']);
        });
    }
};
