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
        Schema::create('task_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->string('version_number');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('task_weight');
            $table->unsignedBigInteger('updated_by')->nullable(); // Use unsignedBigInteger

            // Modify the foreign key to reference AdminID
            $table->foreign('updated_by')->references('AdminID')->on('Admin')->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_versions');
    }
};
