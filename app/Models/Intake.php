<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Intake extends Model
{
    use HasFactory;
    protected $fillable = ['intake_semester', 'intake_year', 'program_id'];
    public $timestamps = true;


    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
