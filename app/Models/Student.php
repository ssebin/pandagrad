<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'siswamail',
        'supervisor',
        'status',
        'intake',
        'semester',
        'program',
        'research',
        'task',
        'profile_pic',
        'progress',
        'track_status',
        'cgpa',
        'matric_number',
        'remarks',
    ];
}