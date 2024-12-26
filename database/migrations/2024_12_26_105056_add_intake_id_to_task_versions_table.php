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
        Schema::table('task_versions', function (Blueprint $table) {
            $table->foreignId('intake_id')->nullable()->constrained('intakes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('task_versions', function (Blueprint $table) {
            $table->dropForeign(['intake_id']);
            $table->dropColumn('intake_id');
        });
    }
};
