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
            $table->renameColumn('supervisor', 'supervisor_name');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('supervisor_name', 'supervisor');
        });
    }
};
