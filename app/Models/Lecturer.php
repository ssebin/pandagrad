<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Lecturer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'um_email',
        'status',
        'role',
        'profile_pic',
        'last_login_at',
        'last_active_at',
    ];

    // Lecturer supervising students (One-to-many relationship)
    public function students()
    {
        return $this->hasMany(Student::class, 'supervisor_id');
    }

    // Get all students under the lecturer’s supervision
    public function studentsUnderSupervision()
    {
        return $this->students()->get();
    }
}

