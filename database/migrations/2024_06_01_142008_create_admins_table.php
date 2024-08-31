<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminsTable extends Migration
{
    public function up()
    {
        // Check if the table does not exist before creating it
        if (!Schema::hasTable('Admin')) {
            Schema::create('Admin', function (Blueprint $table) {
                $table->bigIncrements('AdminID');
                $table->string('Name');
                $table->string('UMEmail');
                $table->string('Password');
                $table->string('Status')->default('Active');
                $table->string('Remarks')->nullable();
                $table->string('ProfilePic')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('Admin');
    }
}
