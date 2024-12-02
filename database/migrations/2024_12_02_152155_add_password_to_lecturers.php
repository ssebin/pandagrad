<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Import DB facade
use Illuminate\Support\Facades\Hash; // Import Hash facade

class AddPasswordToLecturers extends Migration
{
    public function up()
    {
        DB::table('lecturers')
            ->where('id', 2)
            ->update(['password' => Hash::make('password123')]);

        DB::table('lecturers')
            ->where('id', 3)
            ->update(['password' => Hash::make('password123')]);
    }

    public function down()
    {
        DB::table('lecturers')
            ->where('id', 2)
            ->update(['password' => null]);

        DB::table('lecturers')
            ->where('id', 3)
            ->update(['password' => null]);
    }
}
