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
        Schema::table('progress_updates', function (Blueprint $table) {
            $table->string('original_file_name')->nullable(); // Add original file name column
        });
    }

    public function down()
    {
        Schema::table('progress_updates', function (Blueprint $table) {
            $table->dropColumn('original_file_name'); // Rollback column
        });
    }
};
