<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyPlan extends Model
{
    protected $fillable = ['semesters_no', 'semesters'];

    protected $casts = [
        'semesters' => 'array', // Cast the JSON to an array
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'study_plan_task', 'study_plan_id', 'task_id');
    }
}
