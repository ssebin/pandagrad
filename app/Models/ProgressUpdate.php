<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressUpdate extends Model
{
    use HasFactory;
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'update_type',
        'status',
        'evidence',
        'link',
        'description',
        'completion_date',
        'workshop_name',
        'cgpa',
        'grade',
        'num_courses',
        'course_name_1',
        'course_name_2',
        'course_name_3',
        'course_name_4',
        'course_name_5',
        'grade_1',
        'grade_2',
        'grade_3',
        'grade_4',
        'grade_5',
        'supervisor_name',
        'research_topic',
        'progress_status',
        'task_id',
        'updated_study_plan',
        'updated_at',
        'max_sem',
        'residential_college',
        'start_date',
        'end_date',
        'admin_name',
        'original_file_name',
        'approved',
        'reason',
        'panels',
        'chairperson',
        'pd_date',
        'pd_time',
        'pd_venue',
        'cd_date',
        'cd_time',
        'cd_venue',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}
