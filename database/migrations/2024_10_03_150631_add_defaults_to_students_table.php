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
            // Ensure status column default value is set
            $table->string('status')->default('Active')->change();

            // For the progress column, use a raw SQL query to cast it to an integer type
            DB::statement('ALTER TABLE students ALTER COLUMN progress TYPE INT USING progress::integer');

            // After the type change, set the default value
            $table->integer('progress')->default(0)->change();
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            // Optionally revert changes
            $table->string('status')->default(null)->change();

            // Change progress column back to the original type, if needed
            DB::statement('ALTER TABLE students ALTER COLUMN progress TYPE VARCHAR USING progress::varchar');
        });
    }
};
