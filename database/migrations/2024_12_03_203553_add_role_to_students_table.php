<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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
            $table->string('role')->default('student')->after('id'); // Add a default value
        });

        // Update existing records with the default value
        DB::table('students')->whereNull('role')->update(['role' => 'student']);
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
