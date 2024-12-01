<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'siswamail',
        'supervisor',   //
        'status',       //
        'intake',       
        'semester',     //
        'program',
        'research',     //
        'task',         //
        'profile_pic',  
        'progress',     //
        'track_status', //
        'cgpa',         //
        'matric_number',
        'remarks',      //
        'supervisor_id',//
        'has_study_plan',
        'nationality',
        'password',
        'workshops_attended',
        'max_sem',
    ];

    public function studyPlan()
    {
        return $this->hasOne(StudyPlan::class);
    }

    // Defining the relationship with Lecturer (Supervisor)
    public function supervisor()
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_id');
    }

    // Method to return the supervisor name for display
    public function getSupervisorNameAttribute()
    {
        return $this->supervisor;
    }
}
