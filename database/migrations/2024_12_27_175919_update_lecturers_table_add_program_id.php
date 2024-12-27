<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('lecturers', function (Blueprint $table) {
            $table->unsignedBigInteger('program_id')->nullable()->after('id');
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('set null');
            $table->dropColumn('program');
        });
    }

    public function down()
    {
        Schema::table('lecturers', function (Blueprint $table) {
            $table->string('program')->nullable()->after('id');
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
        });
    }
};
