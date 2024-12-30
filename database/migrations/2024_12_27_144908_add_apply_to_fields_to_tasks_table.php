<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('apply_to_option')->nullable()->after('version_number');
            $table->text('selected_intake_ids')->nullable()->after('apply_to_option');
        });
    }

    public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('apply_to_option');
            $table->dropColumn('selected_intake_ids');
        });
    }
};
