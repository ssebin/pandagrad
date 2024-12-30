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
            $table->json('rollback_data')->nullable()->after('reason'); // Add rollback_data column
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('progress_updates', function (Blueprint $table) {
            //
        });
    }
};
