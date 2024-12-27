<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->unsignedBigInteger('program_id')->nullable()->after('id');
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('set null');

            $table->unsignedBigInteger('intake_id')->nullable()->after('program_id');
            $table->foreign('intake_id')->references('id')->on('intakes')->onDelete('set null');

            $table->dropColumn('program');
            $table->dropColumn('intake');
        }); 
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('program')->nullable()->after('id');
            $table->string('intake')->nullable()->after('program_id');

            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');

            $table->dropForeign(['intake_id']);
            $table->dropColumn('intake_id');
        });
    }
};
