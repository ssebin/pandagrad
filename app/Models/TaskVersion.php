<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskVersion extends Model
{
    use HasFactory;
    protected $fillable = ['task_id', 'version_number', 'name', 'description', 'task_weight', 'updated_by', 'intake_id', 'category'];
    public $timestamps = true;

    public function intake()
    {
        return $this->belongsTo(Intake::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'updated_by', 'AdminID');
    }
}
