<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('Admin')->insert([
            'Name' => 'Mrs. Test',
            'UMEmail' => 'test@um.edu.my',
            'Password' => Hash::make('password123'),
            'Status' => 'Active',
            'Remarks' => 'Super admin',
            'ProfilePic' => 'images/profile-pic.png',
        ]);
    }
}
